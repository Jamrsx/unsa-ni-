/**
 * Database Operations: Match Management
 * 
 * Functions for managing duel matches:
 * - Match creation and updates
 * - Match status management
 * - Match history and results
 */

/**
 * Create a new match in the database
 * @param {Object} db - Database connection
 * @param {number|null} player1Id - Player 1 user ID
 * @param {number|null} player2Id - Player 2 user ID
 * @param {string} mode - 'casual' or 'ranked'
 * @param {number} duration - Match duration in minutes
 * @returns {Object|null} { matchId, matchEndTime }
 */
async function createMatch(db, player1Id, player2Id, mode, duration = 30) {
    try {
        console.log(`[createMatch] Creating match: p1=${player1Id}, p2=${player2Id}, mode=${mode}, duration=${duration}min`);
        
        const matchStartTime = new Date();
        const matchEndTime = new Date(Date.now() + duration * 60 * 1000);
        
        const [result] = await db.query(
            `INSERT INTO duel_matches (
                player1_id, player2_id, winner_id, match_date, status,
                match_duration_minutes, match_started_at, match_end_time
            ) VALUES (?, ?, NULL, NOW(), 'in_progress', ?, ?, ?)`,
            [player1Id, player2Id, matchStartTime, matchEndTime]
        );
        
        const matchId = result.insertId;
        console.log(`[createMatch] Match ${matchId} created, ends at ${matchEndTime.toISOString()}`);
        
        return {
            matchId,
            matchEndTime: matchEndTime.toISOString(),
            matchDuration: duration
        };
    } catch (err) {
        console.error('[createMatch] ERROR:', err);
        return null;
    }
}

/**
 * Get match details by match ID
 * @param {Object} db - Database connection
 * @param {number} matchId - Match ID
 * @returns {Object|null} Match details
 */
async function getMatchById(db, matchId) {
    try {
        const [matches] = await db.query(
            `SELECT * FROM duel_matches WHERE match_id = ?`,
            [matchId]
        );
        return matches.length > 0 ? matches[0] : null;
    } catch (err) {
        console.error('[getMatchById] ERROR:', err);
        return null;
    }
}

/**
 * Get match timer information
 * @param {Object} db - Database connection
 * @param {number} matchId - Match ID
 * @returns {Object|null} { matchEndTime, matchDuration }
 */
async function getMatchTimer(db, matchId) {
    try {
        const [matches] = await db.query(
            'SELECT match_end_time, match_duration_minutes FROM duel_matches WHERE match_id = ?',
            [matchId]
        );
        
        if (matches.length === 0) return null;
        
        return {
            matchEndTime: matches[0].match_end_time,
            matchDuration: matches[0].match_duration_minutes
        };
    } catch (err) {
        console.error('[getMatchTimer] ERROR:', err);
        return null;
    }
}

/**
 * Update match status
 * @param {Object} db - Database connection
 * @param {number} matchId - Match ID
 * @param {string} status - New status ('in_progress', 'completed', 'abandoned')
 * @returns {boolean} Success status
 */
async function updateMatchStatus(db, matchId, status) {
    try {
        const [result] = await db.query(
            'UPDATE duel_matches SET status = ? WHERE match_id = ?',
            [status, matchId]
        );
        
        console.log(`[updateMatchStatus] Match ${matchId} status updated to '${status}'`);
        return result.affectedRows > 0;
    } catch (err) {
        console.error('[updateMatchStatus] ERROR:', err);
        return false;
    }
}

/**
 * Update match result
 * @param {Object} db - Database connection
 * @param {number} matchId - Match ID
 * @param {number|null} winnerId - Winner user ID
 * @param {number|null} dpAwarded - DP awarded to winner
 * @param {number|null} xpAwarded - XP awarded
 * @returns {boolean} Success status
 */
async function updateMatchResult(db, matchId, winnerId, dpAwarded = null, xpAwarded = null) {
    try {
        const [result] = await db.query(
            'UPDATE duel_matches SET winner_id = ?, status = ?, dp_awarded = ?, xp_awarded = ? WHERE match_id = ?',
            [winnerId, 'completed', dpAwarded, xpAwarded, matchId]
        );
        
        console.log(`[updateMatchResult] Match ${matchId} result: winner=${winnerId}, DP=${dpAwarded}, XP=${xpAwarded}`);
        return result.affectedRows > 0;
    } catch (err) {
        console.error('[updateMatchResult] ERROR:', err);
        return false;
    }
}

