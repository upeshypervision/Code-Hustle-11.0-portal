# backend/user_access.py
from flask import request, jsonify
import jwt
from database import get_db
from config import JWT_SECRET, JWT_ALGORITHM

# --- Module-level database connection ---
db = get_db()
# --- End Module-level database connection ---

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
    # 1. Verify Admin Authentication
    token = request.cookies.get('admin_auth')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    # 2. Fetch Teams from DB
    try:
        # Sort by _id descending (Last In, First Out) which effectively sorts by creation time
        teams_cursor = db["teams"].find({}, {"_id": 0, "password_hashed": 0}).sort("_id", -1)
        teams = list(teams_cursor)

        return jsonify({
            "success": True,
            "teams": teams,
            "count": len(teams)
        }), 200

    except Exception as e:
        print(f"Error fetching teams: {str(e)}")
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

    data = request.json or {}
    ps_id = data.get('ps_id') # Expecting the PS ID from the frontend request

    if not ps_id:
        return jsonify({"success": False, "error": "Problem Statement ID required."}), 400

    # --- CRITICAL CHECK: Ensure team hasn't already submitted ---
    # This prevents selection after submission, which is logical
    submission_exists = db.submissions.find_one({"team_id": team_id})
    if submission_exists:
        return jsonify({"success": False, "error": "Cannot select Problem Statement after submission."}), 400

    # --- CRITICAL CHECK: Ensure team hasn't already selected a PS ---
    team_doc = db.teams.find_one({"team_id": team_id})
    if not team_doc:
        return jsonify({"success": False, "error": "Team not found."}), 404

    if team_doc.get('selected_ps_id'): # Check if 'selected_ps_id' field already exists and is set
        return jsonify({"success": False, "error": "Problem Statement already selected and locked."}), 400

    # --- UPDATE DATABASE: Lock the selection ---
    result = db.teams.update_one(
        {"team_id": team_id}, # Find the team
        {"$set": {"selected_ps_id": ps_id}} # Set the selected_ps_id field
    )

    if result.modified_count > 0:
        return jsonify({"success": True, "message": "Problem Statement selected and locked successfully."})
    else:
        # This could happen if the team_id doesn't exist or if the update didn't match anything due to race conditions
        return jsonify({"success": False, "error": "Failed to update team record. PS might already be selected."}), 500


def fetch_teams_pending_submission_route():
    """
    Admin-only route to fetch teams that have NOT yet submitted.
    Uses the 'submissions' collection as the source of truth.
    """
    admin_cookie = request.cookies.get('admin_auth')
    if not admin_cookie:
        return jsonify({"error": "Admin authentication required"}), 401

    try:
        payload = jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        # --- CRITICAL CHECK: Verify admin role ---
        if payload.get("role") != "admin":
            return jsonify({"error": "Forbidden"}), 403
        # --- END CRITICAL CHECK ---
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid session"}), 401

    try:
        # 1. Get all team_ids that have submitted
        submitted_team_ids = [
            doc["team_id"]
            for doc in db.submissions.find({}, {"team_id": 1, "_id": 0})
        ]

        # 2. Get all teams that are NOT in the submitted list
        # Use $nin operator for efficient filtering in MongoDB
        pending_teams = list(
            db["teams"].find(
                {"team_id": {"$nin": submitted_team_ids}},
                {"_id": 0, "team_id": 1, "team_name": 1} # Project only safe fields
            ).sort("team_id", 1) # Sort by team_id for consistency
        )

        return jsonify({"success": True, "teams": pending_teams}), 200
    except Exception as e:
        print(f"Error fetching pending teams: {e}")
        return jsonify({"error": "Failed to fetch pending teams"}), 500


def fetch_submissions_route():
    """
    Admin-only route to fetch all submissions with team details.
    Excludes the MongoDB _id field from the response.
    """
    admin_cookie = request.cookies.get('admin_auth')
    if not admin_cookie:
        return jsonify({"error": "Admin authentication required"}), 401

    try:
        payload = jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        # --- CRITICAL CHECK: Verify admin role ---
        if payload.get("role") != "admin":
            return jsonify({"error": "Forbidden"}), 403
        # --- END CRITICAL CHECK ---
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid session"}), 401

    try:
        # Fetch all submissions, explicitly excluding the MongoDB _id field
        # and only including the fields we want to send to the frontend
        submissions_cursor = db["submissions"].find(
            {},
            {
                "_id": 0, # Exclude MongoDB _id
                "team_id": 1,
                "team_name": 1,
                "file_name": 1,
                "file_path": 1,
                "submitted_at": 1
            }
        ).sort("submitted_at", -1) # Sort by submitted_at descending (newest first)

        submissions_list = list(submissions_cursor)

        return jsonify({"success": True, "submissions": submissions_list}), 200
    except Exception as e:
        print(f"Error fetching submissions: {e}")
        return jsonify({"error": "Failed to fetch submissions"}), 500