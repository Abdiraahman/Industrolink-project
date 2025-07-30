# Create a new file: authentication.py (in your app directory)
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom authentication class that reads JWT tokens from HTTP-only cookies
    instead of the Authorization header
    """
    
    def authenticate(self, request):
        logger.info(f"CookieJWTAuthentication.authenticate called for path: {request.path}")
        
        # Try to get the access token from cookies
        raw_token = request.COOKIES.get('access_token')
        
        logger.info(f"Access token from cookies: {'Found' if raw_token else 'Not found'}")
        logger.info(f"Available cookies: {list(request.COOKIES.keys())}")
        
        if raw_token is None:
            logger.info("No access token in cookies, returning None")
            return None
        
        try:
            # Validate the token using the parent class method
            logger.info("Attempting to validate token...")
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            logger.info(f"Authentication successful for user: {user.username}")
            return (user, validated_token)
        except TokenError as e:
            logger.error(f"Token validation failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in authentication: {str(e)}")
            return None
    
    def get_header(self, request):
        """
        Override to prevent looking for Authorization header
        since we're using cookies
        """
        return None