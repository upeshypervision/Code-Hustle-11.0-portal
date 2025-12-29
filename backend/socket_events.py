# backend/socket_events.py
from flask import request # <-- Add this import
from flask_socketio import emit, join_room, leave_room
import logging

logger = logging.getLogger(__name__)

# --- Global State for Submission Status (Consider using Redis for multi-instance) ---
SUBMISSION_ACTIVE = True

def register_socket_events(socketio):
    """
    Registers all WebSocket event handlers with the SocketIO instance.
    """
    @socketio.on('connect')
    def handle_connect():
        logger.info(f"Client {request.sid} connected") # Now 'request' is defined
        # Optionally send initial status upon connection
        emit('submission_status_update', {'active': SUBMISSION_ACTIVE})

    @socketio.on('disconnect')
    def handle_disconnect():
        logger.info(f"Client {request.sid} disconnected") # Now 'request' is defined

    @socketio.on('request_status')
    def handle_request_status():
        """
        Client event to request the current submission status.
        """
        emit('submission_status_update', {'active': SUBMISSION_ACTIVE})

    @socketio.on('toggle_submission')
    def handle_toggle_submission(data):
        """
        Admin event to toggle submission status.
        Broadcasts the new status to all clients.
        IMPORTANT: Verify admin authentication here before toggling.
        """
        global SUBMISSION_ACTIVE
        # Example: Verify admin JWT from request or session if passed
        # admin_token = request.cookies.get('admin_auth')
        # if not is_valid_admin(admin_token):
        #     emit('toggle_response', {'success': False, 'error': 'Unauthorized'})
        #     return

        admin_id = data.get('admin_id', 'Unknown Admin') # Example payload
        new_status = data.get('status') # Expecting True/False from frontend

        if new_status is not None:
            SUBMISSION_ACTIVE = new_status
            logger.info(f"Submission status toggled by {admin_id}. New status: {SUBMISSION_ACTIVE}")
            # Broadcast the status update to all connected clients
            socketio.emit('submission_status_update', {'active': SUBMISSION_ACTIVE})
            emit('toggle_response', {'success': True, 'active': SUBMISSION_ACTIVE, 'message': f'Submission is now {"OPEN" if SUBMISSION_ACTIVE else "CLOSED"}'})
        else:
            emit('toggle_response', {'success': False, 'error': 'Invalid status provided'})