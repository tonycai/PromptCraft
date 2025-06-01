#!/bin/bash

# MySQL Database Restore Script for PromptCraft
# This script restores a backup of the PromptCraft MySQL database

set -e

# Configuration
BACKUP_DIR="./backups"
CONTAINER_NAME="promptcraft_mysql_dev"
DB_NAME="promptcraft_db"
MYSQL_ROOT_PASSWORD="supersecretroot"

# Function to show usage
show_usage() {
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 promptcraft_backup_20250601_123000.sql.gz"
    echo ""
    echo "Available backups:"
    ls -lah "$BACKUP_DIR"/promptcraft_backup_*.sql.gz 2>/dev/null || echo "No backup files found."
}

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "Error: No backup file specified."
    show_usage
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_DIR/$BACKUP_FILE' not found."
    show_usage
    exit 1
fi

echo "Starting MySQL restore..."
echo "Backup file: $BACKUP_DIR/$BACKUP_FILE"

# Check if file is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing backup file..."
    TEMP_SQL_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_DIR/$BACKUP_FILE" > "/tmp/$TEMP_SQL_FILE"
    SQL_FILE="/tmp/$TEMP_SQL_FILE"
else
    SQL_FILE="$BACKUP_DIR/$BACKUP_FILE"
fi

# Warning message
echo "WARNING: This will replace all data in the '$DB_NAME' database!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    # Clean up temp file if created
    [ -f "/tmp/$TEMP_SQL_FILE" ] && rm "/tmp/$TEMP_SQL_FILE"
    exit 0
fi

# Drop and recreate database to ensure clean restore
echo "Recreating database..."
docker exec "$CONTAINER_NAME" mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "DROP DATABASE IF EXISTS $DB_NAME; CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Restore database
echo "Restoring database from backup..."
docker exec -i "$CONTAINER_NAME" mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$DB_NAME" < "$SQL_FILE"

# Clean up temp file if created
[ -f "/tmp/$TEMP_SQL_FILE" ] && rm "/tmp/$TEMP_SQL_FILE"

echo "Restore completed successfully!"
echo "Database '$DB_NAME' has been restored from '$BACKUP_FILE'"

# Verify restore
echo "Verifying restore..."
docker exec "$CONTAINER_NAME" mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "SHOW TABLES;" "$DB_NAME"