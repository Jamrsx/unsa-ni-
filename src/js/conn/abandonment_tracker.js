// =====================================================
// ABANDONMENT TRACKER MODULE
// Detects when players leave onboarding without submitting
// =====================================================

/**
 * Tracks player presence on onboarding page
 * Applies penalties if player disconnects/leaves without submitting
 * Penalty = Player leaves page, NOT time-based
 */
class AbandonmentTracker {
    constructor(io, db, activeSessions = null) {
        this.io = io;
        this.db = db;
        this.activeSessions = activeSessions;
        this.activeMatches = new Map(); // matchId -> { player1, player2, mode }
        this.socketToMatch = new Map(); // socketId -> { matchId, playerSlot }
        this.userToMatch = new Map(); // userId -> { matchId, playerSlot } - for multi-tab support
        this.abandonedPlayers = new Map(); // userId -> { matchId, abandonedAt, penaltyApplied }
        this.waitingTimers = new Map(); // matchId -> { playerSlot, waitingForOpponent, startedAt }
        this.RECONNECT_GRACE_PERIOD = 30000; // 30 seconds to reconnect after disconnect
    }

    /**
     * Called when a player loads the onboarding page
     * Registers player presence
     */
    playerEnteredOnboarding(matchId, socketId, userId, username, mode) {
        console.log(`[ABANDON TRACKER] 📝 ${username} entered onboarding for match ${matchId}`);

        // Check if player has already abandoned this match
        const abandonment = this.abandonedPlayers.get(userId);
        if (abandonment && abandonment.matchId === matchId) {
            console.log(`[ABANDON TRACKER] 🚫 ${username} already abandoned match ${matchId} - BLOCKING entry`);
            return { blocked: true, reason: 'already_abandoned' };
        }

        // Get or create match tracking
        if (!this.activeMatches.has(matchId)) {
            this.activeMatches.set(matchId, {
                matchId,
                mode,
                player1: null,
                player2: null,
                startTime: Date.now()
            });
        }

        const match = this.activeMatches.get(matchId);

        // Determine which player slot to use
        const playerSlot = !match.player1 ? 'player1' : 'player2';
        
        match[playerSlot] = {
            socketId,
            userId,
            username,
            enteredAt: Date.now(),
            submitted: false,
            onPage: true,  // ✅ Track page presence
            disconnectTimer: null,  // ✅ Grace period timer for reconnection
            disconnectedAt: null    // ✅ Track when disconnected
        };

        // Map socket to match for disconnect handling
        this.socketToMatch.set(socketId, { matchId, playerSlot });
        // Also map userId to match for multi-tab support
        this.userToMatch.set(userId, { matchId, playerSlot });

        console.log(`[ABANDON TRACKER] ${username} registered as ${playerSlot} (socket: ${socketId}, userId: ${userId})`);
        console.log(`[ABANDON TRACKER] Match ${matchId} status: P1=${match.player1?.username || 'waiting'}, P2=${match.player2?.username || 'waiting'}`);
        
        return { blocked: false };
    }

    /**
     * Check if a player can rejoin a match
     * Returns { allowed: boolean, reason: string, forceRedirect: string }
     */
    canRejoinMatch(userId, matchId) {
        const abandonment = this.abandonedPlayers.get(userId);
        
        // Player has abandoned this specific match
        if (abandonment && abandonment.matchId === matchId) {
            const timeSinceAbandonment = Date.now() - abandonment.abandonedAt;
            const graceRemaining = this.RECONNECT_GRACE_PERIOD - timeSinceAbandonment;
            
            // Still in grace period - allow return to try and complete match
            if (graceRemaining > 0 && !abandonment.penaltyApplied) {
                console.log(`[ABANDON TRACKER] ✅ ${userId} can return - ${Math.floor(graceRemaining/1000)}s grace remaining`);
                return { 
                    allowed: true, 
                    reason: 'grace_period',
                    graceRemaining: Math.floor(graceRemaining / 1000)
                };
            }
            
            // Grace period expired - block and redirect
            console.log(`[ABANDON TRACKER] 🚫 ${userId} grace expired - blocking and redirecting to duel`);
            return { 
                allowed: false, 
                reason: 'grace_expired',
                forceRedirect: '/duel.html'
            };
        }
        
        // Check if player is in waiting state (opponent's timer running)
        const userMatch = this.userToMatch.get(userId);
        if (userMatch && userMatch.matchId === matchId) {
            const match = this.activeMatches.get(matchId);
            if (match) {
                const playerSlot = userMatch.playerSlot;
                const player = match[playerSlot];
                
                // Player's timer expired and waiting for opponent
                if (player && player.disconnectTimer === null && player.disconnectedAt) {
                    const waiting = this.waitingTimers.get(matchId);
                    if (waiting && waiting.playerSlot === playerSlot) {
                        console.log(`[ABANDON TRACKER] 🚫 ${userId} in waiting state - cannot rejoin`);
                        return {
                            allowed: false,
                            reason: 'waiting_for_opponent',
                            forceRedirect: '/duel.html'
                        };
                    }
                }
            }
        }
        
        // Normal case - allow
        return { allowed: true, reason: 'ok' };
    }

