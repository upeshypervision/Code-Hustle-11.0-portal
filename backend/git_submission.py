from flask import request, jsonify
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from database import get_db
from datetime import datetime
from socketio_instance import socketio


def submit_link_route():
    """
    Unified route for GitHub link submission (student or admin)
    Student: Authenticated via student_auth cookie, team_id from JWT
    Admin: Authenticated via admin_auth cookie, team_id from request body
    """
    db = get_db()
    
    student_cookie = request.cookies.get("student_auth")
    admin_cookie = request.cookies.get("admin_auth")
    
    team_id = None
    submitted_via = "student"
    
    # ---------- AUTHENTICATION ----------
    if admin_cookie:
        # Admin flow
        try:
            jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            
            data = request.get_json()
            if not data or "team_id" not in data:
                return jsonify({"success": False, "error": "team_id required for admin submission."}), 400
            
            team_id = data.get("team_id")
            submitted_via = "admin"
            
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "error": "Admin session expired."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "error": "Invalid admin session."}), 401
    
    elif student_cookie:
        # Student flow
        try:
            payload = jwt.decode(student_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            team_id = payload.get("team_id")
            
            if not team_id:
                return jsonify({"success": False, "error": "Invalid session."}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "error": "Session expired."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "error": "Invalid session."}), 401
    
    else:
        return jsonify({"success": False, "error": "Authentication required."}), 401
    
    # Check if GitHub submission round is active (only for students)
    if submitted_via == "student":
        round_status = db.counters.find_one({"_id": "round_status"})
        if round_status and round_status.get("github_submission") != "live":
            return jsonify({
                "success": False,
                "error": "Sorry, the submission cannot be made as the GitHub submission round is not currently active. Please wait for the organizing committee to activate this round."
            }), 403
        
        # =========================
        # CHECK ROUND 1 APPROVAL (Hackerrank)
        # =========================
        hackerrank_sub = db.Hackerrank_submission.find_one({"team_id": team_id})
        if not hackerrank_sub or hackerrank_sub.get("approval_status") != "approved":
            return jsonify({
                "success": False,
                "error": "Sorry, you are not allowed in this round. You must be approved in Round 1 (Hackerrank) to submit GitHub link."
            }), 403
        
        # =========================
        # CHECK ROUND 2 APPROVAL (PPT)
        # =========================
        ppt_sub = db.ppt_submissions.find_one({"team_id": team_id})
        if not ppt_sub or ppt_sub.get("approval_status") != "approved":
            return jsonify({
                "success": False,
                "error": "Sorry, you are not allowed in this round. You must be approved in Round 2 (PPT Submission) to submit GitHub link."
            }), 403
    
    # ---------- GET DATA ----------
    data = request.get_json()
    if not data or "github_link" not in data:
        return jsonify({"success": False, "error": "GitHub link is required."}), 400
    
    github_link = data.get("github_link")
    live_link = data.get("live_link")  # Optional
    
    # ---------- VALIDATION ----------
    if not isinstance(github_link, str) or not github_link.startswith("http"):
        return jsonify({"success": False, "error": "Invalid GitHub link format."}), 400
    
    if live_link and (not isinstance(live_link, str) or not live_link.startswith("http")):
        return jsonify({"success": False, "error": "Invalid live hosted link format."}), 400
    
    # ---------- CHECK TEAM EXISTS ----------
    team = db.teams.find_one({"team_id": team_id})
    if not team:
        return jsonify({"success": False, "error": "Team not found."}), 404
    
    # ---------- PREVENT DUPLICATE SUBMISSION ----------
    existing = db.github_submissions.find_one({"team_id": team_id})
    if existing:
        return jsonify({"success": False, "error": "Link already submitted for this team."}), 409
    
    # ---------- INSERT SUBMISSION ----------
    submission_data = {
        "team_id": team_id,
        "team_name": team.get("team_name"),
        "github_link": github_link,
        "live_link": live_link or None,
        "submitted_via": submitted_via,
        "submitted_at": datetime.utcnow().isoformat() + "Z",
        "approval_status": "pending"
    }
    
    result = db.github_submissions.insert_one(submission_data)
    
    if result.inserted_id:
        # Emit WebSocket event to notify all admins of new GitHub submission
        socketio.emit("github_submitted", {
            "team_id": team_id,
            "submitted_at": submission_data["submitted_at"]
        })
        
        return jsonify({
            "success": True,
            "message": f"Link submitted successfully by {submitted_via}.",
            "github_link": github_link,
            "live_link": live_link
        }), 200
    
    return jsonify({"success": False, "error": "Failed to save submission."}), 500


def check_github_submission_route():
    """
    Route for students to check if they have already submitted a GitHub link
    Returns submission status and details if exists
    """
    db = get_db()
    
    # Student authentication
    student_cookie = request.cookies.get("student_auth")
    if not student_cookie:
        return jsonify({"success": False, "error": "Authentication required."}), 401
    
    try:
        payload = jwt.decode(student_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        team_id = payload.get("team_id")
        
        if not team_id:
            return jsonify({"success": False, "error": "Invalid session."}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "error": "Session expired."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "error": "Invalid session."}), 401
    
    # Check if submission exists
    submission = db.github_submissions.find_one(
        {"team_id": team_id},
        {"_id": 0, "github_link": 1, "live_link": 1, "submitted_at": 1, "approval_status": 1}
    )
    
    if submission:
        return jsonify({
            "success": True,
            "is_submitted": True,
            "submission": submission
        }), 200
    else:
        return jsonify({
            "success": True,
            "is_submitted": False
        }), 200

def fetch_approved_github_teams():
    """
    Admin route: Fetch teams whose GitHub submission is APPROVED (Winner)
    """
    db = get_db()

    # Admin authentication
    admin_cookie = request.cookies.get("admin_auth")
    if not admin_cookie:
        return jsonify({"success": False, "error": "Admin authentication required"}), 401

    try:
        jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "error": "Admin session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "error": "Invalid admin session"}), 401

    try:
        # Get approved GitHub submissions (Winners)
        approved_teams = list(
            db.github_submissions.find(
                {"approval_status": "approved"},
                {"_id": 0, "team_id": 1, "team_name": 1}
            )
        )

        return jsonify({
            "success": True,
            "teams": approved_teams
        }), 200

    except Exception as e:
        print(f"Database error in fetch_approved_github_teams: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch approved teams"
        }), 500
