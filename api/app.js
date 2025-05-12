const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const zendeskRoutes = require('./routes/zendeskRoutes');
const driveRoutes = require('./routes/driveRoutes');
const automationRoutes = require('./routes/automationRoutes');
const psqlRoutes = require('./routes/psqlRoutes');

const requestLogger = require('./middlewares/requestLogger');

const app = express();
app.use(cors({ origin: 'https://fr-ist-isteau-rpaccef.web.app', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);
app.use('/zendesk', zendeskRoutes);
app.use('/drive', driveRoutes);
app.use('/aa', automationRoutes);
app.use('/db', psqlRoutes);

app.get('/', (req, res) => res.send('Its Home'));

module.exports = app;