    /**
     * Called when a player submits their code
     * Marks as submitted and cleans up
     */
    playerSubmitted(matchId, userId) {
        const match = this.activeMatches.get(matchId);
        if (!match) {
            console.log(`[ABANDON TRACKER] ⚠️ No active match ${matchId} found for submission`);
            return;
        }

        // Find which player submitted
        let playerSlot = null;
        if (match.player1?.userId === userId) {
            playerSlot = 'player1';
        } else if (match.player2?.userId === userId) {
            playerSlot = 'player2';
        }

        if (!playerSlot) {
            console.log(`[ABANDON TRACKER] ⚠️ User ${userId} not found in match ${matchId}`);
            return;
        }

        const player = match[playerSlot];
        
        // ✅ Cancel disconnect timer if exists (player reconnected and now submitting)
        if (player.disconnectTimer) {
            clearTimeout(player.disconnectTimer);
            player.disconnectTimer = null;
            console.log(`[ABANDON TRACKER] Cancelled disconnect timer for ${player.username}`);
        }
        
        player.submitted = true;
        player.onPage = false;  // No longer tracking

        console.log(`[ABANDON TRACKER] ✅ ${player.username} submitted for match ${matchId}`);

        // Remove socket and user mappings
        if (player.socketId) {
            this.socketToMatch.delete(player.socketId);
        }
        this.userToMatch.delete(userId);
        this.userToMatch.delete(userId);

        // If both players submitted, clean up match
        if (match.player1?.submitted && match.player2?.submitted) {
            console.log(`[ABANDON TRACKER] 🎉 Both players submitted for match ${matchId} - cleaning up`);
            this._cleanupMatch(matchId);
        }
    }

