from flask import jsonify, request
from database import get_db
import jwt
from config import JWT_SECRET, JWT_ALGORITHM

def fetch_teamsnosubmission():
    token = request.cookies.get('admin_auth')
    if not token:
            return jsonify({"error": "Unauthorized"}), 401
        
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return jsonify({"error": "Invalid session"}), 401

    db = get_db()
    
    # Get all teams with team_id and team_name
    all_teams = list(db.teams.find({}, {"_id": 0, "team_id": 1, "team_name": 1}))
    
    # Get team_ids that have submitted
    submitted_team_ids = set(db.github_submissions.distinct("team_id"))
    
    # Filter out teams that have already submitted
    notsubmitted_teams = [
        team for team in all_teams 
        if team["team_id"] not in submitted_team_ids
    ]

    return jsonify({"success": True, "teams": notsubmitted_teams})

def view_githubsubmission_route():
    token = request.cookies.get('admin_auth')
    if not token:
            return jsonify({"error": "Unauthorized"}), 401
        
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return jsonify({"error": "Invalid session"}), 401
    db = get_db()
    submitted_teams_cursor=db.github_submissions.find().sort("timestamp", -1)
    submitted_teams=[]
    for team in submitted_teams_cursor:
        # Convert ObjectId to string if needed, or just exclude _id
        team["_id"] = str(team["_id"])
        
        # Ensure sensitive data is handled or sent if needed
        # We perform a shallow copy to safely modify if needed, but dict is fine
        submitted_teams.append(team)
    return jsonify({"success": True, "teams": submitted_teams})