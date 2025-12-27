import jwt
import datetime
import bcrypt
from database import get_db
from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS
from flask import request, jsonify, make_response

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

    # --- SET COOKIE RESPONSE ---
    response = make_response(jsonify({
        "success": True,
        "message": "Login successful",
        "team_id": team["team_id"],
        "leader": team["leader"],
        "members": team["members"],
        "status": team["status"]
    }))
    
    response.set_cookie(
        'student_auth',
        token,
        httponly=True,        # Prevents XSS
        secure=False,         # set to True in production
        samesite='Lax',
        max_age=JWT_EXPIRE_HOURS * 3600
    )
    return response

def admin_login_route():
    data = request.json or {}
    login_id = data.get("login_id", "").strip()
    password = data.get("password", "").strip()

    admin = db["admins"].find_one({"login_id": login_id})
    if not admin or not verify_password(admin["password_hashed"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    # --- SESSION LIMIT LOGIC ---
    active_sessions = admin.get("sessions", [])
    now = datetime.datetime.now(datetime.timezone.utc).timestamp()
    active_sessions = [s for s in active_sessions if s['exp'] > now]

    if len(active_sessions) >= 2000:
        return jsonify({"error": "Maximum session limit reached (2 devices). Logout elsewhere first."}), 403

    # --- JWT GENERATION ---
    expire_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    payload = {
        "login_id": login_id,
        "role": "admin",
        "exp": expire_date
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    # Update DB with new session info
    db["admins"].update_one(
        {"_id": admin["_id"]},
        {"$push": {"sessions": {"token": token, "exp": expire_date.timestamp()}}}
    )

    # --- SET COOKIE RESPONSE ---
    response = make_response(jsonify({"success": True, "message": "Login successful"}))
    response.set_cookie(
        'admin_auth',
        token,
        httponly=True,        # Prevents XSS (JS can't see this)
        secure=False,          # Only sent over HTTPS (False for localhost)
        samesite='Lax',       # Lax is better for localhost than None (which needs Secure)
        max_age=7 * 24 * 60 * 60  # 7 days in seconds
    )
    return response

def check_auth_route():
    token = request.cookies.get('admin_auth')
    if not token:
        return jsonify({"authenticated": False}), 401
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return jsonify({"authenticated": True, "user": payload["login_id"]})
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({"authenticated": False}), 401

def check_student_auth_route():
    token = request.cookies.get('student_auth')
    if not token:
        return jsonify({"authenticated": False}), 401
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return jsonify({"authenticated": True, "team_id": payload["team_id"]})
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({"authenticated": False}), 401

def setup_login_routes(app):
    app.route("/api/student-login", methods=["POST"])(student_login_route)
    app.route("/api/admin-login", methods=["POST"])(admin_login_route)
    app.route("/api/check-auth", methods=["GET"])(check_auth_route)