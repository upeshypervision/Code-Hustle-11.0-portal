from flask import request, jsonify
from datetime import datetime
from database import get_db
from email_service import send_registration_email
import random
import string
import bcrypt
db = get_db()

def save_payment_route():
    data = request.json

    team_id = data["team_id"
    password_plain = ''.join(
        random.choices(string.ascii_letters + string.digits, k=6)
    )
    password_hashed = bcrypt.hashpw(
        password_plain.encode(),
        bcrypt.gensalt()
    ).decode()

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

    #send_registration_email(leader["email"], team_id, password_plain)

    return jsonify({"success": True})
