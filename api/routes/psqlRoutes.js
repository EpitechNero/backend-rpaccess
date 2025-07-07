const express = require('express');
const router = express.Router();
const controller = require('../controllers/psqlController');

router.get('/getusers', controller.getUsers);
router.get('/getcentres', controller.getCentreDesCouts);
router.get('/geteotp', controller.getEOTP);
router.get('/getlist', controller.getList);
router.get('/getactivity', controller.getActivity);
router.get('/getmaquettes', controller.getMaquettes);
router.get('/getreferentielmaquettes', controller.getReferentielMaquettes);
router.get('/getdossiers', controller.getDossiers);
router.get('/getbasedocu', controller.getBaseDocu);

router.get('/getbot', controller.getBot);
router.get('/getusagebyprocess', controller.getUsageByProcess);
router.get('/getusagebymonth', controller.getUsageByMonth);
router.get('/getmaquettesbyregion', controller.getMaquettesByRegion);
router.get('/gettopusers', controller.getTopUsers);

router.get('/getform', controller.getForm);
router.get('/getcountform', controller.getCountForm);
router.get('/getmoyennenotes', controller.getMoyenneNotes);
router.get('/getmoyennenoteszendesk', controller.getMoyenneNotesZendesk);
router.get('/getmots', controller.getMots);
router.get('/getcomments', controller.getComments);
router.get('/getportail', controller.getPortail);
router.get('/getcommentsportail', controller.getCommentsPortail);
router.get('/getzendesk', controller.getZendesk);
router.get('/getcommentszendesk', controller.getCommentsZendesk);
router.get('/getservices', controller.getServices);
router.get('/getmoyenneservice', controller.getMoyenneService);
router.post('/create-form', controller.setForm);

router.post('/create-activity', controller.setActivity);

module.exports = router;