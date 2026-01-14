# backend/round_management.py
from flask import request, jsonify
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from database import get_db
from socketio_instance import socketio


def get_round_status_route():
    """
    Get current round status for all rounds
    Returns enum states: "not_started", "live", "closed"
    """
    db = get_db()
    
    # Get or create round status document in counters collection
    round_status = db.counters.find_one({"_id": "round_status"})
    
    if not round_status:
        # Initialize default round status with enum states
        default_status = {
            "_id": "round_status",
            "ps_selection": "not_started",
            "ppt_upload": "not_started",
            "github_submission": "not_started",
            "hackerrank_submission": "not_started"
        }
        db.counters.insert_one(default_status)
        round_status = default_status
    else:
        # Backward compatibility: migrate boolean values to enum
        needs_migration = False
        for key in ["ps_selection", "ppt_upload", "github_submission", "hackerrank_submission"]:
            value = round_status.get(key)
            if isinstance(value, bool):
                needs_migration = True
                # true -> "live", false -> "not_started"
                round_status[key] = "live" if value else "not_started"
        
        # Update database if migration occurred
        if needs_migration:
            db.counters.update_one(
                {"_id": "round_status"},
                {"$set": {k: v for k, v in round_status.items() if k != "_id"}}
            )
    
    return jsonify({
        "success": True,
        "rounds": {
            "ps_selection": round_status.get("ps_selection", "not_started"),
            "ppt_upload": round_status.get("ppt_upload", "not_started"),
            "github_submission": round_status.get("github_submission", "not_started"),
            "hackerrank_submission": round_status.get("hackerrank_submission", "not_started")
        }
    }), 200


def update_round_status_route():
    """
    Update round status (admin only)
    Accepts enum state: "not_started", "live", "closed"
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
    state = data.get("state")  # "not_started", "live", "closed"
    
    # Validate round type
    valid_round_types = ["ps_selection", "ppt_upload", "github_submission", "hackerrank_submission"]
    if round_type not in valid_round_types:
        return jsonify({"success": False, "error": "Invalid round type"}), 400
    
    # Validate state
    valid_states = ["not_started", "live", "closed"]
    if state not in valid_states:
        return jsonify({"success": False, "error": "Invalid state. Must be: not_started, live, or closed"}), 400
    
    # Update round status in counters collection
    result = db.counters.update_one(
        {"_id": "round_status"},
        {"$set": {round_type: state}},
        upsert=True
    )
    
    if result.modified_count > 0 or result.upserted_id:
        # Emit WebSocket event to notify all users
        socketio.emit("round_status_changed", {
            "round_type": round_type,
            "state": state
        })
        
        return jsonify({
            "success": True,
            "message": f"Round status updated: {round_type} = {state}"
        }), 200
    else:
        return jsonify({"success": False, "error": "Failed to update round status"}), 500

