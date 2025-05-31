# promptcraft/auth_utils.py
import os
import secrets
from datetime import datetime, timedelta, timezone # Ensure timezone awareness
from typing import Optional, Dict, Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from promptcraft.logger_config import setup_logger
from promptcraft.exceptions import BadRequestException # For token validation errors

logger = setup_logger(__name__)

# --- Password Hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# --- JWT Configuration ---
# These should be loaded from environment variables for security
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "a_very_secret_key_that_should_be_long_and_random_and_from_env")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

if SECRET_KEY == "a_very_secret_key_that_should_be_long_and_random_and_from_env":
    logger.warning("Using default JWT_SECRET_KEY. This is INSECURE. Set a strong JWT_SECRET_KEY environment variable.")

# --- JWT Token Creation ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"}) # Add a 'type' claim
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- JWT Token Decoding/Validation (Basic) ---
def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"JWT decoding/validation error: {e}")
        # Depending on strictness, could raise custom exception here
        # For example, raise BadRequestException(detail="Invalid or expired token")
        return None # Or re-raise specific errors for different handling

# --- Secure Token Generation (for email verification, password reset) ---
def generate_secure_token(length: int = 32) -> str:
    """Generates a cryptographically secure, URL-safe text string."""
    return secrets.token_urlsafe(length)

# --- Email Verification Token Specifics ---
EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS = int(os.getenv("EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS", 24))

def create_email_verification_token_data(email: str) -> Dict[str, Any]:
    expires = datetime.now(timezone.utc) + timedelta(hours=EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS)
    return {"sub": email, "purpose": "email_verification", "exp": expires}

def generate_email_verification_jwt(email: str) -> str:
    token_data = create_email_verification_token_data(email)
    return jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

def verify_email_verification_jwt(token: str) -> Optional[str]: # Returns email if valid
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") == "email_verification" and payload.get("exp") > datetime.now(timezone.utc).timestamp():
            return payload.get("sub") # email
        logger.warning(f"Email verification token invalid or expired: purpose={payload.get('purpose')}, exp={payload.get('exp')}")
    except JWTError as e:
        logger.error(f"Error decoding email verification token: {e}")
    return None

# --- Password Reset Token Specifics (Example - can be JWT or opaque token stored in DB) ---
# Using JWT for this example as well, similar to email verification.
PASSWORD_RESET_TOKEN_EXPIRE_HOURS = int(os.getenv("PASSWORD_RESET_TOKEN_EXPIRE_HOURS", 1))

def create_password_reset_token_data(user_id: Any) -> Dict[str, Any]: # user_id can be int or str
    expires = datetime.now(timezone.utc) + timedelta(hours=PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
    return {"sub": str(user_id), "purpose": "password_reset", "exp": expires}

def generate_password_reset_jwt(user_id: Any) -> str:
    token_data = create_password_reset_token_data(user_id)
    return jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

def verify_password_reset_jwt(token: str) -> Optional[str]: # Returns user_id if valid
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") == "password_reset" and payload.get("exp") > datetime.now(timezone.utc).timestamp():
            return payload.get("sub") # user_id
        logger.warning(f"Password reset token invalid or expired: purpose={payload.get('purpose')}, exp={payload.get('exp')}")
    except JWTError as e:
        logger.error(f"Error decoding password reset token: {e}")
    return None 