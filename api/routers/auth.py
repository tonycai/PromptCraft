# api/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer # For login form and dependency
from typing import Any

from promptcraft.database.db_handler import DatabaseHandler
from promptcraft.schemas.auth_schemas import UserCreate, UserResponse, Token, LoginRequest, Msg, EmailVerificationRequest, VerifyTokenRequest
from promptcraft import auth_utils # Renamed from auth_utils to avoid conflict
from promptcraft.exceptions import BadRequestException, NotFoundException
from promptcraft.logger_config import setup_logger
from promptcraft.email_service import email_service

logger = setup_logger(__name__)
router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

db_handler = DatabaseHandler() # Consider FastAPI dependency injection

# Add OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login") # Points to your login endpoint

# Dependency to get current user from token
async def get_current_active_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = auth_utils.decode_token(token)
    if payload is None:
        logger.warning("Token decoding failed or token is invalid/expired.")
        raise credentials_exception
    
    user_id_str = payload.get("sub")
    if user_id_str is None:
        logger.warning("Token payload missing 'sub' (user_id). Payload: %s", payload)
        raise credentials_exception
    try:
        user_id = int(user_id_str)
    except ValueError:
        logger.warning("Token 'sub' (user_id) is not a valid integer. Payload: %s", payload)
        raise credentials_exception

    user_data = db_handler.get_user_by_id(user_id=user_id)
    if user_data is None:
        logger.warning(f"User with ID {user_id} from token not found in DB.")
        raise credentials_exception
    
    if not user_data.get("is_active"):
        logger.warning(f"User {user_data.get('username')} is inactive.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    
    if not user_data.get("is_verified"):
        logger.warning(f"User {user_data.get('username')} has not verified their email address.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Email address not verified. Please check your email and verify your account before accessing this resource."
        )
    
    # Validate token type if you added it during creation
    # token_type = payload.get("type")
    # if token_type != "access":
    #     logger.warning(f"Invalid token type: {token_type}. Expected 'access'.")
    #     raise credentials_exception

    return UserResponse.model_validate(user_data)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate) -> Any:
    logger.info(f"Registration attempt for username: {user_in.username}, email: {user_in.email}")
    # Check if user already exists by username or email
    existing_user_by_email = db_handler.get_user_by_email(email=user_in.email)
    if existing_user_by_email:
        logger.warning(f"Registration failed: Email {user_in.email} already registered.")
        raise BadRequestException(detail="Email already registered.")
    
    existing_user_by_username = db_handler.get_user_by_username(username=user_in.username)
    if existing_user_by_username:
        logger.warning(f"Registration failed: Username {user_in.username} already exists.")
        raise BadRequestException(detail="Username already exists.")

    hashed_password = auth_utils.get_password_hash(user_in.password)
    user_id = db_handler.create_user(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hashed_password,
        full_name=user_in.full_name
    )
    if not user_id:
        logger.error(f"Failed to create user {user_in.username} in database after checks passed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create user at this time.",
        )
    
    # Fetch the created user to return (or construct if create_user returned full object)
    # For now, get_user_by_id will work.
    created_user_data = db_handler.get_user_by_id(user_id)
    if not created_user_data:
         logger.error(f"Could not retrieve user {user_id} immediately after creation.")
         # This case should ideally not happen if user_id was returned.
         # Return a generic message or a specific error.
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User created but could not be retrieved.")

    logger.info(f"User {user_in.username} registered successfully with ID: {user_id}.")
    
    # Send verification email automatically
    try:
        verification_jwt = auth_utils.generate_email_verification_jwt(created_user_data['email'])
        verification_link = f"https://promptcraft.aiw3.ai/verify-email?token={verification_jwt}"
        
        email_sent = email_service.send_verification_email(created_user_data['email'], verification_link)
        if email_sent:
            logger.info(f"Verification email sent successfully to {created_user_data['email']}")
        else:
            logger.error(f"Failed to send verification email to {created_user_data['email']}")
            # Don't fail registration if email fails, but log the issue
    except Exception as e:
        logger.error(f"Error sending verification email for {created_user_data['email']}: {e}")
        # Continue with registration even if email fails

    return UserResponse.model_validate(created_user_data) # Pydantic v2

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # OAuth2PasswordRequestForm uses 'username' and 'password' fields
    # We allow login with either email or username
    logger.info(f"Login attempt for user: {form_data.username}")
    user_data = db_handler.get_user_by_username(username=form_data.username) 
    if not user_data:
        user_data = db_handler.get_user_by_email(email=form_data.username)

    if not user_data or not auth_utils.verify_password(form_data.password, user_data["hashed_password"]):
        logger.warning(f"Login failed for user: {form_data.username}. Invalid credentials.")
        raise BadRequestException(detail="Incorrect username/email or password", status_code=status.HTTP_401_UNAUTHORIZED)
    
    if not user_data.get("is_active"):
        logger.warning(f"Login failed for inactive user: {form_data.username}")
        raise BadRequestException(detail="Inactive user account.", status_code=status.HTTP_400_BAD_REQUEST)
    
    if not user_data.get("is_verified"):
        logger.warning(f"Login failed for unverified user: {form_data.username}")
        raise BadRequestException(detail="Email address not verified. Please check your email and verify your account before logging in.", status_code=status.HTTP_403_FORBIDDEN)
    
    # For JWT subject, use username or user_id. Using user_id is often better.
    # The 'sub' (subject) of the token. 
    # Standard practice is to use something unique that identifies the user, like user ID.
    subject_data = {"sub": str(user_data["id"]), "username": user_data["username"]} 
    
    access_token = auth_utils.create_access_token(data=subject_data)
    refresh_token = auth_utils.create_refresh_token(data=subject_data)
    logger.info(f"User {user_data['username']} (ID: {user_data['id']}) logged in successfully.")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