    /**
     * Called when a socket disconnects
     * Start grace period timer - apply penalty only if they don't reconnect
     * @param {string} socketId - The disconnected socket ID
     * @param {number} userId - The user ID
     * @param {boolean} isLastSocket - True if this was the user's last socket
     */
    async playerDisconnected(socketId, userId, isLastSocket) {
        // Try to get mapping from socketId first, fallback to userId
        let mapping = this.socketToMatch.get(socketId);
        
        if (!mapping && userId) {
            // Socket mapping might have been deleted by previous tab close
            // Try userId mapping instead (for multi-tab scenario)
            mapping = this.userToMatch.get(userId);
            console.log(`[ABANDON TRACKER] 🔍 Socket ${socketId} not found in socketToMatch, using userId ${userId} mapping`);
        }
        
        if (!mapping) {
            console.log(`[ABANDON TRACKER] ⚠️ No mapping found for socket ${socketId} or user ${userId} - player not tracked`);
            return;
        }

        const { matchId, playerSlot } = mapping;
        const match = this.activeMatches.get(matchId);
        
        if (!match) {
            console.log(`[ABANDON TRACKER] Match ${matchId} already cleaned up`);
            this.socketToMatch.delete(socketId);
            return;
        }

        const player = match[playerSlot];
        if (!player) {
            console.log(`[ABANDON TRACKER] Player ${playerSlot} not found in match ${matchId}`);
            this.socketToMatch.delete(socketId);
            return;
        }

        // If already submitted, no penalty
        if (player.submitted) {
            console.log(`[ABANDON TRACKER] ${player.username} disconnected but already submitted - no penalty`);
            this.socketToMatch.delete(socketId);
            return;
        }

        // ✅ CHECK: If user has other sockets open, don't penalize yet
        // They might have multiple tabs - only penalize when ALL tabs close
        if (!isLastSocket) {
            console.log(`[ABANDON TRACKER] ℹ️ ${player.username} closed a tab but has other sockets open - not starting grace period yet`);
            // Only delete THIS socket's mapping, but keep userToMatch for when the last socket disconnects
            this.socketToMatch.delete(socketId);
            console.log(`[ABANDON TRACKER] 🔧 Deleted socket ${socketId} mapping, but keeping user ${userId} mapping for remaining tabs`);
            return;
        }

        // ✅ START GRACE PERIOD: This was their last socket - give time to reconnect
        console.log(`[ABANDON TRACKER] ⏰ ${player.username} disconnected (last socket) - starting ${this.RECONNECT_GRACE_PERIOD / 1000}s grace period for reconnection`);
        
        player.disconnectedAt = Date.now();
        player.onPage = false; // Mark as not on page
        
        // Clear old timer if exists
        if (player.disconnectTimer) {
            clearTimeout(player.disconnectTimer);
        }
        
        // Start grace period timer
        player.disconnectTimer = setTimeout(async () => {
            await this._handleDisconnectTimeout(matchId, playerSlot);
        }, this.RECONNECT_GRACE_PERIOD);
        
        // Don't delete socket mapping yet - need it for reconnection detection
    }

    /**
     * Called when player reconnects to onboarding page
     * Cancels pending abandonment if within grace period
     */
    playerReconnected(matchId, socketId, userId) {
        const match = this.activeMatches.get(matchId);
        if (!match) {
            console.log(`[ABANDON TRACKER] Match ${matchId} not found for reconnection`);
            return false;
        }

        // Find player by userId
        let playerSlot = null;
        if (match.player1?.userId === userId) {
            playerSlot = 'player1';
        } else if (match.player2?.userId === userId) {
            playerSlot = 'player2';
        }

        if (!playerSlot) {
            console.log(`[ABANDON TRACKER] Player ${userId} not found in match ${matchId}`);
            return false;
        }

        const player = match[playerSlot];

        // ✅ RECONNECTION DETECTED: Cancel penalty timer
        if (player.disconnectTimer) {
            clearTimeout(player.disconnectTimer);
            player.disconnectTimer = null;
            player.disconnectTimer = null;
            
            const disconnectDuration = Date.now() - player.disconnectedAt;
            console.log(`[ABANDON TRACKER] ✅ ${player.username} reconnected after ${Math.floor(disconnectDuration / 1000)}s - penalty cancelled`);
        }

        // Update player state
        player.socketId = socketId;
        player.onPage = true;
        player.disconnectedAt = null;

        // Update mappings with new socket
        this.socketToMatch.set(socketId, { matchId, playerSlot });
        this.userToMatch.set(userId, { matchId, playerSlot });

        // Update socket mapping
        const oldMapping = this.socketToMatch.get(player.socketId);
        if (oldMapping) {
            this.socketToMatch.delete(player.socketId);
        }
        this.socketToMatch.set(socketId, { matchId, playerSlot });

        console.log(`[ABANDON TRACKER] ${player.username} back on onboarding (new socket: ${socketId})`);
        return true;
    }

