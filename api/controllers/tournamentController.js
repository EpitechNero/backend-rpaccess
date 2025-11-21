// ================================
// controllers/psqlController.js
// ================================


const { pool } = require('../config/psql.js');
const tournamentService = require('../services/tournamentService');


async function postTournament(req, res) {
    try {
        const { name, rules } = req.body;
        const t = await tournamentService.createTournament(name, rules);
        res.json(t);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
}


async function getAllTournaments(req, res) {
    try {
        const { rows } = await pool.query('SELECT * FROM tournaments ORDER BY id');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function getTournament(req, res) {
    try {
        const id = req.params.id;
        const t = await tournamentService.getTournamentWithTeamsAndMatches(id);
        if (!t) return res.status(404).json({ error: 'Tournament not found' });
        res.json(t);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function postCreateTeam(req, res) {
    try {
        const id = req.params.id;
        const { name, player1, player2 } = req.body;
        const team = await tournamentService.createTeam(id, name, player1, player2);
        res.json(team);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function postDrawTeams(req, res) {
    try {
        const id = req.params.id;
        const { players } = req.body;
        const teams = await tournamentService.assignRandomTeams(id, players);
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function postScheduleMatches(req, res) {
    try {
        const id = req.params.id;
        const { rounds } = req.body;
        const matches = await tournamentService.scheduleMatches(id, rounds || 5);
        res.json(matches);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
}


async function getMatches(req, res) {
    try {
        const id = req.params.id;
        const matches = await pool.query('SELECT * FROM matches WHERE tournament_id = $1 ORDER BY id', [id]);
        res.json(matches.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function postScore(req, res) {
    try {
        const id = req.params.id;
        const { score1, score2 } = req.body;
        const result = await tournamentService.submitMatchScore(id, score1, score2);
        res.json(result);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
}


async function getStandings(req, res) {
    try {
        const id = req.params.id;
        const standings = await tournamentService.computeStandings(id);
        res.json(standings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


module.exports = {
    postTournament,
    getAllTournaments,
    getTournament,
    postCreateTeam,
    postDrawTeams,
    postScheduleMatches,
    getMatches,
    postScore,
    getStandings
};