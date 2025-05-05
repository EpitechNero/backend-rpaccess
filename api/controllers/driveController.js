const { tasks, generateUniqueId, copyDriveFile } = require('../services/driveService');

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