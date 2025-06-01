#!/bin/bash
#
# Temporary script to connect to MySQL server 8 for testing and verification.
# This script helps verify the MySQL connection and authentication plugin configuration.
#

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get connection parameters from environment or use defaults
MYSQL_HOST=${MYSQL_HOST:-localhost}
MYSQL_PORT=${MYSQL_PORT:-3306}
MYSQL_USER=${MYSQL_USER:-promptcraft_user}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-promptcraft_password}
MYSQL_DATABASE=${MYSQL_DATABASE:-promptcraft_db}

# Function to check if mysql client is installed
check_mysql_client() {
    if ! command -v mysql &> /dev/null; then
        echo -e "${RED}❌ MySQL client not found. Please install mysql-client package.${NC}"
        echo "   Ubuntu/Debian: sudo apt-get install mysql-client"
        echo "   CentOS/RHEL: sudo yum install mysql"
        echo "   macOS: brew install mysql-client"
        exit 1
    fi
}

# Function to connect to MySQL server and display connection information
connect_mysql_server() {
    echo -e "${BLUE}🔌 Attempting to connect to MySQL server:${NC}"
    echo "   Host: $MYSQL_HOST"
    echo "   Port: $MYSQL_PORT"
    echo "   User: $MYSQL_USER"
    echo "   Database: $MYSQL_DATABASE"
    echo "--------------------------------------------------"
    
    # Test connection with timeout
    if mysql --protocol=TCP -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
           -D"$MYSQL_DATABASE" --connect-timeout=10 -e "SELECT 1;" &>/dev/null; then
        
        echo -e "${GREEN}✅ Successfully connected to MySQL server!${NC}"
        
        # Get MySQL server information
        mysql_version=$(mysql --protocol=TCP -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
                       -D"$MYSQL_DATABASE" -s -N -e "SELECT VERSION();" 2>/dev/null)
        echo "   MySQL Version: $mysql_version"
        
        # Get current user and authentication plugin
        user_info=$(mysql --protocol=TCP -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
                   -D"$MYSQL_DATABASE" -s -N -e "SELECT USER();" 2>/dev/null)
        default_plugin=$(mysql --protocol=TCP -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
                        -D"$MYSQL_DATABASE" -s -N -e "SELECT @@authentication_default_plugin;" 2>/dev/null)
        echo "   Connected as: $user_info"
        echo "   Default auth plugin: $default_plugin"
        
        # Check user's authentication plugin
        echo "   User authentication plugins:"
        mysql --protocol=TCP -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
              -D"$MYSQL_DATABASE" -s -N -e "SELECT CONCAT('     ', user, '@', host, ': ', plugin) FROM mysql.user WHERE user = '$MYSQL_USER';" 2>/dev/null
        
        # Test database access - show tables
        table_count=$(mysql --protocol=TCP -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
                     -D"$MYSQL_DATABASE" -s -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$MYSQL_DATABASE';" 2>/dev/null)
        echo "   Tables in database: $table_count"
        
        if [ "$table_count" -gt 0 ]; then
            mysql --protocol=TCP -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
                  -D"$MYSQL_DATABASE" -s -N -e "SHOW TABLES;" 2>/dev/null | sed 's/^/     - /'
        fi
        
        # Test a simple query
        test_result=$(mysql --protocol=TCP -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
                     -D"$MYSQL_DATABASE" -s -N -e "SELECT 1 + 1 AS result;" 2>/dev/null)
        echo "   Test query (1+1): $test_result"
        
        echo -e "\n${GREEN}🎉 Connection test completed successfully!${NC}"
        return 0
        
    else
        echo -e "${RED}❌ Failed to connect to MySQL server${NC}"
        echo "   Please check your connection parameters and server status"
        return 1
    fi
}

# Function to test different authentication methods
test_authentication_methods() {
    echo -e "\n${YELLOW}🧪 Testing different connection methods:${NC}"
    echo "--------------------------------------------------"
    
    # Test with SSL disabled
    echo -n "Testing without SSL... "
    if mysql --protocol=TCP -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
           --ssl-mode=DISABLED --connect-timeout=5 -e "SELECT 1;" &>/dev/null; then
        echo -e "${GREEN}✅ SUCCESS${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
    
    # Test with SSL required
    echo -n "Testing with SSL required... "
    if mysql --protocol=TCP -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
           --ssl-mode=REQUIRED --connect-timeout=5 -e "SELECT 1;" &>/dev/null; then
        echo -e "${GREEN}✅ SUCCESS${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
    
    # Test with SSL preferred (default)
    echo -n "Testing with SSL preferred... "
    if mysql --protocol=TCP -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
           --ssl-mode=PREFERRED --connect-timeout=5 -e "SELECT 1;" &>/dev/null; then
        echo -e "${GREEN}✅ SUCCESS${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
    
    # Test connection with different default auth plugin
    echo -n "Testing with explicit auth plugin... "
    if mysql --protocol=TCP -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
           --default-auth=caching_sha2_password --connect-timeout=5 -e "SELECT 1;" &>/dev/null; then
        echo -e "${GREEN}✅ SUCCESS${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
}

# Function to show MySQL server status
show_server_status() {
    echo -e "\n${BLUE}📊 MySQL Server Status:${NC}"
    echo "--------------------------------------------------"
    
    if mysql --protocol=TCP -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
           -D"$MYSQL_DATABASE" -e "SHOW STATUS LIKE 'Uptime%'; SHOW STATUS LIKE 'Threads_connected';" 2>/dev/null; then
        echo ""
    else
        echo -e "${RED}❌ Could not retrieve server status${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🚀 MySQL Server 8 Connection Test Script${NC}"
    echo "=================================================="
    
    # Check if MySQL client is available
    check_mysql_client
    
    # Main connection test
    if connect_mysql_server; then
        SUCCESS=0
        
        # Show additional server information
        show_server_status
        
        # Test different authentication methods
        test_authentication_methods
        
    else
        SUCCESS=1
        echo -e "\n${RED}Connection failed. Please check:${NC}"
        echo "1. MySQL server is running"
        echo "2. Connection parameters are correct"
        echo "3. User has proper permissions"
        echo "4. Network connectivity"
    fi
    
    mysql --protocol=TCP -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D"$MYSQL_DATABASE"
    #exit $SUCCESS
}

# Handle script interruption
trap 'echo -e "\n${YELLOW}Script interrupted${NC}"; exit 130' INT

# Run main function
main "$@"

