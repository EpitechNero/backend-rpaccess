const axios = require('axios');
const config = require('../config/automationAnywhere');
const logger = require('../utils/logger');

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

function buildBotInput(bot, inputData) {
  const botInput = {};

  for (let i = 1; i <= 3; i++) {
    const key = `vInput${i}`;
    const typeKey = `vInput${i}type`;
    const formKey = `input${i}`;

    if (bot[key] === 'O' && inputData[formKey] !== undefined) {
      const type = bot[typeKey];

      let value = inputData[formKey];

      switch (type) {
        case 'STRING':
          botInput[key] = {
            type: 'STRING',
            string: value
          };
          break;
        case 'NUMBER':
          botInput[key] = {
            type: 'NUMBER',
            number: Number(value)
          };
          break;
        case 'BOOLEAN':
          botInput[key] = {
            type: 'BOOLEAN',
            boolean: value === 'true' || value === true
          };
          break;
        default:
          console.warn(`Type ${type} non géré pour ${key}`);
      }
    }
  }

  return botInput;
}


async function launchBot(bot, inputData) {
  const token = await authenticate();

  const botInput = buildBotInput(bot, inputData);

  const payload = {
    fileId: bot.botId,
    runAsUserIds: [182],
    poolIds: [],
    overrideDefaultDevice: false,
    botInput,
  };

  logger.info(payload);

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

    logger.info('🤖 Bot lancé avec succès', { bot });
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