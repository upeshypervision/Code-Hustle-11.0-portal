from config import RESEND_APIKEY
import resend

resend.api_key = RESEND_APIKEY
def send_registration_email(email_id,team_id,password):
    resend.Emails.send({
        "from": "noreply@upeshypervision.in",
        "to": f"{email_id}",
        "subject": "Code Hustle 11.0 Team Credentials",
        "html": f"""
<table width="100%" bgcolor="#242424" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center">

      <!-- Top image -->
      <img
        src="https://raw.githubusercontent.com/dev-rjav/BORING_IMAGE_ASSET_TUFF/refs/heads/main/CODE%20HUSTLE%2011.0top.png"
        width="600"
        style="display:block;"
        alt=""
      />

      <!-- HTML content -->
      <table width="600" bgcolor="#242424" cellpadding="24" cellspacing="0">
        <tr>
          <td
          align="centre"
          style="font-family:Arial, sans-serif; font-size:18px; color:#FFFFFF;">
            <CENTRE><strong>TEAM ID:</strong> <span style="font-size:22px; font-weight:bold;">
  {team_id}
</span><br><br></CENTRE>
            <CENTRE><strong>PASSWORD:</strong><span style="font-size:22px; font-weight:bold;">
  {password}
</span></CENTRE>
          </td>
        </tr>
      </table>

      <!-- Bottom image -->
      <img
        src="https://raw.githubusercontent.com/dev-rjav/BORING_IMAGE_ASSET_TUFF/refs/heads/main/CODE%20HUSTLE%2011.0bottom.png"
        width="600"
        style="display:block;"
        alt=""
      />

<!-- Social media footer -->
<table width="600" cellpadding="16" cellspacing="0" bgcolor="#242424">
  
  <!-- WhatsApp text -->
  <tr>
    <td align="center" style="font-family:Arial, sans-serif; font-size:18px; color:#cccccc;">
      Join the Whatsapp Group for further updates
    </td>
  </tr>

  <!-- WhatsApp icon -->
  <tr>
    <td align="center">
      <a href="WA link here">
        <img
          src="https://raw.githubusercontent.com/dev-rjav/BORING_IMAGE_ASSET_TUFF/main/download.png"
          width="48"
          alt="Whatsapp"
          style="display:block;"
        >
      </a>
    </td>
  </tr>

  <!-- Portal text -->
  <tr>
    <td align="center" style="font-family:Arial, sans-serif; font-size:18px; color:#cccccc; padding-top:12px;">
      Login into the portal
    </td>
  </tr>

  <!-- Website icon -->
  <tr>
    <td align="center">
      <a href="https://codehustle11.upeshypervision.in/userlogin">
        <img
          src="https://raw.githubusercontent.com/dev-rjav/BORING_IMAGE_ASSET_TUFF/refs/heads/main/34629272.png"
          width="68"
          alt="Website"
          style="display:block;"
        >
      </a>
    </td>
  </tr>

</table>
</table>
"""

    })
