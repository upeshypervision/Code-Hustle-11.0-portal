from flask import request, jsonify
from database import get_db
import jwt
from config import JWT_SECRET, JWT_ALGORITHM

def get_all_individuals_route():
    """
    Admin route to get all individuals.
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
    
    # Fetch all individuals
    cursor = db.individuals.find({}, {
        "_id": 0,
        "individual_id": 1,
        "full_name": 1,
        "email": 1,
        "phone": 1,
        "created_at": 1,
        "accepted": 1,  # Team ID if accepted
        "reason": 1     # Removal reason if removed
    })

    individuals = []
    for indi in cursor:
        individual_data = {
            "individualId": indi.get("individual_id"),
            "fullName": indi.get("full_name"),
            "email": indi.get("email"),
            "phone": indi.get("phone"),
            "createdAt": indi.get("created_at"),
            "accepted": indi.get("accepted"),
            "reason": indi.get("reason"),
            "teamDetails": None
        }
        
        # If accepted, fetch team details
        if indi.get("accepted"):
            team_id = indi.get("accepted")
            team = db.create_team.find_one(
                {"team_id": team_id},
                {
                    "_id": 0,
                    "team_id": 1,
                    "team_name": 1,
                    "team_bio": 1,
                    "leader": 1,
                    "members": 1
                }
            )
            
            if team:
                individual_data["teamDetails"] = {
                    "teamId": team.get("team_id"),
                    "teamName": team.get("team_name"),
                    "teamBio": team.get("team_bio"),
                    "leaderName": team.get("leader", {}).get("full_name"),
                    "leaderEmail": team.get("leader", {}).get("email"),
                    "memberCount": 1 + len(team.get("members", []))  # leader + members
                }
        
        individuals.append(individual_data)

    return jsonify({
        "success": True, 
        "individuals": individuals
    }), 200

def delete_individual_route(individual_id):
    """
    Admin route to delete an individual by individual_id.
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
    
    result = db.individuals.delete_one({"individual_id": individual_id})
    
    if result.deleted_count == 0:
        return jsonify({"error": "Individual not found"}), 404
        
    return jsonify({"success": True, "message": "Individual deleted successfully"}), 200
