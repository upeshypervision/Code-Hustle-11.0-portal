from flask import request, jsonify
from datetime import datetime
from database import db
import jwt
from config import JWT_SECRET, JWT_ALGORITHM

# =========================
# AUTO-INCREMENT HELPER
# =========================
def get_next_problem_statement_id():
    counter = db.counters.find_one_and_update(
        {"_id": "problem_statement_id"},
        {"$inc": {"sequence_value": 1}},
        upsert=True,
        return_document=True
    )
    number = counter["sequence_value"]

    # Format with prefix and zero padding
    return f"PS{number:02d}"
    


# =========================
# CREATE PROBLEM STATEMENT
# =========================
def create_problem_statement_route():
    # Admin authentication
    token = request.cookies.get("admin_auth")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return jsonify({"error": "Invalid session"}), 401
    
    data = request.get_json()

    title = data.get("title")
    description = data.get("description")
    difficulty = data.get("difficulty")
    max_count = data.get("Max_Count")
    track = data.get("track")

    if not title or not description:
        return jsonify({"error": "Title and description are required"}), 400

    problem_statement_id = get_next_problem_statement_id()

    problem_statement = {
        "problem_statement_id": problem_statement_id,
        "title": title,
        "track":track,
        "description": description,
        "difficulty": difficulty,
        "max_count": max_count,
        "visible": True,
        "selections": 0,
        "created_at": datetime.utcnow()
    }

    db.problem_statements.insert_one(problem_statement)

    return jsonify({
        "success": True,
        "message": "Problem statement created successfully",
        "problem_statement_id": problem_statement_id
    }), 201


# =========================
# GET PROBLEM STATEMENT BY ID
# =========================
def get_problem_statement_by_id_route(problem_id):
    try:
        problem_id = int(problem_id)
    except ValueError:
        return jsonify({"error": "Invalid problem statement ID"}), 400

    problem = db.problem_statements.find_one(
        {"problem_statement_id": problem_id}
    )

    if not problem:
        return jsonify({"error": "Problem statement not found"}), 404

    problem["_id"] = str(problem["_id"])
    return jsonify(problem), 200


# =========================
# ADMIN: GET ALL PROBLEM STATEMENTS
# =========================
def get_all_problem_statements_route():
    ps_list = []

    for ps in db.problem_statements.find():
        ps["_id"] = str(ps["_id"])
        ps_list.append(ps)

    return jsonify(ps_list), 200

# =========================
# STUDENT: GET VISIBLE PROBLEM STATEMENTS
# =========================
def get_all_visible_problem_statements_route():
    ps_list = []

    cursor = db.problem_statements.find(
        {"visible": True},
        {
            "_id": 0,                # hide Mongo ID
            "created_at": 0,         # hide admin metadata
        }
    )
    for ps in cursor:
        ps_list.append({
            "problem_statement_id": ps["problem_statement_id"],
            "title": ps["title"],
            "track": ps.get("track", ""),
            "description": ps["description"],
            "difficulty": ps["difficulty"],
            "max_count": ps["max_count"],
            "selections": ps.get("selections", 0),
        })

    return jsonify({
        "success": True,
        "problem_statements": ps_list
    }), 200

def select_problem_statement_route():
    # =========================
    # 1. AUTH CHECK (Student)
    # ========================
    token = request.cookies.get("student_auth")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        team_id = payload.get("team_id")
        if not team_id:
            return jsonify({"error": "Invalid token"}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    # =========================
    # 2. INPUT VALIDATION
    # =========================
    data = request.get_json()
    problem_statement_id = data.get("problem_statement_id")

    if not problem_statement_id:
        return jsonify({"error": "Problem statement ID is required"}), 400

    # =========================
    # 3. FETCH PROBLEM STATEMENT
    # =========================
    ps = db.problem_statements.find_one({
        "problem_statement_id": problem_statement_id
    })

    if not ps:
        return jsonify({"error": "Problem statement not found"}), 404

    # =========================
    # 4. VISIBILITY CHECK
    # =========================
    if not ps.get("visible", False):
        return jsonify({"error": "Problem statement is not visible"}), 403

    # =========================
    # 5. MAX TEAM LIMIT CHECK
    # =========================
    max_count = ps.get("max_count")
    selections = ps.get("selections", 0)

    if max_count is not None and selections >= max_count:
        return jsonify({"error": "Problem statement selection limit reached"}), 409

    # =========================
    # 6. CHECK IF TEAM ALREADY SELECTED
    # =========================
    # Check ps_selections collection instead of teams table
    existing_selection = db.ps_selections.find_one({"team_id": team_id})
    
    if existing_selection:
        return jsonify({"error": "Team has already selected a problem statement"}), 409
    
    # =========================
    # 7. SAVE TO SEPARATE COLLECTION (SECURITY)
    # =========================
    # Fetch team name only for the selection record
    team = db.teams.find_one({"team_id": team_id}, {"team_name": 1, "_id": 0})
    
    if not team:
        return jsonify({"error": "Team not found"}), 404
    
    team_name = team.get("team_name", "Unknown")
    
    # Save to dedicated ps_selections collection (isolated data)
    selection_record = {
        "problem_statement_id": problem_statement_id,
        "team_id": team_id,
        "team_name": team_name,
        "selected_at": datetime.utcnow().isoformat() + "Z"
    }
    
    db.ps_selections.insert_one(selection_record)

    # Increment selection count
    db.problem_statements.update_one(
        {"problem_statement_id": problem_statement_id},
        {"$inc": {"selections": 1}}
    )

    return jsonify({
        "success": True,
        "message": "Problem statement selected successfully",
        "problem_statement_id": problem_statement_id
    }), 200

# =========================
# ADMIN: GET TEAMS BY PS
# =========================
def get_teams_by_ps_route(problem_statement_id):
    """
    Admin route to get all teams that selected a specific problem statement
    Returns team_id, team_name, and selection timestamp
    """
    # Admin authentication
    token = request.cookies.get("admin_auth")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return jsonify({"error": "Invalid session"}), 401
    
    # Fetch from ps_selections collection (isolated data)
    selections = list(db.ps_selections.find(
        {"problem_statement_id": problem_statement_id},
        {"_id": 0, "team_id": 1, "team_name": 1, "selected_at": 1}
    ).sort("selected_at", -1))  # Most recent first
    
    return jsonify({
        "success": True,
        "problem_statement_id": problem_statement_id,
        "teams": selections,
        "count": len(selections)
    }), 200

# =========================
# ADMIN: TOGGLE PROBLEM STATEMENT VISIBILITY
# =========================
def toggle_ps_visibility_route(problem_statement_id):
    """
    Admin route to toggle the visibility of a problem statement
    """
    # Admin authentication
    token = request.cookies.get("admin_auth")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return jsonify({"error": "Invalid session"}), 401
    
    # Find the problem statement
    ps = db.problem_statements.find_one({"problem_statement_id": problem_statement_id})
    
    if not ps:
        return jsonify({"error": "Problem statement not found"}), 404
    
    # Toggle visibility
    current_visibility = ps.get("visible", False)
    new_visibility = not current_visibility
    
    # Update in database
    result = db.problem_statements.update_one(
        {"problem_statement_id": problem_statement_id},
        {"$set": {"visible": new_visibility}}
    )
    
    if result.modified_count > 0:
        return jsonify({
            "success": True,
            "message": f"Problem statement visibility set to {new_visibility}",
            "visible": new_visibility
        }), 200
    else:
        return jsonify({"error": "Failed to update visibility"}), 500
