from flask import request, jsonify
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from database import get_db
from datetime import datetime

def get_payment_validation_status_route():
    """
    Get current payment validation status for admin
    Returns enum states: "not_started", "live", "closed"
    """
    db = get_db()
    
    # Get or create payment validation status document
    payment_validation_status = db.counters.find_one({"_id": "payment_validation_status"})
    if not payment_validation_status:
        # Initialize default payment validation status
        default_status = {
            "_id": "payment_validation_status",
            "payment_validation": "not_started",
        }
        db.counters.insert_one(default_status)
        payment_validation_status = default_status
    else:
        # Backward compatibility: migrate boolean values to enum
        needs_migration = False
        for key in ["payment_validation"]:
            value = payment_validation_status.get(key)
            if isinstance(value, bool):
                needs_migration = True
                # true -> "live", false -> "not_started"
                payment_validation_status[key] = "live" if value else "not_started"
        
        # Update database if migration occurred
        if needs_migration:
            db.counters.update_one(
                {"_id": "payment_validation_status"},
                {"$set": {k: v for k, v in payment_validation_status.items() if k != "_id"}}
            )
    
    return jsonify({
        "success": True,
        "status": payment_validation_status.get("payment_validation", "not_started")
    }), 200

def update_payment_validation_status_route():
    """
    Update payment validation status (admin only)
    Accepts enum state: "not_started", "live", "closed"
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
    state = data.get("state")  # "not_started", "live", "closed"
    
    # Validate state
    valid_states = ["not_started", "live", "closed"]
    if state not in valid_states:
        return jsonify({"success": False, "error": "Invalid state. Must be: not_started, live, or closed"}), 400

    # Update payment validation status in counters collection
    result = db.counters.update_one(
        {"_id": "payment_validation_status"},
        {"$set": {"status": state}},
        upsert=True
    )
    
    if result.modified_count > 0 or result.upserted_id:
        return jsonify({
            "success": True,
            "message": f"Payment validation status updated to: {state}"
        }), 200
    else:
        return jsonify({"success": False, "error": "Failed to update payment validation status"}), 500

def get_pending_payment_teams_route():
    """
    Admin route to get all teams with pending payment validation
    Returns teams with payment_status: "Submitted for Review" and status: "Payment Pending Review"
    """
    db = get_db()
    
    # Admin authentication
    admin_cookie = request.cookies.get("admin_auth")
    if not admin_cookie:
        return jsonify({"success": False, "error": "Admin authentication required"}), 401
    
    try:
        jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return jsonify({"success": False, "error": "Invalid session"}), 401

    # Find teams with pending payment validation
    pending_teams = list(
        db.teams.find({
            "status": "Pending Payment"
        }).sort("timestamp", -1)  # Sort by newest first
    )
    
    # Process teams to return only necessary information
    processed_teams = []
    for team in pending_teams:
        team_info = {
            "team_id": team.get("team_id"),
            "team_name": team.get("team_name"),
            "leader": team.get("leader"),
            "members": team.get("members"),
            "amount": team.get("amount"),
            "payment_screenshot": team.get("payment_screenshot"),
            "timestamp": team.get("timestamp"),
            "hypervision_member": team.get("hypervision_member")
        }
        processed_teams.append(team_info)
    
    return jsonify({
        "success": True,
        "teams": processed_teams,
        "count": len(processed_teams)
    }), 200

def validate_payment_route():
    """
    Admin route to validate or reject payment for a team
    Updates team status based on validation result
    """
    db = get_db()
    
    # Admin authentication
    admin_cookie = request.cookies.get("admin_auth")
    if not admin_cookie:
        return jsonify({"success": False, "error": "Admin authentication required"}), 401
    
    try:
        payload = jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        admin_id = payload.get("login_id")
    except:
        return jsonify({"success": False, "error": "Invalid session"}), 401

    data = request.get_json()
    team_id = data.get("team_id")
    is_valid = data.get("is_valid", False)  # True if payment is valid, False if invalid
    
    if not team_id:
        return jsonify({"success": False, "error": "Team ID is required"}), 400

    # Find the team
    team = db.teams.find_one({"team_id": team_id})
    if not team:
        return jsonify({"success": False, "error": "Team not found"}), 404

    # Check if team is in correct status for validation
    if team.get("status") != "Pending Payment":
        return jsonify({"success": False, "error": "Team is not in pending payment validation state"}), 400

    # Update team status based on validation result
    if is_valid:
        new_status = "Paid"
        action_message = "Payment validated successfully"
    else:
        new_status = "Payment Rejected"
        action_message = "Payment rejected"

    # Update the team document
    result = db.teams.update_one(
        {"team_id": team_id},
        {
            "$set": {
                "status": new_status,
                "validated_by": admin_id,
                "validated_at": datetime.utcnow().isoformat()
            }
        }
    )

    if result.modified_count > 0:
        return jsonify({
            "success": True,
            "message": action_message,
            "team_id": team_id,
            "new_status": new_status
        }), 200
    else:
        return jsonify({"success": False, "error": "Failed to update team status"}), 500