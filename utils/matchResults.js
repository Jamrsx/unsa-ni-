/**
 * Match Results Module
 * 
 * Handles match result caching, retrieval, and formatting for display:
 * - Result storage and caching
 * - Result formatting for client
 * - Player stats aggregation
 * - Time bonus display
 * - DP/XP change formatting
 * 
 * This module handles the complete result lifecycle from match completion to display.
 */

/**
 * Cache match result for retrieval on result page
 * @param {string} matchId - Match ID
 * @param {Object} result - Complete match result
 * @param {Map} finalResults - Map of cached results
 * @returns {boolean} True if cached successfully
 */
function cacheMatchResult(matchId, result, finalResults) {
    if (!matchId) {
        console.log('[MATCH RESULTS] Cannot cache - no match ID');
        return false;
    }
    
    const cachedResult = {
        ...result,
        timestamp: Date.now(),
        cached_at: new Date().toISOString()
    };
    
    finalResults.set(matchId, cachedResult);
    
    console.log('[MATCH RESULTS] Cached result for match', matchId);
    console.log('[MATCH RESULTS] Mode:', result.mode);
    console.log('[MATCH RESULTS] P1 bonus:', result.p1TimeBonus, 'P2 bonus:', result.p2TimeBonus);
    
    return true;
}

/**
 * Retrieve cached match result
 * @param {string} matchId - Match ID
 * @param {Map} finalResults - Map of cached results
 * @returns {Object|null} Cached result or null
 */
function getCachedResult(matchId, finalResults) {
    if (!matchId) return null;
    
    const cached = finalResults.get(matchId);
    
    console.log('[MATCH RESULTS] Result retrieval for match', matchId);
    console.log('[MATCH RESULTS] Cached:', !!cached);
    console.log('[MATCH RESULTS] Mode:', cached?.mode);
    
    return cached || null;
}

/**
 * Format match result for client display
 * @param {Object} rawResult - Raw match result from match completion
 * @returns {Object} Formatted result for client
 */
function formatResultForClient(rawResult) {
    const { mode, player1, player2, p1DuelChange, p2DuelChange, p1TimeBonus, p2TimeBonus } = rawResult;
    
    return {
        mode,
        player1: {
            ...player1,
            username: player1.username,
            verdict: player1.verdict || `${player1.passed}/${player1.total} tests passed`,
            duration: player1.duration,
            score: player1.passed,
            totalTests: player1.total
        },
        player2: {
            ...player2,
            username: player2.username,
            verdict: player2.verdict || `${player2.passed}/${player2.total} tests passed`,
            duration: player2.duration,
            score: player2.passed,
            totalTests: player2.total
        },
        scoring: {
            p1DuelChange: p1DuelChange || 0,
            p2DuelChange: p2DuelChange || 0,
            p1TimeBonus: p1TimeBonus || 0,
            p2TimeBonus: p2TimeBonus || 0,
            isRanked: mode === 'ranked'
        },
        displayData: {
            winner: determineWinnerFromResult(player1, player2),
            p1DuelChangeDisplay: formatDuelPointsChange(p1DuelChange),
            p2DuelChangeDisplay: formatDuelPointsChange(p2DuelChange),
            p1TimeBonusDisplay: formatTimeBonus(p1TimeBonus),
            p2TimeBonusDisplay: formatTimeBonus(p2TimeBonus)
        }
    };
}

/**
 * Determine winner from result data
 * @param {Object} player1 - Player 1 data
 * @param {Object} player2 - Player 2 data
 * @returns {number|null} 1, 2, or null for tie
 */
function determineWinnerFromResult(player1, player2) {
    if (player1.passed > player2.passed) return 1;
    if (player2.passed > player1.passed) return 2;
    
    // Tie on tests - check duration
    const p1Time = parseDuration(player1.duration);
    const p2Time = parseDuration(player2.duration);
    
    if (p1Time < p2Time) return 1;
    if (p2Time < p1Time) return 2;
    
    return null; // Complete tie
}

/**
 * Parse duration string to seconds
 * @param {string} duration - Duration like "1:30"
 * @returns {number} Duration in seconds
 */
function parseDuration(duration) {
    if (!duration || typeof duration !== 'string') return 999999;
    const parts = duration.split(':');
    if (parts.length !== 2) return 999999;
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
}

