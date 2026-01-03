# backend/app.py
from flask import Flask
from flask_cors import CORS
from validate_hypervision import validate_hypervision_route
from register_team import register_team_route, check_team_name_route, register_manual_team_route
from verify_payment import verify_payment_route
from webhook_handler import razorpay_webhook_handler
from login import setup_login_routes
from logout import logout_route
from user_access import (
    fetch_teams_route, get_user_info_route, check_submission_status_route,
    select_problem_statement_route, fetch_teams_pending_submission_route,
    fetch_submissions_route, generate_presigned_url_route # Import all user_access routes
)
from submit_ppt import submit_ppt_route, submit_ppt_student_route

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True) #cors

# --- Register Login Routes using the setup function ---
setup_login_routes(app)

@app.route("/api/check-student-auth", methods=["GET"])
def check_student_auth():
    from login import check_student_auth_route
    return check_student_auth_route()

@app.route("/api/validate-hypervision", methods=["POST"])
def validate_hypervision():
    return validate_hypervision_route()

@app.route("/api/register-team", methods=["POST"])
def register_team():
    return register_team_route()

@app.route("/api/check-team-name", methods=["POST"])
def check_team_name():
    return check_team_name_route()

@app.route("/api/verify-payment", methods=["POST"])
def verify_payment():
    return verify_payment_route()

@app.route("/api/razorpay-webhook", methods=["POST"])
def razorpay_webhook():
    return razorpay_webhook_handler()

@app.route("/api/admin/add-team", methods=["POST"])
def register_manual_team():
    return register_manual_team_route()

# --- Admin Data Fetching Routes ---
@app.route("/api/admin/teams", methods=["GET"])
def fetch_teams():
    return fetch_teams_route()

@app.route("/api/admin/teams/pending-submission", methods=["GET"])
def get_pending_submission_teams():
    return fetch_teams_pending_submission_route()

@app.route("/api/admin/submissions", methods=["GET"])
def get_submissions():
    return fetch_submissions_route()

# --- NEW Route for generating presigned URL ---
@app.route("/api/admin/submission/<team_id>", methods=["GET"])
def get_submission_presigned_url(team_id):
    return generate_presigned_url_route(team_id)

#login route for admin - Now handled by setup_login_routes

@app.route("/api/logout", methods=["POST"])
def logout():
    return logout_route()

@app.route("/api/user-info", methods=["GET"])
def get_user_info():
    return get_user_info_route()

# --- Problem Statement Selection Route ---
@app.route("/api/select-problem-statement", methods=["POST"])
def select_problem_statement():
    return select_problem_statement_route()

# --- New Submission Routes ---
@app.route('/api/submit-ppt', methods=['POST']) # Admin manual submission
def submit_ppt():
    return submit_ppt_route()

@app.route('/api/submit-ppt-student', methods=['POST']) # Student dashboard submission
def submit_ppt_student():
    return submit_ppt_student_route()


# --- New Submission Status Check Route ---
@app.route("/api/check-submission-status", methods=["GET"])
def check_submission_status():
    return check_submission_status_route()


if __name__ == "__main__":
    app.run(port=5000, debug=True)