"""
Team Matching System - Consolidated team-individual matching operations
Combines: individual_requests.py, team_requests.py
"""
from flask import request, jsonify
from database import get_db
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from sanitizer import sanitize_output_data


# ============================================================================
# INDIVIDUAL REQUESTS (Individual → Team)
# ============================================================================

def send_join_request():
    """
    Individual sends a join request to a team.
    POST /api/individual/send-request
    Body: { team_id: "TM035" }
    """
    token = request.cookies.get('individual_auth')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        individual_id = payload.get("individual_id")
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    data = request.json or {}
    team_id = data.get("team_id")
    
    if not team_id:
        return jsonify({"error": "Team ID required"}), 400

    db = get_db()
    
    individual = db.individuals.find_one({"individual_id": individual_id})
    if not individual:
        return jsonify({"error": "Individual not found"}), 404
    
    if individual.get("accepted"):
        return jsonify({"error": "You are already part of a team"}), 400
    
    requested = individual.get("requested", [])
    if team_id in requested:
        return jsonify({"error": "Request already sent to this team"}), 400
    
    team = db.create_team.find_one({"team_id": team_id})
    if not team:
        return jsonify({"error": "Team not found"}), 404
    
    total_members = 1 + len(team.get("members", []))
    if total_members >= 5:
        return jsonify({"error": "Team is full"}), 400
    
    db.individuals.update_one(
        {"individual_id": individual_id},
        {"$addToSet": {"requested": team_id}}
    )
    
    db.create_team.update_one(
        {"team_id": team_id},
        {"$addToSet": {"requests": individual_id}}
    )
    
    return jsonify({"success": True, "message": "Request sent successfully"}), 200


def get_sent_requests():
    """
    Get all teams the individual has sent requests to.
    GET /api/individual/sent-requests
    """
    token = request.cookies.get('individual_auth')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        individual_id = payload.get("individual_id")
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    db = get_db()
    
    individual = db.individuals.find_one({"individual_id": individual_id})
    if not individual:
        return jsonify({"error": "Individual not found"}), 404
    
    requested_team_ids = individual.get("requested", [])
    accepted_team_id = individual.get("accepted")
    rejected_team_ids = individual.get("rejected", [])
    
    all_team_ids = list(set(requested_team_ids + rejected_team_ids))
    
    teams_data = []
    for team_id in all_team_ids:
        team = db.create_team.find_one({"team_id": team_id})
        if team:
            leader = team.get("leader", {})
            members = team.get("members", [])
            total_count = 1 + len(members)
            
            if team_id == accepted_team_id:
                status = "Accepted"
            elif team_id in rejected_team_ids:
                status = "Rejected"
            else:
                status = "Pending"
            
            team_data = {
                "teamId": team.get("team_id", ""),
                "teamName": team.get("team_name", ""),
                "vision": team.get("team_bio", ""),
                "leaderName": leader.get("full_name", ""),
                "leaderUniversity": leader.get("college_name", ""),
                "leaderSkills": leader.get("bio", ""),
                "members": [
                    {
                        "name": member.get("full_name", ""),
                        "university": member.get("college_name", ""),
                        "skills": member.get("bio", "")
                    }
                    for member in members
                ],
                "memberCount": total_count,
                "requestStatus": status
            }
            teams_data.append(sanitize_output_data(team_data))
    
    return jsonify({"success": True, "teams": teams_data}), 200


def get_accepted_team():
    """
    Get details of the team that accepted the individual.
    GET /api/individual/accepted-team
    """
    token = request.cookies.get('individual_auth')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        individual_id = payload.get("individual_id")
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    db = get_db()
    
    individual = db.individuals.find_one({"individual_id": individual_id})
    if not individual:
        return jsonify({"error": "Individual not found"}), 404
    
    accepted_team_id = individual.get("accepted")
    if not accepted_team_id:
        return jsonify({"success": True, "team": None}), 200
    
    team = db.create_team.find_one({"team_id": accepted_team_id})
    if not team:
        return jsonify({"error": "Accepted team not found"}), 404
    
    leader = team.get("leader", {})
    members = team.get("members", [])
    total_count = 1 + len(members)
    
    team_data = {
        "teamId": team.get("team_id", ""),
        "teamName": team.get("team_name", ""),
        "vision": team.get("team_bio", ""),
        "leaderName": leader.get("full_name", ""),
        "leaderUniversity": leader.get("college_name", ""),
        "leaderSkills": leader.get("bio", ""),
        "leaderEmail": leader.get("email", ""),
        "members": [
            {
                "name": member.get("full_name", ""),
                "university": member.get("college_name", ""),
                "skills": member.get("bio", ""),
                "email": member.get("email", "")
            }
            for member in members
        ],
        "memberCount": total_count,
        "requestStatus": "Accepted"
    }
    
    return jsonify({"success": True, "team": sanitize_output_data(team_data)}), 200


# ============================================================================
# TEAM REQUESTS (Team → Individual)
# ============================================================================

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
    
    team = db.create_team.find_one({"team_id": team_id})
    if not team:
        return jsonify({"error": "Team not found"}), 404
    
    total_members = 1 + len(team.get("members", []))
    if total_members >= 5:
        return jsonify({"error": "Team is already full"}), 400
    
    if individual_id not in team.get("requests", []):
        return jsonify({"error": "No pending request from this individual"}), 400
    
    individual = db.individuals.find_one({"individual_id": individual_id})
    if not individual:
        return jsonify({"error": "Individual not found"}), 404
    
    if individual.get("accepted"):
        return jsonify({"error": "Individual has already joined another team"}), 400
    
    member_data = {
        "individual_id": individual_id,
        "full_name": individual.get("full_name", ""),
        "bio": individual.get("about", ""),
        "email": individual.get("email", ""),
        "phone": individual.get("phone", ""),
        "sapid": individual.get("sapid"),
        "college_name": individual.get("college_name"),
        "password_hash": individual.get("password_hashed", ""),
        "joinedViaRequest": True
    }
    
    db.create_team.update_one(
        {"team_id": team_id},
        {
            "$push": {"members": member_data},
            "$pull": {"requests": individual_id}
        }
    )
    
    db.individuals.update_one(
        {"individual_id": individual_id},
        {
            "$set": {
                "accepted": team_id,
                "requested": [team_id]
            },
            "$unset": {"reason": ""}
        }
    )
    
    db.create_team.update_many(
        {"team_id": {"$ne": team_id}},
        {"$pull": {"requests": individual_id}}
    )
    
    # Emit Socket.IO event
    from socketio_instance import socketio
    
    updated_team = db.create_team.find_one({"team_id": team_id})
    all_members = updated_team.get("members", [])
    
    for member in all_members:
        if member.get("individual_id"):
            socketio.emit(
                "team_updated",
                {
                    "teamId": team_id,
                    "message": f"New member {individual.get('full_name', 'Someone')} joined the team!"
                },
                room=f"individual_{member.get('individual_id')}"
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
    
    result = db.create_team.update_one(
        {"team_id": team_id},
        {"$pull": {"requests": individual_id}}
    )
    
    if result.modified_count == 0:
        return jsonify({"error": "Request not found or already processed"}), 404
    
    db.individuals.update_one(
        {"individual_id": individual_id},
        {"$addToSet": {"rejected": team_id}}
    )
    
    return jsonify({"success": True, "message": "Request rejected successfully"}), 200
