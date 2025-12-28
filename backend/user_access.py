from flask import request, jsonify
import jwt
from database import get_db
from config import JWT_SECRET, JWT_ALGORITHM

db = get_db()

def get_user_info_route():
    """
    Endpoint to get current user information.
    Returns team_name for students or login_id for admins.
    """
    # Check for student auth cookie
    student_token = request.cookies.get('student_auth')
    admin_token = request.cookies.get('admin_auth')
    
    if student_token:
        try:
            payload = jwt.decode(student_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            team_id = payload.get("team_id")
            
            # Fetch team data from database
            team = db["teams"].find_one({"team_id": team_id})
            if team:
                return jsonify({
                    "success": True,
                    "role": "student",
                    "team_name": team.get("team_name", "Unknown Team"),
                    "team_id": team_id
                }), 200
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
    
    elif admin_token:
        try:
            payload = jwt.decode(admin_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            login_id = payload.get("login_id")
            
            return jsonify({
                "success": True,
                "role": "admin",
                "login_id": login_id
            }), 200
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
    
    return jsonify({"error": "Not authenticated"}), 401


def fetch_teams_route():
    """
    Secure admin-only route to fetch all registered teams.
    Excludes sensitive fields like hashed passwords.
    """
    # 1. Verify Admin Authentication
    token = request.cookies.get('admin_auth')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    # 2. Fetch Teams from DB
    try:
        # Sort by _id descending (Last In, First Out) which effectively sorts by creation time
        teams_cursor = db["teams"].find({}, {"_id": 0, "password_hashed": 0}).sort("_id", -1)
        teams = list(teams_cursor)
        
        return jsonify({
            "success": True, 
            "teams": teams,
            "count": len(teams)
        }), 200
        
    except Exception as e:
        print(f"Error fetching teams: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500
