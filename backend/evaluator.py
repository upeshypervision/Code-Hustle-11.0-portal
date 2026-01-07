from flask import request, jsonify
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from database import get_db
from datetime import datetime

def get_assigned_submissions_route():
    """
    Route for evaluators to get their assigned chunk of pending PPT submissions.
    STICKY ASSIGNMENT LOGIC:
    1. Verify evaluator auth.
    2. Get all evaluators to calculate fair share.
    3. Fetch submissions already assigned to this evaluator.
    4. Calculate fair share = total_pending / total_evaluators.
    5. If deficit exists, assign unassigned submissions to this evaluator.
    6. Return locked submissions.
    """
    db = get_db()
    
    # 1. Auth Check
    token = request.cookies.get("evaluator_auth")
    if not token:
        return jsonify({"success": False, "error": "Authentication required"}), 401
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        current_username = payload.get("username")
        if not current_username:
             return jsonify({"success": False, "error": "Invalid session"}), 401
    except Exception:
        return jsonify({"success": False, "error": "Invalid token"}), 401

    try:
        # 3. Fetch submissions ALREADY assigned to me
        # No dynamic assignment happens here anymore.
        my_assigned_submissions = list(db.ppt_submissions.find(
            {
                "assigned_to": current_username
            },
            {"_id": 0}
        ).sort("team_id", 1))

        # Count total pending for stats
        total_pending_count = db.ppt_submissions.count_documents({
            "approval_status": "pending",
            "$or": [{"marks": {"$exists": False}}, {"marks": None}, {"marks": ""}]
        })
        
        # 7. Fetch Team Names for these submissions
        team_ids = [sub["team_id"] for sub in my_assigned_submissions]
        teams_info = list(db.teams.find({"team_id": {"$in": team_ids}}, {"team_id": 1, "team_name": 1, "_id": 0}))
        
        # Merge team_name into submissions
        team_map = {t["team_id"]: t.get("team_name", "Unknown") for t in teams_info}
        
        for sub in my_assigned_submissions:
            sub["team_name"] = team_map.get(sub["team_id"], "Unknown Team")
            
        return jsonify({
            "success": True, 
            "submissions": my_assigned_submissions,
            "evaluator_info": {
                "username": current_username,
                "assigned_count": len(my_assigned_submissions),
                "total_pending": total_pending_count
            }
        }), 200

    except Exception as e:
        print(f"Error in get_assigned_submissions: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": "Internal Server Error"}), 500


def submit_marks_route():
    """
    Route for evaluators to submit marks for a team.
    Updates 'ppt_submissions' with 'marks' field.
    """
    db = get_db()
    
    # Auth Check
    token = request.cookies.get("evaluator_auth")
    if not token:
        return jsonify({"success": False, "error": "Authentication required"}), 401
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        evaluator_username = payload.get("username")
    except Exception:
        return jsonify({"success": False, "error": "Invalid token"}), 401

    data = request.json
    team_id = data.get("team_id")
    marks = data.get("marks")
    
    if not team_id or marks is None:
        return jsonify({"success": False, "error": "Team ID and Marks are required"}), 400
        
    try:
        # Validate marks are numeric
        marks_float = float(marks)
    except ValueError:
        return jsonify({"success": False, "error": "Marks must be a number"}), 400

    try:
        result = db.ppt_submissions.update_one(
            {"team_id": team_id},
            {
                "$set": {
                    "marks": marks_float,
                    "evaluated_by": evaluator_username,
                    "evaluated_at": datetime.utcnow().isoformat() + "Z"
                }
            }
        )
        
        if result.matched_count == 0:
             return jsonify({"success": False, "error": "Submission not found"}), 404
             
        return jsonify({"success": True, "message": "Marks updated successfully"}), 200

    except Exception as e:
        print(f"Error submitting marks: {e}")
        return jsonify({"success": False, "error": "Internal Server Error"}), 500


def distribute_submissions_route():
    """
    Route for ADMIN to batch distribute all unassigned pending submissions.
    Triggered when PPT Round is closed.
    """
    db = get_db()
    
    # Check Admin Auth (reusing basic cookie check logic or assuming protected by frontend/middleware)
    # Ideally should check for admin_auth cookie
    admin_token = request.cookies.get("admin_auth")
    if not admin_token:
        return jsonify({"success": False, "error": "Admin authentication required"}), 401
    
    # ... (rest of distribute logic)
    
    
    try:
        # 1. Fetch all Evaluators
        evaluators = list(db.evaluator.find({}, {"username": 1}))
        if not evaluators:
            return jsonify({"success": False, "error": "No evaluators found"}), 400
            
        evaluator_usernames = [e["username"] for e in evaluators]
        num_evaluators = len(evaluator_usernames)
        
        # 2. Fetch ALL pending & unassigned submissions
        unassigned_submissions = list(db.ppt_submissions.find(
            {
                "approval_status": "pending",
                "$or": [{"assigned_to": {"$exists": False}}, {"assigned_to": None}, {"assigned_to": ""}]
            },
            {"team_id": 1}
        ))
        
        num_submissions = len(unassigned_submissions)
        if num_submissions == 0:
            return jsonify({"success": True, "message": "No unassigned submissions to distribute"}), 200
            
        # 3. Distribute Round-Robin
        updates = []
        for i, submission in enumerate(unassigned_submissions):
            assigned_evaluator = evaluator_usernames[i % num_evaluators]
            # We want to set assigned_to
            db.ppt_submissions.update_one(
                {"team_id": submission["team_id"]},
                {"$set": {"assigned_to": assigned_evaluator}}
            )
            
        return jsonify({
            "success": True, 
            "message": f"Successfully distributed {num_submissions} submissions among {num_evaluators} evaluators."
        }), 200
        
    except Exception as e:
        print(f"Error distributing submissions: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


def check_evaluator_auth_route():
    """
    Simple route to check if evaluator session is valid.
    Returns 200 OK with username if valid.
    """
    token = request.cookies.get("evaluator_auth")
    if not token:
        return jsonify({"success": False, "error": "Not authenticated"}), 401
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if not payload.get("username"):
            return jsonify({"success": False, "error": "Invalid session"}), 401
        
        return jsonify({"success": True, "username": payload.get("username")}), 200
        
    except Exception:
        return jsonify({"success": False, "error": "Invalid token"}), 401
