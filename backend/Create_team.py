from flask import jsonify, request
from database import get_db
from datetime import datetime
import bcrypt
import random
import string
from config import JWT_SECRET, JWT_ALGORITHM
# Import the specific team email function
from email_service import send_team_registration_email

db = get_db()

def get_next_team_id():
    counter = db["counters"].find_one_and_update(
        {"_id": "create_id"},
        {"$inc": {"sequence_value": 1}},  # Increment by 1 for each new team
        upsert=True,
        return_document=True
    )
    new_num = counter["sequence_value"]
    print(f"Generated Team Counter Value: {new_num}") # Debug print
    return f"TM{new_num:03d}" 

# Remove the get_next_temp_member_id function as it's no longer needed for members

def create_team_route():
    print("--- Starting create_team_route ---") # Debug print
    data = request.json
    print(f"Received data: {data}") # Debug print

    required_top_fields = ["tName", "tBio", "lName", "lAbout", "universityType", "email", "phone"]
    for field in required_top_fields:
        if field not in data or not str(data[field]).strip():
            print(f"Missing required field: {field}") # Debug print
            return jsonify({"error": f"{field} is required"}), 400

    team_name = data["tName"].strip()
    team_bio = data["tBio"].strip()
    leader_name = data["lName"].strip()
    leader_about = data["lAbout"].strip()
    university_type = data["universityType"].strip().lower()
    leader_email = data["email"].strip().lower()
    leader_phone = data["phone"].strip()

    print(f"Parsed leader data: Name={leader_name}, Email={leader_email}, Phone={leader_phone}, University={university_type}") # Debug print
    print(f"Parsed team data: Name={team_name}, Bio={team_bio}") # Debug print

    # Validate email format without regex
    if "@" not in leader_email or "." not in leader_email.split("@")[-1]:
        print("Invalid leader email format") # Debug print
        return jsonify({"error": "Invalid email format"}), 400

    # Validate phone number length without regex
    if not leader_phone.isdigit() or len(leader_phone) != 10:
        print("Invalid leader phone number length") # Debug print
        return jsonify({"error": "Phone number must be 10 digits"}), 400

    # OPTIONAL SAP / COLLEGE
    leader_sapid = None
    leader_college_name = None

    if "sap" in data and str(data["sap"]).strip():
        if university_type == "upes":
            # Validate SAP ID length without regex
            if not data["sap"].strip().isdigit() or len(data["sap"].strip()) != 9:
                print("Invalid leader SAP ID length") # Debug print
                return jsonify({"error": "SAP ID must be 9 digits"}), 400
            leader_sapid = data["sap"].strip()
        else:
            leader_college_name = data["sap"].strip()
    print(f"Parsed leader SAP/College: SAPID={leader_sapid}, CollegeName={leader_college_name}") # Debug print

    members = []
    sap_ids_in_team = [leader_sapid] if leader_sapid else []
    print(f"Initial SAP IDs in team: {sap_ids_in_team}") # Debug print

    for i in range(1, 5):
        m_key = f"m{i}"
        if m_key in data and data[m_key].get("fullName"):
            m = data[m_key]
            print(f"Processing member {m_key}: {m}") # Debug print

            required_member_fields = ["fullName", "bio", "universityType", "email", "phone"]
            for field in required_member_fields:
                if field not in m or not str(m[field]).strip():
                    print(f"Member {m_key} missing required field: {field}") # Debug print
                    return jsonify({"error": f"{field} is required for {m_key}"}), 400

            # Validate email format without regex
            member_email = m["email"].strip().lower()
            if "@" not in member_email or "." not in member_email.split("@")[-1]:
                print(f"Invalid email format for member {m_key}") # Debug print
                return jsonify({"error": f"Invalid email for {m_key}"}), 400

            # Validate phone number length without regex
            member_phone = m["phone"].strip()
            if not member_phone.isdigit() or len(member_phone) != 10:
                print(f"Invalid phone number length for member {m_key}") # Debug print
                return jsonify({"error": f"Phone must be 10 digits for {m_key}"}), 400

            m_sapid = None
            m_college = None

            if "sapid" in m and str(m["sapid"]).strip():
                if m["universityType"].lower() == "upes":
                    # Validate SAP ID length without regex
                    if not m["sapid"].isdigit() or len(m["sapid"]) != 9:
                        print(f"Invalid SAP ID length for member {m_key}") # Debug print
                        return jsonify({"error": f"SAP ID must be 9 digits for {m_key}"}), 400
                    if m["sapid"] in sap_ids_in_team:
                        print(f"Duplicate SAP ID {m['sapid']} for member {m_key}") # Debug print
                        return jsonify({"error": f"Duplicate SAP ID in team"}), 400
                    m_sapid = m["sapid"]
                    sap_ids_in_team.append(m_sapid)
                    print(f"Added SAP ID {m_sapid} to team list. Current list: {sap_ids_in_team}") # Debug print
                else:
                    m_college = m["sapid"]

            members.append({
                # Temporarily store member data without ID or password
                "full_name": m["fullName"].strip(),
                "bio": m["bio"].strip(),
                "university_type": m["universityType"].strip().lower(),
                "email": member_email,
                "phone": member_phone,
                "sapid": m_sapid,
                "college_name": m_college
            })
            print(f"Added member {m_key} data to list. Total members so far: {len(members)}") # Debug print

    if len(members) < 1:
        print("Less than 1 member provided") # Debug print
        return jsonify({"error": "At least one member is required"}), 400

    # --- Generate Team ID ---
    team_id = get_next_team_id()
    print(f"Generated Team ID: {team_id}") # Debug print

    # --- Generate Password for Leader ---
    leader_password_plain = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    leader_password_hashed = bcrypt.hashpw(leader_password_plain.encode(), bcrypt.gensalt()).decode()
    print(f"Generated leader password (plain): {leader_password_plain}") # Debug print

    # --- Create Leader Object (Still gets an ID) ---
    leader_obj = {
        "member_id": get_next_team_id()[2:], # Reusing team_id counter prefix CH, taking the number part - e.g., CH0007 -> 0007. Or use a separate counter if distinct leader IDs are needed.
        "full_name": leader_name,
        "bio": leader_about,
        "email": leader_email,
        "phone": leader_phone,
        "university_type": university_type,
        "sapid": leader_sapid,
        "college_name": leader_college_name,
        "password_hash": leader_password_hashed
    }
    print(f"Leader object prepared: {leader_obj}") # Debug print

    # --- Process and Add Members with Passwords (NO member_id) ---
    processed_members = []
    member_passwords_to_send = [] # Store plain text passwords for emails
    for m_data in members:
        member_password_plain = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
        member_password_hashed = bcrypt.hashpw(member_password_plain.encode(), bcrypt.gensalt()).decode()
        print(f"Generated member password (plain): {member_password_plain}") # Debug print

        processed_member = {
            # NO "member_id" field added here
            "full_name": m_data["full_name"],
            "bio": m_data["bio"],
            "university_type": m_data["university_type"],
            "email": m_data["email"],
            "phone": m_data["phone"],
            "sapid": m_data["sapid"],
            "college_name": m_data["college_name"],
            "password_hash": member_password_hashed
        }
        processed_members.append(processed_member)
        member_passwords_to_send.append(member_password_plain) # Add plain text to list
        print(f"Processed member data: {processed_member}") # Debug print

    # --- Create Team Document ---
    team_doc = {
        "team_id": team_id, # Uses CHxxxx
        "team_name": team_name,
        "team_bio": team_bio,
        "leader": leader_obj, # Leader has an ID
        "members": processed_members, # Members do NOT have member_id
        "created_at": datetime.utcnow().isoformat() # Add creation timestamp
    }
    print(f"Final team document to insert: {team_doc}") # Debug print

    # --- Insert into Database ---
    print("Attempting to insert document into 'create_team' collection...") # Debug print
    try:
        result = db["create_team"].insert_one(team_doc)
        print(f"InsertOneResult acknowledged: {result.acknowledged}") # Debug print
        print(f"Inserted ID: {result.inserted_id}") # Debug print

        if result.acknowledged and result.inserted_id:
            print(f"Document successfully inserted with ID: {result.inserted_id}") # Debug print
            # --- Send Emails After DB Insertion ---
            try:
                # Send email to leader using the specific team email function
                send_team_registration_email(
                    email_address=leader_email, # Use the correct parameter name
                    team_id=team_id, # Use team_id as identifier in email
                    password=leader_password_plain # Send plain text password
                )
                print(f"Email sent to leader: {leader_email}")

                # Send emails to members using the stored plain text passwords and the specific team email function
                for i, m_obj in enumerate(processed_members):
                    send_team_registration_email(
                        email_address=m_obj["email"], # Use the correct parameter name
                        team_id=team_id, # Use team_id as identifier in email
                        password=member_passwords_to_send[i] # Send the correct plain text password
                    )
                    print(f"Email sent to member: {m_obj['email']}")

            except Exception as e:
                # Log the error but don't fail the registration if email fails
                print(f"Failed to send registration emails: {str(e)}")

            return jsonify({
                "success": True,
                "message": "Team created successfully",
                "team_id": team_id
            }), 200
        else:
            print("InsertOne operation was not acknowledged or no ID returned.") # Debug print
            return jsonify({"error": "Failed to create team (insertion not acknowledged)"}), 500

    except Exception as e:
        print(f"Database insertion error: {e}") # Debug print
        return jsonify({"error": f"Failed to create team due to database error: {str(e)}"}), 500

    # This line should theoretically not be reached if the logic above is correct
    print("Unexpected end of function reached!") # Debug print
    return jsonify({"error": "Unexpected error in team creation"}), 500