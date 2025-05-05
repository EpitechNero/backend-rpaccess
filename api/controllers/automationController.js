const { launchBot, checkBotStatus } = require('../services/automationService');

exports.launchBot = async (req, res) => {
  try {
    const { botId } = req.body;
    await launchBot(botId);
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