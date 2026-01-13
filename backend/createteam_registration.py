from flask import jsonify, request
from database import get_db
from datetime import datetime
import bcrypt
import random
import string
from email_service import send_team_registration_email
from sanitizer import sanitize_team_data

db = get_db()

def get_next_team_id():
    counter = db["counters"].find_one_and_update(
        {"_id": "create_id"},
        {"$inc": {"sequence_value": 1}},  # Increment by 1 for each new team
        upsert=True,
        return_document=True
    )
    new_num = counter["sequence_value"]
    return f"TM{new_num:03d}" 

# Remove the get_next_temp_member_id function as it's no longer needed for members

def create_team_route():
    data = request.json
    
    # SECURITY: Sanitize all input data before processing
    data = sanitize_team_data(data)
    
    required_top_fields = ["tName", "tBio", "lName", "lAbout", "universityType", "email", "phone"]
    for field in required_top_fields:
        if field not in data or not str(data[field]).strip():
            return jsonify({"error": f"{field} is required"}), 400

    team_name = data["tName"].strip()
    team_bio = data["tBio"].strip()
    leader_name = data["lName"].strip()
    leader_about = data["lAbout"].strip()
    university_type = data["universityType"].strip().lower()
    leader_email = data["email"].strip().lower()
    leader_phone = data["phone"].strip()

    # Validate phone number length without regex
    if not leader_phone.isdigit() or len(leader_phone) != 10:
        return jsonify({"error": "Phone number must be 10 digits"}), 400

    # OPTIONAL SAP / COLLEGE
    leader_sapid = None
    leader_college_name = None

    if "sap" in data and str(data["sap"]).strip():
        if university_type == "upes":
            # Validate SAP ID length without regex
            if not data["sap"].strip().isdigit() or len(data["sap"].strip()) != 9:
                return jsonify({"error": "SAP ID must be 9 digits"}), 400
            leader_sapid = data["sap"].strip()
            leader_college_name = "UPES"  # Store "UPES" as college name
        else:
            leader_college_name = data["sap"].strip()

    members = []
    sap_ids_in_team = [leader_sapid] if leader_sapid else []
    emails_in_team = [leader_email]  # Track emails to prevent duplicates
    phones_in_team = [leader_phone]  # Track phones to prevent duplicates

    for i in range(1, 5):
        m_key = f"m{i}"
        if m_key in data and data[m_key].get("fullName"):
            m = data[m_key]

            required_member_fields = ["fullName", "bio", "universityType", "email", "phone"]
            for field in required_member_fields:
                if field not in m or not str(m[field]).strip():
                    return jsonify({"error": f"{field} is required for {m_key}"}), 400

            member_email = m["email"].strip().lower()
            
            # Check for duplicate email
            if member_email in emails_in_team:
                return jsonify({"error": f"Duplicate email found in team members"}), 400
            emails_in_team.append(member_email)

            # Validate phone number length without regex
            member_phone = m["phone"].strip()
            if not member_phone.isdigit() or len(member_phone) != 10:
                return jsonify({"error": f"Phone must be 10 digits for {m_key}"}), 400
            
            # Check for duplicate phone
            if member_phone in phones_in_team:
                return jsonify({"error": f"Duplicate phone number found in team members"}), 400
            phones_in_team.append(member_phone)

            m_sapid = None
            m_college = None

            if "sapid" in m and str(m["sapid"]).strip():
                if m["universityType"].lower() == "upes":
                    # Validate SAP ID length without regex
                    if not m["sapid"].isdigit() or len(m["sapid"]) != 9:
                        return jsonify({"error": f"SAP ID must be 9 digits for {m_key}"}), 400
                    if m["sapid"] in sap_ids_in_team:
                        return jsonify({"error": f"Duplicate SAP ID in team"}), 400
                    m_sapid = m["sapid"]
                    sap_ids_in_team.append(m_sapid)
                    m_college = "UPES"  # Store "UPES" as college name
                else:
                    m_college = m["sapid"]

            members.append({
                # Temporarily store member data without ID or password
                "full_name": m["fullName"].strip(),
                "bio": m["bio"].strip(),
                "email": member_email,
                "phone": member_phone,
                "sapid": m_sapid,
                "college_name": m_college
            })

    # DUPLICATE TEAM NAME CHECK
    existing_team = db["create_team"].find_one(
        {"team_name": {"$regex": f"^{team_name}$", "$options": "i"}}
    )
    if existing_team:
        return jsonify({
            "error": "Team name already exists. Choose a unique team name."
        }), 400

    # --- Generate Team ID ---
    team_id = get_next_team_id()
    
    # --- Generate Password for Leader ---
    leader_password_plain = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    leader_password_hashed = bcrypt.hashpw(leader_password_plain.encode(), bcrypt.gensalt()).decode()

    # --- Create Leader Object (Still gets an ID) ---
    leader_obj = {
        "full_name": leader_name,
        "bio": leader_about,
        "email": leader_email,
        "phone": leader_phone,
        "sapid": leader_sapid,
        "college_name": leader_college_name,
        "password_hash": leader_password_hashed
    }

    # --- Process and Add Members with Passwords (NO member_id) ---
    processed_members = []
    member_passwords_to_send = [] # Store plain text passwords for emails
    for m_data in members:
        member_password_plain = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
        member_password_hashed = bcrypt.hashpw(member_password_plain.encode(), bcrypt.gensalt()).decode()

        processed_member = {
            # NO "member_id" field added here
            "full_name": m_data["full_name"],
            "bio": m_data["bio"],
            "email": m_data["email"],
            "phone": m_data["phone"],
            "sapid": m_data["sapid"],
            "college_name": m_data["college_name"],
            "password_hash": member_password_hashed
        }
        processed_members.append(processed_member)
        member_passwords_to_send.append(member_password_plain) # Add plain text to list

    # --- Create Team Document ---
    team_doc = {
        "team_id": team_id, # Uses CHxxxx
        "team_name": team_name,
        "team_bio": team_bio,
        "leader": leader_obj, # Leader has an ID
        "members": processed_members, # Members do NOT have member_id
        "visible": False,  # New teams are hidden by default
        "created_at": datetime.utcnow().isoformat() # Add creation timestamp
    }

    try:
        result = db["create_team"].insert_one(team_doc)

        if result.acknowledged and result.inserted_id:
            # --- Send Emails After DB Insertion ---
            try:
                # Send email to leader only
                send_team_registration_email(
                    email_address=leader_email,
                    team_id=team_id,
                    password=leader_password_plain
                )

            except Exception as e:
                # Log the error but don't fail the registration if email fails
                print(f"Failed to send registration email: {str(e)}")

            return jsonify({
                "success": True,
                "message": "Team created successfully",
                "team_id": team_id
            }), 200
        else:
            return jsonify({"error": "Failed to create team (insertion not acknowledged)"}), 500

    except Exception as e:
        return jsonify({"error": f"Failed to create team due to database error: {str(e)}"}), 500

    # This line should theoretically not be reached if the logic above is correct
    print("Unexpected end of function reached!") # Debug print
    return jsonify({"error": "Unexpected error in team creation"}), 500