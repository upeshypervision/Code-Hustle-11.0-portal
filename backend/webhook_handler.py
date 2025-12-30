from flask import request, jsonify
from database import get_db
from config import RAZORPAY_WEBHOOK_SECRET
import hmac
import hashlib
import json
from datetime import datetime
import random
import string
import bcrypt

db = get_db()

def verify_webhook_signature(payload, signature, secret):
    """
    Verify Razorpay webhook signature
    """
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)

def razorpay_webhook_handler():
    """
    Handle Razorpay webhook events
    Provides server-to-server payment confirmation
    """
    
    # Get raw payload and signature
    payload = request.get_data()
    signature = request.headers.get('X-Razorpay-Signature', '')
    

    
    # 🔐 VERIFY WEBHOOK SIGNATURE
    if not verify_webhook_signature(payload, signature, RAZORPAY_WEBHOOK_SECRET):
        return jsonify({"error": "Invalid signature"}), 400
    
    
    # Parse webhook data
    try:
        event = json.loads(payload)
    except:
        return jsonify({"error": "Invalid JSON"}), 400
    
    event_type = event.get('event')
    
    # 📝 LOG WEBHOOK EVENT (for audit trail)
    db["webhook_logs"].insert_one({
        "event": event_type,
        "payload": event,
        "timestamp": datetime.utcnow().isoformat(),
        "processed": False
    })
    print("webhook worked")
    
    # Handle different event types
    if event_type == 'payment.captured' or event_type == 'order.paid':
        return handle_payment_captured(event)
    
    elif event_type == 'payment.failed':
        return handle_payment_failed(event)
    
    # Acknowledge other events
    return jsonify({"status": "received"}), 200

def handle_payment_captured(event):
    """
    Handle successful payment capture
    """
    payment = event.get('payload', {}).get('payment', {}).get('entity', {})
    
    payment_id = payment.get('id')
    order_id = payment.get('order_id')
    amount = payment.get('amount', 0) // 100  # Convert paise to rupees
    
    if not payment_id or not order_id:
        return jsonify({"error": "Missing payment details"}), 400
    
    # Check if team already exists with this payment
    existing_team = db["teams"].find_one({"payment_id": payment_id})
    
    if existing_team:
        db["teams"].update_one(
            {"payment_id": payment_id},
            {"$set": {
                "webhook_confirmed": True,
                "webhook_confirmed_at": datetime.utcnow().isoformat()
            }}
        )
        
        db["webhook_logs"].update_one(
            {"payload.payload.payment.entity.id": payment_id},
            {"$set": {"processed": True}}
        )
        return jsonify({"status": "updated"}), 200
    
    # 🕵️‍♂️ LOOK FOR PENDING TEAM BY ORDER ID
    # This handles the case where frontend failed but we saved "Pending Payment" earlier
    pending_team = db["teams"].find_one({"order_id": order_id})
    
    if pending_team:
        # 🔑 GENERATE PASSWORD (IT WAS NOT GENERATED YET)
        password_plain = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
        password_hashed = bcrypt.hashpw(password_plain.encode(), bcrypt.gensalt()).decode()
        print(password_plain)
        
        db["teams"].update_one(
            {"order_id": order_id},
            {"$set": {
                "status": "Paid",
                "payment_id": payment_id,
                "password_hashed": password_hashed,
                "webhook_confirmed": True,
                "webhook_confirmed_at": datetime.utcnow().isoformat()
            }}
        )
        
        db["webhook_logs"].update_one(
            {"payload.payload.payment.entity.id": payment_id},
            {"$set": {
                "processed": True, 
                "note": "Activated pending team via webhook"
            }}
        )
        
        # 📧 HERE YOU WOULD SEND THE EMAIL WITH PASSWORD_PLAIN
        # send_email(pending_team['leader']['email'], pending_team['team_id'], password_plain)
        
        return jsonify({"status": "activated_pending_team"}), 200
        
    else:
        # True orphan payment - no pending record found
        db["webhook_logs"].update_one(
            {"payload.payload.payment.entity.id": payment_id},
            {"$set": {
                "processed": True,
                "note": "Payment captured but NO pending team found - manual review needed"
            }}
        )
        
        return jsonify({"status": "logged_for_review"}), 200

def handle_payment_failed(event):
    """
    Handle failed payment (optional)
    """
    payment = event.get('payload', {}).get('payment', {}).get('entity', {})
    payment_id = payment.get('id')
    
    # Log failed payment for analytics
    db["webhook_logs"].update_one(
        {"payload.payload.payment.entity.id": payment_id},
        {"$set": {"processed": True, "status": "failed"}}
    )
    
    return jsonify({"status": "logged"}), 200
