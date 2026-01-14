from flask import request, jsonify
from database import get_db
from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
import razorpay
import bcrypt
import random
import string
from datetime import datetime
from email_service import send_registration_email

db = get_db()
razor_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def verify_payment_route():
    data = request.json
    
    #  STEP 1: VERIFY RAZORPAY SIGNATURE (CRITICAL SECURITY CHECK)
    try:
        razor_client.utility.verify_payment_signature({
            "razorpay_order_id": data["razorpay_order_id"],
            "razorpay_payment_id": data["razorpay_payment_id"],
            "razorpay_signature": data["razorpay_signature"]
        })
    except razorpay.errors.SignatureVerificationError:
        return jsonify({"success": False, "error": "Payment signature verification failed"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": "Verification error"}), 400

    # PAYMENT VERIFIED - NOW SAFE TO PROCEED
    
    # Check if payment already processed (prevent duplicate)
    existing = db["teams"].find_one({"payment_id": data["razorpay_payment_id"]})
    if existing:
        return jsonify({"success": False, "error": "Payment already processed"}), 400
    
    #  FETCH ORDER FROM RAZORPAY TO GET VERIFIED AMOUNT (DON'T TRUST FRONTEND)
    try:
        order = razor_client.order.fetch(data["razorpay_order_id"])
        verified_amount = order["amount"] // 100  # Convert paise to rupees
    except Exception as e:
        return jsonify({"success": False, "error": "Could not verify order details"}), 400
    
    #  GENERATE PASSWORD (ONLY AFTER VERIFICATION)
    password_plain = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    password_hashed = bcrypt.hashpw(password_plain.encode(), bcrypt.gensalt()).decode()
    print(password_plain)

    team_payload = data["teamPayload"]
    
    # UPDATE PENDING TEAM TO PAID
    # We find the team by order_id (saved during registration)
    
    result = db["teams"].update_one(
        {"order_id": data["razorpay_order_id"]},
        {"$set": {
            "payment_id": data["razorpay_payment_id"],
            "amount": verified_amount,  # 🔒 VERIFIED AMOUNT 
            "password_hashed": password_hashed,
            "status": "Paid",
            "timestamp": datetime.utcnow().isoformat() # Update timestamp to payment time
        }}
    )

    if result.matched_count == 0:
        # Fallback: If for some reason pending record is missing (should not happen)
        # We handle gracefully or insert fresh (but let's stick to update for consistency)
        return jsonify({"success": False, "error": "Registration session expired or invalid"}), 400

    print("it worked verified ")
    #  Send email
    try:
        send_registration_email(team_payload["leader"]["email"], team_payload["team_id"], password_plain)
    except Exception as e:
        print(f"Failed to send email: {e}")

    return jsonify({
        "success": True,
        "team_id": team_payload["team_id"],
        "password": password_plain
    })
