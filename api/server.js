const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require("fs");
const path = require('path');
const axios = require('axios');
const FormData = require('form-data'); // Utilisation correcte de FormData pour Node.js
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const config = {
  zendeskDomain: process.env.ZENDESK_DOMAIN,
  email: process.env.ZENDESK_EMAIL,
  apiToken: process.env.ZENDESK_API_TOKEN,
};

// Configuration du stockage des fichiers avec Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ dest: 'uploads/', storage: storage });

app.get('/', (req, res) => {
  console.log("test");
  res.send('Its Home');
});

app.post('/create-ticket', upload.array('files', 10), async (req, res) => {
  const { subject, body, name, email, priority, type } = req.body;
  const files = req.files;

  try {
    // Upload des fichiers à Zendesk
    const uploadTokens = await Promise.all(files.map(file => uploadAttachment(file.path)));
    
    // Créer un ticket avec les fichiers uploadés
    await createZendeskTicketWithAttachment(subject, body, name, email, priority, type, uploadTokens);
    
    res.status(200).send({ message: 'Ticket créé avec succès !' });
  } catch (error) {
    console.error('Erreur lors du téléversement:', error.response ? error.response.data : error.message);
    res.status(500).send({ message: 'Erreur lors de la création du ticket.', error });
  }
});

// Fonction pour téléverser les fichiers vers Zendesk
async function uploadAttachment(filePath) {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');
  const file = fs.createReadStream(filePath);
  const form = new FormData(); // Utilisation de la librairie form-data pour Node.js
  
  // Append du fichier avec son nom
  form.append('file', file, path.basename(filePath));

  try {
    const response = await axios.post(
      `https://${config.zendeskDomain}/api/v2/uploads.json?filename=${encodeURIComponent(path.basename(filePath))}`,
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

// Fonction pour créer un ticket Zendesk avec pièces jointes
async function createZendeskTicketWithAttachment(subject, body, name, email, priority, type, uploadTokens) {
  const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');
  try {
    const ticketData = {
      ticket: {
        subject: subject,
        comment: {
          body: body,
          html_body: body,
          uploads: uploadTokens // Ajout des tokens d'upload ici
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

module.exports = app;
