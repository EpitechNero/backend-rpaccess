const logger = require('../utils/logger');
const { selectUsers, selectUserByMail, insertUser, updateUser, selectCentreDesCouts, selectEOTP, selectList, selectActivity, selectMaquettes, selectReferentielMaquettes, selectDossiers, selectBaseDocu, selectBaseDocuBySheetId, insertBaseDocu, updateBaseDocu, insertActivity, selectBot, selectMaquettesByRegion, selectTopUsers, selectUsageByMonth, selectUsageByProcess, selectCountForm, selectAvgNotes, selectAvgNotesZendesk, selectMots, selectComments, selectPortail, selectCommentsPortail, selectZendesk, selectCommentsZendesk, insertForm, selectServices, selectAvgServices, selectForm, syncSheetToDB } = require('../services/psqlService.js');

exports.getUsers = async (req, res) => {
  try {
    const users = await selectUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserByMail = async (req, res) => {
  const userMail = req.params.usermail;
  try {
    const user = await selectUserByMail(userMail);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  const userData = req.body;
  try {
    const newUser = await insertUser(userData);
    res.status(201).json({ message: 'Utilisateur créé avec succès', data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const userData = req.body;
  try {
    const updatedUser = await updateUser(userData);
    res.status(200).json({ message: 'Utilisateur mis à jour avec succès', data: updatedUser });
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

exports.getBaseDocuBySheetId = async (req, res) => {
  const sheetId = req.params.sheetId;
  try {
    const baseDocu = await selectBaseDocuBySheetId(sheetId);
    if (baseDocu) {
      res.status(200).json(baseDocu);
    } else {
      res.status(404).json({ error: 'Document non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.insertBaseDocu = async (req, res) => {
  const baseDocuData = req.body;
  try {
    const newBaseDocu = await insertBaseDocu(baseDocuData);
    res.status(201).json({ message: 'Document inséré avec succès', data: newBaseDocu });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBaseDocu = async (req, res) => {
  const baseDocuData = req.body;
  try {
    const updatedBaseDocu = await updateBaseDocu(baseDocuData);
    res.status(200).json({ message: 'Document mis à jour avec succès', data: updatedBaseDocu });
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

exports.syncTableFromSheet = async (req, res) => {
  const { id, range, tableName } = req.body;

  if (!id || !tableName) {
    return res.status(400).json({ success: false, error: `ID de fichier ou nom de table manquant. ${id} et ${range} et ${tableName}`});
  }

  try {
    await syncSheetToDB(id, range, tableName);
    res.json({ success: true, message: `Table ${tableName} synchronisée.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
