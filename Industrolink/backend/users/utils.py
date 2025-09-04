import uuid
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings


def generate_verification_token():
    """Generate a unique verification token"""
    return str(uuid.uuid4())


def send_verification_email(user, verification_url):
    """Send verification email to user"""
    subject = settings.EMAIL_VERIFICATION_SUBJECT
    from_email = settings.EMAIL_VERIFICATION_FROM_EMAIL
    to_email = user.email
    
    # Plain text email message
    message = f"""
Hello {user.first_name} {user.last_name},

Thank you for registering with Industrolink! To complete your registration and access your account, please verify your email address by clicking the link below:

{verification_url}

Important: This verification link will expire in {settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS} hours. If you don't verify your email within this time, you'll need to request a new verification email.

If the link above doesn't work, you can copy and paste it into your browser.

If you didn't create an account with Industrolink, please ignore this email.

Best regards,
The Industrolink Team

---
This is an automated message from Industrolink. Please do not reply to this email.
© 2025 Industrolink. All rights reserved.
"""
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[to_email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        # In production, this should be logged to a proper logging system
        # For now, we'll silently fail to avoid cluttering logs
        return False


def is_verification_token_expired(user):
    """Check if verification token has expired"""
    if not user.email_verification_sent_at:
        return True
    
    expiry_time = user.email_verification_sent_at + timedelta(
        hours=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS
    )
    return timezone.now() > expiry_time


def verify_email_token(user, token):
    """Verify the email verification token"""
    if user.email_verification_token != token:
        return False, "Invalid verification token"
    
    if is_verification_token_expired(user):
        return False, "Verification token has expired"
    
    # Mark email as verified
    user.email_verified = True
    user.email_verification_token = None
    user.email_verification_sent_at = None
    user.save()
    
    return True, "Email verified successfully"
