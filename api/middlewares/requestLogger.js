const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    logger.info('📥 Requête entrante', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${durationMs}ms`,
      body: req.body,
    });
  });

  res.on('error', (err) => {
    logger.error('❌ Erreur lors du traitement de la réponse', {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      error: err.message,
    });
  });

  next();
};

module.exports = requestLogger;
