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
  FOLDER_ID = '1O6Q97Zj04Iya_G-SupyiM96p1uSDicsP';
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

async function readGoogleSheet(fileId, range) {
  try {
    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: fileId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      logger.warn('⚠️ Aucune donnée trouvée dans la feuille Google Sheet', {
        fileId,
        range,
      });
      return [];
    }

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || null;
      });
      return obj;
    });

    logger.info('✅ Données extraites depuis Google Sheets', {
      nbRows: data.length,
      fileId,
    });

    return data;
  } catch (error) {
    logger.error('❌ Erreur lors de la lecture du Google Sheet', {
      error: error.response?.data || error.message,
      fileId,
    });
    throw error;
  }
}

module.exports = { tasks, generateUniqueId, copyDriveFile, uploadDriveFile, readGoogleSheet };