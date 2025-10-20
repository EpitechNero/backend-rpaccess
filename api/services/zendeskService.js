/*const axios = require('axios');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');
const config = require('../config/zendesk');
const logger = require('../utils/logger');

const uploadAttachment = async (file) => {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');

  const safeFilename = file.originalname
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .toLowerCase();

  const form = new FormData();
  form.append('file', file.buffer, {
    filename: safeFilename,
    contentType: file.mimetype,
  });

  const headers = {
    Authorization: `Basic ${auth}`,
    ...form.getHeaders(),
  };

  try {
    const response = await fetch(
      `https://${config.domain}/api/v2/uploads.json?filename=${encodeURIComponent(safeFilename)}`,
      {
        method: 'POST',
        headers,
        body: form,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload échoué (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    logger.info('Upload réussi', { filename: safeFilename, token: data.upload.token });
    return data.upload.token;

  } catch (error) {
    logger.error('Erreur lors du téléversement', {
      filename: safeFilename,
      error: error.message,
    });
    throw error;
  }
};

const uploadAttachment = async (file) => {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');
  const form = new FormData();
  //form.append('file', file.buffer, file.originalname);

  const safeFilename = file.originalname
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .toLowerCase();   

  form.append('file', file.buffer, {
    filename: safeFilename,
    contentType: file.mimetype,
    knownLength: file.buffer.length
  });
  logger.info(file.mimetype)

  try {
    const response = await axios.post(
      `https://${config.domain}/api/v2/uploads.json?filename=${encodeURIComponent(safeFilename)}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Basic ${auth}`,
        },
      }
    );

    logger.info('Upload réussi', { filename: safeFilename, token: response.data.upload.token });
    return response.data.upload.token;
  } catch (error) {
    logger.error('Erreur lors du téléversement', {
      filename: safeFilename,
      error: error.response?.data || error.message,
    });
    throw error;
  }
};

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

  logger.info(uploadTokens);

  try {
    const response = await axios.post(
      `https://${config.domain}/api/v2/tickets.json`,
      JSON.stringify(ticketData),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json; charset=utf-8',

        },
      }
    );

    logger.info('Ticket créé avec succès', { ticketId: response.data.ticket.id }, 'provenant de ', name);
    return response.data.ticket.id;
  } catch (error) {
    logger.error('Erreur lors de la création du ticket', {
      error: error.response?.data || error.message,
    });
    throw error;
  }
};

module.exports = {
  uploadAttachment,
  createZendeskTicketWithAttachment,
};*/

const axios = require('axios');
const FormData = require('form-data');
const config = require('../config/zendesk');
const logger = require('../utils/logger');

/**
 * Upload d'un fichier vers Zendesk pour obtenir un token
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
  form.append('file', Buffer.from(file.buffer), {
    filename: safeFilename,
    contentType: file.mimetype || 'application/octet-stream',
    knownLength: file.buffer.length,
  });

  // Récupérer en-têtes fournis par form-data (inclut boundary)
  const formHeaders = form.getHeaders();

  // Optionnel : calculer Content-Length pour éviter le chunked encoding
  const getContentLength = () =>
    new Promise((resolve, reject) => {
      form.getLength((err, length) => {
        if (err) return reject(err);
        resolve(length);
      });
    });

  try {
    const contentLength = await getContentLength();
    const headers = {
      ...formHeaders,
      Authorization: `Basic ${auth}`,
      'Content-Length': contentLength,
    };

    logger.info('Upload vers Zendesk', { filename: safeFilename, size: file.buffer.length, headers: headers });

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

    // Vérification basique
    if (!response.data || !response.data.upload || !response.data.upload.token) {
      logger.error('Réponse d\'upload inattendue', { data: response.data });
      throw new Error('Upload Zendesk: réponse inattendue');
    }

    logger.info('Upload réussi', { filename: safeFilename, token: response.data.upload.token });
    return response.data.upload.token;
  } catch (error) {
    // Extraire info utile si existante
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
