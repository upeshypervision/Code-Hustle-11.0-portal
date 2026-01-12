from flask import request, jsonify
from database import get_db
import jwt
from config import JWT_SECRET, JWT_ALGORITHM

def get_all_create_teams_route():
    """
    Admin route to get all teams from create_team collection.
    """
    # Check admin auth
    token = request.cookies.get("admin_auth")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db()
    
    # Fetch all teams
    teams_cursor = db.create_team.find({}, {
        "_id": 0,
        "team_id": 1,
        "team_name": 1,
        "team_bio": 1,
        "leader": 1,
        "members": 1,
        "created_at": 1
    })

    teams_list = []
    for team in teams_cursor:
        leader = team.get("leader", {})
        members = team.get("members", [])
        
        # Calculate member count (leader + members)
        member_count = 1 + len(members)

        teams_list.append({
            "teamId": team.get("team_id"),
            "teamName": team.get("team_name"),
            "teamBio": team.get("team_bio"),
            "leaderName": leader.get("full_name"),
            "leaderEmail": leader.get("email"),
            "leaderPhone": leader.get("phone"),
            "memberCount": member_count,
            "createdAt": team.get("created_at"),
            "members": [
                {
                    "name": m.get("full_name"),
                    "email": m.get("email"),
                    "phone": m.get("phone"),
                    "joinedViaRequest": m.get("joinedViaRequest", False)
                } for m in members
            ]
        })

    return jsonify({
        "success": True, 
        "teams": teams_list
    }), 200

def delete_create_team_route(team_id):
    """
    Admin route to delete a team by team_id.
    """
    # Check admin auth
    token = request.cookies.get("admin_auth")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db()
    
    result = db.create_team.delete_one({"team_id": team_id})
    
    if result.deleted_count == 0:
        return jsonify({"error": "Team not found"}), 404
        
    return jsonify({"success": True, "message": "Team deleted successfully"}), 200
