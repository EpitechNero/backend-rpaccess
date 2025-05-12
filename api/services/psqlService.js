const { client } = require('../config/psql.js');

const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log('✅ Connexion à la base de données réussie');

  } catch (error) {
    console.log('❌ Erreur lors de la connexion à la base de données :', error.message);
    throw error;
  }
};

const selectUsers = async () => {
  try {
    const res = await client.query('SELECT * FROM users');
    console.log(res.rows);
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs :', error);
    throw error;
  }
};

const selectCentreDesCouts = async () => {
  try {
    const res = await client.query('SELECT * FROM centresdecouts');
    console.log(res.rows);
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs :', error);
    throw error;
  }
};

const selectEOTP = async () => {
  try {
    const res = await client.query('SELECT * FROM eotp');
    console.log(res.rows);
    return res.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs :', error);
    throw error;
  }
};

export { connectToDatabase, selectUsers, selectCentreDesCouts, selectEOTP };