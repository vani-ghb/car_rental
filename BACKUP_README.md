# MongoDB Backup and Restore Guide

This guide explains how to backup and restore your MongoDB data for the Car Rental application.

## Prerequisites

- MongoDB installed and running
- Node.js installed
- MongoDB tools (mongodump, mongorestore) installed

## Manual Backup

To create a backup manually:

```bash
cd backend
npm run backup
```

This will create a backup in the `backups/` directory with a timestamp.

## Manual Restore

To restore from a backup:

```bash
cd backend
npm run restore /path/to/backup/folder
```

For example:
```bash
npm run restore ../backups/backup-2024-01-01T00-00-00-000Z
```

## Automated Backups

### Using the Scheduler

To run automated daily backups:

```bash
cd backend
node scripts/scheduler.js
```

This will run backups every day at 2 AM.

### Windows Task Scheduler

1. Open Task Scheduler
2. Create a new task
3. Set trigger to daily at 2 AM
4. Set action to run `node C:\path\to\your\project\backend\scripts\backup.js`
5. Set start in to `C:\path\to\your\project\backend`

## Backup Structure

Backups are stored in:
```
backend/backups/
├── backup-2024-01-01T00-00-00-000Z/
│   └── car-rental/
│       ├── cars.bson
│       ├── cars.metadata.json
│       ├── users.bson
│       └── ...
```

## Important Notes

- Always backup before making major changes
- Test restore procedures in a development environment
- Keep multiple backup versions
- Store backups in a secure location
- Consider using MongoDB Atlas for cloud backups

## Troubleshooting

### mongodump not found
Install MongoDB tools:
```bash
# On Ubuntu/Debian
sudo apt-get install mongodb-clients

# On macOS
brew install mongodb/brew/mongodb-community

# On Windows
# Download from https://www.mongodb.com/try/download/database-tools
```

### Permission denied
Make sure the backups directory is writable:
```bash
mkdir -p backend/backups
chmod 755 backend/backups
