const express = require('express');
const router = express.Router();
const controller = require('../controllers/driveController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/create-maquette', controller.createMaquette);
router.get('/task-status/:taskId', controller.getTaskStatus);
router.post('/upload-contrat', upload.single('file'), controller.uploadContrat);

module.exports = router;