const logger = require('../utils/logger');
const { selectUsers, selectCentreDesCouts, selectEOTP, selectList, selectActivity, selectMaquettes, selectReferentielMaquettes, selectDossiers, selectBaseDocu, insertActivity, selectBot, selectMaquettesByRegion, selectTopUsers, selectUsageByMonth, selectUsageByProcess, selectCountForm, selectAvgNotes, selectAvgNotesZendesk, selectMots, selectComments, selectPortail, selectCommentsPortail, selectZendesk, selectCommentsZendesk, insertForm, selectServices, selectAvgServices, selectForm } = require('../services/psqlService.js');

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

exports.getDossiers = async (req, res) => {
  try {
    const dossiers = await selectDossiers();
    res.status(200).json(dossiers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBaseDocu = async (req, res) => {
  try {
    const baseDocu = await selectBaseDocu();
    res.status(200).json(baseDocu);
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

exports.getForm = async (req, res) => {
  try {
    const form = await selectForm();
    res.status(200).json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

exports.getMoyenneNotesZendesk = async (req, res) => {
  try {
    const moyenneNotes = await selectAvgNotesZendesk();
    res.status(200).json({ success: true, moyenneNotes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMots = async (req, res) => {
  try {
    const mots = await selectMots();
    res.status(200).json(mots);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

exports.getPortail = async (req, res) => {
  try {
    const portail = await selectPortail();
    res.status(200).json(portail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCommentsPortail = async (req, res) => {
  try {
    const commentsPortail = await selectCommentsPortail();
    res.status(200).json(commentsPortail);
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

exports.getCommentsZendesk = async (req, res) => {
  try {
    const commentsZendesk = await selectCommentsZendesk();
    res.status(200).json(commentsZendesk);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await selectServices();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMoyenneService = async (req, res) => {
  try {
    const moyenneService = await selectAvgServices();
    res.status(200).json({ success: true, moyenneService });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.setForm = async (req, res) => {
  logger.info('📥 Requête reçue pour setForm :', JSON.stringify(req.body));
  try {
    const result = await insertForm(req.body);
    res.status(201).json({ message: 'Formulaire inséré avec succès', data: result });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur serveur lors de l\'insertion du formulaire',
      details: error.message,
    });
  }
};