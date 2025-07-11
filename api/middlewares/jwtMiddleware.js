const jwt = require('jsonwebtoken');
const axios = require('axios');

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant' });
    }
    
    req.user = decodedToken;
    next();

    console.error(error);
    return res.status(401).json({ message: 'Token invalide' });
}

module.exports = authMiddleware;