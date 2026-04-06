/**
 * Match Scoring Module
 *
 * Handles all match result calculations:
 * - Winner determination
 * - Time bonus calculation and application
 * - Points distribution (XP, DP)
 * - Result payload generation
 */

const { calculateCodePoints, calculateDuelPointsChange } = require('./pointsCalculator.js');
const { parseDuration, calculateTimeBonus } = require('./timeUtils.js');

/**
 * Determine match winner based on test results and duration
 */
function determineWinner(player1Data, player2Data) {
    if (player1Data.passed > player2Data.passed) return 1;
    if (player2Data.passed > player1Data.passed) return 2;

    const p1Seconds = parseDuration(player1Data.duration);
    const p2Seconds = parseDuration(player2Data.duration);

    if (p1Seconds < p2Seconds) return 1;
    if (p2Seconds < p1Seconds) return 2;

    return null; // complete tie
}

/**
 * Calculate all points for a match (XP, DP, time bonus)
 */
function calculateMatchScores(player1Data, player2Data, mode) {
    const winnerId = determineWinner(player1Data, player2Data);
    const isTie = winnerId === null;

    // Base XP from test cases
    const p1CodePoints = calculateCodePoints(player1Data.passed, player1Data.total);
    const p2CodePoints = calculateCodePoints(player2Data.passed, player2Data.total);

    // Time bonus for winner (ranked only)
    let p1TimeBonus = 0;
    let p2TimeBonus = 0;

    if (mode === 'ranked' && winnerId) {
        const winnerDuration = winnerId === 1 ? player1Data.duration : player2Data.duration;
        const timeBonus = calculateTimeBonus(winnerDuration);
        if (winnerId === 1) p1TimeBonus = timeBonus;
        else if (winnerId === 2) p2TimeBonus = timeBonus;
        console.log(`[MATCH SCORING] Winner: Player ${winnerId}, Duration: ${winnerDuration}, Time Bonus: ${timeBonus} XP`);
    }

    const p1TotalXP = p1CodePoints + p1TimeBonus;
    const p2TotalXP = p2CodePoints + p2TimeBonus;

    // DP changes (ranked only) — now returns { total, breakdown }
    let p1DuelResult = { total: 0, breakdown: { base: 0, performanceBonus: 0 } };
    let p2DuelResult = { total: 0, breakdown: { base: 0, performanceBonus: 0 } };

    if (mode === 'ranked') {
        p1DuelResult = calculateDuelPointsChange(winnerId === 1, isTie, player1Data.passed, player1Data.total);
        p2DuelResult = calculateDuelPointsChange(winnerId === 2, isTie, player2Data.passed, player2Data.total);

        console.log(`[MATCH SCORING] DP Changes - P1: ${p1DuelResult.total}, P2: ${p2DuelResult.total}`);
        console.log(`[MATCH SCORING] P1 Breakdown:`, p1DuelResult.breakdown);
        console.log(`[MATCH SCORING] P2 Breakdown:`, p2DuelResult.breakdown);
    }

    return {
        winnerId,
        isTie,
        player1: {
            codePoints: p1CodePoints,
            timeBonus: p1TimeBonus,
            totalXP: p1TotalXP,
            duelPointsChange: p1DuelResult.total,
            duelBreakdown: p1DuelResult.breakdown   // ← NEW: breakdown for result UI
        },
        player2: {
            codePoints: p2CodePoints,
            timeBonus: p2TimeBonus,
            totalXP: p2TotalXP,
            duelPointsChange: p2DuelResult.total,
            duelBreakdown: p2DuelResult.breakdown   // ← NEW: breakdown for result UI
        }
    };
}

/**
 * Create final result payload for match_finished event.
 * Includes per-player DP breakdowns so the result UI never has to
 * reverse-engineer the numbers client-side.
 */
function createMatchResult(player1Data, player2Data, scores, mode) {
    return {
        mode,
        player1: player1Data,
        player2: player2Data,
        winnerId: scores.winnerId,

        // Flat totals (kept for backward compatibility)
        p1DuelChange: scores.player1.duelPointsChange,
        p2DuelChange: scores.player2.duelPointsChange,
        p1TimeBonus: scores.player1.timeBonus,
        p2TimeBonus: scores.player2.timeBonus,

        // ← NEW: explicit breakdowns — result page should use these, NOT recalculate
        p1DuelBreakdown: scores.player1.duelBreakdown,
        p2DuelBreakdown: scores.player2.duelBreakdown
    };
}

/**
 * Map scores to database player IDs (handles socket order vs database order)
 */
function mapScoresToDatabasePlayers(scores, p1ActualUserId, p2ActualUserId, dbPlayer1Id, dbPlayer2Id) {
    let dbPlayer1XP, dbPlayer1DP, dbPlayer2XP, dbPlayer2DP;

    if (p1ActualUserId === dbPlayer1Id) {
        dbPlayer1XP = scores.player1.totalXP;
        dbPlayer1DP = scores.player1.duelPointsChange;
        dbPlayer2XP = scores.player2.totalXP;
        dbPlayer2DP = scores.player2.duelPointsChange;
    } else {
        // Swap — socket player1 maps to db player2
        dbPlayer1XP = scores.player2.totalXP;
        dbPlayer1DP = scores.player2.duelPointsChange;
        dbPlayer2XP = scores.player1.totalXP;
        dbPlayer2DP = scores.player1.duelPointsChange;
    }

    console.log('[MATCH SCORING] Mapped to database:');
    console.log(`  DB Player 1 (${dbPlayer1Id}): ${dbPlayer1XP} XP, ${dbPlayer1DP} DP`);
    console.log(`  DB Player 2 (${dbPlayer2Id}): ${dbPlayer2XP} XP, ${dbPlayer2DP} DP`);

    return {
        dbPlayer1XP,
        dbPlayer1DP,
        dbPlayer2XP,
        dbPlayer2DP,
        winnerUserId: scores.winnerId === 1 ? dbPlayer1Id : scores.winnerId === 2 ? dbPlayer2Id : null
    };
}

module.exports = {
    determineWinner,
    calculateMatchScores,
    createMatchResult,
    mapScoresToDatabasePlayers
};