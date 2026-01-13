"""
Secure chat service for individual-team communication
Handles real-time messaging with proper authentication and authorization
"""
from flask import request, jsonify
from database import get_db
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
import bleach
import time
from datetime import datetime
from socketio_instance import socketio

# Rate limiting: track message counts per user
message_rate_limiter = {}  # {user_id: [(timestamp, count), ...]}

def sanitize_chat_message(message: str) -> str:
    """
    Sanitize chat message by removing dangerous HTML/scripts
    but preserving normal characters (apostrophes, quotes, etc.)
    
    Uses bleach.clean() to strip tags WITHOUT html.escape()
    React will handle XSS prevention when rendering
    """
    if not isinstance(message, str):
        message = str(message)
    
    # Remove leading/trailing whitespace
    message = message.strip()
    
    # Use bleach to strip ALL HTML tags and attributes
    # This removes <script>, <img>, etc. but keeps normal text
    message = bleach.clean(
        message,
        tags=[],  # No tags allowed
        attributes={},  # No attributes allowed
        strip=True  # Strip tags instead of escaping
    )
    
    # Limit message length
    max_length = 1000
    if len(message) > max_length:
        message = message[:max_length]
    
    return message


def check_rate_limit(user_id: str) -> bool:
    """
    Check if user has exceeded rate limit (30 messages per minute)
    Returns True if allowed, False if rate limited
    """
    now = time.time()
    one_minute_ago = now - 60
    
    # Initialize if new user
    if user_id not in message_rate_limiter:
        message_rate_limiter[user_id] = []
    
    # Clean old entries (older than 1 minute)
    message_rate_limiter[user_id] = [
        ts for ts in message_rate_limiter[user_id] if ts > one_minute_ago
    ]
    
    # Check count
    if len(message_rate_limiter[user_id]) >= 30:
        return False
    
    # Add current timestamp
    message_rate_limiter[user_id].append(now)
    return True


def can_chat(user_type: str, user_id: str, target_type: str, target_id: str) -> bool:
    """
    Verify user has permission to chat with target.
    Returns True only if there's an active join request relationship.
    """
    db = get_db()
    
    if user_type == "individual" and target_type == "team":
        individual = db.individuals.find_one({"individual_id": user_id})
        if not individual:
            return False
        
        # Check if target_id is in requested array or accepted
        requested = individual.get("requested", [])
        accepted = individual.get("accepted")
        return target_id in requested or accepted == target_id
    
    elif user_type == "team" and target_type == "individual":
        team = db.create_team.find_one({"team_id": user_id})
        if not team:
            return False
        
        # Check if target_id is in requests array or members
        requests = team.get("requests", [])
        members = team.get("members", [])
        
        # Check if in requests
        if target_id in requests:
            return True
        
        # Check if in members (accepted individuals)
        for member in members:
            if member.get("individual_id") == target_id:
                return True
        
        return False
    
    return False


def generate_conversation_id(individual_id: str, team_id: str) -> str:
    """Generate consistent conversation ID for individual-team pair"""
    return f"CONV_{team_id}_{individual_id}"


