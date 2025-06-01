#!/bin/bash

# MySQL Database Backup Script for PromptCraft
# This script creates backups of the PromptCraft MySQL database

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="promptcraft_backup_${DATE}.sql"
CONTAINER_NAME="promptcraft_mysql_dev"
DB_NAME="promptcraft_db"
MYSQL_ROOT_PASSWORD="supersecretroot"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting MySQL backup..."
echo "Backup file: $BACKUP_DIR/$BACKUP_FILE"

# Create database backup using mysqldump inside the container
docker exec "$CONTAINER_NAME" mysqldump \
    -u root \
    -p"$MYSQL_ROOT_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --hex-blob \
    --default-character-set=utf8mb4 \
    "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE"

# Compress the backup
gzip "$BACKUP_DIR/$BACKUP_FILE"
COMPRESSED_FILE="$BACKUP_DIR/${BACKUP_FILE}.gz"

echo "Backup completed successfully!"
echo "Compressed backup: $COMPRESSED_FILE"
echo "Backup size: $(du -h "$COMPRESSED_FILE" | cut -f1)"

# Optional: Keep only the last 7 backups (cleanup old backups)
echo "Cleaning up old backups (keeping last 7)..."
cd "$BACKUP_DIR"
ls -t promptcraft_backup_*.sql.gz | tail -n +8 | xargs -r rm -f
echo "Cleanup completed."

echo "Available backups:"
ls -lah promptcraft_backup_*.sql.gz 2>/dev/null || echo "No backup files found."