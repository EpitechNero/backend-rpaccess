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

const createZendeskTicketWithAttachments = async (subject, body, name, email, priority, type, files = []) => {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');
  
  // Création du form-data
  const form = new FormData();
  
  // Infos du ticket
  form.append('ticket[subject]', subject);
  form.append('ticket[comment][body]', body);
  form.append('ticket[requester][name]', name);
  form.append('ticket[requester][email]', email);
  form.append('ticket[priority]', priority);
  form.append('ticket[type]', type);

  // Ajout des fichiers
  files.forEach(file => {
    const safeFilename = file.originalname
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .toLowerCase();

    form.append('ticket[comment][uploads][]', file.buffer, {
      filename: safeFilename,
      contentType: file.mimetype,
    });
  });

  try {
    const headers = {
      Authorization: `Basic ${auth}`,
      ...form.getHeaders(),
    };

    const response = await axios.post(
      `https://${config.domain}/api/v2/tickets.json`,
      form,
      {
        headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000,
      }
    );

    logger.info('Ticket créé avec succès', { ticketId: response.data.ticket.id });
    return response.data.ticket.id;

  } catch (error) {
    logger.error('Erreur création ticket avec fichiers', {
      error: error.response?.data || error.message,
    });
    throw error;
  }
};

module.exports = { createZendeskTicketWithAttachments };