# --- Placeholder for Email Verification --- 
# (Actual email sending logic is complex and out of scope for this step)

@router.post("/request-email-verification", response_model=Msg)
async def request_email_verification_link(request: EmailVerificationRequest):
    logger.info(f"Email verification requested for: {request.email}")
    user = db_handler.get_user_by_email(request.email)
    if not user:
        raise NotFoundException(detail="User with this email not found.")
    if user['is_verified']:
        raise BadRequestException(detail="Email is already verified.")

    # 1. Generate JWT-based verification token (or opaque token)
    verification_jwt = auth_utils.generate_email_verification_jwt(user['email'])
    
    # 2. Store opaque token if not using JWT's self-contained nature
    # expires_at = (datetime.now(timezone.utc) + timedelta(hours=auth_utils.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS)).isoformat()
    # db_handler.create_email_verification_token(user_id=user['id'], token=verification_jwt, expires_at=expires_at)

    # 3. Send email with Mailchimp
    verification_link = f"https://promptcraft.aiw3.ai/verify-email?token={verification_jwt}" # Frontend URL
    logger.info(f"Generated verification link for {request.email}: {verification_link}")
    
    email_sent = email_service.send_verification_email(user['email'], verification_link)
    if not email_sent:
        logger.error(f"Failed to send verification email to {request.email}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please try again later."
        )

    return {"message": "Verification email has been sent successfully."}

@router.post("/verify-email", response_model=Msg)
async def verify_user_email(request: VerifyTokenRequest):
    token = request.token
    logger.info(f"Attempting to verify email with token: {token[:20]}...")
    
    email_from_jwt = auth_utils.verify_email_verification_jwt(token)
    
    if not email_from_jwt:
        logger.warning(f"Email verification failed: Invalid or expired JWT.")
        raise BadRequestException(detail="Invalid or expired verification token (JWT).", status_code=status.HTTP_400_BAD_REQUEST)

    user = db_handler.get_user_by_email(email_from_jwt)
    if not user:
        logger.error(f"Email verification error: User {email_from_jwt} from valid token not found in DB.")
        raise BadRequestException(detail="Invalid verification token, user not found.", status_code=status.HTTP_400_BAD_REQUEST)

    if user['is_verified']:
        logger.info(f"Email {email_from_jwt} already verified.")
        return {"message": "Email is already verified."}

    if db_handler.set_user_verified(user_id=user['id']):
        logger.info(f"Email {email_from_jwt} (User ID: {user['id']}) successfully verified.")
        # Optional: Delete the specific token if it were an opaque one stored in DB and meant for single use.
        # db_handler.delete_email_verification_token(token) # If using opaque tokens and they are stored
        return {"message": "Email successfully verified."}
    else:
        logger.error(f"Failed to update user {user['id']} to verified status in DB.")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not verify email at this time.")

@router.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_active_user)):
    """Fetch the current authenticated user."""
    logger.info(f"User {current_user.username} (ID: {current_user.id}) accessed /users/me endpoint.")
    return current_user

# Note: Refresh token, password reset, account activation (if different from verification),
# security headers, CORS, rate limiting, and Mailchimp integration are further steps. 