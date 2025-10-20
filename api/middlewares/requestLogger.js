const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;

    // Pour multipart/form-data, on ne loge pas body
    const isMultipart = req.headers['content-type']?.startsWith('multipart/form-data');

    logger.info('📥 Requête entrante', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${durationMs}ms`,
      body: isMultipart ? '[multipart data]' : req.body,
    });
  });

  next();
};


module.exports = requestLogger;
