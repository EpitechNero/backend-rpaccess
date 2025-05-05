const axios = require('axios');
const config = require('../config/automationAnywhere');

async function getAuthToken() {
  const response = await axios.post(`${config.controlRoomUrl}/v2/authentication`, {
    username: config.username,
    apiKey: config.apiKey,
  });
  return response.data.token;
}

async function launchBot(botId) {
  const token = await getAuthToken();
  const payload = {
    fileId: botId,
    runAsUserIds: [182],
    poolIds: [],
    overrideDefaultDevice: false,
  };
  return axios.post(`${config.controlRoomUrl}/v3/automations/deploy`, payload, {
    headers: { 'Content-Type': 'application/json', 'X-Authorization': token },
  });
}

async function checkBotStatus() {
  const token = await getAuthToken();
  const payload = {
    sort: [{ field: 'createdOn', direction: 'desc' }],
    filter: { operator: 'eq', value: 'ccefr3', field: 'userName' },
    fields: [],
    page: { length: 100, offset: 0 },
  };
  const response = await axios.post(`${config.controlRoomUrl}/v3/activity/list`, payload, {
    headers: { 'Content-Type': 'application/json', 'X-Authorization': token },
  });
  return response.data;
}

module.exports = { launchBot, checkBotStatus };