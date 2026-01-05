# backend/round_management.py
from flask import request, jsonify
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from database import get_db
from socketio_instance import socketio


def get_round_status_route():
    """
    Get current round status for all rounds
    """
    db = get_db()
    
    # Get or create round status document in counters collection
    round_status = db.counters.find_one({"_id": "round_status"})
    
    if not round_status:
        # Initialize default round status
        default_status = {
            "_id": "round_status",
            "ps_selection": True,
            "ppt_upload": True,
            "github_submission": False
        }
        db.counters.insert_one(default_status)
        round_status = default_status
    
    return jsonify({
        "success": True,
        "rounds": {
            "ps_selection": round_status.get("ps_selection", True),
            "ppt_upload": round_status.get("ppt_upload", True),
            "github_submission": round_status.get("github_submission", False),
            "hackerrank_submission": round_status.get("hackerrank_submission", True)
        }
    }), 200


def update_round_status_route():
    """
    Update round status (admin only)
    Emits WebSocket event to notify all users
    """
    db = get_db()
    
    # Admin authentication
    admin_cookie = request.cookies.get("admin_auth")
    if not admin_cookie:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    
    try:
        jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return jsonify({"success": False, "error": "Invalid session"}), 401
    
    data = request.get_json()
    round_type = data.get("round_type")  # ps_selection, ppt_upload, github_submission, hackerrank_submission
    is_active = data.get("is_active")
    
    if round_type not in ["ps_selection", "ppt_upload", "github_submission", "hackerrank_submission"]:
        return jsonify({"success": False, "error": "Invalid round type"}), 400
    
    if not isinstance(is_active, bool):
        return jsonify({"success": False, "error": "is_active must be boolean"}), 400
    
    # Update round status in counters collection
    result = db.counters.update_one(
        {"_id": "round_status"},
        {"$set": {round_type: is_active}},
        upsert=True
    )
    
    if result.modified_count > 0 or result.upserted_id:
        # Emit WebSocket event to notify all users
        socketio.emit("round_status_changed", {
            "round_type": round_type,
            "is_active": is_active
        })
        
        return jsonify({
            "success": True,
            "message": f"Round status updated: {round_type} = {is_active}"
        }), 200
    else:
        return jsonify({"success": False, "error": "Failed to update round status"}), 500
