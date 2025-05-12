const { launchBot, checkBotStatus } = require('../services/automationService');
const logger = require('../utils/logger');

exports.launchBot = async (req, res) => {
  try {
    const { bot, inputData } = req.body;
    logger.info("🎯 Reçu dans controller.launchBot", { bot, inputData });

    await launchBot(bot, inputData);
    res.status(200).json({ message: 'Bot lancé avec succès !' });

  } catch (error) {
    logger.error('❌ Erreur dans controller.launchBot', {
      message: error.message,
      stack: error.stack,
      full: error
    });
    res.status(500).json({ error: error.message });
  }
};


exports.checkBot = async (req, res) => {
  try {
    const data = await checkBotStatus();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};