from flask import jsonify, request
from database import get_db
from datetime import datetime
import jwt
import bcrypt
import random
import string
from config import JWT_SECRET, JWT_ALGORITHM
from email_service import send_registration_email
from s3_service import upload_file_to_s3, allowed_file, is_valid_file_size, get_content_type
from socketio_instance import socketio
import json
db = get_db()

# -------------------------------------------------------
# TEAM ID AUTO INCREMENT (PREFIX + JUMP BY 3)
# -------------------------------------------------------
def get_next_team_id():
    counter = db["counters"].find_one_and_update(
        {"_id": "teamid"},
        {"$inc": {"sequence_value": 3}},     # increment by 3 every time
        upsert=True,
        return_document=True
    )

    new_num = counter["sequence_value"]

    # FORMAT → Codehustle001 / Codehustle004 / Codehustle007 ...
    return f"Codehustle{new_num:03d}"


# -------------------------------------------------------
# CHECK TEAM NAME ROUTE
# -------------------------------------------------------
def check_team_name_route():
    data = request.json
    team_name = data.get("team_name")
    
    if not team_name:
        return jsonify({"exists": False, "error": "No name provided"}), 400

    # CASE-INSENSITIVE CHECK (Optional but recommended)
    # Using regex for case insensitivity: {'$regex': f'^{team_name}$', '$options': 'i'}
    existing = db["teams"].find_one({"team_name": {"$regex": f"^{team_name.strip()}$", "$options": "i"}})
    
    if existing:
        return jsonify({"exists": True})
    
    return jsonify({"exists": False})


