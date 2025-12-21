from flask import Flask
from flask_cors import CORS
# Ensure these function names match exactly what is in your files
from register_team import register_team_route, save_payment_route 

app = Flask(__name__)

# Allow your Vite frontend (port 5173) to communicate with this backend
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# -------------------------------------------------------
# ROUTES - Updated to match your React fetch calls
# -------------------------------------------------------

@app.route("/register_team", methods=["POST"])
def register_team():
    """Handles initial registration and Razorpay order creation"""
    return register_team_route()

@app.route("/save-payment", methods=["POST"])
def save_payment():
    """Finalizes registration after successful payment"""
    return save_payment_route()

# If you still need the separate validation route:
@app.route("/validate-hypervision", methods=["POST"])
def validate_hypervision():
    # Note: Ensure this function is imported if you use it
    from validate_hypervision import validate_hypervision_route
    return validate_hypervision_route()

if __name__ == "__main__":
    # Running on port 5000
    app.run(port=5000, debug=True)