const axios = require('axios');
const FormData = require('form-data');
const config = require('../config/zendesk');
const logger = require('../utils/logger');

const uploadAttachment = async (file) => {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');
  const form = new FormData();
  form.append('file', file.buffer, file.originalname);

  try {
    const response = await axios.post(
      `https://${config.domain}/api/v2/uploads.json?filename=${encodeURIComponent(file.originalname)}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Basic ${auth}`,
        },
      }
    );

    logger.info('Upload réussi', { filename: file.originalname, token: response.data.upload.token });
    return response.data.upload.token;
  } catch (error) {
    logger.error('Erreur lors du téléversement', {
      filename: file.originalname,
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

  try {
    const response = await axios.post(
      `https://${config.domain}/api/v2/tickets.json`,
      ticketData,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
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
};
