from config import RESEND_APIKEY
import resend

resend.api_key = RESEND_APIKEY
def send_registration_email(email_id,team_id,password):
    resend.Emails.send({
        "from": "noreply@upeshypervision.in",
        "to": f"{email_id}",
        "subject": "Code Hustle 11.0 Team Credentials",
        "html": f"""
    <table width="100%" bgcolor="#1c1c1c" cellpadding="0" cellspacing="0">
    <tr>
        <td align="center">

        <!-- Top image -->
        <img
            src="https://i.postimg.cc/xTNH1Gfh/CODE-HUSTLE-11-0top.png"
            width="600"
            style="display:block;"
            alt=""
        />

        <!-- HTML content -->
        <table width="600" bgcolor="#242424" cellpadding="24" cellspacing="0">
            <tr>
            <td style="font-family:Arial, sans-serif; font-size:16px; color:#FFFFFF;">
                <CENTRE><strong>TEAM ID:</strong> {team_id}<br><br></CENTRE>
                <CENTRE><strong>PASSWORD:</strong> {password}</CENTRE>
            </td>
            </tr>
        </table>

        <!-- Bottom image -->
        <img
            src="https://i.postimg.cc/QC2FTP86/CODE-HUSTLE-11-0bottom.png"
            width="600"
            style="display:block;"
            alt=""
        />

        </td>
    </tr>
    </table>
    """
    })
