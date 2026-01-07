# backend/submit_ppt.py
from flask import request, jsonify
import jwt
from config import JWT_SECRET, JWT_ALGORITHM
from database import get_db
from s3_service import upload_file_to_s3, allowed_file, is_valid_file_size, get_content_type
from datetime import datetime
from socketio_instance import socketio
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
        # 7. Save to submissions collection
        submission_data = {
            "team_id": team_id,
            "file_name": file.filename,
            "file_path": s3_url,
            "submitted_at": datetime.utcnow().isoformat() + "Z",
            "submitted_via": submitted_by,  # Track if admin or student submitted
            "approval_status": "pending"
        }
        
        # Check if submission already exists (prevent duplicates)
        existing = db.ppt_submissions.find_one({"team_id": team_id})
        if not existing:
            result = db.ppt_submissions.insert_one(submission_data)
            if result.inserted_id:
                return jsonify({"success": True, "message": f"File submitted successfully by {submitted_by}.", "s3_url": s3_url})
            else:
                return jsonify({"success": False, "error": "Failed to save submission record."}), 500
        else:
            # Update existing submission instead of creating duplicate
            result = db.ppt_submissions.update_one(
                {"team_id": team_id},
                {"$set": submission_data}
            )
            if result.modified_count > 0 or result.matched_count > 0:
                return jsonify({"success": True, "message": f"File updated successfully by {submitted_by}.", "s3_url": s3_url})
            else:
                return jsonify({"success": False, "error": "Failed to update submission record."}), 500
    else:
        # Upload failed in s3_service.py
        return jsonify({"success": False, "error": "Failed to upload file to S3."}), 500

def submit_ppt_student_route(): # NEW: Student dashboard submission route
    """
    Handles the HTTP request for PPT/PDF submission from the student dashboard.
    Requires student authentication via JWT cookie (only team_id needed).
    Checks if a submission already exists for the team to prevent re-submission.
    Saves submission details (team_id, file_name, file_path, submitted_at) to a separate 'submissions' collection.
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
    
    # =========================
    # CHECK ROUND 1 APPROVAL (Hackerrank)
    # =========================
    hackerrank_sub = db.Hackerrank_submission.find_one({"team_id": team_id})
    if not hackerrank_sub or hackerrank_sub.get("approval_status") != "approved":
        return jsonify({
            "success": False,
            "error": "Sorry, you are not allowed in this round. You must be approved in Round 1 (Hackerrank) to submit PPT."
        }), 403

    # Check if PPT upload round is active
    round_status = db.counters.find_one({"_id": "round_status"})
    if round_status and round_status.get("ppt_upload") != "live":
        return jsonify({
            "success": False,
            "error": "Sorry, the submission cannot be made as the PPT round is not currently active. Please wait for the organizing committee to activate this round."
        }), 403

    # --- NEW CHECK: Verify if a submission already exists for this team ---
    existing_submission = db.ppt_submissions.find_one({"team_id": team_id})
    if existing_submission:
        return jsonify({"success": False, "error": "A submission has already been made for this team. Re-submission is not allowed."}), 400

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
        # 7. Insert into NEW 'submissions' Collection in Database (Updated structure)
        submission_data = {
            "team_id": team_id,
            # "team_name": team_name, # No longer included
            "file_name": file.filename,
            "file_path": s3_url, # <-- ADD S3 URL (file_path) to the stored document
            "submitted_at": datetime.utcnow().isoformat() + "Z", # ISO format with Z for UTC
            "approval_status": "pending"
        }
        # Insert the new submission document into the 'submissions' collection
        result = db.ppt_submissions.insert_one(submission_data)

        if result.inserted_id: # Check if insert was successful
            # Emit WebSocket event to notify all admins of new submission
            socketio.emit("ppt_submitted", {
                "team_id": team_id,
                "submitted_at": submission_data["submitted_at"]
            })
            
            return jsonify({"success": True, "message": "File submitted successfully.", "s3_url": s3_url})
        else:
            # This case might be rare, but indicates insertion failed
            return jsonify({"success": False, "error": "Failed to save submission record."}), 500
    else:
        # Upload failed in s3_service.py
        return jsonify({"success": False, "error": "Failed to upload file to S3."}), 500


def check_ppt_submission_route():
    """
    Route for students to check if they have already submitted a PPT
    Returns submission status and details if exists
    """
    db = get_db()
    
    # Student authentication
    student_cookie = request.cookies.get("student_auth")
    if not student_cookie:
        return jsonify({"success": False, "error": "Authentication required."}), 401
    
    try:
        payload = jwt.decode(student_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        team_id = payload.get("team_id")
        
        if not team_id:
            return jsonify({"success": False, "error": "Invalid session."}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "error": "Session expired."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "error": "Invalid session."}), 401
    
    # Check if submission exists
    submission = db.ppt_submissions.find_one(
        {"team_id": team_id},
        {"_id": 0, "file_name": 1, "submitted_at": 1, "file_path": 1, "approval_status": 1}
    )
    
    if submission:
        return jsonify({
            "success": True,
            "is_submitted": True,
            "submission": submission
        }), 200
    else:
        return jsonify({
            "success": True,
            "is_submitted": False
        }), 200

def fetch_approved_ppt_teams():
    """
    Admin route: Fetch teams whose PPT submission is APPROVED
    """
    db = get_db()

    # Admin authentication
    admin_cookie = request.cookies.get("admin_auth")
    if not admin_cookie:
        return jsonify({"success": False, "error": "Admin authentication required"}), 401

    try:
        jwt.decode(admin_cookie, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "error": "Admin session expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "error": "Invalid admin session"}), 401

    try:
        # Get approved PPT submissions
        approved_ppt_docs = list(
            db.ppt_submissions.find(
                {"approval_status": "approved"},
                {"_id": 0, "team_id": 1}
            )
        )
        
        approved_team_ids = [doc["team_id"] for doc in approved_ppt_docs]
        
        if not approved_team_ids:
            return jsonify({"success": True, "teams": []}), 200

        # Fetch details from teams collection TO ENSURE we have names
        approved_teams = list(
            db.teams.find(
                {"team_id": {"$in": approved_team_ids}},
                {"_id": 0, "team_id": 1, "team_name": 1}
            )
        )

        return jsonify({
            "success": True,
            "teams": approved_teams
        }), 200

    except Exception as e:
        print(f"Database error in fetch_approved_ppt_teams: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch approved teams"
        }), 500
