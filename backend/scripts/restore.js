const { exec } = require('child_process');
const path = require('path');

const dbName = 'car-rental';

// Pass backup folder path as argument when running this script
const backupFolder = process.argv[2];

if (!backupFolder) {
  console.error('Please provide the backup folder path as an argument.');
  process.exit(1);
}

function restoreDatabase() {
  const command = `mongorestore --db=${dbName} --drop ${backupFolder}/${dbName}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Restore failed: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Restore stderr: ${stderr}`);
      return;
    }
    console.log('Restore successful!');
  });
}

restoreDatabase();
