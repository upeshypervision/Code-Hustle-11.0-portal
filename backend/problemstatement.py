from flask import request, jsonify
from datetime import datetime
from database import db


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
