const { pool } = require('../config/psql.js');

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

const insertActivity = async (activity) => {
  try {
    const res = await pool.query('INSERT INTO activity (type_activity, nom_activity, prenom_activity, email_activity, process_activity, region_activity, date_activity) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', 
      [activity.type, activity.nom, activity.prenom, activity.email, activity.process, activity.region, activity.date]);
    logger.info('✅ Activité insérée avec succès', res.rows[0]);
    return res.rows[0];
  } catch (error) {
    logger.error('❌ Erreur lors de l\'insertion de l\'activité :', error);
    throw error;
  }
};

// 1. Liste des bots lancés (total et %)
const selectBot = async () => {
  try {
    const totalRes = await db.query(
      "SELECT COUNT(*)::int AS total FROM activity WHERE type_activity = 'bot'"
    );
    const total = totalRes.rows[0].total;

    const result = await db.query(`
      SELECT process_activity, COUNT(*)::int AS count,
             ROUND(COUNT(*) * 100.0 / $1, 2) AS percentage
      FROM activity
      WHERE type_activity = 'bot'
      GROUP BY process_activity
      ORDER BY count DESC
    `, [total]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Nombre d'utilisations par process_activity
const selectUsageByProcess = async () => {
  try {
    const result = await db.query(`
      SELECT process_activity, COUNT(*)::int AS count
      FROM activity
      GROUP BY process_activity
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Nombre de process par mois
const selectUsageByMonth = async () => {
  try {
    const result = await db.query(`
      SELECT TO_CHAR(date_activity, 'YYYY-MM') AS month, COUNT(*)::int AS count
      FROM activity
      GROUP BY month
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Nombre de maquettes par région
const selectMaquettesByRegion = async () => {
  try {
    const result = await db.query(`
      SELECT region_activity, COUNT(*)::int AS count
      FROM activity
      WHERE type_activity IN ('maquettes', 'maquettes_auxiliaire')
      GROUP BY region_activity
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Top 25 utilisateurs les plus actifs
const selectTopUsers = async () => {
  try {
    const result = await db.query(`
      SELECT nom_activity COUNT(*)::int AS process_count
      FROM activity
      GROUP BY nom_activity
      ORDER BY process_count DESC
      LIMIT 25
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = { selectUsers, selectCentreDesCouts, selectEOTP, selectActivity, insertActivity, selectList, selectBot, selectMaquettesByRegion, selectTopUsers, selectUsageByMonth, selectUsageByProcess };