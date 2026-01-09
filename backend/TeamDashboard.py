from flask import jsonify, request
from database import db
from sanitizer import sanitize_output_data
import jwt
from config import JWT_SECRET, JWT_ALGORITHM

def get_team_dashboard_data():
    """
    Fetch team data for the Team Dashboard (Incomp_Page.jsx).
    Uses the 'team_auth' secure cookie to identify the team.
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
    
    team = db.create_team.find_one({"team_id": team_id})
    
    if not team:
        return jsonify({"error": "Team not found"}), 404

    leader_data = team.get("leader", {})
    members_data = team.get("members", [])

    # Map to frontend structure expected by Incomp_Page.jsx
    dashboard_data = {
        "teamId": team.get("team_id"),  # For socket room joining
        "teamName": team.get("team_name", ""),
        "teamVision": team.get("team_bio", ""),
        "leader": {
            "name": leader_data.get("full_name", ""),
            "details": leader_data.get("bio", ""),
            "university": leader_data.get("college_name", ""),
            "sapId": leader_data.get("sapid", ""),
            "email": leader_data.get("email", ""),
            "phone": leader_data.get("phone", ""),
            # Add other fields if needed
        },
        "members": [
            {
                "id": idx + 1, # Simple ID generation
                "name": m.get("full_name", ""),
                "about": m.get("bio", ""),
                "university": m.get("college_name", ""),
                "email": m.get("email", ""),
                "phone": m.get("phone", ""),
                "joinedViaRequest": m.get("joinedViaRequest", False),  # Include the flag
                "full_name": m.get("full_name", ""),  # Also include for table display
                "college_name": m.get("college_name", ""),
                "bio": m.get("bio", "")
            }
            for idx, m in enumerate(members_data)
        ],
        # Placeholder for future logic
        "joinedMembers": [], 
        "joinRequests": [] 
    }
    
    return jsonify(sanitize_output_data(dashboard_data)), 200

def delete_team_member():
    """
    Delete a member from the team's members array in the database.
    Uses cookie authentication to verify team ownership.
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
    
    # Get member email from request body
    data = request.json or {}
    member_email = data.get("email")
    
    if not member_email:
        return jsonify({"error": "Member email required"}), 400
    
    # Remove member from the members array
    result = db.create_team.update_one(
        {"team_id": team_id},
        {"$pull": {"members": {"email": member_email}}}
    )
    
    if result.modified_count == 0:
        return jsonify({"error": "Member not found or already deleted"}), 404
    
    return jsonify({"success": True, "message": "Member deleted successfully"}), 200
