const express = require('express');
const router = express.Router();
const controller = require('../controllers/psqlController');

router.get('/getusers', controller.getUsers);
router.get('/getcentres', controller.getCentreDesCouts);
router.get('/geteotp', controller.getEOTP);
router.get('/getlist', controller.getList);
router.get('/getactivity', controller.getActivity);

router.get('/getbot', controller.getBot);
router.get('/getusagebyprocess', controller.getUsageByProcess);
router.get('/getusagebymonth', controller.getUsageByMonth);
router.get('/getmaquettesbyregion', controller.getMaquettesByRegion);
router.get('/gettopusers', controller.getTopUsers);

router.post('/create-activity', controller.setActivity);

module.exports = router;