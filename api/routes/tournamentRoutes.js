const express = require('express');
const router = express.Router();
const controller = require('../controllers/psqlController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.post('/tournaments', jwtMiddleware, controller.postTournament);
router.get('/tournaments', jwtMiddleware, controller.getAllTournaments);
router.get('/tournaments/:id', jwtMiddleware, controller.getTournament);
router.post('/tournaments/:id/create-team', jwtMiddleware, controller.postCreateTeam);
router.post('/tournaments/:id/draw-teams', jwtMiddleware, controller.postDrawTeams);
router.post('/tournaments/:id/schedule-matches', jwtMiddleware, controller.postScheduleMatches);
router.get('/tournaments/:id/matches', jwtMiddleware, controller.getMatches);
router.post('/matches/:id/score', jwtMiddleware, controller.postScore);
router.get('/tournaments/:id/standings', jwtMiddleware, controller.getStandings);


module.exports = router;