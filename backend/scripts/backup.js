const { exec } = require('child_process');
const path = require('path');

const backupDir = path.join(__dirname, '..', 'backups');
const dbName = 'car-rental';

function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup-${timestamp}`);

  const command = `mongodump --db=${dbName} --out=${backupPath}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Backup failed: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Backup stderr: ${stderr}`);
      return;
    }
    console.log(`Backup successful! Backup stored at: ${backupPath}`);
  });
}

backupDatabase();
