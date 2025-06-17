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

const selectForm = async () => {
  try {
    const result = await pool.query(`SELECT * FROM form`);
    return result.rows;
  } catch (err) {
    throw err
  }
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

const selectMots = async () => {
  try {
    const result = await pool.query(`SELECT mot, SUM(somme_ponderation) AS somme_ponderation FROM(SELECT mot1_form AS mot, SUM(ponderation) AS somme_ponderation FROM (SELECT LOWER(mot1_form) AS mot1_form, 3  AS ponderation FROM form) GROUP BY mot1_form UNION SELECT mot2_form AS mot, SUM(ponderation) AS somme_ponderation FROM (SELECT LOWER(mot2_form) AS mot2_form, 2  AS ponderation FROM form) GROUP BY mot2_form UNION SELECT mot3_form AS mot, SUM(ponderation) AS somme_ponderation FROM (SELECT LOWER(mot3_form) AS mot3_form, 1  AS ponderation FROM form) GROUP BY mot3_form) GROUP BY mot ORDER BY somme_ponderation DESC LIMIT 20`);
    return result.rows;
  } catch (err) {
    throw err
  }
};

const selectComments = async () => {
  try {
    const result = await pool.query(`SELECT mail_form, commentaire_form FROM form`);
    return result.rows;
  } catch (err) {
    throw err
  }
}

const selectPortail = async () => {
  try {
    const result = await pool.query(`SELECT portail_form,COUNT(portail_form) FROM form GROUP BY portail_form`);
    return result.rows;
  } catch (err) {
    throw err
  }
}

const selectCommentsPortail = async () => {
  try {
    const result = await pool.query(`SELECT raison_portail_form FROM form WHERE raison_portail_form IS NOT NULL`);
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

const selectCommentsZendesk = async () => {
  try {
    const result = await pool.query(`SELECT raison_zendesk_form FROM form WHERE raison_zendesk_form IS NOT NULL`);
    return result.rows;
  } catch (err) {
    throw err
  }
}

const selectServices = async () => {
  try {
    const result = await pool.query(`SELECT 'Reversements'  AS service, COUNT(*) FROM form WHERE service_reac_rever_form IS NOT NULL AND service_exper_rever_form IS NOT NULL UNION SELECT 'AMOA & RPA' AS service, COUNT(*) FROM form WHERE service_reac_amoa_form IS NOT NULL AND service_exper_amoa_form IS NOT NULL UNION SELECT 'Activité bancaire clientèle' AS service, COUNT(*) FROM form WHERE service_reac_actbanc_form IS NOT NULL AND service_exper_actbanc_form IS NOT NULL UNION SELECT 'Dépenses spé & fact manuelles' AS service, COUNT(*) FROM form WHERE service_reac_depspe_form IS NOT NULL AND service_exper_depspe_form IS NOT NULL UNION SELECT 'Cautions bancaires' AS service, COUNT(*) FROM form WHERE service_reac_caubanc_form IS NOT NULL AND service_exper_caubanc_form IS NOT NULL UNION SELECT 'Compta Générale / Gestion immo' AS service, COUNT(*) FROM form WHERE service_reac_comptag_form IS NOT NULL AND service_exper_comptag_form IS NOT NULL UNION SELECT 'Fiscalité locale' AS service, COUNT(*) FROM form WHERE service_reac_fiscal_form IS NOT NULL AND service_exper_fiscal_form IS NOT NULL`);
    return result.rows;
  } catch (err) {
    throw err;
  }
};

const selectAvgServices = async () => {
  try {
    const result = await pool.query(`SELECT 'Reversements' AS service, ROUND(AVG(service_reac_rever_form),1) AS Reactivite , ROUND(AVG(service_exper_rever_form),1) AS Expertise FROM form UNION SELECT 'AMOA & RPA' AS service, ROUND(AVG(service_reac_amoa_form),1) AS Reactivite , ROUND(AVG(service_exper_amoa_form),1) AS Expertise FROM form UNION SELECT 'Activité bancaire clientèle' AS service, ROUND(AVG(service_reac_actbanc_form),1) AS Reactivite , ROUND(AVG(service_exper_actbanc_form),1) AS Expertise FROM form UNION SELECT 'Dépenses spécifiques et factures manuelles' AS service, ROUND(AVG(service_reac_depspe_form),1) AS Reactivite , ROUND(AVG(service_exper_depspe_form),1) AS Expertise FROM form UNION SELECT 'Cautions bancaires' AS service, ROUND(AVG(service_reac_caubanc_form),1) AS Reactivite , ROUND(AVG(service_exper_caubanc_form),1) AS Expertise FROM form UNION SELECT 'Comptabilité Générale / Gestion des immobilisations' AS service, ROUND(AVG(service_reac_comptag_form),1) AS Reactivite , ROUND(AVG(service_exper_comptag_form),1) AS Expertise FROM form UNION SELECT 'Fiscalité locale' AS service, ROUND(AVG(service_reac_fiscal_form),1) AS Reactivite , ROUND(AVG(service_exper_fiscal_form),1) AS Expertise FROM form`);
    return result.rows;
  } catch (err) {
    throw err;
  }
};

const insertForm = async (formData) => {
  try {
    const res = await pool.query(
      `INSERT INTO form (
        note_form, mot1_form, mot2_form, mot3_form, portail_form, raison_portail_form, zendesk_form, raison_zendesk_form
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [formData.satisfactionLevel, formData.mot1, formData.mot2, formData.mot3, formData.portail, formData.portailReason, formData.zendesk, formData.zendeskReason]
    );
    logger.info('✅ Formulaire inséré avec succès', JSON.stringify(res.rows[0]));
    return res.rows[0];
  } catch (error) {
    logger.error('❌ Erreur lors de l\'insertion du formulaire :', error.message);
    throw error;
  }
};

module.exports = { selectUsers, selectCentreDesCouts, selectEOTP, selectActivity, selectMaquettes, selectReferentielMaquettes, insertActivity, selectList, selectBot, selectMaquettesByRegion, selectTopUsers, selectUsageByMonth, selectUsageByProcess, selectCountForm, selectAvgNotes, selectMots, selectComments, selectPortail, selectCommentsPortail, selectZendesk, selectCommentsZendesk, selectServices, selectAvgServices, insertForm, selectForm };