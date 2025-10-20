/*const { uploadAttachment, createZendeskTicketWithAttachment } = require('../services/zendeskService');

exports.createTicket = async (req, res) => {
  const { subject, body, name, email, priority, type } = req.body;
  const files = req.files || [];

  try {
    const uploadTokens = await Promise.all(files.map(uploadAttachment));
    await createZendeskTicketWithAttachment(subject, body, name, email, priority, type, uploadTokens);
    res.status(200).send({ message: 'Ticket créé avec succès !' });
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
    res.status(500).send({ message: 'Erreur lors de la création du ticket.', error });
  }
};*/

const fs = require('fs');
const path = require('path');
const { uploadAttachment, createZendeskTicketWithAttachment } = require('../services/zendeskService');
const logger = require('../utils/logger');

exports.createTicket = async (req, res) => {
  const { subject, body, name, email, priority, type } = req.body;
  const files = req.files || [];

  logger.info('🎫 Création de ticket Zendesk', {
    subject,
    email,
    nbFichiers: files.length,
  });

  try {
    // Étape 1 : Vérification / debug des fichiers reçus (facultatif)
    for (const file of files) {
      logger.info('📂 Fichier reçu', {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.buffer.length,
        tmpPath,
      });
    }

    // Étape 2 : Upload des fichiers vers Zendesk
    let uploadTokens = [];
    if (files.length > 0) {
      uploadTokens = await Promise.all(files.map(async (file) => {
        try {
          const token = await uploadAttachment(file);
          return token;
        } catch (err) {
          logger.error('❌ Erreur upload fichier', {
            filename: file.originalname,
            error: err.response?.data || err.message,
          });
          throw err;
        }
      }));
    }

    // Étape 3 : Création du ticket Zendesk
    const ticketId = await createZendeskTicketWithAttachment(
      subject,
      body,
      name,
      email,
      priority,
      type,
      uploadTokens
    );

    logger.info('✅ Ticket créé avec succès', {
      ticketId,
      fichiers: files.map(f => f.originalname),
    });

    res.status(200).json({
      message: 'Ticket créé avec succès !',
      ticketId,
      uploadedFiles: files.map(f => f.originalname),
    });

  } catch (error) {
    logger.error('💥 Erreur lors de la création du ticket', {
      error: error.response?.data || error.message,
    });
    res.status(500).json({
      message: 'Erreur lors de la création du ticket.',
      error: error.message,
    });
  }
};