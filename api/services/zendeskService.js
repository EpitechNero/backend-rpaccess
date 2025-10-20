const axios = require('axios');
const { Readable } = require('stream');
const config = require('../config/zendesk');
const logger = require('../utils/logger');

/**
 * Convertit un Buffer en Readable Stream
 */
function bufferToStream(buffer) {
  return Readable.from(buffer);
}

/**
 * Upload d’un fichier vers Zendesk avec un flux pur
 */
const uploadAttachment = async (file) => {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');

  const safeFilename = file.originalname
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();

  const fileStream = bufferToStream(file.buffer);

  try {
    logger.info('🚀 Upload binaire vers Zendesk', {
      filename: safeFilename,
      size: file.buffer.length,
      mimetype: file.mimetype,
    });

    const response = await axios.post(
      `https://${config.domain}/api/v2/uploads.json?filename=${encodeURIComponent(safeFilename)}`,
      fileStream,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/octet-stream', // fichier binaire pur
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000,
      }
    );

    if (!response.data?.upload?.token) {
      logger.error('Réponse inattendue Zendesk', { data: response.data });
      throw new Error('Upload Zendesk: réponse inattendue');
    }

    logger.info('✅ Upload réussi', {
      filename: safeFilename,
      token: response.data.upload.token,
      size: file.buffer.length,
    });

    return response.data.upload.token;

  } catch (error) {
    logger.error('❌ Erreur upload Zendesk', {
      filename: safeFilename,
      error: error.response?.data || error.message,
    });
    throw error;
  }
};


/**
 * 🎫 Création d’un ticket Zendesk avec éventuelles pièces jointes
 */
const createZendeskTicketWithAttachment = async (
  subject,
  body,
  name,
  email,
  priority,
  type,
  uploadTokens = []
) => {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');

  // Construction du ticket Zendesk
  const ticketData = {
    ticket: {
      subject: subject || '(Sans objet)',
      requester: {
        name: name || 'Utilisateur inconnu',
        email: email || 'inconnu@example.com',
      },
      comment: {
        body: body || '',
        uploads: uploadTokens.length > 0 ? uploadTokens : undefined,
      },
      priority: priority || 'normal',
      type: type || 'question',
    },
  };

  try {
    const response = await axios.post(
      `https://${config.domain}/api/v2/tickets.json`,
      ticketData,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 60000,
      }
    );

    const ticketId = response.data?.ticket?.id;
    if (!ticketId) {
      throw new Error('Réponse Zendesk invalide');
    }

    logger.info('🎟️ Ticket créé avec succès', {
      ticketId,
      nbFichiers: uploadTokens.length,
      hasAttachments: uploadTokens.length > 0,
    });

    return ticketId;

  } catch (error) {
    logger.error('💥 Erreur création ticket Zendesk', {
      error: error.response?.data || error.message,
    });
    throw error;
  }
};

module.exports = {
  uploadAttachment,
  createZendeskTicketWithAttachment,
};
