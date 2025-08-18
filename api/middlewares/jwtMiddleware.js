const jwt = require('jsonwebtoken');
const axios = require('axios');

let cachedKeys = null;
let cacheExpiry = 0;

// Récupération et cache des clés publiques Google
async function getPublicKeys() {
    const now = Date.now();
    if (cachedKeys && now < cacheExpiry) {
        return cachedKeys;
    }

    const { data } = await axios.get(
        'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
    );

    cachedKeys = data;
    // Cache jusqu'à 24h plus tard
    cacheExpiry = now + 24 * 60 * 60 * 1000;
    return cachedKeys;
}

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedHeader = JSON.parse(
            Buffer.from(idToken.split('.')[0], 'base64').toString()
        );
        const kid = decodedHeader.kid;

        if (!kid) {
            return res.status(401).json({ message: 'Token invalide : kid manquant' });
        }

        const keys = await getPublicKeys();
        const publicKey = keys[kid];

        if (!publicKey) {
            return res.status(401).json({ message: 'Clé publique non trouvée pour ce kid' });
        }

        const decoded = jwt.verify(idToken, publicKey, {
            algorithms: ['RS256'],
            issuer: 'https://securetoken.google.com/fr-ist-isteau-rpaccef',
            audience: 'fr-ist-isteau-rpaccef'
        });

        req.user = decoded;
        console.log('Utilisateur authentifié:', req.user);

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expiré', error: error.message });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token invalide', error: error.message });
        }
        return res.status(401).json({ message: 'Erreur d’authentification', error: error.message });
    }
}

module.exports = authMiddleware;