# -------------------------------------------------------
# MAIN REGISTRATION ROUTE
# -------------------------------------------------------
def register_team_route():
    # Check if this is a multipart form request (with file) or JSON request (without file)
    if request.content_type and 'multipart/form-data' in request.content_type:
        # Handle file upload along with team registration
        if 'data' not in request.form:
            return jsonify({"success": False, "error": "Missing team data in request."}), 400

        if 'payment_screenshot' not in request.files:
            return jsonify({"success": False, "error": "Missing payment screenshot in request."}), 400

        try:
            # Parse the JSON string from the 'data' field
            team_data_json = request.form['data']
            data = json.loads(team_data_json)
        except (ValueError, TypeError) as e:
            return jsonify({"success": False, "error": "Invalid JSON format in data field."}), 400

        # Extract individual fields from parsed JSON
        leader = data.get("leader")
        members = data.get("members", [])
        team_name = data.get("team_name", "").strip()
        hypervision_member = data.get("hypervision_member")
        amount = data.get("amount", 450)  # Default to 450 if not provided

        # Validation checks
        if not team_name:
            return jsonify({"success": False, "error": "Team Name is required"}), 400

        if not leader or not members:
            return jsonify({"success": False, "error": "Leader and members data are required"}), 400

        # Duplicate team name check
        if db["teams"].find_one({"team_name": {"$regex": f"^{team_name}$", "$options": "i"}}):
            return jsonify({"success": False, "error": "Team name already taken"}), 400

        # Validation: HyperVision SAPID must be inside team (if applicable)
        if hypervision_member:
            team_sapids = [leader["sapid"]] + [m["sapid"] for m in members]
            if hypervision_member.get("sapid") not in team_sapids:
                return jsonify({"success": False, "error": "HyperVision SAPID must belong to the team"}), 400

        # Generate unique team ID
        team_id = get_next_team_id()

        # Generate password
        password_plain = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
        password_hashed = bcrypt.hashpw(password_plain.encode(), bcrypt.gensalt()).decode()

        # Handle payment screenshot upload
        file = request.files['payment_screenshot']
        if file.filename == '':
            return jsonify({"success": False, "error": "No payment screenshot selected."}), 400

        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({"success": False, "error": "Invalid file type. Only PNG, JPG, JPEG, GIF files are allowed for payment screenshots."}), 400

        # Validate file size
        if not is_valid_file_size(file):
            return jsonify({"success": False, "error": "File size exceeds 5MB limit."}), 400

        # Prepare S3 upload
        content_type = get_content_type(file.filename)
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        s3_key = f"payment_screenshots/{team_id}/{file.filename.rsplit('/', 1)[-1]}_{timestamp}"

        # Upload to S3
        payment_s3_url = upload_file_to_s3(file.read(), s3_key, content_type)
        if not payment_s3_url:
            return jsonify({"success": False, "error": "Failed to upload payment screenshot to S3."}), 500

        # Prepare team document - NOW INCLUDING PASSWORD_HASHED
        team_doc = {
            "team_id": team_id,
            "team_name": team_name,
            "leader": leader,
            "members": members,
            "hypervision_member": hypervision_member,
            "amount": amount,
            "payment_screenshot": payment_s3_url,
            "payment_status": "Submitted for Review",
            "status": "Payment Pending Review",
            "role": "student",
            "timestamp": datetime.utcnow().isoformat(),
            "password_hashed": password_hashed  # Add hashed password
        }

        # Insert team data into database
        try:
            result = db["teams"].insert_one(team_doc)
            if result.inserted_id:
                # Send registration email
                try:
                    send_registration_email(leader["email"], team_id, password_plain)
                except Exception as e:
                    print(f"Failed to send email: {e}")

                # Emit WebSocket event for admin notification
                socketio.emit("payment_submitted", {
                    "team_id": team_id,
                    "submitted_at": team_doc["timestamp"]
                })
                
                return jsonify({
                    "success": True,
                    "team_id": team_id,
                    "amount": amount,
                    "message": "Team registered successfully with payment screenshot submitted for review",
                    "payment_screenshot_url": payment_s3_url
                })
            else:
                return jsonify({"success": False, "error": "Failed to save team data to database."}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Database error: {str(e)}"}), 500
    else:
        # Original JSON-only registration path
        data = request.json
        leader = data["leader"]
        members = data["members"]
        team_name = data.get("team_name", "").strip() 
        hypervision_member = data["hypervision_member"]

        if not team_name:
            return jsonify({"error": "Team Name is required"}), 400

        # -------------------------------------------------------
        # DUPLICATE TEAM NAME CHECK (Double Safety)
        # -------------------------------------------------------
        if db["teams"].find_one({"team_name": {"$regex": f"^{team_name}$", "$options": "i"}}):
            return jsonify({"error": "Team name already taken"}), 400

        amount = 380 if hypervision_member else 450

        # VALIDATION: HyperVision SAPID must be inside team
        team_sapids = [leader["sapid"]] + [m["sapid"] for m in members]

        if hypervision_member and hypervision_member["sapid"] not in team_sapids:
            return jsonify({"error": "HyperVision SAPID must belong to the team"}), 400

        # -------------------------------------------------------
        # UNIQUE TEAM ID (AUTO-INCREMENTING)
        # -------------------------------------------------------
        team_id = get_next_team_id()

        # Generate password
        password_plain = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
        password_hashed = bcrypt.hashpw(password_plain.encode(), bcrypt.gensalt()).decode()

        # 💾 SAVE TEAM WITH 'CONFIRMED' STATUS (No payment needed)
        team_doc = {
            "team_id": team_id,
            "team_name": team_name,
            "leader": leader,
            "members": members,
            "hypervision_member": hypervision_member,
            "amount": amount,
            "status": "Confirmed",  # Changed from "Pending Payment" to "Confirmed"
            "role": "student",
            "timestamp": datetime.utcnow().isoformat(),
            "password_hashed": password_hashed
        }
        
        result = db["teams"].insert_one(team_doc)

        # Send registration email
        try:
            send_registration_email(leader["email"], team_id, password_plain)
        except Exception as e:
            print(f"Failed to send email: {e}")

        # -------------------------------------------------------
        # SEND RESPONSE BACK
        # -------------------------------------------------------
        return jsonify({
            "success": True,
            "team_id": team_id,
            "amount": amount,
            "message": "Team registered successfully"
        })    

# -------------------------------------------------------
# MANUAL TEAM REGISTRATION BY ADMIN
# -------------------------------------------------------
def register_manual_team_route():
    # 1. VERIFY ADMIN AUTH
    token = request.cookies.get('admin_auth')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        admin_id = payload["login_id"]
    except:
        return jsonify({"error": "Invalid session"}), 401

    data = request.json
    leader = data["leader"]
    members = data["members"]
    team_name = data.get("team_name", "").strip()

    if not team_name:
        return jsonify({"error": "Team Name is required"}), 400

    # 2. DUPLICATE CHECK
    if db["teams"].find_one({"team_name": {"$regex": f"^{team_name}$", "$options": "i"}}):
        return jsonify({"error": "Team name already taken"}), 400

    # 3. GENERATE CREDENTIALS
    team_id = get_next_team_id()
    password_plain = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    password_hashed = bcrypt.hashpw(password_plain.encode(), bcrypt.gensalt()).decode()

    # 4. INSERT INTO DB
    db["teams"].insert_one({
        "team_id": team_id,
        "team_name": team_name,
        "leader": leader,
        "members": members,
        "hypervision_member": None,
        "order_id": "MANUAL_ENTRY",
        "payment_id": "MANUAL_ENTRY",
        "amount": 0,
        "password_hashed": password_hashed,
        "status": f"Manual by Admin {admin_id}",
        "role": "student",
        "timestamp": datetime.utcnow().isoformat()
    })

    # 5. SEND EMAIL
    try:
        send_registration_email(leader["email"], team_id, password_plain)
    except Exception as e:
        print(f"Failed to send email: {e}")

    return jsonify({
        "success": True,
        "message": "Team added manually",
        "team_id": team_id,
        "password": password_plain
    })
