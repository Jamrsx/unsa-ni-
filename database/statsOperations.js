/**
 * Database Operations: Statistics
 * 
 * Functions for managing player statistics:
 * - XP and level calculations
 * - Duel Points management
 * - Leaderboard queries
 * - Abandon tracking
 */

// =====================================================
// XP AND LEVEL CALCULATION FUNCTIONS
// =====================================================

/**
 * Get XP required for a specific level
 * @param {number} level - The level to calculate XP for
 * @returns {number} XP needed for that level
 */
function getXPForLevel(level) {
    // Base: 1000 XP for level 1, increases by 500 each level
    // Level 1: 1000, Level 2: 1500, Level 3: 2000, etc.
    return 1000 + (level - 1) * 500;
}

/**
 * Calculate total XP needed to reach a level from level 1
 * @param {number} targetLevel - The target level
 * @returns {number} Total XP required
 */
function getTotalXPForLevel(targetLevel) {
    let total = 0;
    for (let lvl = 1; lvl < targetLevel; lvl++) {
        total += getXPForLevel(lvl);
    }
    return total;
}

/**
 * Calculate level from total XP
 * @param {number} totalXP - Total accumulated XP
 * @returns {Object} { level, currentLevelXP, xpNeededForNextLevel }
 */
function getLevelFromXP(totalXP) {
    let level = 1;
    let xpForNextLevel = getXPForLevel(level);
    let accumulatedXP = 0;
    
    while (totalXP >= accumulatedXP + xpForNextLevel) {
        accumulatedXP += xpForNextLevel;
        level++;
        xpForNextLevel = getXPForLevel(level);
    }
    
    return {
        level,
        currentLevelXP: totalXP - accumulatedXP,
        xpNeededForNextLevel: xpForNextLevel
    };
}

// =====================================================
// DATABASE OPERATIONS
// =====================================================

/**
 * Update player statistics in database
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @param {number} codePoints - Code XP gained/lost
 * @param {number} duelPointsChange - DP change (can be negative)
 * @param {string} mode - 'casual' or 'ranked'
 * @returns {Object|null} Stats update result or null on error
 */
async function updatePlayerStats(db, userId, codePoints, duelPointsChange, mode) {
    console.log(`[updatePlayerStats] Called with: userId=${userId}, codePoints=${codePoints}, duelPointsChange=${duelPointsChange}, mode=${mode}`);
    try {
        // Get current stats
        const [stats] = await db.query(
            'SELECT statistic_level, statistic_level_xp, statistic_duel_point FROM statistic WHERE user_id = ?',
            [userId]
        );
        
        console.log(`[updatePlayerStats] Query result for userId ${userId}:`, stats);
        
        if (!stats || stats.length === 0) {
            console.log(`[updatePlayerStats] No existing stats found for userId ${userId}, creating new entry...`);
            // Create new stats entry if doesn't exist
            const newTotalXP = Math.max(0, codePoints);
            const levelInfo = getLevelFromXP(newTotalXP);
            const newDuelPoints = mode === 'ranked' ? Math.max(0, duelPointsChange) : 0;
            
            await db.query(
                'INSERT INTO statistic (user_id, statistic_level, statistic_level_xp, statistic_duel_point) VALUES (?, ?, ?, ?)',
                [userId, levelInfo.level, newTotalXP, newDuelPoints]
            );
            
            console.log(`[updatePlayerStats] Created new stats for userId ${userId}: level=${levelInfo.level}, xp=${newTotalXP}, duelPoints=${newDuelPoints}`);
            
            return {
                oldLevel: 0,
                newLevel: levelInfo.level,
                oldXP: 0,
                newXP: newTotalXP,
                xpGained: codePoints,
                oldDuelPoints: 0,
                newDuelPoints: newDuelPoints,
                duelPointsChange: mode === 'ranked' ? duelPointsChange : 0,
                leveledUp: levelInfo.level > 0
            };
        }
        
        const currentStats = stats[0];
        const oldTotalXP = currentStats.statistic_level_xp;
        const oldDuelPoints = currentStats.statistic_duel_point;
        
        console.log(`[updatePlayerStats] Current stats for userId ${userId}: oldXP=${oldTotalXP}, oldDuelPoints=${oldDuelPoints}`);
        
        // Calculate new values
        const newTotalXP = Math.max(0, oldTotalXP + codePoints);
        const newDuelPoints = mode === 'ranked' ? Math.max(0, oldDuelPoints + duelPointsChange) : oldDuelPoints;
        
        const oldLevelInfo = getLevelFromXP(oldTotalXP);
        const newLevelInfo = getLevelFromXP(newTotalXP);
        
        console.log(`[updatePlayerStats] Calculated new values: newXP=${newTotalXP}, newDuelPoints=${newDuelPoints}, oldLevel=${oldLevelInfo.level}, newLevel=${newLevelInfo.level}`);
        
        // Update database
        const [updateResult] = await db.query(
            'UPDATE statistic SET statistic_level = ?, statistic_level_xp = ?, statistic_duel_point = ? WHERE user_id = ?',
            [newLevelInfo.level, newTotalXP, newDuelPoints, userId]
        );
        
        console.log(`[updatePlayerStats] Database updated for userId ${userId}: affectedRows=${updateResult.affectedRows}`);
        
        const result = {
            oldLevel: oldLevelInfo.level,
            newLevel: newLevelInfo.level,
            oldXP: oldTotalXP,
            newXP: newTotalXP,
            xpGained: codePoints,
            oldDuelPoints,
            newDuelPoints,
            duelPointsChange: mode === 'ranked' ? duelPointsChange : 0,
            leveledUp: newLevelInfo.level > oldLevelInfo.level
        };
        
        console.log(`[updatePlayerStats] Returning result for userId ${userId}:`, result);
        return result;
    } catch (err) {
        console.error(`[updatePlayerStats] ERROR for userId ${userId}:`, err);
        return null;
    }
}

