/**
 * Lobby Broadcasting Module
 * 
 * Handles all socket emissions for lobby events:
 * - Lobby updates (player join/leave, ready state)
 * - Match starting notifications
 * - Chat messages
 * - Error/success responses
 * 
 * This module is PURE BROADCASTING - no state changes, no database operations.
 * All functions take io and activeLobbies as parameters for testability.
 */

const lobbyState = require('./lobbyState.js');

/**
 * Broadcast lobby update to all players in lobby
 * @param {string} lobbyId - Lobby ID
 * @param {Object} io - Socket.io server instance
 * @param {Map} activeLobbies - Map of active lobbies
 */
function broadcastLobbyUpdate(lobbyId, io, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) {
        console.log('[LOBBY BROADCAST] Cannot broadcast - lobby not found:', lobbyId);
        return;
    }
    
    const lobbyDetails = lobbyState.getLobbyDetails(lobbyId, activeLobbies);
    if (!lobbyDetails) {
        console.log('[LOBBY BROADCAST] Cannot broadcast - lobby details not available');
        return;
    }
    
    console.log(`[LOBBY BROADCAST] Broadcasting update to lobby ${lobbyId}, ${lobby.sockets.size} sockets`);
    
    // Emit to all players in the lobby room
    io.to(`lobby_${lobbyId}`).emit('lobby_updated', lobbyDetails);
    
    // CRITICAL FIX: Also emit to spectators
    io.to(`lobby_spectator_${lobbyId}`).emit('lobby_updated', lobbyDetails);
    
    // Also emit to individual sockets for backward compatibility
    lobby.sockets.forEach((socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
            socket.emit('lobby_updated', lobbyDetails);
        }
    });
}

/**
 * Broadcast player joined event
 * @param {string} lobbyId - Lobby ID
 * @param {Object} playerData - { userId, username, avatarUrl }
 * @param {Object} io - Socket.io server instance
 * @param {Map} activeLobbies - Map of active lobbies
 */
function broadcastPlayerJoined(lobbyId, playerData, io, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) return;
    
    console.log(`[LOBBY BROADCAST] Player ${playerData.username} joined lobby ${lobbyId}`);
    
    // Send full lobby update (includes new player)
    broadcastLobbyUpdate(lobbyId, io, activeLobbies);
    
    // Also send specific join event
    io.to(`lobby_${lobbyId}`).emit('player_joined', {
        userId: playerData.userId,
        username: playerData.username,
        avatarUrl: playerData.avatarUrl
    });
}

/**
 * Broadcast player left event
 * @param {string} lobbyId - Lobby ID
 * @param {number} userId - User ID who left
 * @param {string} username - Username who left
 * @param {Object} io - Socket.io server instance
 * @param {Map} activeLobbies - Map of active lobbies
 */
function broadcastPlayerLeft(lobbyId, userId, username, io, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) return;
    
    console.log(`[LOBBY BROADCAST] Player ${username} left lobby ${lobbyId}`);
    
    // Send full lobby update (player removed)
    broadcastLobbyUpdate(lobbyId, io, activeLobbies);
    
    // Also send specific leave event
    io.to(`lobby_${lobbyId}`).emit('player_left', {
        userId,
        username
    });
}

/**
 * Broadcast ready state change
 * @param {string} lobbyId - Lobby ID
 * @param {number} userId - User ID
 * @param {boolean} isReady - New ready state
 * @param {Object} io - Socket.io server instance
 * @param {Map} activeLobbies - Map of active lobbies
 */
function broadcastReadyChange(lobbyId, userId, isReady, io, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) return;
    
    console.log(`[LOBBY BROADCAST] Player ${userId} ready state: ${isReady} in lobby ${lobbyId}`);
    
    // Send full lobby update (includes ready state)
    broadcastLobbyUpdate(lobbyId, io, activeLobbies);
}

/**
 * Broadcast role change (player ↔ spectator)
 * @param {string} lobbyId - Lobby ID
 * @param {number} userId - User ID
 * @param {string} newRole - 'player' or 'spectator'
 * @param {Object} io - Socket.io server instance
 * @param {Map} activeLobbies - Map of active lobbies
 */
function broadcastRoleChange(lobbyId, userId, newRole, io, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) return;
    
    console.log(`[LOBBY BROADCAST] User ${userId} switched to ${newRole} in lobby ${lobbyId}`);
    
    // Send full lobby update (includes role change)
    broadcastLobbyUpdate(lobbyId, io, activeLobbies);
    
    // Also send specific role change event
    io.to(`lobby_${lobbyId}`).emit('role_changed', {
        userId,
        newRole
    });
}

/**
 * Broadcast match starting notification
 * @param {string} lobbyId - Lobby ID
 * @param {Object} matchData - { matchId, problemId, mode, roomCode }
 * @param {Object} io - Socket.io server instance
 * @param {Map} activeLobbies - Map of active lobbies
 */
