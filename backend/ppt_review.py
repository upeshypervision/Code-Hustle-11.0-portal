from flask import request, jsonify
from database import get_db
from datetime import datetime
from socketio_instance import socketio

def get_evaluated_submissions_route():
    """
    Route for admin to get all evaluated PPT submissions.
    Returns submissions sorted by marks in descending order.
    """
    db = get_db()
    
    try:
        # Fetch all submissions that have marks (evaluated)
        evaluated_submissions = list(db.ppt_submissions.find(
            {
                "marks": {"$exists": True, "$ne": None, "$ne": ""}
            },
            {"_id": 0}
        ).sort("marks", -1))  # -1 for descending order
        
        # Fetch team names
        team_ids = [sub["team_id"] for sub in evaluated_submissions]
        teams_info = list(db.teams.find(
            {"team_id": {"$in": team_ids}}, 
            {"team_id": 1, "team_name": 1, "_id": 0}
        ))
        
        # Merge team names
        team_map = {t["team_id"]: t.get("team_name", "Unknown") for t in teams_info}
        
        for sub in evaluated_submissions:
            sub["team_name"] = team_map.get(sub["team_id"], "Unknown Team")
        
        return jsonify({
            "success": True,
            "submissions": evaluated_submissions
        }), 200
        
    except Exception as e:
        print(f"Error fetching evaluated submissions: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": "Internal Server Error"}), 500


def update_ppt_approval_route():
    """
    Route for admin to update PPT approval status.
    Actions: 'approve', 'reject', 'revoke' (revoke changes approved to rejected)
    """
    db = get_db()
    
    data = request.json
    team_id = data.get("team_id")
    action = data.get("action")  # 'approve', 'reject', 'revoke'
    
    if not team_id or not action:
        return jsonify({"success": False, "error": "team_id and action are required"}), 400
    
    if action not in ["approve", "reject", "revoke"]:
        return jsonify({"success": False, "error": "Invalid action"}), 400
    
    try:
        # Map action to approval_status
        if action == "approve":
            new_status = "approved"
        elif action == "reject":
            new_status = "rejected"
        elif action == "revoke":
            new_status = "rejected"  # Revoke means changing approved to rejected
        
        result = db.ppt_submissions.update_one(
            {"team_id": team_id},
            {
                "$set": {
                    "approval_status": new_status,
                    "approved_at": datetime.utcnow().isoformat() + "Z" if action == "approve" else None
                }
            }
        )
        
        if result.matched_count == 0:
            return jsonify({"success": False, "error": "Submission not found"}), 404
        
        # Emit WebSocket event for real-time updates
        socketio.emit("ppt_approval_updated", {
            "team_id": team_id,
            "new_status": new_status
        })
        
        return jsonify({
            "success": True,
            "message": f"Submission {action}d successfully",
            "new_status": new_status
        }), 200
        
    except Exception as e:
        print(f"Error updating approval status: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": "Internal Server Error"}), 500
