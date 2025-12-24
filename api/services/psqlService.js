const { pool } = require('../config/psql.js');
const { google, oAuth2Client } = require('../config/google');
const logger = require('../utils/logger');

const TABLES = {
    EOTP: 'eotp',
    CENTRE_COUT: 'centredecout',
    USERS: 'users',
    ACTIVITY: 'activity',
    MAQUETTES: 'maquettes',
    CALENDAR_BONUS: 'calendarbonus'
};

const genericSelect = async (tableKey, options = {}) => {
    const tableName = TABLES[tableKey];
    if (!tableName) {
        throw new Error('Table non autorisée');
    }

    const {
        where,      // string SQL (ex: "email_user = $1")
        values = [],// valeurs des paramètres
        orderBy,    // string SQL (ex: "created_at DESC")
        limit,
        offset,
        columns = '*'
    } = options;

    let query = `SELECT ${columns} FROM ${tableName}`;

    if (where) {
        query += ` WHERE ${where}`;
    }

    if (orderBy) {
        query += ` ORDER BY ${orderBy}`;
    }

    if (limit) {
        query += ` LIMIT ${limit}`;
    }

    if (offset) {
        query += ` OFFSET ${offset}`;
    }

    try {
        const res = await pool.query(query, values);
        return where ? res.rows[0] : res.rows;
    } catch (error) {
        logger.error('❌ Erreur SQL', { query, values, error: error.message });
        throw error;
    }
};


const selectUsers = async () => {
  try {
    const res = await pool.query('SELECT * FROM users');
    console.log('✅ Utilisateurs récupérés avec succès');
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs :', error);
    throw error;
  }
};

const selectCentreDesCouts = async () => {
    try {
        const res = await pool.query('SELECT * FROM centredecout');
        console.log('✅ Centres de couts récupérés avec succès');
        return res.rows;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des centres de couts :', error);
        throw error;
    }
};

const selectEOTP = async () => {
    try {
        const res = await pool.query('SELECT * FROM eotp');
        console.log('✅ EOTP récupérés avec succès');
        return res.rows;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des eotp :', error);
        throw error;
    }
};

const selectActivity = async () => {
    try {
        const res = await pool.query('SELECT * FROM activity');
        console.log('✅ Activité récupérée avec succès');
        return res.rows;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de l\'activité :', error);
        throw error;
    }
};

const selectMaquettes = async () => {
    try {
        const res = await pool.query('SELECT * FROM maquettes');
        console.log('✅ Maquettes récupérée avec succès');
        return res.rows;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des maquettes :', error);
        throw error;
    }
};

const selectSuiviBonusForCalendar = async () => {
    try {
        const res = await pool.query('SELECT * FROM calendarbonus');
        return res.rows;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des maquettes :', error);
        throw error;
    }
};

const selectList = async () => {
    try {
        const res = await pool.query('SELECT * FROM list ORDER BY title_list');
        console.log('✅ Liste récupérée avec succès');
        return res.rows;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des bots :', error);
        throw error;
    }
}

const selectBaseDocu = async () => {
    try {
        const res = await pool.query('SELECT pole_basedocu, service_basedocu, projet_basedocu, sousprojet_basedocu, type_basedocu, titre_basedocu, link_basedocu, date_basedocu FROM basedocu');
        console.log('✅ Base documentaire récupérée avec succès');
        return res.rows;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de la base documentaire :', error);
        throw error;
    }
};

const selectReferentielMaquettes = async () => {
    try {
        const res = await pool.query('SELECT * FROM referentiel_maquettes ORDER BY region_referentiel_maquettes, territoire_referentiel_maquettes');
        console.log('✅ Référentiel des maquettes récupéré avec succès');
        return res.rows;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération du référentiel des maquettes :', error);
        throw error;
    }
};

const selectDossiers = async () => {
    try {
        const res = await pool.query('SELECT societe_dossiers, annee_dossiers, region_dossiers, titre_dossiers, link_dossiers FROM dossiers');
        console.log('✅ Dossiers permanents récupérés avec succès');
        return res.rows;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des dossiers permanents :', error);
        throw error;
    }
};

