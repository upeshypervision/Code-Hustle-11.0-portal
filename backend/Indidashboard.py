from flask import request, jsonify
from database import get_db
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from sanitizer import sanitize_output_data

def get_individual_dashboard_data():
    """
    Fetch dashboard data for the logged-in individual member.
    """
    print("DEBUG: Accessing get_individual_dashboard_data")
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
    
    # helper for converting non-serializable fields
    def serialize_doc(doc):
        doc["_id"] = str(doc["_id"])
        # ensure no password hash leaks
        if "password_hashed" in doc:
            del doc["password_hashed"]
        return doc

    individual = db.individuals.find_one({"individual_id": individual_id})
    
    if not individual:
        return jsonify({"error": "User not found"}), 404

    # Format response data
    response_data = {
        "fullName": individual.get("full_name", ""),
        "university": individual.get("college_name", ""),
        "sapId": individual.get("sapid", ""),
        "phone": individual.get("phone", ""),
        "email": individual.get("email", ""),
        "skills": individual.get("about", ""), # Mapping 'about' to 'skills' as requested
        "isUPESHypervision": individual.get("hypervision_id") if individual.get("hypervision_id") else None,
        "role": individual.get("role", "individual"),
        "accepted": individual.get("accepted"),  # CRITICAL: Include accepted team ID
        "reason": individual.get("reason", ""),  # Include removal/rejection reason
        "id": individual.get("individual_id")  # For socket room joining
    }
    
    # SECURITY: Sanitize output data before sending to frontend
    response_data = sanitize_output_data(response_data)

    return jsonify({"success": True, "data": response_data}), 200

def get_available_teams():
    """
    Fetch teams that have less than 5 total members (leader + members).
    No authentication required - public data for individuals to browse.
    """
    db = get_db()
    
    # Fetch all teams from create_team collection
    all_teams = list(db.create_team.find({}, {
        "_id": 0,
        "team_id": 1,
        "team_name": 1,
        "team_bio": 1,
        "leader": 1,
        "members": 1
    }))
    
    # Filter teams with less than 5 total members
    available_teams = []
    for team in all_teams:
        leader = team.get("leader", {})
        members = team.get("members", [])
        total_count = 1 + len(members)  # 1 leader + members
        
        if total_count < 5:
            # Format team data for frontend
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
                "requestStatus": None  # Default to no request status
            }
            # SECURITY: Sanitize team data before adding to response
            team_data = sanitize_output_data(team_data)
            available_teams.append(team_data)
    
    return jsonify({"success": True, "teams": available_teams}), 200
