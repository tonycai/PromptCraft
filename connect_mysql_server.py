#!/usr/bin/env python3
"""
Temporary script to connect to MySQL server 8 for testing and verification.
This script helps verify the MySQL connection and authentication plugin configuration.
"""
import os
import mysql.connector
from mysql.connector import Error
import sys

def connect_mysql_server():
    """Connect to MySQL server and display connection information."""
    # Get connection parameters from environment or use defaults
    mysql_host = os.getenv('MYSQL_HOST', 'localhost')
    mysql_port = int(os.getenv('MYSQL_PORT', 3306))
    mysql_user = os.getenv('MYSQL_USER', 'promptcraft_user')
    mysql_password = os.getenv('MYSQL_PASSWORD', 'promptcraft_password')
    mysql_database = os.getenv('MYSQL_DATABASE', 'promptcraft_db')
    
    print(f"🔌 Attempting to connect to MySQL server:")
    print(f"   Host: {mysql_host}")
    print(f"   Port: {mysql_port}")
    print(f"   User: {mysql_user}")
    print(f"   Database: {mysql_database}")
    print("-" * 50)
    
    connection = None
    cursor = None
    
    try:
        # Connect to MySQL server with explicit authentication plugin
        connection = mysql.connector.connect(
            host=mysql_host,
            port=mysql_port,
            user=mysql_user,
            password=mysql_password,
            database=mysql_database,
            auth_plugin='caching_sha2_password',
            connection_timeout=10
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Get MySQL server information
            cursor.execute("SELECT VERSION()")
            mysql_version = cursor.fetchone()[0]
            print(f"✅ Successfully connected to MySQL server!")
            print(f"   MySQL Version: {mysql_version}")
            
            # Get current user and authentication plugin
            cursor.execute("SELECT USER(), @@authentication_default_plugin")
            user_info, default_plugin = cursor.fetchone()
            print(f"   Connected as: {user_info}")
            print(f"   Default auth plugin: {default_plugin}")
            
            # Check user's authentication plugin
            cursor.execute("""
                SELECT user, host, plugin 
                FROM mysql.user 
                WHERE user = %s
            """, (mysql_user,))
            
            user_plugins = cursor.fetchall()
            if user_plugins:
                print(f"   User authentication plugins:")
                for user, host, plugin in user_plugins:
                    print(f"     {user}@{host}: {plugin}")
            
            # Test database access
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"   Tables in database: {len(tables)}")
            for table in tables:
                print(f"     - {table[0]}")
            
            # Test a simple query
            cursor.execute("SELECT 1 + 1 AS result")
            result = cursor.fetchone()[0]
            print(f"   Test query (1+1): {result}")
            
            print("\n🎉 Connection test completed successfully!")
            return True
            
    except Error as e:
        print(f"❌ MySQL Error: {e}")
        print(f"   Error Code: {e.errno if hasattr(e, 'errno') else 'N/A'}")
        print(f"   SQL State: {e.sqlstate if hasattr(e, 'sqlstate') else 'N/A'}")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
        
    finally:
        # Clean up connections
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
            print("🔌 MySQL connection closed.")

def test_authentication_plugins():
    """Test different authentication plugins to see which ones work."""
    mysql_host = os.getenv('MYSQL_HOST', 'localhost')
    mysql_port = int(os.getenv('MYSQL_PORT', 3306))
    mysql_user = os.getenv('MYSQL_USER', 'promptcraft_user')
    mysql_password = os.getenv('MYSQL_PASSWORD', 'promptcraft_password')
    
    plugins_to_test = [
        'caching_sha2_password',
        'mysql_native_password',
        'sha256_password'
    ]
    
    print("\n🧪 Testing different authentication plugins:")
    print("-" * 50)
    
    for plugin in plugins_to_test:
        print(f"Testing {plugin}...", end=" ")
        try:
            conn = mysql.connector.connect(
                host=mysql_host,
                port=mysql_port,
                user=mysql_user,
                password=mysql_password,
                auth_plugin=plugin,
                connection_timeout=5
            )
            if conn.is_connected():
                print("✅ SUCCESS")
                conn.close()
            else:
                print("❌ FAILED (not connected)")
        except Error as e:
            print(f"❌ FAILED ({e})")
        except Exception as e:
            print(f"❌ ERROR ({e})")

if __name__ == "__main__":
    print("🚀 MySQL Server 8 Connection Test Script")
    print("=" * 50)
    
    # Main connection test
    success = connect_mysql_server()
    
    # Test different authentication plugins
    test_authentication_plugins()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)