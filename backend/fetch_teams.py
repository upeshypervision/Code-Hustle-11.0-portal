from flask import jsonify, request
from database import get_db
import jwt
from config import JWT_SECRET, JWT_ALGORITHM

def fetch_teams_route():
    # 1. VERIFY ADMIN AUTH
    token = request.cookies.get('admin_auth')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return jsonify({"error": "Invalid session"}), 401

    db = get_db()
    
    # 2. FETCH ALL TEAMS (Sort by latest)
    teams_cursor = db["teams"].find().sort("timestamp", -1)
    
    teams = []
    for team in teams_cursor:
        # Convert ObjectId to string if needed, or just exclude _id
        team["_id"] = str(team["_id"])
        
        # Ensure sensitive data is handled or sent if needed
        # We perform a shallow copy to safely modify if needed, but dict is fine
        teams.append(team)

    return jsonify({"success": True, "teams": teams})
