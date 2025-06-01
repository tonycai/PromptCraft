#!/bin/bash

# Log Analysis Script for PromptCraft
# This script provides various log analysis and monitoring capabilities

CONTAINER_NAME="promptcraft_backend_dev_mysql_redis"
LOG_DIR="/app/logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  errors     - Show recent errors from all modules"
    echo "  requests   - Show recent HTTP requests"
    echo "  stats      - Show log statistics"
    echo "  tail       - Tail logs in real-time"
    echo "  search     - Search logs for specific patterns"
    echo "  rotate     - Check log rotation status"
    echo "  health     - Check logging system health"
    echo ""
    echo "Options:"
    echo "  -n NUM     - Number of lines to show (default: 20)"
    echo "  -m MODULE  - Specific module to analyze"
    echo "  -p PATTERN - Pattern to search for"
    echo ""
    echo "Examples:"
    echo "  $0 errors -n 50                    # Show last 50 errors"
    echo "  $0 requests                        # Show recent requests"
    echo "  $0 search -p 'submission.*failed'  # Search for submission failures"
    echo "  $0 tail -m api.routers.submissions # Tail submission logs"
}

# Function to check if container is running
check_container() {
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}Error: Container $CONTAINER_NAME is not running${NC}"
        exit 1
    fi
}

# Function to show recent errors
show_errors() {
    local lines=${1:-20}
    echo -e "${RED}Recent Errors (last $lines):${NC}"
    echo "=================================="
    
    docker exec "$CONTAINER_NAME" find "$LOG_DIR" -name "*_errors.log" -exec sh -c '
        for file; do
            if [ -s "$file" ]; then
                echo "=== $(basename "$file") ==="
                tail -n '"$lines"' "$file" | grep -E "ERROR|CRITICAL"
                echo
            fi
        done
    ' sh {} \;
    
    # Also check main log files for errors
    docker exec "$CONTAINER_NAME" find "$LOG_DIR" -name "*.log" ! -name "*_errors.log" -exec sh -c '
        for file; do
            recent_errors=$(tail -n '"$lines"' "$file" | grep -E "ERROR|CRITICAL" | wc -l)
            if [ "$recent_errors" -gt 0 ]; then
                echo "=== $(basename "$file") - $recent_errors errors ==="
                tail -n '"$lines"' "$file" | grep -E "ERROR|CRITICAL"
                echo
            fi
        done
    ' sh {} \;
}

# Function to show recent requests
show_requests() {
    local lines=${1:-20}
    echo -e "${BLUE}Recent HTTP Requests (last $lines):${NC}"
    echo "===================================="
    
    docker exec "$CONTAINER_NAME" tail -n "$lines" "$LOG_DIR/promptcraft.middleware.log" | \
        grep "Request started\|Request completed\|Request failed" | \
        while read line; do
            if echo "$line" | grep -q "Request started"; then
                echo -e "${GREEN}$line${NC}"
            elif echo "$line" | grep -q "Request completed"; then
                echo -e "${BLUE}$line${NC}"
            elif echo "$line" | grep -q "Request failed"; then
                echo -e "${RED}$line${NC}"
            fi
        done
}

# Function to show log statistics
show_stats() {
    echo -e "${YELLOW}Log Statistics:${NC}"
    echo "=================="
    
    echo "Log Files:"
    docker exec "$CONTAINER_NAME" ls -lh "$LOG_DIR" | grep -E "\.log$" | \
        awk '{print $9 ": " $5}' | sort
    
    echo
    echo "Total Log Size:"
    docker exec "$CONTAINER_NAME" du -sh "$LOG_DIR"
    
    echo
    echo "Error Counts (last 1000 lines):"
    docker exec "$CONTAINER_NAME" find "$LOG_DIR" -name "*.log" -exec sh -c '
        for file; do
            errors=$(tail -n 1000 "$file" | grep -c "ERROR\|CRITICAL")
            if [ "$errors" -gt 0 ]; then
                echo "$(basename "$file"): $errors errors"
            fi
        done
    ' sh {} \;
    
    echo
    echo "Request Statistics (last 1000 requests):"
    if docker exec "$CONTAINER_NAME" test -f "$LOG_DIR/promptcraft.middleware.log"; then
        docker exec "$CONTAINER_NAME" tail -n 1000 "$LOG_DIR/promptcraft.middleware.log" | \
            grep "Request completed" | \
            awk -F'Status: ' '{print $2}' | \
            awk '{print $1}' | \
            sort | uniq -c | sort -nr
    fi
}

# Function to tail logs
tail_logs() {
    local module=${1:-""}
    
    if [ -n "$module" ]; then
        local log_file="$LOG_DIR/$module.log"
        echo -e "${GREEN}Tailing logs for module: $module${NC}"
        docker exec "$CONTAINER_NAME" tail -f "$log_file"
    else
        echo -e "${GREEN}Tailing all main logs...${NC}"
        docker exec "$CONTAINER_NAME" sh -c "tail -f $LOG_DIR/*.log ! -name '*_errors.log'"
    fi
}

