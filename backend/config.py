RAZORPAY_KEY_ID = "rzp_test_RqvUfnHc6it8fP"
RAZORPAY_KEY_SECRET = "vFyXlsqZ0225MLg3dVb0kXNV"
RAZORPAY_WEBHOOK_SECRET ="TZ46VyKTG4_xvts"

# GMAIL SMTP CONFIGURATION
MAIL_SERVER = "smtp.gmail.com"
MAIL_PORT = 587
MAIL_USERNAME = "falconxbl69@gmail.com"  # <--- ENTER YOUR GMAIL HERE
MAIL_PASSWORD = "YOUR_APP_PASSWORD"             # <--- ENTER YOUR APP PASSWORD HERE
MAIL_USE_TLS = True

JWT_SECRET = "super-secret-key-change-this"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

# ENVIRONMENT & SECURITY
# Set to True when deploying to production with HTTPS
IS_PRODUCTION = False
COOKIE_SECURE = IS_PRODUCTION  # Auto-sets secure flag based on environment

#Resend Configuration
RESEND_APIKEY="re_P1UqJ27D_HyoJ32H2HxCYqT72DiLd3jPr"