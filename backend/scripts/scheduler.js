const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

// Schedule daily backup at 2 AM
cron.schedule('0 2 * * *', () => {
  console.log('Running scheduled backup...');
  const backupScript = path.join(__dirname, 'backup.js');
  exec(`node ${backupScript}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Scheduled backup failed: ${error.message}`);
      return;
    }
    console.log('Scheduled backup completed successfully');
  });
});

console.log('Backup scheduler started. Daily backups at 2 AM.');

// Keep the process running
process.stdin.resume();
