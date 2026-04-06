/**
 * Points Calculator Module
 * Handles all point calculations for matches (DP and XP)
 */

/**
 * Calculate Duel Points change for ranked matches (optimized for 13 test cases)
 * Returns both the total change AND a breakdown for the result UI.
 *
 * @param {boolean} isWinner - Whether the player won
 * @param {boolean} isTie    - Whether the match was a tie
 * @param {number}  testsPassed - Number of test cases passed
 * @param {number}  totalTests  - Total number of test cases
 * @returns {{ total: number, breakdown: { base: number, performanceBonus: number } }}
 */
function calculateDuelPointsChange(isWinner, isTie, testsPassed, totalTests) {
    if (isTie) {
        return { total: 0, breakdown: { base: 0, performanceBonus: 0 } };
    }

    const passingRate = totalTests > 0 ? testsPassed / totalTests : 0;

    if (!isWinner) {
        // Base loss penalty is always -25
        // Performance adjustment reduces the penalty based on how many tests were passed
        // Range: 0 (0% pass rate) to +14 (near 100% pass rate)
        const base = -25;
        const performanceBonus = Math.round(passingRate * 15); // 0 to +15
        const total = Math.min(base + performanceBonus, -10); // Clamp so loser always loses >= 10

        // Recalculate performanceBonus to match the clamped total
        // (If clamping kicked in, the displayed adjustment should reflect the real change)
        const actualPerformanceBonus = total - base; // e.g. -10 - (-25) = +15

        return {
            total,
            breakdown: {
                base,                             // always -25 (Loss Penalty)
                performanceBonus: actualPerformanceBonus  // 0 to +15 (Performance Adjustment)
            }
        };
    }

    // Winner
    // Base win reward is always +10
    // Performance bonus scales with pass rate: 0 to +20
    const base = 10;
    const performanceBonus = Math.round(passingRate * 20); // 0 to +20
    const total = base + performanceBonus;

    return {
        total,
        breakdown: {
            base,             // always +10 (Win Bonus)
            performanceBonus  // 0 to +20 (Performance Bonus)
        }
    };
}

/**
 * Calculate Code Points (XP) based on test cases passed
 * @param {number} testsPassed - Number of test cases passed
 * @param {number} totalTests - Total number of test cases
 * @returns {number} The code points (XP) earned
 */
function calculateCodePoints(testsPassed, totalTests) {
    return Math.round((testsPassed / totalTests) * 10);
}

/**
 * Calculate player level based on total XP
 * @param {number} totalXP - Total XP accumulated
 * @returns {number} Current level
 */
function calculateLevel(totalXP) {
    return Math.max(1, Math.floor(Math.sqrt(totalXP / 100)) + 1);
}

module.exports = {
    calculateDuelPointsChange,
    calculateCodePoints,
    calculateLevel
};