const express = require('express');
const router = express.Router();
const controller = require('../controllers/psqlController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.get('/getusers',  controller.getUsers);
router.get('/getuser/:usermail', controller.getUserByMail);
router.post('/createuser', controller.createUser);
router.patch('/updateuser', controller.updateUser);

router.get('/getcentres', jwtMiddleware,  controller.getCentreDesCouts);
router.get('/geteotp', jwtMiddleware,  controller.getEOTP);
router.get('/getlist', jwtMiddleware,  controller.getList);
router.get('/getactivity', jwtMiddleware, controller.getActivity);
router.get('/getmaquettes', jwtMiddleware,  controller.getMaquettes);
router.get('/getreferentielmaquettes', jwtMiddleware,  controller.getReferentielMaquettes);
router.get('/getdossiers', jwtMiddleware,  controller.getDossiers);
router.get('/getbasedocu', jwtMiddleware,  controller.getBaseDocu);

router.get('/getbot', jwtMiddleware, controller.getBot);
router.get('/getusagebyprocess', jwtMiddleware, controller.getUsageByProcess);
router.get('/getusagebymonth', jwtMiddleware, controller.getUsageByMonth);
router.get('/getmaquettesbyregion', jwtMiddleware, controller.getMaquettesByRegion);
router.get('/gettopusers', jwtMiddleware, controller.getTopUsers);

router.get('/getform', jwtMiddleware,  controller.getForm);
router.get('/getcountform', jwtMiddleware,  controller.getCountForm);
router.get('/getmoyennenotes', jwtMiddleware,  controller.getMoyenneNotes);
router.get('/getmoyennenoteszendesk', jwtMiddleware, controller.getMoyenneNotesZendesk);
router.get('/getmots', jwtMiddleware, controller.getMots);
router.get('/getcomments', jwtMiddleware, controller.getComments);
router.get('/getportail', jwtMiddleware, controller.getPortail);
router.get('/getcommentsportail', jwtMiddleware, controller.getCommentsPortail);
router.get('/getzendesk', jwtMiddleware, controller.getZendesk);
router.get('/getcommentszendesk', jwtMiddleware, controller.getCommentsZendesk);
router.get('/getservices', jwtMiddleware, controller.getServices);
router.get('/getmoyenneservice', jwtMiddleware, controller.getMoyenneService);
router.post('/create-form', jwtMiddleware, controller.setForm);

router.post('/create-activity', jwtMiddleware, controller.setActivity);

module.exports = router;