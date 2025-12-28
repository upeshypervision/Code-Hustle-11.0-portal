import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import MAIL_SERVER, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_USE_TLS

def send_registration_email(to_email, team_id, password):
    try:
        msg = MIMEMultipart()
        msg['From'] = f"CodeHustle Team <{MAIL_USERNAME}>"
        msg['To'] = to_email
        msg['Subject'] = "Your CodeHustle Hackathon Team Credentials"

        html_content = f"""
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #4F46E5;">Registration Successful!</h2>
                <p>Your team has been successfully registered for the <b>CodeHustle Hackathon</b>.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><b>Team ID:</b> <span style="font-family: monospace; font-size: 1.2em;">{team_id}</span></p>
                    <p style="margin: 5px 0;"><b>Password:</b> <span style="font-family: monospace; font-size: 1.2em;">{password}</span></p>
                </div>
                <p>Please use these credentials to log in to the participant portal.</p>
                <br>
                <p style="font-size: 0.9em; color: #666;">Best regards,<br>Team CodeHustle</p>
            </div>
        """

        msg.attach(MIMEText(html_content, 'html'))

        # SMTP Connection
        server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
        if MAIL_USE_TLS:
            server.starttls()
        
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False