const selectUserByMail = async (usermail) => {
  try {
    const res = await pool.query('SELECT * FROM users WHERE email_user = $1', [usermail]);
    console.log('✅ Utilisateur récupéré avec succès');
    return res.rows[0];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur :', error);
    throw error;
  }
};

const selectCentreDeCoutsById = async (id) => {
    try {
        const res = await pool.query('SELECT * FROM centredecout WHERE id_centredecout = $1', [id]);
        console.log('✅ Centre de coûts récupéré avec succès');
        return res.rows[0];
    } catch (error) {
        console.error('❌ Erreur lors de la récupération du centre de coûts :', error);
        throw error;
    }
};

const selectEOTPById = async (id) => {
    try {
        const res = await pool.query('SELECT * FROM eotp WHERE id_eotp = $1', [id]);
        console.log('✅ EOTP récupéré avec succès');
        return res.rows[0];
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de l\'EOTP :', error);
        throw error;
    }
};

const selectActivityByUser = async (email) => {
    try {
        const res = await pool.query('SELECT * FROM activity WHERE email_activity = $1', [email]);
        console.log('✅ Activité récupérée avec succès');
        return res.rows;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de l\'activité :', error);
        throw error;
    }
};

const selectBaseDocuBySheetId = async (SheetId) => {
    try {
        const sheetData = await pool.query('SELECT * FROM basedocu WHERE link_basedocu ILIKE($1)', [`%${SheetId}%`]);
        console.log('✅ Base documentaire récupérée avec succès');
        return sheetData.rows[0];
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de la base documentaire :', error);
        throw error;
    }
};

const selectSuiviForCalendarByUser = async (email) => {
    try {
        const res = await pool.query('SELECT * FROM calendar WHERE mail = $1', [email]);
        console.log('✅ Suivi Calendrier récupéré avec succès');
        return res.rows;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des maquettes :', error);
        throw error;
    }
};

const selectDossierById = async (SheetId) => {
    try {
        const res = await pool.query('SELECT * FROM dossiers WHERE link_dossiers ILIKE($1)', [`%${SheetId}%`]);
        console.log('✅ Dossier récupéré avec succès');
        return res.rows[0];
    } catch (error) {
        console.error('❌ Erreur lors de la récupération du dossier :', error);
        throw error;
    }
};

const insertUser = async (userData) => {
  try {
    const res = await pool.query(
      'INSERT INTO users (nom_user, prenom_user, email_user, est_responsable_user, service_user) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userData.nom, userData.prenom, userData.email, userData.est_responsable, userData.service]
    );
    console.log('✅ Utilisateur inséré avec succès', JSON.stringify(res.rows[0]));
    return res.rows[0];
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion de l\'utilisateur :', error);
    throw error;
  }
};

const updateUser = async (userData) => {
  try {
    const res = await pool.query(
      'UPDATE users SET nom_user = $1, prenom_user = $2, email_user = $3, est_responsable_user = $4, service_user = $5 WHERE id_user = $6 RETURNING *',
      [userData.nom, userData.prenom, userData.email, userData.est_responsable, userData.service, userData.id]
    );
    console.log('✅ Utilisateur mis à jour avec succès', JSON.stringify(res.rows[0]));
    return res.rows[0];
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'utilisateur :', error);
    throw error;
  }
};

const insertCentreDeCouts = async (centreData) => {
  try {
    const res = await pool.query(
      'INSERT INTO centredecout (id_centredecout) VALUES ($1) RETURNING *',
      [centreData.id_centredecout]
    );
    console.log('✅ Centre de coûts inséré avec succès', JSON.stringify(res.rows[0]));
    return res.rows[0];
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion du centre de coûts :', error);
    throw error;
  }
};

