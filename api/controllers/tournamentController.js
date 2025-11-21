/************************************************************
 * controllers/psqlController.js
 ************************************************************/

const tournamentService = require('../services/tournamentService');
const { pool } = require('../config/psql.js');

// -----------------------------
// POST /tournaments
// -----------------------------
exports.postTournament = async (req, res) => {
  try {
    const { name, rules } = req.body;
    const t = await tournamentService.createTournament(name, rules);
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------
// GET /tournaments/:id
// -----------------------------
exports.getTournament = async (req, res) => {
  try {
    const id = req.params.id;
    const t = await tournamentService.getTournamentWithTeamsAndMatches(id);
    if (!t) return res.status(404).json({ error: 'Tournament not found' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------
// POST /tournaments/:id/create-team
// -----------------------------
exports.postCreateTeam = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, player1, player2 } = req.body;
    const team = await tournamentService.createTeam(id, name, player1, player2);
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------
// POST /tournaments/:id/draw-teams
// -----------------------------
exports.postDrawTeams = async (req, res) => {
  try {
    const id = req.params.id;
    const { players } = req.body;
    const teams = await tournamentService.assignRandomTeams(id, players);
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------
// POST /tournaments/:id/schedule-matches
// -----------------------------
exports.postScheduleMatches = async (req, res) => {
  try {
    const id = req.params.id;
    const { rounds } = req.body;
    const matches = await tournamentService.scheduleMatches(id, rounds || 5);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------
// GET /tournaments/:id/matches
// -----------------------------
exports.getMatches = async (req, res) => {
  try {
    const id = req.params.id;
    const { rows } = await pool.query(`SELECT * FROM matches WHERE tournament_id = $1 ORDER BY id`, [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------
// POST /matches/:id/score
// -----------------------------
exports.postScore = async (req, res) => {
  try {
    const id = req.params.id;
    const { score1, score2 } = req.body;

    const result = await tournamentService.submitMatchScore(id, score1, score2);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------
// GET /tournaments/:id/standings
// -----------------------------
exports.getStandings = async (req, res) => {
  try {
    const id = req.params.id;
    const standings = await tournamentService.computeStandings(id);
    res.json(standings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTournaments = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tournaments ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
