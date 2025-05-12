const { launchBot, checkBotStatus } = require('../services/automationService');

exports.launchBot = async (req, res) => {
  try {
    const { bot, inputData } = req.body;
    await launchBot(bot, inputData);
    res.status(200).json({ message: 'Bot lancé avec succès !' });
  } catch (error) {
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