def send_message():
    """
    Send a chat message
    POST /api/chat/send
    Body: {
        recipient_id: "TM035" or "IND048",
        recipient_type: "team" or "individual",
        message: "Hello!"
    }
    """
    # Check authentication
    individual_token = request.cookies.get("individual_auth")
    team_token = request.cookies.get("team_auth")
    
    if not individual_token and not team_token:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Determine sender type and ID
    sender_type = None
    sender_id = None
    
    try:
        if individual_token:
            payload = jwt.decode(individual_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            sender_id = payload.get("individual_id")
            sender_type = "individual"
        elif team_token:
            payload = jwt.decode(team_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            sender_id = payload.get("team_id")
            sender_type = "team"
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    
    if not sender_id or not sender_type:
        return jsonify({"error": "Invalid token payload"}), 401
    
    # Get request data
    data = request.json or {}
    recipient_id = data.get("recipient_id")
    recipient_type = data.get("recipient_type")
    message = data.get("message")
    
    if not recipient_id or not recipient_type or not message:
        return jsonify({"error": "Missing required fields"}), 400
    
    # Validate recipient type
    if recipient_type not in ["team", "individual"]:
        return jsonify({"error": "Invalid recipient type"}), 400
    
    # Check rate limit
    if not check_rate_limit(sender_id):
        return jsonify({"error": "Rate limit exceeded. Please wait before sending more messages."}), 429
    
    # Verify authorization
    if not can_chat(sender_type, sender_id, recipient_type, recipient_id):
        return jsonify({"error": "You are not authorized to chat with this user"}), 403
    
    # Sanitize message
    clean_message = sanitize_chat_message(message)
    
    if not clean_message:
        return jsonify({"error": "Message cannot be empty"}), 400
    
    # Generate conversation ID
    if sender_type == "individual":
        conversation_id = generate_conversation_id(sender_id, recipient_id)
    else:  # sender is team
        conversation_id = generate_conversation_id(recipient_id, sender_id)
    
    # Create message document
    db = get_db()
    message_id = f"MSG_{int(time.time() * 1000)}_{sender_id}"
    
    message_doc = {
        "message_id": message_id,
        "conversation_id": conversation_id,
        "sender_type": sender_type,
        "sender_id": sender_id,
        "message": clean_message,
        "timestamp": datetime.utcnow(),
        "read": False,
        "deleted": False
    }
    
    # Store in database
    db.chat_messages.insert_one(message_doc)
    
    # Emit Socket.IO event to recipient
    socketio.emit(
        "new_chat_message",
        {
            "conversation_id": conversation_id,
            "message_id": message_id,
            "sender_type": sender_type,
            "message": clean_message,
            "timestamp": message_doc["timestamp"].isoformat()
        },
        room=f"chat_{conversation_id}"
    )
    
    return jsonify({
        "success": True,
        "message_id": message_id,
        "timestamp": message_doc["timestamp"].isoformat()
    }), 200


def get_chat_history(conversation_id: str):
    """
    Get chat history for a conversation
    GET /api/chat/history/<conversation_id>
    Query params: page (default 1), limit (default 50)
    """
    # Check authentication
    individual_token = request.cookies.get("individual_auth")
    team_token = request.cookies.get("team_auth")
    
    if not individual_token and not team_token:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Determine user type and ID
    user_type = None
    user_id = None
    
    try:
        if individual_token:
            payload = jwt.decode(individual_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("individual_id")
            user_type = "individual"
        elif team_token:
            payload = jwt.decode(team_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("team_id")
            user_type = "team"
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    
    if not user_id or not user_type:
        return jsonify({"error": "Invalid token payload"}), 401
    
    # Validate conversation ID format
    if not conversation_id.startswith("CONV_"):
        return jsonify({"error": "Invalid conversation ID"}), 400
    
    # Extract team_id and individual_id from conversation_id
    # Format: CONV_<team_id>_<individual_id>
    parts = conversation_id.split("_")
    if len(parts) != 3:
        return jsonify({"error": "Invalid conversation ID format"}), 400
    
    team_id = parts[1]
    individual_id = parts[2]
    
    # Verify user is participant in this conversation
    if user_type == "individual" and user_id != individual_id:
        return jsonify({"error": "Unauthorized access to this conversation"}), 403
    elif user_type == "team" and user_id != team_id:
        return jsonify({"error": "Unauthorized access to this conversation"}), 403
    
    # Verify chat permission
    if user_type == "individual":
        if not can_chat(user_type, user_id, "team", team_id):
            return jsonify({"error": "You are not authorized to view this conversation"}), 403
    else:  # team
        if not can_chat(user_type, user_id, "individual", individual_id):
            return jsonify({"error": "You are not authorized to view this conversation"}), 403
    
    # Get pagination params
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 50, type=int)
    
    # Limit max page size
    if limit > 100:
        limit = 100
    
    skip = (page - 1) * limit
    
    # Fetch messages from database
    db = get_db()
    messages_cursor = db.chat_messages.find(
        {"conversation_id": conversation_id, "deleted": False}
    ).sort("timestamp", 1).skip(skip).limit(limit)
    
    messages = []
    for msg in messages_cursor:
        messages.append({
            "message_id": msg.get("message_id"),
            "sender_type": msg.get("sender_type"),
            "message": msg.get("message"),
            "timestamp": msg.get("timestamp").isoformat() if msg.get("timestamp") else None,
            "read": msg.get("read", False)
        })
    
    # Mark messages as read (messages sent TO this user)
    opposite_sender_type = "team" if user_type == "individual" else "individual"
    db.chat_messages.update_many(
        {
            "conversation_id": conversation_id,
            "sender_type": opposite_sender_type,
            "read": False
        },
        {"$set": {"read": True}}
    )
    
    return jsonify({
        "success": True,
        "conversation_id": conversation_id,
        "messages": messages,
        "page": page,
        "limit": limit
    }), 200


def get_conversations():
    """
    Get list of active conversations for the current user
    GET /api/chat/conversations
    """
    # Check authentication
    individual_token = request.cookies.get("individual_auth")
    team_token = request.cookies.get("team_auth")
    
    if not individual_token and not team_token:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Determine user type and ID
    user_type = None
    user_id = None
    
    try:
        if individual_token:
            payload = jwt.decode(individual_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("individual_id")
            user_type = "individual"
        elif team_token:
            payload = jwt.decode(team_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("team_id")
            user_type = "team"
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    
    if not user_id or not user_type:
        return jsonify({"error": "Invalid token payload"}), 401
    
    db = get_db()
    conversations = []
    
    if user_type == "individual":
        # Get all teams this individual has requested or been accepted by
        individual = db.individuals.find_one({"individual_id": user_id})
        if not individual:
            return jsonify({"error": "Individual not found"}), 404
        
        requested = individual.get("requested", [])
        accepted = individual.get("accepted")
        
        team_ids = list(set(requested + ([accepted] if accepted else [])))
        
        for team_id in team_ids:
            team = db.create_team.find_one({"team_id": team_id})
            if team:
                conversation_id = generate_conversation_id(user_id, team_id)
                
                # Get unread count
                unread_count = db.chat_messages.count_documents({
                    "conversation_id": conversation_id,
                    "sender_type": "team",
                    "read": False
                })
                
                # Get last message
                last_message = db.chat_messages.find_one(
                    {"conversation_id": conversation_id},
                    sort=[("timestamp", -1)]
                )
                
                conversations.append({
                    "conversation_id": conversation_id,
                    "partner_type": "team",
                    "partner_id": team_id,
                    "partner_name": team.get("team_name", ""),
                    "unread_count": unread_count,
                    "last_message": last_message.get("message") if last_message else None,
                    "last_message_time": last_message.get("timestamp").isoformat() if last_message and last_message.get("timestamp") else None
                })
    
    else:  # team
        # Get all individuals who have requested or been accepted
        team = db.create_team.find_one({"team_id": user_id})
        if not team:
            return jsonify({"error": "Team not found"}), 404
        
        requests = team.get("requests", [])
        members = team.get("members", [])
        
        # Get individual IDs from members
        member_ids = [m.get("individual_id") for m in members if m.get("individual_id")]
        
        individual_ids = list(set(requests + member_ids))
        
        for individual_id in individual_ids:
            individual = db.individuals.find_one({"individual_id": individual_id})
            if individual:
                conversation_id = generate_conversation_id(individual_id, user_id)
                
                # Get unread count
                unread_count = db.chat_messages.count_documents({
                    "conversation_id": conversation_id,
                    "sender_type": "individual",
                    "read": False
                })
                
                # Get last message
                last_message = db.chat_messages.find_one(
                    {"conversation_id": conversation_id},
                    sort=[("timestamp", -1)]
                )
                
                conversations.append({
                    "conversation_id": conversation_id,
                    "partner_type": "individual",
                    "partner_id": individual_id,
                    "partner_name": individual.get("full_name", ""),
                    "unread_count": unread_count,
                    "last_message": last_message.get("message") if last_message else None,
                    "last_message_time": last_message.get("timestamp").isoformat() if last_message and last_message.get("timestamp") else None
                })
    
    return jsonify({
        "success": True,
        "conversations": conversations
    }), 200


def mark_as_read():
    """
    Mark messages in a conversation as read
    POST /api/chat/mark-read
    Body: { conversation_id: "CONV_TM035_IND048" }
    """
    # Check authentication
    individual_token = request.cookies.get("individual_auth")
    team_token = request.cookies.get("team_auth")
    
    if not individual_token and not team_token:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Determine user type and ID
    user_type = None
    user_id = None
    
    try:
        if individual_token:
            payload = jwt.decode(individual_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("individual_id")
            user_type = "individual"
        elif team_token:
            payload = jwt.decode(team_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("team_id")
            user_type = "team"
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    
    if not user_id or not user_type:
        return jsonify({"error": "Invalid token payload"}), 401
    
    # Get request data
    data = request.json or {}
    conversation_id = data.get("conversation_id")
    
    if not conversation_id:
        return jsonify({"error": "Conversation ID required"}), 400
    
    # Validate conversation ID format
    if not conversation_id.startswith("CONV_"):
        return jsonify({"error": "Invalid conversation ID"}), 400
    
    parts = conversation_id.split("_")
    if len(parts) != 3:
        return jsonify({"error": "Invalid conversation ID format"}), 400
    
    team_id = parts[1]
    individual_id = parts[2]
    
    # Verify user is participant
    if user_type == "individual" and user_id != individual_id:
        return jsonify({"error": "Unauthorized"}), 403
    elif user_type == "team" and user_id != team_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    # Mark messages as read
    db = get_db()
    opposite_sender_type = "team" if user_type == "individual" else "individual"
    
    result = db.chat_messages.update_many(
        {
            "conversation_id": conversation_id,
            "sender_type": opposite_sender_type,
            "read": False
        },
        {"$set": {"read": True}}
    )
    
    return jsonify({
        "success": True,
        "marked_count": result.modified_count
    }), 200


def get_all_chat_messages_route():
    """
    Admin endpoint to fetch all chat conversations grouped by conversation_id
    Returns conversations with all messages in each conversation
    """
    try:
        db = get_db()
        
        # Fetch all chat messages, sorted by timestamp
        messages_cursor = db.chat_messages.find(
            {"deleted": {"$ne": True}}  # Exclude deleted messages
        ).sort("timestamp", 1)  # Ascending order for proper conversation flow
        
        # Group messages by conversation_id
        conversations_map = {}
        
        for msg in messages_cursor:
            conversation_id = msg.get("conversation_id", "")
            
            if conversation_id not in conversations_map:
                # Initialize conversation
                conversations_map[conversation_id] = {
                    "conversationId": conversation_id,
                    "messages": [],
                    "participant1": None,
                    "participant2": None,
                    "lastMessageTime": None,
                    "totalMessages": 0,
                    "unreadCount": 0
                }
            
            # Get sender details
            sender_name = "Unknown"
            sender_email = "N/A"
            
            if msg.get("sender_type") == "individual":
                individual = db.individuals.find_one({"individual_id": msg.get("sender_id")})
                if individual:
                    sender_name = individual.get("full_name", "Unknown Individual")
                    sender_email = individual.get("email", "N/A")
            elif msg.get("sender_type") == "team":
                team = db.create_team.find_one({"team_id": msg.get("sender_id")})
                if team:
                    sender_name = team.get("team_name", "Unknown Team")
                    sender_email = team.get("leader_email", "N/A")
            
            # Add message to conversation
            conversations_map[conversation_id]["messages"].append({
                "messageId": msg.get("message_id"),
                "senderType": msg.get("sender_type"),
                "senderName": sender_name,
                "senderEmail": sender_email,
                "message": msg.get("message"),
                "timestamp": msg.get("timestamp").isoformat() if msg.get("timestamp") else None,
                "read": msg.get("read", False)
            })
            
            conversations_map[conversation_id]["totalMessages"] += 1
            if not msg.get("read", False):
                conversations_map[conversation_id]["unreadCount"] += 1
            
            # Update last message time
            if msg.get("timestamp"):
                conversations_map[conversation_id]["lastMessageTime"] = msg.get("timestamp").isoformat()
            
            # Set participants (extract from conversation_id)
            if conversation_id.startswith("CONV_") and not conversations_map[conversation_id]["participant1"]:
                parts = conversation_id.split("_")
                if len(parts) >= 3:
                    # Parts could be CONV_TM081_IND065 or CONV_IND065_TM081
                    id1 = parts[1]
                    id2 = parts[2]
                    
                    # Determine which is team and which is individual based on prefix
                    team_id = None
                    individual_id = None
                    
                    if id1.startswith("TM"):
                        team_id = id1
                        individual_id = id2
                    elif id1.startswith("IND"):
                        individual_id = id1
                        team_id = id2
                    
                    # Get individual details
                    if individual_id:
                        individual = db.individuals.find_one({"individual_id": individual_id})
                        if individual:
                            conversations_map[conversation_id]["participant1"] = {
                                "type": "Individual",
                                "name": individual.get("full_name", individual_id),
                                "id": individual_id
                            }
                    
                    # Get team details
                    if team_id:
                        team = db.create_team.find_one({"team_id": team_id})
                        if team:
                            conversations_map[conversation_id]["participant2"] = {
                                "type": "Team",
                                "name": team.get("team_name", team_id),
                                "id": team_id
                            }
        
        # Convert to list and sort by last message time (newest first)
        conversations = list(conversations_map.values())
        conversations.sort(key=lambda x: x.get("lastMessageTime") or "", reverse=True)
        
        return jsonify({
            "success": True,
            "conversations": conversations,
            "total": len(conversations)
        }), 200
        
    except Exception as e:
        print(f"Error fetching chat messages: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": "Failed to fetch chat messages"
        }), 500

