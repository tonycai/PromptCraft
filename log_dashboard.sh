#!/bin/bash

# PromptCraft Log Dashboard
# Real-time monitoring dashboard for PromptCraft logs

CONTAINER_NAME="promptcraft_backend_dev_mysql_redis"
LOG_DIR="/app/logs"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Function to clear screen and show header
show_header() {
    clear
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                           PromptCraft Log Dashboard                          ║${NC}"
    echo -e "${CYAN}║                              $(date '+%Y-%m-%d %H:%M:%S')                             ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo
}

# Function to show system status
show_system_status() {
    echo -e "${BLUE}System Status:${NC}"
    echo "==============="
    
    # Container status
    if docker ps | grep -q "$CONTAINER_NAME"; then
        echo -e "${GREEN}✓ Backend Container: Running${NC}"
    else
        echo -e "${RED}✗ Backend Container: Stopped${NC}"
        return 1
    fi
    
    # Log directory status
    if docker exec "$CONTAINER_NAME" test -d "$LOG_DIR" 2>/dev/null; then
        echo -e "${GREEN}✓ Log Directory: Accessible${NC}"
    else
        echo -e "${RED}✗ Log Directory: Not accessible${NC}"
        return 1
    fi
    
    # Recent activity
    local recent_activity=$(docker exec "$CONTAINER_NAME" find "$LOG_DIR" -name "*.log" -mmin -1 | wc -l)
    if [ "$recent_activity" -gt 0 ]; then
        echo -e "${GREEN}✓ Recent Activity: Active ($recent_activity files updated in last minute)${NC}"
    else
        echo -e "${YELLOW}⚠ Recent Activity: Quiet${NC}"
    fi
    
    echo
}

# Function to show error summary
show_error_summary() {
    echo -e "${RED}Error Summary (Last 10 minutes):${NC}"
    echo "=================================="
    
    local total_errors=0
    
    docker exec "$CONTAINER_NAME" find "$LOG_DIR" -name "*.log" -exec sh -c '
        for file; do
            # Get errors from last 10 minutes
            errors=$(docker exec "'"$CONTAINER_NAME"'" awk "
                BEGIN { 
                    cmd = \"date -d \\\"10 minutes ago\\\" +%s\"
                    cmd | getline cutoff_timestamp
                    close(cmd)
                }
                {
                    if (\$0 ~ /ERROR|CRITICAL/) {
                        # Extract timestamp (first two fields: date and time)
                        datetime = \$1 \" \" \$2
                        cmd = \"date -d \\\"\" datetime \"\\\" +%s 2>/dev/null\"
                        if ((cmd | getline log_timestamp) > 0 && log_timestamp >= cutoff_timestamp) {
                            print \$0
                        }
                        close(cmd)
                    }
                }" "$file" | wc -l)
            
            if [ "$errors" -gt 0 ]; then
                module=$(basename "$file" .log)
                echo "  $module: $errors errors"
            fi
        done
    ' sh {} \; | sort -k2 -nr | head -5
    
    echo
}

# Function to show request statistics
show_request_stats() {
    echo -e "${BLUE}Request Statistics (Last 10 minutes):${NC}"
    echo "======================================"
    
    if docker exec "$CONTAINER_NAME" test -f "$LOG_DIR/promptcraft.middleware.log"; then
        # Status code distribution
        echo "Status Codes:"
        docker exec "$CONTAINER_NAME" awk '
            BEGIN { 
                cmd = "date -d \"10 minutes ago\" +%s"
                cmd | getline cutoff_timestamp
                close(cmd)
            }
            /Request completed/ {
                datetime = $1 " " $2
                cmd = "date -d \"" datetime "\" +%s 2>/dev/null"
                if ((cmd | getline log_timestamp) > 0 && log_timestamp >= cutoff_timestamp) {
                    if (match($0, /Status: ([0-9]+)/, arr)) {
                        status_codes[arr[1]]++
                        total++
                    }
                }
                close(cmd)
            }
            END {
                for (code in status_codes) {
                    printf "  %s: %d (%.1f%%)\n", code, status_codes[code], (status_codes[code]/total)*100
                }
                printf "  Total: %d requests\n", total
            }
        ' "$LOG_DIR/promptcraft.middleware.log"
        
        echo
        echo "Average Response Time:"
        docker exec "$CONTAINER_NAME" awk '
            BEGIN { 
                cmd = "date -d \"10 minutes ago\" +%s"
                cmd | getline cutoff_timestamp
                close(cmd)
            }
            /Request completed/ {
                datetime = $1 " " $2
                cmd = "date -d \"" datetime "\" +%s 2>/dev/null"
                if ((cmd | getline log_timestamp) > 0 && log_timestamp >= cutoff_timestamp) {
                    if (match($0, /Duration: ([0-9.]+)s/, arr)) {
                        durations[++count] = arr[1]
                        total_time += arr[1]
                    }
                }
                close(cmd)
            }
            END {
                if (count > 0) {
                    avg = total_time / count
                    printf "  Average: %.3fs over %d requests\n", avg, count
                } else {
                    print "  No recent requests"
                }
            }
        ' "$LOG_DIR/promptcraft.middleware.log"
    else
        echo "  No middleware logs available"
    fi
    
    echo
}

# Function to show recent activity
show_recent_activity() {
    echo -e "${GREEN}Recent Activity (Last 5 entries):${NC}"
    echo "=================================="
    
    # Get recent log entries from all files
    docker exec "$CONTAINER_NAME" find "$LOG_DIR" -name "*.log" ! -name "*_errors.log" -exec tail -n 2 {} \; | \
        grep -E "INFO|WARNING|ERROR|CRITICAL" | \
        sort -k1,2 | tail -5 | \
        while read line; do
            if echo "$line" | grep -q "ERROR\|CRITICAL"; then
                echo -e "${RED}$line${NC}"
            elif echo "$line" | grep -q "WARNING"; then
                echo -e "${YELLOW}$line${NC}"
            else
                echo -e "${GREEN}$line${NC}"
            fi
        done
    
    echo
}

# Function to show log file sizes
show_log_sizes() {
    echo -e "${PURPLE}Log File Sizes:${NC}"
    echo "==============="
    
    docker exec "$CONTAINER_NAME" ls -lh "$LOG_DIR"/*.log 2>/dev/null | \
        awk '{printf "  %-30s %8s\n", $9, $5}' | \
        sed 's|.*/||' | sort
    
    echo
    echo -e "${PURPLE}Total Log Directory Size:${NC}"
    docker exec "$CONTAINER_NAME" du -sh "$LOG_DIR" | awk '{print "  " $1}'
    
    echo
}

# Main dashboard loop
main_dashboard() {
    while true; do
        show_header
        
        if ! show_system_status; then
            echo -e "${RED}System not ready. Waiting...${NC}"
            sleep 5
            continue
        fi
        
        show_error_summary
        show_request_stats
        show_recent_activity
        show_log_sizes
        
        echo -e "${CYAN}Press Ctrl+C to exit | Refreshing in 10 seconds...${NC}"
        
        # Countdown with ability to exit
        for i in {10..1}; do
            echo -ne "\r${CYAN}Refreshing in $i seconds... ${NC}"
            sleep 1
        done
        echo -ne "\r                                    \r"
    done
}

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}Error: Container $CONTAINER_NAME is not running${NC}"
    echo "Please start the container first with: docker-compose up -d"
    exit 1
fi

# Trap Ctrl+C to exit gracefully
trap 'echo -e "\n${GREEN}Dashboard stopped.${NC}"; exit 0' INT

# Start dashboard
main_dashboard