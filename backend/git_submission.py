from flask import request, jsonify
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from database import get_db
from datetime import datetime


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
        "submitted_at": datetime.utcnow().isoformat() + "Z"
    }
    
    result = db.github_submissions.insert_one(submission_data)
    
    if result.inserted_id:
        return jsonify({
            "success": True,
            "message": f"Link submitted successfully by {submitted_via}.",
            "github_link": github_link,
            "live_link": live_link
        }), 200
    
    return jsonify({"success": False, "error": "Failed to save submission."}), 500
