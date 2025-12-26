from flask import jsonify, request
from database import get_db
from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
import razorpay, random, string
import bcrypt

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
# MAIN REGISTRATION ROUTE
# -------------------------------------------------------
def register_team_route():
    data = request.json

    leader = data["leader"]
    members = data["members"]
    team_name = data.get("team_name") # Optional: Validated if needed
    hypervision_member = data["hypervision_member"]
    amount = data["amount"]

    # VALIDATION: HyperVision SAPID must be inside team
    team_sapids = [leader["sapid"]] + [m["sapid"] for m in members]

    if hypervision_member and hypervision_member["sapid"] not in team_sapids:
        return jsonify({"error": "HyperVision SAPID must belong to the team"}), 400

    # -------------------------------------------------------
    # UNIQUE TEAM ID (AUTO-INCREMENTING)
    # -------------------------------------------------------
    team_id = get_next_team_id()

    # -------------------------------------------------------
    # PASSWORD GENERATION (6 CHAR)
    # -------------------------------------------------------
    # generate random password
    password_plain = ''.join(
        random.choices(string.ascii_letters + string.digits, k=6)
    )

    # hash using bcrypt
    password_hashed = bcrypt.hashpw(
        password_plain.encode(),
        bcrypt.gensalt()
    ).decode()

    print("Generated password:", password_plain)
    print("Hashed password:", password_hashed)
    # reversible custom hash

    # -------------------------------------------------------
    # CREATE ORDER IN RAZORPAY
    # -------------------------------------------------------
    order = razor_client.order.create({
        "amount": amount * 100,   # Razorpay requires paise
        "currency": "INR",
        "payment_capture": 1
    })

    # -------------------------------------------------------
    # SEND RESPONSE BACK
    # -------------------------------------------------------
    return jsonify({
        "success": True,
        "order_id": order["id"],
        "amount": amount,
        "key_id": RAZORPAY_KEY_ID,
        "team_id": team_id,
        "password_plain": password_plain,
        "password_hashed": password_hashed
    })