const insertEOTP = async (eotpData) => {
  try {
    const res = await pool.query(
      'INSERT INTO eotp (id_eotp) VALUES ($1) RETURNING *',
      [eotpData.id_eotp]
    );
    console.log('✅ EOTP inséré avec succès', JSON.stringify(res.rows[0]));
    return res.rows[0];
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion de l\'EOTP :', error);
    throw error;
  }
};

const updateSuiviCalendarValue = async (email, jour, phrase) => {
  if (!/^\d+$/.test(jour)) {
    throw new Error('Jour invalide');
  }

  const colonneSuivi = `suivi${jour}`;
  const colonnePhrase = `phrase${jour}`;

  const query = `UPDATE calendar SET ${colonneSuivi} = TRUE, ${colonnePhrase} = $2 WHERE mail = $1`;

  try {
    const res = await pool.query(query, [email, phrase]);
    logger.info('✅ Statut mis à jour avec succès');
    return res.rows[0];
  } catch (error) {
    logger.error('❌ Erreur lors de la mise à jour du statut :', error.message);
    throw error;
  }
};

const updateSuiviBonusCalendarValue = async (mail, semaine, gagnant) => {

  const query = `UPDATE calendarbonus
  SET ${semaine} = TRUE,
  ${gagnant} = '${mail}'
  WHERE TRUE;`

  try {
    const res = await pool.query(query)
    logger.info('✅ Statut mis à jour avec succès');
    return res.rows[0];
  } catch (error) {
    logger.error('❌ Erreur lors de la mise à jour du statut :', error.message, query);
    throw error;
  }
};

const deleteDossiers = async () => {
  try {
    const res = await pool.query('DELETE FROM dossiers WHERE 1=1');
    console.log('✅ Dossiers permanents supprimés avec succès');
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des dossiers permanents :', error);
    throw error;
  }
};

const insertDossier = async (dossierData) => {
  try {
    const res = await pool.query(
      'INSERT INTO dossiers (societe_dossiers, annee_dossiers, region_dossiers, titre_dossiers, date_dossiers, link_dossiers) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [dossierData.societe, dossierData.annee, dossierData.region, dossierData.titre, dossierData.date, dossierData.link]
    );
    console.log('✅ Dossier inséré avec succès');
    return res.rows[0];
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion du dossier :', error);
    throw error;
  }
};

const updateDossier = async (dossierData) => {
  try {
    const res = await pool.query(
      'UPDATE dossiers SET societe_dossiers = $1, annee_dossiers = $2, region_dossiers = $3, titre_dossiers = $4, link_dossiers = $5 WHERE id_dossiers = $6 RETURNING *',
      [dossierData.societe, dossierData.annee, dossierData.region, dossierData.titre, dossierData.link, dossierData.id]
    );
    console.log('✅ Dossier mis à jour avec succès');
    return res.rows[0];
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du dossier :', error);
    throw error;
  }
};

const deleteBaseDocu = async () => {
  try {
    const res = await pool.query('DELETE FROM basedocu WHERE 1=1');
    console.log('✅ Base documentaire supprimée avec succès');
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la base documentaire :', error);
    throw error;
  }
};

const insertBaseDocu = async (docuData) => {
  console.log(docuData);
  try {
    const res = await pool.query(
      'INSERT INTO basedocu (service_basedocu, type_basedocu, titre_basedocu, link_basedocu, pole_basedocu, projet_basedocu, sousprojet_basedocu, date_basedocu, objet_basedocu) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [docuData.service, docuData.type, docuData.titre, docuData.link, docuData.pole, docuData.projet, docuData.sousprojet, new Date(docuData.date), docuData.objet]
    );
    console.log('✅ Base documentaire insérée avec succès');
    return res.rows[0];
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion de la base documentaire :', error);
    throw error;
  }
};