/**
 * Format duel points change for display
 * @param {number} change - DP change value
 * @returns {string} Formatted string like "+25 DP" or "-15 DP"
 */
function formatDuelPointsChange(change) {
    if (!change || change === 0) return '±0 DP';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change} DP`;
}

/**
 * Format time bonus for display
 * @param {number} bonus - Time bonus value
 * @returns {string} Formatted string like "+40 XP ⚡⚡"
 */
function formatTimeBonus(bonus) {
    if (!bonus || bonus === 0) return '';
    
    // Add lightning bolts based on bonus tier
    let lightning = '';
    if (bonus >= 50) lightning = ' ⚡⚡⚡'; // ≤30s
    else if (bonus >= 40) lightning = ' ⚡⚡';  // ≤1m
    else if (bonus >= 25) lightning = ' ⚡';    // ≤2m
    
    return `+${bonus} XP${lightning}`;
}

/**
 * Clean up old cached results (prevent memory leak)
 * @param {Map} finalResults - Map of cached results
 * @param {number} maxAge - Maximum age in milliseconds (default 30 minutes)
 * @returns {number} Number of results cleaned
 */
function cleanupOldResults(finalResults, maxAge = 30 * 60 * 1000) {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [matchId, result] of finalResults.entries()) {
        const age = now - result.timestamp;
        if (age > maxAge) {
            finalResults.delete(matchId);
            cleaned++;
        }
    }
    
    if (cleaned > 0) {
        console.log(`[MATCH RESULTS] Cleaned up ${cleaned} old cached results`);
    }
    
    return cleaned;
}

/**
 * Get result summary for leaderboard/history
 * @param {Object} result - Match result
 * @param {number} userId - User ID to get summary for
 * @returns {Object} Summary data
 */
function getResultSummary(result, userId) {
    const { mode, player1, player2, p1DuelChange, p2DuelChange, p1TimeBonus, p2TimeBonus } = result;
    
    const isPlayer1 = player1.user_id === userId;
    const isPlayer2 = player2.user_id === userId;
    
    if (!isPlayer1 && !isPlayer2) return null;
    
    const myData = isPlayer1 ? player1 : player2;
    const opponentData = isPlayer1 ? player2 : player1;
    const myDuelChange = isPlayer1 ? p1DuelChange : p2DuelChange;
    const myTimeBonus = isPlayer1 ? p1TimeBonus : p2TimeBonus;
    
    const winner = determineWinnerFromResult(player1, player2);
    const didWin = (isPlayer1 && winner === 1) || (isPlayer2 && winner === 2);
    const didTie = winner === null;
    
    return {
        matchId: result.matchId || result.match_id,
        mode,
        result: didWin ? 'win' : didTie ? 'tie' : 'loss',
        myScore: myData.passed,
        opponentScore: opponentData.passed,
        totalTests: myData.total,
        myDuration: myData.duration,
        opponentUsername: opponentData.username,
        duelPointsChange: myDuelChange || 0,
        timeBonus: myTimeBonus || 0,
        timestamp: result.timestamp
    };
}

/**
 * Validate result data completeness
 * @param {Object} result - Result to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateResultData(result) {
    const errors = [];
    
    if (!result) {
        errors.push('Result is null or undefined');
        return { valid: false, errors };
    }
    
    if (!result.mode) errors.push('Missing mode');
    if (!result.player1) errors.push('Missing player1 data');
    if (!result.player2) errors.push('Missing player2 data');
    
    if (result.player1) {
        if (result.player1.passed === undefined) errors.push('Missing player1 score');
        if (!result.player1.username) errors.push('Missing player1 username');
    }
    
    if (result.player2) {
        if (result.player2.passed === undefined) errors.push('Missing player2 score');
        if (!result.player2.username) errors.push('Missing player2 username');
    }
    
    if (result.mode === 'ranked') {
        if (result.p1DuelChange === undefined) errors.push('Missing p1DuelChange for ranked match');
        if (result.p2DuelChange === undefined) errors.push('Missing p2DuelChange for ranked match');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    cacheMatchResult,
    getCachedResult,
    formatResultForClient,
    determineWinnerFromResult,
    formatDuelPointsChange,
    formatTimeBonus,
    cleanupOldResults,
    getResultSummary,
    validateResultData
};
