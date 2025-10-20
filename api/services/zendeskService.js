const axios = require('axios');
const FormData = require('form-data');
const config = require('../config/zendesk');
const logger = require('../utils/logger');

/**
 * 🔼 Upload d’un fichier vers Zendesk pour obtenir un token d’upload
 */
const uploadAttachment = async (file) => {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');

  const safeFilename = file.originalname
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();

  const form = new FormData();
  form.append('file', file.buffer, {
    filename: safeFilename,
    contentType: file.mimetype || 'application/octet-stream',
  });

  try {
    const response = await axios.post(
      `https://${config.domain}/api/v2/uploads.json?filename=${encodeURIComponent(safeFilename)}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Basic ${auth}`,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 60000,
      }
    );

    if (!response.data?.upload?.token) {
      logger.error('Réponse inattendue de Zendesk', { data: response.data });
      throw new Error('Réponse inattendue de Zendesk lors de l’upload');
    }

    logger.info('✅ Upload réussi', {
      filename: safeFilename,
      token: response.data.upload.token,
      size: file.buffer.length,
      mimetype: file.mimetype,
    });

    return response.data.upload.token;

  } catch (error) {
    const errData = error.response?.data || error.message;
    logger.error('❌ Erreur upload Zendesk', {
      filename: safeFilename,
      error: errData,
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
