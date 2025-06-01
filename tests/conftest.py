import sys
import os
import pytest
from fastapi.testclient import TestClient
import mysql.connector
from mysql.connector import Error
import redis
from fastapi import status

# Ensure project root is on sys.path for imports
tests_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(tests_dir, os.pardir))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Now we can import from the application
from api.main import app # Your FastAPI app instance
from promptcraft.database.db_handler import DatabaseHandler # To interact with DB for setup/teardown
from promptcraft.logger_config import setup_logger
from promptcraft.schemas.auth_schemas import UserCreate # For creating user
from promptcraft import auth_utils # For creating tokens directly if needed for fixture

logger = setup_logger(__name__)

# --- Test Client Fixture ---
@pytest.fixture(scope="module") # Can be session or module scoped
def api_client():
    """Provides a TestClient instance for making API requests."""
    with TestClient(app) as client:
        logger.info("TestClient created.")
        yield client
    logger.info("TestClient closed.")

# --- Database Fixtures ---
@pytest.fixture(scope="session")
def mysql_test_db_connection_details():
    """Provides connection details for the test MySQL database from environment variables."""
    return {
        "host": os.getenv("MYSQL_HOST_TEST", "127.0.0.1"), # Default to localhost if CI maps service to localhost
        "port": int(os.getenv("MYSQL_PORT_TEST", 3307)), # Use a different port or DB name for tests
        "user": os.getenv("MYSQL_USER_TEST", "test_user"),
        "password": os.getenv("MYSQL_PASSWORD_TEST", "test_password"),
        "database": os.getenv("MYSQL_DATABASE_TEST", "test_promptcraft_db")
    }

@pytest.fixture(scope="session")
def setup_test_database(mysql_test_db_connection_details):
    """Session-scoped fixture to ensure the test database and tables are created."""
    details = mysql_test_db_connection_details
    logger.info(f"Setting up test database: {details['database']} at {details['host']}:{details['port']}")
    
    # Temporarily override env vars for DatabaseHandler to point to test DB for setup
    # This is a bit of a workaround due to global DatabaseHandler instantiation.
    # Ideally, DatabaseHandler would take config directly or be injectable.
    original_env = {}
    env_vars_to_set = {
        "MYSQL_HOST": details["host"],
        "MYSQL_PORT": str(details["port"]),
        "MYSQL_USER": details["user"],
        "MYSQL_PASSWORD": details["password"],
        "MYSQL_DATABASE": details["database"]
    }
    for k, v in env_vars_to_set.items():
        original_env[k] = os.environ.get(k)
        os.environ[k] = v
        logger.debug(f"Set env var for test DB setup: {k}={v}")

    db_handler_for_setup = DatabaseHandler() # This will now use the overridden env vars
    try:
        db_handler_for_setup.ensure_database_exists() # Creates DB if not exists
        db_handler_for_setup.initialize_tables()    # Creates tables if not exist
        logger.info("Test database and tables initialized.")
    except Exception as e:
        logger.error(f"Failed to setup test database: {e}", exc_info=True)
        raise
    finally:
        # Restore original environment variables
        for k, v in original_env.items():
            if v is None:
                del os.environ[k]
            else:
                os.environ[k] = v
            logger.debug(f"Restored env var: {k}")
    yield # This fixture only runs setup once per session
    logger.info("Test session finished. Test database was set up.")

@pytest.fixture(scope="function")
def test_db_session(setup_test_database, mysql_test_db_connection_details):
    """
    Provides a test database session and handles cleanup (truncating tables) after each test.
    Relies on setup_test_database to ensure DB and tables exist.
    """
    details = mysql_test_db_connection_details
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(auth_plugin='caching_sha2_password', **details)
        cursor = conn.cursor()
        logger.debug("Connected to test DB for test function.")
        yield conn # Not strictly necessary to yield conn if tests use the app's db_handler
                 # which should also be pointing to the test DB via env vars set by CI/local test script.
    finally:
        if cursor:
            # Truncate tables to clean up for the next test
            # Order matters if there are foreign key constraints
            tables_to_truncate = ["email_verification_tokens", "users", "exam_questions", "questions", "submissions", "evaluations"]
            logger.debug(f"Truncating tables: {tables_to_truncate}")
            try:
                cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
                for table in tables_to_truncate:
                    cursor.execute(f"SHOW TABLES LIKE '{table}';")
                    if cursor.fetchone():
                        cursor.execute(f"TRUNCATE TABLE {table}")
                    else:
                        logger.warning(f"Table {table} not found for truncation, skipping.")
                cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
                conn.commit()
                logger.info("Test database tables truncated.")
            except Error as e:
                logger.error(f"Error truncating test database tables: {e}")
            cursor.close()
        if conn and conn.is_connected():
            conn.close()
            logger.debug("Closed connection to test DB for test function.")

# --- Redis Fixture ---
@pytest.fixture(scope="session") # Or module
def redis_test_client_details():
    return {
        "host": os.getenv("REDIS_HOST_TEST", "127.0.0.1"),
        "port": int(os.getenv("REDIS_PORT_TEST", 6380)), # Use a different port for test Redis
        "db": int(os.getenv("REDIS_DB_TEST", 1)) # Use a different DB index
    }

