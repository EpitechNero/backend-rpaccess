const { launchBot, checkBotStatus } = require('../services/automationService');
const logger = require('../utils/logger');

exports.launchBot = async (req, res) => {
  try {
    const { bot, botInput } = req.body;
    await launchBot(bot, botInput);
    res.status(200).json({ message: 'Bot lancé avec succès !' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erreur inconnue' });
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