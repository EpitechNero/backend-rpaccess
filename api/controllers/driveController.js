const { tasks, generateUniqueId, copyDriveFile, uploadDriveFile } = require('../services/driveService');

exports.createMaquette = async (req, res) => {
  const { fileId, targetFolderId, filename } = req.body;
  const taskId = generateUniqueId();
  tasks[taskId] = { status: 'in_progress', copiedFileId: null };

  res.status(202).json({ taskId });

  try {
    const copiedFileId = await copyDriveFile(fileId, targetFolderId, filename);
    tasks[taskId] = { status: 'completed', copiedFileId };
  } catch (error) {
    console.error('Erreur lors de la copie :', error);
    tasks[taskId] = { status: 'error' };
  }
};

exports.getTaskStatus = (req, res) => {
  const task = tasks[req.params.taskId];
  if (task) res.json(task);
  else res.status(404).json({ error: 'Tâche introuvable' });
};

exports.uploadContrat = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Aucun fichier téléchargé.' });
  }

  const file = req.file;
  console.log(file);
  const fileBuffer = file.buffer; // Contenu du fichier
  const fileName = file.originalname; // Nom du fichier original

  try {
    const fileData = await uploadDriveFile(fileBuffer, fileName);
    res.status(200).json({ success: true, fileId: fileData.id });
  } catch (err) {
    console.error('Erreur lors de l\'upload du contrat :', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};