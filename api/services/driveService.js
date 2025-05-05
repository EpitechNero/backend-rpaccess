const { google, oAuth2Client } = require('../config/google');
const tasks = {};
const generateUniqueId = require('../utils/generateId');

async function copyDriveFile(fileId, targetFolderId, filename) {
  try {
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const response = await drive.files.copy({
      fileId,
      resource: {
        parents: [targetFolderId],
        name: filename,
      },
      supportsAllDrives: true,
    });

    logger.info('📁 Fichier copié dans Google Drive', {
      newFileId: response.data.id,
      filename,
      taskId,
    });

    return response.data.id;
  } catch (error) {
    logger.error('❌ Erreur lors de la copie du fichier dans Google Drive', {
      error: error.response?.data || error.message,
    });
    throw error;
  }
}

module.exports = { tasks, generateUniqueId, copyDriveFile };