const { pool } = require('../config/psql.js');
const tournamentService = require('../services/tournamentService');

exports.postTournament = async (req, res) => {
  try {
    const { name, rules } = req.body;
    const tournament = await tournamentService.createTournament(name, rules);
    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTournaments = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tournaments ORDER BY id');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTournament = async (req, res) => {
  try {
    const id = req.params.id;
    const tournament = await tournamentService.getTournamentWithTeamsAndMatches(id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.postCreateTeam = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, player1, player2 } = req.body;
    const team = await tournamentService.createTeam(id, name, player1, player2);
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.postDrawTeams = async (req, res) => {
  try {
    const id = req.params.id;
    const { players } = req.body;
    const teams = await tournamentService.assignRandomTeams(id, players);
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.postScheduleMatches = async (req, res) => {
  try {
    const id = req.params.id;
    const { rounds } = req.body;
    const matches = await tournamentService.scheduleMatches(id, rounds || 5);
    res.status(201).json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMatches = async (req, res) => {
  try {
    const id = req.params.id;
    const { rows } = await pool.query('SELECT * FROM matches WHERE tournament_id = $1 ORDER BY id', [id]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.postScore = async (req, res) => {
  try {
    const id = req.params.id;
    const { score1, score2 } = req.body;
    const match = await tournamentService.submitMatchScore(id, score1, score2);
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStandings = async (req, res) => {
  try {
    const id = req.params.id;
    const standings = await tournamentService.computeStandings(id);
    res.status(200).json(standings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};