from flask import Flask
from flask_cors import CORS
from validate_hypervision import validate_hypervision_route
from register_team import register_team_route
from payment_routes import save_payment_route
from flask_session import Session  # required for server side sessions

Session(app) #initialize Flask-Session

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

@app.route("/api/validate-hypervision", methods=["POST"])
def validate_hypervision():
    return validate_hypervision_route()

@app.route("/api/register-team", methods=["POST"])
def register_team():
    return register_team_route()

@app.route("/api/save-payment", methods=["POST"])
def save_payment():
    return save_payment_route()

#login route for student
@app.route("/api/student-login", methods=["POST"])
def student_login():
    return student_login_route()

#login route for admin
@app.route("/api/admin-login", methods=["POST"])
def admin_login():
    return admin_login_route()

if __name__ == "__main__":
    app.run(port=5000, debug=True)
