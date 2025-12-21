from flask import request, jsonify, session
from database import get_db

db = get_db()

# STUDENT LOGIN
def student_login_route():
    data = request.get_json(silent=True) or {}

    sapid = str(data.get("sapid", "")).strip()
    password = str(data.get("password", "")).strip()

    if not sapid or not password:
        return jsonify({"error": "SAP ID and password are required"}), 400

    # Same reversible hash used during registration
    password_hashed = password[::-1]

    team = db.teams.find_one({
        "$or": [
            {"leader.sapid": sapid},
            {"members.sapid": sapid}
        ],
        "password_hashed": password_hashed
    })

    if not team:
        return jsonify({"error": "Invalid SAP ID or password"}), 401

    # Create secure session
    session.clear()
    session["logged_in"] = True
    session["role"] = "student"
    session["team_id"] = team["team_id"]
    session["sapid"] = sapid

    return jsonify({
        "success": True,
        "role": "student",
        "team_id": team["team_id"]
    })

# ADMIN LOGIN
def admin_login_route():
    data = request.get_json(silent=True) or {}

    login_id = str(data.get("login_id", "")).strip()
    password = str(data.get("password", "")).strip()

    if not login_id or not password:
        return jsonify({"error": "Login ID and password are required"}), 400

    password_hashed = password[::-1]

    admin = db.admins.find_one({
        "login_id": login_id,
        "password_hashed": password_hashed
    })

    if not admin:
        return jsonify({"error": "Invalid Login ID or password"}), 401

    session.clear()
    session["logged_in"] = True
    session["role"] = "admin"
    session["login_id"] = login_id

    return jsonify({
        "success": True,
        "role": "admin"
    })


# ROUTE REGISTRATION
def setup_login_routes(app):
    app.route("/api/student-login", methods=["POST"])(student_login_route)
    app.route("/api/admin-login", methods=["POST"])(admin_login_route)