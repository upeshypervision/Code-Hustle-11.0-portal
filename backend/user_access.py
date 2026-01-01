# backend/user_access.py

from flask import request, jsonify
import jwt
from database import get_db
from config import JWT_SECRET, JWT_ALGORITHM

db = get_db()


def get_user_info_route():
    """
    Endpoint to get current user information.
    Returns team_name, selected_ps_id for students or login_id for admins.
    """
    student_token = request.cookies.get('student_auth')
    admin_token = request.cookies.get('admin_auth')

    # ---- STUDENT FLOW ----
    if student_token:
        try:
            payload = jwt.decode(student_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            team_id = payload.get("team_id")

            if not team_id:
                return jsonify({"error": "Invalid session"}), 401

            team = db["teams"].find_one({"team_id": team_id})
            if not team:
                return jsonify({"error": "Team not found"}), 404

            # Return team info including selected_ps_id
            return jsonify({
                "success": True,
                "role": "student",
                "team_id": team_id,
                "team_name": team.get("team_name", "Unknown Team"),
                "selected_ps_id": team.get("selected_ps_id") # Include selected PS ID
            }), 200

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

    # ---- ADMIN FLOW ----
    if admin_token:
        try:
            payload = jwt.decode(admin_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            login_id = payload.get("login_id")

            if not login_id:
                return jsonify({"error": "Invalid session"}), 401

            return jsonify({
                "success": True,
                "role": "admin",
                "login_id": login_id
            }), 200

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

    return jsonify({"error": "Not authenticated"}), 401


def fetch_teams_route():
    """
    Secure admin-only route to fetch all registered teams.
    Excludes sensitive fields like hashed passwords.
    """
    token = request.cookies.get('admin_auth')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    try:
        teams_cursor = (
            db["teams"]
            .find({}, {"_id": 0, "password_hashed": 0})
            .sort("_id", -1)
        )
        teams = list(teams_cursor)

        return jsonify({
            "success": True,
            "teams": teams,
            "count": len(teams)
        }), 200

    except Exception as e:
        print(f"[fetch_teams_route ERROR]: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


def check_submission_status_route():
    """
    Checks if the logged-in team has already submitted a file.
    Requires student authentication via JWT cookie.
    """
    student_cookie = request.cookies.get('student_auth')
    if not student_cookie:
        return jsonify({"error": "Authentication required"}), 401

    try:
        payload = jwt.decode(student_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        team_id = payload.get('team_id')

        if not team_id:
            return jsonify({"error": "Invalid session"}), 401

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    submission_exists = db["submissions"].find_one({"team_id": team_id})

    return jsonify({
        "submitted": submission_exists is not None
    }), 200

def select_problem_statement_route(): # NEW: Allow team to select a problem statement
    """
    Allows a logged-in team to select a problem statement.
    Requires student authentication.
    Updates the team's record in the database to lock the selection.
    """
    student_cookie = request.cookies.get('student_auth')
    if not student_cookie:
        return jsonify({"success": False, "error": "Authentication required."}), 401

    try:
        payload = jwt.decode(student_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        team_id = payload.get('team_id')
        if not team_id:
            return jsonify({"success": False, "error": "Invalid session."}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "error": "Session expired."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "error": "Invalid session."}), 401

    data = request.json or {} # Get JSON data from request
    ps_id = data.get('ps_id') # Expecting the PS ID from the frontend request

    print(f"[DEBUG] Select PS Request - Team: {team_id}, PS ID: {ps_id}") # Log incoming data

    if not ps_id:
        print(f"[DEBUG] Missing ps_id in request for team {team_id}") # Log error reason
        return jsonify({"success": False, "error": "Problem Statement ID required."}), 400

    # --- CRITICAL CHECK: Ensure team hasn't already submitted ---
    # This prevents selection after submission, which is logical
    submission_exists = db.submissions.find_one({"team_id": team_id})
    if submission_exists:
        print(f"[DEBUG] Submission already exists for team {team_id}") # Log error reason
        return jsonify({"success": False, "error": "Cannot select Problem Statement after submission."}), 400

    # --- CRITICAL CHECK: Ensure team hasn't already selected a PS ---
    team_doc = db.teams.find_one({"team_id": team_id})
    if not team_doc:
        print(f"[DEBUG] Team not found in DB: {team_id}") # Log error reason
        return jsonify({"success": False, "error": "Team not found."}), 404

    if team_doc.get('selected_ps_id'): # Check if 'selected_ps_id' field already exists and is set
        print(f"[DEBUG] PS already selected for team {team_id}: {team_doc.get('selected_ps_id')}") # Log error reason
        return jsonify({"success": False, "error": "Problem Statement already selected and locked."}), 400

    # --- UPDATE DATABASE: Lock the selection ---
    result = db.teams.update_one(
        {"team_id": team_id}, # Find the team
        {"$set": {"selected_ps_id": ps_id}} # Set the selected_ps_id field
    )

    if result.modified_count > 0:
        print(f"[DEBUG] PS {ps_id} successfully selected and locked for team {team_id}") # Log success
        return jsonify({"success": True, "message": "Problem Statement selected and locked successfully."})
    else:
        # This could happen if the team_id doesn't exist or if the update didn't match anything due to race conditions
        print(f"[DEBUG] Failed to update team record for {team_id}, PS {ps_id}") # Log potential issue
        return jsonify({"success": False, "error": "Failed to update team record. PS might already be selected."}), 500
