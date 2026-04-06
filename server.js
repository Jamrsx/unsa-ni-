// NOTE: always re-rerun server 'node server.js' if there is single change there... trust me i been there (i know... i been there alot...)
require('dotenv').config();
// Provide sensible defaults for local development when env vars are missing
process.env.JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASS = process.env.DB_PASS || '';
process.env.DB_NAME = process.env.DB_NAME || 'duelcode_capstone_project';
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');
const { registerFacultyHttp } = require('./src/js/faculty-dashboard');
const problemsRouter = require('./src/js/routes/problems.js');

const fs = require('fs');
const { execFile } = require('child_process');

// SANDBOX for code execution - top-level so all socket handlers can access it
const SANDBOX = path.join(__dirname, 'sandbox');
if (!fs.existsSync(SANDBOX)) fs.mkdirSync(SANDBOX);

// Detect Python executable at startup.
// On Windows, "python" may be a Microsoft Store alias - find the real one.
let PYTHON_CMD = null;
(function detectPython() {
    const { spawnSync } = require('child_process');
    for (const c of ['python', 'python3', 'py']) {
        try {
            const r = spawnSync(c, ['--version'], { timeout: 3000, windowsHide: true });
            const v = ((r.stdout || '') + (r.stderr || '')).toString().trim();
            if (v.toLowerCase().startsWith('python') && r.status === 0) {
                PYTHON_CMD = c;
                console.log('[PYTHON] Resolved command:', c, '(' + v + ')');
                return;
            }
        } catch (_) {}
    }
    // Last resort: try common Windows install paths
    const winPaths = [
        'C:\\Python312\\python.exe', 'C:\\Python311\\python.exe',
        'C:\\Python310\\python.exe', 'C:\\Python39\\python.exe',
        'C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Python\\Python312\\python.exe'
    ];
    for (const p of winPaths) {
        try {
            const r = require('child_process').spawnSync(p, ['--version'], { timeout: 2000, windowsHide: true });
            if (r.status === 0) { PYTHON_CMD = p; console.log('[PYTHON] Resolved path:', p); return; }
        } catch (_) {}
    }
    console.warn('[WARN] Python not found. Python submissions will fail. Install Python and add to PATH.');
})();

const app = express();
const server = http.createServer(app);

// dont use import since there is require for ES module
const { dashboardAdminAndUserSocket } = require("./src/js/conn/dashboard_admin_and_user_socket.js");
const { SigninAndSignupSocket } = require("./src/js/conn/signin_and_signup_socket.js");
const { AbandonmentTracker } = require("./src/js/conn/abandonment_tracker.js");
const { soloSocket } = require("./src/js/conn/solo.js");
// header-specific lightweight socket handlers (e.g., role lookup for header/profile)
const registerHeaderSocket = require("./src/js/conn/header_socket.js");
const registerPublicContentSocket = require("./src/js/conn/public_content_socket.js");
// ===== UTILITY MODULES (REFACTORED FROM server.js) =====
const { calculateDuelPointsChange, calculateCodePoints, calculateLevel } = require("./utils/pointsCalculator.js");
const { isCodeSafe, sanitizeInput, isValidMatchId, isValidUserId } = require("./utils/security.js");
const { parseDuration, calculateTimeBonus, formatDuration, getRemainingTime, isTimeExpired } = require("./utils/timeUtils.js");
const { determineWinner, calculateMatchScores, createMatchResult, mapScoresToDatabasePlayers } = require("./utils/matchScoring.js");
const matchResultsUtil = require("./utils/matchResults.js");
const lobbyState = require("./utils/lobbyState.js");
const lobbyBroadcast = require("./utils/lobbyBroadcast.js");
const { isValidMode, isValidLanguage, isValidRoomCode, isValidUsername, isValidEmail, validatePassword, isValidProblemId, isValidMaxPlayers, validateTestCases, sanitizeForDisplay, isValidLobbyPassword, isValidPlayerRole } = require("./utils/validation.js");
// ===== DATABASE MODULES (REFACTORED FROM server.js) =====
const { getXPForLevel, getTotalXPForLevel, getLevelFromXP, updatePlayerStats, getPlayerStats, applyAbandonmentPenalty, awardOpponentBonus, checkBanStatus } = require("./database/statsOperations.js");
const { createMatch, getMatchById, getMatchTimer, updateMatchStatus, updateMatchResult, getMatchWithPlayers, getUserMatchHistory, isMatchAbandoned, getMatchParticipants, selectRandomProblem } = require("./database/matchOperations.js");
const { generateRoomCode: generateLobbyRoomCode, createLobby, getLobbyById, getLobbyByRoomCode, getPublicLobbies, updateLobbyStatus, addPlayerToLobby, removePlayerFromLobby, getLobbyPlayers, updateHostSpectatorMode, updatePlayerRole, isLobbyFull } = require("./database/lobbyOperations.js");
// separated dashboard socket modules (register from server)
const registerAdminSocketHandlers = require("./src/js/conn/socket/dashboard-admin-socket");
const registerUserSocketHandlers = require("./src/js/conn/socket/dashboard-user-socket");
const registerFacultySocketHandlers = require("./src/js/conn/socket/dashboard-faculty-socket");
const registerCreateQuestionModalHandlers = require("./src/js/conn/create_question_modal_socket");
// ===== AUTH HELPERS =====
const auth = require("./utils/authHelpers.js");
// -----------------------------
// ENABLE CORS for Vue (IMPORTANT!)
// -----------------------------
// Configure allowed origins. You can set a comma-separated list in ALLOWED_ORIGINS env var.
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') :
    ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

function corsOriginHandler(origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // allow explicit configured origins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // allow localhost dev ports matching 517x (helpful when vite uses another port)
    try {
        const m = origin.match(/^https?:\/\/localhost:(\d+)$/);
        if (m) {
            const port = parseInt(m[1], 10);
            if (port >= 5170 && port <= 5180) return callback(null, true);
        }
    } catch (e) {
        // fallthrough to reject
    }

    return callback(new Error('Not allowed by CORS'));
}

app.use(cors({
    origin: corsOriginHandler,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    // allowedheaders for auth.js
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));



app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Diagnostic: log incoming socket.io HTTP requests (XHR polling handshakes)
app.use((req, res, next) => {
    try {
        if (req.url && req.url.startsWith('/socket.io')) {
            console.log('[HTTP] socket.io request', req.method, req.url, 'origin=', req.headers && req.headers.origin);
        }
    } catch (e) {}
    next();
});

const io = new Server(server, {
    // increase buffer size to allow large base64 image uploads over socket
    maxHttpBufferSize: 1e8, // ~100MB
    cors: {
        origin: (origin, callback) => {
            // reuse same logic as express cors
            corsOriginHandler(origin, (err, allow) => {
                if (err) return callback(err);
                callback(null, allow);
            });
        },
        methods: ["GET", "POST", "DELETE", "OPTIONS"],
        credentials: true
    }
});

// === DEBUG: Verbose engine.io / socket logging to diagnose handshake/transport errors ===
try {
    if (io && io.engine && typeof io.engine.on === 'function') {
        io.engine.on('connection', (engineSocket) => {
            try {
                console.log('[ENGINE] engine.io connection id=', engineSocket.id, 'transport=', engineSocket.transport && engineSocket.transport.name);
                engineSocket.on('packet', (packet) => {
                    try {
                        const dataPreview = (typeof packet?.data === 'string') ? packet.data.slice(0, 200) : JSON.stringify(packet?.data || {}).slice(0,200);
                        console.log('[ENGINE PACKET]', engineSocket.id, 'type=', packet && packet.type, 'data=', dataPreview);
                    } catch (e) { console.warn('[ENGINE PACKET] preview error', e && e.message); }
                });
                engineSocket.on('upgrade', () => console.log('[ENGINE] transport upgrade requested for', engineSocket.id));
                engineSocket.on('close', (reason) => console.log('[ENGINE] close', engineSocket.id, reason));
                engineSocket.on('error', (err) => console.error('[ENGINE] error', engineSocket.id, err && err.message ? err.message : err));
            } catch (e) { console.warn('[ENGINE] connection handler error', e && e.message); }
        });
    }
} catch (e) { console.warn('[DEBUG] failed to attach engine listeners', e && e.message); }

// socket-level connection logging
try {
    io.on('connection', (socket) => {
        try {
            console.log('[SOCKET DEBUG] connected', socket.id, 'handshake=', JSON.stringify(socket.handshake).slice(0,500));
            if (socket.conn) {
                socket.conn.on('error', (err) => console.error('[SOCKET CONN ERROR]', socket.id, err && err.message ? err.message : err));
                socket.conn.on('close', (reason) => console.log('[SOCKET CONN CLOSE]', socket.id, reason));
                socket.conn.on('upgrade', (req) => console.log('[SOCKET CONN UPGRADE]', socket.id));
            }
        } catch (e) { console.warn('[SOCKET DEBUG] handler error', e && e.message); }
    });
} catch (e) { console.warn('[DEBUG] failed to attach socket debug listeners', e && e.message); }

// Verbose: log every incoming socket event name and basic handshake info for debugging
try {
    io.on('connection', (socket) => {
        try {
            socket.onAny((event, ...args) => {
                try {
                    const h = socket.handshake || {};
                    const authInfo = (h.auth && (h.auth.token || h.auth.userId)) || (h.query && (h.query.token || h.query.userId)) || null;
                    console.log(`[SOCKET-EVENT] socket=${socket.id} event=${event} auth=${authInfo ? '[present]' : '[none]'} argsPreview=${JSON.stringify(args && args[0] ? (typeof args[0] === 'object' ? Object.keys(args[0]).slice(0,5) : args[0]) : '').slice(0,200)}`);
                } catch (e) { /* ignore */ }
            });
        } catch (e) { console.warn('[SOCKET-EVENT] attach error', e && e.message); }
    });
} catch (e) { console.warn('[SOCKET-EVENT] global attach failed', e && e.message); }

console.log("hello from node.js");

// Database connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// If debugging in read-only mode, wrap the pool to prevent accidental writes
if (process.env.DEBUG_READ_ONLY === 'true') {
    try {
        const { wrapDbReadOnly } = require('./src/js/db_guard');
        const guarded = wrapDbReadOnly(db);
        // replace db reference with guarded wrapper
        global.__DEBUG_DB_GUARDED__ = true;
        console.log('[DB GUARD] DEBUG_READ_ONLY enabled — non-SELECT queries will be blocked');
        // assign to db variable name in this module
        // note: other modules that already hold the original pool must require this file after server.js initialization
        db.query = guarded.query.bind(guarded);
        db.execute = guarded.execute ? guarded.execute.bind(guarded) : db.execute;
        db.getConnection = guarded.getConnection.bind(guarded);
    } catch (e) {
        console.error('[DB GUARD] Failed to enable read-only guard:', e);
    }
}

// -------------------
//
// -------------------

// -------------------
//
// -------------------

// -----------------------------
// API endpoint for chat message (shown in sample file webSocketSample.html)
// -----------------------------
app.post('/api/message', (req, res) => {
    const { message, clientId } = req.body;

    // broadcast to all connected clients
    io.emit('message', { text: message, clientId });

    res.json({ status: "ok" });
});

// -----------------------------
// Problems REST API
// -----------------------------
app.use('/api/problems', problemsRouter(db, process.env.JWT_SECRET));

// -----------------------------
// Token verification route
// Checks both JWT validity and active session in database
// -----------------------------
// jwt conn  - step 4/5
app.post('/verify-token', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.warn(`[API] /verify-token: No Authorization header received.`);
        return res.json({ success: false });
    }

    const parts = authHeader.split(' ');
    const token = parts.length > 1 ? parts[1] : parts[0];
    
    if (!token) {
        console.warn(`[API] /verify-token: Header present but token empty.`);
        return res.json({ success: false });
    }

    console.log(`[API] /verify-token INLINE: token length=${token.length}, preview=${token.slice(0, 30)}...`);

    try {
        // Step 1: Verify JWT signature
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(`[API] /verify-token: JWT valid for user=${decoded.username || decoded.email || decoded.id}`);
        } catch (jwtErr) {
            console.warn(`[API] /verify-token: JWT verification failed: ${jwtErr.message}`);
            return res.json({ success: false, message: 'Invalid token' });
        }

        // Step 2: Check if user has any active session (token validation is sufficient)
        const [rows] = await db.query(
            'SELECT session_id, user_id, expires_at FROM active_sessions WHERE user_id = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [decoded.id || decoded.user_id]
        );
        console.log(`[API] /verify-token: User ${decoded.id || decoded.user_id} has ${rows.length} active session(s)`);
        
        // If no active session, create one for this token
        if (rows.length === 0) {
            console.log(`[API] /verify-token: Creating new session for user ${decoded.id || decoded.user_id}`);
            await db.query(
                'INSERT INTO active_sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
                [decoded.id || decoded.user_id, token]
            );
        }

        console.log(`[API] /verify-token: SUCCESS for user ${decoded.username || decoded.id}`);
        res.json({ success: true, user: decoded });
    } catch (err) {
        console.error('[API] /verify-token error:', err);
        res.json({ success: false });
    }
});

// Logout route
// Remove session from database
// -----------------------------
app.post('/logout', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.json({ success: false });

    const token = authHeader.split(' ')[1];
    if (!token) return res.json({ success: false });

    try {
        await db.query('DELETE FROM active_sessions WHERE token = ?', [token]);
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        res.json({ success: false, message: 'Logout failed' });
    }
});

// Clean up expired sessions (run periodically)
// -----------------------------
setInterval(async () => {
    try {
        await db.query('DELETE FROM active_sessions WHERE expires_at < NOW()');
    } catch (err) {
        console.error('Error cleaning expired sessions:', err);
    }
}, 3600000); // Run every hour

// Register faculty HTTP routes via dedicated module to keep server.js slim
registerFacultyHttp({ app, db, bcrypt, jwt, helpers: { verifySession, verifyAdmin, hasPermission, getUserPrimaryRole, deriveCategory }, io });
// === Matchmaking queues (global) ===
const matchQueues = {
    casual: [],
    ranked: []
};
const matchPairs = new Map();
// Track socket-to-lobby/match mappings for all match types
const socketToMatch = {}; // socketId -> { lobbyId, mode, problemId, userId, username }
// In-memory store for per-match submission results (player1/player2)
const matchResults = new Map();
// Persist final results for clients that reconnect to result page
const finalResults = new Map();
// Cache match_id -> problem_id so reconnected sockets can still find the correct problem
const matchProblemCache = new Map();

// === Active user sessions (prevent multiple logins) ===
const activeSessions = new Map(); // userId -> Set of socket IDs

// Initialize notifications module at startup so HTTP admin endpoints are available
try {
    const setupNotifications = require('./src/js/notifications');
    if (!globalThis.notificationsInitialized) {
        setupNotifications({ app, db, io, activeSessions, jwtSecret: process.env.JWT_SECRET });
        globalThis.notificationsInitialized = true;
        console.log('[NOTIFICATIONS] ✅ Initialized at startup');
    }
} catch (e) {
    console.error('Failed to initialize notifications at startup', e);
}

