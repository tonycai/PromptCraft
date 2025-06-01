# MySQL Database Persistence Guide

This document explains how MySQL data persistence is configured in PromptCraft and provides backup/restore procedures.

## 🔄 Current Persistence Setup

### Docker Volume Configuration

The MySQL database uses a **named Docker volume** for data persistence:

```yaml
# docker-compose.yml
services:
  mysql_db:
    image: mysql:8.0
    container_name: promptcraft_mysql_dev
    volumes:
      - mysql_data_dev:/var/lib/mysql  # Named volume for persistence
    
volumes:
  mysql_data_dev:  # Named volume declaration
```

### Volume Details

- **Volume Name**: `promptcraft_mysql_data_dev`
- **Mount Point**: `/var/lib/mysql` (inside container)
- **Host Location**: `/var/lib/docker/volumes/promptcraft_mysql_data_dev/_data`
- **Driver**: local
- **Scope**: local

### Database Files

The following critical files are persisted:

```
/var/lib/mysql/
├── promptcraft_db/           # PromptCraft database directory
│   ├── submissions.ibd       # Submissions table data
│   ├── users.ibd            # Users table data
│   ├── questions.ibd        # Questions table data
│   └── ...
├── mysql.ibd                # MySQL system data
├── ibdata1                  # InnoDB system tablespace
├── undo_001, undo_002       # Undo logs
└── binlog.*                 # Binary logs for replication
```

## ✅ Persistence Verification

### Test Results

**Container Restart Test**: ✅ PASSED
- Data persists across `docker-compose restart`
- All tables and data remain intact

**Complete Shutdown Test**: ✅ PASSED  
- Data persists across `docker-compose down` and `docker-compose up`
- Volume data survives container recreation

**Data Integrity Test**: ✅ PASSED
```bash
# Before restart: 4 submissions, 3 users
# After restart:  4 submissions, 3 users ✓
```

## 🔧 Backup & Restore

### Automated Backup

**Backup Script**: `backup_mysql.sh`
```bash
# Manual backup
./backup_mysql.sh

# Setup automated daily backups at 2 AM
./setup_backup_cron.sh
```

**Backup Features**:
- Creates compressed SQL dumps
- Includes all tables, triggers, routines
- Automatically rotates (keeps last 7 backups)
- UTF-8 character set preservation

**Backup Location**: `./backups/promptcraft_backup_YYYYMMDD_HHMMSS.sql.gz`

### Manual Restore

**Restore Script**: `restore_mysql.sh`
```bash
# List available backups
./restore_mysql.sh

# Restore from backup
./restore_mysql.sh promptcraft_backup_20250601_124502.sql.gz
```

**Restore Process**:
1. Drops existing database
2. Recreates database with proper charset
3. Restores all data from backup
4. Verifies restore completion

## 🛡️ Data Safety Features

### 1. Volume Persistence
- **Automatic**: Data survives container restarts/recreation
- **Location**: Host filesystem (`/var/lib/docker/volumes/`)
- **Backup**: Included in Docker volume backups

### 2. Binary Logging
- **Enabled**: MySQL binary logs for point-in-time recovery
- **Files**: `binlog.000001`, `binlog.000002`, etc.
- **Purpose**: Transaction-level recovery

### 3. InnoDB Features
- **ACID Compliance**: Atomic, Consistent, Isolated, Durable transactions
- **Crash Recovery**: Automatic recovery on startup
- **Foreign Keys**: Referential integrity enforcement

### 4. Backup Strategy
- **Daily Automated**: Cron job at 2 AM
- **Retention**: 7 days of backups
- **Compression**: gzip compression for space efficiency
- **Manual**: On-demand backup capability

## 📊 Monitoring Data Persistence

### Check Volume Status
```bash
# List volumes
docker volume ls | grep promptcraft

# Inspect volume details
docker volume inspect promptcraft_mysql_data_dev

# Check volume size
sudo du -sh /var/lib/docker/volumes/promptcraft_mysql_data_dev/_data
```

### Verify Database Integrity
```bash
# Check table status
docker exec promptcraft_mysql_dev mysql -u root -psupersecretroot \
  -e "SHOW TABLE STATUS;" promptcraft_db

# Check data consistency
docker exec promptcraft_mysql_dev mysql -u root -psupersecretroot \
  -e "SELECT COUNT(*) FROM submissions; SELECT COUNT(*) FROM users;" promptcraft_db
```

### Monitor Disk Usage
```bash
# Container data usage
docker exec promptcraft_mysql_dev df -h /var/lib/mysql

# Host volume usage
sudo du -h /var/lib/docker/volumes/promptcraft_mysql_data_dev/_data
```

## 🚨 Disaster Recovery

### Volume Corruption
```bash
# 1. Stop MySQL container
docker-compose stop mysql_db

# 2. Restore from backup
./restore_mysql.sh <latest_backup>

# 3. Restart services
docker-compose up -d
```

### Complete Data Loss
```bash
# 1. Remove corrupted volume
docker volume rm promptcraft_mysql_data_dev

# 2. Recreate from backup
docker-compose up -d mysql_db
./restore_mysql.sh <latest_backup>
```

### Host System Migration
```bash
# 1. Backup on old system
./backup_mysql.sh

# 2. Copy backup to new system
scp backups/promptcraft_backup_*.sql.gz new-host:/path/to/promptcraft/

# 3. Restore on new system
./restore_mysql.sh promptcraft_backup_*.sql.gz
```

## 📝 Best Practices

### 1. Regular Backups
- ✅ Automated daily backups enabled
- ✅ Backup verification implemented  
- ✅ Multiple backup retention (7 days)

### 2. Volume Management
- ✅ Named volumes (not bind mounts)
- ✅ Proper MySQL data directory mapping
- ✅ Volume isolation from host filesystem

### 3. Monitoring
- 📊 Regular backup size monitoring
- 📊 Database growth tracking
- 📊 Volume health checks

### 4. Security
- 🔒 Volume access restrictions
- 🔒 Backup file permissions
- 🔒 Database credential management

## 🔍 Troubleshooting

### Issue: Data Not Persisting
```bash
# Check volume mapping
docker inspect promptcraft_mysql_dev | grep -A 10 "Mounts"

# Verify volume exists
docker volume ls | grep mysql_data_dev
```

### Issue: Backup Fails
```bash
# Check container status
docker-compose ps mysql_db

# Test MySQL connectivity
docker exec promptcraft_mysql_dev mysql -u root -psupersecretroot -e "SELECT 1;"
```

### Issue: Restore Fails
```bash
# Check backup file integrity
gunzip -t backups/promptcraft_backup_*.sql.gz

# Verify database exists
docker exec promptcraft_mysql_dev mysql -u root -psupersecretroot -e "SHOW DATABASES;"
```

---

**Summary**: MySQL data persistence is properly configured with Docker named volumes, automated backups, and disaster recovery procedures. All data survives container restarts and system reboots.