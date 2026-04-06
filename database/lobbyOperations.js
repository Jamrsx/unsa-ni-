/**
 * Database Operations: Lobby Management
 * 
 * Functions for managing lobby rooms:
 * - Lobby creation and retrieval
 * - Player management within lobbies
 * - Lobby status updates
 */

/**
 * Generate unique 6-character room code
 * @param {Set} existingCodes - Set of existing room codes to avoid duplicates
 * @returns {string} Unique room code
 */
function generateRoomCode(existingCodes) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    do {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    } while (existingCodes.has(code));
    return code;
}

/**
 * Create a new lobby room
 * @param {Object} db - Database connection
 * @param {Object} lobbyData - Lobby creation data
 * @returns {Object|null} { lobbyId, roomCode }
 */
async function createLobby(db, lobbyData) {
    try {
        const { roomName, description, hostUserId, isPrivate, password, problemId, maxPlayers } = lobbyData;
        
        const [result] = await db.query(
            `INSERT INTO duel_lobby_rooms 
            (room_code, room_name, description, host_user_id, is_private, password, problem_id, max_players, status, host_spectator_mode) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'waiting', 0)`,
            [lobbyData.roomCode, roomName, description, hostUserId, isPrivate ? 1 : 0, password, problemId, maxPlayers || 45]
        );
        
        console.log(`[createLobby] Created lobby ${result.insertId} with code ${lobbyData.roomCode}`);
        
        return {
            lobbyId: result.insertId,
            roomCode: lobbyData.roomCode
        };
    } catch (err) {
        console.error('[createLobby] ERROR:', err);
        return null;
    }
}

/**
 * Get lobby by ID
 * @param {Object} db - Database connection
 * @param {number} lobbyId - Lobby ID
 * @returns {Object|null} Lobby data
 */
async function getLobbyById(db, lobbyId) {
    try {
        const [lobbies] = await db.query(
            'SELECT * FROM duel_lobby_rooms WHERE lobby_id = ?',
            [lobbyId]
        );
        return lobbies.length > 0 ? lobbies[0] : null;
    } catch (err) {
        console.error('[getLobbyById] ERROR:', err);
        return null;
    }
}

/**
 * Get lobby by room code
 * @param {Object} db - Database connection
 * @param {string} roomCode - Room code
 * @returns {Object|null} Lobby data
 */
async function getLobbyByRoomCode(db, roomCode) {
    try {
        const [lobbies] = await db.query(
            'SELECT * FROM duel_lobby_rooms WHERE room_code = ?',
            [roomCode]
        );
        return lobbies.length > 0 ? lobbies[0] : null;
    } catch (err) {
        console.error('[getLobbyByRoomCode] ERROR:', err);
        return null;
    }
}

/**
 * Get list of public lobbies with filters
 * @param {Object} db - Database connection
 * @param {Object} filters - { search }
 * @returns {Array} Array of lobbies
 */
