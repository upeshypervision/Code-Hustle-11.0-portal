import jwt
import datetime
import bcrypt
from database import get_db
from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS, COOKIE_SECURE
from flask import request, jsonify, make_response

db = get_db()


#---KEY MATCHER---
def verify_password(stored_hash, password):
    return bcrypt.checkpw(password.encode(), stored_hash.encode())
    """
    'bcrypt' will compare the typed password
    with the scrambled version in database.
    """



#-----STUDENT LOGIN CHECK------P
def student_login_route():
    data = request.json or {}

    team_id = data.get("team_id", "").strip()
    password = data.get("password", "").strip()

    #identify: mandatory fields team_id and password.
    if not team_id or not password:
        return jsonify({"error": "Team ID and password required"}), 400

    #verify: check if password is correct using the Decoder.
    team = db["teams"].find_one({"team_id": team_id})
    if not team or not verify_password(team["password_hashed"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    #(JWT): if correct, the server generates a Token, containig user's ID and role.
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
        httponly=True,        # Prevents XSS (major security feature)
        secure=COOKIE_SECURE, # Auto-set based on environment
        samesite='Lax',         # Lax is better for localhost than None (which needs Secure)
        max_age=JWT_EXPIRE_HOURS * 3600     #ensure logged in time period for users using check_auth_route etc.
    )
    return response




#-----SPECIALISED LOGIN for admin with 'Session Limit'----
def admin_login_route():    
    data = request.json or {}

    #identify: mandotary fields
    login_id = data.get("login_id", "").strip()
    password = data.get("password", "").strip()

    #verify credentials:
    admin = db["admins"].find_one({"login_id": login_id})
    if not admin or not verify_password(admin["password_hashed"], password):
        return jsonify({"error": "Invalid credentials"}), 401


    # --- SESSION LIMIT LOGIC ---
    #ensure admin's log in time period.
    """
    extra logic: unlike students, admin can login through max 2 devices simultaneously.
    using Session Limit -> 'sessions' list in database.
    """
    active_sessions = admin.get("sessions", [])
    now = datetime.datetime.now(datetime.timezone.utc).timestamp()
    active_sessions = [s for s in active_sessions if s['exp'] > now]

    
    if len(active_sessions) >= 2:
        return jsonify({"error": "Maximum session limit reached (2 devices). Logout elsewhere first."}), 403




    # --- JWT GENERATION ---
    expire_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    payload = {
        "login_id": login_id,
        "role": "admin",
        "exp": expire_date
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    # Update DB with new session info after expiry
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
        secure=COOKIE_SECURE, # Auto-set based on environment
        samesite='Lax',       # Lax is better for localhost than None (which needs Secure)
        max_age=7 * 24 * 60 * 60  # 7 days in seconds
    )
    return response





#----LOOKS IN ADMIN'S BROWSER FOR SPECIFIC COOKIE(admin_auth)-----
def check_auth_route():
    token = request.cookies.get('admin_auth')
    if not token:
        return jsonify({"authenticated": False}), 401
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        #JWT_SECRET: a secret key only personal server knows to 'unlock' the token.
        return jsonify({"authenticated": True, "user": payload["login_id"]})
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({"authenticated": False}), 401





#----LOOKS IN USER'S BROWSER FOR SPECIFIC COOKIE(student_auth)-----
def check_student_auth_route():
    #Search
    token = request.cookies.get('student_auth')
    if not token:
        return jsonify({"authenticated": False}), 401
    
    try:
        #Verify using 'JWT_SECRET'
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return jsonify({"authenticated": True, "team_id": payload["team_id"]})
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({"authenticated": False}), 401





#----LOOKS IN EVALUATOR'S BROWSER FOR SPEACIFIC COOKIE(student_auth)-----
def evaluator_login_route():
    data = request.json or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    # Query the 'evaluator' table
    try:
        evaluator = db["evaluator"].find_one({"username": username})
        
        if not evaluator:
             return jsonify({"error": "Invalid credentials"}), 401

        # UNIQUE LOGIC: Check if password field exists:-
        # it prevents the server from crashing if ecaluator account was set up incorrecly
        if "password" not in evaluator:
            return jsonify({"error": "Invalid credentials"}), 401

        stored_hash = evaluator["password"]
        
        # Verify password (handle both string and bytes for stored_hash)
        if isinstance(stored_hash, bytes):
            stored_hash = stored_hash.decode('utf-8')
            
        if not verify_password(stored_hash, password):
            return jsonify({"error": "Invalid credentials"}), 401

    except Exception:
        return jsonify({"error": "Internal Server Error"}), 500

    # --- JWT GENERATION ---
    expire_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=12) # 12 hour session
    payload = {
        "username": username,
        "role": "evaluator",
        "exp": expire_date
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    # --- SET COOKIE RESPONSE ---
    response = make_response(jsonify({"success": True, "message": "Login successful"}))
    response.set_cookie(
        'evaluator_auth',
        token,
        httponly=True,        # Prevents XSS
        secure=COOKIE_SECURE, # Auto-set based on environment
        samesite='Lax',
        max_age=12 * 3600     # 12 hours in seconds(expiration)
    )
    return response






#---STUDENTS WHO HAVEN'T JOINED ANY TEAM-------
def individual_login_route():
    data = request.json or {}

    individual_id = data.get("individual_id", "").strip()
    password = data.get("password", "").strip()

    if not individual_id or not password:
        return jsonify({"error": "Individual ID and password required"}), 400

    individual = db["individuals"].find_one({"individual_id": individual_id})
    
    if not individual or not verify_password(individual["password_hashed"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    payload = {             #DISPLAY INDIVIDUAL DASHBOARD
        "individual_id": individual_id,
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
        "individual_id": individual["individual_id"],
        "full_name": individual.get("full_name", ""),
        "email": individual.get("email", ""),
        "phone": individual.get("phone", ""),
        "university_type": individual.get("university_type", ""),
        "sapid": individual.get("sapid"),
        "college_name": individual.get("college_name"),
        "about": individual.get("about", "")
    }))

    response.set_cookie(
        'individual_auth',
        token,
        httponly=True,        # Prevents XSS
        secure=COOKIE_SECURE, # Auto-set based on environment
        samesite='Lax',
        max_age=JWT_EXPIRE_HOURS * 3600
    )
    return response






#----CUSTOM TEAMS CREATED THROUGH "CREATE TEAM"----------
def team_login_route():
    """
    Login route for teams created via Create_team.py (stored in create_team collection)
    """
    data = request.json or {}
    
    team_id = data.get("team_id", "").strip()
    password = data.get("password", "").strip()
    
    if not team_id or not password:
        return jsonify({"error": "Team ID and password required"}), 400
    
    # Look up team in create_team collection
    team = db["create_team"].find_one({"team_id": team_id})
    
    if not team:
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Verify LEADER'S password (leader has the login credentials)
    leader = team.get("leader", {})
    if not leader or not verify_password(leader.get("password_hash", ""), password):
        return jsonify({"error": "Invalid credentials"}), 401
    
    payload = {
        "team_id": team_id,
        "role": "team_leader",
        "iat": datetime.datetime.now(datetime.timezone.utc),
        "exp": datetime.datetime.now(datetime.timezone.utc)
        + datetime.timedelta(hours=JWT_EXPIRE_HOURS)
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    # Return team data
    response = make_response(jsonify({
        "success": True,
        "message": "Login successful",
        "team_id": team["team_id"],
        "team_name": team.get("team_name", ""),
        "team_bio": team.get("team_bio", ""),
        "leader": leader,
        "members": team.get("members", [])
    }))
    
    response.set_cookie(
        'team_auth',
        token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite='Lax',
        max_age=JWT_EXPIRE_HOURS * 3600
    )
    return response





#-------SILENT SECURITY SCANNERS(avoid multiple Individual login while chnging pages: by sending cookies)---------
def check_individual_auth_route():
    #Scan:Look for cookie 'individual_auth'
    token = request.cookies.get('individual_auth')
    if not token:
        return jsonify({"authenticated": False}), 401
    
    try:
        #Decoding: uses server's secret key to open the token
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return jsonify({"authenticated": True, "individual_id": payload["individual_id"]})
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({"authenticated": False}), 401





#-------SIMILARY FOR TEAM LEADERS/MEMBERS(avoid multiple login)
def check_team_auth_route():
    #Scan: Look for cookie 'team_auth'
    token = request.cookies.get('team_auth')
    if not token:
        return jsonify({"authenticated": False}), 401
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return jsonify({"authenticated": True, "team_id": payload["team_id"]})
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({"authenticated": False}), 401
