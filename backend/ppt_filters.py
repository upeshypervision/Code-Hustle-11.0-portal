# backend/ppt_filters.py
from flask import jsonify, request
from database import get_db
import jwt
from config import JWT_SECRET, JWT_ALGORITHM

def get_teams_without_ppt_route():
    """
    GET route to fetch teams that have NOT submitted a PPT yet
    Used by Manual PPT component to show which teams need submissions
    """
    # Admin authentication
    token = request.cookies.get('admin_auth')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return jsonify({"error": "Invalid session"}), 401
    
    try:
        db = get_db()
        
        # Get all teams
        all_teams = list(db.teams.find({}, {"_id": 0, "team_id": 1, "team_name": 1}))
        
        # Get all team_ids that have submitted PPTs
        submitted_team_ids = set(
            doc["team_id"] for doc in db.ppt_submissions.find({}, {"team_id": 1})
        )
        
        # Filter out teams that have already submitted
        teams_without_ppt = [
            team for team in all_teams 
            if team["team_id"] not in submitted_team_ids
        ]
        
        return jsonify({
            "success": True,
            "teams": teams_without_ppt,
            "count": len(teams_without_ppt)
        }), 200
        
    except Exception as e:
        print(f"Error fetching teams without PPT: {str(e)}")
        return jsonify({"success": False, "error": "Internal server error"}), 500


def get_teams_with_ppt_route():
    """
    GET route to fetch teams that HAVE submitted a PPT
    Used by View Submissions component to show submitted PPTs
    Returns team info along with submission details
    """
    # Admin authentication
    token = request.cookies.get('admin_auth')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return jsonify({"error": "Invalid session"}), 401
    
    try:
        db = get_db()
        
        # Get all submissions with team info
        submissions = list(db.ppt_submissions.find({}, {"_id": 0}))
        
        # Enrich with team names
        teams_with_submissions = []
        for submission in submissions:
            team_id = submission.get("team_id")
            team = db.teams.find_one({"team_id": team_id}, {"team_name": 1, "_id": 0})
            
            if team:
                teams_with_submissions.append({
                    "team_id": team_id,
                    "team_name": team.get("team_name"),
                    "file_name": submission.get("file_name"),
                    "file_path": submission.get("file_path"),
                    "submitted_at": submission.get("submitted_at")
                })
        
        return jsonify({
            "success": True,
            "teams": teams_with_submissions,
            "count": len(teams_with_submissions)
        }), 200
        
    except Exception as e:
        print(f"Error fetching teams with PPT: {str(e)}")
        return jsonify({"success": False, "error": "Internal server error"}), 500


# --- NEW: view_details function ---
def view_details_route():
    # Admin authentication
    admin_token = request.cookies.get('admin_auth')
    if not admin_token:
        return jsonify({"success": False, "error": "Admin authentication required"}), 401

    try:
        jwt.decode(admin_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "error": "Admin session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "error": "Invalid admin session"}), 401

    # Get team_id from request arguments
    team_id = request.args.get('team_id')
    if not team_id:
        return jsonify({"success": False, "error": "team_id parameter is required"}), 400

    try:
        db = get_db()
        
        # Find the team by team_id, excluding sensitive fields like password_hashed
        team_details = db["teams"].find_one(
            {"team_id": team_id},
            {"_id": 0, "password_hashed": 0} # Exclude the password hash
        )
        
        if not team_details:
            return jsonify({"success": False, "error": "Team not found"}), 404
        
        return jsonify({
            "success": True,
            "team": team_details
        }), 200

    except Exception as e:
        print(f"Error fetching team details: {str(e)}")
        return jsonify({"success": False, "error": "Internal server error"}), 500