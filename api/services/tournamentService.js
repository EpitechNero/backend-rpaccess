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
// Helper: check if 2 players have a common day
// -----------------------------
function hasCommonDay(p1, p2) {
  return p1.lundi && p2.lundi ||
         p1.mardi && p2.mardi ||
         p1.mercredi && p2.mercredi ||
         p1.jeudi && p2.jeudi ||
         p1.vendredi && p2.vendredi;
}

// -----------------------------
// Draw random teams from players table with availability
// -----------------------------
async function assignRandomTeamsWithAvailability(tournamentId) {
  // Fetch all players
  const { rows: players } = await pool.query(`SELECT * FROM players`);

  if (players.length < 2) throw new Error('Pas assez de joueurs pour former des équipes.');

  // Shuffle players
  let shuffled = players.sort(() => Math.random() - 0.5);

  const createdTeams = [];
  const used = new Set();

  for (let i = 0; i < shuffled.length; i++) {
    if (used.has(shuffled[i].id)) continue;

    let found = false;
    for (let j = i + 1; j < shuffled.length; j++) {
      if (used.has(shuffled[j].id)) continue;

      if (hasCommonDay(shuffled[i], shuffled[j])) {
        const name = `Team ${createdTeams.length + 1}`;
        const { rows } = await pool.query(
          `INSERT INTO teams (tournament_id, name, player1, player2)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [tournamentId, name, shuffled[i].id, shuffled[j].id]
        );
        createdTeams.push(rows[0]);
        used.add(shuffled[i].id);
        used.add(shuffled[j].id);
        found = true;
        break;
      }
    }

    if (!found) {
      console.log(`Impossible de trouver un partenaire avec jour commun pour ${shuffled[i].name}`);
    }
  }

  return createdTeams;
}

// -----------------------------
// Helper: check common days between two teams
// -----------------------------
function commonDays(team1, team2) {
  const days = ['lundi','mardi','mercredi','jeudi','vendredi'];
  const common = days.filter(day =>
    (team1[`player1_${day}`] || team1[`player2_${day}`]) &&
    (team2[`player1_${day}`] || team2[`player2_${day}`])
  );
  return common; // array of day names in common
}

// -----------------------------
// Schedule matches (random + rounds) respecting availability
// -----------------------------
async function scheduleMatches(tournamentId, rounds = 5) {
  // Fetch all teams
  const { rows: teams } = await pool.query(
    `SELECT t.*, 
            p1.lundi as player1_lundi, p1.mardi as player1_mardi, p1.mercredi as player1_mercredi, p1.jeudi as player1_jeudi, p1.vendredi as player1_vendredi,
            p2.lundi as player2_lundi, p2.mardi as player2_mardi, p2.mercredi as player2_mercredi, p2.jeudi as player2_jeudi, p2.vendredi as player2_vendredi
     FROM teams t
     JOIN players p1 ON t.player1 = p1.id
     JOIN players p2 ON t.player2 = p2.id
     WHERE t.tournament_id = $1
     ORDER BY t.id`,
    [tournamentId]
  );

  const matches = [];

  for (let r = 1; r <= rounds; r++) {
    const shuffled = [...teams].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i += 2) {
      if (!shuffled[i + 1]) break;

      // Vérifier qu'il y a au moins un jour commun pour le match
      const common = commonDays(shuffled[i], shuffled[i + 1]);
      if (common.length === 0) continue; // ignore si pas de jour commun

      // prendre un jour aléatoire parmi ceux en commun
      const day = common[Math.floor(Math.random() * common.length)];

      const { rows } = await pool.query(
        `INSERT INTO matches (tournament_id, team1_id, team2_id, round, day)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [tournamentId, shuffled[i].id, shuffled[i + 1].id, r, day]
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

    if (m.score1 < m.score2) {
      t1.points += 2;
    } else {
      t2.points += 2;
    }
  }

  for (const id in stats) {
    stats[id].goalaverage = stats[id].scored - stats[id].conceded;
  }

  const list = Object.values(stats);

  list.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    return b.goalaverage - a.goalaverage;
  });

  return list;
}

module.exports = {
  createTournament,
  getTournamentWithTeamsAndMatches,
  createTeam,
  assignRandomTeamsWithAvailability,
  scheduleMatches,
  submitMatchScore,
  computeStandings,
};
