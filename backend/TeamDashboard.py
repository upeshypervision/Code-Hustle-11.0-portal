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
        print("DEBUG: Token expired")
        return jsonify({"error": "Session expired (Backend)"}), 401
    except jwt.InvalidTokenError as e:
        print(f"DEBUG: Invalid token: {str(e)}")
        return jsonify({"error": f"Invalid token: {str(e)}"}), 401
    
    team = db.create_team.find_one({"team_id": team_id})
    print(f"DEBUG: Team found: {team is not None} for ID: {team_id}")
    
    if not team:
        return jsonify({"error": f"Team not found for ID: {team_id}"}), 404

    leader_data = team.get("leader", {})
    members_data = team.get("members", [])

    # Map to frontend structure expected by Incomp_Page.jsx
    dashboard_data = {
        "teamId": team.get("team_id"),  # For socket room joining
        "teamName": team.get("team_name", ""),
        "teamVision": team.get("team_bio", ""),
        "visible": team.get("visible", True),  # Team visibility status
        "leader": {
            "name": leader_data.get("full_name", ""),
            "details": leader_data.get("bio", ""),
            "university": leader_data.get("college_name", ""),
            "sapId": leader_data.get("sapid", ""),
            "email": leader_data.get("email", ""),
            # Removed: phone for privacy
        },
        "members": [
            {
                "id": idx + 1, # Simple ID generation
                "individual_id": m.get("individual_id", ""),  # Send individual_id if available
                "name": m.get("full_name", ""),
                "about": m.get("bio", ""),
                "university": m.get("college_name", ""),
                "email": m.get("email", ""),
                # Removed: phone for privacy
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

from socketio_instance import socketio

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
    
    # Get member ID/email and reason from request body
    data = request.json or {}
    individual_id = data.get("individual_id")
    member_email = data.get("email") # Fallback for original members
    reason = data.get("reason", "").strip()
    
    if not individual_id and not member_email:
        return jsonify({"error": "Member ID or Email required"}), 400

    # Only require 15-word reason for members who joined via request (have individual_id)
    if individual_id:
        if not reason or len(reason.split()) < 15:
            return jsonify({"error": "Reason must be at least 15 words"}), 400
    else:
        # For original members, reason is optional (will use default if not provided)
        if not reason:
            reason = "Original team member removed by team leader"
    
    # Get team name for the reason
    team_data = db.create_team.find_one({"team_id": team_id}, {"team_name": 1})
    team_name = team_data.get("team_name", "Team") if team_data else "Team"

    # CASE 1: Deleting by Individual ID (Joined via Request)
    if individual_id:
        # 1. Remove member from the team's members array
        result = db.create_team.update_one(
            {"team_id": team_id},
            {"$pull": {"members": {"individual_id": individual_id}}}
        )
        
        if result.modified_count == 0:
            # Try fallback to email if ID failed? Or just return error
            return jsonify({"error": "Member not found or already deleted"}), 404

        # 2. Update the individual's record
        individual = db.individuals.find_one({"individual_id": individual_id})
        
        if individual:
            formatted_reason = f"{team_name}: {reason}"
            db.individuals.update_one(
                {"individual_id": individual_id},
                {
                    "$unset": {"accepted": ""},     # Remove accepted status
                    "$pull": {"requested": team_id}, # Remove team from requested list
                    "$set": {"reason": formatted_reason} # Store removal reason
                }
            )

            # 3. Emit Socket Event for Real-time Update
            socketio.emit(
                'member_removed', 
                {
                    "reason": formatted_reason,
                    "teamName": team_name
                }, 
                room=f'individual_{individual_id}'
            )

    # CASE 2: Deleting by Email (Original Members / Fallback)
    elif member_email:
        # 1. Remove member from the team's members array
        result = db.create_team.update_one(
            {"team_id": team_id},
            {"$pull": {"members": {"email": member_email}}}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Member not found or already deleted"}), 404
            
        # Note: Original members don't have separate 'individuals' records to update
    
    return jsonify({"success": True, "message": "Member removed successfully"}), 200


def toggle_team_visibility(team_id):
    """
    Team route to toggle the visibility of their own team.
    Similar to problem statement visibility toggle.
    """
    # Team authentication (not admin)
    token = request.cookies.get("team_auth")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        authenticated_team_id = payload.get("team_id")
        
        # Verify the team is toggling their own visibility
        if authenticated_team_id != team_id:
            return jsonify({"error": "Unauthorized - can only toggle your own team visibility"}), 403
            
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid session"}), 401
    
    # Find the team in create_team collection
    team = db.create_team.find_one({"team_id": team_id})
    
    if not team:
        return jsonify({"error": "Team not found"}), 404
    
    # Toggle visibility
    current_visibility = team.get("visible", True)  # Default to True if not set
    new_visibility = not current_visibility
    
    # Update in database
    result = db.create_team.update_one(
        {"team_id": team_id},
        {"$set": {"visible": new_visibility}}
    )
    
    if result.modified_count == 0:
        return jsonify({"error": "Failed to update visibility"}), 500
    
    return jsonify({
        "success": True,
        "visible": new_visibility,
        "message": f"Team visibility set to {'visible' if new_visibility else 'hidden'}"
    }), 200
