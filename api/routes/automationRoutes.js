const express = require('express');
const router = express.Router();
const controller = require('../controllers/automationController');

router.post('/launch', controller.launchBot);
router.post('/check', controller.checkBot);

module.exports = router;