// Require DB pool
const { pool } = require('../config/psql.js');

// -----------------------------
// Create tournament
// -----------------------------
async function createTournament(name, rulesJson) {
  const sql = `
        INSERT INTO tournaments (name, rules)
        VALUES ($1, $2)
        RETURNING *;
    `;
  const params = [name, rulesJson];

  const { rows } = await pool.query(sql, params);
  return rows[0];
}

// -----------------------------
// Get tournament with teams + matches
// -----------------------------
async function getTournamentWithTeamsAndMatches(tournamentId) {
  const tournamentQuery = `SELECT * FROM tournaments WHERE id = $1`;
  const { rows: t } = await pool.query(tournamentQuery, [tournamentId]);
  if (!t.length) return null;

  const teamsQuery = `SELECT * FROM teams WHERE tournament_id = $1 ORDER BY id`;
  const { rows: teams } = await pool.query(teamsQuery, [tournamentId]);

  const matchesQuery = `
        SELECT * FROM matches
        WHERE tournament_id = $1
        ORDER BY id
    `;
  const { rows: matches } = await pool.query(matchesQuery, [tournamentId]);

  return {
    ...t[0],
    teams,
    matches,
  };
}

// -----------------------------
// Create a team manually
// -----------------------------
async function createTeam(tournamentId, name, player1, player2) {
  const sql = `
        INSERT INTO teams (tournament_id, name, player1, player2)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;

  const { rows } = await pool.query(sql, [tournamentId, name, player1, player2]);
  return rows[0];
}

// -----------------------------
// Draw random teams from players[]
// -----------------------------
async function assignRandomTeams(tournamentId, playersArray) {
  if (playersArray.length % 2 !== 0) {
    throw new Error('Le nombre de joueurs doit être pair.');
  }

  let players = [...playersArray];
  players.sort(() => Math.random() - 0.5);

  const createdTeams = [];

  for (let i = 0; i < players.length; i += 2) {
    const name = `Team ${i / 2 + 1}`;
    const p1 = players[i];
    const p2 = players[i + 1];

    const { rows } = await pool.query(
      `INSERT INTO teams (tournament_id, name, player1, player2)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
      [tournamentId, name, p1, p2]
    );

    createdTeams.push(rows[0]);
  }

  return createdTeams;
}

// -----------------------------
// Schedule matches (random + rounds)
// -----------------------------
async function scheduleMatches(tournamentId, rounds = 5) {
  const { rows: teams } = await pool.query(
    `SELECT * FROM teams WHERE tournament_id = $1 ORDER BY id`,
    [tournamentId]
  );

  const matches = [];

  for (let r = 1; r <= rounds; r++) {
    const shuffled = [...teams].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i += 2) {
      if (!shuffled[i + 1]) break; // ignore odd team

      const { rows } = await pool.query(
        `INSERT INTO matches (tournament_id, team1_id, team2_id, round)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
        [tournamentId, shuffled[i].id, shuffled[i + 1].id, r]
      );

      matches.push(rows[0]);
    }
  }

  return matches;
}

// -----------------------------
// Submit match score
// -----------------------------
async function submitMatchScore(matchId, score1, score2) {
  const sql = `
        UPDATE matches
        SET score1 = $1, score2 = $2
        WHERE id = $3
        RETURNING *
    `;

  const { rows } = await pool.query(sql, [score1, score2, matchId]);
  return rows[0];
}

// -----------------------------
// Compute standings
// -----------------------------
async function computeStandings(tournamentId) {
  const teams = (await pool.query(`SELECT * FROM teams WHERE tournament_id = $1`, [tournamentId])).rows;
  const matches = (await pool.query(`SELECT * FROM matches WHERE tournament_id = $1`, [tournamentId])).rows;

  const stats = {};
  for (const t of teams) {
    stats[t.id] = {
      team_id: t.id,
      name: t.name,
      played: 0,
      points: 0,
      scored: 0,
      conceded: 0,
      goalaverage: 0,
    };
  }

  for (const m of matches) {
    if (m.score1 == null || m.score2 == null) continue;

    const t1 = stats[m.team1_id];
    const t2 = stats[m.team2_id];

    t1.played++;
    t2.played++;

    t1.scored += m.score1;
    t1.conceded += m.score2;
    t2.scored += m.score2;
    t2.conceded += m.score1;

    // points
    if (m.score1 < m.score2) {
      t1.points += 2;
    } else {
      t2.points += 2;
    }
  }

  // compute goalaverage
  for (const id in stats) {
    stats[id].goalaverage = stats[id].scored - stats[id].conceded;
  }

  const list = Object.values(stats);

  list.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points; // more -> better
    return b.goalaverage - a.goalaverage;
  });

  return list;
}

module.exports = {
  createTournament,
  getTournamentWithTeamsAndMatches,
  createTeam,
  assignRandomTeams,
  scheduleMatches,
  submitMatchScore,
  computeStandings,
};