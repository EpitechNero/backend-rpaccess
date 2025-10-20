const express = require('express');
const cors = require('cors');
const path = require('path');

const bodyParser = require('body-parser');

const zendeskRoutes = require('./routes/zendeskRoutes');
const driveRoutes = require('./routes/driveRoutes');
const automationRoutes = require('./routes/automationRoutes');
const psqlRoutes = require('./routes/psqlRoutes');
const requestLogger = require('./middlewares/requestLogger');

const app = express();
app.use(cors({ origin: ['https://fr-ist-isteau-rpaccef.web.app','http://localhost:4200'], methods: ['GET', 'POST', 'OPTIONS'] }));
app.use((req, res, next) => {
  if (req.path.startsWith('/zendesk')) return next();
  bodyParser.json()(req, res, () => bodyParser.urlencoded({ extended: true })(req, res, next));
});

// Documentation Swagger - test push
app.get('/swagger.yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  res.sendFile(path.join(__dirname, 'swagger.yaml'));
});

app.use(requestLogger);
app.use('/zendesk', zendeskRoutes);
app.use('/drive', driveRoutes);
app.use('/aa', automationRoutes);
app.use('/db', psqlRoutes);

app.get('/', (req, res) => res.send('Its Home'));

module.exports = app;
