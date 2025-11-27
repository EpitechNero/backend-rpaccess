const { pool } = require('../config/psql.js');

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

async function createTeam(tournamentId, name, player1, player2) {
  const sql = `
        INSERT INTO teams (tournament_id, name, player1, player2)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;

  const { rows } = await pool.query(sql, [tournamentId, name, player1, player2]);
  return rows[0];
}

function getCommonDays(p1, p2) {
    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
    return days.filter(day => p1[day] && p2[day]);
}

async function assignRandomTeamsWithAvailability(tournamentId) {
    const { rows: players } = await pool.query(`SELECT * FROM players`);

    if (players.length < 2) throw new Error('Pas assez de joueurs pour former des équipes.');

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
                const commonDays = getCommonDays(shuffled[i], shuffled[j]); // <-- calcul des jours communs

                const { rows } = await pool.query(
                    `INSERT INTO teams (tournament_id, name, player1, player2, player1_name, player2_name, days)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
                    [tournamentId, name, shuffled[i].id, shuffled[j].id, shuffled[i].name, shuffled[j].name, commonDays]
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

function hasCommonDay(p1, p2) {
  return p1.lundi && p2.lundi ||
         p1.mardi && p2.mardi ||
         p1.mercredi && p2.mercredi ||
         p1.jeudi && p2.jeudi ||
         p1.vendredi && p2.vendredi;
}

function commonDays(team1, team2) {
  const days = ['lundi','mardi','mercredi','jeudi','vendredi'];
  const common = days.filter(day =>
    (team1[`player1_${day}`] || team1[`player2_${day}`]) &&
    (team2[`player1_${day}`] || team2[`player2_${day}`])
  );
  return common;
}

async function scheduleMatches(tournamentId, rounds = 5) {
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

      const common = commonDays(shuffled[i], shuffled[i + 1]);
      if (common.length === 0) continue;

      const day = common[Math.floor(Math.random() * common.length)];

      const { rows } = await pool.query(
        `INSERT INTO matches (tournament_id, team1_id, team2_id, round, day, team1_name, team2_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
          [tournamentId, shuffled[i].id, shuffled[i + 1].id, r, day, shuffled[i].name, shuffled[i + 1].name]
      );

      matches.push(rows[0]);
    }
  }

  return matches;
}

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
    const teams = (await pool.query(
        `SELECT id, name, victory_points, total_points, player1_name, player2_name 
     FROM teams 
     WHERE tournament_id = $1`,
        [tournamentId]
    )).rows;

    teams.sort((a, b) => {
        if (b.victory_points !== a.victory_points) return b.victory_points - a.victory_points;
        return b.total_points - a.total_points;
    });

    return teams;
}


async function getMatchesForUser(tournamentId, email) {
    const sql = `
    SELECT 
        m.*,
        th.name AS team_home_name,
        ta.name AS team_away_name,
        -- noms des joueurs home
        (SELECT name FROM players WHERE id = th.player1) AS team_home_player1_name,
        (SELECT name FROM players WHERE id = th.player2) AS team_home_player2_name,
        -- noms des joueurs away
        (SELECT name FROM players WHERE id = ta.player1) AS team_away_player1_name,
        (SELECT name FROM players WHERE id = ta.player2) AS team_away_player2_name
    FROM matches m
    JOIN teams th ON th.id = m.team1_id
    JOIN teams ta ON ta.id = m.team2_id
    WHERE m.tournament_id = $2
      AND EXISTS (
          SELECT 1 
          FROM players p 
          WHERE p.email = $1
            AND (p.id = th.player1 OR p.id = th.player2 OR p.id = ta.player1 OR p.id = ta.player2)
      )
    ORDER BY m.round, m.id;
  `;

    const { rows } = await pool.query(sql, [email, tournamentId]);
    return rows;
}


async function getMatchById(tournamentId, matchId) {
    const { rows } = await pool.query(
        `SELECT * FROM matches WHERE tournament_id = $1 AND id = $2`,
        [tournamentId, matchId]
    );
    return rows[0];
}

async function getAllTournaments() {
  const sql = `SELECT * FROM tournaments ORDER BY created_at DESC`;
  const { rows } = await pool.query(sql);
  return rows;
}

async function finishMatch(matchId, score_home, score_away) {
    const { rows: matches } = await pool.query(
        `SELECT * FROM matches WHERE id = $1`,
        [matchId]
    );

    if (matches.length === 0) {
        const error = new Error("Match not found");
        error.code = "NOT_FOUND";
        throw error;
    }

    const match = matches[0];

    if (match.played_at) {
        const error = new Error("Match already finished");
        error.code = "ALREADY_FINISHED";
        throw error;
    }

    let winnerTeamId = null;

    if (score_home === 0 || score_home < score_away) {
        winnerTeamId = match.team1_id;
    } else if (score_away === 0 || score_away < score_home) {
        winnerTeamId = match.team2_id;
    }

    await pool.query(
        `UPDATE matches 
     SET score_home=$1, score_away=$2, played_at=NOW()
     WHERE id=$3`,
        [score_home, score_away, matchId]
    );

    await pool.query(
        `UPDATE teams SET total_points = total_points + $1 WHERE id = $2`,
        [score_home, match.team1_id]
    );

    await pool.query(
        `UPDATE teams SET total_points = total_points + $1 WHERE id = $2`,
        [score_away, match.team2_id]
    );

    if (winnerTeamId) {
        await pool.query(
            `UPDATE teams SET victory_points = victory_points + 2 WHERE id = $1`,
            [winnerTeamId]
        );
    }

    const { rows: updated } = await pool.query(
        `SELECT * FROM matches WHERE id = $1`,
        [matchId]
    );

    return updated[0];
};


module.exports = {
  createTournament,
  getTournamentWithTeamsAndMatches,
  createTeam,
  assignRandomTeamsWithAvailability,
  scheduleMatches,
  submitMatchScore,
  computeStandings,
  getMatchesForUser,
  getAllTournaments,
  getMatchById,
  finishMatch,
};
