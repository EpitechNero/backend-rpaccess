const axios = require('axios');
const FormData = require('form-data');
const config = require('../config/zendesk');
const logger = require('../utils/logger');

/**
 * Upload d'un fichier vers Zendesk et retour de l'upload token.
 * Compatible PDF, CSV, PNG, JPEG.
 * file : objet provenant de multer (file.buffer, file.originalname, file.mimetype)
 */
const uploadAttachment = async (file) => {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');

  // Normalisation du nom du fichier
  const safeFilename = file.originalname
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();

  // Construire le FormData correctement
  const form = new FormData();
  form.append('file', file.buffer, {
    filename: safeFilename,
    contentType: file.mimetype || 'application/octet-stream',
    // knownLength n'est pas nécessaire, form-data + Axios gèrent la taille
  });

  // Récupérer headers du FormData (inclut boundary)
  const headers = {
    ...form.getHeaders(),
    Authorization: `Basic ${auth}`,
  };

  try {
    logger.info('Upload vers Zendesk', { filename: safeFilename, size: file.buffer.length });

    const response = await axios.post(
      `https://${config.domain}/api/v2/uploads.json?filename=${encodeURIComponent(safeFilename)}`,
      form,
      {
        headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000,
      }
    );

    if (!response.data?.upload?.token) {
      logger.error('Réponse d\'upload inattendue', { data: response.data });
      throw new Error('Upload Zendesk: réponse inattendue');
    }

    logger.info('Upload réussi', { filename: safeFilename, token: response.data.upload.token });
    return response.data.upload.token;

  } catch (error) {
    const errData = error.response?.data || error.message;
    logger.error('Erreur upload', { filename: safeFilename, error: errData });
    throw error;
  }
};

/**
 * Création du ticket Zendesk avec les fichiers uploadés
 */
const createZendeskTicketWithAttachment = async (subject, body, name, email, priority, type, uploadTokens) => {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');

  const ticketData = {
    ticket: {
      subject,
      comment: {
        body,
        html_body: body,
        uploads: uploadTokens,
      },
      requester: { name, email },
      priority,
      type,
    },
  };

  try {
    const response = await axios.post(
      `https://${config.domain}/api/v2/tickets.json`,
      ticketData,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000,
      }
    );

    logger.info('Ticket créé avec succès', { ticketId: response.data.ticket.id });
    return response.data.ticket.id;

  } catch (error) {
    logger.error('Erreur création ticket', { error: error.response?.data || error.message });
    throw error;
  }
};

module.exports = {
  uploadAttachment,
  createZendeskTicketWithAttachment,
};
