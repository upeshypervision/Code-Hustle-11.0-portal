from flask import request, jsonify
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from database import get_db
from datetime import datetime

def submit_link_route():

    db = get_db()

    student_cookie = request.cookies.get("student_auth")
    admin_cookie = request.cookies.get("admin_auth")

    team_id = None
    submitted_via = "student"

    # ---------- AUTH ----------
    if admin_cookie:
        try:
            admin_payload = jwt.decode(
                admin_cookie,
                JWT_SECRET,
                algorithms=[JWT_ALGORITHM]
            )

            data = request.get_json()
            if not data or "team_id" not in data:
                return jsonify({
                    "success": False,
                    "error": "team_id required for admin submission."
                }), 400

            team_id = data.get("team_id")
            submitted_via = "admin"

            print(
                f"Admin {admin_payload.get('login_id', 'Unknown')} "
                f"submitting link for team {team_id}"
            )

        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "error": "Admin session expired."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "error": "Invalid admin session."}), 401

    else:
        # ---------- STUDENT FLOW ----------
        if not student_cookie:
            return jsonify({"success": False, "error": "Authentication required."}), 401

        try:
            payload = jwt.decode(
                student_cookie,
                JWT_SECRET,
                algorithms=[JWT_ALGORITHM]
            )

            team_id = payload.get("team_id")
            if not team_id:
                return jsonify({"success": False, "error": "Invalid session."}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "error": "Session expired."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "error": "Invalid session."}), 401

    # ---------- DATA ----------
    data = request.get_json()
    if not data or "link" not in data:
        return jsonify({"success": False, "error": "Link is required."}), 400

    link = data.get("link")

    # Basic validation
    if not isinstance(link, str) or not link.startswith("http"):
        return jsonify({"success": False, "error": "Invalid link format."}), 400

    # ---------- OPTIONAL: prevent re-submission ----------
    existing = db.submissions.find_one({
        "team_id": team_id,
        "type": "link"
    })

    if existing:
        return jsonify({
            "success": False,
            "error": "Link already submitted for this team."
        }), 400

    # ---------- DB ----------
    submission_data = {
        "team_id": team_id,
        "type": "link",
        "link": link,
        "submitted_via": submitted_via,  # student / admin
        "submitted_at": datetime.utcnow().isoformat() + "Z"
    }

    result = db.submissions.insert_one(submission_data)

    if result.inserted_id:
        return jsonify({
            "success": True,
            "message": f"Link submitted successfully by {submitted_via}.",
            "link": link
        }), 200

    return jsonify({
        "success": False,
        "error": "Failed to save submission."
    }), 500
