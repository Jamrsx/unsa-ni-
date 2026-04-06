<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { getSocket } from './js/socket.js';
import Window from './components/window.vue';
import CodeEditor from './components/codeeditor.vue';

const socket = getSocket();

// Get lobby info from URL
const urlParams = new URLSearchParams(window.location.search);
const lobbyId = urlParams.get('lobby_id');
const spectatorCode = urlParams.get('code');

console.log('[Inspector] URL Parameters:', { lobbyId, spectatorCode });
console.log('[Inspector] Full URL:', window.location.href);

// State
const lobby = ref(null);
const players = ref([]);
const problem = ref(null);
const playerCodes = ref({});
const playerLanguages = ref({});
const playerStatuses = ref({});
const playerResults = ref({});
const leaderboard = ref([]); // live leaderboard scores
const messages = ref([]);
const isConnected = ref(false);
const errorMessage = ref('');
const spectatorCount = ref(0);
const retryCount = ref(0);
const maxRetries = 5;

// Timer
const matchEndAt = ref(null);      // ms timestamp when match ends
const remainingTime = ref(0);      // seconds remaining
const timerInterval = ref(null);

function startInspectorTimer(endAtMs) {
  if (timerInterval.value) clearInterval(timerInterval.value);
  if (!endAtMs) return;
  matchEndAt.value = endAtMs;
  const tick = () => {
    const secs = Math.max(0, Math.floor((endAtMs - Date.now()) / 1000));
    remainingTime.value = secs;
    if (secs === 0) clearInterval(timerInterval.value);
  };
  tick();
  timerInterval.value = setInterval(tick, 1000);
}

function formatTimer(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Computed
const lobbyStatus = computed(() => {
  if (!lobby.value) return 'Unknown';
  return lobby.value.status === 'waiting' ? 'Waiting' : 
         lobby.value.status === 'in_progress' ? 'In Progress' : 
         lobby.value.status === 'completed' ? 'Completed' : 'Unknown';
});

// Function to join as spectator with retry logic
function joinAsSpectator(retryAttempt = 0) {
  console.log(`[Inspector] Attempting to join as spectator (attempt ${retryAttempt + 1}/${maxRetries})...`);
  
  socket.emit('join_as_spectator', { 
    lobbyId: parseInt(lobbyId),
    spectatorCode 
  }, (response) => {
    if (response.success) {
      console.log('[Inspector] ✓ Successfully joined as spectator:', response);
      lobby.value = response.lobby;
      players.value = response.players || [];
      problem.value = response.problem;
      isConnected.value = true;
      retryCount.value = 0;
      
      // Initialize player data structures
      players.value.forEach(player => {
        playerCodes.value[player.user_id] = '';
        playerLanguages.value[player.user_id] = 'Python';
        playerStatuses.value[player.user_id] = 'idle';
      });
      
      // Seed leaderboard from initial player list
      leaderboard.value = players.value.map(p => ({
        userId: Number(p.user_id),
        username: p.username,
        score: p.score || 0,
        completionTime: p.completion_time || null,
        disqualified: false
      })).sort((a, b) => b.score - a.score);

      // Start timer if match is in progress and we have timing info
      if (response.matchEndAt) {
        startInspectorTimer(response.matchEndAt);
      }

      // Log what we received for debugging
      console.log('[Inspector] Joined lobby. Players:', players.value.length, 'Problem:', problem.value?.title);
    } else {
      console.error(`[Inspector] ✗ Failed to join as spectator (attempt ${retryAttempt + 1}):`, response.error);
      
      if (retryAttempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryAttempt), 5000);
        console.log(`[Inspector] Retrying in ${delay}ms...`);
        errorMessage.value = `Connection failed. Retrying (${retryAttempt + 1}/${maxRetries})...`;
        retryCount.value = retryAttempt + 1;
        setTimeout(() => joinAsSpectator(retryAttempt + 1), delay);
      } else {
        console.error('[Inspector] ✗ Max retries reached, giving up');
        errorMessage.value = response.error || 'Failed to join spectator mode after multiple attempts.';
        setTimeout(() => { window.location.href = '/lobbies.html'; }, 5000);
      }
    }
  });
}

// Wait for socket to be both connected AND authenticated before joining.
// The root cause of the "Not authenticated" error is a race condition:
// socket.connect fires before the server emits 'authenticated' and sets socket.user.
function waitForAuthThenJoin() {
  // Best case: already fully ready
  if (socket.connected && socket.user?.id) {
    console.log('[Inspector] Already authenticated, joining immediately');
    joinAsSpectator(0);
    return;
  }

  // Not connected yet — wait for connect first, then recurse
  if (!socket.connected) {
    console.log('[Inspector] Socket not connected, waiting for connect event...');
    socket.once('connect', () => {
      console.log('[Inspector] Socket connected, checking auth...');
      waitForAuthThenJoin();
    });
    return;
  }

  // Connected but auth not set yet — wait for authenticated event
  console.log('[Inspector] Connected but not authenticated yet, waiting for authenticated event...');
  socket.once('authenticated', () => {
    console.log('[Inspector] ✓ Authenticated event received, joining as spectator');
    joinAsSpectator(0);
  });

  // Fallback: if authenticated event already fired and we missed it, try after 2s
  setTimeout(() => {
    if (!isConnected.value) {
      console.log('[Inspector] Auth wait timeout — attempting join anyway');
      joinAsSpectator(0);
    }
  }, 2000);
}

