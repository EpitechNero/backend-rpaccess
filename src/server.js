const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require("fs");
const path = require('path');
const app = express();
const axios = require('axios');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});

require('dotenv').config()
const config = {
    zendeskDomain: process.env.ZENDESK_DOMAIN,
    email: process.env.ZENDESK_EMAIL,
    apiToken: process.env.ZENDESK_API_TOKEN,
  };
  
app.use(cors());

const FormData = require('form-data');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });

const upload = multer({
  dest: 'uploads/',
  storage: storage
});

app.post('/create-ticket', upload.array('files', 10), async (req, res) => {
  const { subject, body, name, email, priority, type, ccEmails } = req.body;
  const files = req.files;


  try {
      const uploadTokens = await Promise.all(files.map(file => uploadAttachment(file.path)));
      const ccEmailList = ccEmails ? ccEmails.split(',').map(email => email.trim()) : [];
      await createZendeskTicketWithAttachment(subject, body, name, email, priority, type, uploadTokens, ccEmailList);
      res.status(200).send({ message: 'Ticket créé avec succès !' });
  } catch (error) {
      console.error('Erreur lors du televersement:', error.response ? error.response.data : error.message);
      res.status(500).send({ message: 'Erreur lors de la création du ticket.', error });
  }
});

async function uploadAttachment(filePath) {
    const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64');
    const file = fs.createReadStream(filePath);
    const form = new FormData();
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
        console.error('Erreur lors du televersement:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function createZendeskTicketWithAttachment(subject, body, name, email, priority, type, uploadTokens, ccEmails = []) {
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
              type: type,
              email_ccs: ccEmails.map(ccEmail => ({ user_email: ccEmail }))
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

app.post('/create-maquette', upload.array('files', 10), async (req, res) => {
    const { fileId, targetFolderId } = req.body;
    const credentialsPath = path.join(__dirname, 'credentials.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath));
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const tokenPath = path.join(__dirname, 'token.json');
    const token = JSON.parse(fs.readFileSync(tokenPath));
    oAuth2Client.setCredentials(token);
  
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    try {
        const response = await drive.files.copy({
            fileId: fileId,
            resource: {
                parents: [targetFolderId],            },
        });
  
      console.log('Fichier copié avec succès :', response.data.id);
      return response.data.id;
    } catch (error) {
        console.error('Erreur lors de la copie du fichier :', error);
    }
  })

app.get('/', (req, res) => {
    res.send('Its Home');
});
