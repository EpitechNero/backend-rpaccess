const express = require('express');
const router = express.Router();
const controller = require('../controllers/psqlController');

router.post('/tournaments', controller.postTournament);
router.get('/tournaments', controller.getAllTournaments);
router.get('/tournaments/:id', controller.getTournament);
router.post('/tournaments/:id/create-team', controller.postCreateTeam);
router.post('/tournaments/:id/draw-teams', controller.postDrawTeams);
router.post('/tournaments/:id/schedule-matches', controller.postScheduleMatches);
router.get('/tournaments/:id/matches', controller.getMatches);
router.post('/matches/:id/score', controller.postScore);
router.get('/tournaments/:id/standings', controller.getStandings);


module.exports = router;