// ADMIN: notify a user's connected sockets to refresh their permissions
// Usage: POST /admin/notify-permissions { target_user_id: <id> }
// Requires Authorization: Bearer <token> where token belongs to an admin user
app.post('/admin/notify-permissions', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ success: false, message: 'Missing Authorization header' });
        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'Invalid Authorization header' });

        // verify session and admin role
        const session = await verifySession(token);
        if (!session) return res.status(401).json({ success: false, message: 'Invalid session' });
        const isAdmin = await verifyAdmin(session);
        if (!isAdmin) return res.status(403).json({ success: false, message: 'Admin role required' });

        const { target_user_id } = req.body || {};
        if (!target_user_id) return res.status(400).json({ success: false, message: 'target_user_id required' });

        // compute effective permissions for target user using existing helper
        const permsHelper = require('./src/js/permissions-server.js');
        const updatedPerms = await permsHelper.getEffectivePermissions(target_user_id).catch((e) => {
            console.error('permissions helper error', e);
            return [];
        });

        // Emit `response_get_my_permissions` to all sockets belonging to the target user
        try {
            if (io && io.sockets && io.sockets.sockets) {
                for (const [sid, s] of io.sockets.sockets) {
                    try {
                        if (s.user && (s.user.userId === Number(target_user_id) || s.user.user_id === Number(target_user_id))) {
                            s.emit('response_get_my_permissions', { success: true, permissions: updatedPerms });
                        }
                    } catch (e) {
                        // ignore per-socket emit errors
                    }
                }
            }
        } catch (e) {
            console.error('Failed to emit permission update to sockets', e);
        }

        return res.json({ success: true, target_user_id, permissions_sent: (updatedPerms || []).length });
    } catch (err) {
        console.error('Error in /admin/notify-permissions', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ADMIN: Ban user HTTP endpoint (delegates to `src/js/admin-ban.js`)
// NOTE: the actual ban behavior is intentionally disabled by default.
// To enable real DB updates, set environment variable `ENABLE_BAN=true` and
// ensure you reviewed and tested the implementation in `src/js/admin-ban.js`.
const { performBan } = require('./src/js/admin-ban');
app.post('/api/admin/ban-user', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ success: false, message: 'Missing Authorization header' });
        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'Invalid Authorization header' });

        const session = await verifySession(token);
        if (!session) return res.status(401).json({ success: false, message: 'Invalid session' });

        // Ensure caller has ban permission. Do NOT allow `verifyAdmin` to override
        // explicit user-level denies — explicit denies in `user_permissions` must always win.
        // Check explicit deny for admin.ban_users first — explicit denies must override broader role grants.
        try {
            const [denyRows] = await db.query(
                `SELECT 1 FROM permissions p JOIN user_permissions up2 ON up2.permission_id = p.permission_id
                 WHERE p.permission_name = ? AND up2.user_id = ? AND up2.is_granted = 0 LIMIT 1`,
                ['admin.ban_users', session.userId]
            );
            if (denyRows && denyRows.length > 0) {
                console.log('[ban-endpoint] explicit DENY present — rejecting ban attempt', { caller: session.userId });
                return res.status(403).json({ success: false, message: 'Forbidden: explicit deny for admin.ban_users' });
            }
        } catch (e) {
            console.error('[ban-endpoint] explicit deny check failed', e);
        }

        const allowed = await hasPermission(db, session.userId, 'admin.ban_users') || await hasPermission(db, session.userId, 'roles.manage');
        console.log('[ban-endpoint] attempt', { caller: session.userId, target: (req.body && (req.body.user_id || req.body.userId || req.body.id)), allowed: !!allowed });
        if (!allowed) return res.status(403).json({ success: false, message: 'Forbidden: admin.ban_users or roles.manage required' });

        const user_id = req.body && (req.body.user_id || req.body.userId || req.body.id);
        if (!user_id) return res.status(400).json({ success: false, message: 'user_id is required' });

        // For testing toasts: simulate success when caller is authorized, without performing DB writes.
        console.log('[ban-endpoint] authorized — simulating successful ban for user', user_id);
        return res.json({ success: true, user_id });
    } catch (err) {
        console.error('Error in /api/admin/ban-user', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ADMIN: Impersonate user (create short-lived session token for target user)
// Guards: honors explicit user-level denies for 'roles.impersonate' and requires
// either 'roles.impersonate' or 'roles.manage'. Inserts a short-lived token into
// `active_sessions` so the usual `verifySession` helper accepts it.
app.post('/admin/impersonate', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ success: false, message: 'Missing Authorization header' });
        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'Invalid Authorization header' });

        const session = await verifySession(token);
        if (!session) return res.status(401).json({ success: false, message: 'Invalid session' });

        const { target_user_id } = req.body || {};
        if (!target_user_id) return res.status(400).json({ success: false, message: 'target_user_id required' });

        // Explicit deny check: user-level deny must override broader grants
        try {
            const [denyRows] = await db.query(
                `SELECT 1 FROM permissions p JOIN user_permissions up2 ON up2.permission_id = p.permission_id
                 WHERE p.permission_name = ? AND up2.user_id = ? AND up2.is_granted = 0 LIMIT 1`,
                ['roles.impersonate', session.userId]
            );
            if (denyRows && denyRows.length > 0) {
                console.log('[impersonate] explicit DENY present — rejecting impersonation', { caller: session.userId });
                return res.status(403).json({ success: false, message: 'Forbidden: explicit deny for roles.impersonate' });
            }
        } catch (e) {
            console.error('[impersonate] explicit deny check failed', e);
        }

        const allowed = await hasPermission(db, session.userId, 'roles.impersonate') || await hasPermission(db, session.userId, 'roles.manage');
        if (!allowed) return res.status(403).json({ success: false, message: 'Forbidden: roles.impersonate or roles.manage required' });

        // Create short-lived JWT and insert into active_sessions so verifySession accepts it
        const jwtPayload = { userId: Number(target_user_id), impersonator: session.userId, is_impersonation: true };
        const newToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '5m' });

        try {
            await db.query('INSERT INTO active_sessions (token, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))', [newToken, Number(target_user_id)]);
        } catch (e) {
            console.error('[impersonate] failed to insert active_sessions row', e);
            return res.status(500).json({ success: false, message: 'Server error creating impersonation session' });
        }

        console.log('[impersonate] issued impersonation token', { actor: session.userId, target: target_user_id });
        return res.json({ success: true, token: newToken, expires_in_seconds: 300 });
    } catch (err) {
        console.error('Error in /admin/impersonate', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// === Abandonment / Ban constants ===
const ABANDON_PENALTY_DP = -50;  // DP penalty for abandoning a ranked match
const ABANDON_REWARD_DP  = 25;   // DP bonus awarded to the opponent who stayed
const BAN_THRESHOLD      = 3;    // Number of abandonments before a ban is applied

// === NEW: Clean Abandonment Tracker ===
let abandonmentTracker = null; // Initialized after io is ready

// === Lobby system ===
const activeLobbies = new Map(); // lobbyId -> { lobbyData, players: Map(userId -> playerData), sockets: Map(userId -> socketId) }
const lobbyRoomCodes = new Map(); // roomCode -> lobbyId for quick lookup
const leaderboardCache = new Map(); // lobbyId -> Map(userId -> leaderboardUpdate) for missed broadcasts

// =====================================================
// XP & POINTS & TIME CALCULATION FUNCTIONS
// =====================================================
// NOTE: All calculation functions have been moved to modules:
// - utils/pointsCalculator.js: calculateCodePoints, calculateDuelPointsChange, calculateLevel
// - database/statsOperations.js: getXPForLevel, getTotalXPForLevel, getLevelFromXP
// - utils/timeUtils.js: parseDuration, calculateTimeBonus, formatDuration, getRemainingTime, isTimeExpired
// - database/lobbyOperations.js: generateRoomCode (renamed to generateLobbyRoomCode in import)
// - utils/validation.js: All validation functions

// =====================================================
// LOBBY SYSTEM HELPER FUNCTIONS (KEPT IN SERVER.JS)
// =====================================================

// Generate unique 6-character room code (wrapper for module function)
function generateRoomCode() {
    return generateLobbyRoomCode(lobbyRoomCodes);
}

// Get lobby with all player details
// ===== LOBBY STATE MANAGEMENT (NOW IN MODULE) =====
// Wrapper for backward compatibility - calls lobbyState module
function getLobbyDetails(lobbyId) {
    const details = lobbyState.getLobbyDetails(lobbyId, activeLobbies);
    if (!details) return details;
    // Always include host_spectator_mode and host_username so clients can show the host even in spectator mode
    const lobby = activeLobbies.get(lobbyId);
    if (lobby) {
        details.host_spectator_mode = lobby.lobbyData.host_spectator_mode || false;
        // Try to get host username from players list or spectators
        if (!details.host_username) {
            // Check players
            const hostPlayer = lobby.players && lobby.players.get(lobby.lobbyData.host_user_id);
            if (hostPlayer) {
                details.host_username = hostPlayer.username;
            } else if (lobby.spectators) {
                // Host is in spectator mode - find their username from activeSessions->socket->user
                // We store it in lobbyData if available
                details.host_username = lobby.lobbyData.host_username || null;
            }
        }
    }
    return details;
}

// Broadcast lobby update to all players in lobby (NOW IN MODULE)
function broadcastLobbyUpdate(lobbyId, io) {
    lobbyBroadcast.broadcastLobbyUpdate(lobbyId, io, activeLobbies);
}

// Original implementation moved to utils/lobbyBroadcast.js
// Keeping wrapper for backward compatibility
function broadcastLobbyUpdate_OLD_IMPLEMENTATION(lobbyId, io) {
    const lobby = activeLobbies.get(lobbyId);
    if (!lobby) return;
    
    const lobbyDetails = lobbyState.getLobbyDetails(lobbyId, activeLobbies);
    
    // Emit to all players in the lobby
    lobby.sockets.forEach((socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
            socket.emit('lobby_updated', lobbyDetails);
        }
    });
}

// Handle onboarding abandonment penalty
async function handleAbandonmentPenalty(session, io, db) {
    const { userId, username, matchId, mode, opponentSocketId } = session;
    
    try {
        console.log(`[ABANDON] ============================================`);
        console.log(`[ABANDON] Processing penalty for ABANDONER: ${username} (userId: ${userId}), mode: ${mode}`);
        console.log(`[ABANDON] Match ID: ${matchId}`);
        
        // CRITICAL FIX: Check if match is already marked as abandoned (prevent double penalty)
        if (matchId) {
            const [matchCheck] = await db.query(
                'SELECT status FROM duel_matches WHERE match_id = ?',
                [matchId]
            );
            
            if (matchCheck.length > 0 && matchCheck[0].status === 'abandoned') {
                console.log(`[ABANDON] Match ${matchId} already marked as abandoned - skipping penalty for ${username}`);
                return; // Match already processed, don't double-penalize
            }
        }
        
        // Only apply DP penalty in ranked mode
        let dpPenalty = 0;
        if (mode === 'ranked') {
            dpPenalty = ABANDON_PENALTY_DP;
        }
        
        // Increment abandon_count and apply penalty
        const [currentStats] = await db.query(
            'SELECT abandon_count, statistic_duel_point FROM statistic WHERE user_id = ?',
            [userId]
        );
        
        if (currentStats.length === 0) {
            console.error(`[ABANDON] No stats found for user ${userId}`);
            return;
        }
        
        const newAbandonCount = currentStats[0].abandon_count + 1;
        const currentDP = currentStats[0].statistic_duel_point;
        // CRITICAL FIX: Prevent negative DP - minimum is 0
        const newDP = Math.max(0, currentDP + dpPenalty); // dpPenalty is negative, ensure >= 0
        const isBanned = newAbandonCount >= BAN_THRESHOLD ? 1 : 0;
        
        // Update database - abandoner stats
        console.log(`[ABANDON] ============================================`);
        console.log(`[ABANDON] APPLYING PENALTY TO ABANDONER`);
        console.log(`[ABANDON] userId: ${userId} (${username})`);
        console.log(`[ABANDON] Old DP: ${currentDP}, Penalty: ${dpPenalty}, New DP: ${newDP}`);
        console.log(`[ABANDON] ============================================`);
        
        await db.query(
            `UPDATE statistic 
             SET abandon_count = ?, 
                 statistic_duel_point = ?, 
                 is_banned = ?,
                 last_abandon_at = NOW() 
             WHERE user_id = ?`,
            [newAbandonCount, newDP, isBanned, userId]
        );
        
        if (newDP === 0 && currentDP > 0) {
            console.log(`[ABANDON] ${username}: DP hit floor - ${currentDP}→0 (prevented negative DP)`);
        } else {
            console.log(`[ABANDON] Updated ${username}: abandon_count=${newAbandonCount}, DP=${currentDP}→${newDP}, banned=${isBanned}`);
        }
        
        // Get opponent info from match
        let opponentUserId = null;
        let opponentUsername = 'Opponent';
        
        if (matchId) {
            const [matchInfo] = await db.query(
                `SELECT 
                    dm.player1_id, 
                    dm.player2_id,
                    u1.username as player1_username,
                    u2.username as player2_username
                 FROM duel_matches dm
                 LEFT JOIN users u1 ON dm.player1_id = u1.user_id
                 LEFT JOIN users u2 ON dm.player2_id = u2.user_id
                 WHERE dm.match_id = ?`,
                [matchId]
            );
            
            if (matchInfo.length > 0) {
                const match = matchInfo[0];
                console.log(`[ABANDON] ============================================`);
                console.log(`[ABANDON] MATCH RECORD: player1_id=${match.player1_id}, player2_id=${match.player2_id}`);
                console.log(`[ABANDON] ABANDONER userId: ${userId}`);
                console.log(`[ABANDON] Checking: Is ${userId} === ${match.player1_id}?`);
                
                // Determine which player is the opponent
                if (match.player1_id === userId) {
                    opponentUserId = match.player2_id;
                    opponentUsername = match.player2_username || 'Opponent';
                    console.log(`[ABANDON] ✓ YES - Abandoner is player1, so opponent is player2_id: ${opponentUserId}`);
                } else {
                    opponentUserId = match.player1_id;
                    opponentUsername = match.player1_username || 'Opponent';
                    console.log(`[ABANDON] ✗ NO - Abandoner is player2, so opponent is player1_id: ${opponentUserId}`);
                }
                console.log(`[ABANDON] ============================================`);
                
                console.log(`[ABANDON] Identified opponent: ${opponentUsername} (${opponentUserId})`);
            }
            
            // Update match status to abandoned
            await db.query(
                `UPDATE duel_matches 
                 SET status = 'abandoned'
                 WHERE match_id = ?`,
                [matchId]
            );
            console.log(`[ABANDON] Updated match ${matchId} status to 'abandoned'`);
        }
        
        // Award opponent bonus DP and update their stats
        let opponentBonusDP = 0;
        if (mode === 'ranked' && opponentUserId) {
            opponentBonusDP = ABANDON_REWARD_DP;
            console.log(`[ABANDON DEBUG] Initial opponentBonusDP set to ${opponentBonusDP} for ${opponentUsername} (${opponentUserId})`);
            
            try {
                // CRITICAL FIX: Check if opponent also abandoned recently (prevent double bonus)
                const [opponentAbandonCheck] = await db.query(
                    'SELECT last_abandon_at FROM statistic WHERE user_id = ? AND last_abandon_at > NOW() - INTERVAL 30 SECOND',
                    [opponentUserId]
                );
                
                console.log(`[ABANDON DEBUG] Opponent abandon check - found ${opponentAbandonCheck.length} recent abandonments`);
                
                if (opponentAbandonCheck.length > 0) {
                    console.log(`[ABANDON] Opponent ${opponentUsername} also abandoned recently - no bonus awarded`);
                    opponentBonusDP = 0;
                } else {
                    // Check if opponent has a statistic record
                    const [opponentStats] = await db.query(
                        'SELECT statistic_duel_point FROM statistic WHERE user_id = ?',
                        [opponentUserId]
                    );
                    
                    if (opponentStats.length > 0) {
                        // Update opponent's DP
                        console.log(`[ABANDON] ============================================`);
                        console.log(`[ABANDON] APPLYING REWARD TO OPPONENT (STAYER)`);
                        console.log(`[ABANDON] opponentUserId: ${opponentUserId} (${opponentUsername})`);
                        console.log(`[ABANDON] Bonus DP: +${opponentBonusDP}`);
                        console.log(`[ABANDON] Query: UPDATE statistic SET statistic_duel_point = statistic_duel_point + ${opponentBonusDP} WHERE user_id = ${opponentUserId}`);
                        console.log(`[ABANDON] ============================================`);
                        
                        const [result] = await db.query(
                            'UPDATE statistic SET statistic_duel_point = statistic_duel_point + ? WHERE user_id = ?',
                            [opponentBonusDP, opponentUserId]
                        );
                        
                        if (result.affectedRows > 0) {
                            console.log(`[ABANDON] ✓ SUCCESS: Awarded ${opponentBonusDP} DP to ${opponentUsername} (${opponentUserId})`);
                        } else {
                            console.error(`[ABANDON] ✗ FAILED: UPDATE affected 0 rows for opponent ${opponentUserId}`);
                            opponentBonusDP = 0;
                        }
                    } else {
                        // Create statistic record for opponent if it doesn't exist
                        console.warn(`[ABANDON] Opponent ${opponentUserId} has no statistic record - creating one`);
                        await db.query(
                            'INSERT INTO statistic (user_id, statistic_level, statistic_level_xp, statistic_duel_point, abandon_count, is_banned) VALUES (?, 1, 0, ?, 0, 0)',
                            [opponentUserId, opponentBonusDP]
                        );
                        console.log(`[ABANDON] Created stats record and awarded ${opponentBonusDP} DP to ${opponentUsername}`);
                    }
                }
            } catch (dbError) {
                console.error(`[ABANDON] Error awarding DP to opponent ${opponentUserId}:`, dbError);
                opponentBonusDP = 0; // Don't show bonus if database operation failed
            }
        }
        
        // ==========================================================
        // IMMEDIATE NOTIFICATION: Send to ALL active opponent sockets
        // Works across ALL pages (Duel, Onboarding, Result, etc.)
        // BUT: Only if opponent didn't also abandon
        // ==========================================================
        const notificationData = {
            message: `${username} abandoned the match${mode === 'ranked' ? '. You received +' + opponentBonusDP + ' DP!' : '!'}`,
            abandonerName: username,
            bonusDP: opponentBonusDP,
            mode: mode,
            matchId: matchId,
            timestamp: Date.now()
        };
        
        // Only notify opponent if they didn't also abandon (opponentBonusDP > 0 means opponent stayed)
        console.log(`[ABANDON DEBUG] Notification check - opponentUserId: ${opponentUserId}, opponentBonusDP: ${opponentBonusDP}`);
        
        if (opponentUserId && opponentBonusDP > 0) {
            console.log(`[ABANDON DEBUG] Attempting to notify opponent ${opponentUsername}`);
            // Send to ALL active sockets for the opponent immediately
            if (activeSessions.has(opponentUserId)) {
                const opponentSockets = activeSessions.get(opponentUserId);
                let notifiedCount = 0;
                
                console.log(`[ABANDON DEBUG] Found ${opponentSockets.size} active sockets for ${opponentUsername}`);
                
                opponentSockets.forEach(socketId => {
                    const opponentSocket = io.sockets.sockets.get(socketId);
                    if (opponentSocket) {
                        console.log(`[ABANDON DEBUG] Emitting 'opponent_abandoned' to socket ${socketId}`);
                        opponentSocket.emit('opponent_abandoned', notificationData);
                        notifiedCount++;
                    }
                });
                
                if (notifiedCount > 0) {
                    console.log(`[ABANDON] Immediately notified ${opponentUsername} on ${notifiedCount} active socket(s)`);
                } else {
                    console.log(`[ABANDON] No active sockets for ${opponentUsername} - notification sent via tracker`);
                    // OLD: abandonmentNotifications.set(...) - now handled by tracker
                }
            } else {
                // Opponent not connected - notification handled by tracker
                console.log(`[ABANDON] ${opponentUsername} not online - will notify on reconnect`);
                // OLD: abandonmentNotifications.set(...) - now handled by tracker
            }
        } else if (opponentUserId && opponentBonusDP === 0) {
            console.log(`[ABANDON] NOT notifying ${opponentUsername} - they also abandoned (no bonus awarded)`);
        } else {
            console.log(`[ABANDON DEBUG] Skipping notification - opponentUserId: ${opponentUserId}, opponentBonusDP: ${opponentBonusDP}`);
        }
        
        // OLD: Store notification - now handled by tracker
        // abandonmentNotifications.set(userId, {...});
        
        // If user is now banned, they need to know on next login
        if (isBanned) {
            console.log(`[BAN] User ${username} (${userId}) has been BANNED after ${newAbandonCount} abandonments`);
        }
        
    } catch (err) {
        console.error('[ABANDON] Error applying penalty:', err);
    }
}

// Update player statistics in database (WRAPPER - actual logic in database/statsOperations.js)
// This wrapper maintains backward compatibility with existing code that calls updatePlayerStats(userId, ...)
async function updatePlayerStatsLocal(userId, codePoints, duelPointsChange, mode) {
    // Call the module function with db as first parameter
    return await updatePlayerStats(db, userId, codePoints, duelPointsChange, mode);
}

// Use the wrapper for backward compatibility
const updatePlayerStatsCompat = updatePlayerStatsLocal;

// -----------------------------
// Socket.IO logic
// -----------------------------

// socket.io logic
io.on('connection', async (socket) => {
    console.log('New client connected:', socket.id);

    // Initialize abandonment tracker on first connection
    if (!abandonmentTracker) {
        abandonmentTracker = new AbandonmentTracker(io, db, activeSessions);
        console.log('[ABANDON TRACKER] ✅ Initialized');
    }

    // Attempt to authenticate socket via handshake token (if provided)
    try {
        const hsToken = socket.handshake?.auth?.token || null;
        if (hsToken) {
            console.log('[HANDSHAKE] token received for socket', socket.id, 'token_preview=', (typeof hsToken === 'string') ? hsToken.slice(0,40) + '...' : typeof hsToken);
            jwt.verify(hsToken, process.env.JWT_SECRET, async (err, decoded) => {
                if (err) {
                    console.log('Socket handshake token invalid for', socket.id, 'err=', err && err.message);
                    socket.user = null;
                    return;
                }

                // verify session exists in DB and is not expired
                try {
                    console.log('[HANDSHAKE] verifying active_sessions for token (preview):', (typeof hsToken === 'string') ? hsToken.slice(0,40) + '...' : hsToken);
                    const [sessions] = await db.query('SELECT s.session_id, s.user_id, u.username FROM active_sessions s JOIN users u ON s.user_id = u.user_id WHERE s.token = ? AND s.expires_at > NOW()', [hsToken]);
                    console.log('[HANDSHAKE] active_sessions rows returned:', Array.isArray(sessions) ? sessions.length : typeof sessions);
                    if (sessions.length > 0) {
                        const userId = sessions[0].user_id;
                        const username = sessions[0].username;
                        
                        // SECURITY: Allow multiple sockets per user (for page navigation)
                        // but limit to prevent abuse (max 5 concurrent sockets)
                        const MAX_SOCKETS_PER_USER = 5;
                        
                        if (activeSessions.has(userId)) {
                            const existingSockets = activeSessions.get(userId);
                            console.log(`[SECURITY] User ${username} (${userId}) already has ${existingSockets.size} active socket(s)`);
                            
                            // Only disconnect if exceeding limit
                            if (existingSockets.size >= MAX_SOCKETS_PER_USER) {
                                console.log(`[SECURITY] User ${username} exceeded max sockets (${MAX_SOCKETS_PER_USER}). Disconnecting oldest socket...`);
                                
                                // Disconnect the oldest socket (first in the Set)
                                const oldestSocketId = existingSockets.values().next().value;
                                const oldSocket = io.sockets.sockets.get(oldestSocketId);
                                if (oldSocket && oldSocket.id !== socket.id) {
                                    // Mark as force disconnected to skip abandonment check
                                    oldSocket.forceDisconnected = true;
                                    
                                    // OLD: Abandonment tracking now handled by AbandonmentTracker
                                    // No need to cancel timers - tracker manages its own state
                                    
                                    oldSocket.emit('force_disconnect', { 
                                        reason: 'Too many active connections',
                                        message: 'Maximum concurrent sessions exceeded. Please close other tabs/windows.'
                                    });
                                    oldSocket.disconnect(true);
                                    existingSockets.delete(oldestSocketId);
                                    console.log(`[SECURITY] Disconnected oldest socket: ${oldestSocketId}`);
                                }
                            }
                        } else {
                            activeSessions.set(userId, new Set());
                        }
                        
                        // Register this new socket
                        activeSessions.get(userId).add(socket.id);
                        
                        socket.user = { id: userId, username: username, decoded };
                        console.log('Socket authenticated:', { socketId: socket.id, userId: userId, username: username, totalSockets: activeSessions.get(userId).size });
                        console.log('🔧 [SERVER DEBUG AUTH] 1. Socket authenticated successfully');
                        console.log('🔧 [SERVER DEBUG AUTH] 2. Socket ID:', socket.id);
                        console.log('🔧 [SERVER DEBUG AUTH] 3. User ID:', userId);
                        console.log('🔧 [SERVER DEBUG AUTH] 4. Username:', username);
                        
                        // Emit authentication success to client
                        console.log('🔧 [SERVER DEBUG AUTH] 5. Emitting authenticated event to client...');
                        socket.emit('authenticated', { 
                            userId: userId, 
                            username: username 
                        });
                        console.log('🔧 [SERVER DEBUG AUTH] 6. ✅ Authenticated event emitted');
                        
                        // ✅ CHECK FOR PENDING ABANDONMENT NOTIFICATIONS
                        // Only check on FIRST socket to prevent duplicate processing
                        // INCREASED DELAY: Wait longer to ensure page DOM is ready
                        if (abandonmentTracker && activeSessions.get(userId).size === 1) {
                            const pendingNotifications = await abandonmentTracker.getPendingNotifications(userId);
                            if (pendingNotifications.length > 0) {
                                console.log(`[AUTH] 📬 User ${username} has ${pendingNotifications.length} pending notification(s)`);
                                
                                // Wait 1.5 seconds to ensure page is fully loaded and DOM is ready
                                setTimeout(async () => {
                                    console.log(`[AUTH] ⏰ Sending pending notifications to ${username} after DOM ready delay`);
                                    
                                    // Get all user sockets for broadcasting
                                    const userSockets = activeSessions.get(userId);
                                    if (!userSockets) {
                                        console.log(`[AUTH] ⚠️ User ${username} disconnected before notifications could be sent`);
                                        return;
                                    }
                                    
                                    // Send each notification to ALL user sockets
                                    for (const notification of pendingNotifications) {
                                        const notificationData = notification.notification_type === 'opponent_abandon' ? {
                                            message: notification.message,
                                            bonusDP: notification.bonus_dp,
                                            opponentUsername: notification.opponent_username,
                                            mode: notification.mode,
                                            matchId: notification.match_id,
                                            timestamp: new Date(notification.created_at).getTime()
                                        } : {
                                            message: notification.message,
                                            penaltyDP: notification.penalty_dp,
                                            abandonCount: notification.abandon_count,
                                            isBanned: notification.is_banned === 1,
                                            mode: notification.mode,
                                            matchId: notification.match_id,
                                            timestamp: new Date(notification.created_at).getTime()
                                        };
                                        
                                        const eventName = notification.notification_type === 'opponent_abandon' ? 'opponent_abandoned' : 'abandonment_penalty';
                                        
                                        // Broadcast to all user's sockets
                                        for (const socketId of userSockets) {
                                            const userSocket = io.sockets.sockets.get(socketId);
                                            if (userSocket) {
                                                console.log(`[AUTH] 📤 Sending ${eventName} to socket ${socketId}`);
                                                userSocket.emit(eventName, notificationData);
                                            }
                                        }
                                        
                                        // Mark as shown (only once)
                                        await abandonmentTracker.markNotificationShown(notification.notification_id);
                                    }
                                }, 1500); // Increased from 0ms to 1500ms
                            }
                        }
                        
                    } else {
                        socket.user = null;
                        console.log('No active session for handshake token on socket', socket.id);
                    }
                } catch (e) {
                    console.error('Error checking active_sessions for handshake:', e);
                    socket.user = null;
                }
            });
        } else {
            socket.user = null;
        }
    } catch (e) {
        console.error('Error during socket handshake auth:', e);
        socket.user = null;
    }

    // ========================================
    // ✅ CHECK PENDING NOTIFICATIONS (manual check for already-connected sockets)
    // ========================================
    socket.on('check_pending_notifications', async () => {
        if (!socket.user || !socket.user.id) {
            console.log('[PENDING NOTIF] No user on socket for check');
            return;
        }
        
        const userId = socket.user.id;
        const username = socket.user.username || 'Unknown';
        
        console.log(`[PENDING NOTIF] Manual check requested by ${username}`);
        
        // Only process on the first socket to prevent duplicate notifications
        const userSockets = activeSessions.get(userId);
        if (!userSockets || userSockets.size === 0) {
            console.log(`[PENDING NOTIF] No active sockets for user ${username}`);
            return;
        }
        
        const firstSocket = Array.from(userSockets)[0];
        if (socket.id !== firstSocket) {
            console.log(`[PENDING NOTIF] Ignoring request from secondary socket ${socket.id}`);
            return;
        }
        
        if (abandonmentTracker) {
            const pendingNotifications = await abandonmentTracker.getPendingNotifications(userId);
            if (pendingNotifications.length > 0) {
                console.log(`[PENDING NOTIF] 📬 Found ${pendingNotifications.length} pending notification(s) for ${username}`);
                
                // Send each notification to ALL user sockets
                for (const notification of pendingNotifications) {
                    const notificationData = notification.notification_type === 'opponent_abandon' ? {
                        message: notification.message,
                        bonusDP: notification.bonus_dp,
                        opponentUsername: notification.opponent_username,
                        mode: notification.mode,
                        matchId: notification.match_id,
                        timestamp: new Date(notification.created_at).getTime()
                    } : {
                        message: notification.message,
                        penaltyDP: notification.penalty_dp,
                        abandonCount: notification.abandon_count,
                        isBanned: notification.is_banned === 1,
                        mode: notification.mode,
                        matchId: notification.match_id,
                        timestamp: new Date(notification.created_at).getTime()
                    };
                    
                    const eventName = notification.notification_type === 'opponent_abandon' ? 'opponent_abandoned' : 'abandonment_penalty';
                    
                    // Emit to all user's sockets
                    for (const socketId of userSockets) {
                        const userSocket = io.sockets.sockets.get(socketId);
                        if (userSocket) {
                            userSocket.emit(eventName, notificationData);
                        }
                    }
                    
                    // Mark as shown (only once)
                    await abandonmentTracker.markNotificationShown(notification.notification_id);
                }
            } else {
                console.log(`[PENDING NOTIF] No pending notifications for ${username}`);
            }
        }
    });

    // === view_user testdb ===
    socket.on('view_user', async () => {
        console.log('Hello');
        try {
            const [rows] = await db.query('SELECT * FROM users');
                if (rows.length === 0) {
                    socket.emit('test_response', {
                        success: false,
                        message: "No users found in database."
                    });
                } else {
                    socket.emit('test_response', {
                        success: true,
                        value: rows
                    });
                }
        }
        catch (err) {
            console.error(err);
            socket.emit('test_response', { success: false, message: 'Server error' });
        }
    });
    // === Chat socket support ===
    socket.on("message", (msg) => {
        io.emit("message", msg);
    });

    // AD-HOC CODE TESTING (for create-question modal)
    // Payload: { language: 'python'|'php'|'java', source_code: string, testCases: [{ input_data, expected_output }] }
    // Emits: 'response_test_source_code' with { success, verdict, passed, total, results }
    socket.on('request_test_source_code', async (payload) => {
        try {
            if (!payload || !payload.language || !payload.source_code || !Array.isArray(payload.testCases)) {
                socket.emit('response_test_source_code', { success: false, message: 'Invalid payload' });
                return;
            }
            const { language, source_code, testCases } = payload;

            if (!isCodeSafe(source_code, language)) {
                socket.emit('response_test_source_code', { success: false, message: 'Forbidden commands detected!' });
                return;
            }

            if (testCases.length === 0) {
                socket.emit('response_test_source_code', { success: false, message: 'No test cases provided' });
                return;
            }

            // Build temp file
            const safeId = `${Date.now()}_${socket.id.replace(/[^a-zA-Z0-9_-]/g,'')}`;
            let filename = path.join(SANDBOX, `${safeId}`);
            let className = null;

            if (language === 'python') {
                filename = filename + '.py';
                fs.writeFileSync(filename, source_code, 'utf8');
            } else if (language === 'php') {
                filename = filename + '.php';
                let phpCode = source_code.trim();
                if (!phpCode.startsWith('<?php')) phpCode = '<?php\n' + phpCode;
                fs.writeFileSync(filename, phpCode, 'utf8');
            } else if (language === 'java') {
                className = `Main${safeId}`;
                filename = path.join(SANDBOX, `${className}.java`);
                let javaCode = source_code.replace(/public\s+class\s+\w+/, `public class ${className}`);
                if (javaCode.includes('Scanner') && !javaCode.includes('import java.util.Scanner')) {
                    javaCode = 'import java.util.Scanner;\n' + javaCode;
                }
                fs.writeFileSync(filename, javaCode, 'utf8');
            } else {
                socket.emit('response_test_source_code', { success: false, message: 'Unsupported language' });
                return;
            }

            let passed = 0;
            const results = [];

            for (const tc of testCases) {
                // Support both field conventions: {input,expected} from frontend or {input_data,expected_output} from DB
                let inputData = (tc.input_data ?? tc.input ?? '').toString();
                let expected = (tc.expected_output ?? tc.expected ?? '').toString().trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').toLowerCase();
                let runRes = null;

                if (language === 'python') {
                    runRes = await runWithTimeout(PYTHON_CMD || 'python', [filename], inputData, 2000);
                    if (!runRes.success && runRes.error && runRes.error.includes('ENOENT')) {
                        runRes = await runWithTimeout('python3', [filename], inputData, 2000);
                    }
                } else if (language === 'php') {
                    runRes = await runWithTimeout('php', [filename], inputData, 2000);
                } else if (language === 'java') {
                    const compile = await runWithTimeout('javac', [filename], null, 5000);
                    if (!compile.success) {
                        runRes = { success: false, output: '', error: compile.error || 'Compilation failed' };
                    } else {
                        runRes = await runWithTimeout('java', ['-cp', SANDBOX, className], inputData, 2000);
                    }
                }

                let actualOutput = '';
                let rawError = null;
                if (runRes && runRes.success) {
                    actualOutput = (runRes.output || '').toString().trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                } else if (runRes && runRes.error) {
                    rawError = runRes.error;
                    console.log(`[RUN ERROR] lang=${language} error=${rawError}`);
                    actualOutput = '';
                } else {
                    rawError = 'Unknown execution error';
                    actualOutput = '';
                }

                const correct = actualOutput.toLowerCase() === expected;
                if (correct) passed++;

                results.push({ input: inputData, expected, output: actualOutput, passed: correct, raw_run_success: !!(runRes && runRes.success), raw_run_error: rawError });
            }

            const verdict = passed === testCases.length ? `Accepted (${passed}/${testCases.length})` : `Wrong Answer (${passed}/${testCases.length})`;
            socket.emit('response_test_source_code', { success: true, verdict, passed, total: testCases.length, results });

            // cleanup
            try { fs.unlinkSync(filename); } catch (e) {}
            if (language === 'java') {
                try {
                    const classFile = path.join(SANDBOX, `${className}.class`);
                    if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
                } catch (e) {}
            }

        } catch (err) {
            console.error('TEST ERROR:', err);
            socket.emit('response_test_source_code', { success: false, message: 'Execution failed' });
        }
    });

    // Register dashboard-related socket modules from server so they're available globally
    try {
        // register admin & user dashboard handlers (they expect helper functions)
        registerAdminSocketHandlers(socket, db, bcrypt, jwt, { verifySession, verifyAdmin, hasPermission, getUserPrimaryRole, deriveCategory });
        registerUserSocketHandlers(socket, db, bcrypt, jwt, { verifySession, verifyAdmin, hasPermission, getUserPrimaryRole, deriveCategory });
        registerFacultySocketHandlers(socket, db, bcrypt, jwt, { verifySession, verifyAdmin, hasPermission, getUserPrimaryRole, deriveCategory }, io);

        // register create-question modal handlers (used on Home, Solo, Dashboard)
        registerCreateQuestionModalHandlers(socket, db, bcrypt, jwt, { verifySession, verifyAdmin, hasPermission, getUserPrimaryRole, deriveCategory });
    } catch (e) {
        console.error('Error registering dashboard socket modules from server:', e);
    }
    // for user signup and signin + header logic
    SigninAndSignupSocket(socket, db, bcrypt, jwt);

    // header-only socket handlers (keep header concerns separated)
    try {
        registerHeaderSocket(socket, db, bcrypt, jwt);
    } catch (e) {
        console.error('Error registering header socket handlers:', e);
    }
    // Initialize notifications module close to header handlers for organization
    try {
        if (!globalThis.notificationsInitialized) {
            const setupNotifications = require('./src/js/notifications');
            setupNotifications({ app, db, io, activeSessions, jwtSecret: process.env.JWT_SECRET });
            globalThis.notificationsInitialized = true;
            console.log('[NOTIFICATIONS] ✅ Initialized (socket-adjacent)');
        }
    } catch (e) {
        console.error('Failed to initialize notifications module near registerHeaderSocket', e);
    }

    // public content handlers: blogs/events/home
    try {
        registerPublicContentSocket(socket, db, bcrypt, jwt);
    } catch (e) {
        console.error('Error registering public content socket handlers:', e);
    }

    // === for dashboard admin and user ===
    // pass `io` and `activeSessions` so handlers can emit notifications to specific users
    dashboardAdminAndUserSocket(socket, db, bcrypt, jwt, io, activeSessions, auth);

    // === for solo question selection ===
    soloSocket(socket, db, bcrypt, jwt);

    socket.on('queue_enter', async ({ mode, username, user_id }) => {
        console.log(`User ${username} entered ${mode} queue`);

        // SECURITY: Check if user is banned from matchmaking
        if (user_id) {
            try {
                const [banCheck] = await db.query(
                    'SELECT is_banned, abandon_count FROM statistic WHERE user_id = ?',
                    [user_id]
                );
                
                if (banCheck.length > 0 && banCheck[0].is_banned === 1) {
                    const abandonCount = banCheck[0].abandon_count;
                    console.log(`[BAN] User ${username} (${user_id}) is banned (${abandonCount} abandonments)`);
                    socket.emit('matchmaking_banned', {
                        message: `You have been banned from matchmaking due to ${abandonCount} match abandonments. Please contact support.`,
                        abandon_count: abandonCount
                    });
                    return;
                }
            } catch (err) {
                console.error('Error checking ban status:', err);
            }
        }

        // Check if player is already in queue
        const alreadyInQueue = matchQueues[mode].some(p => p.socket_id === socket.id);
        if (alreadyInQueue) {
            console.log(`User ${username} already in ${mode} queue`);
            return;
        }

        // Add user to queue
        const player = {
            socket_id: socket.id,
            socket: socket,
            username: username || 'Player',
            user_id: user_id || null
        };
        matchQueues[mode].push(player);

        console.log(`Queue ${mode} now has ${matchQueues[mode].length} players`);

        // Check if we have 2 players for a match
        if (matchQueues[mode].length >= 2) {
            const player1 = matchQueues[mode].shift();
            const player2 = matchQueues[mode].shift();

            // Validate both sockets are still connected before creating match
            if (!player1.socket.connected || !player2.socket.connected) {
                console.log('One or both players disconnected before match creation, skipping');
                // Put back the connected player if any
                if (player1.socket.connected) matchQueues[mode].unshift(player1);
                if (player2.socket.connected) matchQueues[mode].unshift(player2);
                return;
            }
            
            // SECURITY: Prevent self-matching (same user_id)
            if (player1.user_id && player2.user_id && player1.user_id === player2.user_id) {
                console.log(`[SECURITY] Prevented self-matching for user ${player1.username} (${player1.user_id})`);
                // Put player1 back in queue, skip player2 (it's the same user)
                matchQueues[mode].unshift(player1);
                player2.socket.emit('matchmaking_error', { 
                    message: 'Cannot match with yourself. Please use only one account at a time.' 
                });
                return;
            }

            // Double-check neither player is already in a match
            if (matchPairs.has(player1.socket_id) || matchPairs.has(player2.socket_id)) {
                console.log('One or both players already in a match, skipping');
                // Put back players not in a match
                if (!matchPairs.has(player1.socket_id)) matchQueues[mode].unshift(player1);
                if (!matchPairs.has(player2.socket_id)) matchQueues[mode].unshift(player2);
                return;
            }

            console.log(`Match found in ${mode}: ${player1.username} vs ${player2.username}`);

            // Record the match so we can handle cancellations. Store both players' IDs when available
            matchPairs.set(player1.socket_id, { 
                opponentId: player2.socket_id, 
                opponentUsername: player2.username, 
                mode, 
                player1Ready: false, 
                player2Ready: false,
                player1_id: player1.user_id || null,
                player2_id: player2.user_id || null
            });
            matchPairs.set(player2.socket_id, { 
                opponentId: player1.socket_id, 
                opponentUsername: player1.username, 
                mode, 
                player1Ready: false, 
                player2Ready: false,
                player1_id: player1.user_id || null,
                player2_id: player2.user_id || null
            });

            // Final validation before emitting match_found - ensure sockets are still connected
            if (!player1.socket.connected || !player2.socket.connected) {
                console.log('Socket disconnected after pair creation, cleaning up');
                matchPairs.delete(player1.socket_id);
                matchPairs.delete(player2.socket_id);
                if (player1.socket.connected) matchQueues[mode].unshift(player1);
                if (player2.socket.connected) matchQueues[mode].unshift(player2);
                return;
            }

            // Send match_found to both players. For each player send their own name first
            player1.socket.emit('match_found', {
                player1: player1.username,
                player2: player2.username,
                mode: mode
            });

            player2.socket.emit('match_found', {
                player1: player2.username,
                player2: player1.username,
                mode: mode
            });
        } else {
            // Notify waiting
            socket.emit('waiting_for_opponent', {
                mode: mode,
                queue_position: matchQueues[mode].length
            });
        }
    });

    // Player clicked Ready button
    socket.on('player_ready', ({ mode }) => {
        try {
            if (!matchPairs.has(socket.id)) {
                console.log('Player not in a match');
                return;
            }

            const pair = matchPairs.get(socket.id);
            const opponentId = pair.opponentId;
            
            // Mark this player as ready
            pair.player1Ready = true;

            // Also update opponent's pair entry with corresponding ready flag
            const opponentPair = matchPairs.get(opponentId);
            if (opponentPair) {
                // opponentPair.player1 is the opponent, and pair.player2 is the opponent
                // Set the opponent's player2Ready (since opponent sees themselves as player1)
                opponentPair.player2Ready = true;

                // Both ready if both player1Ready and player2Ready are true
                const bothReady = pair.player1Ready && pair.player2Ready;
                
                if (bothReady) {
                    // Both ready - create a duel_matches row and emit match_id to both players
                    console.log(`Both players ready in ${mode} match`);
                    (async () => {
                        try {
                            const p1 = pair.player1_id || null;
                            const p2 = pair.player2_id || null;
                            const status = 'in_progress';
                            
                            console.log(`[MATCH CREATION] ============================================`);
                            console.log(`[MATCH CREATION] Creating match record`);
                            console.log(`[MATCH CREATION] player1_id (p1): ${p1}`);
                            console.log(`[MATCH CREATION] player2_id (p2): ${p2}`);
                            console.log(`[MATCH CREATION] Status: ${status}`);
                            console.log(`[MATCH CREATION] ============================================`);
                            
                            // Select a random problem filtered by mode difficulty
                            // casual = Easy only, ranked = Medium or Hard
                            let problemQuery, problemParams;
                            if (mode === 'casual') {
                                problemQuery = "SELECT problem_id, difficulty FROM problems WHERE LOWER(difficulty) = 'easy' ORDER BY RAND() LIMIT 1";
                                problemParams = [];
                            } else if (mode === 'ranked') {
                                problemQuery = "SELECT problem_id, difficulty FROM problems WHERE LOWER(difficulty) IN ('medium', 'hard') ORDER BY RAND() LIMIT 1";
                                problemParams = [];
                            } else {
                                problemQuery = 'SELECT problem_id, difficulty FROM problems ORDER BY RAND() LIMIT 1';
                                problemParams = [];
                            }
                            const [problems] = await db.query(problemQuery, problemParams);
                            let matchDuration = 30; // Default 30 minutes
                            
                            if (problems && problems.length > 0) {
                                const problem = problems[0];
                                const difficulty = problem.difficulty?.toLowerCase() || 'medium';
                                
                                // Set duration based on difficulty
                                if (difficulty === 'easy') {
                                    matchDuration = 15; // 15 minutes for easy problems
                                } else if (difficulty === 'medium') {
                                    matchDuration = 30; // 30 minutes for medium problems
                                } else if (difficulty === 'hard') {
                                    matchDuration = 45; // 45 minutes for hard problems
                                }
                                
                                console.log(`[MATCH CREATION] Selected problem ${problem.problem_id} (${difficulty}) - Duration: ${matchDuration} minutes`);
                            }
                            
                            const matchStartTime = new Date();
                            const matchEndTime = new Date(Date.now() + matchDuration * 60 * 1000);
                            
                            const [insertRes] = await db.query(
                                `INSERT INTO duel_matches (
                                    player1_id, player2_id, winner_id, match_date, status,
                                    match_duration_minutes, match_started_at, match_end_time
                                ) VALUES (?, ?, NULL, NOW(), ?, ?, ?, ?)`,
                                [p1, p2, status, matchDuration, matchStartTime, matchEndTime]
                            );
                            const matchId = insertRes.insertId;
                            
                            console.log(`[MATCH CREATION] Match created with ID: ${matchId}, End Time: ${matchEndTime.toISOString()}`);

                            // record match_id in both in-memory pair entries
                            pair.match_id = matchId;
                            if (opponentPair) opponentPair.match_id = matchId;

                            // Store problem_id on pair so submit_code can use it
                            const _pairProbId = (problems && problems.length > 0) ? problems[0].problem_id : null;
                            pair.problem_id = _pairProbId;
                            if (opponentPair) opponentPair.problem_id = _pairProbId;
                            // Cache match_id -> problem_id so reconnected sockets can still resolve the correct problem
                            if (matchId && _pairProbId) matchProblemCache.set(matchId, _pairProbId);
                            // Also persist problem_id into the DB row so it survives server restarts
                            if (matchId && _pairProbId) {
                                db.query("UPDATE duel_matches SET problem_id = ? WHERE match_id = ?", [_pairProbId, matchId])
                                    .catch(e => console.warn("[MATCH CREATION] Could not store problem_id in DB (column may not exist):", e.message));
                            }

                            // resolve opponent socket once
                            const opponentSocket = io.sockets.sockets.get(opponentId);

                            // Store which socket belongs to which player number
                            pair.playerNumber = 1; // This socket is player 1
                            if (opponentPair) opponentPair.playerNumber = 2; // Opponent socket is player 2
                            
                            // Store player number on socket for later use in submit_code
                            socket.playerNumber = 1;
                            if (opponentSocket) opponentSocket.playerNumber = 2;

                            // Emit match_info with mode and player number details
                            console.log('===== SERVER: EMITTING both_ready =====');
                            console.log('Mode being sent:', pair.mode);
                            console.log('Match ID:', matchId);
                            console.log('========================================');
                            
                            socket.emit('both_ready', { 
                                match_id: matchId, 
                                mode: pair.mode, 
                                player_id: 1,
                                problem_id: _pairProbId,
                                matchEndTime: matchEndTime.toISOString(),
                                matchDuration: matchDuration
                            });
                            socket.emit('match_info', { 
                                mode: pair.mode, 
                                match_id: matchId, 
                                player_id: 1,
                                matchEndTime: matchEndTime.toISOString()
                            });
                            if (opponentSocket) {
                                opponentSocket.emit('both_ready', { 
                                    match_id: matchId, 
                                    mode: pair.mode, 
                                    player_id: 2,
                                    problem_id: _pairProbId,
                                    matchEndTime: matchEndTime.toISOString(),
                                    matchDuration: matchDuration
                                });
                                opponentSocket.emit('match_info', { 
                                    mode: pair.mode, 
                                    match_id: matchId, 
                                    player_id: 2,
                                    matchEndTime: matchEndTime.toISOString()
                                });
                            }
                            
                            // OLD: init_duel_session removed - AbandonmentTracker handles onboarding page only

                            // Join both sockets to a match-scoped room for broadcasting to result pages
                            const room = `match_${matchId}`;
                            try {
                                socket.join(room);
                                if (opponentSocket) opponentSocket.join(room);
                            } catch (e) {
                                console.warn('Room join failed:', room, e);
                            }
                        } catch (e) {
                            console.error('Error creating duel_matches row:', e);
                            // fallback: still notify clients without match_id
                            socket.emit('both_ready', { mode: pair.mode, player_id: 1 });
                            socket.emit('match_info', { mode: pair.mode, player_id: 1 });
                            
                            const opponentSocket = io.sockets.sockets.get(opponentId);
                            if (opponentSocket) {
                                opponentSocket.emit('both_ready', { mode: pair.mode, player_id: 2 });
                                opponentSocket.emit('match_info', { mode: pair.mode, player_id: 2 });
                            }
                        }
                    })();
                } else {
                    // Only one player ready - notify opponent
                    const opponentSocket = io.sockets.sockets.get(opponentId);
                    if (opponentSocket) {
                        opponentSocket.emit('opponent_ready', { username: pair.opponentUsername });
                    }
                }
            }
        } catch (err) {
            console.error('Error in player_ready:', err);
        }
    });

    // Handle ready timeout - player didn't click ready in time
    socket.on('ready_timeout', ({ mode }) => {
        try {
            console.log('Player ready timeout:', socket.id);
            
            if (matchPairs.has(socket.id)) {
                const pair = matchPairs.get(socket.id);
                const opponentId = pair.opponentId;

                // Remove both from pair
                matchPairs.delete(socket.id);
                matchPairs.delete(opponentId);

                // Notify opponent of timeout - don't auto-requeue them
                const opponentSocket = io.sockets.sockets.get(opponentId);
                if (opponentSocket) {
                    opponentSocket.emit('opponent_cancelled', { mode: pair.mode });
                    // Opponent will manually requeue if they want to search again
                }
            }
        } catch (err) {
            console.error('Error in ready_timeout:', err);
        }
    });

    // Get match timer info (for timer restoration on page reload)
    socket.on('get_match_timer', async (data, callback) => {
        try {
            const { matchId } = data;
            
            if (!matchId) {
                return callback({ success: false, message: 'Match ID required' });
            }
            
            const [matches] = await db.query(`
                SELECT 
                    match_id,
                    match_end_time,
                    match_started_at,
                    match_duration_minutes,
                    status
                FROM duel_matches
                WHERE match_id = ?
            `, [matchId]);
            
            if (matches.length === 0) {
                return callback({ success: false, message: 'Match not found' });
            }
            
            const match = matches[0];
            
            // Check if match is still active
            if (match.status !== 'in_progress') {
                return callback({ success: false, message: 'Match is not active', status: match.status });
            }
            
            console.log(`[MATCH TIMER] Match ${matchId} - End Time: ${match.match_end_time}`);
            
            callback({
                success: true,
                matchEndTime: match.match_end_time,
                startedAt: match.match_started_at,
                duration: match.match_duration_minutes,
                status: match.status
            });
            
        } catch (err) {
            console.error('[MATCH TIMER] Error:', err);
            callback({ success: false, message: 'Server error' });
        }
    });

    // Player clicked Exit during ready state
    socket.on('leave_queue', ({ mode }, callback) => {
        try {
            console.log(`Player ${socket.id} leaving queue/match for mode: ${mode}`);
            
            // Remove from waiting queue if present
            if (mode && matchQueues[mode]) {
                const beforeLength = matchQueues[mode].length;
                matchQueues[mode] = matchQueues[mode].filter(p => p.socket_id !== socket.id);
                const afterLength = matchQueues[mode].length;
                if (beforeLength !== afterLength) {
                    console.log(`Removed from ${mode} queue. Queue length: ${afterLength}`);
                }
            }

            // Also remove from all queues just to be safe
            matchQueues.casual = matchQueues.casual.filter(p => p.socket_id !== socket.id);
            matchQueues.ranked = matchQueues.ranked.filter(p => p.socket_id !== socket.id);

            // If player was matched, notify opponent
            if (matchPairs.has(socket.id)) {
                const pair = matchPairs.get(socket.id);
                const opponentId = pair.opponentId;
                const matchMode = pair.mode;

                // Remove the pairing
                matchPairs.delete(socket.id);
                matchPairs.delete(opponentId);

                const opponentSocket = io.sockets.sockets.get(opponentId);
                if (opponentSocket) {
                    // Notify opponent that partner cancelled
                    opponentSocket.emit('opponent_cancelled', { mode: matchMode });
                    // Opponent will manually requeue if they want to search again
                }
            }
            
            // Send acknowledgment back to client
            if (callback && typeof callback === 'function') {
                callback({ success: true });
            }
        } catch (err) {
            console.error('Error in leave_queue:', err);
            if (callback && typeof callback === 'function') {
                callback({ success: false, error: err.message });
            }
        }
    });

    // =====================================================
    // LOBBY SYSTEM SOCKET EVENTS
    // =====================================================

    // Create new lobby
    socket.on('create_lobby', async (data, callback) => {
        try {
            const { roomName, description, isPrivate, password, problemId, maxPlayers, difficulty } = data;
            const userId = socket.user?.id;
            const username = socket.user?.username;
            
            if (!userId) {
                return callback({ success: false, error: 'Not authenticated' });
            }
            
            const roomCode = generateRoomCode();
            const lobbyMaxPlayers = maxPlayers || 45;
            const lobbyDifficulty = difficulty || 'Easy';
            
            // Create lobby in database
            const [result] = await db.query(
                `INSERT INTO duel_lobby_rooms 
                (room_code, room_name, description, host_user_id, is_private, password, problem_id, max_players, status, host_spectator_mode, difficulty) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'waiting', 0, ?)`,
                [roomCode, roomName, description, userId, isPrivate ? 1 : 0, password, problemId, lobbyMaxPlayers, lobbyDifficulty]
            );
            
            const lobbyId = result.insertId;
            
            // Store lobby in memory (WITHOUT adding creator as player yet)
            // The creator will join properly when Room.vue loads via join_lobby
            activeLobbies.set(lobbyId, {
                lobbyData: {
                    lobby_id: lobbyId,
                    room_code: roomCode,
                    room_name: roomName,
                    description,
                    host_user_id: userId,
                    is_private: isPrivate ? 1 : 0,
                    password,
                    problem_id: problemId,
                    max_players: lobbyMaxPlayers,
                    status: 'waiting',
                    host_spectator_mode: false,
                    host_username: username,
                    difficulty: lobbyDifficulty
                },
                players: new Map(), // Empty - creator will join via Room.vue
                sockets: new Set() // Changed from Map to Set for .add() compatibility
            });
            
            lobbyRoomCodes.set(roomCode, lobbyId);
            
            console.log(`[LOBBY] Created lobby ${lobbyId} (${roomCode}) by ${username} - waiting for creator to join`);
            
            // Don't add creator yet - they will join via join_lobby when Room.vue loads
            // This ensures proper initialization flow
            
            callback({ 
                success: true, 
                roomCode,
                lobbyId // Send lobbyId so client knows which lobby was created
            });
            
        } catch (err) {
            console.error('Error creating lobby:', err);
            callback({ success: false, error: err.message });
        }
    });

    // Get lobby details by room code
    socket.on('get_lobby_by_code', async (roomCode, callback) => {
        try {
            const lobbyId = lobbyRoomCodes.get(roomCode);
            if (lobbyId === undefined || lobbyId === null) {
                return callback({ success: false, error: 'Room not found' });
            }
            
            const lobby = activeLobbies.get(lobbyId);
            if (!lobby) {
                return callback({ success: false, error: 'Room not found' });
            }
            
            callback({ success: true, lobby: getLobbyDetails(lobbyId) });
        } catch (err) {
            console.error('Error getting lobby by code:', err);
            callback({ success: false, error: err.message });
        }
    });

    // Get list of public lobbies
    socket.on('get_lobbies', async (filters, callback) => {
        try {
            const { search } = filters || {};
            
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
            
            callback({ success: true, lobbies });
            
        } catch (err) {
            console.error('Error getting lobbies:', err);
            callback({ success: false, error: err.message });
        }
    });

    // Join lobby
    socket.on('join_lobby', async (data, callback) => {
        try {
            const { roomCode, password } = data;
            const userId = socket.user?.id;
            const username = socket.user?.username;
            
            console.log(`[LOBBY] join_lobby request from socket ${socket.id}:`, {
                roomCode,
                hasPassword: !!password,
                socketUser: socket.user,
                userId,
                username
            });
            
            if (!userId) {
                console.log(`[LOBBY] join_lobby REJECTED - Not authenticated`);
                return callback({ success: false, error: 'Not authenticated' });
            }
            
            const lobbyId = lobbyRoomCodes.get(roomCode);
            console.log(`[LOBBY] Looking for room ${roomCode}, found lobbyId: ${lobbyId}`);
            if (lobbyId === undefined || lobbyId === null) {
                console.log(`[LOBBY] join_lobby REJECTED - Room not found in lobbyRoomCodes`);
                return callback({ success: false, error: 'Room not found' });
            }
            
            const lobby = activeLobbies.get(lobbyId);
            console.log(`[LOBBY] Found lobby:`, lobby ? 'YES' : 'NO');
            if (!lobby) {
                console.log(`[LOBBY] join_lobby REJECTED - Lobby not found in activeLobbies`);
                return callback({ success: false, error: 'Room not found' });
            }
            
            console.log(`[LOBBY] Room check - players: ${lobby.players.size}/${lobby.lobbyData.max_players}`);
            
            // Check if room is full
            if (lobby.players.size >= lobby.lobbyData.max_players) {
                console.log(`[LOBBY] join_lobby REJECTED - Room is full`);
                return callback({ success: false, error: 'Room is full' });
            }
            
            // Use module to validate player join
            const joinValidation = lobbyState.validatePlayerJoin(lobbyId, userId, activeLobbies);
            
            // Handle special case: host in spectator mode
            if (joinValidation.isSpectatorMode) {
                console.log(`[LOBBY] Host ${username} is in spectator mode, not adding as player`);
                return callback({ 
                    success: true, 
                    lobby: getLobbyDetails(lobbyId),
                    chatHistory: [],
                    isSpectatorMode: true
                });
            }
            
            // Handle case: already in lobby
            if (joinValidation.reason === 'Already in lobby') {
                console.log(`[LOBBY] ${username} already in lobby ${lobbyId} (in memory), returning current state`);
                return callback({ success: true, lobby: getLobbyDetails(lobbyId) });
            }
            
            // Handle case: cannot join
            if (!joinValidation.canJoin) {
                console.log(`[LOBBY] join_lobby REJECTED - ${joinValidation.reason}`);
                return callback({ success: false, error: joinValidation.reason });
            }
            
            console.log(`[LOBBY] All validations passed, proceeding to add player`);
            
            console.log(`[LOBBY DEBUG] Checking database for existing player - lobbyId: ${lobbyId}, userId: ${userId}`);
            
            // Check database for existing player record FIRST (before password validation)
            const [existingPlayer] = await db.query(
                `SELECT lobby_player_id FROM duel_lobby_players WHERE lobby_id = ? AND user_id = ? AND left_at IS NULL`,
                [lobbyId, userId]
            );
            
            console.log(`[LOBBY DEBUG] Database check result - found ${existingPlayer.length} existing records`);
            
            // Only validate password if player is NOT already in the database
            if (existingPlayer.length === 0) {
                // Use module to validate password for new joins
                const passwordValidation = lobbyState.validateLobbyPassword(lobbyId, password, userId, activeLobbies);
                if (!passwordValidation.valid) {
                    console.log(`[LOBBY] join_lobby REJECTED - ${passwordValidation.error}`);
                    return callback({ success: false, error: passwordValidation.error });
                }
                console.log(`[LOBBY] Password validation passed for new player`);
            } else {
                console.log(`[LOBBY] Skipping password validation - player already exists in database`);
            }
            
            if (existingPlayer.length > 0) {
                // Player exists in database but not in memory (reconnecting)
                console.log(`[LOBBY] ${username} rejoining lobby ${lobbyId} (found in database)`);
                
                // Determine if this is the host
                const isHost = lobby.lobbyData.host_user_id === userId;
                
                // Add back to memory
                lobby.players.set(userId, {
                    userId,
                    username,
                    avatarUrl: socket.user?.avatarUrl || null,
                    isReady: isHost // Host is automatically ready
                });
                lobby.sockets.add(socket.id); // Changed from .set() to .add() for Set compatibility
                
                socket.join(`lobby_${lobbyId}`);
                
                console.log(`[LOBBY] ${username} rejoined lobby ${lobbyId} successfully`);
                
                // Ensure database row is marked active again
                try {
                    await db.query(
                        `UPDATE duel_lobby_players SET left_at = NULL, is_ready = ? 
                         WHERE lobby_id = ? AND user_id = ?`,
                        [isHost ? 1 : 0, lobbyId, userId]
                    );
                    console.log(`[LOBBY] Database row for returning player ${userId} reset`);
                } catch (updErr) {
                    console.error(`[LOBBY] Failed to reset left_at for returning player:`, updErr);
                }
                
                // Load chat history for the rejoining player
                const [chatHistory] = await db.query(
                    `SELECT m.*, u.username 
                     FROM duel_lobby_messages m 
                     JOIN users u ON m.user_id = u.user_id 
                     WHERE m.lobby_id = ? 
                     ORDER BY m.sent_at ASC`,
                    [lobbyId]
                );
                
                console.log(`[LOBBY] Sending ${chatHistory.length} chat messages to rejoining ${username}`);
                
                // Fetch leaderboard for callback — only the most recently completed round
                // Scope by MAX(round_number) with actual scores so we always show the right round
                const [existingScores] = await db.query(
                    `SELECT lp.user_id, u.username, lp.score, lp.completion_time
                     FROM duel_lobby_players lp
                     JOIN users u ON lp.user_id = u.user_id
                     WHERE lp.lobby_id = ? AND lp.score IS NOT NULL
                       AND lp.round_number = (
                           SELECT COALESCE(MAX(round_number), 1)
                           FROM duel_lobby_players
                           WHERE lobby_id = ? AND score IS NOT NULL
                       )
                     ORDER BY lp.score DESC, lp.completion_time ASC`,
                    [lobbyId, lobbyId]
                );
                console.log(`[LOBBY] Rejoin branch sending ${existingScores.length} players to ${username}`);
                
                // Notify all players
                broadcastLobbyUpdate(lobbyId, io);
                
                return callback({ 
                    success: true, 
                    lobby: getLobbyDetails(lobbyId),
                    chatHistory: chatHistory.map(msg => ({
                        userId: msg.user_id,
                        username: msg.username,
                        message: msg.message,
                        timestamp: new Date(msg.sent_at).getTime()
                    })),
                    leaderboard: existingScores.map(score => ({
                        userId: score.user_id,
                        username: score.username,
                        score: score.score,          // keep as-is, null means not submitted
                        completionTime: score.completion_time || null,
                        avatar_url: null
                    })),
                    spectatorLink: `${process.env.BASE_URL || 'http://localhost:3000'}/inspector.html?lobby_id=${lobbyId}&code=${lobby.lobbyData.room_code}`
                });
            }
            
            // isHost already determined above, no need to redeclare
            
            console.log(`[LOBBY] Adding player ${username} (${userId}) to database...`);
            
            // Determine if user is host (needed for database insert)
            const isHost = lobby.lobbyData.host_user_id === userId;
            // Always keep host_username updated so getLobbyDetails can return it even in spectator mode
            if (isHost) lobby.lobbyData.host_username = username;
            
            // Add player to database
            try {
                await db.query(
                    `INSERT INTO duel_lobby_players (lobby_id, user_id, is_ready) VALUES (?, ?, ?)`,
                    [lobbyId, userId, isHost ? 1 : 0]
                );
                console.log(`[LOBBY] Player added to database successfully`);
            } catch (dbErr) {
                // If duplicate entry (race condition - another socket already joined), that's OK
                // Just add to memory and return success
                if (dbErr.code === 'ER_DUP_ENTRY') {
                    console.log(`[LOBBY] Duplicate entry race condition - player already in database, updating record instead`);
                    // ensure the existing row is treated as active again (clear left_at and update ready status)
                    try {
                        await db.query(
                            `UPDATE duel_lobby_players 
                             SET left_at = NULL, is_ready = ? 
                             WHERE lobby_id = ? AND user_id = ?`,
                            [isHost ? 1 : 0, lobbyId, userId]
                        );
                        console.log(`[LOBBY] Database UPDATE successful for existing player ${userId}`);
                    } catch (updErr) {
                        console.error(`[LOBBY] Failed to update existing lobby_player record:`, updErr);
                    }
                } else {
                    console.error(`[LOBBY] Database error adding player:`, dbErr);
                    return callback({ success: false, error: 'Failed to join lobby' });
                }
            }
            
            // Use module to add player to lobby state
            lobbyState.addPlayerToLobbyState(lobbyId, {
                userId,
                username,
                avatarUrl: socket.user?.avatarUrl || null,
                isReady: isHost, // Host is automatically ready
                socketId: socket.id
            }, activeLobbies);
            
            socket.join(`lobby_${lobbyId}`);
            
            console.log(`[LOBBY] ${username} joined lobby ${lobbyId} (${roomCode})${isHost ? ' as host' : ''} - SUCCESS`);
            console.log(`[LOBBY DEBUG] Join response - userId: ${userId}, host_user_id: ${lobby.lobbyData.host_user_id}, isHost: ${isHost}`);
            
            // Load chat history for the joining player
            const [chatHistory] = await db.query(
                `SELECT m.*, u.username 
                 FROM duel_lobby_messages m 
                 JOIN users u ON m.user_id = u.user_id 
                 WHERE m.lobby_id = ? 
                 ORDER BY m.sent_at ASC`,
                [lobbyId]
            );
            
            console.log(`[LOBBY] Sending ${chatHistory.length} chat messages to ${username}`);
            
            // Only load players from the most recently completed round (score IS NOT NULL).
            // Scoping by MAX(round_number) prevents stale scores from old rounds appearing.
            const [existingScores] = await db.query(
                `SELECT lp.user_id, u.username, lp.score, lp.completion_time
                 FROM duel_lobby_players lp
                 JOIN users u ON lp.user_id = u.user_id
                 WHERE lp.lobby_id = ? AND lp.score IS NOT NULL
                   AND lp.round_number = (
                       SELECT COALESCE(MAX(round_number), 1)
                       FROM duel_lobby_players
                       WHERE lobby_id = ? AND score IS NOT NULL
                   )
                 ORDER BY lp.score DESC, lp.completion_time ASC`,
                [lobbyId, lobbyId]
            );
            
            console.log(`[LOBBY] Sending ${existingScores.length} submitted scores to ${username}`);
            
            // Notify all players
            broadcastLobbyUpdate(lobbyId, io);
            
            const lobbyDetails = getLobbyDetails(lobbyId);
            console.log(`[LOBBY DEBUG] Sending lobby details to ${username}:`, {
                lobby_id: lobbyDetails.lobby_id,
                host_user_id: lobbyDetails.host_user_id,
                host_user_id_type: typeof lobbyDetails.host_user_id,
                user_id: userId,
                user_id_type: typeof userId
            });
            
            callback({ 
                success: true, 
                lobby: lobbyDetails,
                chatHistory: chatHistory.map(msg => ({
                    userId: msg.user_id,
                    username: msg.username,
                    message: msg.message,
                    timestamp: new Date(msg.sent_at).getTime()
                })),
                leaderboard: existingScores.map(score => ({
                    userId: score.user_id,
                    username: score.username,
                    score: score.score,
                    completionTime: score.completion_time || null,
                    avatar_url: null
                })),
                spectatorLink: `${process.env.BASE_URL || 'http://localhost:3000'}/inspector.html?lobby_id=${lobbyId}&code=${lobby.lobbyData.room_code}`
            });
            
        } catch (err) {
            console.error('Error joining lobby:', err);
            callback({ success: false, error: err.message });
        }
    });

    // Leave lobby
    socket.on('leave_lobby', async (lobbyId, callback) => {
        try {
            const userId = socket.user?.id;
            
            if (!userId) {
                return callback({ success: false, error: 'Not authenticated' });
            }
            
            const lobby = activeLobbies.get(lobbyId);
            if (!lobby) {
                return callback({ success: false, error: 'Lobby not found' });
            }
            
            // Update database
            await db.query(
                `UPDATE duel_lobby_players SET left_at = NOW() WHERE lobby_id = ? AND user_id = ?`,
                [lobbyId, userId]
            );
            
            // Remove from memory
            lobby.players.delete(userId);
            lobby.sockets.delete(socket.id); // Changed from userId to socket.id for Set compatibility
            socket.leave(`lobby_${lobbyId}`);
            
            console.log(`[LOBBY] User ${userId} left lobby ${lobbyId}. Remaining players: ${lobby.players.size}`);
            
            // Check if lobby is now empty
            if (lobby.players.size === 0) {
                // Don't delete if match is in progress or completed - keep for spectators
                if (lobby.lobbyData.status === 'in_progress' || lobby.lobbyData.status === 'completed') {
                    console.log(`[LOBBY] Lobby ${lobbyId} is empty but match is ${lobby.lobbyData.status} - keeping for spectators`);
                    callback({ success: true });
                    return;
                }

                // Don't delete if host switched to spectator mode - they still own the lobby
                const hostIsSpectating = lobby.lobbyData.host_spectator_mode === true || lobby.lobbyData.host_spectator_mode === 1;
                if (hostIsSpectating) {
                    console.log(`[LOBBY] Lobby ${lobbyId} appears empty but host is in spectator mode - keeping lobby alive`);
                    broadcastLobbyUpdate(lobbyId, io);
                    callback({ success: true });
                    return;
                }
                
                // No players left and status is waiting, delete the lobby completely
                await db.query(
                    `DELETE FROM duel_lobby_rooms WHERE lobby_id = ?`,
                    [lobbyId]
                );
                
                await db.query(
                    `DELETE FROM duel_lobby_players WHERE lobby_id = ?`,
                    [lobbyId]
                );
                
                activeLobbies.delete(lobbyId);
                lobbyRoomCodes.delete(lobby.lobbyData.room_code);
                leaderboardCache.delete(lobbyId); // Clear cached leaderboard updates
                
                console.log(`[LOBBY] Lobby ${lobbyId} deleted (empty and waiting)`);
                
                callback({ success: true });
                return;
            }
            
            // If host left but there are still players, close the lobby
            if (lobby.lobbyData.host_user_id === userId) {
                if (lobby.lobbyData.status === 'waiting' || !lobby.lobbyData.status) {
                    // Host intentionally left during waiting — kick everyone
                    console.log(`[LOBBY] Host ${userId} left lobby ${lobbyId} during waiting. Closing for all players.`);

                    io.to(`lobby_${lobbyId}`).emit('host_left', {
                        message: 'The host has left. The lobby has been closed.'
                    });

                    // Clean up DB and memory
                    await db.query(`DELETE FROM duel_lobby_rooms WHERE lobby_id = ?`, [lobbyId]);
                    await db.query(`DELETE FROM duel_lobby_players WHERE lobby_id = ?`, [lobbyId]);
                    activeLobbies.delete(lobbyId);
                    lobbyRoomCodes.delete(lobby.lobbyData.room_code);
                    leaderboardCache.delete(lobbyId);

                    callback({ success: true });
                    return;
                } else {
                    console.log(`[LOBBY] Host ${userId} left while lobby status=${lobby.lobbyData.status}; not closing lobby`);
                }
            }
            
            // Notify remaining players
            broadcastLobbyUpdate(lobbyId, io);
            
            callback({ success: true });
            
        } catch (err) {
            console.error('Error leaving lobby:', err);
            callback({ success: false, error: err.message });
        }
    });

    // Toggle ready status
    socket.on('toggle_ready', async (lobbyId, callback) => {
        try {
            const userId = socket.user?.id;
            
            if (!userId) {
                return callback({ success: false, error: 'Not authenticated' });
            }
            
            const lobby = activeLobbies.get(lobbyId);
            if (!lobby) {
                return callback({ success: false, error: 'Lobby not found' });
            }
            
            const player = lobby.players.get(userId);
            if (!player) {
                return callback({ success: false, error: 'Not in this lobby' });
            }
            
            // Use module to update ready state
            const updated = lobbyState.updatePlayerReadyState(lobbyId, userId, !player.isReady, activeLobbies);
            
            if (!updated) {
                return callback({ success: false, error: 'Could not update ready state' });
            }
            
            const newReadyState = player.isReady; // State was toggled by module
            
            // Update database
            await db.query(
                `UPDATE duel_lobby_players SET is_ready = ? WHERE lobby_id = ? AND user_id = ?`,
                [newReadyState ? 1 : 0, lobbyId, userId]
            );
            
            console.log(`[LOBBY] User ${userId} is ${newReadyState ? 'ready' : 'not ready'} in lobby ${lobbyId}`);
            
            // Notify all players
            broadcastLobbyUpdate(lobbyId, io);
            
            callback({ success: true, isReady: newReadyState });
            
        } catch (err) {
            console.error('Error toggling ready:', err);
            callback({ success: false, error: err.message });
        }
    });

    // ===== SPECTATOR MODE HANDLERS =====
    
    // Set host role (player or spectator)
    socket.on('set_host_role', async (data, callback) => {
        try {
            const { lobbyId, role } = data;
            const userId = socket.user?.id;
            const username = socket.user?.username;
            
            if (!userId) {
                return callback({ success: false, error: 'Not authenticated' });
            }
            
            const lobby = activeLobbies.get(lobbyId);
            if (!lobby) {
                return callback({ success: false, error: 'Lobby not found' });
            }
            
            // Only host can change their role
            if (userId !== lobby.lobbyData.host_user_id) {
                return callback({ success: false, error: 'Only host can change role' });
            }
            
            if (role === 'spectator') {
                console.log(`[LOBBY] Processing SPECTATOR mode switch for host ${username} (${userId})`);
                console.log(`[LOBBY] Current players before removal:`, Array.from(lobby.players.keys()));
                
                // Remove host from players
                lobby.players.delete(userId);
                
                console.log(`[LOBBY] Players after removal:`, Array.from(lobby.players.keys()));
                
                // Remove from database
                const [deleteResult] = await db.query(
                    `DELETE FROM duel_lobby_players WHERE lobby_id = ? AND user_id = ?`,
                    [lobbyId, userId]
                );
                
                console.log(`[LOBBY] Database DELETE result - affectedRows: ${deleteResult.affectedRows}`);
                
                // Add to spectators
                if (!lobby.spectators) {
                    lobby.spectators = new Set();
                }
                lobby.spectators.add(userId);
                
                // Store host_spectator_mode flag in memory
                lobby.lobbyData.host_spectator_mode = true;
                
                // Update database
                await db.query(
                    `UPDATE duel_lobby_rooms SET host_spectator_mode = 1 WHERE lobby_id = ?`,
                    [lobbyId]
                );
                
                console.log(`[LOBBY] ✓ Host ${username} (${userId}) switched to SPECTATOR mode in lobby ${lobbyId}`);
                console.log(`[LOBBY] Spectator count: ${lobby.spectators.size}, Player count: ${lobby.players.size}`);
                
            } else if (role === 'player') {
                console.log(`[LOBBY] Processing PLAYER mode switch for host ${username} (${userId})`);
                console.log(`[LOBBY] Current players before addition:`, Array.from(lobby.players.keys()));
                
                // Remove from spectators
                if (lobby.spectators) {
                    lobby.spectators.delete(userId);
                    console.log(`[LOBBY] Removed from spectators. Remaining spectators: ${lobby.spectators.size}`);
                }
                
                // Ensure socket is in lobby room
                socket.join(`lobby_${lobbyId}`);
                console.log(`[LOBBY] Socket ${socket.id} joined room lobby_${lobbyId}`);
                
                // Add host back as player
                lobby.players.set(userId, {
                    userId,
                    username,
                    avatarUrl: socket.user?.avatarUrl || null,
                    isReady: true // Host is automatically ready
                });
                
                // Also add to sockets set
                lobby.sockets.add(socket.id); // Changed from .set() to .add() for Set compatibility
                
                console.log(`[LOBBY] Players after addition:`, Array.from(lobby.players.keys()));
                
                // Add to database
                try {
                    await db.query(
                        `INSERT INTO duel_lobby_players (lobby_id, user_id, is_ready) VALUES (?, ?, ?)`,
                        [lobbyId, userId, 1]
                    );
                    console.log(`[LOBBY] Database INSERT successful for user ${userId}`);
                } catch (dbErr) {
                    if (dbErr.code === 'ER_DUP_ENTRY') {
                        // Already exists, update instead
                        await db.query(
                            `UPDATE duel_lobby_players SET is_ready = 1, left_at = NULL WHERE lobby_id = ? AND user_id = ?`,
                            [lobbyId, userId]
                        );
                        console.log(`[LOBBY] Database UPDATE successful for user ${userId} (already existed)`);
                    } else {
                        throw dbErr;
                    }
                }
                
                // Clear host_spectator_mode flag in memory
                lobby.lobbyData.host_spectator_mode = false;
                
                // Update database
                await db.query(
                    `UPDATE duel_lobby_rooms SET host_spectator_mode = 0 WHERE lobby_id = ?`,
                    [lobbyId]
                );
                
                console.log(`[LOBBY] ✓ Host ${username} (${userId}) switched to PLAYER mode in lobby ${lobbyId}`);
                console.log(`[LOBBY] Spectator count: ${lobby.spectators ? lobby.spectators.size : 0}, Player count: ${lobby.players.size}`);
            }
            
            // Broadcast lobby update
            broadcastLobbyUpdate(lobbyId, io);
            
            // Also emit directly to the lobby room to ensure host receives update
            io.to(`lobby_${lobbyId}`).emit('lobby_updated', getLobbyDetails(lobbyId));
            
            console.log(`[LOBBY] Broadcasted lobby update after role change to ${role}`);
            
            // Update spectator count
            const spectatorCount = lobby.spectators ? lobby.spectators.size : 0;
            io.to(`lobby_${lobbyId}`).emit('spectator_count_update', { count: spectatorCount });
            io.to(`lobby_spectator_${lobbyId}`).emit('spectator_count_update', { count: spectatorCount });
            
            callback({ success: true, role });
            
        } catch (err) {
            console.error('Error setting host role:', err);
            callback({ success: false, error: err.message });
        }
    });
    
    // Toggle spectator mode for a lobby
    socket.on('toggle_spectator_mode', async (data, callback) => {
        try {
            const { lobbyId, allowSpectators } = data;
            const userId = socket.user?.id;
            
            if (!userId) {
                return callback({ success: false, error: 'Not authenticated' });
            }
            
            const lobby = activeLobbies.get(lobbyId);
            if (!lobby) {
                return callback({ success: false, error: 'Lobby not found' });
            }
            
            // Only host can toggle spectator mode
            if (userId !== lobby.lobbyData.host_user_id) {
                return callback({ success: false, error: 'Only host can toggle spectator mode' });
            }
            
            // Generate spectator code if enabling
            let spectatorCode = lobby.lobbyData.spectator_code;
            if (allowSpectators && !spectatorCode) {
                spectatorCode = generateRoomCode(); // Reuse existing function
            }
            
            // Update database
            await db.query(
                `UPDATE duel_lobby_rooms SET allow_spectators = ?, spectator_code = ? WHERE lobby_id = ?`,
                [allowSpectators ? 1 : 0, allowSpectators ? spectatorCode : null, lobbyId]
            );
            
            // Update memory
            lobby.lobbyData.allow_spectators = allowSpectators ? 1 : 0;
            lobby.lobbyData.spectator_code = allowSpectators ? spectatorCode : null;
            
            console.log(`[SPECTATOR] Lobby ${lobbyId} spectator mode ${allowSpectators ? 'enabled' : 'disabled'}`);
            
            callback({ 
                success: true, 
                allowSpectators,
                spectatorCode: allowSpectators ? spectatorCode : null
            });
            
        } catch (err) {
            console.error('Error toggling spectator mode:', err);
            callback({ success: false, error: err.message });
        }
    });
    
    // Fetch all problems for the host's question picker in Room settings
    socket.on('get_problems_list', async (_data, callback) => {
        // _data may be undefined — client sends no payload, just a callback
        if (typeof _data === 'function') { callback = _data; }
        try {
            const [problems] = await db.query(
                `SELECT problem_id, problem_name, difficulty FROM problems ORDER BY difficulty ASC, problem_name ASC`
            );
            callback({ success: true, problems });
        } catch (err) {
            console.error('[PROBLEMS LIST] Error:', err);
            callback({ success: false, error: 'Failed to fetch problems' });
        }
    });

    // Update lobby settings — host only
    // Handles: difficulty, programmingLanguage, selectedProblemId (null=random, number=pin)
    socket.on('update_lobby_settings', async (data, callback) => {
        try {
            const { lobbyId, difficulty, programmingLanguage, selectedProblemId } = data;
            const userId = socket.user?.id;

            if (!userId) return callback({ success: false, error: 'Not authenticated' });

            const lobby = activeLobbies.get(lobbyId);
            if (!lobby) return callback({ success: false, error: 'Lobby not found' });

            if (lobby.lobbyData.host_user_id !== userId) {
                return callback({ success: false, error: 'Only the host can change settings' });
            }

            // Allow settings changes when waiting OR between rounds (in_progress but on room page)
            // Only block if the lobby is fully 'completed' and archived
            if (lobby.lobbyData.status === 'completed') {
                return callback({ success: false, error: 'Cannot change settings on a completed lobby' });
            }

            // ── Step 1: Apply difficulty change ──────────────────────────────────
            if (difficulty !== undefined) {
                const validDifficulties = ['Easy', 'Medium', 'Hard', 'All'];
                if (!validDifficulties.includes(difficulty)) {
                    return callback({ success: false, error: 'Invalid difficulty value' });
                }
                lobby.lobbyData.difficulty = difficulty;
                await db.query('UPDATE duel_lobby_rooms SET difficulty = ? WHERE lobby_id = ?', [difficulty, lobbyId]);
                console.log(`[LOBBY SETTINGS] ${socket.user.username} set difficulty=${difficulty} in lobby ${lobbyId}`);
            }

            // ── Step 2: Apply selectedProblemId change ───────────────────────────
            // Runs independently of difficulty so no duplicate problem_id fields
            if (selectedProblemId !== undefined) {
                if (selectedProblemId === null) {
                    // Random mode — clear pin
                    lobby.lobbyData.selected_problem_id = null;
                    await db.query('UPDATE duel_lobby_rooms SET problem_id = NULL WHERE lobby_id = ?', [lobbyId]);
                    console.log(`[LOBBY SETTINGS] ${socket.user.username} set question=RANDOM in lobby ${lobbyId}`);
                } else {
                    const pid = Number(selectedProblemId);
                    const [rows] = await db.query(
                        'SELECT problem_id, problem_name FROM problems WHERE problem_id = ?', [pid]
                    );
                    if (!rows || rows.length === 0) {
                        return callback({ success: false, error: 'Problem not found' });
                    }
                    lobby.lobbyData.selected_problem_id = pid;
                    await db.query('UPDATE duel_lobby_rooms SET problem_id = ? WHERE lobby_id = ?', [pid, lobbyId]);
                    console.log(`[LOBBY SETTINGS] ${socket.user.username} pinned problem ${pid} (${rows[0].problem_name}) in lobby ${lobbyId}`);
                }
            }

            // ── Step 3: Apply programmingLanguage change (column may not exist) ──
            if (programmingLanguage !== undefined) {
                lobby.lobbyData.programmingLanguage = programmingLanguage;
                try {
                    await db.query('UPDATE duel_lobby_rooms SET programming_language = ? WHERE lobby_id = ?', [programmingLanguage, lobbyId]);
                    console.log(`[LOBBY SETTINGS] ${socket.user.username} set language=${programmingLanguage} in lobby ${lobbyId}`);
                } catch (dbErr) {
                    if (!dbErr.message?.includes('Unknown column')) throw dbErr;
                    console.warn('[LOBBY SETTINGS] programming_language column missing (non-critical)');
                }
            }

            // Broadcast updated lobby state to all players
            broadcastLobbyUpdate(lobbyId, io);

            callback({ success: true });
        } catch (err) {
            console.error('[LOBBY SETTINGS] Error:', err);
            callback({ success: false, error: err.message });
        }
    });

    // Join as spectator
    socket.on('join_as_spectator', async (data, callback) => {
        try {
            const { lobbyId, spectatorCode } = data;
            const userId = socket.user?.id;
            const username = socket.user?.username || 'Anonymous';
            
            console.log(`[SPECTATOR] ${username} (${userId}) attempting to join lobby ${lobbyId} as spectator`);
            
            if (!userId) {
                console.log('[SPECTATOR] ✗ Not authenticated');
                return callback({ success: false, error: 'Not authenticated' });
            }
            
            let lobby = activeLobbies.get(lobbyId);
            
            // If lobby not in memory, check database and try to restore it
            if (!lobby) {
                console.log(`[SPECTATOR] Lobby ${lobbyId} not in activeLobbies, checking database...`);
                
                // Query database for lobby details
                const [lobbyRows] = await db.query(
                    `SELECT * FROM duel_lobby_rooms WHERE lobby_id = ?`,
                    [lobbyId]
                );
                
                if (lobbyRows.length === 0) {
                    console.log(`[SPECTATOR] ✗ Lobby ${lobbyId} doesn't exist in database`);
                    // List all active lobbies for debugging
                    const [allLobbies] = await db.query(
                        `SELECT lobby_id, room_code, status FROM duel_lobby_rooms ORDER BY lobby_id DESC LIMIT 10`
                    );
                    console.log(`[SPECTATOR] Recent lobbies in database:`, allLobbies.map(l => `#${l.lobby_id} (${l.room_code}, ${l.status})`).join(', '));
                    console.log(`[SPECTATOR] Active lobbies in memory:`, Array.from(activeLobbies.keys()).join(', '));
                    return callback({ success: false, error: 'Lobby doesn\'t exist' });
                }
                
                const lobbyData = lobbyRows[0];
                console.log(`[SPECTATOR] ✓ Found lobby ${lobbyId} in database (status: ${lobbyData.status}, room_code: ${lobbyData.room_code})`);
                
                // Create a lightweight lobby object for spectator access
                lobby = {
                    lobbyData: lobbyData,
                    players: new Map(),
                    sockets: new Set(),
                    spectators: new Set(),
                    createdAt: new Date(lobbyData.created_at)
                };
                
                // Load players from database
                const [playerRows] = await db.query(
                    `SELECT dlp.*, u.username
                     FROM duel_lobby_players dlp
                     JOIN users u ON dlp.user_id = u.user_id
                     WHERE dlp.lobby_id = ? AND dlp.left_at IS NULL`,
                    [lobbyId]
                );
                
                playerRows.forEach(player => {
                    lobby.players.set(player.user_id, {
                        userId: player.user_id,
                        username: player.username,
                        avatarUrl: null,
                        isReady: player.is_ready === 1
                    });
                });
                
                // Restore to activeLobbies for future access
                activeLobbies.set(lobbyId, lobby);
                console.log(`[SPECTATOR] ✓ Restored lobby ${lobbyId} to activeLobbies with ${lobby.players.size} players`);
            }
            
        // Check if this is the host in spectator mode (always allowed)
        const isHostSpectating = lobby.lobbyData.host_user_id === userId && 
                                 (lobby.lobbyData.host_spectator_mode === 1 || lobby.lobbyData.host_spectator_mode === true);
        
        if (!isHostSpectating) {
            // For non-host spectators, check if spectators are allowed
            if (!lobby.lobbyData.allow_spectators) {
                console.log(`[SPECTATOR] ✗ Spectators not allowed for non-host user ${userId}`);
                return callback({ success: false, error: 'Spectators are not allowed in this lobby' });
            }
            
            // Verify spectator code for non-host spectators
            if (lobby.lobbyData.spectator_code && lobby.lobbyData.spectator_code !== spectatorCode) {
                console.log(`[SPECTATOR] ✗ Invalid spectator code for user ${userId}`);
                return callback({ success: false, error: 'Invalid spectator code' });
            }
        } else {
            console.log(`[SPECTATOR] ✓ Host ${username} joining as spectator (always allowed)`);
            }
            
            // Add to spectators
            lobby.spectators.add(userId);
            socket.join(`lobby_spectator_${lobbyId}`);
            
            // Track in database (optional)
            try {
                await db.query(
                    `INSERT INTO spectator_sessions (spectator_user_id, lobby_id) VALUES (?, ?)`,
                    [userId, lobbyId]
                );
            } catch (dbErr) {
                // Ignore if table doesn't exist yet
                console.log('[SPECTATOR] Could not log to spectator_sessions table:', dbErr.message);
            }
            
            console.log(`[SPECTATOR] ${username} joined lobby ${lobbyId} as spectator`);
            
            // Get problem details if available
            let problem = null;
            if (lobby.lobbyData.problem_id) {
                const [problems] = await db.query(
                    `SELECT * FROM problems WHERE problem_id = ?`,
                    [lobby.lobbyData.problem_id]
                );
                if (problems.length > 0) {
                    const [testcases] = await db.query(
                        `SELECT * FROM test_cases WHERE problem_id = ? AND is_sample = 1 ORDER BY test_case_number ASC LIMIT 3`,
                        [lobby.lobbyData.problem_id]
                    );
                    problem = {
                        ...problems[0],
                        title: problems[0].problem_name,
                        description: problems[0].description,
                        testcases
                    };
                }
            }
            
            // Broadcast spectator count update
            io.to(`lobby_${lobbyId}`).emit('spectator_count_update', {
                count: lobby.spectators.size
            });
            io.to(`lobby_spectator_${lobbyId}`).emit('spectator_count_update', {
                count: lobby.spectators.size
            });
            
            // Always fetch players fresh from DB for the inspector.
            // lobby.players (in-memory Map) can be empty after a full reconnect cycle.
            //
            // Strategy:
            //  - Waiting (status = 'waiting'): rows have round_number = 0, left_at IS NULL
            //  - In-progress / completed: rows have round_number = current_round (>= 1)
            //
            // We pick the right set based on lobby status so the inspector
            // always shows the correct participants regardless of when it opens.

            let specPlayers = [];

            if (lobby.lobbyData.status === 'waiting') {
                // Waiting room — show all currently-present players (round_number = 0)
                const [waitingRows] = await db.query(
                    `SELECT dlp.user_id, dlp.score, dlp.completion_time, dlp.is_ready,
                            u.username, p.avatar_url
                     FROM duel_lobby_players dlp
                     JOIN users u ON dlp.user_id = u.user_id
                     LEFT JOIN profiles p ON u.user_id = p.user_id
                     WHERE dlp.lobby_id = ? AND dlp.left_at IS NULL`,
                    [lobbyId]
                );
                specPlayers = waitingRows;
                console.log(`[SPECTATOR] Waiting room — found ${specPlayers.length} players`);
            } else {
                // Match in progress or completed — scope to current round
                const currentRoundForSpec = lobby.lobbyData.current_round || 1;
                const [matchRows] = await db.query(
                    `SELECT dlp.user_id, dlp.score, dlp.completion_time, dlp.is_ready,
                            u.username, p.avatar_url
                     FROM duel_lobby_players dlp
                     JOIN users u ON dlp.user_id = u.user_id
                     LEFT JOIN profiles p ON u.user_id = p.user_id
                     WHERE dlp.lobby_id = ? AND dlp.round_number = ?`,
                    [lobbyId, currentRoundForSpec]
                );
                specPlayers = matchRows;
                console.log(`[SPECTATOR] Match round ${currentRoundForSpec} — found ${specPlayers.length} players`);

                // Fallback: if round query returned nothing, try left_at IS NULL
                if (specPlayers.length === 0) {
                    const [fallbackRows] = await db.query(
                        `SELECT dlp.user_id, dlp.score, dlp.completion_time, dlp.is_ready,
                                u.username, p.avatar_url
                         FROM duel_lobby_players dlp
                         JOIN users u ON dlp.user_id = u.user_id
                         LEFT JOIN profiles p ON u.user_id = p.user_id
                         WHERE dlp.lobby_id = ? AND dlp.left_at IS NULL`,
                        [lobbyId]
                    );
                    specPlayers = fallbackRows;
                    console.log(`[SPECTATOR] Fallback query returned ${specPlayers.length} players`);
                }
            }

            console.log(`[SPECTATOR] Sending ${specPlayers.length} players to spectator ${username}`);

            // Get started_at from DB for timer calculation
            let matchStartedAt = null;
            let matchDurationSecs = lobby.matchDuration || 300;
            try {
                const [[lobbyRow]] = await db.query(
                    'SELECT started_at FROM duel_lobby_rooms WHERE lobby_id = ?', [lobbyId]
                );
                if (lobbyRow && lobbyRow.started_at) {
                    matchStartedAt = new Date(lobbyRow.started_at).getTime();
                }
            } catch (e) { /* non-critical */ }

            callback({
                success: true,
                lobby: getLobbyDetails(lobbyId),
                players: specPlayers.map(p => ({
                    // Send BOTH snake_case and camelCase so inspector works regardless
                    user_id:         p.user_id,
                    userId:          p.user_id,
                    username:        p.username,
                    avatar_url:      p.avatar_url || null,
                    is_ready:        p.is_ready,
                    score:           p.score ?? null,
                    completion_time: p.completion_time ?? null,
                    completionTime:  p.completion_time ?? null
                })),
                problem,
                // Timer info for inspector
                matchStartedAt,
                matchDuration:    matchDurationSecs,
                matchEndAt:       matchStartedAt ? matchStartedAt + (matchDurationSecs * 1000) : null
            });
            
        } catch (err) {
            console.error('Error joining as spectator:', err);
            callback({ success: false, error: err.message });
        }
    });
    
    // Leave spectator mode
    socket.on('leave_spectator', async (data) => {
        try {
            const { lobbyId } = data;
            const userId = socket.user?.id;
            
            if (!userId || !lobbyId) return;
            
            const lobby = activeLobbies.get(lobbyId);
            if (lobby && lobby.spectators) {
                lobby.spectators.delete(userId);
                
                // Update spectator count
                io.to(`lobby_${lobbyId}`).emit('spectator_count_update', {
                    count: lobby.spectators.size
                });
                io.to(`lobby_spectator_${lobbyId}`).emit('spectator_count_update', {
                    count: lobby.spectators.size
                });
            }
            
            socket.leave(`lobby_spectator_${lobbyId}`);
            
            // Update database
            try {
                await db.query(
                    `UPDATE spectator_sessions SET left_at = NOW() 
                     WHERE spectator_user_id = ? AND lobby_id = ? AND left_at IS NULL`,
                    [userId, lobbyId]
                );
            } catch (dbErr) {
                // Ignore if table doesn't exist
            }
            
            console.log(`[SPECTATOR] User ${userId} left spectator mode for lobby ${lobbyId}`);
            
        } catch (err) {
            console.error('Error leaving spectator mode:', err);
        }
    });

    // Broadcast player code updates to spectators
    socket.on('player_code_update', (data) => {
        try {
            const { lobbyId, code, language, userId } = data;
            
            // Broadcast to spectators only (not to other players)
            io.to(`lobby_spectator_${lobbyId}`).emit('player_code_update', {
                userId,
                code,
                language
            });
            
        } catch (err) {
            console.error('Error broadcasting code update:', err);
        }
    });
    
    // Broadcast player submission to spectators
    socket.on('player_submitted', (data) => {
        try {
            const { lobbyId, userId } = data;
            
            io.to(`lobby_spectator_${lobbyId}`).emit('player_submitted', {
                userId
            });
            
            console.log(`[SPECTATOR] Player ${userId} submitted in lobby ${lobbyId}`);
            
        } catch (err) {
            console.error('Error broadcasting submission:', err);
        }
    });
    
    // Broadcast player judge result to spectators
    socket.on('player_judge_result', async (data) => {
        try {
            const { lobbyId, userId, username, verdict, score, completionTime, passed, total, results } = data;
            
            // Broadcast to spectators with full result data
            io.to(`lobby_spectator_${lobbyId}`).emit('player_judge_result', {
                userId,
                username: username || 'Unknown',
                verdict,
                score,
                completionTime,
                passed,
                total,
                results: results || []
            });
            
            // Save score to database
            try {
                await db.query(
                    `UPDATE duel_lobby_players 
                     SET score = ?, completion_time = ?, verdict = ? 
                     WHERE lobby_id = ? AND user_id = ? AND left_at IS NULL`,
                    [score, completionTime, verdict, lobbyId, userId]
                );
                console.log(`[LOBBY] Saved score for user ${userId} in lobby ${lobbyId}`);
            } catch (dbErr) {
                console.error('[LOBBY] Failed to save score to database:', dbErr);
            }
            
            // Broadcast leaderboard update to all players in the lobby
            const leaderboardUpdate = {
                userId,
                username: username || 'Unknown',
                score,
                completionTime,
                avatar_url: socket.user?.avatar_url || null
            };
            
            // Broadcast leaderboard update to players AND spectators (inspector)
            io.to(`lobby_${lobbyId}`).emit('lobby_leaderboard_update', leaderboardUpdate);
            io.to(`lobby_spectator_${lobbyId}`).emit('lobby_leaderboard_update', leaderboardUpdate);

            // Cache the update
            if (!leaderboardCache.has(lobbyId)) {
                leaderboardCache.set(lobbyId, new Map());
            }
            leaderboardCache.get(lobbyId).set(userId, leaderboardUpdate);

            console.log(`[SPECTATOR] Player ${username} (${userId}) got ${verdict} (${score}%) in lobby ${lobbyId}`);
            
        } catch (err) {
            console.error('Error broadcasting judge result:', err);
        }
    });

    // Send lobby chat message
    socket.on('lobby_chat', async (data, callback) => {
        try {
            const { lobbyId, message } = data;
            const userId = socket.user?.id;
            const username = socket.user?.username;
            
            console.log(`[LOBBY CHAT] Message from ${username} (${userId}) in lobby ${lobbyId}:`, message);
            
            if (!userId) {
                console.log(`[LOBBY CHAT] REJECTED - Not authenticated`);
                return callback({ success: false, error: 'Not authenticated' });
            }
            
            const lobby = activeLobbies.get(lobbyId);
            const isSpectator = lobby && lobby.spectators && lobby.spectators.has(userId);
            if (!lobby || (!lobby.players.has(userId) && !isSpectator)) {
                console.log(`[LOBBY CHAT] REJECTED - User not in lobby`);
                return callback({ success: false, error: 'Not in this lobby' });
            }
            
            // Save to database
            await db.query(
                `INSERT INTO duel_lobby_messages (lobby_id, user_id, message) VALUES (?, ?, ?)`,
                [lobbyId, userId, message]
            );
            
            const chatMessage = {
                userId,
                username,
                message,
                timestamp: Date.now()
            };
            
            console.log(`[LOBBY CHAT] Broadcasting message to lobby_${lobbyId}:`, chatMessage);
            
            // Use broadcast module to send chat message
            lobbyBroadcast.broadcastChatMessage(lobbyId, chatMessage, io, activeLobbies);
            
            callback({ success: true });
            
        } catch (err) {
            console.error('[LOBBY CHAT] Error sending message:', err);
            callback({ success: false, error: err.message });
        }
    });

    // Start lobby match (host only) - Legacy event
    socket.on('start_lobby_match', async (data, callback) => {
        console.log('[start_lobby_match] Legacy event received:', data);
        console.log('[start_lobby_match] Socket user:', socket.user);
        const { lobbyId, matchDuration } = data;
        
        if (!callback) {
            console.error('[start_lobby_match] No callback provided!');
            return;
        }
        
        if (lobbyId === undefined || lobbyId === null) {
            console.error('[start_lobby_match] No lobbyId provided!');
            return callback({ success: false, error: 'Missing lobbyId' });
        }
        
        // Check authentication here before forwarding
        const { id: userId, username } = socket.user || {};
        
        if (!userId) {
            console.error('[start_lobby_match] Not authenticated! socket.user:', socket.user);
            return callback({ success: false, error: 'Not authenticated' });
        }
        
        console.log('[start_lobby_match] User authenticated, forwarding to start_lobby');
        
        // Forward to start_lobby with same parameters
        // Use the socket's listener map to get the handler
        const listeners = socket.listeners('start_lobby');
        if (listeners && listeners.length > 0) {
            console.log('[start_lobby_match] Calling start_lobby handler');
            await listeners[0].call(socket, { lobbyId, matchDuration }, callback);
        } else {
            console.error('[start_lobby_match] start_lobby handler not found!');
            callback({ success: false, error: 'Internal server error' });
        }
    });

    // Rejoin lobby match (for leaderboard updates after navigation)
    socket.on('rejoin_lobby_match', async ({ lobbyId, userId }) => {
        console.log(`[LOBBY REJOIN] User ${userId} rejoining lobby ${lobbyId}`);
        
        if (lobbyId === undefined || lobbyId === null) {
            console.error('[LOBBY REJOIN] Missing lobbyId');
            return;
        }
        
        // Join the lobby room to receive broadcasts
        socket.join(`lobby_${lobbyId}`);
        console.log(`[LOBBY REJOIN] ✓ Socket ${socket.id} joined room lobby_${lobbyId}`);

        // Also register this socket in the activeLobbies sockets Set
        // so direct-emit fallbacks in submit_code can reach it
        const rejoiningLobby = activeLobbies.get(lobbyId);
        if (rejoiningLobby) {
            rejoiningLobby.sockets.add(socket.id);
            console.log(`[LOBBY REJOIN] ✓ Registered socket ${socket.id} in activeLobbies.sockets`);

            // Re-register in socketToMatch so submit_code and abandon tracker work after reconnect
            if (rejoiningLobby.lobbyData.status === 'in_progress') {
                socketToMatch[socket.id] = {
                    lobbyId: lobbyId,
                    mode: rejoiningLobby.lobbyData.mode || 'casual',
                    problemId: rejoiningLobby.lobbyData.problem_id,
                    userId: socket.user?.id,
                    username: socket.user?.username
                };
                console.log(`[LOBBY REJOIN] ✓ Re-registered socket ${socket.id} in socketToMatch for in-progress match`);
            }
        }
        
        // Fetch CURRENT leaderboard from database only if match is in progress
        // (avoids sending stale scores from a previous round while still in waiting state)
        try {
            const lobbyStatus = rejoiningLobby?.lobbyData?.status;

            if (lobbyStatus === 'in_progress') {
                // Load current_round from memory, fallback to DB if missing (survives full reconnect)
                let currentRound = rejoiningLobby?.lobbyData?.current_round;
                if (!currentRound) {
                    const [[crRow]] = await db.query(
                        `SELECT COALESCE(current_round, 1) AS current_round FROM duel_lobby_rooms WHERE lobby_id = ?`,
                        [lobbyId]
                    );
                    currentRound = crRow?.current_round || 1;
                    if (rejoiningLobby?.lobbyData) rejoiningLobby.lobbyData.current_round = currentRound;
                    console.log(`[LOBBY REJOIN] Loaded current_round ${currentRound} from DB for lobby ${lobbyId}`);
                }

                const [currentScores] = await db.query(
                    `SELECT lp.user_id, u.username, lp.score, lp.completion_time
                     FROM duel_lobby_players lp
                     LEFT JOIN users u ON lp.user_id = u.user_id
                     WHERE lp.lobby_id = ? AND lp.round_number = ?
                     ORDER BY lp.score DESC, lp.completion_time ASC`,
                    [lobbyId, currentRound]
                );

                console.log(`[LOBBY REJOIN] Fetched ${currentScores.length} players from database for user ${userId}`);

                // Only send players who have actually submitted (score not null)
                // Players with null score haven't submitted yet — sending them as 0% causes
                // duplicate/stale entries in the waiting room leaderboard
                const submittedScores = currentScores.filter(s => s.score !== null);
                submittedScores.forEach(score => {
                    socket.emit('lobby_leaderboard_update', {
                        userId: score.user_id,
                        username: score.username,
                        score: score.score || 0,
                        completionTime: score.completion_time || null,
                        avatar_url: null
                    });
                });
            } else {
                console.log(`[LOBBY REJOIN] Lobby ${lobbyId} is in '${lobbyStatus}' state — skipping leaderboard fetch to avoid stale scores`);
            }
        } catch (dbErr) {
            console.error(`[LOBBY REJOIN] Failed to fetch current scores from database:`, dbErr);
        }
        
        // Confirm rejoin
        socket.emit('lobby_rejoined', { success: true, lobbyId });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Export Lobby Results Handler
    // Returns all completed rounds for a lobby, grouped by round_number.
    // Each round includes all players with their scores and completion times.
    // Room.vue uses this to build the Excel export (one sheet per round + summary).
    // ─────────────────────────────────────────────────────────────────────────
    socket.on('get_lobby_export_data', async ({ lobbyId }, callback) => {
        try {
            if (!socket.user?.id) {
                return callback({ success: false, error: 'Not authenticated' });
            }

            if (!lobbyId) {
                return callback({ success: false, error: 'Missing lobbyId' });
            }

            // Fetch lobby info with extra context
            const [lobbyRows] = await db.query(
                `SELECT lr.lobby_id, lr.room_code, lr.room_name, lr.host_user_id,
                        lr.status, lr.started_at, lr.difficulty, lr.description,
                        p.problem_name,
                        u.username AS host_username
                 FROM duel_lobby_rooms lr
                 LEFT JOIN problems p ON lr.problem_id = p.problem_id
                 LEFT JOIN users u ON lr.host_user_id = u.user_id
                 WHERE lr.lobby_id = ?`,
                [lobbyId]
            );

            if (!lobbyRows || lobbyRows.length === 0) {
                return callback({ success: false, error: 'Lobby not found' });
            }

            const lobbyInfo = lobbyRows[0];

            // Fetch all player results grouped by round_number
            // JOIN lobby_rounds to get the correct problem per round (not just current problem)
            const [allResults] = await db.query(
                `SELECT
                    dlp.round_number,
                    dlp.user_id,
                    u.username,
                    dlp.score,
                    dlp.completion_time,
                    dlp.verdict,
                    dlp.joined_at,
                    COALESCE(lrd.started_at, lr.started_at) AS round_started_at,
                    COALESCE(lrd.problem_name, p.problem_name) AS problem_name,
                    lrd.problem_id AS round_problem_id
                 FROM duel_lobby_players dlp
                 LEFT JOIN users u ON dlp.user_id = u.user_id
                 LEFT JOIN duel_lobby_rooms lr ON dlp.lobby_id = lr.lobby_id
                 LEFT JOIN lobby_rounds lrd ON lrd.lobby_id = dlp.lobby_id AND lrd.round_number = dlp.round_number
                 LEFT JOIN problems p ON lr.problem_id = p.problem_id
                 WHERE dlp.lobby_id = ?
                 ORDER BY dlp.round_number ASC, dlp.score DESC, dlp.completion_time ASC`,
                [lobbyId]
            );

            if (!allResults || allResults.length === 0) {
                return callback({ success: false, error: 'No round data found for this lobby' });
            }

            // Group results by round_number
            const roundMap = new Map();
            allResults.forEach(row => {
                const rNum = row.round_number || 0;
                if (!roundMap.has(rNum)) {
                    roundMap.set(rNum, {
                        roundNumber: rNum,
                        problemName: row.problem_name || 'N/A',
                        startedAt: row.round_started_at,
                        players: []
                    });
                }
                roundMap.get(rNum).players.push({
                    userId:         row.user_id,
                    username:       row.username || 'Unknown',
                    score:          row.score,           // null = DNS (did not submit)
                    completionTime: row.completion_time,
                    verdict:        row.verdict || null,
                    rank:           roundMap.get(rNum).players.length + 1
                });
            });

            // Only export rounds that have at least one actual submission
            const rounds = Array.from(roundMap.values())
                .filter(r => r.players.some(p => p.score !== null))
                .sort((a, b) => a.roundNumber - b.roundNumber);

            if (rounds.length === 0) {
                return callback({ success: false, error: 'No completed rounds to export yet.' });
            }

            console.log(`[EXPORT] Lobby ${lobbyId} — exporting ${rounds.length} round(s) for user ${socket.user.username}`);

            callback({
                success: true,
                lobbyInfo: {
                    lobby_id:      lobbyInfo.lobby_id,
                    room_code:     lobbyInfo.room_code,
                    room_name:     lobbyInfo.room_name || lobbyInfo.room_code,
                    description:   lobbyInfo.description || '',
                    host_username: lobbyInfo.host_username || 'Unknown',
                    difficulty:    lobbyInfo.difficulty || 'Mixed',
                    problem_name:  lobbyInfo.problem_name || 'N/A',
                    status:        lobbyInfo.status,
                    started_at:    lobbyInfo.started_at,
                    total_rounds:  rounds.length
                },
                rounds
            });

        } catch (err) {
            console.error('[EXPORT] Error fetching lobby export data:', err);
            callback({ success: false, error: 'Server error fetching export data' });
        }
    });

    // Start Lobby Match Handler
    socket.on('start_lobby', async ({ lobbyId, matchDuration }, callback) => {
        try {
            const { id: userId, username } = socket.user || {};
            
            console.log(`[LOBBY START] ${username} (${userId}) attempting to start lobby ${lobbyId}`);
            console.log(`[LOBBY START] Match duration: ${matchDuration || 'default'} seconds`);
            
            if (!userId) {
                return callback({ success: false, error: 'Not authenticated' });
            }
            
            const lobby = activeLobbies.get(lobbyId);
            if (!lobby) {
                return callback({ success: false, error: 'Lobby not found' });
            }
            
            // Verify user is the host
            if (lobby.lobbyData.host_user_id !== userId) {
                console.log(`[LOBBY START] DENIED - ${username} is not the host`);
                return callback({ success: false, error: 'Only host can start the match' });
            }
            
            // Use module to validate match can start
            const startValidation = lobbyState.canStartMatch(lobbyId, activeLobbies);
            if (!startValidation.canStart) {
                console.log(`[LOBBY START] DENIED - ${startValidation.reason}`);
                return callback({ success: false, error: startValidation.reason });
            }
            
            console.log(`[LOBBY START] ✓ All ${startValidation.readyCount} players ready, proceeding...`);

            // Reset status to waiting momentarily to allow a clean round start
            // (status may still be 'in_progress' from previous round)
            
            // Select problem: use host-pinned problem if set, otherwise randomize by difficulty
            let problemId;
            const difficulty = lobby.lobbyData.difficulty;
            const pinnedProblemId = lobby.lobbyData.selected_problem_id || null;

            if (pinnedProblemId) {
                // Host picked a specific question
                const [pinned] = await db.query('SELECT problem_id, problem_name FROM problems WHERE problem_id = ?', [pinnedProblemId]);
                if (pinned && pinned.length > 0) {
                    problemId = pinned[0].problem_id;
                    console.log(`[LOBBY START] Using host-pinned problem ${problemId} (${pinned[0].problem_name})`);
                } else {
                    console.warn(`[LOBBY START] Pinned problem ${pinnedProblemId} not found, falling back to random`);
                }
            }

            if (!problemId) {
                // Randomize — filter by difficulty if set
                let problemQuery = 'SELECT problem_id FROM problems';
                let queryParams = [];
                if (difficulty && difficulty !== 'All') {
                    problemQuery += ' WHERE difficulty = ?';
                    queryParams.push(difficulty);
                }
                problemQuery += ' ORDER BY RAND() LIMIT 1';
                const [problems] = await db.query(problemQuery, queryParams);
                if (problems.length === 0) {
                    return callback({ success: false, error: 'No problems available for selected difficulty' });
                }
                problemId = problems[0].problem_id;
                console.log(`[LOBBY START] Randomly selected problem ${problemId} (difficulty: ${difficulty || 'Any'})`);
            }
            
            // Update lobby with new problem
            await db.query(
                'UPDATE duel_lobby_rooms SET problem_id = ? WHERE lobby_id = ?',
                [problemId, lobbyId]
            );
            lobby.lobbyData.problem_id = problemId;
            
            // Update lobby status to in_progress
            await db.query(
                'UPDATE duel_lobby_rooms SET status = ?, started_at = NOW() WHERE lobby_id = ?',
                ['in_progress', lobbyId]
            );
            lobby.lobbyData.status = 'in_progress';
            
            // Clear leaderboard cache for new match (fresh start)
            leaderboardCache.delete(lobbyId);
            console.log(`[LOBBY START] Cleared leaderboard cache for match`);

            // Determine the next round number for this lobby
            const [[roundRow]] = await db.query(
                `SELECT COALESCE(MAX(round_number), 0) + 1 AS next_round FROM duel_lobby_players WHERE lobby_id = ?`,
                [lobbyId]
            );
            const nextRound = roundRow.next_round;
            lobby.lobbyData.current_round = nextRound;

            // Persist current_round to DB so it survives full player reconnects
            await db.query(
                'UPDATE duel_lobby_rooms SET current_round = ? WHERE lobby_id = ?',
                [nextRound, lobbyId]
            );

            // Insert fresh rows for each player for the new round (preserves old round data for export)
            const playerIds = Array.from(lobby.players.keys());
            for (const uid of playerIds) {
                await db.query(
                    `INSERT INTO duel_lobby_players (lobby_id, user_id, is_ready, round_number)
                     VALUES (?, ?, 1, ?)`,
                    [lobbyId, uid, nextRound]
                );
            }
            // Record this round's problem in lobby_rounds for accurate per-round export
            try {
                const [probNameRow] = await db.query(
                    'SELECT problem_name FROM problems WHERE problem_id = ?', [problemId]
                );
                const probName = probNameRow?.[0]?.problem_name || null;
                await db.query(
                    `INSERT INTO lobby_rounds (lobby_id, round_number, problem_id, problem_name, started_at)
                     VALUES (?, ?, ?, ?, NOW())
                     ON DUPLICATE KEY UPDATE problem_id = VALUES(problem_id), problem_name = VALUES(problem_name), started_at = NOW()`,
                    [lobbyId, nextRound, problemId, probName]
                );
                console.log(`[LOBBY START] ✓ Recorded round ${nextRound} problem: ${probName} (${problemId})`);
            } catch (e) {
                console.warn('[LOBBY START] Could not insert lobby_rounds (non-critical):', e.message);
            }
            console.log(`[LOBBY START] ✓ Started round ${nextRound} for lobby ${lobbyId}`);
            
            // Store match duration in lobby state
            const finalMatchDuration = matchDuration || 300; // Default 5 minutes if not provided
            lobby.matchDuration = finalMatchDuration;
            console.log(`[LOBBY START] Set match duration to ${finalMatchDuration} seconds`);
            
            console.log(`[LOBBY START] ✓ Lobby ${lobbyId} started with problem ${problemId}`);
            
            // Get room code and spectator info to send with the event
            const roomCode = lobby.lobbyData.room_code;
            let spectatorCode = lobby.lobbyData.spectator_code || '';
            let allowSpectators = lobby.lobbyData.allow_spectators === 1;
            const hostSpectatorMode = lobby.lobbyData.host_spectator_mode === true || lobby.lobbyData.host_spectator_mode === 1;
            
            // If host is in spectator mode but spectators aren't enabled, enable them temporarily
            if (hostSpectatorMode && !allowSpectators) {
                console.log(`[LOBBY START] Host in spectator mode - enabling spectators automatically`);
                
                // Generate spectator code if not exists
                if (!spectatorCode) {
                    spectatorCode = generateRoomCode();
                }
                
                // Update database
                await db.query(
                    `UPDATE duel_lobby_rooms SET allow_spectators = 1, spectator_code = ? WHERE lobby_id = ?`,
                    [spectatorCode, lobbyId]
                );
                
                // Update memory
                lobby.lobbyData.allow_spectators = 1;
                lobby.lobbyData.spectator_code = spectatorCode;
                allowSpectators = true;
            }
            
            console.log(`[LOBBY START] Spectator settings - allowSpectators: ${allowSpectators}, hostSpectatorMode: ${hostSpectatorMode}, spectatorCode: ${spectatorCode ? '***' : '(none)'}`);

            // 🔧 Track all lobby players in socketToMatch for proper submission handling
            console.log('[LOBBY START] Registering players in socketToMatch...');
            const lobbyPlayers = Array.from(lobby.players.values()); // Convert Map to array
            console.log(`[LOBBY START] Found ${lobbyPlayers.length} players:`, lobbyPlayers.map(p => `${p.username} (${p.userId})`));
            
            for (const player of lobbyPlayers) {
                // Find all sockets for this user using activeSessions (use camelCase userId)
                const userSockets = activeSessions.get(player.userId);
                if (!userSockets || userSockets.size === 0) {
                    console.log(`[LOBBY START] ⚠️ No active sockets for player ${player.username} (${player.userId})`);
                    continue;
                }
                
                console.log(`[LOBBY START] Registering player ${player.username} (${player.userId}) - ${userSockets.size} socket(s)`);
                
                for (const socketId of userSockets) {
                    socketToMatch[socketId] = {
                        lobbyId: lobbyId,
                        mode: lobby.lobbyData.mode || 'casual',
                        problemId: problemId,
                        userId: player.userId, // Use camelCase
                        username: player.username
                    };
                    console.log(`[LOBBY START] ✓ Registered socket ${socketId} for lobby match`);
                }
            }
            console.log(`[LOBBY START] ✅ Registered ${lobbyPlayers.length} players in socketToMatch`);
            
            // Use broadcast module to notify match starting
            lobbyBroadcast.broadcastMatchStarting(lobbyId, {
                matchId: null, // No matchId yet for lobby-based matches
                problemId,
                mode: lobby.lobbyData.mode || 'casual',
                roomCode,
                spectatorCode,
                allowSpectators,
                matchDuration: finalMatchDuration
            }, io, activeLobbies);
            
            // Legacy event for backward compatibility
            io.to(`lobby_${lobbyId}`).emit('lobby_started', {
                lobbyId,
                roomCode,
                problemId,
                message: 'Match starting! Get ready...',
                spectatorCode,
                allowSpectators,
                hostId: lobby.lobbyData.host_user_id,
                hostSpectatorMode,
                matchDuration: finalMatchDuration
            });
            
            // Also emit to spectator room if spectators are allowed
            if (allowSpectators) {
                const startedAtMs = Date.now();
                io.to(`lobby_spectator_${lobbyId}`).emit('match_started', {
                    lobbyId,
                    problemId,
                    message: 'Match has started!',
                    matchDuration: finalMatchDuration,
                    matchStartedAt: startedAtMs,
                    matchEndAt:     startedAtMs + (finalMatchDuration * 1000)
                });
            }
            
            callback({ success: true, problemId, matchDuration: finalMatchDuration });
            
        } catch (err) {
            console.error('[LOBBY START] Error:', err);
            callback({ success: false, error: err.message });
        }
    });

    // ========================================
    // RE-REGISTER PLAYER FOR LOBBY MATCH (after page navigation)
    // ========================================
    socket.on('register_for_lobby_match', ({ lobbyId, problemId }) => {
        console.log(`[LOBBY REGISTER] Player ${socket.user?.username} (${socket.user?.id}) re-registering for lobby ${lobbyId}`);
        
        if (!socket.user?.id) {
            console.log('[LOBBY REGISTER] ❌ No authenticated user');
            return;
        }
        
        const lobby = activeLobbies.get(lobbyId);
        if (!lobby) {
            console.log(`[LOBBY REGISTER] ❌ Lobby ${lobbyId} not found`);
            return;
        }
        
        if (lobby.lobbyData.status !== 'in_progress') {
            console.log(`[LOBBY REGISTER] ❌ Lobby ${lobbyId} not in progress (status: ${lobby.lobbyData.status})`);
            return;
        }
        
        // Register this socket for the lobby match
        socketToMatch[socket.id] = {
            lobbyId: lobbyId,
            mode: lobby.lobbyData.mode || 'casual',
            problemId: problemId,
            userId: socket.user.id,
            username: socket.user.username
        };
        
        console.log(`[LOBBY REGISTER] ✅ Registered socket ${socket.id} for ${socket.user.username} (${socket.user.id})`);
    });

    socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);
        
        const userId = socket.user?.id;
        const username = socket.user?.username;
        
        // ========================================
        // STEP 1: SECURITY - Remove from active sessions tracking
        // ========================================
        let isLastSocket = false;
        let remainingSockets = 0;
        if (userId && activeSessions.has(userId)) {
            activeSessions.get(userId).delete(socket.id);
            remainingSockets = activeSessions.get(userId).size;
            isLastSocket = remainingSockets === 0;
            if (isLastSocket) {
                activeSessions.delete(userId);
            }
            console.log(`[SECURITY] User ${username} (${userId}) disconnected socket ${socket.id}. Remaining sockets: ${remainingSockets}`);
        }
        
        // ========================================
        // STEP 2: ABANDONMENT TRACKING - Check onboarding presence
        // Only penalize if this is the user's LAST socket OR they have no other sockets on onboarding
        // ========================================
        if (abandonmentTracker && userId) {
            const shouldCheckAbandonment = await abandonmentTracker.playerDisconnected(
                socket.id, 
                userId, 
                isLastSocket
            );
        }
        
        // ========================================
        // STEP 3: LOBBY CLEANUP - Only if last socket
        // ========================================
        if (userId && isLastSocket) {
            console.log(`[LOBBY] User ${userId} has no more active sockets, cleaning up lobbies...`);

            // Find all lobbies this user is in
            for (const [lobbyId, lobby] of activeLobbies.entries()) {
                if (lobby.players.has(userId)) {
                    console.log(`[LOBBY] Removing disconnected user ${userId} from lobby ${lobbyId}`);

                    try {
                        // Only stamp left_at if the match is NOT in progress.
                        // During an in_progress match, players may reconnect — stamping left_at
                        // causes rejoin_lobby_match to return 0 rows and breaks the live leaderboard.
                        if (lobby.lobbyData.status !== 'in_progress') {
                            await db.query(
                                `UPDATE duel_lobby_players SET left_at = NOW() WHERE lobby_id = ? AND user_id = ?`,
                                [lobbyId, userId]
                            );
                        } else {
                            console.log(`[LOBBY] Skipping left_at stamp for user ${userId} in lobby ${lobbyId} (match in_progress — may reconnect)`);
                        }

                        // Remove from memory
                        lobby.players.delete(userId);
                        lobby.sockets.delete(socket.id); // Changed from userId to socket.id for Set compatibility

                        // Check if lobby is now empty
                        if (lobby.players.size === 0) {
                            // Don't delete if match is in progress or completed - keep for spectators
                            if (lobby.lobbyData.status === 'in_progress' || lobby.lobbyData.status === 'completed') {
                                console.log(`[LOBBY] Lobby ${lobbyId} is empty after disconnect but match is ${lobby.lobbyData.status} - keeping for spectators`);
                            } else if (lobby.lobbyData.host_spectator_mode === true || lobby.lobbyData.host_spectator_mode === 1) {
                                // Host switched to spectator mode - lobby is intentionally empty of players
                                console.log(`[LOBBY] Lobby ${lobbyId} is empty after disconnect but host is in spectator mode - keeping lobby alive`);
                            } else {
                                console.log(`[LOBBY] Lobby ${lobbyId} is empty after disconnect and waiting, deleting...`);
                                
                                // Delete lobby completely
                                await db.query(`DELETE FROM duel_lobby_rooms WHERE lobby_id = ?`, [lobbyId]);
                                await db.query(`DELETE FROM duel_lobby_players WHERE lobby_id = ?`, [lobbyId]);

                                activeLobbies.delete(lobbyId);
                                lobbyRoomCodes.delete(lobby.lobbyData.room_code);
                                leaderboardCache.delete(lobbyId); // Clear cached leaderboard updates
                            }
                        } else {
                            // If host disconnected, close the lobby for all players
                            if (lobby.lobbyData.host_user_id === userId) {
                                if (lobby.lobbyData.status === 'waiting' || !lobby.lobbyData.status) {
                                    // Host left during waiting — kick everyone out
                                    console.log(`[LOBBY] Host ${userId} disconnected during waiting. Closing lobby ${lobbyId} for all players.`);

                                    io.to(`lobby_${lobbyId}`).emit('host_left', {
                                        message: 'The host has disconnected. The lobby has been closed.'
                                    });

                                    // Clean up DB and memory
                                    await db.query(`DELETE FROM duel_lobby_rooms WHERE lobby_id = ?`, [lobbyId]);
                                    await db.query(`DELETE FROM duel_lobby_players WHERE lobby_id = ?`, [lobbyId]);
                                    activeLobbies.delete(lobbyId);
                                    lobbyRoomCodes.delete(lobby.lobbyData.room_code);
                                    leaderboardCache.delete(lobbyId);
                                } else {
                                    console.log(`[LOBBY] Host ${userId} disconnected during ${lobby.lobbyData.status}; not reassigning host`);
                                    broadcastLobbyUpdate(lobbyId, io);
                                }
                            } else {
                                // Notify remaining players of the non-host disconnect
                                broadcastLobbyUpdate(lobbyId, io);
                            }
                        }
                    } catch (err) {
                        console.error('Error cleaning up lobby on disconnect:', err);
                    }
                }
            }
        } else if (userId && !isLastSocket) {
            console.log(`[LOBBY] User ${userId} still has ${remainingSockets} active socket(s), skipping lobby cleanup`);
        }
        
        // ========================================
        // STEP 4: MATCHMAKING CLEANUP
        // ========================================
        if (matchPairs.has(socket.id)) {
            const pair = matchPairs.get(socket.id);
            const opponentId = pair.opponentId;
            const matchMode = pair.mode;

            // Remove both entries
            matchPairs.delete(socket.id);
            matchPairs.delete(opponentId);

            const opponentSocket = io.sockets.sockets.get(opponentId);
            if (opponentSocket) {
                opponentSocket.emit('opponent_cancelled', { mode: matchMode });
                // Opponent will manually requeue if they want to search again
            }
        }

        // Remove from all queues
        matchQueues.casual = matchQueues.casual.filter(p => p.socket_id !== socket.id);
        matchQueues.ranked = matchQueues.ranked.filter(p => p.socket_id !== socket.id);
    });

    // === Other onboarding events ===
    // SUGGESTED try to segregate 'get_onboarding_question' to other js file to prevent overloading server.js code lines :/
    socket.on("get_onboarding_question", async ({ mode, match_id, problem_id } = {}) => {
        try {
            // Use the problem already assigned to this match (from in-memory pair),
            // so both players always see the same problem.
            let problems;
            const _oqPair = matchPairs.get(socket.id) || null;
            const _oqProbId = _oqPair ? _oqPair.problem_id
                            : problem_id ? Number(problem_id)          // sent by frontend (from both_ready)
                            : match_id   ? matchProblemCache.get(Number(match_id)) // cache fallback
                            : null;
            if (_oqProbId) {
                const [rows] = await db.query("SELECT * FROM problems WHERE problem_id = ?", [_oqProbId]);
                if (rows && rows.length > 0) {
                    problems = rows;
                    console.log(`[ONBOARDING] Using assigned problem ${_oqProbId} for socket ${socket.id}`);
                }
            }
            // Fallback: pick random by difficulty (no active pair / solo practice)
            if (!problems || problems.length === 0) {
                let problemQuery, problemParams = [];
                const m = (mode || 'casual').toLowerCase();
                if (m === 'casual') {
                    problemQuery = "SELECT * FROM problems WHERE LOWER(difficulty) = 'easy' ORDER BY RAND() LIMIT 1";
                } else if (m === 'ranked') {
                    problemQuery = "SELECT * FROM problems WHERE LOWER(difficulty) IN ('medium', 'hard') ORDER BY RAND() LIMIT 1";
                } else {
                    problemQuery = "SELECT * FROM problems ORDER BY RAND() LIMIT 1";
                }
                [problems] = await db.query(problemQuery, problemParams);
            }

            if (problems.length === 0) {
                socket.emit("onboarding_question_data", { success: false });
                return;
            }

            const problem = problems[0];

            // Get related test cases - only show 3 sample cases to frontend
            const [testcases] = await db.query(`
                SELECT * FROM test_cases 
                WHERE problem_id = ? AND is_sample = 1
                ORDER BY test_case_number ASC
                LIMIT 3
            `, [problem.problem_id]);

            socket.emit("onboarding_question_data", {
                success: true,
                question: {
                    id: problem.problem_id,
                    title: problem.problem_name,
                    description: problem.description,
                    difficulty: problem.difficulty,
                    time_limit: problem.time_limit_seconds,
                    memory_limit: problem.memory_limit_mb,
                    testcases: testcases.map(tc => ({
                        id: tc.test_case_id,
                        number: tc.test_case_number,
                        is_sample: tc.is_sample,
                        input: tc.input_data,
                        expected: tc.expected_output,
                        score: tc.score
                    }))
                }
            });

        } catch (err) {
            console.error(err);
            socket.emit("onboarding_question_data", { success: false });
        }
    });

    // Get specific problem by ID for lobby matches
    socket.on("get_problem_by_id", async (data, callback) => {
        console.log('🔧 [SERVER DEBUG] 1. get_problem_by_id received');
        console.log('🔧 [SERVER DEBUG] 2. Data:', data);
        console.log('🔧 [SERVER DEBUG] 3. Socket ID:', socket.id);
        console.log('🔧 [SERVER DEBUG] 4. Socket user:', socket.user);
        
        try {
            const { problem_id } = data;

            console.log('🔧 [SERVER DEBUG] 5. Problem ID:', problem_id);

            if (!problem_id) {
                console.log('🔧 [SERVER DEBUG] 6. ❌ No problem_id provided');
                callback({ success: false, message: "Problem ID is required" });
                return;
            }

            // Get the specific problem
            console.log('🔧 [SERVER DEBUG] 7. Querying database for problem_id:', problem_id);
            const [problems] = await db.query(`SELECT * FROM problems WHERE problem_id = ?`, [problem_id]);

            console.log('🔧 [SERVER DEBUG] 8. Query results count:', problems.length);

            if (problems.length === 0) {
                console.log('🔧 [SERVER DEBUG] 9. ❌ Problem not found in database');
                callback({ success: false, message: "Problem not found" });
                return;
            }

            const problem = problems[0];
            console.log('🔧 [SERVER DEBUG] 10. Problem found:', problem.problem_name);

            // Get related test cases - only show 3 sample cases to frontend
            console.log('🔧 [SERVER DEBUG] 11. Fetching test cases for problem_id:', problem.problem_id);
            const [testcases] = await db.query(`
                SELECT * FROM test_cases 
                WHERE problem_id = ? AND is_sample = 1
                ORDER BY test_case_number ASC
                LIMIT 3
            `, [problem.problem_id]);

            console.log('🔧 [SERVER DEBUG] 12. Test cases found:', testcases.length);

            const response = {
                success: true,
                question: {
                    id: problem.problem_id,
                    title: problem.problem_name,
                    description: problem.description,
                    difficulty: problem.difficulty,
                    time_limit: problem.time_limit_seconds,
                    memory_limit: problem.memory_limit_mb,
                    testcases: testcases.map(tc => ({
                        id: tc.test_case_id,
                        number: tc.test_case_number,
                        is_sample: tc.is_sample,
                        input: tc.input_data,
                        expected: tc.expected_output,
                        score: tc.score
                    }))
                }
            };

            console.log('🔧 [SERVER DEBUG] 13. ✅ Sending response with problem:', response.question.title);
            console.log('🔧 [SERVER DEBUG] 14. Response testcases count:', response.question.testcases.length);
            callback(response);

        } catch (err) {
            console.error("🔧 [SERVER DEBUG] 15. ❌ ERROR in get_problem_by_id:", err);
            console.error("🔧 [SERVER DEBUG] 16. Error stack:", err.stack);
            callback({ success: false, message: "Server error" });
        }
    });



    // NOTE: isCodeSafe function has been moved to utils/security.js
    // Import it at the top: const { isCodeSafe } = require("./utils/security.js");
    
    // Returns an object: { success: boolean, output: string, error: string }
    function runWithTimeout(cmd, args, input, timeout = 2000) {
        return new Promise(resolve => {
            const proc = execFile(cmd, args, { timeout }, (err, stdout, stderr) => {
                if (err) {
                    return resolve({ success: false, output: '', error: (stderr || err.message || 'Unknown error').toString() });
                }
                return resolve({ success: true, output: (stdout || '').toString().trim(), error: (stderr || '').toString().trim() });
            });

            if (input) {
                try {
                    proc.stdin.write(input);
                    proc.stdin.end();
                } catch (e) {
                    // ignore
                }
            }
        });
    }

    // ========================================
    // NEW ABANDONMENT TRACKING SYSTEM
    // Clean, simple, no false positives
    // ========================================
    
    // Player loaded onboarding page - start tracking
    socket.on('onboarding_page_loaded', async ({ match_id, mode }) => {
        try {
            if (!socket.user || !socket.user.id) {
                console.log('[ABANDON] onboarding_page_loaded called without authenticated user');
                socket.emit('onboarding_access_denied', { 
                    reason: 'not_authenticated',
                    redirectTo: '/signin.html'
                });
                return;
            }

            const userId = socket.user.id;
            const username = socket.user.username;

            console.log(`[ABANDON] 📄 ${username} attempting to load onboarding for match ${match_id} (${mode})`);
            
            // ✅ CHECK IF PLAYER CAN REJOIN THIS MATCH
            const accessCheck = abandonmentTracker.canRejoinMatch(userId, match_id);
            
            if (!accessCheck.allowed) {
                console.log(`[ABANDON] 🚫 ${username} BLOCKED from onboarding: ${accessCheck.reason}`);
                socket.emit('onboarding_access_denied', {
                    reason: accessCheck.reason,
                    redirectTo: accessCheck.forceRedirect || '/duel.html',
                    message: accessCheck.reason === 'grace_expired' 
                        ? 'Your abandonment grace period has expired. Please check your notifications.'
                        : 'You cannot rejoin this match.'
                });
                return;
            }
            
            if (accessCheck.reason === 'grace_period') {
                console.log(`[ABANDON] ⚠️ ${username} rejoining during grace period (${accessCheck.graceRemaining}s remaining)`);
            }
            
            // Check if this is a reconnection (player already in match)
            const reconnected = abandonmentTracker.playerReconnected(match_id, socket.id, userId);
            
            if (!reconnected) {
                // New connection - register with tracker
                const result = abandonmentTracker.playerEnteredOnboarding(match_id, socket.id, userId, username, mode);
                
                // Check if entry was blocked (shouldn't happen if canRejoinMatch passed, but double-check)
                if (result.blocked) {
                    console.log(`[ABANDON] 🚫 ${username} entry BLOCKED by tracker: ${result.reason}`);
                    socket.emit('onboarding_access_denied', {
                        reason: result.reason,
                        redirectTo: '/duel.html'
                    });
                    return;
                }
            }
            
            // ✅ ACCESS GRANTED - player can continue on onboarding
            socket.emit('onboarding_access_granted', {
                matchId: match_id,
                mode: mode,
                graceRemaining: accessCheck.graceRemaining || null
            });
            
        } catch (err) {
            console.error('Error in onboarding_page_loaded:', err);
        }
    });

    // Player submitted code - cancel abandonment timer
    socket.on('onboarding_code_submitted', ({ match_id }) => {
        try {
            if (!socket.user || !socket.user.id) return;

            const userId = socket.user.id;
            const username = socket.user.username;

            console.log(`[ABANDON] ✅ ${username} submitted code for match ${match_id}`);
            
            // Notify tracker
            abandonmentTracker.playerSubmitted(match_id, userId);
            
        } catch (err) {
            console.error('Error in onboarding_code_submitted:', err);
        }
    });

    // Match finished - cleanup tracking
    socket.on('match_cleanup', ({ match_id }) => {
        try {
            console.log(`[ABANDON] 🧹 Cleaning up match ${match_id}`);
            abandonmentTracker.cleanupMatch(match_id);
        } catch (err) {
            console.error('Error in match_cleanup:', err);
        }
    });

    // Anti-cheat violation reported from Onboarding.vue
    socket.on('anticheat_violation', async ({ match_id, reason, violations }) => {
        try {
            if (!socket.user || !socket.user.id) return;
            const userId = socket.user.id;
            const username = socket.user.username;
            console.log(`[ANTICHEAT] ⚠️ Violation from ${username} (${userId}) match=${match_id} reason="${reason}" count=${violations}`);
            // Log to DB audit_trail if available
            try {
                await db.query(
                    `INSERT INTO audit_trail (user_id, action) VALUES (?, ?)`,
                    [userId, `anticheat_violation: ${JSON.stringify({ match_id, reason, violations })}`]
                );
            } catch (dbErr) {
                // audit_trail may not exist - not critical
            }
        } catch (err) {
            console.error('Error in anticheat_violation:', err);
        }
    });

    // Debug endpoint to see active abandonment tracking
    socket.on('abandon_debug', () => {
        try {
            const info = abandonmentTracker.getDebugInfo();
            console.log('[ABANDON DEBUG] Active matches:', info);
            socket.emit('abandon_debug_info', info);
        } catch (err) {
            console.error('Error in abandon_debug:', err);
        }
    });

    socket.on('duel_completed', () => {
        try {
            // OLD: duelSessions tracking removed - AbandonmentTracker handles this
            console.log('[DUEL] duel_completed event received (legacy event)');
        } catch (err) {
            console.error('Error in duel_completed:', err);
        }
    });

    // ========================================
    // RESULT PAGE TRACKING - Track players on result page for abandonment detection
    // ========================================
    socket.on('result_started', async ({ match_id, mode }) => {
        try {
            if (!socket.user || !socket.user.id) {
                console.log('[ABANDON] result_started called without authenticated user');
                return;
            }

            const userId = socket.user.id;
            const username = socket.user.username;
            
            // OLD: onboardingSessions tracking removed - AbandonmentTracker handles onboarding page only
            // Result page doesn't need abandonment tracking (match already finished)
            console.log(`[RESULT] ${username} (${userId}) on result page for match ${match_id} (${mode})`);
        } catch (err) {
            console.error('Error in result_started:', err);
        }
    });

    socket.on('result_completed', () => {
        try {
            // OLD: onboardingSessions tracking removed - no longer needed
            console.log('[RESULT] result_completed event received (legacy event)');
        } catch (err) {
            console.error('Error in result_completed:', err);
        }
    });

    // SUBMIT CODE / JUDGE handler
    socket.on('submit_code', async (data) => {
        let filename = null;
        let className = null;
        let language = null;
        
        try {
            if (!data) {
                socket.emit("judge_result", { success: false, message: "No submission data" });
                return;
            }

            let { problem_id, language: submittedLanguage, source_code, match_id, player_id, user_id, submission_duration, mode, lobby_id } = data;
            // Always prefer server-side problem_id from in-memory pair.
            // Frontend may cache a stale problem_id from a previous match.
            {
                const _spPair = matchPairs.get(socket.id) || socketToMatch[socket.id] || null;
                const _serverProbId = _spPair ? (_spPair.problem_id || _spPair.problemId || null) : null;
                if (_serverProbId) {
                    if (_serverProbId !== problem_id) {
                        console.log(`[SUBMIT_CODE] Overriding frontend problem_id ${problem_id} with server pair problem_id ${_serverProbId}`);
                    }
                    problem_id = _serverProbId;
                } else if (!problem_id) {
                    console.log('[SUBMIT_CODE] WARNING: no problem_id from pair or frontend');
                }
                // Fallback: if pair is gone (reconnected socket) but match_id is known, use matchProblemCache
                // Coerce to number since insertRes.insertId is always numeric but payload may be string
                const _numericMatchId = match_id ? Number(match_id) : null;
                console.log(`[SUBMIT_CODE] matchProblemCache size=${matchProblemCache.size} match_id=${match_id}(${typeof match_id}) numericMatchId=${_numericMatchId} hasKey=${matchProblemCache.has(_numericMatchId)}`);
                if (!_serverProbId && _numericMatchId && matchProblemCache.has(_numericMatchId)) {
                    const _cachedProbId = matchProblemCache.get(_numericMatchId);
                    if (_cachedProbId !== problem_id) {
                        console.log(`[SUBMIT_CODE] Overriding frontend problem_id ${problem_id} with cached problem_id ${_cachedProbId} for match ${_numericMatchId}`);
                    }
                    problem_id = _cachedProbId;
                }
            }
            language = submittedLanguage?.toLowerCase(); // Store in outer scope for cleanup, normalize to lowercase

            // CRITICAL FIX: player_id should be 1 or 2 (player position), user_id is the database user ID
            // Use socket.playerNumber if player_id not provided
            if (!player_id && socket.playerNumber) {
                player_id = socket.playerNumber;
            }
            
            // Get actual user ID - prioritize payload, then socket.user
            let actualUserId = user_id || (socket.user && socket.user.id) || null;

            // Try to find in-memory pair for this socket
            // First check matchPairs (for casual/ranked 1v1 matches)
            // Then check socketToMatch (for lobby matches)
            let pair = matchPairs.get(socket.id) || socketToMatch[socket.id] || null;

            // Fallback: try to get from pair if not in payload
            if (!actualUserId && pair) {
                actualUserId = (player_id === 1) ? pair.player1_id : pair.player2_id;
                console.log('[SUBMIT_CODE] Got actualUserId from pair:', actualUserId);
            }
            
            console.log('[SUBMIT_CODE] Final actualUserId:', actualUserId, 'from:', actualUserId === user_id ? 'payload' : actualUserId === socket.user?.id ? 'socket.user' : 'pair');
            
            console.log('[SUBMIT_CODE] Received:', {
                player_id, // Should be 1 or 2
                user_id: actualUserId, // Database user ID
                match_id,
                mode
            });
            
            // DEBUG: Log submission details
            console.log('[SUBMIT_CODE DEBUG] problem_id:', problem_id);
            console.log('[SUBMIT_CODE DEBUG] language:', language);
            console.log('[SUBMIT_CODE DEBUG] source_code length:', source_code?.length || 0);
            console.log('[SUBMIT_CODE DEBUG] lobby_id:', lobby_id);

            // Format submission duration (time player spent on problem)
            const playerDuration = submission_duration || 0;
            const durationFormatted = `${Math.floor(playerDuration / 60)}:${String(playerDuration % 60).padStart(2, '0')}`;

            // basic safety check
            if (!isCodeSafe(source_code, language)) {
                socket.emit("judge_result", { success: false, message: "Forbidden commands detected!" });
                return;
            }
            let opponentId = null;
            let opponentPair = null;

            console.log('===== SUBMIT_CODE PAIR CHECK =====');
            console.log('socket.id:', socket.id);
            console.log('pair exists:', !!pair);
            console.log('pair source:', matchPairs.has(socket.id) ? 'matchPairs' : (socketToMatch[socket.id] ? 'socketToMatch' : 'none'));
            console.log('pair.mode:', pair?.mode);
            console.log('pair.lobbyId:', pair?.lobbyId);
            console.log('mode from payload:', mode);
            console.log('==================================');

            // If no in-memory pair, allow using provided match_id
            let matchIdToUse = match_id || (pair && pair.match_id) || null;

            // Allow submission without match for practice/testing
            if (!pair && !matchIdToUse) {
                console.log('No match found - allowing practice mode submission');
                // Continue execution without match_id for solo practice
            } else if (!pair && matchIdToUse) {
                // verify match exists in DB
                const [rows] = await db.query('SELECT match_id FROM duel_matches WHERE match_id = ?', [matchIdToUse]);
                if (!rows || rows.length === 0) {
                    console.log('Match ID not found in database:', matchIdToUse);
                    matchIdToUse = null; // Allow as practice mode
                }
            } else if (pair && !pair.lobbyId) {
                // Regular 1v1 match (casual/ranked) - has opponentId
                opponentId = pair.opponentId;
                opponentPair = matchPairs.get(opponentId) || null;
                matchIdToUse = matchIdToUse || pair.match_id || null;
            }
            // For lobby matches (pair.lobbyId exists), skip opponent lookup
            
            // DB fallback: if problem_id is still wrong/missing (pair gone + cache cold after restart),
            // try to read problem_id from the duel_matches table (requires problem_id column to exist there)
            if (!problem_id && match_id) {
                try {
                    const _numericMid = Number(match_id);
                    const [_matchRows] = await db.query('SELECT problem_id FROM duel_matches WHERE match_id = ?', [_numericMid]);
                    if (_matchRows && _matchRows.length > 0 && _matchRows[0].problem_id) {
                        console.log('[SUBMIT_CODE] Resolved problem_id ' + _matchRows[0].problem_id + ' from DB for match ' + _numericMid);
                        problem_id = _matchRows[0].problem_id;
                        matchProblemCache.set(_numericMid, problem_id); // warm the cache
                    }
                } catch (_e) { console.warn('[SUBMIT_CODE] DB problem_id fallback failed:', _e.message); }
            }
            console.log('[SUBMIT_CODE] About to load test cases...');

            // Load test cases
            const [testCases] = await db.query(
                "SELECT * FROM test_cases WHERE problem_id = ? ORDER BY test_case_number ASC",
                [problem_id]
            );
            
            console.log('[SUBMIT_CODE] Test cases query completed. Count:', testCases?.length || 0);
            
            if (!testCases || testCases.length === 0) {
                console.log('[SUBMIT_CODE] ❌ No test cases found, sending error to client');
                socket.emit("judge_result", { success: false, message: "No test cases found" });
                return;
            }
            
            console.log('[SUBMIT_CODE] ✅ Found', testCases.length, 'test cases, preparing file...');

            // Prepare file
            const safeId = `${Date.now()}_${socket.id.replace(/[^a-zA-Z0-9_-]/g,'')}`;
            filename = path.join(SANDBOX, `${safeId}`);
            
            console.log('[SUBMIT_CODE] Language:', language, '| SafeId:', safeId);

            if (language === 'python') {
                filename += '.py';
                fs.writeFileSync(filename, source_code, 'utf8');
            } else if (language === 'php') {
                filename += '.php';
                let phpCode = source_code.trim();
                if (!phpCode.startsWith('<?php')) phpCode = '<?php\n' + phpCode;
                fs.writeFileSync(filename, phpCode, 'utf8');
            } else if (language === 'java') {
                className = `Main${safeId}`;
                filename = path.join(SANDBOX, `${className}.java`);
                let javaCode = source_code.replace(/public\s+class\s+\w+/, `public class ${className}`);
                if (javaCode.includes('Scanner') && !javaCode.includes('import java.util.Scanner')) {
                    javaCode = 'import java.util.Scanner;\n' + javaCode;
                }
                fs.writeFileSync(filename, javaCode, 'utf8');
            } else {
                socket.emit("judge_result", { success: false, message: "Unsupported language" });
                return;
            }

            // Run test cases
            let passed = 0;
            const results = [];

            // JAVA: compile ONCE before the loop to avoid recompiling per test case
            let javaCompileError = null;
            if (language === 'java') {
                const compile = await runWithTimeout("javac", [filename], null, 5000);
                if (!compile.success) {
                    console.log(`[RUN ERROR] javac compile failed: ${compile.error}`);
                    javaCompileError = compile.error || "Compilation failed";
                } else {
                    console.log(`[RUN OK] javac compiled successfully`);
                }
            }

            for (const tc of testCases) {
                let runRes = null;
                if (language === 'python') {
                    runRes = await runWithTimeout(PYTHON_CMD || "python", [filename], tc.input_data, 2000);
                    if (!runRes.success) {
                        console.log(`[RUN ERROR] ${PYTHON_CMD || "python"} failed: ${runRes.error}`);
                    }
                } else if (language === 'php') {
                    runRes = await runWithTimeout("php", [filename], tc.input_data, 2000);
                    if (!runRes.success) {
                        console.log(`[RUN ERROR] php failed: ${runRes.error}`);
                    }
                } else if (language === 'java') {
                    if (javaCompileError) {
                        runRes = { success: false, output: '', error: javaCompileError };
                    } else {
                        runRes = await runWithTimeout("java", ["-cp", SANDBOX, className], tc.input_data, 2000);
                        if (!runRes.success) {
                            console.log(`[RUN ERROR] java run failed: ${runRes.error}`);
                        }
                    }
                }

                let actualOutput = '';
                let rawError = null;

                if (runRes && runRes.success) {
                    actualOutput = (runRes.output || '').toString().trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                } else if (runRes && runRes.error) {
                    rawError = runRes.error;
                    actualOutput = '';
                } else {
                    rawError = 'Unknown execution error';
                    actualOutput = '';
                }

                const expected = (tc.expected_output || '').toString().trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').toLowerCase();
                const actualNorm = actualOutput.replace(/\r\n/g, '\n').replace(/\r/g, '\n').toLowerCase();
                const correct = actualNorm === expected;

                console.log(`[TEST CASE] expected: ${JSON.stringify(expected)} | actual: ${JSON.stringify(actualNorm)} | match: ${correct}`);
                if (correct) passed++;

                results.push({
                    input: tc.input_data,
                    expected,
                    output: actualOutput,
                    passed: correct,
                    status: correct ? 'Accepted' : (rawError ? 'Runtime Error' : 'Wrong Answer'),
                    raw_run_success: !!(runRes && runRes.success),
                    raw_run_error: rawError
                });
            }

            const resultText = passed === testCases.length ? `Accepted (${passed}/${testCases.length})` : `Wrong Answer (${passed}/${testCases.length})`;
            // Clean verdict word used by Vue overlays (e.g. verdict === 'Accepted')
            const cleanVerdict = passed === testCases.length
                ? 'Accepted'
                : results.some(r => r.status === 'Runtime Error')
                    ? 'Runtime Error'
                    : 'Wrong Answer';

            // Save to DB - map player_id (1 or 2) to actual user_id from pair
            try {
                // DON'T redeclare actualUserId - use the one from earlier!
                // For lobby matches, actualUserId comes from payload/socket, not pair
                if (pair && !actualUserId) {
                    // Only map from pair if we don't already have actualUserId
                    actualUserId = (player_id === 1) ? pair.player1_id : pair.player2_id;
                }
                // Fallback: if no pair or no user_id, skip DB save to avoid FK error
                if (actualUserId && matchIdToUse) {
                    const [matchRows] = await db.query('SELECT match_id FROM duel_matches WHERE match_id = ?', [matchIdToUse]);
                    if (matchRows && matchRows.length > 0) {
                        await db.query(`INSERT INTO match_records (match_id, player_id, code_submitted, result, submitted_at) VALUES (?, ?, ?, ?, NOW())`, [matchIdToUse, actualUserId, source_code, resultText]);
                    }
                } else if (actualUserId) {
                    await db.query(`INSERT INTO match_records (player_id, code_submitted, result, submitted_at) VALUES (?, ?, ?, NOW())`, [actualUserId, source_code, resultText]);
                }
            } catch (dbErr) {
                console.error('DB save error for submit_code:', dbErr);
            }

            // Calculate score percentage and completion time
            const score = Math.round((passed / testCases.length) * 100);
            const completionTime = Date.now();

            // Prepare payload
            const resultPayload = {
                success: true,
                verdict: cleanVerdict,
                resultText,
                passed,
                total: testCases.length,
                score: score,
                completionTime: completionTime,
                duration: durationFormatted,
                results,
                isFinished: true,
                username: socket.user?.username || `Player${player_id}`,
                user_id: actualUserId, // CRITICAL: Use actualUserId from payload or socket
                player_id, // This is 1 or 2 (player position)
                language,
                submissionTime: Date.now()
            };

            console.log('Sending judge_result with username:', resultPayload.username, 'for player_id:', player_id);

            // Emit immediate personal feedback
            socket.emit("judge_result", resultPayload);
            
            // Broadcast to spectators if this is a lobby match
            if (lobby_id) {
                // Get username from database if not in socket.user
                let usernameForSpectator = socket.user?.username || `Player${player_id}`;
                if (actualUserId && !socket.user?.username) {
                    try {
                        const [userRows] = await db.query('SELECT username FROM users WHERE user_id = ?', [actualUserId]);
                        if (userRows && userRows.length > 0) {
                            usernameForSpectator = userRows[0].username;
                        }
                    } catch (err) {
                        console.error('[SPECTATOR] Error fetching username:', err);
                    }
                }
                
                // 🔧 Save lobby score to database for current round
                try {
                    const activeLobbyForScore = activeLobbies.get(Number(lobby_id));
                    // Load current_round from memory, fallback to DB if missing (survives full reconnect)
                    let currentRoundForScore = activeLobbyForScore?.lobbyData?.current_round;
                    if (!currentRoundForScore) {
                        const [[crRow]] = await db.query(
                            'SELECT COALESCE(current_round, 1) AS current_round FROM duel_lobby_rooms WHERE lobby_id = ?',
                            [Number(lobby_id)]
                        );
                        currentRoundForScore = crRow?.current_round || 1;
                        if (activeLobbyForScore?.lobbyData) activeLobbyForScore.lobbyData.current_round = currentRoundForScore;
                        console.log(`[LOBBY SCORE] Loaded current_round ${currentRoundForScore} from DB for lobby ${lobby_id}`);
                    }
                    await db.query(
                        `UPDATE duel_lobby_players 
                         SET score = ?, completion_time = ?, verdict = ? 
                         WHERE lobby_id = ? AND user_id = ? AND round_number = ?`,
                        [score, completionTime, resultText, lobby_id, actualUserId, currentRoundForScore]
                    );
                    console.log(`[LOBBY SCORE] Saved score ${score}% for user ${actualUserId} in lobby ${lobby_id} round ${currentRoundForScore}`);
                } catch (dbErr) {
                    console.error('[LOBBY SCORE] Failed to save score:', dbErr);
                }
                
                const leaderboardPayload = {
                    userId: actualUserId,
                    username: usernameForSpectator,
                    score: score,
                    completionTime: completionTime,
                    avatar_url: socket.user?.avatar_url || null
                };

                // Cache it
                if (!leaderboardCache.has(Number(lobby_id))) {
                    leaderboardCache.set(Number(lobby_id), new Map());
                }
                leaderboardCache.get(Number(lobby_id)).set(actualUserId, leaderboardPayload);

                // Broadcast leaderboard update to players AND spectators (inspector)
                io.to(`lobby_${lobby_id}`).emit('lobby_leaderboard_update', leaderboardPayload);
                io.to(`lobby_spectator_${lobby_id}`).emit('lobby_leaderboard_update', leaderboardPayload);
                console.log(`[LOBBY LEADERBOARD] Broadcasted to room lobby_${lobby_id} + spectators for ${usernameForSpectator} score:${score}`);

                // Broadcast judge result to spectators
                io.to(`lobby_spectator_${lobby_id}`).emit('player_judge_result', {
                    userId: actualUserId,
                    username: usernameForSpectator,
                    verdict: resultPayload.verdict,
                    score: score,
                    passed: resultPayload.passed,
                    total: resultPayload.total,
                    completionTime: completionTime,
                    results: resultPayload.results
                });
                console.log(`[SPECTATOR] Broadcasted judge result for user ${actualUserId} (${usernameForSpectator}) to lobby ${lobby_id} spectators`);
            }
            
            // OLD: Abandonment tracking now handled by AbandonmentTracker module
            // Player already called abandonmentTracker.playerSubmitted() from Onboarding.vue

            // --- STORE IN PER-MATCH RESULTS ---
            if (matchIdToUse) {
                if (!matchResults.has(matchIdToUse)) {
                    // Initialize match results with mode from payload (more reliable than pair)
                    const matchMode = mode || (pair && pair.mode) || 'casual';
                    console.log('===== INITIALIZING MATCH RESULTS =====');
                    console.log('match_id:', matchIdToUse);
                    console.log('mode from payload:', mode);
                    console.log('pair exists:', !!pair);
                    console.log('pair.mode:', pair?.mode);
                    console.log('matchMode being stored:', matchMode);
                    console.log('======================================');
                    matchResults.set(matchIdToUse, { mode: matchMode });
                }
                const store = matchResults.get(matchIdToUse);
                
                console.log('Retrieved matchResults store for match', matchIdToUse, '- mode:', store.mode);
                
                // Store by player_id (1 or 2) instead of socket.id for consistent ordering
                store[`player${player_id}`] = resultPayload;

                const opponentSocketId = opponentId || (pair && pair.opponentId) || null;
                const opponentPlayerId = (player_id === 1) ? 2 : 1;
                const opponentResult = store[`player${opponentPlayerId}`];

                if (opponentResult) {
                    // Both players finished - emit match_finished with correct ordering
                    console.log('===== MATCH_FINISHED DEBUG =====');
                    console.log('pair exists:', !!pair);
                    console.log('pair.mode:', pair?.mode);
                    console.log('store.mode (from first submission):', store.mode);
                    console.log('Checking actualMode...');
                    
                    // Use mode from store (set on first submission) instead of pair (might be cleared)
                    const actualMode = store.mode || (pair && pair.mode) || 'casual';
                    
                    console.log('actualMode result:', actualMode);
                    console.log('WARNING: If actualMode is casual but match was ranked, mode was never stored!');
                    console.log('================================');

                    // ===== CALCULATE AND UPDATE POINTS =====
                    const p1Data = store['player1'];
                    const p2Data = store['player2'];
                    
                    // Use modular match scoring - all calculations in one place
                    const scores = calculateMatchScores(p1Data, p2Data, actualMode);
                    
                    console.log('===== MATCH SCORING MODULE RESULTS =====');
                    console.log('Winner:', scores.winnerId === 1 ? 'Player 1' : scores.winnerId === 2 ? 'Player 2' : 'Tie');
                    console.log('Mode:', actualMode);
                    console.log('Player 1:', scores.player1);
                    console.log('Player 2:', scores.player2);
                    console.log('========================================');
                    
                    // Extract variables for backward compatibility with existing code
                    const { winnerId } = scores;
                    const p1CodePoints = scores.player1.codePoints;
                    const p2CodePoints = scores.player2.codePoints;
                    const p1TimeBonus = scores.player1.timeBonus;
                    const p2TimeBonus = scores.player2.timeBonus;
                    const p1DuelChange = scores.player1.duelPointsChange;
                    const p2DuelChange = scores.player2.duelPointsChange;
                    
                    // Create finalResult using module helper
                    const finalResult = createMatchResult(p1Data, p2Data, scores, actualMode);

                    console.log('Both players finished, emitting match_finished:', finalResult);
                    
                    // Get player IDs from match database
                    let player1UserId = null;
                    let player2UserId = null;
                    
                    console.log('Fetching player IDs for match:', matchIdToUse);
                    
                    if (matchIdToUse) {
                        try {
                            const [matchRows] = await db.query(
                                'SELECT player1_id, player2_id FROM duel_matches WHERE match_id = ?',
                                [matchIdToUse]
                            );
                            
                            console.log('DB query result:', matchRows);
                            
                            if (matchRows && matchRows.length > 0) {
                                player1UserId = matchRows[0].player1_id;
                                player2UserId = matchRows[0].player2_id;
                                console.log('Found player IDs from match:', { player1UserId, player2UserId });
                            } else {
                                console.log('No match rows found for match_id:', matchIdToUse);
                            }
                        } catch (err) {
                            console.error('Error fetching match player IDs:', err);
                        }
                    } else {
                        console.log('No matchIdToUse available');
                    }
                    
                    // Fallback to pair if available
                    if (!player1UserId && pair) player1UserId = pair.player1_id;
                    if (!player2UserId && pair) player2UserId = pair.player2_id;
                    
                    console.log('Final player IDs:', { player1UserId, player2UserId });
                    console.log('Will update stats:', { hasPlayer1: !!player1UserId, hasPlayer2: !!player2UserId });
                    
                    // CRITICAL FIX: Match duel points to correct user IDs
                    // The problem: player1/player2 in matchResults are based on socket order (who submitted first)
                    // But player1_id/player2_id in database are from matchmaking queue order
                    // We need to map the correct duel points change to the correct user
                    
                    console.log('=== MAPPING DUEL POINTS TO USER IDS ===');
                    console.log('p1Data (socket player 1):', p1Data.username, '- DuelChange:', p1DuelChange);
                    console.log('p2Data (socket player 2):', p2Data.username, '- DuelChange:', p2DuelChange);
                    console.log('Database player1_id:', player1UserId);
                    console.log('Database player2_id:', player2UserId);
                    
                    // Get actual user IDs from the result data
                    const p1ActualUserId = p1Data.user_id; // This is the actual user ID from socket.user
                    const p2ActualUserId = p2Data.user_id;
                    
                    console.log('p1 actual user_id:', p1ActualUserId);
                    console.log('p2 actual user_id:', p2ActualUserId);
                    
                    // CRITICAL BUG FIX: Ensure user_ids exist before proceeding
                    if (!p1ActualUserId || !p2ActualUserId) {
                        console.error('[DP BUG] Missing user_id in result data!');
                        console.error('  p1Data:', p1Data);
                        console.error('  p2Data:', p2Data);
                        console.error('  This will cause incorrect DP assignment!');
                    }
                    
                    // Use module to map scores to database player IDs (handles swapping)
                    const dbMapping = mapScoresToDatabasePlayers(
                        scores,
                        p1ActualUserId,
                        p2ActualUserId,
                        player1UserId,
                        player2UserId
                    );
                    
                    const codePointsForDbPlayer1 = dbMapping.dbPlayer1XP;
                    const duelChangeForDbPlayer1 = dbMapping.dbPlayer1DP;
                    const codePointsForDbPlayer2 = dbMapping.dbPlayer2XP;
                    const duelChangeForDbPlayer2 = dbMapping.dbPlayer2DP;
                    
                    // Update stats in database for both players
                    const updatePromises = [];
                    
                    if (player1UserId) {
                        console.log('Adding updatePlayerStats for Database Player 1, userId:', player1UserId, 'CodePoints:', codePointsForDbPlayer1, 'DuelChange:', duelChangeForDbPlayer1);
                        updatePromises.push(
                            updatePlayerStatsLocal(player1UserId, codePointsForDbPlayer1, duelChangeForDbPlayer1, actualMode)
                                .then(stats => {
                                    console.log('✓ Player 1 stats update SUCCESS:', stats);
                                    return { playerId: 1, userId: player1UserId, stats };
                                })
                                .catch(err => {
                                    console.error('✗ Player 1 stats update FAILED:', err);
                                    return { playerId: 1, userId: player1UserId, stats: null };
                                })
                        );
                    } else {
                        console.warn('⚠ Skipping Player 1 stats update - no userId');
                    }
                    
                    if (player2UserId) {
                        console.log('Adding updatePlayerStats for Database Player 2, userId:', player2UserId, 'CodePoints:', codePointsForDbPlayer2, 'DuelChange:', duelChangeForDbPlayer2);
                        updatePromises.push(
                            updatePlayerStatsLocal(player2UserId, codePointsForDbPlayer2, duelChangeForDbPlayer2, actualMode)
                                .then(stats => {
                                    console.log('✓ Player 2 stats update SUCCESS:', stats);
                                    return { playerId: 2, userId: player2UserId, stats };
                                })
                                .catch(err => {
                                    console.error('✗ Player 2 stats update FAILED:', err);
                                    return { playerId: 2, userId: player2UserId, stats: null };
                                })
                        );
                    } else {
                        console.warn('⚠ Skipping Player 2 stats update - no userId');
                    }
                    
                    // Update duel_matches table with winner and status
                    const winnerUserId = winnerId === 1 ? player1UserId : winnerId === 2 ? player2UserId : null;
                    
                    console.log('Updating duel_matches: match_id =', matchIdToUse, 'winner_id =', winnerUserId);
                    if (matchIdToUse) {
                        try {
                            const [result] = await db.query(
                                'UPDATE duel_matches SET winner_id = ?, status = ? WHERE match_id = ?',
                                [winnerUserId, 'completed', matchIdToUse]
                            );
                            console.log('✓ Updated duel_matches: affectedRows =', result.affectedRows);
                        } catch (err) {
                            console.error('✗ Error updating duel_matches:', err);
                        }
                    } else {
                        console.warn('⚠ Cannot update duel_matches - no matchIdToUse');
                    }
                    
                    // Wait for stats updates and notify clients
                    console.log('Awaiting', updatePromises.length, 'stats update promises...');
                    try {
                        const results = await Promise.all(updatePromises);
                        console.log('✓ All promises resolved, processing', results.length, 'results...');
                        const statsUpdates = {};
                        
                        for (const { playerId, userId, stats } of results) {
                            if (stats) {
                                statsUpdates[`player${playerId}_stats`] = stats;
                                console.log(`Player ${playerId} stats:`, JSON.stringify(stats, null, 2));
                                
                                // Calculate leaderboard rank for this player
                                let leaderboardRank = 1;
                                try {
                                    const [rankQuery] = await db.query(
                                        'SELECT COUNT(*) as rank FROM statistic WHERE statistic_duel_point > ?',
                                        [stats.newDuelPoints]
                                    );
                                    leaderboardRank = (rankQuery[0]?.rank || 0) + 1;
                                    console.log(`Player ${playerId} rank calculated: ${leaderboardRank} (DP: ${stats.newDuelPoints})`);
                                } catch (err) {
                                    console.error('Error calculating rank:', err);
                                }
                                
                                // Emit stats update to all sockets of this user
                                let emittedTo = 0;
                                io.sockets.sockets.forEach(s => {
                                    if (s.user && s.user.id === userId) {
                                        const statsPayload = {
                                            level: stats.newLevel,
                                            currentXP: stats.newXP - getTotalXPForLevel(stats.newLevel),
                                            totalXP: stats.newXP,
                                            xpForNextLevel: getXPForLevel(stats.newLevel),
                                            xpGained: stats.xpGained,
                                            duelPoints: stats.newDuelPoints,
                                            duelPointsChange: stats.duelPointsChange,
                                            leveledUp: stats.leveledUp,
                                            rank: leaderboardRank
                                        };
                                        
                                        console.log(`[DP DEBUG] Emitting to userId ${userId} (Player ${playerId}):`, {
                                            oldDP: stats.oldDuelPoints,
                                            change: stats.duelPointsChange,
                                            newDP: stats.newDuelPoints
                                        });
                                        
                                        s.emit('player_stats_update', statsPayload);
                                        emittedTo++;
                                    }
                                });
                                console.log(`✓ Emitted stats to ${emittedTo} socket(s) for userId ${userId}`);
                            } else {
                                console.warn(`⚠ No stats for player ${playerId}`);
                            }
                        }
                        
                        console.log('✓ All stats updated successfully');
                    } catch (err) {
                        console.error('✗ Error in Promise.all for stats updates:', err);
                    }

                    // emit final result to both players and any clients in the match room
                    const room = matchIdToUse ? `match_${matchIdToUse}` : null;
                    
                    console.log('[MATCH_FINISHED] ========================================');
                    console.log('[MATCH_FINISHED] Emitting to current socket:', socket.id);
                    socket.emit("match_finished", finalResult);
                    
                    // Find opponent socket - try multiple methods
                    let opponentSocket = null;
                    if (opponentSocketId) {
                        opponentSocket = io.sockets.sockets.get(opponentSocketId);
                        console.log('[MATCH_FINISHED] Opponent socket from opponentSocketId:', opponentSocketId, 'exists:', !!opponentSocket);
                        if (opponentSocket) {
                            opponentSocket.emit("match_finished", finalResult);
                        }
                    }
                    
                    // Also emit to room as fallback
                    if (room) {
                        const roomSockets = io.sockets.adapter.rooms.get(room);
                        console.log('[MATCH_FINISHED] Room', room, 'has', roomSockets ? roomSockets.size : 0, 'sockets');
                        io.to(room).emit("match_finished", finalResult);
                    }
                    
                    console.log('[MATCH_FINISHED] ========================================')

                    // CRITICAL FIX: Broadcast match completion to spectators if this is a lobby match
                    if (lobby_id) {
                        console.log(`[SPECTATOR] Broadcasting match completion to lobby ${lobby_id} spectators`);
                        io.to(`lobby_spectator_${lobby_id}`).emit('match_completed', {
                            lobbyId: lobby_id,
                            matchId: matchIdToUse,
                            winner: winnerId,
                            player1: {
                                username: p1Data.username,
                                userId: p1Data.user_id,
                                passed: p1Data.passed,
                                total: p1Data.total,
                                score: p1Data.score
                            },
                            player2: {
                                username: p2Data.username,
                                userId: p2Data.user_id,
                                passed: p2Data.passed,
                                total: p2Data.total,
                                score: p2Data.score
                            }
                        });
                    }

                    // Clean up abandonment tracking for this match
                    if (abandonmentTracker && matchIdToUse) {
                        abandonmentTracker.cleanupMatch(matchIdToUse);
                        console.log(`[ABANDON] Cleaned up tracking for match ${matchIdToUse}`);
                    }

                    // cache final result for late listeners (e.g., result page reload)
                    console.log('===== CACHING FINAL RESULT (USING MODULE) =====');
                    
                    // Use matchResults module to cache result
                    matchResultsUtil.cacheMatchResult(matchIdToUse, finalResult, finalResults);
                    
                    // cleanup matchResults but keep finalResults for replay
                    matchResults.delete(matchIdToUse);
                } else {
                    console.log(`Player ${player_id} finished, waiting for opponent...`);
                    // notify opponent they finished (optional)
                    if (opponentSocketId && opponentPair) {
                        io.to(opponentSocketId).emit("opponent_finished", resultPayload);
                    }
                }
            }

        } catch (err) {
            console.error("SUBMIT ERROR:", err);
            socket.emit("judge_result", { success: false, message: "Execution failed" });
        } finally {
            // CRITICAL: Always cleanup files, even on error
            if (filename) {
                try {
                    // Check if file exists before attempting delete
                    if (fs.existsSync(filename)) {
                        fs.unlinkSync(filename);
                        console.log('[CLEANUP] ✓ Deleted temp file:', filename);
                    } else {
                        console.log('[CLEANUP] ⓘ Temp file already cleaned up:', filename);
                    }
                } catch (e) {
                    // Only log actual errors, not missing files
                    if (e.code !== 'ENOENT') {
                        console.warn('[CLEANUP] ⚠️ Failed to delete temp file:', filename, e.message);
                    }
                }
            }
            
            if (language === 'java' && className) {
                try {
                    const classFile = path.join(SANDBOX, `${className}.class`);
                    if (fs.existsSync(classFile)) {
                        fs.unlinkSync(classFile);
                        console.log('[CLEANUP] ✓ Deleted compiled class:', classFile);
                    }
                } catch (e) {
                    if (e.code !== 'ENOENT') {
                        console.warn('[CLEANUP] ⚠️ Failed to delete class file:', e.message);
                    }
                }
            }
        }
    });


    // Handle rematch requests
    socket.on('request_rematch', ({ mode }) => {
        try {
            if (!matchPairs.has(socket.id)) {
                console.log('Player not in a match');
                return;
            }

            const pair = matchPairs.get(socket.id);
            const opponentId = pair.opponentId;
            const opponentSocket = io.sockets.sockets.get(opponentId);

            // Re-add both players to the queue for the same mode
            console.log(`Player requesting rematch in ${mode} mode`);

            // Get player info from existing pair
            const player1_info = {
                username: pair.opponentUsername,
                socket_id: socket.id,
                socket: socket,
                user_id: pair.player1_id,
                mode: mode
            };

            const player2_info = {
                username: pair.opponentUsername,
                socket_id: opponentId,
                socket: opponentSocket,
                user_id: pair.player2_id,
                mode: mode
            };

            // Clear the old match pair
            matchPairs.delete(socket.id);
            matchPairs.delete(opponentId);

            // Re-add to queue for new match
            if (!matchQueues[mode]) matchQueues[mode] = [];
            
            matchQueues[mode].push(player1_info);
            if (opponentSocket) {
                matchQueues[mode].push(player2_info);

                // Attempt to match them immediately or wait for queue
                if (matchQueues[mode].length >= 2) {
                    const p1 = matchQueues[mode].shift();
                    const p2 = matchQueues[mode].shift();

                    console.log(`Rematch found: ${p1.username} vs ${p2.username}`);

                    // Set up new match pair
                    matchPairs.set(p1.socket_id, { 
                        opponentId: p2.socket_id, 
                        opponentUsername: p2.username, 
                        mode, 
                        player1Ready: false, 
                        player2Ready: false,
                        player1_id: p1.user_id || null,
                        player2_id: p2.user_id || null
                    });
                    matchPairs.set(p2.socket_id, { 
                        opponentId: p1.socket_id, 
                        opponentUsername: p1.username, 
                        mode, 
                        player1Ready: false, 
                        player2Ready: false,
                        player1_id: p1.user_id || null,
                        player2_id: p2.user_id || null
                    });

                    // Notify both players that they're in onboarding for rematch
                    p1.socket.emit('match_found', {
                        player1: p1.username,
                        player2: p2.username,
                        mode: mode
                    });

                    p2.socket.emit('match_found', {
                        player1: p2.username,
                        player2: p1.username,
                        mode: mode
                    });
                }
            }
        } catch (err) {
            console.error("REMATCH ERROR:", err);
            socket.emit("rematch_error", { message: "Failed to create rematch" });
        }
    });

    // Allow clients (result page) to fetch final result if they missed the live event
    socket.on('get_match_result', ({ match_id }) => {
        if (!match_id) return;
        
        // Use matchResults module to retrieve cached result
        const cached = matchResultsUtil.getCachedResult(match_id, finalResults);
        
        if (cached) {
            socket.emit('match_finished', cached);
        }
    });

    // Allow result page to join the match-scoped room for live updates
    socket.on('join_match_room', ({ match_id }) => {
        if (!match_id) return;
        const room = `match_${match_id}`;
        try {
            socket.join(room);
        } catch (e) {
            console.warn('join_match_room failed:', room, e);
        }
    });

    // Get player statistics (for result page display)
    socket.on('get_player_stats', async () => {
        console.log('[get_player_stats] Request received from socket:', socket.id);
        console.log('[get_player_stats] socket.user:', socket.user);
        
        if (!socket.user || !socket.user.id) {
            console.warn('[get_player_stats] Socket not authenticated - socket.user:', socket.user);
            return;
        }
        
        const user_id = socket.user.id;
        console.log('[get_player_stats] Getting stats for authenticated user_id:', user_id);
        
        // Try to get duel points change from cached match result
        let duelPointsChange = 0;
        
        console.log('[get_player_stats] Searching for duel points change in', finalResults.size, 'cached matches');
        console.log('[get_player_stats] Current user_id:', user_id);
        
        // Check if we have a recent match result for this user
        for (const [matchId, result] of finalResults.entries()) {
            console.log('[get_player_stats] Checking match', matchId, '- player1:', result.player1?.username, '(id:', result.player1?.user_id, '), player2:', result.player2?.username, '(id:', result.player2?.user_id, ')');
            console.log('[get_player_stats] Match', matchId, 'p1DuelChange:', result.p1DuelChange, 'p2DuelChange:', result.p2DuelChange);
            
            if (result.player1?.user_id === user_id) {
                duelPointsChange = result.p1DuelChange || 0;
                console.log('[get_player_stats] ✅ Found duel points change for player1:', duelPointsChange);
                break;
            } else if (result.player2?.user_id === user_id) {
                duelPointsChange = result.p2DuelChange || 0;
                console.log('[get_player_stats] ✅ Found duel points change for player2:', duelPointsChange);
                break;
            }
        }
        
        if (duelPointsChange === 0) {
            console.log('[get_player_stats] ⚠️ No duel points change found in cached matches');
        }
        
        try {
            const [stats] = await db.query(
                'SELECT statistic_level, statistic_level_xp, statistic_duel_point FROM statistic WHERE user_id = ?',
                [user_id]
            );
            
            console.log('[get_player_stats] Database query result:', stats);
            
            if (stats && stats.length > 0) {
                const currentStats = stats[0];
                const levelInfo = getLevelFromXP(currentStats.statistic_level_xp);
                
                // Calculate leaderboard rank (position among all players)
                const [rankQuery] = await db.query(
                    'SELECT COUNT(*) as rank FROM statistic WHERE statistic_duel_point > ?',
                    [currentStats.statistic_duel_point]
                );
                const leaderboardRank = (rankQuery[0]?.rank || 0) + 1;
                
                console.log('[get_player_stats] Player DP:', currentStats.statistic_duel_point, 'Leaderboard Rank:', leaderboardRank);
                
                const payload = {
                    level: levelInfo.level,
                    currentXP: levelInfo.currentLevelXP,
                    totalXP: currentStats.statistic_level_xp,
                    xpForNextLevel: levelInfo.xpNeededForNextLevel,
                    duelPoints: currentStats.statistic_duel_point,
                    duelPointsChange: duelPointsChange, // Include the change if found
                    rank: leaderboardRank
                };
                
                // console.log('[get_player_stats] Emitting player_stats_update:', payload);
                socket.emit('player_stats_update', payload);
            } else {
                console.warn('[get_player_stats] No stats found for user_id:', user_id);
            }
        } catch (err) {
            console.error('[get_player_stats] Error:', err);
        }
    });

    // Get leaderboard data (top players sorted by duel points)
    socket.on('get_leaderboard', async ({ limit = 50, searchUsername = '', searchCountry = '', filterLanguage = null } = {}) => {
        // console.log('[get_leaderboard] Request received, limit:', limit, 'from user:', socket.user?.id);
        // console.log('[get_leaderboard] Filters - Username:', searchUsername, 'Country:', searchCountry, 'Language:', filterLanguage);
        
        try {
            // First check if we have any data at all
            const [statsCount] = await db.query('SELECT COUNT(*) as count FROM statistic');
            // console.log('[get_leaderboard] Total statistics records:', statsCount[0].count);
            
            const [usersCount] = await db.query('SELECT COUNT(*) as count FROM users');
            // console.log('[get_leaderboard] Total users:', usersCount[0].count);
            
            // Build dynamic query
            let query = `
                SELECT 
                    u.user_id,
                    u.username,
                    p.avatar_url,
                    s.statistic_level,
                    s.statistic_level_xp,
                    s.statistic_duel_point,
                    RANK() OVER (ORDER BY s.statistic_duel_point DESC) as rank_number
                FROM users u
                INNER JOIN statistic s ON u.user_id = s.user_id
                LEFT JOIN profiles p ON u.user_id = p.user_id
                WHERE 1=1
            `;
            
            const queryParams = [];
            
            // Add username search filter
            if (searchUsername && searchUsername.trim() !== '') {
                query += ` AND u.username LIKE ?`;
                queryParams.push(`%${searchUsername.trim()}%`);
            }
            
            // Add country search filter (when implemented)
            if (searchCountry && searchCountry.trim() !== '') {
                // TODO: Add country field to users table
                // query += ` AND u.country LIKE ?`;
                // queryParams.push(`%${searchCountry.trim()}%`);
            }
            
            // Add language filter (when implemented)
            if (filterLanguage) {
                // TODO: Track most played language per user
                // query += ` AND u.most_played_language = ?`;
                // queryParams.push(filterLanguage);
            }
            
            query += `
                ORDER BY s.statistic_duel_point DESC
                LIMIT ?
            `;
            queryParams.push(limit);
            
            const [leaderboard] = await db.query(query, queryParams);
            
            // console.log('[get_leaderboard] Found', leaderboard.length, 'players');
            // console.log('[get_leaderboard] Sample data:', leaderboard.slice(0, 2));
            socket.emit('leaderboard_data', leaderboard);
        } catch (err) {
            console.error('[get_leaderboard] Error:', err.message);
            console.error('[get_leaderboard] Full error:', err);
            socket.emit('leaderboard_data', []);
        }
    });

    // Get current user's rank in leaderboard
    socket.on('get_user_rank', async () => {
        const userId = socket.user?.id || socket.user?.user_id;
        // console.log('[get_user_rank] Request received for user:', userId);
        
        if (!userId) {
            console.warn('[get_user_rank] No user authenticated');
            return;
        }
        
        try {
            const [userRank] = await db.query(`
                SELECT 
                    u.user_id,
                    u.username,
                    p.avatar_url,
                    s.statistic_level,
                    s.statistic_level_xp,
                    s.statistic_duel_point,
                    (
                        SELECT COUNT(*) + 1
                        FROM statistic s2
                        WHERE s2.statistic_duel_point > s.statistic_duel_point
                    ) as rank_number
                FROM users u
                INNER JOIN statistic s ON u.user_id = s.user_id
                LEFT JOIN profiles p ON u.user_id = p.user_id
                WHERE u.user_id = ?
            `, [userId]);
            
            if (userRank.length > 0) {
                // console.log('[get_user_rank] User rank:', userRank[0].rank_number);
                socket.emit('user_rank_data', userRank[0]);
            } else {
                console.warn('[get_user_rank] User not found in statistics');
                socket.emit('user_rank_data', null);
            }
        } catch (err) {
            console.error('[get_user_rank] Error:', err.message);
            socket.emit('user_rank_data', null);
        }
    });

    // Get user statistics including win rate
    socket.on('get_user_stats', async (data = {}) => {
        // Try to get userId from multiple sources
        const userId = data.user_id || socket.user?.id || socket.user?.user_id;
        console.log('[get_user_stats] Request received from socket:', socket.id, 'user_id:', userId, 'socket.user:', socket.user, 'data.user_id:', data.user_id);

        if (!userId) {
            console.warn('[get_user_stats] No user_id found yet - socket authentication may still be pending');
            // Don't send error immediately - client will retry
            // Just send default values without error flag
            socket.emit('user_stats_data', {
                ranking: 'N/A',
                winStreaks: 0,
                winRate: '0%',
                duelPoints: 0
            });
            return;
        }

        try {
            // Get user's basic statistics and ranking
            const [userStats] = await db.query(`
                SELECT 
                    s.statistic_level,
                    s.statistic_level_xp,
                    s.statistic_duel_point,
                    (
                        SELECT COUNT(*) + 1
                        FROM statistic s2
                        WHERE s2.statistic_duel_point > s.statistic_duel_point
                    ) as ranking
                FROM statistic s
                WHERE s.user_id = ?
            `, [userId]);

            // Get total wins (matches where user is the winner)
            const [winsResult] = await db.query(`
                SELECT COUNT(*) as total_wins
                FROM duel_matches
                WHERE winner_id = ? AND status = 'completed'
            `, [userId]);

            // Get total matches (where user participated)
            const [matchesResult] = await db.query(`
                SELECT COUNT(*) as total_matches
                FROM duel_matches
                WHERE (player1_id = ? OR player2_id = ?) AND status = 'completed'
            `, [userId, userId]);

            // Calculate current win streak (consecutive wins from most recent matches)
            const [recentMatches] = await db.query(`
                SELECT winner_id, match_date
                FROM duel_matches
                WHERE (player1_id = ? OR player2_id = ?) AND status = 'completed'
                ORDER BY match_date DESC
                LIMIT 50
            `, [userId, userId]);

            let currentStreak = 0;
            for (const match of recentMatches) {
                if (match.winner_id === userId) {
                    currentStreak++;
                } else {
                    break; // Streak broken
                }
            }

            const totalWins = winsResult[0]?.total_wins || 0;
            const totalMatches = matchesResult[0]?.total_matches || 0;
            const winRate = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(0) : 0;

            const stats = {
                ranking: userStats[0]?.ranking || 'N/A',
                winStreaks: currentStreak,
                winRate: `${winRate}%`,
                duelPoints: userStats[0]?.statistic_duel_point || 0,
                level: userStats[0]?.statistic_level || 1,
                levelXp: userStats[0]?.statistic_level_xp || 0,
                totalWins: totalWins,
                totalMatches: totalMatches
            };

            console.log('[get_user_stats] Stats for user', userId, ':', stats);
            socket.emit('user_stats_data', stats);
        } catch (err) {
            console.error('[get_user_stats] Error:', err.message);
            console.error('[get_user_stats] Full error:', err);
            socket.emit('user_stats_data', {
                error: 'Database error',
                ranking: 'N/A',
                winStreaks: 0,
                winRate: '0%',
                duelPoints: 0
            });
        }
    });

});

