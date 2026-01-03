# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from validate_hypervision import validate_hypervision_route
from register_team import register_team_route, check_team_name_route, register_manual_team_route
from verify_payment import verify_payment_route
from webhook_handler import razorpay_webhook_handler
from login import student_login_route,admin_login_route, check_auth_route, check_student_auth_route
from logout import logout_route
from problemstatement import create_problem_statement_route, get_all_problem_statements_route ,select_problem_statement_route ,get_all_visible_problem_statements_route, get_teams_by_ps_route
from submit_ppt import submit_ppt_route, submit_ppt_student_route # Import new route
from user_access import fetch_teams_route, get_user_info_route
from git_submission import submit_link_route
from get_teams import fetch_teamsnosubmission,view_githubsubmission_route
from ppt_filters import get_teams_without_ppt_route, get_teams_with_ppt_route


app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"],supports_credentials=True)


@app.route("/api/check-auth", methods=["GET"])
def check_auth():
    return check_auth_route()

@app.route("/api/check-student-auth", methods=["GET"])
def check_student_auth():
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

@app.route("/api/student-login", methods=["POST"])
def student_login():
    return student_login_route()

@app.route("/api/admin/add-team", methods=["POST"])
def register_manual_team():
    return register_manual_team_route()

@app.route("/api/admin/pending-github", methods=["GET"])
def getnotsubteams_teams():
    return fetch_teamsnosubmission()

@app.route("/api/admin/view-github-submissions", methods=["GET"])
def show_submissions():
    return view_githubsubmission_route()

@app.route("/api/admin/teams", methods=["GET"])
def fetch_teams():
    return fetch_teams_route()

#login route for admin
@app.route("/api/admin-login", methods=["POST"])
def admin_login():
    return admin_login_route()

@app.route("/api/logout", methods=["POST"])
def logout():
    return logout_route()

@app.route("/api/user-info", methods=["GET"])
def get_user_info():
    return get_user_info_route()

@app.route('/api/createproblem-statements', methods=['POST'])
def create_problem_statement():
    return create_problem_statement_route()

@app.route('/api/admin/getallproblem-statements', methods=['GET'])
def admin_get_all_problem_statements():
    admin_token = request.cookies.get("admin_auth")
    if not admin_token:
        return jsonify({"error": "Unauthorized"}), 401

    return get_all_problem_statements_route()

@app.route('/api/student/getallproblem-statements', methods=['GET'])
def student_get_all_problem_statements():
    student_token = request.cookies.get("student_auth")
    if not student_token:
        return jsonify({"error": "Unauthorized"}), 401

    return get_all_visible_problem_statements_route()


@app.route("/api/select-problem-statement", methods=["POST"])
def select_problem_statement():
    return select_problem_statement_route()

# --- New Submission Routes ---
@app.route('/api/submit-ppt', methods=['POST']) # Admin manual submission (existing)
def submit_ppt():
    return submit_ppt_route()

@app.route('/api/submit-ppt-student', methods=['POST']) # Student dashboard submission (NEW)
def submit_ppt_student():
    return submit_ppt_student_route()

# --- GitHub Submission Routes ---
@app.route('/api/submit-link', methods=['POST'])
def submit_link():
    return submit_link_route()

# --- PPT Filter Routes ---
@app.route('/api/admin/teams-without-ppt', methods=['GET'])
def get_teams_without_ppt():
    return get_teams_without_ppt_route()

@app.route('/api/admin/teams-with-ppt', methods=['GET'])
def get_teams_with_ppt():
    return get_teams_with_ppt_route()

# --- PS Selections Routes ---
@app.route('/api/admin/problem-statement/<ps_id>/teams', methods=['GET'])
def get_teams_by_ps(ps_id):
    return get_teams_by_ps_route(ps_id)

if __name__ == "__main__":
    app.run(port=5000, debug=True)