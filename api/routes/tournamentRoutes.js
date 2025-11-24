const express = require('express');
const router = express.Router();
const controller = require('../controllers/tournamentController');

router.post('/tournaments', controller.postTournament);

router.get('/tournaments/:id', controller.getTournament);
router.post('/tournaments/:id/draw-teams', controller.postDrawTeams);
router.post('/tournaments/:id/schedule-matches', controller.postScheduleMatches);
router.post('/matches/:id/score', controller.postScore);
router.get('/tournaments/:id/standings', controller.getStandings);

module.exports = router;
