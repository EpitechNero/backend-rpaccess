const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const zendeskRoutes = require('./routes/zendeskRoutes');
const driveRoutes = require('./routes/driveRoutes');
const automationRoutes = require('./routes/automationRoutes');

const requestLogger = require('./middlewares/requestLogger');

const app = express();
app.use(cors({ origin: 'https://fr-ist-isteau-rpaccef.web.app', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);
app.use('/zendesk', zendeskRoutes);
app.use('/drive', driveRoutes);
app.use('/aa', automationRoutes);

app.get('/', (req, res) => res.send('Its Home'));

app.use((err, req, res, next) => {
    logger.error('❌ Erreur survenue durant la requête', {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      error: err.message,
      stack: err.stack,
    });
  
    res.status(500).json({ error: 'Erreur interne du serveur' });
  });

module.exports = app;
