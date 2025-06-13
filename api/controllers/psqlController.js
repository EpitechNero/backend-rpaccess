const logger = require('../utils/logger');
const { selectUsers, selectCentreDesCouts, selectEOTP, selectList, selectActivity, selectMaquettes, selectReferentielMaquettes, insertActivity, selectBot, selectMaquettesByRegion, selectTopUsers, selectUsageByMonth, selectUsageByProcess, selectCountForm, selectAvgNotes, selectComments, selectAttentes, selectZendesk } = require('../services/psqlService.js');

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

exports.getMaquettes = async (req, res) => {
  try {
    const maquettes = await selectMaquettes();
    res.status(200).json(maquettes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReferentielMaquettes = async (req, res) => {
  try {
    const referentiel_maquettes = await selectReferentielMaquettes();
    res.status(200).json(referentiel_maquettes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBot = async (req, res) => {
  try {
    const { start, end } = req.query;
    const activity = await selectBot(start, end);
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsageByProcess = async (req, res) => {
  try {
    const { start, end } = req.query;
    const activity = await selectUsageByProcess(start, end);
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
    const { start, end } = req.query;
    const activity = await selectMaquettesByRegion(start, end);
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTopUsers = async (req, res) => {
  try {
    const { start, end } = req.query;
    const activity = await selectTopUsers(start, end);
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setActivity = async (req, res) => {
  logger.info('📥 Requête reçue pour insertActivity :', JSON.stringify(req.body));
  try {
    const result = await insertActivity(req.body);
    res.status(201).json({ message: 'Activité insérée avec succès', data: result });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur serveur lors de l\'insertion de l\'activité',
      details: error.message,
    });
  }
};

exports.getCountForm = async (req, res) => {
  try {
    const countForm = await selectCountForm();
    res.status(200).json({ success: true, countForm });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMoyenneNotes = async (req, res) => {
  try {
    const moyenneNotes = await selectAvgNotes();
    res.status(200).json({ success: true, moyenneNotes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await selectComments();
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttentes = async (req, res) => {
  try {
    const attentes = await selectAttentes();
    res.status(200).json(attentes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getZendesk = async (req, res) => {
  try {
    const zendesk = await selectZendesk();
    res.status(200).json(zendesk);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};