# backend/submit_ppt.py
from flask import request, jsonify
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from database import get_db
from s3_service import upload_file_to_s3, allowed_file, is_valid_file_size, get_content_type
from datetime import datetime
import os

def submit_ppt_route(): # Admin manual submission route (existing)
    """
    Handles the HTTP request for PPT/PDF submission.
    Requires student authentication via JWT cookie.
    If admin authentication is present and a team_id is provided in the body, admin can submit for that team.
    Records who submitted (student or admin) in the database.
    """
    db = get_db()

    student_cookie = request.cookies.get('student_auth')
    admin_cookie = request.cookies.get('admin_auth')

    team_id = None
    submitted_by = "student"

    # Check for admin override first
    if admin_cookie:
        try:
            admin_payload = jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            provided_team_id = request.form.get('team_id')
            if provided_team_id:
                team_id = provided_team_id
                submitted_by = "admin"
                print(f"Admin {admin_payload.get('login_id', 'Unknown')} submitting for team {team_id}")
            else:
                if student_cookie:
                    student_payload = jwt.decode(student_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                    team_id = student_payload.get('team_id')
                    if not team_id:
                        return jsonify({"success": False, "error": "Invalid student session."}), 401
                else:
                    return jsonify({"success": False, "error": "No student session and no team_id provided."}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "error": "Admin session expired."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "error": "Invalid admin session."}), 401
    else: # No admin auth, must be student
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

    # 2. Validate File in Request
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part in the request."}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "No file selected."}), 400

    # 3. Validate File Type
    if not allowed_file(file.filename):
        return jsonify({"success": False, "error": "Invalid file type. Only PDF, PPT, and PPTX files are allowed."}), 400

    # 4. Validate File Size
    if not is_valid_file_size(file):
        return jsonify({"success": False, "error": "File size exceeds 5MB limit."}), 400

    # 5. Determine S3 Key and Content Type
    content_type = get_content_type(file.filename)
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    s3_key = f"submissions/{team_id}/{file.filename.rsplit('/', 1)[-1]}_{timestamp}"

    # 6. Upload to S3 using the service
    s3_url = upload_file_to_s3(file.read(), s3_key, content_type)

    if s3_url:
        # 7. Update Team Record in Database
        submission_data = {
            "file_name": file.filename,
            "s3_url": s3_url,
            "submitted_at": datetime.utcnow().isoformat(),
            "submitted_by": team_id, # Who submitted the file (team ID)
            "submitted_via": submitted_by # How it was submitted (student or admin)
        }
        result = db.teams.update_one(
            {"team_id": team_id},
            {"$push": {"submissions": submission_data}}
        )

        if result.modified_count > 0:
            return jsonify({"success": True, "message": f"File submitted successfully by {submitted_by}.", "s3_url": s3_url})
        else:
            # This might happen if the team_id doesn't exist in the DB
            return jsonify({"success": False, "error": "Failed to update team record."}), 500
    else:
        # Upload failed in s3_service.py
        return jsonify({"success": False, "error": "Failed to upload file to S3."}), 500

def submit_ppt_student_route(): # NEW: Student dashboard submission route
    """
    Handles the HTTP request for PPT/PDF submission from the student dashboard.
    Requires student authentication via JWT cookie (only team_id needed).
    Saves submission details (team_id, file_name, submitted_at) to a separate 'submissions' collection.
    """
    db = get_db()

    # 1. Verify Student Authentication (Only team_id needed now)
    student_cookie = request.cookies.get('student_auth')
    if not student_cookie:
        return jsonify({"success": False, "error": "Authentication required."}), 401

    try:
        payload = jwt.decode(student_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        team_id = payload.get('team_id')
        # CRITICAL: No longer requiring team_name from JWT payload
        if not team_id:
            return jsonify({"success": False, "error": "Invalid session (missing team ID)."}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "error": "Session expired."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "error": "Invalid session."}), 401

    # 2. Validate File in Request
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part in the request."}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "No file selected."}), 400

    # 3. Validate File Type
    if not allowed_file(file.filename):
        return jsonify({"success": False, "error": "Invalid file type. Only PDF, PPT, and PPTX files are allowed."}), 400

    # 4. Validate File Size
    if not is_valid_file_size(file):
        return jsonify({"success": False, "error": "File size exceeds 5MB limit."}), 400

    # 5. Determine S3 Key and Content Type
    content_type = get_content_type(file.filename)
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    s3_key = f"submissions/{team_id}/{file.filename.rsplit('/', 1)[-1]}_{timestamp}"

    # 6. Upload to S3 using the service
    s3_url = upload_file_to_s3(file.read(), s3_key, content_type)

    if s3_url:
        # 7. Insert into NEW 'submissions' Collection in Database (Simplified structure)
        submission_data = {
            "team_id": team_id,
            # "team_name": team_name, # No longer included
            "file_name": file.filename,
            # "file_path": s3_url, # No longer included
            "submitted_at": datetime.utcnow().isoformat() + "Z" # ISO format with Z for UTC
        }
        # Insert the new submission document into the 'submissions' collection
        result = db.submissions.insert_one(submission_data)

        if result.inserted_id: # Check if insert was successful
            return jsonify({"success": True, "message": "File submitted successfully.", "s3_url": s3_url})
        else:
            # This case might be rare, but indicates insertion failed
            return jsonify({"success": False, "error": "Failed to save submission record."}), 500
    else:
        # Upload failed in s3_service.py
        return jsonify({"success": False, "error": "Failed to upload file to S3."}), 500
