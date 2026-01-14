from flask import request
from flask_socketio import emit, join_room
from socketio_instance import socketio

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('join_room')
def handle_join_room(data):
    """Join a specific room (individual or team)"""
    room = data.get('room')
    if room:
        join_room(room)
        print(f"Client joined room: {room}")

@socketio.on('new_join_request')
def handle_new_request(data):
    """Broadcast new join request to team room"""
    team_id = data.get('teamId')
    if team_id:
        emit('new_join_request', data, room=f'team_{team_id}', include_self=False)
        print(f"New request broadcasted to team_{team_id}")

@socketio.on('request_accepted')
def handle_request_accepted(data):
    """Broadcast acceptance to individual room"""
    individual_id = data.get('individualId')
    if individual_id:
        emit('request_accepted', data, room=f'individual_{individual_id}', include_self=False)
        print(f"Acceptance broadcasted to individual_{individual_id}")

@socketio.on('request_rejected')
def handle_request_rejected(data):
    """Broadcast rejection to individual room"""
    individual_id = data.get('individualId')
    if individual_id:
        emit('request_rejected', data, room=f'individual_{individual_id}', include_self=False)
        print(f"Rejection broadcasted to individual_{individual_id}")


# ===== CHAT SOCKET EVENTS =====

@socketio.on('join_chat_room')
def handle_join_chat_room(data):
    """Join a specific chat conversation room"""
    conversation_id = data.get('conversation_id')
    if conversation_id and conversation_id.startswith('CONV_'):
        room = f'chat_{conversation_id}'
        join_room(room)
        print(f"Client joined chat room: {room}")
        emit('chat_room_joined', {'conversation_id': conversation_id})

@socketio.on('typing_indicator')
def handle_typing(data):
    """Broadcast typing indicator to conversation room"""
    conversation_id = data.get('conversation_id')
    sender_type = data.get('sender_type')
    is_typing = data.get('is_typing', False)
    

    #when user is typing Display 'TYPING BUBBLES'
    if conversation_id and conversation_id.startswith('CONV_'):
        emit('user_typing', {
            'conversation_id': conversation_id,
            'sender_type': sender_type,
            'is_typing': is_typing
        }, room=f'chat_{conversation_id}', include_self=False)