// ── RECONNECT HANDLER ────────────────────────────────────────────────────────
// When Socket.IO reconnects after a network blip it gets a NEW socket.id.
// The server forgets room membership, so we must re-emit join_as_spectator.
// This is the root cause of the "live leaderboard stops working" bug —
// once the transport cycles the inspector is no longer in lobby_240 /
// lobby_spectator_240 and misses all future broadcasts.
socket.on('connect', () => {
  // socket.io fires 'connect' on EVERY (re)connection, including the first one.
  // isConnected guards against double-joining on the very first connect,
  // because waitForAuthThenJoin() already handled that via socket.once('connect').
  // Only act on RECONNECTS (when isConnected was previously true).
  if (isConnected.value) {
    console.log('[Inspector] Socket RECONNECTED — re-joining spectator room');
    isConnected.value = false; // reset so joinAsSpectator can run again
    waitForAuthThenJoin();
  }
});


onMounted(() => {
  // Lock body/html to viewport — no scrollbars
  document.documentElement.style.height = '100%';
  document.documentElement.style.width = '100%';
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.margin = '0';
  document.body.style.height = '100%';
  document.body.style.width = '100%';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';

  console.log('[Inspector] Mounting inspector mode for lobby:', lobbyId);
  
  if (!lobbyId) {
    errorMessage.value = 'No lobby ID provided in URL';
    console.error('[Inspector] ERROR: No lobby_id parameter found');
    return;
  }

  // Wait for authenticated before joining (fixes "Not authenticated" race condition)
  waitForAuthThenJoin();
  
  // Listen for lobby updates (basic lobby info)
  socket.on('lobby_updated', (updatedLobby) => {
    console.log('[Inspector] Lobby updated:', updatedLobby);
    if (updatedLobby) lobby.value = updatedLobby;
    // lobby_updated from lobbyState doesn't include players array - handled by lobby_players_update
    console.log('[Inspector] Lobby metadata updated, playerCount:', updatedLobby?.playerCount);
  });
  
  // Listen for code updates
  // New enriched event that includes the players array
  socket.on('lobby_players_update', (data) => {
    console.log('[Inspector] lobby_players_update received:', data.players?.length, 'players');
    const newPlayers = data.players || [];
    // Filter out host if in spectator mode
    const hostId = socket.user?.id;
    players.value = newPlayers.filter(p => Number(p.user_id) !== Number(hostId));
    players.value.forEach(player => {
      if (!playerCodes.value[player.user_id]) {
        playerCodes.value[player.user_id] = '';
        playerLanguages.value[player.user_id] = 'Python';
        playerStatuses.value[player.user_id] = 'idle';
      }
    });
    console.log('[Inspector] Players updated:', players.value.length, 'players');
  });

  socket.on('player_code_update', (data) => {
    console.log('[Inspector] Player code update:', data);
    if (!data.userId) {
      console.warn('[Inspector] ⚠️ Code update received with null userId:', data);
      return;
    }
    playerCodes.value = Object.assign({}, playerCodes.value, { [data.userId]: data.code || '' });
    playerLanguages.value = Object.assign({}, playerLanguages.value, { [data.userId]: data.language || 'Python' });
    playerStatuses.value = Object.assign({}, playerStatuses.value, { [data.userId]: 'coding' });
    console.log('[Inspector] Updated code for player', data.userId, '- length:', (data.code || '').length);
  });
  
  // Listen for submission events
  socket.on('player_submitted', (data) => {
    console.log('[Inspector] Player submitted:', data);
    if (!data.userId) return;
    playerStatuses.value = Object.assign({}, playerStatuses.value, { [data.userId]: 'pending' });
  });
  
  // Listen for judge results
  socket.on('player_judge_result', (data) => {
    console.log('[Inspector] Player judge result:', data);
    if (data.userId === null || data.userId === undefined) return;
    const judgeKey = Number(data.userId);
    playerStatuses.value = Object.assign({}, playerStatuses.value, { [judgeKey]: 'done' });
    playerResults.value = Object.assign({}, playerResults.value, {
      [judgeKey]: {
        verdict: data.verdict,
        score: data.score,
        passed: data.passed,
        total: data.total,
        completionTime: data.completionTime,
        results: data.results || []
      }
    });
    console.log('[Inspector] Player', data.userId, 'results stored:', data.verdict, data.score + '%');
  });
  
  // Listen for chat messages
  socket.on('lobby_chat_message', (message) => {
    messages.value.push(message);
  });
  
  // Listen for spectator count updates
  socket.on('spectator_count_update', (data) => {
    spectatorCount.value = data.count;
  });
  
  // Listen for lobby start
  socket.on('lobby_started', (data) => {
    console.log('[Inspector] Lobby started — resetting round state');
    if (lobby.value) lobby.value.status = 'in_progress';
    // Clear previous round state
    leaderboard.value = [];
    Object.keys(playerStatuses.value).forEach(uid => { playerStatuses.value[uid] = 'idle'; });
    Object.keys(playerResults.value).forEach(uid => { delete playerResults.value[uid]; });
    Object.keys(playerCodes.value).forEach(uid => { playerCodes.value[uid] = ''; });
  });
  
  // Listen for match start (from spectator room)
  socket.on('match_started', (data) => {
    console.log('[Inspector] Match started — resetting round state', data);
    if (lobby.value) lobby.value.status = 'in_progress';
    // Clear previous round's leaderboard and player states for fresh display
    leaderboard.value = [];
    Object.keys(playerStatuses.value).forEach(uid => { playerStatuses.value[uid] = 'idle'; });
    Object.keys(playerResults.value).forEach(uid => { delete playerResults.value[uid]; });
    Object.keys(playerCodes.value).forEach(uid => { playerCodes.value[uid] = ''; });
    // Start timer from live event
    if (data.matchEndAt) {
      startInspectorTimer(data.matchEndAt);
    } else if (data.matchStartedAt && data.matchDuration) {
      startInspectorTimer(data.matchStartedAt + (data.matchDuration * 1000));
    }
  });
  
  // Listen for match completion
  socket.on('match_completed', (data) => {
    console.log('[Inspector] Match completed:', data);
    if (lobby.value) lobby.value.status = 'completed';
    // Stop timer
    if (timerInterval.value) { clearInterval(timerInterval.value); timerInterval.value = null; }
    remainingTime.value = 0;
  });

  // Live leaderboard updates
  socket.on('lobby_leaderboard_update', (data) => {
    console.log('[Inspector] Leaderboard update:', data);
    const entryUserId = Number(data.userId);
    const existing = leaderboard.value.findIndex(p => Number(p.userId) === entryUserId);
    const entry = {
      userId: entryUserId,
      username: data.username,
      score: data.score || 0,
      completionTime: data.completionTime || null,
      disqualified: data.disqualified || false
    };
    if (existing >= 0) {
      leaderboard.value[existing] = entry;
    } else {
      leaderboard.value.push(entry);
    }
    leaderboard.value.sort((a, b) =>
      b.score !== a.score ? b.score - a.score :
      (a.completionTime || Infinity) - (b.completionTime || Infinity)
    );
  });

  // Cheat events — mark disqualified player as done so allPlayersDone works
  socket.on('cheat_event', (data) => {
    if (data.type !== 'disqualified') return;
    const uid = Number(data.userId);
    console.log('[Inspector] Player', uid, 'disqualified');
    playerStatuses.value = Object.assign({}, playerStatuses.value, { [uid]: 'done' });
    playerResults.value = Object.assign({}, playerResults.value, {
      [uid]: { verdict: 'Disqualified', score: 0, passed: 0, total: 0, disqualified: true }
    });
    const username = players.value.find(p => Number(p.user_id) === uid)?.username || ('User ' + uid);
    const existing = leaderboard.value.findIndex(p => Number(p.userId) === uid);
    const entry = { userId: uid, username, score: 0, completionTime: null, disqualified: true };
    if (existing >= 0) leaderboard.value[existing] = entry;
    else leaderboard.value.push(entry);
    leaderboard.value.sort((a, b) =>
      b.score !== a.score ? b.score - a.score :
      (a.completionTime || Infinity) - (b.completionTime || Infinity)
    );
  });
});