    /**
     * Private: Handle disconnect timeout (grace period expired)
     * Implements sequential timer logic for both-player abandonment
     */
    async _handleDisconnectTimeout(matchId, playerSlot) {
        console.log(`[ABANDON TRACKER] ========== TIMEOUT HANDLER START ==========`);
        console.log(`[ABANDON TRACKER] Match ${matchId}, Player Slot: ${playerSlot}`);
        console.log(`[ABANDON TRACKER] Current time: ${new Date().toLocaleTimeString()}`);
        
        const match = this.activeMatches.get(matchId);
        if (!match) {
            console.log(`[ABANDON TRACKER] ⚠️ Match ${matchId} not found in activeMatches - already cleaned up`);
            return;
        }

        const player = match[playerSlot];
        if (!player) {
            console.log(`[ABANDON TRACKER] Player ${playerSlot} not found`);
            return;
        }

        // Double-check they didn't reconnect or submit
        if (player.submitted) {
            console.log(`[ABANDON TRACKER] ${player.username} submitted during grace period - no penalty`);
            return;
        }

        if (player.onPage) {
            console.log(`[ABANDON TRACKER] ${player.username} reconnected during grace period - no penalty`);
            return;
        }

        console.log(`[ABANDON TRACKER] 🚨 TIMER EXPIRED: ${player.username} grace period ended (${this.RECONNECT_GRACE_PERIOD / 1000}s)`);

        // Get opponent info
        const opponentSlot = playerSlot === 'player1' ? 'player2' : 'player1';
        const opponent = match[opponentSlot];

        console.log(`[ABANDON TRACKER] 🔍 Opponent check for ${player.username}:`);
        console.log(`[ABANDON TRACKER] 🔍   Opponent slot: ${opponentSlot}`);
        console.log(`[ABANDON TRACKER] 🔍   Opponent exists: ${!!opponent}`);
        if (opponent) {
            console.log(`[ABANDON TRACKER] 🔍   Opponent: ${opponent.username}`);
            console.log(`[ABANDON TRACKER] 🔍   Opponent onPage: ${opponent.onPage}`);
            console.log(`[ABANDON TRACKER] 🔍   Opponent submitted: ${opponent.submitted}`);
            console.log(`[ABANDON TRACKER] 🔍   Opponent disconnectTimer: ${!!opponent.disconnectTimer}`);
            
            // Check if opponent has any active sockets (truly online)
            const opponentRoom = `user_${opponent.userId}`;
            const opponentSockets = this.io.sockets.adapter.rooms.get(opponentRoom);
            const opponentIsOnline = opponentSockets && opponentSockets.size > 0;
            console.log(`[ABANDON TRACKER] 🔍   Opponent online (has sockets): ${opponentIsOnline}`);
        }

        // Check if opponent has active disconnect timer AND is truly offline (no sockets)
        // Don't trigger WAITING STATE if opponent has reconnected (even to different page)
        let opponentAlsoDisconnected = false;
        if (opponent && opponent.disconnectTimer !== null && !opponent.submitted) {
            const opponentRoom = `user_${opponent.userId}`;
            const opponentSockets = this.io.sockets.adapter.rooms.get(opponentRoom);
            const opponentIsOnline = opponentSockets && opponentSockets.size > 0;
            
            // Only consider opponent disconnected if they have NO sockets
            opponentAlsoDisconnected = !opponentIsOnline;
        }
        
        if (opponentAlsoDisconnected) {
            // ✅ BOTH PLAYERS DISCONNECTED - Enter WAITING STATE
            console.log(`[ABANDON TRACKER] ⏳ WAITING STATE: ${player.username}'s timer expired, but ${opponent.username} also disconnected`);
            console.log(`[ABANDON TRACKER] ⏳ ${player.username} cannot rejoin - waiting for ${opponent.username}'s timer to expire`);
            
            // Mark this player as abandoned (blocks rejoin)
            this.abandonedPlayers.set(player.userId, {
                matchId,
                abandonedAt: Date.now(),
                penaltyApplied: false,
                username: player.username
            });
            
            // Set waiting state
            this.waitingTimers.set(matchId, {
                playerSlot,
                waitingForOpponent: opponentSlot,
                startedAt: Date.now()
            });
            
            // Clear this player's timer (already expired)
            player.disconnectTimer = null;
            
            // DO NOT apply penalty yet - wait for opponent's timer
            console.log(`[ABANDON TRACKER] ⏸️ ${player.username} penalty DEFERRED until ${opponent.username}'s timer expires`);
            return;
        }

        // Check if opponent reconnected during this player's grace period
        const opponentStillActive = opponent && (opponent.onPage || opponent.submitted);
        
        if (opponentStillActive) {
            // ✅ SINGLE ABANDONMENT: Only this player abandoned
            console.log(`[ABANDON TRACKER] 🎯 SINGLE ABANDON: ${player.username} left, ${opponent.username} still active`);
            
            // Mark as abandoned
            this.abandonedPlayers.set(player.userId, {
                matchId,
                abandonedAt: Date.now(),
                penaltyApplied: true,
                username: player.username
            });
            
            // Apply penalty immediately
            await this._applyAbandonmentPenalty(match, player, opponent);
            
            // Clean up this player's slot
            if (player.socketId) {
                this.socketToMatch.delete(player.socketId);
            }
            this.userToMatch.delete(player.userId);
            match[playerSlot] = null;
            
            console.log(`[ABANDON TRACKER] ✅ Penalty applied to ${player.username}, bonus to ${opponent.username}`);
            return;
        }

        // Check if we're completing a waiting state (opponent's timer also expired)
        const waitingState = this.waitingTimers.get(matchId);
        if (waitingState && waitingState.waitingForOpponent === playerSlot) {
            // ✅ BOTH TIMERS EXPIRED: Apply penalties to BOTH players
            console.log(`[ABANDON TRACKER] 💥 BOTH ABANDONED: Both timers expired for match ${matchId}`);
            
            // Mark this player as abandoned
            this.abandonedPlayers.set(player.userId, {
                matchId,
                abandonedAt: Date.now(),
                penaltyApplied: true,
                username: player.username
            });
            
            // The first player should already be marked, update their status
            const firstPlayerSlot = waitingState.playerSlot;
            const firstPlayer = match[firstPlayerSlot];
            if (firstPlayer) {
                const firstAbandonment = this.abandonedPlayers.get(firstPlayer.userId);
                if (firstAbandonment) {
                    firstAbandonment.penaltyApplied = true;
                }
                
                // Apply penalty to first player (NO BONUS - both abandoned)
                console.log(`[ABANDON TRACKER] ⚖️ Applying deferred penalty to ${firstPlayer.username}`);
                await this._applyAbandonmentPenalty(match, firstPlayer, null); // null opponent = no bonus
            }
            
            // Apply penalty to second player (NO BONUS - both abandoned)
            console.log(`[ABANDON TRACKER] ⚖️ Applying penalty to ${player.username}`);
            await this._applyAbandonmentPenalty(match, player, null); // null opponent = no bonus
            
            // Clean up
            this.waitingTimers.delete(matchId);
            this._cleanupMatch(matchId);
            
            console.log(`[ABANDON TRACKER] 🏁 Both penalties applied - match ${matchId} ended`);
            return;
        }

        // Edge case: Opponent doesn't exist or already left
        // This can happen if opponent never loaded onboarding or if there's a state mismatch
        console.log(`[ABANDON TRACKER] ⚠️ Edge case: ${player.username} abandoned, opponent state unclear`);
        console.log(`[ABANDON TRACKER] ⚠️ This means opponent checks failed - opponent may not be properly tracked`);
        
        this.abandonedPlayers.set(player.userId, {
            matchId,
            abandonedAt: Date.now(),
            penaltyApplied: true,
            username: player.username
        });
        
        // ✅ FIX: Even in edge case, check if opponent exists and try to notify
        if (opponent) {
            console.log(`[ABANDON TRACKER] ✅ Opponent exists (${opponent.username}) - treating as single abandon with notification`);
            await this._applyAbandonmentPenalty(match, player, opponent); // Pass opponent for notification
        } else {
            console.log(`[ABANDON TRACKER] ❌ No opponent found - applying penalty without opponent bonus`);
            await this._applyAbandonmentPenalty(match, player, null); // null = no opponent
        }
        
        if (player.socketId) {
            this.socketToMatch.delete(player.socketId);
        }
        this.userToMatch.delete(player.userId);
        match[playerSlot] = null;
    }

