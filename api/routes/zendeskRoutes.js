const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/zendeskController');

const upload = multer({ storage: multer.memoryStorage() });
router.post('/create-ticket', upload.array('files', 10), controller.createTicket);

module.exports = router;