import requests
from config import RESEND_API_KEY
import resend

resend.api_key = "re_cEmz7vrE_LqmzYCNnJxAq91rDrtypuhuL"

def send_registration_email(to_email, team_id, password):
    url ="https://api.resend.com/emails"

    r = resend.Emails.send({
        "from": "CodeHustle <no-reply@codehustle.com>",
        "to": to_email,
        "subject": "Your CodeHustle Hackathon Team Credentials",
        "html": f"""
            <h2>Registration Successful!</h2>
            <p>Your team has been registered in the <b>CodeHustle Hackathon</b>.</p>
            <p><b>Team ID:</b> {team_id}</p>
            <p><b>Password:</b> {password}</p>
            <br>
            <p>Use these credentials to log in to the portal.</p>
        """
    })

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }

    requests.post(url, json=r, headers=headers)