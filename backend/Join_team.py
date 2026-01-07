from flask import jsonify, request
from database import get_db
from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
import razorpay
from datetime import datetime
import jwt
import bcrypt
import random
import string
from config import JWT_SECRET, JWT_ALGORITHM
from email_service import send_individual_registration_email # Import the new function

db = get_db()

razor_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


def get_next_individual_id():
    counter = db["counters"].find_one_and_update(
        {"_id": "individual_id"},
        {"$inc": {"sequence_value": 1}},
        upsert=True,
        return_document=True
    )
    new_num = counter["sequence_value"]
    return f"IND{new_num:03d}"


def register_individual_route():
    data = request.json or {}

    # ----------------------------
    # REQUIRED FIELD VALIDATION (Removed 'hypervisionId')
    # ----------------------------
    required_fields = ["fullName", "about", "universityType", "email", "phone"]
    for field in required_fields:
        if not data.get(field) or not str(data[field]).strip():
            return jsonify({"error": f"{field} is required"}), 400

    full_name = data["fullName"].strip()
    about = data["about"].strip()
    university_type = data["universityType"].strip().lower()
    email = data["email"].strip().lower()
    phone = data["phone"].strip()
    
    # Handle optional hypervisionId
    hypervision_id = data.get("hypervisionId", "").strip()
    hypervision_member = None # Initialize as None

    # ----------------------------
    # HYPERVISION VALIDATION (Optional but strict if provided)
    # ----------------------------
    if hypervision_id: # Only check if an ID was provided
        hypervision_member = db["hypervision_members"].find_one(
            {"hypervision_id": hypervision_id}
        )
        if not hypervision_member:
            return jsonify({"error": "Invalid HyperVision ID"}), 400
    # If hypervision_id is empty, hypervision_member remains None

    # ----------------------------
    # UNIVERSITY VALIDATION
    # ----------------------------
    sapid = None
    college_name = None

    if university_type == "upes":
        sapid = str(data.get("sapid", "")).strip()
        if not sapid:
            return jsonify({"error": "sapid is required for UPES students"}), 400
    else:
        college_name = str(data.get("collegeName", "")).strip()
        if not college_name:
            return jsonify({"error": "collegeName is required for non-UPES students"}), 400

    # ----------------------------
    # DUPLICATE EMAIL CHECK
    # ----------------------------
    if db["individual"].find_one({"email": email}) \
       or db["teams"].find_one({"leader.email": email}):
        return jsonify({"error": "Email already registered"}), 400

    # ----------------------------
    # GENERATE INDIVIDUAL ID AND CREDENTIALS
    # ----------------------------
    individual_id = get_next_individual_id()
    password_plain = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    password_hashed = bcrypt.hashpw(password_plain.encode(), bcrypt.gensalt()).decode()

    # ----------------------------
    # SAVE DIRECTLY (NO PAYMENT)
    # ----------------------------
    db["individual"].insert_one({
        "individual_id": individual_id,
        "full_name": full_name,
        "about": about,
        "university_type": university_type,
        "email": email,
        "phone": phone,
        # Store the hypervision_id as provided (could be empty string)
        # Or store as None if you prefer explicit null values
        "hypervision_id": hypervision_id or None, 
        "sapid": sapid,
        "college_name": college_name,
        "password_hashed": password_hashed, # Store the hashed password
        "amount": 0,
        "status": "Joined",
        "role": "individual",
        "timestamp": datetime.utcnow().isoformat()
    })

    # Optional: Send a confirmation email with credentials using the new function
    try:
        send_individual_registration_email(
            email_address=email, # Use the email from the form
            individual_id=individual_id, # Use the generated ID
            password=password_plain # Use the generated password
        )
    except Exception as e:
        print(f"Failed to send join confirmation email: {e}")
        # Don't fail the registration if email fails

    return jsonify({
        "success": True,
        "individual_id": individual_id,
        "password": password_plain, # Return the plain text password
        "message": "Joined successfully"
    })