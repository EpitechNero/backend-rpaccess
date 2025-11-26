const express = require('express');
const router = express.Router();
const controller = require('../controllers/tournamentController');

// Créer un tournoi
router.post('/tournaments', controller.postTournament);

// Récupérer tous les tournois
router.get('/tournaments', controller.getAllTournaments);

// Récupérer un tournoi avec équipes + matchs
router.get('/tournaments/:id', controller.getTournament);

// Tirage au sort des équipes
router.post('/tournaments/:id/draw-teams', controller.postDrawTeams);

// Planifier les matchs
router.post('/tournaments/:id/schedule-matches', controller.postScheduleMatches);

// Soumettre un score
router.post('/matches/:id/score', controller.postScore);

// Classement / standings
router.get('/tournaments/:id/standings', controller.getStandings);

// Récupérer les matchs d’un utilisateur
router.get('/tournaments/:id/my-matches', controller.getMyMatches);

// Récupérer les matchs d’un utilisateur
router.get('/tournaments/:id/my-matches/:matchId', controller.getMyMatches);

module.exports = router;
