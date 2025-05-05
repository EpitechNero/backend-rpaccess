const axios = require('axios');
const FormData = require('form-data');
const config = require('../config/zendesk');

async function uploadAttachment(file) {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');
  const form = new FormData();
  form.append('file', file.buffer, file.originalname);

  const response = await axios.post(
    `https://${config.domain}/api/v2/uploads.json?filename=${encodeURIComponent(file.originalname)}`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Basic ${auth}`,
      },
    }
  );
  return response.data.upload.token;
}

async function createZendeskTicket(subject, body, name, email, priority, type, uploadTokens) {
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

  return axios.post(
    `https://${config.domain}/api/v2/tickets.json`,
    ticketData,
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }
  );
}

module.exports = { uploadAttachment, createZendeskTicket };