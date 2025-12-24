const axios = require('axios');
const config = require('../config/automationAnywhere');
const logger = require('../utils/logger');

async function getAuthToken() {
  try {
    const response = await axios.post(`${config.controlRoomUrl}/v2/authentication`, {
      username: config.username,
      apiKey: config.apiKey,
    });

    return response.data.token;
  } catch (error) {
    throw error;
  }
}

function buildBotInput(bot, inputData) {
  const botInput = {};

  for (let i = 1; i <= 3; i++) {
    try {
      const botKey = `vInput${i}`;
      const key = `vinput${i}_list`;
      const typeKey = `vinput${i}type_list`;
      const formKey = `input${i}`;

    if (bot[key] === 'O' && inputData[formKey] !== undefined) {
      const type = bot[typeKey];

      let value = inputData[formKey];

      switch (type) {
        case 'STRING':
          botInput[botKey] = {
            type: 'STRING',
            string: value
          };
          break;
        case 'NUMBER':
          botInput[botKey] = {
            type: 'NUMBER',
            number: Number(value)
          };
          break;
        case 'BOOLEAN':
          botInput[botKey] = {
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

  if(bot['vinputmail_list'] === 'O') {
    botKey = 'vInputMail';
    botInput[botKey] = {
      type: 'STRING',
      string: inputData['inputMail'] || ''
    };
  }

  return botInput;
}


async function launchBot(bot, inputData) {
  const token = await getAuthToken();

  if (!bot) {
    return {};
  }

  const botInput = (inputData && Object.keys(inputData).length > 0)
  ? buildBotInput(bot, inputData)
  : undefined;

  const payload = {
    fileId: bot.bot_id_list	,
    runAsUserIds: [182],
    poolIds: [],
    overrideDefaultDevice: false,
  };

  if (botInput && Object.keys(botInput).length > 0) {
    payload.botInput = botInput;
  }

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

    return response.data;
  } catch (error) {
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

    return response.data;
  } catch (error) {
    throw error;
  }
}

module.exports = { launchBot, checkBotStatus };