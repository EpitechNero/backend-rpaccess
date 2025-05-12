const express = require('express');
const router = express.Router();
const controller = require('../controllers/psqlController');

router.get('/getusers', controller.getUsers);
router.get('/getcentres', controller.getCentreDesCouts);
router.get('/geteotp', controller.getEOTP);

module.exports = router;