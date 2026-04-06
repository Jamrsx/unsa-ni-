/**
 * Lobby State Management Module
 * 
 * Handles all in-memory lobby state operations:
 * - State getters and formatters
 * - Validation logic
 * - Player management
 * - Ready state checks
 * 
 * This module is PURE - no database operations, no socket emissions.
 * All functions take activeLobbies Map as parameter for testability.
 */

/**
 * Get formatted lobby details for client
 * @param {string} lobbyId - Lobby ID
 * @param {Map} activeLobbies - Map of active lobbies
 * @returns {Object|null} Lobby details with players array, or null if not found
 */
function getLobbyDetails(lobbyId, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) return null;
    
    // Map players with consistent field names matching database schema
    const players = Array.from(lobby.players.values()).map(player => {
        const isHost = player.userId === lobby.lobbyData.host_user_id;
        return {
            user_id: player.userId,
            username: player.username,
            avatar_url: player.avatarUrl,
            is_ready: isHost ? 1 : (player.isReady ? 1 : 0), // Host always ready, convert boolean to int
            isHost: isHost
        };
    });
    
    const details = {
        ...lobby.lobbyData,
        players,
        playerCount: players.length
    };
    
    console.log('[LOBBY STATE] getLobbyDetails returning:', {
        lobby_id: details.lobby_id,
        host_user_id: details.host_user_id,
        is_private: details.is_private,
        playerCount: details.playerCount
    });
    
    return details;
}

/**
 * Get specific player from lobby
 * @param {string} lobbyId - Lobby ID
 * @param {number} userId - User ID to find
 * @param {Map} activeLobbies - Map of active lobbies
 * @returns {Object|null} Player data or null if not found
 */
function getPlayerInLobby(lobbyId, userId, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) return null;
    
    return lobby.players.get(userId) || null;
}

/**
 * Check if lobby is at full capacity
 * @param {string} lobbyId - Lobby ID
 * @param {Map} activeLobbies - Map of active lobbies
 * @returns {boolean} True if lobby is full
 */
function isLobbyFull(lobbyId, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) return true; // Treat non-existent lobby as "full"
    
    const isFull = lobby.players.size >= lobby.lobbyData.max_players;
    
    console.log(`[LOBBY STATE] isLobbyFull check - players: ${lobby.players.size}/${lobby.lobbyData.max_players}, full: ${isFull}`);
    
    return isFull;
}

/**
 * Validate lobby password
 * @param {string} lobbyId - Lobby ID
 * @param {string} password - Password to check
 * @param {number} userId - User ID (host bypasses password)
 * @param {Map} activeLobbies - Map of active lobbies
 * @returns {Object} { valid: boolean, error: string|null }
 */
