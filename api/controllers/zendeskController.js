const { uploadAttachment, createZendeskTicketWithAttachment } = require('../services/zendeskService');
const fs = require('fs');
const path = require('path');

exports.createTicket = async (req, res) => {
  const { subject, body, name, email, priority, type } = req.body;
  const files = req.files || [];

  req.files.forEach(file => {
    console.log('---- fichier reçu ----');
    console.log('originalname:', file.originalname);
    console.log('mimetype:', file.mimetype);
    console.log('size attendu (client):', file.size);
    console.log('buffer length:', file.buffer ? file.buffer.length : 'no buffer');
  });

  // Chemin vers le dossier temporaire
  const tmpDir = path.join(__dirname, '../tmp');
  
  // Crée le dossier s'il n'existe pas
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  
  // Écriture des fichiers
  req.files.forEach(file => {
    const filePath = path.join(tmpDir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);
    console.log(`Fichier écrit localement : ${filePath}`);
  });

  try {
    const uploadTokens = await Promise.all(files.map(uploadAttachment));
    await createZendeskTicketWithAttachment(subject, body, name, email, priority, type, uploadTokens);
    res.status(200).send({ message: 'Ticket créé avec succès !' });
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
    res.status(500).send({ message: 'Erreur lors de la création du ticket.', error });
  }
};