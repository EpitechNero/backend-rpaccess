const axios = require('axios');
const { Readable } = require('stream');
const config = require('../config/zendesk');
const logger = require('../utils/logger');

function bufferToStream(buffer) {
  return Readable.from(buffer);
}

const uploadAttachment = async (file) => {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');

  const safeFilename = file.originalname
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();

  const fileStream = bufferToStream(file.buffer);

  try {
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
      throw new Error('Upload Zendesk: réponse inattendue');
    }

    return response.data.upload.token;

  } catch (error) {
    throw error;
  }
};

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
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 60000,
      }
    );

    const ticketId = response.data?.ticket?.id;
    if (!ticketId) {
      throw new Error('Réponse Zendesk invalide');
    }

    return ticketId;

  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadAttachment,
  createZendeskTicketWithAttachment,
};
