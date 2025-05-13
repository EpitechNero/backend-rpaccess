const express = require('express');
const router = express.Router();
const controller = require('../controllers/psqlController');

router.get('/getusers', controller.getUsers);
router.get('/getcentres', controller.getCentreDesCouts);
router.get('/geteotp', controller.getEOTP);
router.get('getlist', controller.getList);
router.get('/getactivity', controller.getActivity);

router.post('/create-activity', controller.setActivity);

module.exports = router;