const { uploadAttachment, createZendeskTicketWithAttachment } = require('../services/zendeskService');

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

  try {
    const uploadTokens = await Promise.all(files.map(uploadAttachment));
    await createZendeskTicketWithAttachment(subject, body, name, email, priority, type, uploadTokens);
    res.status(200).send({ message: 'Ticket créé avec succès !' });
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
    res.status(500).send({ message: 'Erreur lors de la création du ticket.', error });
  }
};