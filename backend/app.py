# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from validate_hypervision import validate_hypervision_route
from register_team import register_team_route, check_team_name_route, register_manual_team_route
from verify_payment import verify_payment_route
from webhook_handler import razorpay_webhook_handler
from login import student_login_route,admin_login_route, check_auth_route, check_student_auth_route
from logout import logout_route
from problemstatement import create_problem_statement_route, get_all_problem_statements_route 
from submit_ppt import submit_ppt_route, submit_ppt_student_route # Import new route
from user_access import fetch_teams_route, get_user_info_route


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

@app.route('/api/getallproblem-statements', methods=['GET'])
def get_all_problem_statements():
    return get_all_problem_statements_route()

@app.route("/api/ps-status", methods=["GET"])
def get_ps_status():
    return get_ps_selection_status_route()

@app.route("/api/lock-team-ps", methods=["POST"])
def lock_team_ps():
    return lock_team_ps_route()

# --- New Submission Routes ---
@app.route('/api/submit-ppt', methods=['POST']) # Admin manual submission (existing)
def submit_ppt():
    return submit_ppt_route()

@app.route('/api/submit-ppt-student', methods=['POST']) # Student dashboard submission (NEW)
def submit_ppt_student():
    return submit_ppt_student_route()

@app.route("/api/admin/update-settings", methods=["POST"])
def update_settings():
    data = request.get_json()
    # This updates the global config in your MongoDB
    db.settings.update_one(
        {"_id": "global_config"},
        {"$set": {
            "ps_selection_locked": data.get("ps_selection_locked"),
            "ppt_upload_locked": data.get("ppt_upload_locked")
        }},
        upsert=True
    )
    return jsonify({"success": True}), 200

if __name__ == "__main__":
    app.run(port=5000, debug=True)