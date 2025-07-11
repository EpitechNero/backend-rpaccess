const jwt = require('jsonwebtoken');
const axios = require('axios');

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant' });
    }
    
    next();
}

module.exports = authMiddleware;