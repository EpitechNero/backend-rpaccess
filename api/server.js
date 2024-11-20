const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: 'https://fr-ist-isteau-rpaccef.web.app',
  methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const config = {
  zendeskDomain: process.env.ZENDESK_DOMAIN,
  email: process.env.ZENDESK_EMAIL,
  apiToken: process.env.ZENDESK_API_TOKEN,
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.get('/', (req, res) => {
  console.log("test");
  res.send('Its Home');
});

app.post('/create-ticket', upload.array('files', 10), async (req, res) => {
  const { subject, body, name, email, priority, type } = req.body;
  const files = req.files;

  try {
    const uploadTokens = await Promise.all(files.map(file => uploadAttachment(file)));
    await createZendeskTicketWithAttachment(subject, body, name, email, priority, type, uploadTokens);

    res.status(200).send({ message: 'Ticket créé avec succès !' });
  } catch (error) {
    console.error('Erreur lors du téléversement:', error.response ? error.response.data : error.message);
    res.status(500).send({ message: 'Erreur lors de la création du ticket.', error });
  }
});

async function uploadAttachment(file) {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');
  
  const form = new FormData();
  form.append('file', file.buffer, file.originalname);

  try {
    const response = await axios.post(
      `https://${config.zendeskDomain}/api/v2/uploads.json?filename=${encodeURIComponent(file.originalname)}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data.upload.token;
  } catch (error) {
    console.error('Erreur lors du téléversement:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function createZendeskTicketWithAttachment(subject, body, name, email, priority, type, uploadTokens) {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');
  try {
    const ticketData = {
      ticket: {
        subject: subject,
        comment: {
          body: body,
          html_body: body,
          uploads: uploadTokens
        },
        requester: {
          name: name,
          email: email
        },
        priority: priority,
        type: type
      }
    };

    const response = await axios.post(
      `https://${config.zendeskDomain}/api/v2/tickets.json`,
      ticketData,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    console.log('Ticket créé avec succès:', response.data.ticket.id);
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error.response ? error.response.data : error.message);
  }
}

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.ADMIN_REFRESH_TOKEN,
});

async function getAccessToken() {
  try {
    const { token } = await oAuth2Client.getAccessToken();
    return token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token :', error.message);
    throw new Error('Impossible de récupérer le token.');
  }
}

const tasks = {}; // Stocker les tâches en mémoire

app.post('/create-maquette', async (req, res) => {
  const { fileId, targetFolderId, filename } = req.body;
  const taskId = generateUniqueId();

  // Initialise l'état de la tâche
  tasks[taskId] = { status: 'in_progress', copiedFileId: null };

  if (!fileId || !targetFolderId) {
    return res.status(400).json({ error: 'fileId et targetFolderId sont requis.' });
  }
  console.log('Tâche créée avec ID :', taskId);

  // Répondre immédiatement au front avec le `taskId`
  res.status(202).json({ taskId });

  // Effectuer la copie en arrière-plan
  try {
    console.log('Obtention du token d\'accès...');
    const accessToken = await getAccessToken();
    console.log('Token obtenu avec succès.');

    console.log('Initialisation du service Google Drive...');
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    console.log('Copie du fichier...');
    const response = await drive.files.copy({
      fileId,
      resource: { 
        parents: [targetFolderId],
        name: filename,
      },
      supportsAllDrives: true,
    });

    const newFileId = response.data.id; // ID du fichier copié
    console.log('Fichier copié avec succès :', newFileId);

    // Mise à jour de l'état de la tâche et stockage de l'ID
    tasks[taskId].status = 'completed';
    tasks[taskId].copiedFileId = newFileId;
  } catch (error) {
    console.error('Erreur lors de la copie du fichier:', error.response?.data || error.message);
    tasks[taskId].status = 'error'; // Mise à jour en cas d'erreur
  }
});

app.get('/task-status/:taskId', (req, res) => {
  const taskId = req.params.taskId;

  // Vérifiez si la tâche existe
  if (tasks[taskId]) {
    const task = tasks[taskId];
    res.json({ status: task.status, copiedFileId: task.copiedFileId });
  } else {
    res.status(404).json({ error: 'Tâche introuvable' });
  }
});
module.exports = app;
