const express = require('express');
const router = express.Router();
const controller = require('../controllers/psqlController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

//router.get('/:table', controller.getGenericSelect);

router.get('/getusers', jwtMiddleware, controller.getUsers);
router.get('/getuser/:usermail', jwtMiddleware, controller.getUserByMail);
router.post('/createuser', jwtMiddleware, controller.createUser);
router.patch('/updateuser', jwtMiddleware, controller.updateUser);

router.get('/getcentres',  controller.getCentreDesCouts);
router.get('/getcentre/:id', controller.getCentreDeCoutsById);
router.post('/createcentre', controller.createCentreDeCouts);

router.get('/geteotp', controller.getEOTP);
router.get('/geteotp/:id', controller.getEOTPById);
router.post('/createeotp', controller.createEOTP);

router.get('/getdossiers',  controller.getDossiers);
router.delete('/deletedossiers', controller.deleteDossiers);
router.get('/getdossier/:id', controller.getDossierById);
router.post('/createdossier', controller.createDossier);
router.patch('/updatedossier', controller.updateDossier);

router.get('/getlist', jwtMiddleware,  controller.getList);
router.get('/getactivity', jwtMiddleware, controller.getActivity);
router.get('/getallactivity', jwtMiddleware, controller.getAllActivity);
router.get('/getactivitybyuser/:email', jwtMiddleware, controller.getActivityByUser);
router.get('/getmaquettes', jwtMiddleware,  controller.getMaquettes);
router.get('/getsuiviforcalendarbyuser/:email', jwtMiddleware,  controller.getSuiviForCalendarByUser);
router.get('/getsuivibonusforcalendar', jwtMiddleware,  controller.getSuiviBonusForCalendar);
router.get('/getreferentielmaquettes', jwtMiddleware,  controller.getReferentielMaquettes);

router.get('/getbasedocu', controller.getBaseDocu);
router.delete('/deletebasedocu', controller.deleteBaseDocu);
router.get('/getbasedocu/:sheetId', controller.getBaseDocuBySheetId);
router.post('/insertbasedocu', controller.insertBaseDocu);
router.patch('/updatebasedocu', controller.updateBaseDocu);

router.get('/getbot', controller.getBot);
router.get('/getusagebyprocess', controller.getUsageByProcess);
router.get('/getusagebymonth', controller.getUsageByMonth);
router.get('/getmaquettesbyregion', controller.getMaquettesByRegion);
router.get('/gettopusers', controller.getTopUsers);

router.post('/create-activity', jwtMiddleware, controller.setActivity);
router.post('/sync-tables', jwtMiddleware, controller.syncTableFromSheet);
router.post('/create-history', controller.setHistory);
router.post('/updatesuivicalendarvalue', jwtMiddleware,  controller.updateSuiviCalendar);
router.post('/updatebonuscalendarvalue', jwtMiddleware,  controller.updateSuiviBonusCalendar);
router.get('/get-history/:table', controller.getHistory);

router.get('/getstatus', jwtMiddleware, controller.getStatus);
router.post('/updatestatus', jwtMiddleware, controller.updateStatus);

module.exports = router;