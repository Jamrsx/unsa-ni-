/**
 * Utility Functions: Time and Duration
 * 
 * Functions for handling time-related calculations
 */

/**
 * Parse duration string "M:SS" to total seconds
 * @param {string} durationString - Duration in "M:SS" format
 * @returns {number} Total seconds
 */
function parseDuration(durationString) {
    if (!durationString || typeof durationString !== 'string') return 0;
    const [minutes, seconds] = durationString.split(':').map(Number);
    return (minutes || 0) * 60 + (seconds || 0);
}

/**
 * Calculate Time Bonus based on completion time (for ranked mode)
 * @param {string} durationString - Duration in "M:SS" format
 * @returns {number} Time bonus points
 */
function calculateTimeBonus(durationString) {
    const totalSeconds = parseDuration(durationString);
    
    if (totalSeconds <= 30) return 50;   // ≤30s: 50 bonus
    if (totalSeconds <= 60) return 40;   // ≤1m: 40 bonus
    if (totalSeconds <= 120) return 25;  // ≤2m: 25 bonus
    if (totalSeconds <= 300) return 10;  // ≤5m: 10 bonus
    return 0;                            // >5m: no bonus
}

/**
 * Format seconds to M:SS string
 * @param {number} totalSeconds - Total seconds
 * @returns {string} Formatted duration "M:SS"
 */
function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate remaining time until end date
 * @param {Date|string} endTime - End time as Date or ISO string
 * @returns {number} Milliseconds remaining (can be negative if expired)
 */
function getRemainingTime(endTime) {
    const end = endTime instanceof Date ? endTime : new Date(endTime);
    return end.getTime() - Date.now();
}

/**
 * Check if match time has expired
 * @param {Date|string} endTime - End time as Date or ISO string
 * @returns {boolean} True if time expired
 */
function isTimeExpired(endTime) {
    return getRemainingTime(endTime) <= 0;
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    parseDuration,
    calculateTimeBonus,
    formatDuration,
    getRemainingTime,
    isTimeExpired
};
