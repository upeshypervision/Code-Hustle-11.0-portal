from flask import jsonify, request
from database import get_db
from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
import razorpay
from datetime import datetime

db = get_db()

razor_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


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

    # -------------------------------------------------------
    # CREATE ORDER IN RAZORPAY
    # -------------------------------------------------------
    order = razor_client.order.create({
        "amount": amount * 100,   # Razorpay requires paise
        "currency": "INR",
        "payment_capture": 1
    })

    # 💾 SAVE TEAM AS 'PENDING PAYMENT' IMMEIDATELY
    # This ensures we don't lose data if frontend fails after payment
    db["teams"].insert_one({
        "team_id": team_id,
        "team_name": team_name,
        "leader": leader,
        "members": members,
        "hypervision_member": hypervision_member,
        "order_id": order["id"],
        "amount": amount,
        "status": "Pending Payment",
        "role": "student",
        "timestamp": datetime.utcnow().isoformat()
    })

    # -------------------------------------------------------
    # SEND RESPONSE BACK
    # -------------------------------------------------------
    return jsonify({
        "success": True,
        "order_id": order["id"],
        "amount": amount,
        "key_id": RAZORPAY_KEY_ID,
        "team_id": team_id
    })