async function getPublicLobbies(db, filters = {}) {
    try {
        const { search } = filters;
        
        let query = `
            SELECT lr.*, u.username as host_username,
                   (SELECT COUNT(*) FROM duel_lobby_players WHERE lobby_id = lr.lobby_id AND left_at IS NULL) as player_count
            FROM duel_lobby_rooms lr
            JOIN users u ON lr.host_user_id = u.user_id
            WHERE lr.status = 'waiting'
        `;
        
        const params = [];
        
        if (search) {
            query += ` AND (lr.room_name LIKE ? OR lr.description LIKE ? OR u.username LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }
        
        query += ` HAVING player_count > 0`;
        query += ` ORDER BY lr.created_at DESC LIMIT 50`;
        
        const [lobbies] = await db.query(query, params);
        return lobbies;
    } catch (err) {
        console.error('[getPublicLobbies] ERROR:', err);
        return [];
    }
}

/**
 * Update lobby status
 * @param {Object} db - Database connection
 * @param {number} lobbyId - Lobby ID
 * @param {string} status - New status ('waiting', 'in_progress', 'completed')
 * @returns {boolean} Success status
 */
async function updateLobbyStatus(db, lobbyId, status) {
    try {
        const [result] = await db.query(
            'UPDATE duel_lobby_rooms SET status = ? WHERE lobby_id = ?',
            [status, lobbyId]
        );
        return result.affectedRows > 0;
    } catch (err) {
        console.error('[updateLobbyStatus] ERROR:', err);
        return false;
    }
}

/**
 * Add player to lobby
 * @param {Object} db - Database connection
 * @param {number} lobbyId - Lobby ID
 * @param {number} userId - User ID
 * @param {string} role - Player role ('player', 'spectator')
 * @returns {boolean} Success status
 */
async function addPlayerToLobby(db, lobbyId, userId, role = 'player') {
    try {
        const [result] = await db.query(
            'INSERT INTO duel_lobby_players (lobby_id, user_id, role, joined_at) VALUES (?, ?, ?, NOW())',
            [lobbyId, userId, role]
        );
        console.log(`[addPlayerToLobby] Added user ${userId} to lobby ${lobbyId} as ${role}`);
        return result.affectedRows > 0;
    } catch (err) {
        console.error('[addPlayerToLobby] ERROR:', err);
        return false;
    }
}

/**
 * Remove player from lobby
 * @param {Object} db - Database connection
 * @param {number} lobbyId - Lobby ID
 * @param {number} userId - User ID
 * @returns {boolean} Success status
 */
async function removePlayerFromLobby(db, lobbyId, userId) {
    try {
        const [result] = await db.query(
            'UPDATE duel_lobby_players SET left_at = NOW() WHERE lobby_id = ? AND user_id = ? AND left_at IS NULL',
            [lobbyId, userId]
        );
        console.log(`[removePlayerFromLobby] Removed user ${userId} from lobby ${lobbyId}`);
        return result.affectedRows > 0;
    } catch (err) {
        console.error('[removePlayerFromLobby] ERROR:', err);
        return false;
    }
}

/**
 * Get lobby players
 * @param {Object} db - Database connection
 * @param {number} lobbyId - Lobby ID
 * @returns {Array} Array of players
 */
async function getLobbyPlayers(db, lobbyId) {
    try {
        const [players] = await db.query(
            `SELECT lp.*, u.username, u.avatar_url
             FROM duel_lobby_players lp
             JOIN users u ON lp.user_id = u.user_id
             WHERE lp.lobby_id = ? AND lp.left_at IS NULL
             ORDER BY lp.joined_at ASC`,
            [lobbyId]
        );
        return players;
    } catch (err) {
        console.error('[getLobbyPlayers] ERROR:', err);
        return [];
    }
}

/**
 * Update lobby host spectator mode
 * @param {Object} db - Database connection
 * @param {number} lobbyId - Lobby ID
 * @param {boolean} spectatorMode - Enable/disable spectator mode
 * @returns {boolean} Success status
 */
async function updateHostSpectatorMode(db, lobbyId, spectatorMode) {
    try {
        const [result] = await db.query(
            'UPDATE duel_lobby_rooms SET host_spectator_mode = ? WHERE lobby_id = ?',
            [spectatorMode ? 1 : 0, lobbyId]
        );
        return result.affectedRows > 0;
    } catch (err) {
        console.error('[updateHostSpectatorMode] ERROR:', err);
        return false;
    }
}

/**
 * Update player role in lobby
 * @param {Object} db - Database connection
 * @param {number} lobbyId - Lobby ID
 * @param {number} userId - User ID
 * @param {string} role - New role ('player', 'spectator')
 * @returns {boolean} Success status
 */
async function updatePlayerRole(db, lobbyId, userId, role) {
    try {
        const [result] = await db.query(
            'UPDATE duel_lobby_players SET role = ? WHERE lobby_id = ? AND user_id = ? AND left_at IS NULL',
            [role, lobbyId, userId]
        );
        console.log(`[updatePlayerRole] Updated user ${userId} role to ${role} in lobby ${lobbyId}`);
        return result.affectedRows > 0;
    } catch (err) {
        console.error('[updatePlayerRole] ERROR:', err);
        return false;
    }
}

/**
 * Check if lobby is full
 * @param {Object} db - Database connection
 * @param {number} lobbyId - Lobby ID
 * @returns {boolean} True if lobby is full
 */
async function isLobbyFull(db, lobbyId) {
    try {
        const [result] = await db.query(
            `SELECT 
                lr.max_players,
                (SELECT COUNT(*) FROM duel_lobby_players WHERE lobby_id = ? AND left_at IS NULL AND role = 'player') as current_players
             FROM duel_lobby_rooms lr
             WHERE lr.lobby_id = ?`,
            [lobbyId, lobbyId]
        );
        
        if (result.length === 0) return true; // Lobby doesn't exist
        
        return result[0].current_players >= result[0].max_players;
    } catch (err) {
        console.error('[isLobbyFull] ERROR:', err);
        return true; // Assume full on error
    }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    generateRoomCode,
    createLobby,
    getLobbyById,
    getLobbyByRoomCode,
    getPublicLobbies,
    updateLobbyStatus,
    addPlayerToLobby,
    removePlayerFromLobby,
    getLobbyPlayers,
    updateHostSpectatorMode,
    updatePlayerRole,
    isLobbyFull
};
