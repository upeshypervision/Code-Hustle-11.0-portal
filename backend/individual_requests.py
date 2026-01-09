from flask import request, jsonify
from database import get_db
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from sanitizer import sanitize_output_data

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
    
    # Get individual data
    individual = db.individuals.find_one({"individual_id": individual_id})
    if not individual:
        return jsonify({"error": "Individual not found"}), 404
    
    # Check if individual is already accepted by a team
    if individual.get("accepted"):
        return jsonify({"error": "You are already part of a team"}), 400
    
    # Check if request already sent
    requested = individual.get("requested", [])
    if team_id in requested:
        return jsonify({"error": "Request already sent to this team"}), 400
    
    # Get team data
    team = db.create_team.find_one({"team_id": team_id})
    if not team:
        return jsonify({"error": "Team not found"}), 404
    
    # Check team capacity (1 leader + members < 5)
    total_members = 1 + len(team.get("members", []))
    if total_members >= 5:
        return jsonify({"error": "Team is full"}), 400
    
    # Add team_id to individual's requested array
    db.individuals.update_one(
        {"individual_id": individual_id},
        {"$addToSet": {"requested": team_id}}
    )
    
    # Add individual_id to team's requests array
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
    
    # Combine requested and rejected teams (use set to avoid duplicates)
    all_team_ids = list(set(requested_team_ids + rejected_team_ids))
    
    # Fetch team details for each team (requested or rejected)
    teams_data = []
    for team_id in all_team_ids:
        team = db.create_team.find_one({"team_id": team_id})
        if team:
            leader = team.get("leader", {})
            members = team.get("members", [])
            total_count = 1 + len(members)
            
            # Determine status based on accepted and rejected fields
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
    
    # Fetch team details
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
        "leaderPhone": leader.get("phone", ""),
        "members": [
            {
                "name": member.get("full_name", ""),
                "university": member.get("college_name", ""),
                "skills": member.get("bio", ""),
                "email": member.get("email", ""),
                "phone": member.get("phone", "")
            }
            for member in members
        ],
        "memberCount": total_count,
        "requestStatus": "Accepted"  # Add status for frontend compatibility
    }
    
    return jsonify({"success": True, "team": sanitize_output_data(team_data)}), 200
