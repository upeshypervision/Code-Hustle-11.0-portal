import jwt
import datetime
import bcrypt
from flask import request, jsonify
from database import get_db
from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS

db = get_db()

def verify_password(stored_hash, password):
    return bcrypt.checkpw(password.encode(), stored_hash.encode())

def student_login_route():
    data = request.json or {}

    team_id = data.get("team_id", "").strip()
    password = data.get("password", "").strip()

    if not team_id or not password:
        return jsonify({"error": "Team ID and password required"}), 400

    team = db["teams"].find_one({"team_id": team_id})
    if not team or not verify_password(team["password_hashed"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    payload = {
        "team_id": team_id,
        "role": "student",
        "iat": datetime.datetime.now(datetime.timezone.utc),
        "exp": datetime.datetime.now(datetime.timezone.utc)
        + datetime.timedelta(hours=JWT_EXPIRE_HOURS)
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return jsonify({
        "success": True,
        "token": token,
        "team_id": team["team_id"],
        "leader": team["leader"],
        "members": team["members"],
        "hypervision_member": team.get("hypervision_member"),
        "status": team["status"]
    })

def admin_login_route():
    data = request.json or {}

    login_id = data.get("login_id", "").strip()
    password = data.get("password", "").strip()

    admin = db["admins"].find_one({"login_id": login_id})
    if not admin or not verify_password(admin["password_hashed"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    payload = {
        "login_id": login_id,
        "role": "admin",
        "iat": datetime.datetime.now(datetime.timezone.utc),
        "exp": datetime.datetime.now(datetime.timezone.utc)
        + datetime.timedelta(hours=JWT_EXPIRE_HOURS)
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return jsonify({"success": True, "token": token})

def setup_login_routes(app):
    app.route("/api/student-login", methods=["POST"])(student_login_route)
    app.route("/api/admin-login", methods=["POST"])(admin_login_route)
