const jwt = require('jsonwebtoken');
const axios = require('axios');

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

        const { data: keys } = await axios.get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
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

    } catch (error) {
        return res.status(401).json({ message: 'Token invalide', error: error.message });
    }

    next();
}

module.exports = authMiddleware;