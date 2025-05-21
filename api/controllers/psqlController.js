import logger from '../utils/logger.js';
const { selectUsers, selectCentreDesCouts, selectEOTP, selectList, selectActivity, insertActivity, selectBot, selectMaquettesByRegion, selectTopUsers, selectUsageByMonth, selectUsageByProcess } = require('../services/psqlService.js');

exports.getUsers = async (req, res) => {
  try {
    const users = await selectUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCentreDesCouts = async (req, res) => {
  try {
    const centres = await selectCentreDesCouts();
    res.status(200).json(centres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEOTP = async (req, res) => {
  try {
    const eotp = await selectEOTP();
    res.status(200).json(eotp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getList = async (req, res) => {
  try {
    const list = await selectList();
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const activity = await selectActivity();
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBot = async (req, res) => {
  try {
    const activity = await selectBot();
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsageByProcess = async (req, res) => {
  try {
    const activity = await selectUsageByProcess();
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsageByMonth = async (req, res) => {
  try {
    const activity = await selectUsageByMonth();
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMaquettesByRegion = async (req, res) => {
  try {
    const activity = await selectMaquettesByRegion();
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTopUsers = async (req, res) => {
  try {
    const activity = await selectTopUsers();
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setActivity = async (req, res) => {
  logger.info('body', req.body);
  try {
    await insertActivity(req.body);
    res.status(201).json({ message: 'Activité insérée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};