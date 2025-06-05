const { google, oAuth2Client } = require('../config/google');
const tasks = {};
const generateUniqueId = require('../utils/generateId');
const logger = require('../utils/logger');
const Readable = require('stream').Readable;

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
    });

    return response.data.id;
  } catch (error) {
    logger.error('❌ Erreur lors de la copie du fichier dans Google Drive', {
      error: error.response?.data || error.message,
    });
    throw error;
  }
}

async function uploadDriveFile(fileBuffer, fileName) {
  FOLDER_ID = '1mA0BPvk3ds7yCnm-9aghf-dmabTnv-pD';
  try {
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'text/csv',
        parents: [FOLDER_ID],
      },
      media: {
        mimeType: 'text/csv',
        body: bufferStream,
      },
      supportsAllDrives: true,
    });

    logger.info('📁 Fichier uploadé dans Google Drive', {
      newFileId: res.data.id,
      filename: fileName,
    });

    return res.data.id;

  } catch (error) {
    logger.error('❌ Erreur lors de l\'upload du fichier dans Google Drive', {
      error: error.response?.data || error.message,
    });
    throw error;
  }
}

module.exports = { tasks, generateUniqueId, copyDriveFile, uploadDriveFile };