@pytest.fixture(scope="function")
def test_redis_client(redis_test_client_details):
    """Provides a Redis client connected to a test instance and flushes the DB after each test."""
    details = redis_test_client_details
    try:
        r = redis.Redis(host=details["host"], port=details["port"], db=details["db"], decode_responses=True)
        r.ping() # Test connection
        logger.info(f"Connected to test Redis: {details['host']}:{details['port']}/DB{details['db']}")
        yield r
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Could not connect to test Redis: {e}. Skipping Redis tests or failing hard.")
        pytest.skip(f"Cannot connect to test Redis: {e}") # Skip tests if Redis unavailable
        return None # Should not be reached if pytest.skip works
    finally:
        if 'r' in locals() and r is not None:
            try:
                logger.debug(f"Flushing test Redis DB: {details['db']}")
                r.flushdb()
                logger.info(f"Test Redis DB {details['db']} flushed.")
            except redis.exceptions.RedisError as e:
                logger.error(f"Error flushing test Redis DB: {e}")
            r.close()

# Note: For these fixtures to correctly influence the DatabaseHandler and RedisCache 
# used by the TestClient(app), you need to ensure that the environment variables 
# (MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, etc., and REDIS_HOST, REDIS_PORT) 
# are set to the *test* instance values *before* the TestClient(app) is created 
# and thus before api.main and its routers import and instantiate these handlers globally.
# This is typically handled by how you run pytest (e.g., setting env vars in the CI script 
# or a local test runner script).

# --- Authentication Fixtures ---
@pytest.fixture(scope="function")
def create_test_user_and_token(api_client: TestClient, test_db_session, unique_id: str = "_test_user_fixture") -> dict:
    test_username = f"fixtureuser{unique_id}" # Ensure uniqueness for parallel or repeated runs
    test_email = f"fixtureuser{unique_id}@example.com"
    test_password = "TestP@$$wOrdFixture123"

    registration_payload = {
        "email": test_email,
        "username": test_username,
        "password": test_password,
        "full_name": f"Fixture User {unique_id}"
    }
    reg_response = api_client.post("/api/v1/auth/register", json=registration_payload)
    
    user_data_from_reg = None
    if reg_response.status_code == status.HTTP_201_CREATED:
        user_data_from_reg = reg_response.json()
        logger.info(f"Fixture: Registered user {test_username}.")
    elif reg_response.status_code == status.HTTP_400_BAD_REQUEST and \
         ("Email already registered" in reg_response.text or "Username already exists" in reg_response.text):
        logger.warning(f"Fixture: User {test_username} or email {test_email} already exists. Attempting login.")
    else:
        # If registration failed for another reason, raise an error to make the test fail clearly here
        pytest.fail(f"Fixture: Test user registration for {test_username} failed unexpectedly. Status: {reg_response.status_code}, Body: {reg_response.text}")

    login_data = {"username": test_username, "password": test_password}
    login_response = api_client.post("/api/v1/auth/login", data=login_data)
    
    if login_response.status_code != status.HTTP_200_OK:
        pytest.fail(f"Fixture: Login failed for user {test_username} after registration attempt. Status: {login_response.status_code}, Body: {login_response.text}")

    tokens = login_response.json()
    access_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    # Fetch user ID from /me endpoint if not available directly from registration if it was skipped
    if user_data_from_reg and "id" in user_data_from_reg:
        user_id = user_data_from_reg["id"]
    else:
        me_response = api_client.get("/api/v1/auth/users/me", headers=headers)
        if me_response.status_code != status.HTTP_200_OK:
            pytest.fail(f"Fixture: Could not fetch /users/me for {test_username} after login. Status: {me_response.status_code}, Body: {me_response.text}")
        user_id = me_response.json()["id"]

    logger.info(f"Fixture: Created/logged in test user and token for: {test_username}, ID: {user_id}")
    return {
        "user_id": user_id,
        "username": test_username,
        "email": test_email,
        "access_token": access_token,
        "headers": headers
    }

@pytest.fixture(scope="function")
def create_sample_question(test_db_session) -> int:
    # This fixture assumes that the DatabaseHandler used by the application
    # will pick up the test database credentials from environment variables set by the test runner/CI.
    # For direct DB manipulation in tests, it's often better to use the 'test_db_session' (raw connection)
    # or a DatabaseHandler instance explicitly configured for the test DB.
    
    # Using a new DatabaseHandler instance that should pick up test env vars
    db_h = DatabaseHandler() 
    sample_desc = "Sample question for integration testing"
    q_id = db_h.add_question(
        description=sample_desc,
        expected_outcome="Integration test passes.",
        evaluation_criteria=["test_crit_1", "test_crit_2"],
        programming_language="Python_Test",
        difficulty_level="TestEasy"
    )
    if q_id is None:
        pytest.fail("Fixture: Failed to create sample question directly in DB.")
    logger.info(f"Fixture: Created sample question with ID: {q_id}.")
    return q_id