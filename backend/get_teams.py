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
    all_teams=db.teams.distinct("team_id")
    submitted_teams=db.github_submissions.distinct("team_id")
    print(submitted_teams)
    print(all_teams)
    notsubmitted_teams=[teams for teams in all_teams if teams not in submitted_teams]

    return jsonify({"success":True,"teams":notsubmitted_teams})

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