onBeforeUnmount(() => {
  if (timerInterval.value) clearInterval(timerInterval.value);
  if (lobbyId) socket.emit('leave_spectator', { lobbyId: parseInt(lobbyId) });
  socket.off('lobby_updated');
  socket.off('player_code_update');
  socket.off('player_submitted');
  socket.off('player_judge_result');
  socket.off('lobby_chat_message');
  socket.off('spectator_count_update');
  socket.off('lobby_started');
  socket.off('match_started');
  socket.off('match_completed');
  socket.off('lobby_leaderboard_update');
  socket.off('cheat_event');
  socket.off('lobby_players_update');
});

// Helper function to get player status badge
function getStatusBadge(userId) {
  const status = playerStatuses.value[userId] || 'idle';
  const badges = {
    idle:      { text: 'Idle',       class: 'status-idle',      icon: '⏸️' },
    coding:    { text: 'Coding',     class: 'status-coding',    icon: '💻' },
    pending:   { text: 'Judging...', class: 'status-pending',   icon: '⏳' },
    submitted: { text: 'Submitted',  class: 'status-submitted', icon: '📤' },
    done:      { text: 'Done',       class: 'status-done',      icon: '✅' }
  };
  return badges[status] || badges.idle;
}

const allPlayersDone = computed(() => {
  if (players.value.length === 0) return false;
  return players.value.every(player => {
    const uid = Number(player.user_id);
    const result = playerResults.value[uid];
    // Count as done if they have a result (including disqualification)
    return !!result;
  });
});

function formatCompletionTime(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString();
}

function backToRoom() {
  const code = lobby.value?.room_code;
  if (code) {
    window.location.href = '/room.html?code=' + code + '&rejoining=1';
  } else {
    window.location.href = '/lobbies.html';
  }
}

