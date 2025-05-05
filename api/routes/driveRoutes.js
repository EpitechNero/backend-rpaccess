const express = require('express');
const router = express.Router();
const controller = require('../controllers/driveController');

router.post('/create-maquette', controller.createMaquette);
router.get('/task-status/:taskId', controller.getTaskStatus);

module.exports = router;