/**
 * Get player statistics
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @returns {Object|null} Player stats or null
 */
async function getPlayerStats(db, userId) {
    try {
        const [stats] = await db.query(
            'SELECT * FROM statistic WHERE user_id = ?',
            [userId]
        );
        return stats.length > 0 ? stats[0] : null;
    } catch (err) {
        console.error(`[getPlayerStats] ERROR for userId ${userId}:`, err);
        return null;
    }
}

/**
 * Update abandon count and ban status
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @param {number} penalty - DP penalty (negative value)
 * @param {number} banThreshold - Number of abandons before ban
 * @returns {Object} { newAbandonCount, newDP, isBanned }
 */
async function applyAbandonmentPenalty(db, userId, penalty, banThreshold) {
    try {
        const [currentStats] = await db.query(
            'SELECT abandon_count, statistic_duel_point FROM statistic WHERE user_id = ?',
            [userId]
        );
        
        if (currentStats.length === 0) {
            console.error(`[applyAbandonmentPenalty] No stats found for user ${userId}`);
            return null;
        }
        
        const newAbandonCount = currentStats[0].abandon_count + 1;
        const currentDP = currentStats[0].statistic_duel_point;
        const newDP = Math.max(0, currentDP + penalty); // Ensure DP doesn't go negative
        const isBanned = newAbandonCount >= banThreshold ? 1 : 0;
        
        await db.query(
            `UPDATE statistic 
             SET abandon_count = ?, 
                 statistic_duel_point = ?, 
                 is_banned = ?,
                 last_abandon_at = NOW() 
             WHERE user_id = ?`,
            [newAbandonCount, newDP, isBanned, userId]
        );
        
        console.log(`[applyAbandonmentPenalty] Updated user ${userId}: abandon_count=${newAbandonCount}, DP=${currentDP}→${newDP}, banned=${isBanned}`);
        
        return { newAbandonCount, newDP, isBanned, oldDP: currentDP };
    } catch (err) {
        console.error('[applyAbandonmentPenalty] ERROR:', err);
        return null;
    }
}

/**
 * Award opponent bonus DP for opponent abandonment
 * @param {Object} db - Database connection
 * @param {number} userId - Opponent user ID
 * @param {number} bonusDP - Bonus DP amount
 * @returns {boolean} Success status
 */
async function awardOpponentBonus(db, userId, bonusDP) {
    try {
        // Check if opponent also abandoned recently
        const [recentAbandon] = await db.query(
            'SELECT last_abandon_at FROM statistic WHERE user_id = ? AND last_abandon_at > NOW() - INTERVAL 30 SECOND',
            [userId]
        );
        
        if (recentAbandon.length > 0) {
            console.log(`[awardOpponentBonus] User ${userId} also abandoned recently - no bonus`);
            return false;
        }
        
        // Award bonus
        const [result] = await db.query(
            'UPDATE statistic SET statistic_duel_point = statistic_duel_point + ? WHERE user_id = ?',
            [bonusDP, userId]
        );
        
        if (result.affectedRows > 0) {
            console.log(`[awardOpponentBonus] Awarded ${bonusDP} DP to user ${userId}`);
            return true;
        }
        return false;
    } catch (err) {
        console.error('[awardOpponentBonus] ERROR:', err);
        return false;
    }
}

/**
 * Check if user is banned from matchmaking
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @returns {Object|null} { isBanned, abandonCount }
 */
async function checkBanStatus(db, userId) {
    try {
        const [result] = await db.query(
            'SELECT is_banned, abandon_count FROM statistic WHERE user_id = ?',
            [userId]
        );
        
        if (result.length === 0) return null;
        
        return {
            isBanned: result[0].is_banned === 1,
            abandonCount: result[0].abandon_count
        };
    } catch (err) {
        console.error('[checkBanStatus] ERROR:', err);
        return null;
    }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    // XP/Level functions
    getXPForLevel,
    getTotalXPForLevel,
    getLevelFromXP,
    
    // Database operations
    updatePlayerStats,
    getPlayerStats,
    applyAbandonmentPenalty,
    awardOpponentBonus,
    checkBanStatus
};
