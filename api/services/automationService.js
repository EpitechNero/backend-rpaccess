const axios = require('axios');
const config = require('../config/automationAnywhere');

async function getAuthToken() {
  try {
    const response = await axios.post(`${config.controlRoomUrl}/v2/authentication`, {
      username: config.username,
      apiKey: config.apiKey,
    });

    logger.info('✅ Authentification réussie avec Automation Anywhere');
    return response.data.token;
  } catch (error) {
    logger.error('❌ Erreur d\'authentification AA', {
      error: error.response?.data || error.message,
    });
    throw error;
  }
}

async function launchBot(botId) {
  const token = await authenticate();

  const payload = {
    fileId: botId,
    runAsUserIds: [182],
    poolIds: [],
    overrideDefaultDevice: false,
    // Ajoute les params si nécessaire
  };

  try {
    const response = await axios.post(
      `${config.controlRoomUrl}/v3/automations/deploy`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': token,
        },
      }
    );

    logger.info('🤖 Bot lancé avec succès', { botId });
    return response.data;
  } catch (error) {
    logger.error('❌ Erreur lors du lancement du bot', {
      error: error.response?.data || error.message,
    });
    throw error;
  }
}

async function checkBotStatus() {
  const token = await authenticate();

  const payload = {
    sort: [{ field: 'createdOn', direction: 'desc' }],
    filter: {
      operator: 'eq',
      value: 'ccefr3',
      field: 'userName',
    },
    fields: [],
    page: { length: 100, offset: 0 },
  };

  try {
    const response = await axios.post(
      `${config.controlRoomUrl}/v3/activity/list`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': token,
        },
      }
    );

    logger.info('📊 Statut du bot récupéré');
    return response.data;
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération du statut du bot', {
      error: error.response?.data || error.message,
    });
    throw error;
  }
}

module.exports = { launchBot, checkBotStatus };