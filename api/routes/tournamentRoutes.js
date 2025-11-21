const express = require('express');
const router = express.Router();
const controller = require('../controllers/psqlController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.post('/tournaments', jwtMiddleware, controller.postTournament); // créer un tournoi (nom, règles JSON)
router.get('/tournaments/:id', jwtMiddleware, controller.getTournament); // récupérer le tournoi + équipes + matches
router.post('/tournaments/:id/draw-teams', jwtMiddleware, controller.postDrawTeams); // tirage au sort des équipes (depuis une liste de players)
router.post('/tournaments/:id/create-team', jwtMiddleware, controller.postCreateTeamn); // créer équipe manuellement
router.post('/tournaments/:id/schedule-matches', jwtMiddleware, controller.postScheduleMatches); // créer le calendrier (random pairing) — paramètres: rounds=5
router.get('/tournaments/:id/matches', jwtMiddleware, controller.getMatches); // liste des matches
router.post('/matches/:id/score', jwtMiddleware, controller.postScore); // saisir score d'un match
router.get('/tournaments/:id/standings',jwtMiddleware, controller.getStandings); // calcul des classements

module.exports = router;