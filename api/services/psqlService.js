const { pool } = require('../config/psql.js');
const logger = require('../utils/logger');

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

const selectList = async () => {
  try {
    const res = await pool.query('SELECT * FROM list');
    console.log('✅ Liste récupérée avec succès');
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des bots :', error);
    throw error;
  }
}

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

const selectReferentielMaquettes = async () => {
  try {
    const res = await pool.query('SELECT * FROM referentiel_maquettes');
    console.log('✅ Référentiel des maquettes récupéré avec succès');
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du référentiel des maquettes :', error);
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

const selectCountForm = async () => {
  try {
    const result = await pool.query(`SELECT COUNT(*) FROM form`);
    return result.rows[0];
  } catch (err) {
    throw err
  }
};

const selectAvgNotes = async () => {
    try {
    const result = await pool.query(`SELECT ROUND(AVG(note_form),1) FROM form`);
    return result.rows[0];
  } catch (err) {
    throw err
  }
};

const selectComments = async () => {
  try {
    const result = await pool.query(`SELECT commentaire_form FROM form`);
    return result.rows;
  } catch (err) {
    throw err
  }
}

const selectAttentes = async () => {
  try {
    const result = await pool.query(`SELECT attentes_form,COUNT(attentes_form) FROM form GROUP BY attentes_form`);
    return result.rows;
  } catch (err) {
    throw err
  }
}

const selectZendesk = async () => {
  try {
    const result = await pool.query(`SELECT zendesk_form,COUNT(zendesk_form) FROM form GROUP BY zendesk_form`);
    return result.rows;
  } catch (err) {
    throw err
  }
}

module.exports = { selectUsers, selectCentreDesCouts, selectEOTP, selectActivity, selectMaquettes, selectReferentielMaquettes, insertActivity, selectList, selectBot, selectMaquettesByRegion, selectTopUsers, selectUsageByMonth, selectUsageByProcess, selectCountForm, selectAvgNotes, selectComments, selectAttentes, selectZendesk };