function getPlayerReadyStatus(player) {
  return player.is_ready === 1 ? '✓ Ready' : '⏳ Not Ready';
}
</script>

<template>
  <!-- ══ ERROR STATE ══ -->
  <div v-if="errorMessage && retryCount >= maxRetries" class="full-screen full-screen--error">
    <div class="state-card">
      <div class="state-icon state-icon--error">⚠</div>
      <h2>Connection Failed</h2>
      <p>{{ errorMessage }}</p>
      <small>Redirecting to lobbies…</small>
    </div>
  </div>

  <!-- ══ LOADING STATE ══ -->
  <div v-else-if="!isConnected" class="full-screen full-screen--loading">
    <div class="state-card">
      <div class="orb-loader">
        <div class="orb-ring r1"></div>
        <div class="orb-ring r2"></div>
        <div class="orb-ring r3"></div>
        <div class="orb-core">👁</div>
      </div>
      <p class="state-label">{{ retryCount === 0 ? 'Connecting to match…' : errorMessage || `Retry ${retryCount}/${maxRetries}` }}</p>
    </div>
  </div>

  <!-- ══ INSPECTOR VIEW ══ -->
  <template v-else>
    <div class="insp-root">

      <!-- TOP NAV -->
      <header class="insp-nav">
        <!-- Left: branding + room -->
        <div class="nav-left">
          <div class="nav-brand">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>INSPECTOR</span>
          </div>
          <div class="nav-sep"></div>
          <span class="nav-room">{{ lobby.room_name || lobby.room_code }}</span>
          <div v-if="problem" class="nav-problem">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            {{ problem.title }}
          </div>
        </div>

        <!-- Center: status pill + timer -->
        <div class="nav-center">
          <div :class="['status-pill', lobby.status === 'in_progress' ? 'pill--live' : lobby.status === 'completed' ? 'pill--done' : 'pill--wait']">
            <span class="pill-dot"></span>
            {{ lobby.status === 'in_progress' ? 'LIVE' : lobby.status === 'completed' ? 'MATCH ENDED' : 'WAITING' }}
          </div>
          <!-- Match timer — only shown during in_progress -->
          <div v-if="lobby.status === 'in_progress' && matchEndAt" :class="['insp-timer', remainingTime < 60 ? 'timer--crit' : remainingTime < 120 ? 'timer--warn' : 'timer--ok']">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {{ formatTimer(remainingTime) }}
          </div>
        </div>

        <!-- Right: meta + back -->
        <div class="nav-right">
          <div class="nav-stat">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            <span>{{ players.length }} players</span>
          </div>
          <div class="nav-stat">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>{{ spectatorCount }} watching</span>
          </div>
          <button v-if="allPlayersDone" @click="backToRoom" class="btn-back">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Room
          </button>
        </div>
      </header>

      <!-- BODY: main grid + sidebar -->
      <div class="insp-body">

        <!-- ── MAIN: Player Cards ── -->
        <div class="insp-main">
          <div class="players-grid">
            <div
              v-for="player in players"
              :key="player.user_id"
              :class="['pcard', {
                'pcard--coding':  playerStatuses[player.user_id] === 'coding',
                'pcard--judging': playerStatuses[player.user_id] === 'pending',
                'pcard--done':    playerStatuses[player.user_id] === 'done',
              }]"
            >
              <!-- Card top bar with accent glow -->
              <div class="pcard-topbar"></div>

              <!-- Header -->
              <div class="pcard-header">
                <div class="pcard-ident">
                  <div class="pcard-avatar">{{ (player.username || '?')[0].toUpperCase() }}</div>
                  <div class="pcard-meta">
                    <span class="pcard-name">{{ player.username }}</span>
                    <span class="pcard-lang">
                      <span class="lang-dot"></span>
                      {{ playerLanguages[player.user_id] || 'Python' }}
                    </span>
                  </div>
                </div>
                <span :class="['pcard-badge', 'badge--' + (playerStatuses[player.user_id] || 'idle')]">
                  {{ getStatusBadge(player.user_id).icon }} {{ getStatusBadge(player.user_id).text }}
                </span>
              </div>

              <!-- Score row (after submission) -->
              <div v-if="playerResults[Number(player.user_id)]" class="pcard-result">
                <!-- Disqualified -->
                <div v-if="playerResults[Number(player.user_id)].disqualified" class="dq-result-banner">
                  ⛔ DISQUALIFIED - score voided
                </div>
                <!-- Normal result -->
                <template v-else>
                  <div class="result-bar-wrap">
                    <div
                      class="result-bar"
                      :style="{
                        width: playerResults[Number(player.user_id)].score + '%',
                        '--bar-color': playerResults[Number(player.user_id)].score === 100 ? '#22c55e' :
                                        playerResults[Number(player.user_id)].score > 0  ? '#f59e0b' : '#ef4444'
                      }"
                    ></div>
                  </div>
                  <div class="result-stats">
                    <span class="result-score"
                      :style="{ color: playerResults[Number(player.user_id)].score === 100 ? '#4ade80' : playerResults[Number(player.user_id)].score > 0 ? '#fbbf24' : '#f87171' }">
                      {{ playerResults[Number(player.user_id)].score }}%
                    </span>
                    <span class="result-tests">{{ playerResults[Number(player.user_id)].passed }}/{{ playerResults[Number(player.user_id)].total }} passed</span>
                    <span :class="['result-verdict', playerResults[Number(player.user_id)].verdict?.includes('Accepted') ? 'vrd--ac' : 'vrd--wa']">
                      {{ playerResults[Number(player.user_id)].verdict?.includes('Accepted') ? 'ACCEPTED' : 'WRONG' }}
                    </span>
                  </div>
                  <div v-if="playerResults[Number(player.user_id)]?.results?.length" class="result-dots">
                    <span
                      v-for="(r, i) in playerResults[Number(player.user_id)].results"
                      :key="i"
                      :class="['tc-dot', r.status === 'Accepted' ? 'dot--pass' : 'dot--fail']"
                      :title="'Test ' + (i+1) + ': ' + r.status"
                    ></span>
                  </div>
                </template>
              </div>

              <!-- Code editor — fixed height box -->
              <div class="pcard-code">
                <CodeEditor
                  v-model="playerCodes[player.user_id]"
                  :language="(playerLanguages[player.user_id] || 'Python').toLowerCase()"
                  :readonly="true"
                  placeholder="Waiting for code…"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- ── SIDEBAR ── -->
        <aside class="insp-side">

          <!-- Leaderboard -->
          <div class="scard">
            <div class="scard-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span>Leaderboard</span>
              <span v-if="leaderboard.length" class="scard-count">{{ leaderboard.length }}</span>
            </div>
            <div v-if="leaderboard.length === 0" class="scard-empty">
              <div class="empty-pulse"></div>
              <span>Waiting for submissions…</span>
            </div>
            <div v-else class="lb-list">
              <div
                v-for="(entry, idx) in leaderboard"
                :key="entry.userId"
                :class="['lb-row', entry.disqualified ? 'lb--dq' : idx === 0 ? 'lb--gold' : idx === 1 ? 'lb--silver' : idx === 2 ? 'lb--bronze' : '']"
              >
                <div class="lb-rank">
                  <span v-if="entry.disqualified">⛔</span>
                  <span v-else-if="idx === 0">🥇</span>
                  <span v-else-if="idx === 1">🥈</span>
                  <span v-else-if="idx === 2">🥉</span>
                  <span v-else class="lb-ranknum">#{{ idx+1 }}</span>
                </div>
                <span class="lb-name" :style="entry.disqualified ? 'opacity:0.5;text-decoration:line-through' : ''">{{ entry.username }}</span>
                <div class="lb-bar-wrap">
                  <span v-if="entry.disqualified" class="lb-dq-label">DQ</span>
                  <template v-else>
                    <div class="lb-bar" :style="{ width: entry.score + '%', '--bar-c': entry.score === 100 ? '#22c55e' : entry.score > 0 ? '#f59e0b' : '#4a5568' }"></div>
                    <span class="lb-pct">{{ entry.score }}%</span>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Problem -->
          <div class="scard" v-if="problem">
            <div class="scard-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span>Problem</span>
            </div>
            <div class="prob-body">
              <div class="prob-title">{{ problem.title }}</div>
              <div class="prob-desc" v-html="problem.description"></div>
            </div>
          </div>

          <!-- Chat -->
          <div class="scard scard--chat">
            <div class="scard-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              <span>Chat</span>
              <span class="scard-ro">read-only</span>
            </div>
            <div class="chat-list">
              <div v-for="(msg, i) in messages" :key="i" class="chat-row">
                <span class="chat-user">{{ msg.username }}</span>
                <span class="chat-msg">{{ msg.message }}</span>
              </div>
              <div v-if="messages.length === 0" class="scard-empty">
                <span>No messages yet</span>
              </div>
            </div>
          </div>

        </aside>
      </div>
    </div>
  </template>
