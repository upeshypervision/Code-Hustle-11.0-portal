"""
Admin Routes - Consolidated admin viewing and filtering operations
Combines: view_create_teams.py, view_individuals.py, ppt_review.py, ppt_filters.py
"""
from flask import request, jsonify
from database import get_db
from datetime import datetime
from socketio_instance import socketio
import jwt
from config import JWT_SECRET, JWT_ALGORITHM


# ============================================================================
# ADMIN AUTHENTICATION HELPER
# ============================================================================

def verify_admin_auth():
    """Helper function to verify admin authentication"""
    token = request.cookies.get("admin_auth")
    if not token:
        return False
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return True
    except:
        return False


# ============================================================================
# VIEW CREATE TEAMS
# ============================================================================

def get_all_create_teams_route():
    """Admin route to get all teams from create_team collection."""
    if not verify_admin_auth():
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db()
    
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

    return jsonify({"success": True, "teams": teams_list}), 200


def delete_create_team_route(team_id):
    """Admin route to delete a team by team_id."""
    if not verify_admin_auth():
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db()
    result = db.create_team.delete_one({"team_id": team_id})
    
    if result.deleted_count == 0:
        return jsonify({"error": "Team not found"}), 404
        
    return jsonify({"success": True, "message": "Team deleted successfully"}), 200


# ============================================================================
# VIEW INDIVIDUALS
# ============================================================================

def get_all_individuals_route():
    """Admin route to get all individuals."""
    if not verify_admin_auth():
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db()
    
    cursor = db.individuals.find({}, {
        "_id": 0,
        "individual_id": 1,
        "full_name": 1,
        "email": 1,
        "phone": 1,
        "created_at": 1,
        "accepted": 1,
        "reason": 1
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
                    "memberCount": 1 + len(team.get("members", []))
                }
        
        individuals.append(individual_data)

    return jsonify({"success": True, "individuals": individuals}), 200


def delete_individual_route(individual_id):
    """Admin route to delete an individual by individual_id."""
    if not verify_admin_auth():
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db()
    result = db.individuals.delete_one({"individual_id": individual_id})
    
    if result.deleted_count == 0:
        return jsonify({"error": "Individual not found"}), 404
        
    return jsonify({"success": True, "message": "Individual deleted successfully"}), 200


# ============================================================================
# PPT REVIEW
# ============================================================================

def get_evaluated_submissions_route():
    """Admin route to get all evaluated PPT submissions sorted by marks."""
    db = get_db()
    
    try:
        evaluated_submissions = list(db.ppt_submissions.find(
            {"marks": {"$exists": True, "$ne": None, "$ne": ""}},
            {"_id": 0}
        ).sort("marks", -1))
        
        # Fetch team names
        team_ids = [sub["team_id"] for sub in evaluated_submissions]
        teams_info = list(db.teams.find(
            {"team_id": {"$in": team_ids}}, 
            {"team_id": 1, "team_name": 1, "_id": 0}
        ))
        
        team_map = {t["team_id"]: t.get("team_name", "Unknown") for t in teams_info}
        
        for sub in evaluated_submissions:
            sub["team_name"] = team_map.get(sub["team_id"], "Unknown Team")
        
        return jsonify({"success": True, "submissions": evaluated_submissions}), 200
        
    except Exception as e:
        print(f"Error fetching evaluated submissions: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": "Internal Server Error"}), 500


def update_ppt_approval_route():
    """Admin route to update PPT approval status (approve/reject/revoke)."""
    db = get_db()
    
    data = request.json
    team_id = data.get("team_id")
    action = data.get("action")
    
    if not team_id or not action:
        return jsonify({"success": False, "error": "team_id and action are required"}), 400
    
    if action not in ["approve", "reject", "revoke"]:
        return jsonify({"success": False, "error": "Invalid action"}), 400
    
    try:
        if action == "approve":
            new_status = "approved"
        elif action == "reject":
            new_status = "rejected"
        elif action == "revoke":
            new_status = "rejected"
        
        result = db.ppt_submissions.update_one(
            {"team_id": team_id},
            {
                "$set": {
                    "approval_status": new_status,
                    "approved_at": datetime.utcnow().isoformat() + "Z" if action == "approve" else None
                }
            }
        )
        
        if result.matched_count == 0:
            return jsonify({"success": False, "error": "Submission not found"}), 404
        
        socketio.emit("ppt_approval_updated", {
            "team_id": team_id,
            "new_status": new_status
        })
        
        return jsonify({
            "success": True,
            "message": f"Submission {action}d successfully",
            "new_status": new_status
        }), 200
        
    except Exception as e:
        print(f"Error updating approval status: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": "Internal Server Error"}), 500


# ============================================================================
# PPT FILTERS
# ============================================================================

def get_teams_without_ppt_route():
    """Admin route to fetch teams that have NOT submitted a PPT yet."""
    if not verify_admin_auth():
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        db = get_db()
        
        all_teams = list(db.teams.find({}, {"_id": 0, "team_id": 1, "team_name": 1}))
        submitted_team_ids = set(
            doc["team_id"] for doc in db.ppt_submissions.find({}, {"team_id": 1})
        )
        
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
    """Admin route to fetch teams that HAVE submitted a PPT."""
    if not verify_admin_auth():
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        db = get_db()
        
        submissions = list(db.ppt_submissions.find({}, {"_id": 0}))
        
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


def view_details_route():
    """Admin route to view team details by team_id."""
    if not verify_admin_auth():
        return jsonify({"success": False, "error": "Admin authentication required"}), 401

    team_id = request.args.get('team_id')
    if not team_id:
        return jsonify({"success": False, "error": "team_id parameter is required"}), 400

    try:
        db = get_db()
        
        team_details = db["teams"].find_one(
            {"team_id": team_id},
            {"_id": 0, "password_hashed": 0}
        )
        
        if not team_details:
            return jsonify({"success": False, "error": "Team not found"}), 404
        
        return jsonify({"success": True, "team": team_details}), 200

    except Exception as e:
        print(f"Error fetching team details: {str(e)}")
        return jsonify({"success": False, "error": "Internal server error"}), 500
