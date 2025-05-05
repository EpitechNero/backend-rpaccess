const { google, oAuth2Client } = require('../config/google');
const tasks = {};
const generateUniqueId = require('../utils/generateId');

async function copyDriveFile(fileId, targetFolderId, filename) {
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  const response = await drive.files.copy({
    fileId,
    resource: { parents: [targetFolderId], name: filename },
    supportsAllDrives: true,
  });
  return response.data.id;
}

module.exports = { tasks, generateUniqueId, copyDriveFile };