</template>

<style scoped>
/* ══ CSS TOKENS ══ */
.insp-root, .full-screen, .full-screen--loading, .full-screen--error {
  --bg:        #080b10;
  --surface:   #0d1117;
  --surface2:  #131920;
  --border:    rgba(255,255,255,0.07);
  --border2:   rgba(255,255,255,0.12);
  --text:      #e6edf3;
  --muted:     rgba(255,255,255,0.5);
  --accent:    #58a6ff;
  --green:     #3fb950;
  --amber:     #d29922;
  --red:       #f85149;
  --nav-h:     48px;
}

/* ══ ROOT ══ */
.insp-root {
  height: 100vh;
  width: 100vw;
  max-width: 100vw;
  overflow: hidden;
  background: #080b10;
  color: #e6edf3;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  /* Subtle scanline texture for depth */
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255,255,255,0.008) 2px,
      rgba(255,255,255,0.008) 4px
    );
}

/* ══ NAV ══ */
.insp-nav {
  height: var(--nav-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: #0d1420;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  flex-shrink: 0;
  gap: 16px;
  position: relative;
  z-index: 100;
}
/* Accent line at very top of nav */
.insp-nav::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, #58a6ff 0%, #3fb950 50%, #f0883e 100%);
}

.nav-left  { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.nav-center{ display: flex; align-items: center; justify-content: center; }
.nav-right { display: flex; align-items: center; gap: 14px; flex: 1; justify-content: flex-end; }

.nav-brand {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 900; letter-spacing: 0.2em;
  color: #79c0ff; white-space: nowrap;
  text-shadow: 0 0 12px rgba(88,166,255,0.6);
}
.nav-sep { width: 1px; height: 18px; background: rgba(255,255,255,0.12); flex-shrink: 0; }
.nav-room {
  font-size: 13px; font-weight: 700; color: #ffffff;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;
}
.nav-problem {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: rgba(255,255,255,0.75);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px;
}

/* Status pill */
.status-pill {
  display: flex; align-items: center; gap: 7px;
  padding: 5px 14px; border-radius: 20px;
  font-size: 10px; font-weight: 800; letter-spacing: 0.14em;
  border: 1px solid transparent;
}
.pill--live   { background: rgba(63,185,80,0.1);  color: #3fb950; border-color: rgba(63,185,80,0.25); }
.pill--done   { background: rgba(88,166,255,0.1); color: #58a6ff; border-color: rgba(88,166,255,0.25); }
.pill--wait   { background: rgba(210,153,34,0.1); color: #d29922; border-color: rgba(210,153,34,0.25); }
.pill-dot {
  width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0;
}
.pill--live .pill-dot { animation: liveBlink 1.2s ease-in-out infinite; }
@keyframes liveBlink { 0%,100%{opacity:1;box-shadow:0 0 0 0 currentColor;}50%{opacity:0.4;box-shadow:0 0 6px currentColor;} }

.nav-stat {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: rgba(255,255,255,0.85);
  white-space: nowrap; font-weight: 600;
}

/* ══ INSPECTOR TIMER ══ */
.insp-timer {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 14px; border-radius: 20px;
  font-size: 13px; font-weight: 900; letter-spacing: 0.08em;
  font-family: 'SF Mono', 'Fira Code', monospace;
  border: 1px solid transparent;
  margin-left: 10px;
  transition: all 0.3s ease;
}
.timer--ok   { background: rgba(63,185,80,0.08);   color: #3fb950; border-color: rgba(63,185,80,0.2); }
.timer--warn { background: rgba(210,153,34,0.1);   color: #e3b341; border-color: rgba(210,153,34,0.3); }
.timer--crit {
  background: rgba(248,81,73,0.12); color: #f85149;
  border-color: rgba(248,81,73,0.4);
  animation: timer-crit-pulse 0.8s ease-in-out infinite;
}
@keyframes timer-crit-pulse { 0%,100%{opacity:1;} 50%{opacity:0.65;} }

.btn-back {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.12);
  background: rgba(88,166,255,0.1); color: #58a6ff;
  font-size: 11px; font-weight: 700; letter-spacing: 0.04em; cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.btn-back:hover { background: rgba(88,166,255,0.2); border-color: rgba(88,166,255,0.4); }

/* ══ BODY LAYOUT ══ */
.insp-body {
  display: grid;
  grid-template-columns: 1fr 270px;
  grid-template-rows: 1fr;
  flex: 1; min-height: 0; overflow: hidden;
  align-items: stretch;
}

.insp-main {
  padding: 12px;
  overflow-y: auto;
  border-right: 1px solid rgba(255,255,255,0.07);
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.08) transparent;
  /* Must be height:100% so children can use calc relative to viewport */
  box-sizing: border-box;
}
.insp-main::-webkit-scrollbar { width: 4px; }
.insp-main::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

.insp-side {
  display: flex; flex-direction: column; gap: 8px;
  padding: 12px; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
}
.insp-side::-webkit-scrollbar { width: 3px; }
.insp-side::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* ══ PLAYER GRID ══ */
.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
  align-content: start;
}

/* ══ PLAYER CARD ══ */
.pcard {
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  overflow: hidden;
  display: flex; flex-direction: column;
  /* Natural height based on content */
  transition: border-color 0.3s, box-shadow 0.3s;
  position: relative;
}

/* Colored top accent bar */
.pcard-topbar {
  height: 3px; flex-shrink: 0;
  background: rgba(255,255,255,0.07);
  transition: background 0.3s;
}
.pcard--coding  { border-color: rgba(88,166,255,0.3); }
.pcard--coding  .pcard-topbar { background: linear-gradient(90deg, #58a6ff, #1f6feb); }
.pcard--coding  { box-shadow: 0 0 20px rgba(88,166,255,0.06); }

.pcard--judging { border-color: rgba(210,153,34,0.4); }
.pcard--judging .pcard-topbar { background: linear-gradient(90deg, #d29922, #e3b341); animation: topbar-pulse 1s ease-in-out infinite; }

.pcard--done    { border-color: rgba(63,185,80,0.35); }
.pcard--done    .pcard-topbar { background: linear-gradient(90deg, #3fb950, #2ea043); }
.pcard--done    { box-shadow: 0 0 20px rgba(63,185,80,0.06); }

@keyframes topbar-pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }

/* Card header */
.pcard-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 14px; gap: 10px; flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.018);
}
.pcard-ident  { display: flex; align-items: center; gap: 10px; }
.pcard-avatar {
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg, #1f6feb, #58a6ff);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 14px; color: #fff;
}
.pcard-meta { display: flex; flex-direction: column; gap: 2px; }
.pcard-name { font-weight: 700; font-size: 13px; color: #e6edf3; }
.pcard-lang {
  display: flex; align-items: center; gap: 5px;
  font-size: 10px; color: rgba(255,255,255,0.5);
}
.lang-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #3fb950; box-shadow: 0 0 5px rgba(63,185,80,0.7);
}

/* Status badges */
.pcard-badge {
  padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700;
  letter-spacing: 0.04em; white-space: nowrap; flex-shrink: 0;
}
.badge--idle     { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.3); }
.badge--coding   { background: rgba(88,166,255,0.12); color: #79c0ff; border: 1px solid rgba(88,166,255,0.25); }
.badge--pending  { background: rgba(210,153,34,0.12); color: #e3b341; border: 1px solid rgba(210,153,34,0.3); animation: badge-pulse 1s ease-in-out infinite; }
.badge--done     { background: rgba(63,185,80,0.12);  color: #56d364; border: 1px solid rgba(63,185,80,0.25); }
.badge--submitted{ background: rgba(63,185,80,0.08);  color: #3fb950; }
@keyframes badge-pulse { 0%,100%{opacity:1;}50%{opacity:0.6;} }

/* Result row */
.pcard-result {
  padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.015); flex-shrink: 0;
  display: flex; flex-direction: column; gap: 7px;
}
.result-bar-wrap {
  height: 4px; background: rgba(255,255,255,0.06);
  border-radius: 2px; overflow: hidden;
}
.result-bar {
  height: 100%; border-radius: 2px;
  background: var(--bar-color, #3fb950);
  transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1);
}
.result-stats {
  display: flex; align-items: center; gap: 10px;
}
.result-score { font-size: 15px; font-weight: 900; letter-spacing: -0.02em; }
.result-tests { font-size: 11px; color: rgba(255,255,255,0.55); flex: 1; }
.result-verdict {
  font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.06em;
}
.vrd--ac { background: rgba(63,185,80,0.15); color: #56d364; }
.vrd--wa { background: rgba(248,81,73,0.15);  color: #ffa198; }

.result-dots { display: flex; flex-wrap: wrap; gap: 3px; }
.tc-dot { width: 9px; height: 9px; border-radius: 2px; }
.dot--pass { background: #3fb950; }
.dot--fail { background: #f85149; }

/* Code editor box — fixed height, no flex magic needed */
.pcard-code {
  width: 100%;
  height: 320px;
  overflow: hidden;
  background: #0d1117;
  border-top: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}
.pcard-code :deep(.code-editor),
.pcard-code :deep(.cm-editor),
.pcard-code :deep(.CodeMirror) {
  width: 100% !important;
  height: 320px !important;
}
/* Force dark theme on CodeMirror regardless of component default */
/* CodeMirror 5 dark overrides */
.pcard-code :deep(.CodeMirror)                { background: #0d1117 !important; color: #e6edf3 !important; }
.pcard-code :deep(.CodeMirror-wrap)           { background: #0d1117 !important; }
.pcard-code :deep(.CodeMirror-scroll)         { background: #0d1117 !important; }
.pcard-code :deep(.CodeMirror-sizer)          { background: #0d1117 !important; }
.pcard-code :deep(.CodeMirror-gutters)        { background: #0d1117 !important; border-right: 1px solid rgba(255,255,255,0.08) !important; }
.pcard-code :deep(.CodeMirror-gutter)         { background: #0d1117 !important; }
.pcard-code :deep(.CodeMirror-linenumber)     { color: rgba(255,255,255,0.22) !important; }
.pcard-code :deep(.CodeMirror-cursor)         { border-left-color: #58a6ff !important; }
.pcard-code :deep(.CodeMirror-selected)       { background: rgba(88,166,255,0.15) !important; }
.pcard-code :deep(.CodeMirror-line)           { color: #e6edf3 !important; }
/* CodeMirror 6 dark overrides */
.pcard-code :deep(.cm-editor)                 { background: #0d1117 !important; color: #e6edf3 !important; }
.pcard-code :deep(.cm-scroller)               { background: #0d1117 !important; }
.pcard-code :deep(.cm-content)                { color: #e6edf3 !important; caret-color: #58a6ff !important; background: #0d1117 !important; }
.pcard-code :deep(.cm-gutters)                { background: #0d1117 !important; border-right: 1px solid rgba(255,255,255,0.08) !important; color: rgba(255,255,255,0.22) !important; }
.pcard-code :deep(.cm-gutter)                 { background: #0d1117 !important; }
.pcard-code :deep(.cm-lineNumbers)            { background: #0d1117 !important; }
.pcard-code :deep(.cm-activeLineGutter)       { background: rgba(255,255,255,0.03) !important; }
.pcard-code :deep(.cm-activeLine)             { background: rgba(255,255,255,0.03) !important; }
.pcard-code :deep(.cm-selectionBackground)    { background: rgba(88,166,255,0.2) !important; }
/* Nuclear: any element inside pcard-code that has a light background */
.pcard-code :deep([style*="background"]) { background: #0d1117 !important; }

/* ══ SIDEBAR CARDS ══ */
.scard {
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px; overflow: hidden;
  display: flex; flex-direction: column;
  flex-shrink: 0;
}
.scard--chat { flex-shrink: 1; min-height: 120px; }

.scard-header {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 13px; border-bottom: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.025); flex-shrink: 0;
  font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: rgba(255,255,255,0.75);
}
.scard-header svg { opacity: 0.7; flex-shrink: 0; }
.scard-count {
  margin-left: auto; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.4);
  padding: 1px 7px; border-radius: 9px; font-size: 10px; font-weight: 700; font-family: monospace;
}
.scard-ro {
  margin-left: auto; font-size: 9px; color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.04); padding: 2px 7px; border-radius: 8px; letter-spacing: 0.04em;
}
.scard-empty {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 18px; font-size: 11px; color: rgba(255,255,255,0.22); font-style: italic;
}
.empty-pulse {
  width: 7px; height: 7px; border-radius: 50%; background: #3fb950; flex-shrink: 0;
  animation: lbpulse 1.5s ease-in-out infinite;
}
@keyframes lbpulse { 0%,100%{box-shadow:0 0 0 0 rgba(63,185,80,0.5);}50%{box-shadow:0 0 0 8px rgba(63,185,80,0);} }

/* Leaderboard */
.lb-list { display: flex; flex-direction: column; padding: 7px; gap: 3px; }
.lb-row {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px; border-radius: 7px;
  border: 1px solid transparent;
  background: rgba(255,255,255,0.025);
  transition: background 0.15s;
}
.lb-row:hover { background: rgba(255,255,255,0.05); }
.lb--gold   { background: rgba(255,214,0,0.06);    border-color: rgba(255,214,0,0.15); }
.lb--silver { background: rgba(192,192,210,0.04);  border-color: rgba(192,192,210,0.12); }
.lb--bronze { background: rgba(205,127,50,0.05);   border-color: rgba(205,127,50,0.14); }
.lb-rank    { width: 22px; text-align: center; font-size: 14px; flex-shrink: 0; }
.lb-ranknum { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); }
.lb-name    { flex: 1; font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #e6edf3; }
.lb-bar-wrap {
  position: relative; width: 64px; height: 18px;
  background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; flex-shrink: 0;
}
.lb-bar {
  position: absolute; left:0; top:0; bottom:0;
  background: var(--bar-c, #3fb950);
  transition: width 0.7s ease; border-radius: 4px;
}
.lb-pct {
  position: absolute; right: 5px; top: 50%; transform: translateY(-50%);
  font-size: 10px; font-weight: 800; color: #fff; z-index: 1;
}

/* Problem */
.prob-body { padding: 11px 13px; display: flex; flex-direction: column; gap: 7px; }
.prob-title { font-size: 12px; font-weight: 700; color: #58a6ff; }
.prob-desc  {
  font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.65;
  max-height: 140px; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
}

/* Chat */
.chat-list {
  display: flex; flex-direction: column; gap: 5px;
  padding: 8px; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
}
.chat-list::-webkit-scrollbar { width: 3px; }
.chat-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.chat-row  { font-size: 11px; line-height: 1.5; }
.chat-user { font-weight: 700; color: #58a6ff; margin-right: 5px; }
.chat-msg  { color: rgba(255,255,255,0.65); }

/* ══ FULL SCREEN STATES ══ */
.full-screen {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: #080b10;
}
.state-card {
  display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center;
}
.state-icon { font-size: 40px; opacity: 0.5; }
.state-icon--error { opacity: 0.7; color: #f85149; }
.state-card h2  { font-size: 18px; font-weight: 700; color: #e6edf3; margin: 0; }
.state-card p   { color: rgba(255,255,255,0.45); font-size: 13px; margin: 0; }
.state-card small { color: rgba(255,255,255,0.25); font-size: 11px; }
.state-label    { font-size: 12px; color: rgba(255,255,255,0.38); }

/* Orb loader */
.orb-loader { position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; }
.orb-ring { position: absolute; border-radius: 50%; border: 2px solid transparent; }
.r1 { width:56px;height:56px; border-top-color:#58a6ff; animation:spin 1.1s linear infinite; }
.r2 { width:40px;height:40px; border-right-color:#3fb950; animation:spin 0.8s linear infinite reverse; }
.r3 { width:24px;height:24px; border-bottom-color:rgba(255,255,255,0.15); animation:spin 1.5s linear infinite; }
.orb-core { font-size: 1rem; z-index: 1; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ RESPONSIVE ══ */
@media (max-width: 1100px) {
  .insp-body { grid-template-columns: 1fr; }
  .insp-side { max-height: 40vh; border-top: 1px solid rgba(255,255,255,0.07); }
  .insp-main { border-right: none; }
}

/* Disqualified result banner */
.dq-result-banner {
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.4);
  color: #f87171;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  padding: 6px 10px;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

/* Leaderboard DQ row */
.lb--dq { background: rgba(239,68,68,0.06) !important; }
.lb-dq-label {
  font-size: 11px;
  font-weight: 800;
  color: #f87171;
  letter-spacing: 0.08em;
}
</style>
