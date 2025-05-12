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

  logger.info("BUILD INPUT");

  for (let i = 1; i <= 3; i++) {
    logger.info("Je build le bot input " + i);
    try {
      const key = `vInput${i}`;
      const typeKey = `vInput${i}type`;
      const formKey = `input${i}`;

      logger.info("LOG DATA")
      logger.info(inputData);
      logger.info("LOG DATA FIN");

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
          logger.warn(`Type ${type} non géré pour ${key}`);
      }
    }
    } catch (error) {
      break;
    }
  }
  logger.info(botInput);
  return botInput;
}


async function launchBot(bot, inputData) {
  const token = await getAuthToken();

  if (!bot) {
    logger.error("❌ bot est undefined dans buildBotInput");
    return {};
  }

  const botInput = Object.keys(inputData).length > 0 ? buildBotInput(bot, inputData) : undefined;
  logger.info("BUILD INPUT PASSE");
  //const botInput = buildBotInput(bot, inputData);

  const payload = {
    fileId: bot.botId,
    runAsUserIds: [182],
    poolIds: [],
    overrideDefaultDevice: false,
  };

  if (botInput && Object.keys(botInput).length > 0) {
    payload.botInput = botInput;
  } else {
    logger.info("📭 Pas de variables d'input à envoyer");
  }

  logger.info("📝 Payload préparé :", JSON.stringify(payload, null, 2));

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
  const token = await getAuthToken();

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