const tournamentService = require('../services/tournamentService');

exports.postTournament = async (req, res) => {
  try {
    const { name, rules } = req.body;
    const t = await tournamentService.createTournament(name, rules);
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

exports.postDrawTeams = async (req, res) => {
  try {
    const id = req.params.id;
    const teams = await tournamentService.assignRandomTeamsWithAvailability(id);
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

exports.getStandings = async (req, res) => {
  try {
    const id = req.params.id;
    const standings = await tournamentService.computeStandings(id);
    res.json(standings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyMatches = async (req, res) => {
  try {
    const tournamentId = Number(req.params.id);
    const userEmail = req.query.email;
    
    const matches = await tournamentService.getMatchesForUser(tournamentId, userEmail);

    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getMatchById = async (req, res) => {
    try {
        const tournamentId = Number(req.params.id);
        const matchId = Number(req.params.matchId)

        const match = await tournamentService.getMatchById(tournamentId, matchId);

        res.json(match);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllTournaments = async (req, res) => {
  try {
    const tournaments = await tournamentService.getAllTournaments();
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.finishMatch = async (req, res) => {
    const { matchId } = req.params;
    const { score_home, score_away } = req.body;

    try {
        const result = await tournamentService.finishMatch(matchId, score_home, score_away);
        res.json(result);

    } catch (err) {
        console.error(err);

        if (err.code === "NOT_FOUND") {
            return res.status(404).json({ error: err.message });
        }

        if (err.code === "ALREADY_FINISHED") {
            return res.status(400).json({ error: err.message });
        }

        res.status(500).json({ error: "Internal server error" });
    }
};


