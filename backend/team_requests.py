from flask import request, jsonify
from database import get_db
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from sanitizer import sanitize_output_data

def get_join_requests():
    """
    Get all individuals who have requested to join this team.
    GET /api/team/join-requests
    """
    token = request.cookies.get("team_auth")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        team_id = payload.get("team_id")
        if not team_id:
            return jsonify({"error": "Invalid token payload"}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    db = get_db()
    
    team = db.create_team.find_one({"team_id": team_id})
    if not team:
        return jsonify({"error": "Team not found"}), 404
    
    request_ids = team.get("requests", [])
    
    # Fetch individual details for each request
    requests_data = []
    for individual_id in request_ids:
        individual = db.individuals.find_one({"individual_id": individual_id})
        if individual:
            request_data = {
                "id": individual.get("individual_id", ""),
                "name": individual.get("full_name", ""),
                "about": individual.get("about", ""),
                "skills": individual.get("about", ""),
                "university": individual.get("college_name", ""),
                # Removed: email, phone, sapid for privacy
                "isHypervision": bool(individual.get("hypervision_id"))
            }
            requests_data.append(sanitize_output_data(request_data))
    
    return jsonify({"success": True, "requests": requests_data}), 200


def accept_join_request():
    """
    Accept an individual's join request.
    POST /api/team/accept-request
    Body: { individual_id: "IND048" }
    """
    token = request.cookies.get("team_auth")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        team_id = payload.get("team_id")
        if not team_id:
            return jsonify({"error": "Invalid token payload"}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    data = request.json or {}
    individual_id = data.get("individual_id")
    
    if not individual_id:
        return jsonify({"error": "Individual ID required"}), 400

    db = get_db()
    
    # Get team data
    team = db.create_team.find_one({"team_id": team_id})
    if not team:
        return jsonify({"error": "Team not found"}), 404
    
    # Check team capacity
    total_members = 1 + len(team.get("members", []))
    if total_members >= 5:
        return jsonify({"error": "Team is already full"}), 400
    
    # Check if individual_id is in team's requests array
    if individual_id not in team.get("requests", []):
        return jsonify({"error": "No pending request from this individual"}), 400
    
    # Get individual data
    individual = db.individuals.find_one({"individual_id": individual_id})
    if not individual:
        return jsonify({"error": "Individual not found"}), 404
    
    # CRITICAL: Check if individual is already accepted by another team (race condition)
    if individual.get("accepted"):
        return jsonify({"error": "Individual has already joined another team"}), 400
    
    # Prepare member data to add to team
    member_data = {
        "individual_id": individual_id,
        "full_name": individual.get("full_name", ""),
        "bio": individual.get("about", ""),
        "email": individual.get("email", ""),
        "phone": individual.get("phone", ""),
        "sapid": individual.get("sapid"),
        "college_name": individual.get("college_name"),
        "password_hash": individual.get("password_hashed", ""),
        "joinedViaRequest": True  # Flag to identify accepted members
    }
    
    # Add member to team's members array
    db.create_team.update_one(
        {"team_id": team_id},
        {
            "$push": {"members": member_data},
            "$pull": {"requests": individual_id}
        }
    )
    
    # Update individual: set accepted field and clean up requested array (keep only accepted team)
    db.individuals.update_one(
        {"individual_id": individual_id},
        {
            "$set": {
                "accepted": team_id,
                "requested": [team_id]  # Keep only the accepted team in requested
            }
        }
    )
    
    # CLEANUP: Remove this individual from ALL other teams' requests arrays
    db.create_team.update_many(
        {"team_id": {"$ne": team_id}},
        {"$pull": {"requests": individual_id}}
    )
    
    return jsonify({"success": True, "message": "Request accepted successfully"}), 200


def reject_join_request():
    """
    Reject an individual's join request.
    POST /api/team/reject-request
    Body: { individual_id: "IND048" }
    """
    token = request.cookies.get("team_auth")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        team_id = payload.get("team_id")
        if not team_id:
            return jsonify({"error": "Invalid token payload"}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    data = request.json or {}
    individual_id = data.get("individual_id")
    
    if not individual_id:
        return jsonify({"error": "Individual ID required"}), 400

    db = get_db()
    
    # Remove individual_id from team's requests array
    result = db.create_team.update_one(
        {"team_id": team_id},
        {"$pull": {"requests": individual_id}}
    )
    
    if result.modified_count == 0:
        return jsonify({"error": "Request not found or already processed"}), 404
    
    # Add team_id to individual's rejected array (keep in requested for status display)
    db.individuals.update_one(
        {"individual_id": individual_id},
        {"$addToSet": {"rejected": team_id}}
    )
    
    return jsonify({"success": True, "message": "Request rejected successfully"}), 200