const updateBaseDocu = async (docuData) => {
  try {
    const res = await pool.query(
      'UPDATE basedocu SET service_basedocu = $1, type_basedocu = $2, titre_basedocu = $3, link_basedocu = $4, pole_basedocu = $5, projet_basedocu = $6, sousprojet_basedocu = $7, date_basedocu = $8, objet_basedocu = $9 WHERE id_basedocu = $10 RETURNING *',
      [docuData.service, docuData.type, docuData.titre, docuData.link, docuData.pole, docuData.projet, docuData.sousprojet, new Date(docuData.date), docuData.objet, docuData.id]
    );
    console.log('✅ Base documentaire mise à jour avec succès');
    return res.rows[0];
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la base documentaire :', error);
    throw error;
  }
};

const insertActivity = async (activity) => {
  try {
    const res = await pool.query('INSERT INTO activity (type_activity, nom_activity, prenom_activity, email_activity, process_activity, region_activity, date_activity) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [activity.type, activity.nom, activity.prenom, activity.email, activity.process, activity.region, new Date(activity.date)]);
    logger.info('✅ Activité insérée avec succès', JSON.stringify(res.rows[0]));
    return res.rows[0];
  } catch (error) {
    logger.error('❌ Erreur lors de l\'insertion de l\'activité :', error.message);
    throw error;
  }
};

const selectBot = async (start, end) => {
  try {
    const totalRes = await pool.query(
      "SELECT COUNT(*)::int AS total FROM activity WHERE type_activity = 'bot'",
    );
    const total = totalRes.rows[0].total;

    const result = await pool.query(`
      SELECT process_activity, COUNT(*)::int AS count,
             ROUND(COUNT(*) * 100.0 / $1, 2) AS percentage
      FROM activity
      WHERE type_activity = 'bot' AND date_activity >= $2 AND date_activity < ($3::date + INTERVAL '1 day')
      GROUP BY process_activity
      ORDER BY count DESC
    `, [total, normalizeStartOfDay(start) || '1970-01-01', normalizeEndOfDay(end) || new Date()]);

    return result.rows;
  } catch (err) {
    throw err
  }
};

const selectUsageByProcess = async (start, end) => {
  try {
    const result = await pool.query(`
      SELECT process_activity, COUNT(*)::int AS count
      FROM activity
      WHERE date_activity >= $1 AND date_activity < ($2::date + INTERVAL '1 day')
      GROUP BY process_activity
      ORDER BY count DESC
    `, [normalizeStartOfDay(start) || '1970-01-01', normalizeEndOfDay(end) || new Date()]);
    return result.rows;
  } catch (err) {
    throw err
  }
};

const selectAllActivity = async (start, end) => {
    try {
        const result = await pool.query(`
      SELECT *
      FROM activity
      WHERE date_activity::date BETWEEN $1::date AND $2::date
      ORDER BY date_activity ASC
    `, [start || '1970-01-01', end || new Date().toISOString().split('T')[0]]);

        return result.rows;
    } catch (err) {
        throw err;
    }
};

const selectUsageByMonth = async () => {
  try {
    const result = await pool.query(`
      SELECT TO_CHAR(date_activity, 'YYYY-MM') AS month, COUNT(*)::int AS count
      FROM activity
      GROUP BY month
      ORDER BY month
    `);
    return result.rows;
  } catch (err) {
    throw err
  }
};

const selectMaquettesByRegion = async (start, end) => {
  try {
    const result = await pool.query(`
      SELECT region_activity, COUNT(*)::int AS count
      FROM activity
      WHERE type_activity IN ('maquette', 'maquette_auxiliaire') AND date_activity >= $1 AND date_activity < ($2::date + INTERVAL '1 day')
      GROUP BY region_activity
      ORDER BY count DESC
    `, [normalizeStartOfDay(start) || '1970-01-01', normalizeEndOfDay(end) || new Date()]);
    return result.rows;
  } catch (err) {
    throw err
  }
};

const selectTopUsers = async (start, end) => {
  try {
    const result = await pool.query(`
      SELECT nom_activity, COUNT(*)::int AS process_count
      FROM activity
      WHERE date_activity >= $1 AND date_activity < ($2::date + INTERVAL '1 day')
      GROUP BY nom_activity
      ORDER BY process_count DESC
      LIMIT 25
    `, [normalizeStartOfDay(start) || '1970-01-01', normalizeEndOfDay(end) || new Date()]);
    return result.rows;
  } catch (err) {
    throw err
  }
};

const normalizeStartOfDay = (date) => {
  if (date === null) {
    return null
  }
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const normalizeEndOfDay = (date) => {
  if (date === null) {
    return null
  }
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
};

async function syncSheetToDB(id, range, tableName) {
  const sheetData = await readGoogleSheet(id, range);

  if (sheetData.length === 0) {
    throw new Error('Aucune donnée à insérer');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY`);

    const columns = Object.keys(sheetData[0]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(',');

    for (const row of sheetData) {
      const values = columns.map(col => row[col]);
      await client.query(
        `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`,
        values
      );
    }

    await client.query('COMMIT');
    console.log(`✅ Table "${tableName}" mise à jour avec ${sheetData.length} lignes.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function readGoogleSheet(id, range) {
  try {
    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      logger.warn('⚠️ Aucune donnée trouvée dans la feuille Google Sheet', {
        id,
        range,
      });
      return [];
    }

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || null;
      });
      return obj;
    });

    logger.info('✅ Données extraites depuis Google Sheets', {
      nbRows: data.length,
      id,
    });

    return data;
  } catch (error) {
    logger.error('❌ Erreur lors de la lecture du Google Sheet', {
      error: error.response?.data || error.message,
      id,
    });
    throw error;
  }
}

