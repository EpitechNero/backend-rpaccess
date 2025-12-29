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

    try {
        const { data } = await axios.get(
            'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
        );
        cachedKeys = data;
        cacheExpiry = now + 24 * 60 * 60 * 1000; // Cache jusqu'à 24h
        return cachedKeys;
    } catch (err) {
        console.error('Erreur récupération clés publiques:', err.message || err);
        throw new Error('Impossible de récupérer les clés publiques');
    }
}

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        // Décodage du header pour récupérer le kid
        const decodedHeader = JSON.parse(Buffer.from(idToken.split('.')[0], 'base64').toString());
        const kid = decodedHeader.kid;

        if (!kid) {
            return res.status(401).json({ message: 'Token invalide : kid manquant' });
        }

        // Récupération des clés publiques
        const keys = await getPublicKeys();
        const publicKey = keys[kid];

        if (!publicKey) {
            return res.status(401).json({ message: 'Clé publique non trouvée pour ce kid' });
        }

        // Vérification du token
        const decoded = jwt.verify(idToken, publicKey, {
            algorithms: ['RS256'],
            issuer: 'https://securetoken.google.com/fr-ist-isteau-rpaccef',
            audience: 'fr-ist-isteau-rpaccef'
        });

        req.user = decoded;
        console.log('Utilisateur authentifié:', req.user.name);

        next();
    } catch (error) {
        // Récupération du payload pour les informations si possible
        const decodedPayload = jwt.decode(idToken) || {};

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token expiré',
                error: error.message,
                tokenDates: {
                    iat: decodedPayload.iat,
                    exp: decodedPayload.exp,
                    auth_time: decodedPayload.auth_time
                }
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Token invalide',
                error: error.message
            });
        }

        console.error('Erreur d’authentification middleware:', error.message || error);
        return res.status(500).json({
            message: 'Erreur interne lors de l’authentification',
            error: error.message
        });
    }
}

module.exports = authMiddleware;