function validateLobbyPassword(lobbyId, password, userId, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) {
        return { valid: false, error: 'Lobby not found' };
    }
    
    // Host always bypasses password
    const isHost = lobby.lobbyData.host_user_id === userId;
    if (isHost) {
        console.log(`[LOBBY STATE] Password validation - user ${userId} is host, bypassing check`);
        return { valid: true, error: null };
    }
    
    // Public lobbies don't need password
    if (!lobby.lobbyData.is_private) {
        console.log(`[LOBBY STATE] Password validation - lobby is public, no password needed`);
        return { valid: true, error: null };
    }
    
    // Private lobby - check password
    const passwordMatch = lobby.lobbyData.password === password;
    
    console.log(`[LOBBY STATE] Password validation - expected: "${lobby.lobbyData.password}", received: "${password}", match: ${passwordMatch}`);
    
    if (!passwordMatch) {
        return { valid: false, error: 'Incorrect password' };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate if player can join lobby
 * @param {string} lobbyId - Lobby ID
 * @param {number} userId - User ID attempting to join
 * @param {Map} activeLobbies - Map of active lobbies
 * @returns {Object} { canJoin: boolean, reason: string|null }
 */
function validatePlayerJoin(lobbyId, userId, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    
    if (!lobby) {
        return { canJoin: false, reason: 'Lobby not found' };
    }
    
    // Check if already in lobby
    if (lobby.players.has(userId)) {
        console.log(`[LOBBY STATE] User ${userId} already in lobby ${lobbyId}`);
        return { canJoin: true, reason: 'Already in lobby' }; // Not an error, just return current state
    }
    
    // Check if full
    if (lobby.players.size >= lobby.lobbyData.max_players) {
        console.log(`[LOBBY STATE] Lobby ${lobbyId} is full (${lobby.players.size}/${lobby.lobbyData.max_players})`);
        return { canJoin: false, reason: 'Lobby is full' };
    }
    
    // Check if host in spectator mode
    const isHost = lobby.lobbyData.host_user_id === userId;
    if (isHost && lobby.lobbyData.host_spectator_mode) {
        console.log(`[LOBBY STATE] Host ${userId} is in spectator mode`);
        return { canJoin: false, reason: 'Host is in spectator mode', isSpectatorMode: true };
    }
    
    return { canJoin: true, reason: null };
}

/**
 * Check if match can start from lobby
 * @param {string} lobbyId - Lobby ID
 * @param {Map} activeLobbies - Map of active lobbies
 * @returns {Object} { canStart: boolean, reason: string|null, readyCount: number, totalPlayers: number }
 */
function canStartMatch(lobbyId, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    
    if (!lobby) {
        return { canStart: false, reason: 'Lobby not found', readyCount: 0, totalPlayers: 0 };
    }
    
    const players = Array.from(lobby.players.values());
    const totalPlayers = players.length;
    
    // Need at least 2 players
    if (totalPlayers < 2) {
        console.log(`[LOBBY STATE] Cannot start - only ${totalPlayers} player(s)`);
        return { canStart: false, reason: 'Need at least 2 players', readyCount: 0, totalPlayers };
    }
    
    // Count ready players (host is always ready)
    const readyCount = players.filter(p => {
        const isHost = p.userId === lobby.lobbyData.host_user_id;
        return isHost || p.isReady;
    }).length;
    
    console.log(`[LOBBY STATE] Match start check - ${readyCount}/${totalPlayers} players ready`);
    
    // All players must be ready
    if (readyCount < totalPlayers) {
        return { 
            canStart: false, 
            reason: `Only ${readyCount}/${totalPlayers} players ready`, 
            readyCount, 
            totalPlayers 
        };
    }
    
    return { canStart: true, reason: null, readyCount, totalPlayers };
}

/**
 * Add player to lobby state (memory only)
 * @param {string} lobbyId - Lobby ID
 * @param {Object} playerData - { userId, username, avatarUrl, isReady, socketId }
 * @param {Map} activeLobbies - Map of active lobbies
 * @returns {boolean} True if added successfully
 */
function addPlayerToLobbyState(lobbyId, playerData, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) {
        console.log(`[LOBBY STATE] Cannot add player - lobby ${lobbyId} not found`);
        return false;
    }
    
    const { userId, username, avatarUrl, isReady, socketId } = playerData;
    
    // Add to players Map
    lobby.players.set(userId, {
        userId,
        username,
        avatarUrl: avatarUrl || null,
        isReady: isReady || false
    });
    
    // Add socket to lobby's socket set
    if (socketId) {
        lobby.sockets.add(socketId);
    }
    
    console.log(`[LOBBY STATE] Added player ${username} (${userId}) to lobby ${lobbyId}. Total players: ${lobby.players.size}`);
    
    return true;
}

/**
 * Remove player from lobby state (memory only)
 * @param {string} lobbyId - Lobby ID
 * @param {number} userId - User ID to remove
 * @param {string} socketId - Socket ID to remove
 * @param {Map} activeLobbies - Map of active lobbies
 * @returns {Object} { removed: boolean, wasHost: boolean, remainingPlayers: number }
 */