// -----------------------------
// Cleanup stale lobbies on server startup
// -----------------------------
(async () => {
    try {
        console.log('[LOBBY] Cleaning up stale lobbies from previous server sessions...');
        
        // Delete all lobbies with status='waiting' since server restart clears in-memory state
        // Players will need to create new lobbies after server restart
        const [deleteResult] = await db.query(
            `DELETE FROM duel_lobby_rooms WHERE status = 'waiting'`
        );
        
        console.log(`[LOBBY] Cleaned up ${deleteResult.affectedRows} stale lobbies`);
    } catch (err) {
        console.error('[LOBBY] Error cleaning up stale lobbies:', err);
    }
})();

// -----------------------------
// Start the server (use PORT env or default to 3000)
// -----------------------------
const PORT = process.env.PORT || 3000;

// Bind explicitly to 0.0.0.0 to ensure listening on all interfaces
server.listen(PORT, '0.0.0.0', () => {
    const addr = server.address() || { address: '0.0.0.0', port: PORT };
    const host = (addr.address === '::' || addr.address === '0.0.0.0') ? 'localhost' : addr.address;
    console.log(`Server running on http://${host}:${addr.port} (bound to ${addr.address})`);
});

// Extra diagnostic: log raw HTTP requests for troubleshooting socket handshake
server.on('request', (req, res) => {
    try {
        if (req && req.url && req.url.startsWith('/socket.io')) {
            console.log('[RAW-HTTP] socket.io incoming', req.method, req.url, 'origin=', req.headers && req.headers.origin);
        }
    } catch (e) {}
});

// Better error reporting for address-in-use
server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the process using that port or set a different PORT environment variable.`);
    } else {
        console.error('Server error:', err);
    }
});

/**
 * AUTH COMPATIBILITY WRAPPERS
 * These wrappers bridge the legacy inline signatures with the refactored authHelpers.js logic.
 * This preserves functionality for socket handlers without code duplication.
 */
async function verifySession(token) {
    return auth.verifySession(db, token, process.env.JWT_SECRET);
}

async function verifyAdmin(session) {
    const userId = session?.userId || session?.user_id || session;
    return auth.verifyAdmin(db, userId);
}

async function hasPermission(userId, permissionName) {
    return auth.hasPermission(db, userId, permissionName);
}

async function getUserPrimaryRole(userId) {
    return auth.getUserPrimaryRole(db, userId);
}

function deriveCategory(name) {
    if (!name) return 'basic';
    const n = name.toLowerCase();
    if (n.includes('blog')) return 'blog';
    if (n.includes('event')) return 'event';
    if (n.includes('question')) return 'question set';
    if (n.includes('approval')) return 'manage approvals';
    if (n.includes('role')) return 'manage roles';
    return 'basic';
}