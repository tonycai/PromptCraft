#!/bin/bash

# Setup automated backups for PromptCraft MySQL database
# This script sets up a cron job to run backups automatically

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup_mysql.sh"

echo "Setting up automated MySQL backups for PromptCraft..."

# Check if backup script exists
if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo "Error: Backup script not found at $BACKUP_SCRIPT"
    exit 1
fi

# Make sure backup script is executable
chmod +x "$BACKUP_SCRIPT"

# Add cron job for daily backups at 2 AM
CRON_JOB="0 2 * * * cd $SCRIPT_DIR && $BACKUP_SCRIPT >> $SCRIPT_DIR/backup.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
    echo "Backup cron job already exists."
else
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "Backup cron job added successfully!"
    echo "Backups will run daily at 2:00 AM"
fi

echo "Current cron jobs:"
crontab -l 2>/dev/null | grep "$BACKUP_SCRIPT" || echo "No backup cron jobs found."

echo ""
echo "To manually run a backup: $BACKUP_SCRIPT"
echo "To view backup logs: tail -f $SCRIPT_DIR/backup.log"
echo "To remove automated backups: crontab -e (remove the line containing $BACKUP_SCRIPT)"