async function insertHistory(historyData) {
  try {
    const res = await pool.query(
      'INSERT INTO history (dataname_history, succes_history, type_history, date_lancement_history, date_fin_history) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [historyData.dataname, historyData.succes, historyData.type, historyData.date_lancement, historyData.date_fin]
    );
    logger.info('✅ Historique inséré avec succès', JSON.stringify(res.rows[0]));
    return res.rows[0];
  } catch (error) {
    logger.error('❌ Erreur lors de l\'insertion de l\'historique :', error.message);
    throw error;
  }
}

async function selectHistoryByTable(table) {
  try {
    const res = await pool.query('SELECT * FROM history WHERE dataname_history = $1 ORDER BY date_lancement_history DESC LIMIT 3', [table]);
    logger.info('✅ Historique récupéré avec succès');
    return res.rows;
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération de l\'historique :', error.message);
    throw error;
  }
}

async function getStatus() {
  try {
    const res = await pool.query('SELECT estactive_activation FROM activationrpa WHERE id_activation = 1');
    logger.info('✅ Statut récupéré avec succès');
    return res.rows[0];
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération du statut :', error.message);
    throw error;
  }
}

async function updateStatus(status) {
  try {
    const res = await pool.query('UPDATE activationrpa SET estactive_activation = $1 WHERE id_activation = 1 RETURNING *', [status]);
    logger.info('✅ Statut mis à jour avec succès');
    return res.rows[0];
  } catch (error) {
    logger.error('❌ Erreur lors de la mise à jour du statut :', error.message);
    throw error;
  }
}

module.exports = { genericSelect, selectUsers, selectUserByMail, insertUser, updateUser, selectCentreDesCouts, selectCentreDeCoutsById, insertCentreDeCouts, selectEOTP, selectEOTPById, insertEOTP, selectActivity, selectAllActivity, selectActivityByUser, selectSuiviForCalendarByUser, selectSuiviBonusForCalendar, updateSuiviCalendarValue, updateSuiviBonusCalendarValue, selectMaquettes, selectReferentielMaquettes, selectDossiers, deleteDossiers, selectDossierById, insertDossier, updateDossier, selectBaseDocu, deleteBaseDocu, selectBaseDocuBySheetId, insertBaseDocu, updateBaseDocu, insertActivity, selectList, selectBot, selectMaquettesByRegion, selectTopUsers, selectUsageByMonth, selectUsageByProcess, syncSheetToDB, insertHistory, selectHistoryByTable, getStatus, updateStatus };