# Function to search logs
search_logs() {
    local pattern=${1:-""}
    local lines=${2:-100}
    
    if [ -z "$pattern" ]; then
        echo -e "${RED}Error: No search pattern provided${NC}"
        echo "Usage: $0 search -p 'pattern'"
        exit 1
    fi
    
    echo -e "${YELLOW}Searching for pattern: '$pattern' (last $lines lines)${NC}"
    echo "=================================================="
    
    docker exec "$CONTAINER_NAME" find "$LOG_DIR" -name "*.log" -exec sh -c '
        for file; do
            matches=$(tail -n '"$lines"' "$file" | grep -E "'"$pattern"'" | wc -l)
            if [ "$matches" -gt 0 ]; then
                echo "=== $(basename "$file") - $matches matches ==="
                tail -n '"$lines"' "$file" | grep -E "'"$pattern"'" --color=always
                echo
            fi
        done
    ' sh {} \;
}

# Function to check log rotation
check_rotation() {
    echo -e "${BLUE}Log Rotation Status:${NC}"
    echo "====================="
    
    docker exec "$CONTAINER_NAME" find "$LOG_DIR" -name "*.log.*" | while read file; do
        size=$(docker exec "$CONTAINER_NAME" stat -f%z "$file" 2>/dev/null || docker exec "$CONTAINER_NAME" stat -c%s "$file")
        echo "Rotated file: $(basename "$file") - Size: $(echo $size | awk '{print $1/1024/1024 "MB"}')"
    done
    
    echo
    echo "Current log sizes (rotation triggers at 10MB for main logs, 5MB for error logs):"
    docker exec "$CONTAINER_NAME" ls -lh "$LOG_DIR"/*.log | awk '{print $9 ": " $5}'
}

# Function to check logging system health
check_health() {
    echo -e "${GREEN}Logging System Health Check:${NC}"
    echo "============================="
    
    # Check if log directory exists and is writable
    if docker exec "$CONTAINER_NAME" test -d "$LOG_DIR" && docker exec "$CONTAINER_NAME" test -w "$LOG_DIR"; then
        echo -e "${GREEN}✓ Log directory exists and is writable${NC}"
    else
        echo -e "${RED}✗ Log directory issues${NC}"
    fi
    
    # Check if log files are being written to
    local recent_logs=$(docker exec "$CONTAINER_NAME" find "$LOG_DIR" -name "*.log" -mmin -5 | wc -l)
    if [ "$recent_logs" -gt 0 ]; then
        echo -e "${GREEN}✓ Log files are being actively written ($recent_logs files updated in last 5 minutes)${NC}"
    else
        echo -e "${YELLOW}⚠ No recent log activity (last 5 minutes)${NC}"
    fi
    
    # Check log file permissions
    local permission_issues=$(docker exec "$CONTAINER_NAME" find "$LOG_DIR" -name "*.log" ! -writable | wc -l)
    if [ "$permission_issues" -eq 0 ]; then
        echo -e "${GREEN}✓ All log files have correct permissions${NC}"
    else
        echo -e "${RED}✗ $permission_issues log files have permission issues${NC}"
    fi
    
    # Check disk space
    local disk_usage=$(docker exec "$CONTAINER_NAME" df "$LOG_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -lt 80 ]; then
        echo -e "${GREEN}✓ Disk usage is healthy ($disk_usage%)${NC}"
    elif [ "$disk_usage" -lt 90 ]; then
        echo -e "${YELLOW}⚠ Disk usage is high ($disk_usage%)${NC}"
    else
        echo -e "${RED}✗ Disk usage is critical ($disk_usage%)${NC}"
    fi
}

# Main script logic
check_container

# Parse command line arguments
COMMAND=""
LINES=20
MODULE=""
PATTERN=""

while [[ $# -gt 0 ]]; do
    case $1 in
        errors|requests|stats|tail|search|rotate|health)
            COMMAND="$1"
            shift
            ;;
        -n)
            LINES="$2"
            shift 2
            ;;
        -m)
            MODULE="$2"
            shift 2
            ;;
        -p)
            PATTERN="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Execute command
case $COMMAND in
    errors)
        show_errors "$LINES"
        ;;
    requests)
        show_requests "$LINES"
        ;;
    stats)
        show_stats
        ;;
    tail)
        tail_logs "$MODULE"
        ;;
    search)
        search_logs "$PATTERN" "$LINES"
        ;;
    rotate)
        check_rotation
        ;;
    health)
        check_health
        ;;
    *)
        echo "No command specified."
        show_usage
        exit 1
        ;;
esac