/**
 * Utility Functions: Input Validation
 * 
 * Additional validation functions beyond security checks
 */

/**
 * Validate match mode
 * @param {string} mode - Match mode
 * @returns {boolean} True if valid mode
 */
function isValidMode(mode) {
    return mode === 'casual' || mode === 'ranked';
}

/**
 * Validate programming language
 * @param {string} language - Programming language
 * @returns {boolean} True if supported language
 */
function isValidLanguage(language) {
    const supportedLanguages = ['python', 'php', 'java', 'javascript'];
    return supportedLanguages.includes(language.toLowerCase());
}

/**
 * Validate room code format
 * @param {string} roomCode - Room code to validate
 * @returns {boolean} True if valid format (6 alphanumeric characters)
 */
function isValidRoomCode(roomCode) {
    if (!roomCode || typeof roomCode !== 'string') return false;
    return /^[A-Z0-9]{6}$/.test(roomCode);
}

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {boolean} True if valid
 */
function isValidUsername(username) {
    if (!username || typeof username !== 'string') return false;
    // 3-20 characters, alphanumeric and underscores only
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { valid, message }
 */
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required' };
    }
    
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    
    if (password.length > 128) {
        return { valid: false, message: 'Password is too long (max 128 characters)' };
    }
    
    // Optional: Check for complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        return { 
            valid: false, 
            message: 'Password must contain uppercase, lowercase, and numbers' 
        };
    }
    
    return { valid: true, message: 'Password is strong' };
}

/**
 * Validate problem ID
 * @param {number} problemId - Problem ID to validate
 * @returns {boolean} True if valid
 */
function isValidProblemId(problemId) {
    return Number.isInteger(problemId) && problemId > 0;
}

/**
 * Validate max players count
 * @param {number} maxPlayers - Maximum players
 * @returns {boolean} True if valid (between 2 and 50)
 */
function isValidMaxPlayers(maxPlayers) {
    return Number.isInteger(maxPlayers) && maxPlayers >= 2 && maxPlayers <= 50;
}

/**
 * Validate test cases array
 * @param {Array} testCases - Array of test cases
 * @returns {Object} { valid, message }
 */
function validateTestCases(testCases) {
    if (!Array.isArray(testCases)) {
        return { valid: false, message: 'Test cases must be an array' };
    }
    
    if (testCases.length === 0) {
        return { valid: false, message: 'At least one test case is required' };
    }
    
    if (testCases.length > 100) {
        return { valid: false, message: 'Too many test cases (max 100)' };
    }
    
    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        if (!tc || typeof tc !== 'object') {
            return { valid: false, message: `Test case ${i + 1} is invalid` };
        }
        if (!tc.hasOwnProperty('input_data') || !tc.hasOwnProperty('expected_output')) {
            return { valid: false, message: `Test case ${i + 1} missing required fields` };
        }
    }
    
    return { valid: true, message: 'Test cases are valid' };
}

/**
 * Sanitize string for safe display (prevent XSS)
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
function sanitizeForDisplay(input) {
    if (!input || typeof input !== 'string') return '';
    
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Validate lobby password
 * @param {string} password - Lobby password
 * @returns {boolean} True if valid (4-20 characters or empty)
 */
function isValidLobbyPassword(password) {
    if (!password) return true; // Empty is valid (no password)
    if (typeof password !== 'string') return false;
    return password.length >= 4 && password.length <= 20;
}

/**
 * Validate player role
 * @param {string} role - Player role
 * @returns {boolean} True if valid role
 */
function isValidPlayerRole(role) {
    return role === 'player' || role === 'spectator';
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    isValidMode,
    isValidLanguage,
    isValidRoomCode,
    isValidUsername,
    isValidEmail,
    validatePassword,
    isValidProblemId,
    isValidMaxPlayers,
    validateTestCases,
    sanitizeForDisplay,
    isValidLobbyPassword,
    isValidPlayerRole
};
