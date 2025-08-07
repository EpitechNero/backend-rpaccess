const { launchBot, checkBotStatus } = require('../services/automationService');
const logger = require('../utils/logger');

exports.launchBot = async (req, res) => {
  try {
    const { bot, botInput } = req.body;
    await launchBot(bot, botInput);
    res.status(200).json({ message: 'Bot lancé avec succès !' });
  } catch (error) {
    logger.error('❌ Erreur dans controller.launchBot', {
      type: typeof error,
      isAxiosError: !!error.isAxiosError,
      message: error.message || 'Pas de message',
      stack: error.stack || 'Pas de stack',
      errorString: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
    res.status(500).json({ error: error.message || 'Erreur inconnue' });
  }
};


exports.checkBot = async (req, res) => {
  try {
    //const data = await checkBotStatus();
    res.status(200).json({});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};