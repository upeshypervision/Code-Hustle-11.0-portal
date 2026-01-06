from flask import request, jsonify
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from database import get_db
from datetime import datetime
from socketio_instance import socketio


def submit_hackerrank_route():
    """
    Route for Hackerrank profile submission (student or admin)
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
    
    # Check if Hackerrank submission round is active (only for students)
    if submitted_via == "student":
        round_status = db.counters.find_one({"_id": "round_status"})
        if round_status and round_status.get("hackerrank_submission") != "live":
            return jsonify({
                "success": False,
                "error": "Sorry, the submission cannot be made as the Hackerrank submission round is not currently active."
            }), 403
    
    # ---------- GET DATA ----------
    data = request.get_json()
    if not data or "hackerrank_link" not in data:
        return jsonify({"success": False, "error": "Hackerrank profile link is required."}), 400
    
    hackerrank_link = data.get("hackerrank_link")
    
    # ---------- VALIDATION ----------
    if not isinstance(hackerrank_link, str) or not hackerrank_link.startswith("http"):
        return jsonify({"success": False, "error": "Invalid Hackerrank link format."}), 400
    
    # ---------- CHECK TEAM EXISTS ----------
    team = db.teams.find_one({"team_id": team_id})
    if not team:
        return jsonify({"success": False, "error": "Team not found."}), 404
    
    # ---------- PREVENT DUPLICATE SUBMISSION ----------
    # Table name specified by user: Hackerrank_submission
    existing = db.Hackerrank_submission.find_one({"team_id": team_id})
    if existing:
        return jsonify({"success": False, "error": "Hackerrank profile already submitted for this team."}), 409
    
    # ---------- INSERT SUBMISSION ----------
    submission_data = {
        "team_id": team_id,
        "team_name": team.get("team_name"),
        "hackerrank_link": hackerrank_link,
        "submitted_via": submitted_via,
        "submitted_at": datetime.utcnow().isoformat() + "Z",
        "approval_status": "pending"
    }
    
    result = db.Hackerrank_submission.insert_one(submission_data)
    
    if result.inserted_id:
        # Emit WebSocket event to notify all admins
        socketio.emit("hackerrank_submitted", {
            "team_id": team_id,
            "submitted_at": submission_data["submitted_at"]
        })
        
        return jsonify({
            "success": True,
            "message": f"Hackerrank profile submitted successfully by {submitted_via}.",
            "hackerrank_link": hackerrank_link
        }), 200
    
    return jsonify({"success": False, "error": "Failed to save submission."}), 500


def check_hackerrank_submission_route():
    """
    Route for students to check if they have already submitted a Hackerrank link
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
    submission = db.Hackerrank_submission.find_one({"team_id": team_id})
    
    if submission:
        return jsonify({
            "success": True,
            "is_submitted": True,
            "submission": {
                "hackerrank_link": submission.get("hackerrank_link"),
                "submitted_at": submission.get("submitted_at"),
                "approval_status": submission.get("approval_status", "pending")  # Include approval status
            }
        }), 200
    else:
        return jsonify({
            "success": True,
            "is_submitted": False
        }), 200


def fetch_teams_no_hackerrank_submission():
    """
    Admin route: Fetch teams that have NOT submitted a Hackerrank link yet
    """
    db = get_db()
    
    admin_cookie = request.cookies.get('admin_auth')
    if not admin_cookie:
        return jsonify({"success": False, "error": "Admin authentication required"}), 401

    try:
        jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "error": "Admin session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "error": "Invalid admin session"}), 401
    except Exception as e:
        print(f"Auth error: {e}")
        return jsonify({"success": False, "error": "Authentication failed"}), 401

    try:
        # Get all team IDs that HAVE submitted
        submitted_team_ids = [doc["team_id"] for doc in db.Hackerrank_submission.find({}, {"team_id": 1, "_id": 0})]
        
        # Find teams whose ID is NOT in the submitted list
        pending_teams = list(
            db["teams"].find(
                {"team_id": {"$nin": submitted_team_ids}},
                {"_id": 0, "team_id": 1, "team_name": 1}
            ).sort("team_id", 1)
        )
        
        return jsonify({"success": True, "teams": pending_teams}), 200
    except Exception as e:
        print(f"Database error in fetch_teams_no_hackerrank_submission: {e}")
        return jsonify({"success": False, "error": f"Database error: {str(e)}"}), 500


def fetch_all_hackerrank_submissions():
    """
    Admin route: Fetch all Hackerrank submissions
    """
    db = get_db()
    
    admin_cookie = request.cookies.get('admin_auth')
    if not admin_cookie:
        return jsonify({"success": False, "error": "Admin authentication required"}), 401

    try:
        jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "error": "Admin session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "error": "Invalid admin session"}), 401
    except Exception as e:
        print(f"Auth error: {e}")
        return jsonify({"success": False, "error": "Authentication failed"}), 401
    
    try:
        submissions = list(
            db.Hackerrank_submission.find(
                {}, 
                {"_id": 0}
            ).sort("submitted_at", -1)
        )
        
        return jsonify({"success": True, "submissions": submissions}), 200
    except Exception as e:
        print(f"Database error in fetch_all_hackerrank_submissions: {e}")
        return jsonify({"success": False, "error": f"Database error: {str(e)}"}), 500


def approve_hackerrank_submission():
    """
    Route for admin to approve/reject Hackerrank submissions
    Updates team round progression and tracks admin who approved
    """
    db = get_db()
    
    # Admin authentication
    admin_cookie = request.cookies.get("admin_auth")
    if not admin_cookie:
        return jsonify({"success": False, "error": "Admin authentication required"}), 401
    
    try:
        admin_payload = jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        admin_id = admin_payload.get("login_id")
        
        if not admin_id:
            return jsonify({"success": False, "error": "Invalid admin session"}), 401
            
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "error": "Admin session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "error": "Invalid admin token"}), 401
    except Exception as e:
        print(f"Error decoding admin token: {str(e)}")
        return jsonify({"success": False, "error": "Authentication failed"}), 401
    
    # Get request data
    data = request.get_json()
    if not data or "team_id" not in data or "action" not in data:
        return jsonify({"success": False, "error": "team_id and action are required"}), 400
    
    team_id = data.get("team_id")
    action = data.get("action")  # 'approve' or 'reject'
    
    if action not in ["approve", "reject"]:
        return jsonify({"success": False, "error": "Invalid action. Use 'approve' or 'reject'"}), 400
    
    try:
        # Check if submission exists
        submission = db.Hackerrank_submission.find_one({"team_id": team_id})
        if not submission:
            return jsonify({"success": False, "error": "Submission not found"}), 404
        
        # Update hackerrank_submissions collection
        approval_status = "approved" if action == "approve" else "rejected"
        db.Hackerrank_submission.update_one(
            {"team_id": team_id},
            {
                "$set": {
                    "approval_status": approval_status,
                    "approved_by": admin_id,
                    "approved_at": datetime.utcnow().isoformat() + "Z"
                }
            }
        )
        
        # Emit WebSocket event for real-time updates
        socketio.emit("hackerrank_approval_updated", {
            "team_id": team_id,
            "action": action,
            "approved_by": admin_id
        })
        
        return jsonify({
            "success": True,
            "message": f"Submission {approval_status} successfully",
            "team_id": team_id,
            "action": action
        }), 200
        
    except Exception as e:
        print(f"Error approving Hackerrank submission: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to process approval"
        }), 500
