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
    const res = await pool.query('INSERT INTO activity (nom_activity, prenom_activity, email_activity, requete_activity, date_activity) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
      [activity.nom, activity.prenom, activity.email, activity.requete, activity.date]);
    console.log('✅ Activité insérée avec succès');
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion de l\'activité :', error);
    throw error;
  }
};

module.exports = { selectUsers, selectCentreDesCouts, selectEOTP, selectActivity, insertActivity, selectList };