function removePlayerFromLobbyState(lobbyId, userId, socketId, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) {
        console.log(`[LOBBY STATE] Cannot remove player - lobby ${lobbyId} not found`);
        return { removed: false, wasHost: false, remainingPlayers: 0 };
    }
    
    const wasHost = lobby.lobbyData.host_user_id === userId;
    
    // Remove from players Map
    const removed = lobby.players.delete(userId);
    
    // Remove socket from lobby's socket set
    if (socketId) {
        lobby.sockets.delete(socketId);
    }
    
    const remainingPlayers = lobby.players.size;
    
    console.log(`[LOBBY STATE] Removed player ${userId} from lobby ${lobbyId}. Remaining players: ${remainingPlayers}, Was host: ${wasHost}`);
    
    return { removed, wasHost, remainingPlayers };
}

/**
 * Update player ready state in lobby
 * @param {string} lobbyId - Lobby ID
 * @param {number} userId - User ID
 * @param {boolean} isReady - New ready state
 * @param {Map} activeLobbies - Map of active lobbies
 * @returns {boolean} True if updated successfully
 */
function updatePlayerReadyState(lobbyId, userId, isReady, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) {
        console.log(`[LOBBY STATE] Cannot update ready state - lobby ${lobbyId} not found`);
        return false;
    }
    
    const player = lobby.players.get(userId);
    if (!player) {
        console.log(`[LOBBY STATE] Cannot update ready state - player ${userId} not in lobby ${lobbyId}`);
        return false;
    }
    
    // Host is always ready, cannot toggle
    const isHost = lobby.lobbyData.host_user_id === userId;
    if (isHost) {
        console.log(`[LOBBY STATE] Cannot change host ready state - host is always ready`);
        return false;
    }
    
    player.isReady = isReady;
    
    console.log(`[LOBBY STATE] Updated player ${userId} ready state to ${isReady} in lobby ${lobbyId}`);
    
    return true;
}

/**
 * Check if user is host of lobby
 * @param {string} lobbyId - Lobby ID
 * @param {number} userId - User ID to check
 * @param {Map} activeLobbies - Map of active lobbies
 * @returns {boolean} True if user is host
 */
function isUserHost(lobbyId, userId, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) return false;
    
    return lobby.lobbyData.host_user_id === userId;
}

/**
 * Get all ready players in lobby
 * @param {string} lobbyId - Lobby ID
 * @param {Map} activeLobbies - Map of active lobbies
 * @returns {Array} Array of ready player objects
 */
function getReadyPlayers(lobbyId, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) return [];
    
    return Array.from(lobby.players.values()).filter(player => {
        const isHost = player.userId === lobby.lobbyData.host_user_id;
        return isHost || player.isReady;
    });
}

/**
 * Get lobby by room code
 * @param {string} roomCode - Room code
 * @param {Map} lobbyRoomCodes - Map of room codes to lobby IDs
 * @param {Map} activeLobbies - Map of active lobbies
 * @returns {Object|null} { lobbyId, lobby } or null if not found
 */
function getLobbyByRoomCode(roomCode, lobbyRoomCodes, activeLobbies) {
    const lobbyId = lobbyRoomCodes.get(roomCode);
    if (!lobbyId) {
        console.log(`[LOBBY STATE] Room code ${roomCode} not found in lobbyRoomCodes`);
        return null;
    }
    
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) {
        console.log(`[LOBBY STATE] Lobby ${lobbyId} not found in activeLobbies`);
        return null;
    }
    
    return { lobbyId, lobby };
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    getLobbyDetails,
    getPlayerInLobby,
    isLobbyFull,
    validateLobbyPassword,
    validatePlayerJoin,
    canStartMatch,
    addPlayerToLobbyState,
    removePlayerFromLobbyState,
    updatePlayerReadyState,
    isUserHost,
    getReadyPlayers,
    getLobbyByRoomCode
};
