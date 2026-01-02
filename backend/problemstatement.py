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
    print(cursor)
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
    # =========================
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
    team = db.teams.find_one({"team_id": team_id})

    if not team:
        return jsonify({"error": "Team not found"}), 404

    if team.get("selected_problem_statement"):
        return jsonify({"error": "Team has already selected a problem statement"}), 409

    # =========================
    # 7. ATOMIC UPDATE (SAFE)
    # =========================
    # Update team
    db.teams.update_one(
        {"team_id": team_id},
        {"$set": {"selected_problem_statement": problem_statement_id}}
    )

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

#to disable single ps
def toggle_problem_statement_visibility_route(problem_statement_id):
    ps = db.problem_statements.find_one({
        "problem_statement_id": problem_statement_id
    })

    if not ps:
        return jsonify({"error": "Problem statement not found"}), 404

    new_visibility = not ps.get("visible", True)

    db.problem_statements.update_one(
        {"problem_statement_id": problem_statement_id},
        {"$set": {"visible": new_visibility}}
    )

    return jsonify({
        "success": True,
        "problem_statement_id": problem_statement_id,
        "visible": new_visibility
    }), 200
