from flask import jsonify, make_response
from config import COOKIE_SECURE

def logout_route():
    """
    Logout endpoint that clears all authentication cookies.
    Works for student, admin, evaluator, individual, and team sessions.
    """
    response = make_response(jsonify({
        "success": True,
        "message": "Logged out successfully"
    }))
    
    # List of all auth cookies to clear
    auth_cookies = [
        'student_auth',
        'admin_auth',
        'evaluator_auth',
        'individual_auth',
        'team_auth'
    ]
    
    # Clear all authentication cookies
    for cookie_name in auth_cookies:
        response.set_cookie(
            cookie_name,
            '',
            httponly=True,
            secure=COOKIE_SECURE,  # Auto-set based on environment
            samesite='Lax',
            max_age=0,  # Expire immediately
            path='/'
        )
    
    return response, 200