/**
 * Get match with player information
 * @param {Object} db - Database connection
 * @param {number} matchId - Match ID
 * @returns {Object|null} Match with player details
 */
async function getMatchWithPlayers(db, matchId) {
    try {
        const [matches] = await db.query(
            `SELECT 
                dm.*, 
                u1.username as player1_username,
                u2.username as player2_username
             FROM duel_matches dm
             LEFT JOIN users u1 ON dm.player1_id = u1.user_id
             LEFT JOIN users u2 ON dm.player2_id = u2.user_id
             WHERE dm.match_id = ?`,
            [matchId]
        );
        
        return matches.length > 0 ? matches[0] : null;
    } catch (err) {
        console.error('[getMatchWithPlayers] ERROR:', err);
        return null;
    }
}

/**
 * Get user's match history
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @param {number} limit - Number of matches to return
 * @returns {Array} Array of matches
 */
async function getUserMatchHistory(db, userId, limit = 10) {
    try {
        const [matches] = await db.query(
            `SELECT 
                dm.*,
                u1.username as player1_username,
                u2.username as player2_username,
                CASE 
                    WHEN dm.winner_id = ? THEN 'won'
                    WHEN dm.winner_id IS NULL THEN 'draw'
                    ELSE 'lost'
                END as result
             FROM duel_matches dm
             LEFT JOIN users u1 ON dm.player1_id = u1.user_id
             LEFT JOIN users u2 ON dm.player2_id = u2.user_id
             WHERE dm.player1_id = ? OR dm.player2_id = ?
             ORDER BY dm.match_date DESC
             LIMIT ?`,
            [userId, userId, userId, limit]
        );
        
        return matches;
    } catch (err) {
        console.error('[getUserMatchHistory] ERROR:', err);
        return [];
    }
}

/**
 * Check if match already has abandoned status (prevent double penalty)
 * @param {Object} db - Database connection
 * @param {number} matchId - Match ID
 * @returns {boolean} True if already abandoned
 */
async function isMatchAbandoned(db, matchId) {
    try {
        const [matches] = await db.query(
            'SELECT status FROM duel_matches WHERE match_id = ?',
            [matchId]
        );
        
        return matches.length > 0 && matches[0].status === 'abandoned';
    } catch (err) {
        console.error('[isMatchAbandoned] ERROR:', err);
        return false;
    }
}

/**
 * Get match participants
 * @param {Object} db - Database connection
 * @param {number} matchId - Match ID
 * @returns {Object|null} { player1_id, player2_id, player1_username, player2_username }
 */
async function getMatchParticipants(db, matchId) {
    try {
        const match = await getMatchWithPlayers(db, matchId);
        if (!match) return null;
        
        return {
            player1_id: match.player1_id,
            player2_id: match.player2_id,
            player1_username: match.player1_username,
            player2_username: match.player2_username
        };
    } catch (err) {
        console.error('[getMatchParticipants] ERROR:', err);
        return null;
    }
}

/**
 * Select a random problem for a match
 * @param {Object} db - Database connection
 * @param {string|null} difficulty - Optional difficulty filter ('easy', 'medium', 'hard')
 * @returns {Object|null} { problem_id, difficulty, duration }
 */
async function selectRandomProblem(db, difficulty = null) {
    try {
        let query = 'SELECT problem_id, difficulty FROM problems';
        const params = [];
        
        if (difficulty) {
            query += ' WHERE difficulty = ?';
            params.push(difficulty);
        }
        
        query += ' ORDER BY RAND() LIMIT 1';
        
        const [problems] = await db.query(query, params);
        
        if (problems.length === 0) return null;
        
        const problem = problems[0];
        const diff = problem.difficulty?.toLowerCase() || 'medium';
        
        // Set duration based on difficulty
        let duration = 30; // Default
        if (diff === 'easy') duration = 15;
        else if (diff === 'hard') duration = 45;
        
        return {
            problem_id: problem.problem_id,
            difficulty: diff,
            duration
        };
    } catch (err) {
        console.error('[selectRandomProblem] ERROR:', err);
        return null;
    }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    createMatch,
    getMatchById,
    getMatchTimer,
    updateMatchStatus,
    updateMatchResult,
    getMatchWithPlayers,
    getUserMatchHistory,
    isMatchAbandoned,
    getMatchParticipants,
    selectRandomProblem
};
