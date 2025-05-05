const { uploadAttachment, createZendeskTicket } = require('../services/zendeskService');

exports.createTicket = async (req, res) => {
  const { subject, body, name, email, priority, type } = req.body;
  const files = req.files || [];

  try {
    const uploadTokens = await Promise.all(files.map(uploadAttachment));
    await createZendeskTicket(subject, body, name, email, priority, type, uploadTokens);
    res.status(200).send({ message: 'Ticket créé avec succès !' });
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
    res.status(500).send({ message: 'Erreur lors de la création du ticket.', error });
  }
};