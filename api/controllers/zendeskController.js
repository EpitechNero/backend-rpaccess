const { uploadAttachment, createZendeskTicketWithAttachment } = require('../services/zendeskService');
const logger = require('../utils/logger');

exports.createTicket = async (req, res) => {
  const { subject, body, name, email, priority, type } = req.body;
  const files = req.files || [];

  try {
    let uploadTokens = [];
    if (files.length > 0) {
      uploadTokens = await Promise.all(
        files.map(async (file) => {
          try {
            const token = await uploadAttachment(file);
            return token;
          } catch (err) {
            throw err;
          }
        })
      );
    }

    const ticketId = await createZendeskTicketWithAttachment(
      subject,
      body,
      name,
      email,
      priority,
      type,
      uploadTokens
    );

    res.status(200).json({
      message: 'Ticket créé avec succès !',
      ticketId,
      uploadedFiles: files.map(f => f.originalname),
    });

  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la création du ticket.',
      error: error.message,
    });
  }
};
