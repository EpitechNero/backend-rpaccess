const { client } = require('../config/psql.js');

const connectToDatabase = async () => {
  try {
    if (!client._connected) {
      await client.connect();
      client._connected = true;
      console.log('✅ Connexion à la base de données réussie');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la connexion à la base de données :', error);
    throw error;
  }
};

const selectUsers = async () => {
  try {
    connectToDatabase();
    const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
    console.log(res.rows);
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs :', error);
    throw error;
  }
};

const selectCentreDesCouts = async () => {
  try {
    connectToDatabase();
    const res = await client.query('SELECT * FROM centresdecouts');
    console.log(res.rows);
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des centre de couts :', error);
    throw error;
  }
};

const selectEOTP = async () => {
  try {
    connectToDatabase();
    const res = await client.query('SELECT * FROM eotp');
    console.log(res.rows);
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des eotp :', error);
    throw error;
  }
};

const selectList = async () => {
  try {
    connectToDatabase();
    const res = await client.query('SELECT * FROM list');
    console.log(res.rows);
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des bots :', error);
    throw error;
  }
}

const selectActivity = async () => {
  try {
    connectToDatabase();
    const res = await client.query('SELECT * FROM activity');
    console.log(res.rows);
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'activité :', error);
    throw error;
  }
};

const insertActivity = async (activity) => {
  try {
    connectToDatabase();
    const res = await client.query('INSERT INTO activity (nom_activity, prenom_activity, email_activity, requete_activity, date_activity) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
      [activity.nom, activity.prenom, activity.email, activity.requete, activity.date]);
    console.log('✅ Activité insérée avec succès');
    console.log(res.rows);
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion de l\'activité :', error);
    throw error;
  }
};

module.exports = { connectToDatabase, selectUsers, selectCentreDesCouts, selectEOTP, selectActivity, insertActivity, selectList };