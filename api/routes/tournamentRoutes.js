const express = require('express');
const router = express.Router();
const controller = require('../controllers/psqlController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.post('/tournaments', jwtMiddleware, controller.postTournament); // cr�er un tournoi (nom, r�gles JSON)
router.get('/tournaments/:id', jwtMiddleware, controller.getTournament); // r�cup�rer le tournoi + �quipes + matches
router.post('/tournaments/:id/draw-teams', jwtMiddleware, controller.postDrawTeams); // tirage au sort des �quipes (depuis une liste de players)
router.post('/tournaments/:id/create-team', jwtMiddleware, controller.postCreateTeamn); // cr�er �quipe manuellement
router.post('/tournaments/:id/schedule-matches', jwtMiddleware, controller.postScheduleMatches); // cr�er le calendrier (random pairing) � param�tres: rounds=5
router.get('/tournaments/:id/matches', jwtMiddleware, controller.getMatches); // liste des matches
router.post('/matches/:id/score', jwtMiddleware, controller.postScore); // saisir score d'un match
router.get('/tournaments/:id/standings',jwtMiddleware, controller.getStandings); // calcul des classements

module.exports = router;