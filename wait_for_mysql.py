#!/usr/bin/env python3
"""
Wait for MySQL to be ready before proceeding with database initialization.
"""
import os
import time
import sys
import mysql.connector
from mysql.connector import Error

def wait_for_mysql():
    """Wait for MySQL to be available and ready."""
    mysql_host = os.getenv('MYSQL_HOST', 'mysql_db')
    # Use internal MySQL port (3306) for Docker network communication
    mysql_port = 3306  # MySQL always runs on 3306 inside the container
    mysql_user = os.getenv('MYSQL_USER', 'promptcraft_user')
    mysql_password = os.getenv('MYSQL_PASSWORD', 'promptcraft_password')
    mysql_database = os.getenv('MYSQL_DATABASE', 'promptcraft_db')
    
    max_retries = 60  # Wait up to 60 seconds
    retry_interval = 1  # Check every second
    
    print(f"Waiting for MySQL at {mysql_host}:{mysql_port} to be ready...")
    
    for attempt in range(max_retries):
        try:
            # Try to connect to MySQL
            connection = mysql.connector.connect(
                host=mysql_host,
                port=mysql_port,
                user=mysql_user,
                password=mysql_password,
                database=mysql_database,
                connection_timeout=5,
                auth_plugin='caching_sha2_password'
            )
            
            if connection.is_connected():
                print(f"✅ MySQL is ready! Connected successfully on attempt {attempt + 1}")
                connection.close()
                return True
                
        except Error as e:
            if attempt < max_retries - 1:
                print(f"⏳ Attempt {attempt + 1}/{max_retries}: MySQL not ready yet ({e})")
                time.sleep(retry_interval)
            else:
                print(f"❌ Failed to connect to MySQL after {max_retries} attempts: {e}")
                return False
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"⏳ Attempt {attempt + 1}/{max_retries}: Unexpected error ({e})")
                time.sleep(retry_interval)
            else:
                print(f"❌ Unexpected error after {max_retries} attempts: {e}")
                return False
    
    return False

if __name__ == "__main__":
    if wait_for_mysql():
        print("🚀 Proceeding with database initialization...")
        sys.exit(0)
    else:
        print("💥 Failed to connect to MySQL. Exiting...")
        sys.exit(1)