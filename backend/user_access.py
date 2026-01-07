# backend/user_access.py
from flask import request, jsonify
import jwt
import boto3
from urllib.parse import urlparse
from database import get_db
from config import (
    JWT_SECRET,
    JWT_ALGORITHM,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    S3_BUCKET_NAME
)

# Module-level database connection
db = get_db()


def get_user_info_route():
    student_token = request.cookies.get('student_auth')
    admin_token = request.cookies.get('admin_auth')

    if student_token:
        try:
            payload = jwt.decode(student_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            team_id = payload.get("team_id")
            if not team_id:
                return jsonify({"error": "Invalid session"}), 401

            team = db["teams"].find_one(
                {"team_id": team_id},
                {"_id": 0, "password_hashed": 0}  # Exclude only sensitive fields
            )
            if not team:
                return jsonify({"error": "Team not found"}), 404

            return jsonify({
                "success": True,
                "role": "student",
                **team  # Spread all team fields (team_id, team_name, leader, members, etc.)
            }), 200

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

    if admin_token:
        try:
            payload = jwt.decode(admin_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            login_id = payload.get("login_id")
            if not login_id:
                return jsonify({"error": "Invalid session"}), 401

            return jsonify({
                "success": True,
                "role": "admin",
                "login_id": login_id
            }), 200

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

    return jsonify({"error": "Not authenticated"}), 401


def fetch_teams_route():
    token = request.cookies.get('admin_auth')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    try:
        teams = list(db["teams"].find({}, {"_id": 0, "password_hashed": 0}).sort("_id", -1))
        return jsonify({"success": True, "teams": teams, "count": len(teams)}), 200
    except Exception as e:
        print(f"Error fetching teams: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500


def check_submission_status_route():
    student_cookie = request.cookies.get('student_auth')
    if not student_cookie:
        return jsonify({"error": "Authentication required"}), 401

    try:
        payload = jwt.decode(student_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        team_id = payload.get('team_id')
        if not team_id:
            return jsonify({"error": "Invalid session"}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    submission_exists = db["ppt_submissions"].find_one({"team_id": team_id})
    return jsonify({"submitted": submission_exists is not None}), 200


def select_problem_statement_route():
    student_cookie = request.cookies.get('student_auth')
    if not student_cookie:
        return jsonify({"success": False, "error": "Authentication required."}), 401

    try:
        payload = jwt.decode(student_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        team_id = payload.get('team_id')
        if not team_id:
            return jsonify({"success": False, "error": "Invalid session."}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "error": "Session expired."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "error": "Invalid session."}), 401

    data = request.json or {}
    ps_id = data.get('ps_id')
    if not ps_id:
        return jsonify({"success": False, "error": "Problem Statement ID required."}), 400

    # Prevent selection after submission
    if db.ppt_submissions.find_one({"team_id": team_id}):
        return jsonify({"success": False, "error": "Cannot select Problem Statement after submission."}), 400

    team_doc = db.registered_teams.find_one({"team_id": team_id})
    if not team_doc:
        return jsonify({"success": False, "error": "Team not found."}), 404

    if team_doc.get('selected_ps_id'):
        return jsonify({"success": False, "error": "Problem Statement already selected and locked."}), 400

    result = db.registered_teams.update_one({"team_id": team_id}, {"$set": {"selected_ps_id": ps_id}})
    if result.modified_count > 0:
        return jsonify({"success": True, "message": "Problem Statement selected and locked successfully."})
    else:
        return jsonify({"success": False, "error": "Failed to update team record."}), 500


def fetch_teams_pending_submission_route():
    admin_cookie = request.cookies.get('admin_auth')
    if not admin_cookie:
        return jsonify({"error": "Admin authentication required"}), 401

    try:
        payload = jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            return jsonify({"error": "Forbidden"}), 403
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid session"}), 401

    try:
        submitted_team_ids = [doc["team_id"] for doc in db.ppt_submissions.find({}, {"team_id": 1, "_id": 0})]
        pending_teams = list(
            db["teams"].find(
                {"team_id": {"$nin": submitted_team_ids}},
                {"_id": 0, "team_id": 1, "team_name": 1}
            ).sort("team_id", 1)
        )
        return jsonify({"success": True, "teams": pending_teams}), 200
    except Exception as e:
        print(f"Error fetching pending teams: {e}")
        return jsonify({"error": "Failed to fetch pending teams"}), 500


def fetch_submissions_route():
    admin_cookie = request.cookies.get('admin_auth')
    if not admin_cookie:
        return jsonify({"error": "Admin authentication required"}), 401

    try:
        payload = jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            return jsonify({"error": "Forbidden"}), 403
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid session"}), 401

    try:
        submissions = list(
            db["ppt_submissions"].find(
                {},
                {"_id": 0, "team_id": 1, "team_name": 1, "file_name": 1, "file_path": 1, "submitted_at": 1}
            ).sort("submitted_at", -1)
        )
        return jsonify({"success": True, "submissions": submissions}), 200
    except Exception as e:
        print(f"Error fetching submissions: {e}")
        return jsonify({"error": "Failed to fetch submissions"}), 500


# ✅ ONLY ONE DEFINITION — OPTIMIZED
def generate_presigned_url_route(team_id):
    """
    Generate a presigned S3 URL for admin OR evaluator to view/download a team's submission.
    Supports ?disposition=inline (default) or ?disposition=attachment.
    """
    admin_cookie = request.cookies.get('admin_auth')
    evaluator_cookie = request.cookies.get('evaluator_auth')
    
    auth_success = False

    # Check Admin Auth
    if admin_cookie:
        try:
            payload = jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            if payload.get("role") == "admin":
                auth_success = True
        except:
            pass
            
    # Check Evaluator Auth (if not already admin authenticated)
    if not auth_success and evaluator_cookie:
        try:
            payload = jwt.decode(evaluator_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            # Evaluators just need a valid token with a username
            if payload.get("username"):
                auth_success = True
        except:
            pass

    if not auth_success:
        return jsonify({"error": "Admin or Evaluator authentication required"}), 401

    try:
        submission = db.ppt_submissions.find_one({"team_id": team_id})
        if not submission:
            return jsonify({"error": "Submission not found"}), 404

        file_path = submission.get("file_path")
        file_name = submission.get("file_name", "submission_file")

        if not isinstance(file_path, str) or not file_path.startswith("https://"):
            return jsonify({"error": "Invalid or missing file path"}), 500

        # Parse URL safely
        parsed = urlparse(file_path)
        expected_netloc = f"{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com"
        if parsed.netloc != expected_netloc:
            # Fallback: allow any S3 region if bucket matches
            if not parsed.netloc.startswith(f"{S3_BUCKET_NAME}.s3.") or not parsed.netloc.endswith(".amazonaws.com"):
                return jsonify({"error": "File path is not from the expected S3 bucket"}), 500

        s3_key = parsed.path.lstrip("/")

        if not s3_key:
            return jsonify({"error": "Empty S3 key"}), 500

        # Handle disposition
        disposition = request.args.get("disposition", "inline")
        if disposition not in ("inline", "attachment"):
            disposition = "inline"

        s3_client = boto3.client(
            "s3",
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )

        presigned_url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": S3_BUCKET_NAME,
                "Key": s3_key,
                "ResponseContentDisposition": f'{disposition}; filename="{file_name}"'
            },
            ExpiresIn=600  # 10 minutes
        )

        return jsonify({"success": True, "url": presigned_url}), 200

    except Exception as e:
        print(f"Error generating presigned URL for team {team_id}: {e}")
        return jsonify({"error": "Failed to generate view link"}), 500