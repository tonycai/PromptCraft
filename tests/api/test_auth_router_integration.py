# tests/api/test_auth_router_integration.py
import pytest
from fastapi import status
from fastapi.testclient import TestClient

# Fixtures test_db_session and test_redis_client from conftest.py will be automatically used if named in test functions.
# The api_client fixture provides the TestClient.

# Test data
TEST_USER_EMAIL = "testuser@example.com"
TEST_USER_USERNAME = "testuser"
TEST_USER_PASSWORD = "Str0ngPa$$wOrd!"
TEST_USER_FULL_NAME = "Test User"

@pytest.mark.integration
class TestAuthRouterIntegration:
    # Using a class to group related tests

    def test_register_user_success(self, api_client: TestClient, test_db_session): # test_db_session for cleanup
        response = api_client.post(
            "/api/v1/auth/register",
            json={
                "email": TEST_USER_EMAIL,
                "username": TEST_USER_USERNAME,
                "password": TEST_USER_PASSWORD,
                "full_name": TEST_USER_FULL_NAME
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == TEST_USER_EMAIL
        assert data["username"] == TEST_USER_USERNAME
        assert data["full_name"] == TEST_USER_FULL_NAME
        assert data["is_active"] is True
        assert data["is_verified"] is False
        assert "id" in data

    def test_register_user_duplicate_email(self, api_client: TestClient, test_db_session):
        # First registration (should succeed)
        api_client.post("/api/v1/auth/register", json={"email": "duplicate@example.com", "username": "user1", "password": "password123"})
        
        # Attempt to register with the same email
        response = api_client.post(
            "/api/v1/auth/register", 
            json={"email": "duplicate@example.com", "username": "user2", "password": "password123"}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST # Or 409 Conflict
        assert "Email already registered" in response.json()["detail"]

    def test_register_user_duplicate_username(self, api_client: TestClient, test_db_session):
        api_client.post("/api/v1/auth/register", json={"email": "user1@example.com", "username": "duplicateuser", "password": "password123"})
        response = api_client.post(
            "/api/v1/auth/register", 
            json={"email": "user2@example.com", "username": "duplicateuser", "password": "password123"}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST # Or 409 Conflict
        assert "Username already exists" in response.json()["detail"]

    def test_login_success_with_username(self, api_client: TestClient, test_db_session):
        # Register user first
        api_client.post(
            "/api/v1/auth/register", 
            json={"email": TEST_USER_EMAIL, "username": TEST_USER_USERNAME, "password": TEST_USER_PASSWORD}
        )
        
        login_data = {"username": TEST_USER_USERNAME, "password": TEST_USER_PASSWORD}
        response = api_client.post("/api/v1/auth/login", data=login_data) # OAuth2 uses form data
        
        assert response.status_code == status.HTTP_200_OK
        tokens = response.json()
        assert "access_token" in tokens
        assert "refresh_token" in tokens
        assert tokens["token_type"] == "bearer"

    def test_login_success_with_email(self, api_client: TestClient, test_db_session):
        api_client.post(
            "/api/v1/auth/register", 
            json={"email": "loginemail@example.com", "username": "loginemailuser", "password": TEST_USER_PASSWORD}
        )
        login_data = {"username": "loginemail@example.com", "password": TEST_USER_PASSWORD} # Use email as username
        response = api_client.post("/api/v1/auth/login", data=login_data)
        assert response.status_code == status.HTTP_200_OK
        tokens = response.json()
        assert "access_token" in tokens

    def test_login_failure_wrong_password(self, api_client: TestClient, test_db_session):
        api_client.post(
            "/api/v1/auth/register", 
            json={"email": TEST_USER_EMAIL, "username": TEST_USER_USERNAME, "password": TEST_USER_PASSWORD}
        )
        login_data = {"username": TEST_USER_USERNAME, "password": "wrongpassword"}
        response = api_client.post("/api/v1/auth/login", data=login_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED # Custom exception maps to 401

    def test_login_failure_user_not_found(self, api_client: TestClient, test_db_session):
        login_data = {"username": "nonexistentuser", "password": "anypassword"}
        response = api_client.post("/api/v1/auth/login", data=login_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_read_users_me_success(self, api_client: TestClient, test_db_session):
        # Register and login to get token
        reg_response = api_client.post(
            "/api/v1/auth/register", 
            json={"email": TEST_USER_EMAIL, "username": TEST_USER_USERNAME, "password": TEST_USER_PASSWORD}
        )
        user_id = reg_response.json()["id"]

        login_data = {"username": TEST_USER_USERNAME, "password": TEST_USER_PASSWORD}
        login_response = api_client.post("/api/v1/auth/login", data=login_data)
        access_token = login_response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {access_token}"}
        response = api_client.get("/api/v1/auth/users/me", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == TEST_USER_EMAIL
        assert data["username"] == TEST_USER_USERNAME
        assert data["id"] == user_id

    def test_read_users_me_no_token(self, api_client: TestClient, test_db_session):
        response = api_client.get("/api/v1/auth/users/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED # FastAPI default for missing OAuth2 token
        assert response.json()["detail"] == "Not authenticated"

    def test_read_users_me_invalid_token(self, api_client: TestClient, test_db_session):
        headers = {"Authorization": "Bearer invalidtoken"}
        response = api_client.get("/api/v1/auth/users/me", headers=headers)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Could not validate credentials" in response.json()["detail"]

    # Basic Email Verification Flow Tests (Placeholders for actual email sending)
    def test_request_email_verification_success(self, api_client: TestClient, test_db_session):
        # Register user (they are not verified by default)
        api_client.post("/api/v1/auth/register", json={
            "email": "verify@example.com", "username": "verifyuser", "password": "password123"
        })
        response = api_client.post("/api/v1/auth/request-email-verification", json={"email": "verify@example.com"})
        assert response.status_code == status.HTTP_200_OK
        assert "Verification email has been sent" in response.json()["message"]

    def test_verify_email_success(self, api_client: TestClient, test_db_session, mocker):
        # 1. Register User
        reg_payload = {"email": "verify success@example.com", "username": "verifysuccess", "password": "password123"}
        api_client.post("/api/v1/auth/register", json=reg_payload)

        # 2. Mock parts of auth_utils to control token generation for testing this flow
        #    Or, more simply, call the request-verification and extract the token if possible (difficult without email)
        #    For this test, we'll generate a token directly as if it was sent.
        from promptcraft import auth_utils as 실제auth_utils # use alias to avoid conflict with module name
        verification_jwt = 실제auth_utils.generate_email_verification_jwt(reg_payload["email"])
        
        # 3. Verify Email
        response = api_client.post("/api/v1/auth/verify-email", json={"token": verification_jwt})
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["message"] == "Email successfully verified."

        # Check in DB (optional, but good for integration test)
        # This requires a way to get the db_handler used by the app, or a new one for test db
        # For simplicity, assuming test_db_session fixture handles env vars for the app's db_handler
        from promptcraft.database.db_handler import DatabaseHandler as AppDBHandler
        app_db = AppDBHandler() # Will use test DB credentials due to env var setup by pytest runner
        user = app_db.get_user_by_email(reg_payload["email"])
        assert user is not None
        assert user['is_verified'] is True

    def test_verify_email_invalid_token(self, api_client: TestClient, test_db_session):
        response = api_client.post("/api/v1/auth/verify-email", json={"token": "invalidjwttoken"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid or expired verification token" in response.json()["detail"]

# TODO: Add integration tests for other endpoints (questions, submissions, evaluations) once they are protected.
# TODO: Add tests for refresh token mechanism when implemented.
# TODO: Add tests for password reset flow when implemented. 