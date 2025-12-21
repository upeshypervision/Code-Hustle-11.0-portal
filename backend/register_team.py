from flask import jsonify, request
from database import get_db
from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
import razorpay, random, string, datetime

db = get_db()
razor_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def get_next_team_id():
    counter = db["counters"].find_one_and_update(
        {"_id": "teamid"},
        {"$inc": {"sequence_value": 3}},
        upsert=True,
        return_document=True
    )
    return f"Codehustle{counter['sequence_value']:03d}"

def register_team_route():
    data = request.get_json()
    leader = data.get("leader")
    members = data.get("members", [])
    amount = data.get("amount", 500)

    try:
        team_id = get_next_team_id()
        password_plain = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
        
        # Create Razorpay Order
        order = razor_client.order.create({
            "amount": int(amount * 100), # Amount in paise
            "currency": "INR",
            "payment_capture": 1
        })

        return jsonify({
            "success": True,
            "order_id": order["id"],
            "amount": amount,
            "key_id": RAZORPAY_KEY_ID,
            "team_id": team_id,
            "password_plain": password_plain
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def save_payment_route():
    data = request.get_json()
    try:
        db["registrations"].insert_one({
            "team_id": data.get("team_id"),
            "leader": data.get("leader"),
            "members": data.get("members"),
            "payment_id": data.get("payment_id"),
            "order_id": data.get("order_id"),
            "status": "paid",
            "created_at": datetime.datetime.utcnow()
        })
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500