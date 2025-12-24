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
      body: req.originalUrl == 'zendesk/create-ticket' ? 'Body html ticket Zendesk' : req.body,
    });
  });

  next();
};

module.exports = requestLogger;