function broadcastMatchStarting(lobbyId, matchData, io, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) return;
    
    console.log(`[LOBBY BROADCAST] Match starting in lobby ${lobbyId}, match ID: ${matchData.matchId}`);
    
    const payload = {
        lobbyId,
        matchId: matchData.matchId,
        problemId: matchData.problemId,
        mode: matchData.mode,
        roomCode: matchData.roomCode,
        spectatorCode: matchData.spectatorCode || null,
        allowSpectators: matchData.allowSpectators || false
    };
    
    // Emit to all players in lobby
    io.to(`lobby_${lobbyId}`).emit('match_starting', payload);
    
    console.log(`[LOBBY BROADCAST] Match start notification sent to ${lobby.sockets.size} sockets`);
}

/**
 * Broadcast chat message to lobby
 * @param {string} lobbyId - Lobby ID
 * @param {Object} message - { userId, username, message, timestamp }
 * @param {Object} io - Socket.io server instance
 * @param {Map} activeLobbies - Map of active lobbies
 */
function broadcastChatMessage(lobbyId, message, io, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) {
        console.log('[LOBBY BROADCAST] Cannot send chat - lobby not found:', lobbyId);
        return;
    }
    
    console.log(`[LOBBY BROADCAST] Chat message from ${message.username} in lobby ${lobbyId}`);
    
    const payload = {
        user_id: message.userId,
        username: message.username,
        message: message.message,
        created_at: message.timestamp || new Date().toISOString()
    };
    
    // Emit to all players in lobby
    io.to(`lobby_${lobbyId}`).emit('lobby_chat_message', payload);
}

/**
 * Emit error to specific socket
 * @param {string} socketId - Socket ID
 * @param {string} error - Error message
 * @param {Object} io - Socket.io server instance
 */
function emitErrorToSocket(socketId, error, io) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
        console.log(`[LOBBY BROADCAST] Sending error to socket ${socketId}: ${error}`);
        socket.emit('lobby_error', { error });
    }
}

/**
 * Emit success to specific socket
 * @param {string} socketId - Socket ID
 * @param {Object} data - Success data
 * @param {Object} io - Socket.io server instance
 */
function emitSuccessToSocket(socketId, data, io) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
        console.log(`[LOBBY BROADCAST] Sending success to socket ${socketId}`);
        socket.emit('lobby_success', data);
    }
}

/**
 * Broadcast lobby closed event
 * @param {string} lobbyId - Lobby ID
 * @param {string} reason - Reason for closure
 * @param {Object} io - Socket.io server instance
 * @param {Map} activeLobbies - Map of active lobbies
 */
function broadcastLobbyClosed(lobbyId, reason, io, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) return;
    
    console.log(`[LOBBY BROADCAST] Lobby ${lobbyId} closed: ${reason}`);
    
    // Emit to all players before cleanup
    io.to(`lobby_${lobbyId}`).emit('lobby_closed', {
        lobbyId,
        reason
    });
    
    // Disconnect all sockets from the room
    lobby.sockets.forEach((socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
            socket.leave(`lobby_${lobbyId}`);
        }
    });
}

/**
 * Broadcast host change event (when original host leaves)
 * @param {string} lobbyId - Lobby ID
 * @param {number} newHostId - New host user ID
 * @param {string} newHostUsername - New host username
 * @param {Object} io - Socket.io server instance
 * @param {Map} activeLobbies - Map of active lobbies
 */
function broadcastHostChange(lobbyId, newHostId, newHostUsername, io, activeLobbies) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) return;
    
    console.log(`[LOBBY BROADCAST] Host changed to ${newHostUsername} in lobby ${lobbyId}`);
    
    // Send full lobby update (includes new host)
    broadcastLobbyUpdate(lobbyId, io, activeLobbies);
    
    // Also send specific host change event
    io.to(`lobby_${lobbyId}`).emit('host_changed', {
        newHostId,
        newHostUsername
    });
}

/**
 * Notify specific player about lobby state
 * @param {string} socketId - Socket ID
 * @param {string} lobbyId - Lobby ID
 * @param {Object} io - Socket.io server instance
 * @param {Map} activeLobbies - Map of active lobbies
 */
function notifyPlayerLobbyState(socketId, lobbyId, io, activeLobbies) {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket) return;
    
    const lobbyDetails = lobbyState.getLobbyDetails(lobbyId, activeLobbies);
    if (!lobbyDetails) return;
    
    console.log(`[LOBBY BROADCAST] Sending lobby state to socket ${socketId}`);
    socket.emit('lobby_updated', lobbyDetails);
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    broadcastLobbyUpdate,
    broadcastPlayerJoined,
    broadcastPlayerLeft,
    broadcastReadyChange,
    broadcastRoleChange,
    broadcastMatchStarting,
    broadcastChatMessage,
    emitErrorToSocket,
    emitSuccessToSocket,
    broadcastLobbyClosed,
    broadcastHostChange,
    notifyPlayerLobbyState
};
