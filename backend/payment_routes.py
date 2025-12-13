from flask import request, jsonify
from datetime import datetime
from database import get_db
from email_service import send_registration_email

db = get_db()

def save_payment_route():
    data = request.json

    team_id = data["team_id"]
    password_plain = data["password_plain"]
    password_hashed = password_plain[::-1]  # same reversible hash

    leader = data["leader"]
    members = data["members"]
    hypervision_member = data["hypervision_member"]
    payment_id = data["payment_id"]
    order_id = data["order_id"]
    amount = data["amount"]

    db["teams"].insert_one({
        "team_id": team_id,
        "password_hashed": password_hashed,
        "leader": leader,
        "members": members,
        "hypervision_member": hypervision_member,
        "payment_id": payment_id,
        "order_id": order_id,
        "amount": amount,
        "status": "Paid",
        "timestamp": datetime.utcnow().isoformat(),
        "role": "student"
    })

    send_registration_email(leader["email"], team_id, password_plain)

    return jsonify({"success": True})
