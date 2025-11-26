const logger = require('../utils/logger');
const { selectUsers, selectUserByMail, insertUser, updateUser, selectCentreDesCouts, selectCentreDeCoutsById, insertCentreDeCouts, selectEOTP, selectEOTPById, insertEOTP, selectList, selectActivity, selectActivityByUser, selectMaquettes, selectReferentielMaquettes, selectDossiers, deleteDossiers, selectDossierById, insertDossier, updateDossier, selectBaseDocu, deleteBaseDocu, selectBaseDocuBySheetId, insertBaseDocu, updateSuiviCalendarValue, selectSuiviForCalendarByUser, updateSuiviBonusCalendarValue, updateBaseDocu, insertActivity, selectBot, selectMaquettesByRegion, selectTopUsers, selectUsageByMonth, selectUsageByProcess, selectCountForm, selectAvgNotes, selectAvgNotesZendesk, selectMots, selectComments, selectPortail, selectCommentsPortail, selectZendesk, selectCommentsZendesk, insertForm, selectServices, selectAvgServices, selectForm, syncSheetToDB, insertHistory, selectHistoryByTable, getStatus, updateStatus } = require('../services/psqlService.js');

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

exports.getCentreDeCoutsById = async (req, res) => {
  const centreId = req.params.id;
  try {
    const centre = await selectCentreDeCoutsById(centreId);
    if (centre) {
      res.status(200).json(centre);
    } else {
      res.status(404).json({ error: 'Centre de coûts non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCentreDeCouts = async (req, res) => {
  const centreData = req.body;
  try {
    const newCentre = await insertCentreDeCouts(centreData);
    res.status(201).json({ message: 'Centre de coûts créé avec succès', data: newCentre });
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

exports.getEOTPById = async (req, res) => {
  const eotpId = req.params.id;
  try {
    const eotp = await selectEOTPById(eotpId);
    if (eotp) {
      res.status(200).json(eotp);
    } else {
      res.status(404).json({ error: 'EOTP non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEOTP = async (req, res) => {
  const eotpData = req.body;
  try {
    const newEOTP = await insertEOTP(eotpData);
    res.status(201).json({ message: 'EOTP créé avec succès', data: newEOTP });
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

exports.getActivityByUser = async (req, res) => {
  const email = req.params.email;
  try {
    const activity = await selectActivityByUser(email);
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

exports.getSuiviForCalendarByUser = async (req, res) => {
  const email = req.params.email;
  try {
    const suivi = await selectSuiviForCalendarByUser(email);
    res.status(200).json(suivi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSuiviCalendar = async (req, res) => {
  logger.info('📥 Requête reçue pour insertActivity :', JSON.stringify(req.body));
  try {
    const result = await updateSuiviCalendarValue(req.body.mail, req.body.jour, req.body.phrase);
    res.status(201).json({ message: 'Donnée insérée avec succès', data: result });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur serveur lors de l\'insertion de la donnée',
      details: error.message,
    });
  }
};

exports.updateSuiviBonusCalendar = async (req, res) => {
  logger.info('📥 Requête reçue pour insertActivity :', JSON.stringify(req.body));
  try {
    const result = await updateSuiviBonusCalendarValue(req.body.value);
    res.status(201).json({ message: 'Donnée insérée avec succès', data: result });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur serveur lors de l\'insertion de la donnée',
      details: error.message,
    });
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

exports.deleteDossiers = async (req, res) => {
  try {
    const dossiers = await deleteDossiers();
    res.status(200).json(dossiers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDossierById = async (req, res) => {
  const dossierId = req.params.id;
  try {
    const dossier = await selectDossierById(dossierId);
    if (dossier) {
      res.status(200).json(dossier);
    } else {
      res.status(404).json({ error: 'Dossier non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDossier = async (req, res) => {
  const dossierData = req.body;
  try {
    const newDossier = await insertDossier(dossierData);
    res.status(201).json({ message: 'Dossier créé avec succès', data: newDossier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDossier = async (req, res) => {
  const dossierData = req.body;
  try {
    const updatedDossier = await updateDossier(dossierData);
    res.status(200).json({ message: 'Dossier mis à jour avec succès', data: updatedDossier });
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

exports.deleteBaseDocu = async (req, res) => {
  try {
    const baseDocu = await deleteBaseDocu();
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
    const result = await insertActivity();
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

exports.setHistory = async (req, res) => {
  logger.info('📥 Requête reçue pour setHistory :', JSON.stringify(req.body));
  try {
    const result = await insertHistory(req.body);
    res.status(201).json({ message: 'Historique inséré avec succès', data: result });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur serveur lors de l\'insertion de l\'historique',
      details: error.message,
    });
  }
};

exports.getHistory = async (req, res) => {
  const table = req.params.table;

  if (!table) {
    return res.status(400).json({ success: false, error: 'Nom de table manquant.' });
  }

  try {
    const history = await selectHistoryByTable(table);
    res.status(200).json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const status = await getStatus();
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const statusData = req.body.status;
    console.log(statusData);
    const updatedStatus = await updateStatus(statusData);
    res.status(200).json({ message: 'Statut mis à jour avec succès', data: updatedStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
