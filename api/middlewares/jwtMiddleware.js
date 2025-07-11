const jwt = require('jsonwebtoken');
const axios = require('axios');

const PROJECT_ID = 'fr-ist-isteau-rpaccef';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // 1. Décoder le header JWT
    const decodedHeader = JSON.parse(Buffer.from(idToken.split('.')[0], 'base64').toString());
    const kid = decodedHeader.kid;

    if (!kid) {
      return res.status(401).json({ message: 'Token invalide : kid manquant' });
    }

    // 2. Récupérer les clés publiques Google
    const certs = await getGoogleCerts();

    const cert = certs[kid];
    if (!cert) {
      return res.status(401).json({ message: 'Certificat introuvable pour ce kid' });
    }

    // 3. Vérifier le token
    const decodedToken = jwt.verify(idToken, cert, {
      algorithms: ['RS256'],
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });

    req.user = decodedToken;
    next();

  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Token invalide' });
  }
}

async function getGoogleCerts() {
  const res = await axios.get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  return res.data;
}

module.exports = authMiddleware;