const express = require('express');
const cors = require('cors');
const path = require('path');

const bodyParser = require('body-parser');
const YAML = require('yamljs');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

const zendeskRoutes = require('./routes/zendeskRoutes');
const driveRoutes = require('./routes/driveRoutes');
const automationRoutes = require('./routes/automationRoutes');
// const psqlRoutes = require('./routes/psqlRoutes');
const requestLogger = require('./middlewares/requestLogger');

const app = express();
app.use(cors({ origin: ['https://fr-ist-isteau-rpaccef.web.app', 'http://localhost:4200'], methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Documentation Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(requestLogger);
app.use('/zendesk', zendeskRoutes);
app.use('/drive', driveRoutes);
app.use('/aa', automationRoutes);
// app.use('/db', psqlRoutes);

app.get('/', (req, res) => res.send('Its Home'));

module.exports = app;
