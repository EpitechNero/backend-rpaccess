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

// services/tournamentService.js (ou fichier approprié)
const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];

/** Normalize DB boolean-ish values to strict boolean */
function toBool(val) {
    if (val === true || val === false) return val;
    if (val === 't' || val === 'true' || val === '1') return true;
    if (val === 'f' || val === 'false' || val === '0') return false;
    return !!val;
}

/** compute intersection of two arrays of strings */
function intersect(a = [], b = []) {
    const setB = new Set(b || []);
    return (a || []).filter(x => setB.has(x));
}

/** build days list from player flags on a team row */
function daysFromPlayerFlags(teamRow) {
    const res = [];
    for (const d of DAYS) {
        const p1flag = toBool(teamRow[`player1_${d}`]);
        const p2flag = toBool(teamRow[`player2_${d}`]);
        if (p1flag || p2flag) res.push(d);
    }
    return res;
}

async function scheduleMatches(tournamentId, rounds = 5) {
    // select teams, include teams.days if present plus player flags
    const { rows: teams } = await pool.query(
        `SELECT t.*, t.days,
            p1.lundi as player1_lundi, p1.mardi as player1_mardi, p1.mercredi as player1_mercredi, p1.jeudi as player1_jeudi, p1.vendredi as player1_vendredi,
            p2.lundi as player2_lundi, p2.mardi as player2_mardi, p2.mercredi as player2_mercredi, p2.jeudi as player2_jeudi, p2.vendredi as player2_vendredi
     FROM teams t
     JOIN players p1 ON t.player1 = p1.id
     JOIN players p2 ON t.player2 = p2.id
     WHERE t.tournament_id = $1
     ORDER BY t.id`,
        [tournamentId]
    );

    if (!teams.length) return [];

    // For each team, compute normalized days array (prefer teams.days if present)
    for (const t of teams) {
        if (Array.isArray(t.days) && t.days.length) {
            // normalize lower-case strings
            t._days = t.days.map(String).map(s => s.toLowerCase());
        } else {
            t._days = daysFromPlayerFlags(t);
        }
    }

    const created = [];
    const scheduledPairs = new Set(); // to avoid mirrored duplicates per round

    for (let r = 1; r <= rounds; r++) {
        // shuffle teams
        const shuffled = [...teams].sort(() => Math.random() - 0.5);

        // keep a set of teams that already have a match this round (so one match per team per round)
        const usedThisRound = new Set();

        for (let i = 0; i < shuffled.length; i++) {
            const a = shuffled[i];
            if (usedThisRound.has(a.id)) continue;

            // try to find opponent j > i not used yet
            let paired = false;
            for (let j = i + 1; j < shuffled.length; j++) {
                const b = shuffled[j];
                if (usedThisRound.has(b.id)) continue;

                // canonical unordered key to prevent mirror duplicates in same round
                const minId = Math.min(a.id, b.id);
                const maxId = Math.max(a.id, b.id);
                const key = `${r}:${minId}-${maxId}`;
                if (scheduledPairs.has(key)) continue;

                // compute common days from team._days arrays
                const common = intersect(a._days || [], b._days || []);
                if (common.length === 0) continue;

                // pick a random day among commons
                const day = common[Math.floor(Math.random() * common.length)];

                // insert match (use team1_id = a.id, team2_id = b.id)
                const { rows } = await pool.query(
                    `INSERT INTO matches (tournament_id, team1_id, team2_id, round, day, team1_name, team2_name)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
                    [tournamentId, a.id, b.id, r, day, a.name, b.name]
                );

                created.push(rows[0]);
                scheduledPairs.add(key);
                usedThisRound.add(a.id);
                usedThisRound.add(b.id);
                paired = true;
                break; // stop searching opponent for a
            }
            // if not paired we simply leave team without a match this round
        }
    }

    return created;
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
        return a.total_points - b.total_points;
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
    let loserTeamId = null;

    if (score_home === 0 || score_home < score_away) {
        winnerTeamId = match.team1_id;
        loserTeamId = match.team2_id;
    } else {
        winnerTeamId = match.team2_id;
        loserTeamId = match.team1_id;
    }

    await pool.query(
        `UPDATE matches 
         SET score_home=$1, score_away=$2, played_at=NOW()
         WHERE id=$3`,
        [score_home, score_away, matchId]
    );

    let winnerPoints = 0;
    let loserPoints = 0;

    if (winnerTeamId === match.team1_id) {
        loserPoints = score_away;
        winnerPoints = -score_away + score_home;
    } else {
        loserPoints = score_home;
        winnerPoints = -score_home + score_away;
    }

    await pool.query(
        `UPDATE teams SET total_points = total_points + $1 WHERE id = $2`,
        [loserPoints, loserTeamId]
    );

    await pool.query(
        `UPDATE teams SET total_points = total_points + $1 WHERE id = $2`,
        [winnerPoints, winnerTeamId]
    );

    await pool.query(
        `UPDATE teams SET victory_points = victory_points + 2 WHERE id = $1`,
        [winnerTeamId]
    );

    const { rows: updated } = await pool.query(
        `SELECT * FROM matches WHERE id = $1`,
        [matchId]
    );

    return updated[0];
}



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