    /**
     * Manually clean up a match (called when match finishes)
     */
    cleanupMatch(matchId) {
        this._cleanupMatch(matchId);
    }

    /**
     * Private: Clean up match and socket mappings
     */
    _cleanupMatch(matchId) {
        const match = this.activeMatches.get(matchId);
        if (!match) return;

        console.log(`[ABANDON TRACKER] 🧹 Cleaning up match ${matchId}`);

        // Clear any pending disconnect timers
        if (match.player1?.disconnectTimer) {
            clearTimeout(match.player1.disconnectTimer);
        }
        if (match.player2?.disconnectTimer) {
            clearTimeout(match.player2.disconnectTimer);
        }

        // Remove socket mappings
        if (match.player1?.socketId) {
            this.socketToMatch.delete(match.player1.socketId);
        }
        if (match.player2?.socketId) {
            this.socketToMatch.delete(match.player2.socketId);
        }

        // Remove user mappings
        if (match.player1?.userId) {
            this.userToMatch.delete(match.player1.userId);
        }
        if (match.player2?.userId) {
            this.userToMatch.delete(match.player2.userId);
        }

        this.activeMatches.delete(matchId);
    }

    /**
     * Private: Apply abandonment penalty to database and notify players
     */
    async _applyAbandonmentPenalty(match, abandoner, opponent) {
        const { matchId, mode } = match;
        const { userId, username } = abandoner;

        try {
            console.log(`[ABANDON TRACKER] ============================================`);
            console.log(`[ABANDON TRACKER] Processing penalty for: ${username} (${userId})`);
            console.log(`[ABANDON TRACKER] Match: ${matchId}, Mode: ${mode}`);

            // Get current stats
            const [stats] = await this.db.query(
                'SELECT abandon_count, statistic_duel_point FROM statistic WHERE user_id = ?',
                [userId]
            );

            if (stats.length === 0) {
                console.error(`[ABANDON TRACKER] No stats found for user ${userId}`);
                return;
            }

            const currentStats = stats[0];
            const newAbandonCount = currentStats.abandon_count + 1;
            const dpPenalty = mode === 'ranked' ? -20 : 0;
            const newDP = Math.max(0, currentStats.statistic_duel_point + dpPenalty);
            const isBanned = newAbandonCount >= 3 ? 1 : 0;

            // Update abandoner stats
            await this.db.query(
                `UPDATE statistic 
                 SET abandon_count = ?, 
                     statistic_duel_point = ?, 
                     is_banned = ?,
                     last_abandon_at = NOW() 
                 WHERE user_id = ?`,
                [newAbandonCount, newDP, isBanned, userId]
            );

            console.log(`[ABANDON TRACKER] Updated ${username}: abandon_count=${newAbandonCount}, DP=${currentStats.statistic_duel_point}→${newDP}, banned=${isBanned}`);

            // Prepare notification message
            const notificationMessage = isBanned 
                ? `You abandoned the match and have been banned! (${newAbandonCount} abandonments)`
                : `You abandoned the match. Penalty: ${dpPenalty} DP (${newAbandonCount} abandonments)`;
            
            const notificationData = {
                message: notificationMessage,
                penaltyDP: dpPenalty,
                abandonCount: newAbandonCount,
                isBanned: isBanned,
                mode: mode,
                matchId: matchId,
                timestamp: Date.now()
            };

            // Check if player is currently online
            const playerOnline = this._isPlayerOnline(userId);
            console.log(`[ABANDON TRACKER] 🔍 Player ${username} online status: ${playerOnline}`);

            // Store notification in database
            const [insertResult] = await this.db.query(
                `INSERT INTO pending_abandonment_notifications 
                 (user_id, match_id, message, penalty_dp, abandon_count, is_banned, mode, shown_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, matchId, notificationMessage, dpPenalty, newAbandonCount, isBanned, mode, playerOnline ? new Date() : null]
            );
            
            const notificationId = insertResult.insertId;
            console.log(`[ABANDON TRACKER] 💾 Stored notification ${notificationId} for ${username} (shown_at: ${playerOnline ? 'NOW' : 'NULL'})`);

            // Send real-time notification if player is online
            if (playerOnline) {
                console.log(`[ABANDON TRACKER] 📨 Sending real-time notification to ${username}`);
                this._notifyAbandoner(userId, notificationData);
            } else {
                console.log(`[ABANDON TRACKER] 💤 Player offline - notification will show on reconnect`);
            }

            // Check if match already marked as abandoned (prevent duplicate updates)
            const [matchCheck] = await this.db.query(
                'SELECT status FROM duel_matches WHERE match_id = ?',
                [matchId]
            );

            const matchAlreadyAbandoned = matchCheck.length > 0 && matchCheck[0].status === 'abandoned';
            
            if (!matchAlreadyAbandoned) {
                // Update match status (only first player to be processed)
                await this.db.query(
                    'UPDATE duel_matches SET status = ? WHERE match_id = ?',
                    ['abandoned', matchId]
                );
                console.log(`[ABANDON TRACKER] ✅ Match ${matchId} marked as abandoned`);
            } else {
                console.log(`[ABANDON TRACKER] ℹ️ Match ${matchId} already marked as abandoned by first player`);
            }

            // Handle opponent reward (if opponent didn't also abandon)
            let opponentBonus = 0;
            
            // If opponent is null, it means both abandoned (called with null opponent)
            if (!opponent) {
                console.log(`[ABANDON TRACKER] 💥 Both players abandoned - no opponent bonus`);
            } else {
                // ✅ ALWAYS award bonus and notify opponent if they exist
                // Don't check onPage - opponent might be on Result page or Duel page
                
                console.log(`[ABANDON TRACKER] 🎯 Opponent exists: ${opponent.username} (userId: ${opponent.userId})`);
                console.log(`[ABANDON TRACKER] 🔍 Opponent status: onPage=${opponent.onPage}, submitted=${opponent.submitted}, hasDisconnectTimer=${!!opponent.disconnectTimer}`);
                
                // Award bonus only for ranked mode
                if (mode === 'ranked') {
                    opponentBonus = 10;

                    await this.db.query(
                        'UPDATE statistic SET statistic_duel_point = statistic_duel_point + ? WHERE user_id = ?',
                        [opponentBonus, opponent.userId]
                    );

                    console.log(`[ABANDON TRACKER] 💰 Awarded ${opponentBonus} DP to ${opponent.username}`);
                }

                // ALWAYS notify opponent regardless of mode or page location
                const opponentMessage = mode === 'ranked' && opponentBonus > 0
                    ? `${username} abandoned the match. You received +${opponentBonus} DP!`
                    : `${username} abandoned the match. You win by forfeit!`;
                
                console.log(`[ABANDON TRACKER] 📢 Notifying opponent ${opponent.username} about abandonment`);
                await this._notifyOpponent(opponent.userId, {
                    message: opponentMessage,
                    opponentUsername: username, // The abandoner is the opponent from their perspective
                    bonusDP: opponentBonus,
                    mode: mode,
                    matchId: matchId,
                    timestamp: Date.now()
                });
                
                console.log(`[ABANDON TRACKER] ✅ Penalty applied to ${username}, bonus to ${opponent.username}`);
            }

            console.log(`[ABANDON TRACKER] ============================================`);

        } catch (err) {
            console.error('[ABANDON TRACKER] Error applying penalty:', err);
        }
    }

    /**
     * Private: Check if a player is currently online (has active sockets)
     */
    _isPlayerOnline(userId) {
        if (!this.activeSessions) {
            // Fallback: check sockets manually
            let hasSocket = false;
            this.io.sockets.sockets.forEach((socket) => {
                if (socket.user && socket.user.id === userId) {
                    hasSocket = true;
                }
            });
            return hasSocket;
        }
        // Use activeSessions Map for accurate check
        return this.activeSessions.has(userId) && this.activeSessions.get(userId).size > 0;
    }

    /**
     * Private: Notify abandoner about their penalty
     */
    _notifyAbandoner(abandonerUserId, notificationData) {
        this.io.sockets.sockets.forEach((socket) => {
            if (socket.user && socket.user.id === abandonerUserId) {
                console.log(`[ABANDON TRACKER] 📢 Notifying abandoner on socket ${socket.id}`);
                socket.emit('abandonment_penalty', notificationData);
            }
        });
    }

    /**
     * Private: Notify opponent about abandonment
     */
    async _notifyOpponent(opponentUserId, notificationData) {
        // Check if opponent is online (has active sockets)
        const opponentOnline = this._isPlayerOnline(opponentUserId);
        
        console.log(`[ABANDON TRACKER] 🔍 Opponent ${opponentUserId} online status: ${opponentOnline}`);
        
        // Try to notify all active sockets for opponent (if online)
        let notificationSent = false;
        if (opponentOnline) {
            this.io.sockets.sockets.forEach((socket) => {
                if (socket.user && socket.user.id === opponentUserId) {
                    console.log(`[ABANDON TRACKER] 📢 Sending immediate notification to socket ${socket.id}`);
                    socket.emit('opponent_abandoned', notificationData);
                    notificationSent = true;
                }
            });
        }
        
        // ALWAYS store in database with shown_at based on online status
        // - If sent immediately: shown_at = NOW (will show once)
        // - If offline: shown_at = NULL (will show on next login)
        try {
            const shownAt = (opponentOnline && notificationSent) ? new Date() : null;
            
            if (shownAt) {
                console.log(`[ABANDON TRACKER] ✅ Notification sent immediately - storing with shown_at=NOW`);
            } else {
                console.log(`[ABANDON TRACKER] 💾 Opponent offline - storing notification for later (shown_at=NULL)`);
            }
            
            const [result] = await this.db.query(
                `INSERT INTO pending_abandonment_notifications 
                 (user_id, match_id, message, bonus_dp, notification_type, opponent_username, mode, shown_at) 
                 VALUES (?, ?, ?, ?, 'opponent_abandon', ?, ?, ?)`,
                [
                    opponentUserId, 
                    notificationData.matchId, 
                    notificationData.message,
                    notificationData.bonusDP || 0,
                    notificationData.opponentUsername || 'Unknown',
                    notificationData.mode || 'casual',
                    shownAt
                ]
            );
            
            console.log(`[ABANDON TRACKER] 💾 Stored opponent notification ID ${result.insertId} (shown: ${shownAt ? 'YES' : 'NO'})`);
        } catch (err) {
            console.error('[ABANDON TRACKER] ❌ Error storing opponent notification:', err);
            console.error('[ABANDON TRACKER] ❌ Error details:', err.message);
            console.error('[ABANDON TRACKER] ❌ Notification data:', JSON.stringify(notificationData));
        }
    }

    /**
     * Get debug info about active matches
     */
    getDebugInfo() {
        const info = [];
        for (const [matchId, match] of this.activeMatches.entries()) {
            info.push({
                matchId,
                mode: match.mode,
                player1: match.player1 ? {
                    username: match.player1.username,
                    submitted: match.player1.submitted,
                    onPage: match.player1.onPage
                } : null,
                player2: match.player2 ? {
                    username: match.player2.username,
                    submitted: match.player2.submitted,
                    onPage: match.player2.onPage
                } : null
            });
        }
        return info;
    }

    /**
     * Check for and retrieve pending abandonment notifications for a user
     * Called when user reconnects/authenticates
     * Returns array of pending notifications (both penalties and opponent abandons)
     */
    async getPendingNotifications(userId) {
        try {
            const [notifications] = await this.db.query(
                `SELECT notification_id, match_id, message, penalty_dp, bonus_dp, abandon_count, 
                        is_banned, notification_type, opponent_username, mode, created_at 
                 FROM pending_abandonment_notifications 
                 WHERE user_id = ? AND shown_at IS NULL 
                 ORDER BY created_at ASC`,
                [userId]
            );
            
            if (notifications.length > 0) {
                console.log(`[ABANDON TRACKER] 📬 Found ${notifications.length} pending notification(s) for user ${userId}`);
            }
            
            return notifications;
        } catch (err) {
            console.error('[ABANDON TRACKER] Error fetching pending notifications:', err);
            return [];
        }
    }

    /**
     * Mark notification as shown
     */
    async markNotificationShown(notificationId) {
        try {
            await this.db.query(
                'UPDATE pending_abandonment_notifications SET shown_at = NOW() WHERE notification_id = ?',
                [notificationId]
            );
            console.log(`[ABANDON TRACKER] ✅ Marked notification ${notificationId} as shown`);
        } catch (err) {
            console.error('[ABANDON TRACKER] Error marking notification shown:', err);
        }
    }
}

module.exports = { AbandonmentTracker };
