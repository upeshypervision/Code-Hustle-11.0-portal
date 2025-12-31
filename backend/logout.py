from flask import jsonify, make_response
from config import COOKIE_SECURE

def logout_route():
    """
    Logout endpoint that clears authentication cookies.
    Works for both student and admin sessions.
    """
    response = make_response(jsonify({
        "success": True,
        "message": "Logged out successfully"
    }))
    
    # Clear student auth cookie
    response.set_cookie(
        'student_auth',
        '',
        httponly=True,
        secure=COOKIE_SECURE,  # Auto-set based on environment
        samesite='Lax',
        max_age=0,  # Expire immediately
        path='/'
    )
    
    # Clear admin auth cookie
    response.set_cookie(
        'admin_auth',
        '',
        httponly=True,
        secure=COOKIE_SECURE,  # Auto-set based on environment
        samesite='Lax',
        max_age=0,  # Expire immediately
        path='/'
    )
    
    return response, 200
