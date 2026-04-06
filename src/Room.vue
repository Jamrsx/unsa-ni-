<!-- src/Room.vue -->
<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { getSocket } from './js/socket.js';
import Window from './components/window.vue';
import ButtonImage from './components/button-img.vue';
import ButtonText from './components/button-text.vue';
import ScoreLabel from './components/score-label.vue';
import CardThumb from './components/carousel-card-thumb.vue';
import Carousel from './components/carousel.vue';
import RoomSettingPanel from './components/room-setting-panel.vue';
import RoomPanel from './components/room-panel.vue';
import ChatPanel from './components/chat-panel.vue';
import ChatMsg from './components/chat-panel-message.vue';

const socket = getSocket();

// Get room code from URL
const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('code');
const isRejoining = urlParams.get('rejoining') === '1';

// State
const lobby = ref(null);
const players = ref([]);
const messages = ref([]);
const chatroomRef = ref(null);

function scrollChatToBottom() {
  nextTick(() => {
    // Try the ref first, then fall back to querying the .chatroom element inside #chat-window
    const el = chatroomRef.value
      || document.querySelector('#chat-window .chatroom')
      || document.querySelector('#chat-window [class*="chatroom"]')
      || document.querySelector('#chat-window [class*="chat-body"]')
      || document.querySelector('#chat-window [class*="messages"]');
    if (el) el.scrollTop = el.scrollHeight;
  });
}
const currentUser = ref(null);
const isReady = ref(false);
const isLoading = ref(true);
const spectatorLink = ref('');

// Auto-scroll chat to bottom whenever a new message arrives
watch(() => messages.value.length, () => {
  scrollChatToBottom();
});
const showCopiedTooltip = ref(false);
const roomSettingsPanelRef = ref(null);
const playerScores = ref([]);

// Question picker state (host only)
const questionMode = ref('random'); // 'random' | 'pick'
const problemsList = ref([]);
const selectedProblemId = ref(null);
const problemsLoading = ref(false);
const pickDiffFilter = ref('All'); // filter in pick mode

const filteredProblems = computed(() => {
  if (pickDiffFilter.value === 'All') return problemsList.value;
  return problemsList.value.filter(p => p.difficulty === pickDiffFilter.value);
});

// Heartbeat interval ID for room rejoin
let rejoinIntervalId = null;

// Host left warning
const showHostLeft = ref(false);
const hostLeftMessage = ref('');

// Computed: Check if current user is host
const isHost = computed(() => {
  if (!lobby.value || !currentUser.value) return false;
  const hostId = Number(lobby.value.host_user_id);
  const userId = Number(currentUser.value.id);
  const result = hostId === userId;
  console.log(`[Room DEBUG] isHost check: ${hostId} === ${userId} = ${result}`);
  return result;
});

onMounted(() => {
  if (!roomCode) {
    alert('No room code provided');
    window.location.href = '/lobbies.html';
    return;
  }

  const waitForAuth = () => {
    const user = window.user || JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.id) {
      console.log('[Room DEBUG] Authenticated user found via waitForAuth:', user);
      currentUser.value = user;
      joinLobbyWhenReady();
    } else {
      setTimeout(waitForAuth, 100);
    }
  };

  waitForAuth();

  const joinLobbyWhenReady = () => {
    const storedPassword = sessionStorage.getItem(`room_password_${roomCode}`) || '';
    if (storedPassword) sessionStorage.removeItem(`room_password_${roomCode}`);
    if (isRejoining) sessionStorage.setItem(`bypass_password_${roomCode}`, 'true');

    const joinLobby = (password = storedPassword) => {
      console.log('[Room DEBUG] joinLobby invoked (password?', !!password, ')');
      // keep loading indicator until success or explicit failure
      isLoading.value = true;

      // guard against situations where the server never responds
      let callbackCalled = false;
      const timeoutId = setTimeout(() => {
        if (!callbackCalled) {
          console.error('[Room] join_lobby response never arrived for room', roomCode);
          isLoading.value = false;
          alert('Unable to reach server. Please check your connection and try again.');
        }
      }, 10000);

      socket.emit('join_lobby', { roomCode, password }, (response) => {
        callbackCalled = true;
        clearTimeout(timeoutId);

        if (response.success) {
          sessionStorage.removeItem(`bypass_password_${roomCode}`);
          lobby.value = response.lobby;
          players.value = response.lobby.players || [];
          console.log('[Room DEBUG] join_lobby response players:', players.value);
          console.log('[Room DEBUG] join_lobby response leaderboard:', response.leaderboard);

          // ✅ Reset scores on fresh join so old match scores don't linger
          playerScores.value = [];
          try { localStorage.removeItem('lobbyPlayers'); } catch(e) {}

          // ✅ Only seed leaderboard from scores that were actually submitted (non-null/non-zero)
          // Server now only sends players with real scores - unsubmitted players are excluded
          if (response.leaderboard && response.leaderboard.length > 0) {
            playerScores.value = response.leaderboard
              .filter(s => s.score !== null && s.score !== undefined)
              .map(s => ({
                userId:         Number(s.user_id ?? s.userId),
                username:       s.username,
                score:          s.score,
                completionTime: s.completion_time ?? s.completionTime,
                avatar_url:     s.avatar_url || null
              }));
          }
          // NOTE: Do NOT auto-add unsubmitted players to playerScores with score:0
          // That causes stale 0% entries. Players only appear in leaderboard once they submit.

          if (response.spectatorLink) spectatorLink.value = response.spectatorLink;
          messages.value = response.chatHistory || [];
          updateReadyStatus();
          // Ensure this client socket is joined to the server lobby room with heartbeat
          try {
            const lobbyId = response.lobby.lobby_id || response.lobby.lobbyId || null;
            if (lobbyId && socket && socket.emit) {
              console.log('[Room DEBUG] emitting rejoin_lobby_match for lobby', lobbyId);
              const joinUserId = currentUser.value?.id || socket?.user?.id || null;
              if (joinUserId) {
                socket.emit('rejoin_lobby_match', { lobbyId: Number(lobbyId), userId: Number(joinUserId) });
              }
              // Start heartbeat to keep socket in room for all subsequent broadcasts
              startRejoinHeartbeat(lobbyId, joinUserId);
            }
          } catch (e) {
            console.warn('[Room] failed to request lobby rejoin:', e);
          }
          isLoading.value = false;
        } else {
          // on any failure clear loading state so spinner vanishes
          isLoading.value = false;
          const bypassPassword = sessionStorage.getItem(`bypass_password_${roomCode}`);
          if (response.error === 'Incorrect password' && bypassPassword) {
            sessionStorage.removeItem(`bypass_password_${roomCode}`);
            window.location.href = '/lobbies.html';
          } else if (response.error === 'Incorrect password') {
            const retryPassword = prompt('Incorrect password. Please enter the room password:');
            if (retryPassword !== null) joinLobby(retryPassword);
            else window.location.href = '/lobbies.html';
          } else {
            alert('Failed to join lobby: ' + response.error);
            window.location.href = '/lobbies.html';
          }
        }
      });
    };

    const checkAndJoin = () => {
      // Fast path: already connected and authenticated
      if (socket.connected && socket.user) {
        joinLobby();
        return;
      }

      let joined = false;

      const tryJoin = () => {
        if (joined) return;
        if (socket.connected && socket.user) {
          joined = true;
          clearInterval(poll);
          joinLobby();
        }
      };

      // Poll every 100ms — handles the race where connect+authenticated
      // already fired before checkAndJoin was called
      const poll = setInterval(tryJoin, 100);

      // Also hook future events in case they haven't fired yet
      socket.once('authenticated', tryJoin);
      socket.once('connect', () => socket.once('authenticated', tryJoin));

      // Timeout after 10s
      setTimeout(() => {
        clearInterval(poll);
        if (!joined) {
          console.error('[Room] Socket auth timeout — socket.connected:', socket.connected, 'socket.user:', socket.user);
          isLoading.value = false; // stop spinner so user sees message
          alert('Connection timed out. Please refresh the page.');
        }
      }, 10000);
    };

    checkAndJoin(); // ← was missing: actually invoke the function
  };

  socket.off('lobby_updated');
  socket.on('lobby_updated', (updatedLobby) => {
    const prevDifficulty = lobby.value?.difficulty;
    lobby.value = updatedLobby;
    players.value = updatedLobby.players || [];
    updateReadyStatus();
    // If difficulty changed while in random mode, reset any pinned problem
    // so the new difficulty filter applies cleanly
    if (prevDifficulty && prevDifficulty !== updatedLobby.difficulty && questionMode.value === 'random') {
      selectedProblemId.value = null;
      // No need to emit — server already has selected_problem_id = null for random mode
    }
  });

  socket.off('lobby_chat_message');
  socket.on('lobby_chat_message', (message) => {
    messages.value.push(message);
  });

  // Handle room rejoin confirmation
  socket.off('lobby_rejoined');
  socket.on('lobby_rejoined', (data) => {
    console.log('[Room] ✅ Confirmed joined to lobby room:', data);
  });

  // Heartbeat: periodically confirm we're in the room
  const startRejoinHeartbeat = (lobbyId, userId) => {
    if (rejoinIntervalId) clearInterval(rejoinIntervalId);
    console.log('[Room] Starting rejoin heartbeat for lobby', lobbyId);
    
    rejoinIntervalId = setInterval(() => {
      if (socket && socket.emit) {
        socket.emit('rejoin_lobby_match', { lobbyId: Number(lobbyId), userId: Number(userId) });
      }
    }, 15000); // Every 15 seconds (matches keepalive interval)
  };

  // ✅ FIX: normalize incoming update to camelCase userId
  // Always deregister first - LobbyOnboarding's onBeforeUnmount calls socket.off()
  // which runs AFTER Room.vue mounts (Vue router order), killing our listener.
  // By calling socket.off here, we ensure re-registration happens cleanly.
  socket.off('lobby_leaderboard_update');
  socket.on('lobby_leaderboard_update', (data) => {
    console.log('[Room] lobby_leaderboard_update received:', data);
    // debug: show currentUser id and types to help diagnose missing-self updates
    console.log('[Room DEBUG] currentUser id/type:', currentUser.value?.id, typeof currentUser.value?.id);
    const userId         = Number(data.userId   ?? data.user_id);
    console.log('[Room DEBUG] parsed update userId/type:', userId, typeof userId);
    const completionTime = data.completionTime ?? data.completion_time;
    const existingIndex  = playerScores.value.findIndex(p => Number(p.userId) === userId);
    if (existingIndex >= 0) {
      playerScores.value[existingIndex].score          = data.score;
      playerScores.value[existingIndex].completionTime = completionTime;
    } else {
      playerScores.value.push({ userId, username: data.username, score: data.score, completionTime, avatar_url: data.avatar_url || null });
    }
    playerScores.value.sort((a, b) =>
      b.score !== a.score ? b.score - a.score : (a.completionTime || Infinity) - (b.completionTime || Infinity)
    );
  });

  socket.off('host_left');
  socket.on('host_left', (data) => {
    hostLeftMessage.value = data.message || 'The host has left. Returning to lobby list…';
    showHostLeft.value = true;
    setTimeout(() => {
      window.location.href = '/lobbies.html';
    }, 3000);
  });

  socket.on('lobby_started', (data) => {
    // Reset leaderboard immediately when a new round starts
    // Export keeps all data (server-side by joined_at), this only clears the live display
    playerScores.value = [];

    const isHostSpectating = currentUser.value?.id === data.hostId && data.hostSpectatorMode;
    if (isHostSpectating) {
      window.location.href = `/inspector.html?lobby_id=${data.lobbyId}&code=${data.spectatorCode || ''}`;
      return;
    }
    localStorage.setItem('lobbyMatchData', JSON.stringify({
      lobbyId: data.lobbyId, roomCode: data.roomCode, problemId: data.problemId, mode: 'lobby'
    }));
    localStorage.setItem('currentLobbyRoomCode', data.roomCode);
    // Save players list so LobbyOnboarding can seed its playerScores immediately
    try {
      const playersForStorage = (players.value || []).map(p => ({
        userId: Number(p.user_id ?? p.userId),
        username: p.username || p.full_name || 'Player',
        avatar_url: p.avatar_url || null
      }));
      localStorage.setItem('lobbyPlayers', JSON.stringify(playersForStorage));
      console.log('[Room] Saved lobbyPlayers to localStorage:', playersForStorage.length);
    } catch(e) { console.warn('[Room] Failed to save lobbyPlayers:', e); }
    if (data.roomCode && lobby.value?.password)
      sessionStorage.setItem(`room_password_${data.roomCode}`, lobby.value.password);
    localStorage.setItem('currentMatchId', data.lobbyId.toString());
    localStorage.setItem('mode', 'lobby');
    localStorage.setItem('playerNumber', '1');
    const matchDuration = data.matchDuration || 300;
    const lobbyLanguage = data.programmingLanguage || lobby.value?.programming_language || 'Python';
    window.location.href = `/lobby-onboarding.html?lobby_id=${data.lobbyId}&problem_id=${data.problemId}&match_duration=${matchDuration}&language=${encodeURIComponent(lobbyLanguage)}`;
  });
});

function updateReadyStatus() {
  if (!currentUser.value || !players.value.length) return;
  const currentPlayer = players.value.find(p => p.user_id === currentUser.value.id);
  if (currentPlayer) {
    isReady.value = currentPlayer.is_ready === 1 || currentPlayer.is_ready === true;
  }
}

function toggleReady() {
  if (!lobby.value) return;
  socket.emit('toggle_ready', lobby.value.lobby_id, (response) => {
    if (!response.success) alert('Failed to toggle ready: ' + response.error);
  });
}

function sendMessage(message) {
  if (!lobby.value || !message.trim()) return;
  socket.emit('lobby_chat', { lobbyId: lobby.value.lobby_id, message: message.trim() }, (response) => {
    if (!response.success) console.error('[Room] Failed to send message:', response.error);
  });
}

function leaveLobby() {
  if (!lobby.value) return;
  const wasHost = isHost.value; // capture before lobby clears
  socket.emit('leave_lobby', lobby.value.lobby_id, (response) => {
    if (response.success) {
      // Host redirects itself; server will emit host_left to remaining players
      window.location.href = '/lobbies.html';
    } else {
      alert('Failed to leave lobby: ' + response.error);
    }
  });
  // Fallback: if server never responds within 5s, redirect anyway
  if (wasHost) {
    setTimeout(() => {
      window.location.href = '/lobbies.html';
    }, 5000);
  }
}

function startMatch() {
  if (!isHost.value || !lobby.value) return;
  if (players.value.length < 2) { alert('At least 2 players are required to start!'); return; }
  const allReady = players.value.every(p => p.is_ready === 1 || p.is_ready === true);
  if (!allReady) {
    const notReadyPlayers = players.value.filter(p => !(p.is_ready === 1 || p.is_ready === true));
    alert(`Waiting for ${notReadyPlayers.length} player(s): ${notReadyPlayers.map(p => p.username).join(', ')}`);
    return;
  }
  const isHostInPlayers = players.value.some(p => p.user_id === currentUser.value?.id);
  const hostSpectatorMode = lobby.value?.host_spectator_mode || !isHostInPlayers;
  if (hostSpectatorMode) {
    if (!confirm('You are in Spectator Mode. You will be redirected to the Inspector view. Continue?')) return;
  }
  const matchDuration = roomSettingsPanelRef.value?.getMatchDuration?.() || 300;
  socket.emit('start_lobby_match', {
    lobbyId: lobby.value.lobby_id, roomCode: lobby.value.room_code, matchDuration
  }, (response) => {
    if (!response.success) alert('Failed to start match: ' + response.error);
  });
}

function fetchProblemsList() {
  if (problemsList.value.length > 0) return; // already loaded
  problemsLoading.value = true;
  socket.emit('get_problems_list', {}, (response) => {
    problemsLoading.value = false;
    if (response.success) {
      problemsList.value = response.problems;
    } else {
      console.error('[Room] Failed to fetch problems list:', response.error);
    }
  });
}

function setQuestionMode(mode) {
  questionMode.value = mode;
  if (mode === 'pick') {
    // Fetch problems if not yet loaded
    if (problemsList.value.length === 0) fetchProblemsList();
  }
  if (mode === 'random') {
    // Clear any previously pinned problem
    selectedProblemId.value = null;
    sendQuestionSetting(null);
  }
}

function onProblemPicked(rawValue) {
  // rawValue comes directly from $event.target.value — no v-model lag
  const pid = rawValue ? Number(rawValue) : null;
  selectedProblemId.value = pid;
  console.log('[Room] Question picked, sending to server:', pid);
  sendQuestionSetting(pid);
}

function sendQuestionSetting(problemId) {
  if (!lobby.value) return;
  console.log('[Room] Sending question setting to server:', { lobbyId: lobby.value.lobby_id, selectedProblemId: problemId });
  socket.emit('update_lobby_settings', {
    lobbyId: lobby.value.lobby_id,
    selectedProblemId: problemId
  }, (response) => {
    if (response && response.success) {
      console.log('[Room] ✅ Question setting saved:', problemId === null ? 'Random' : 'Problem #' + problemId);
    } else {
      console.error('[Room] ❌ Failed to update question setting:', response?.error);
    }
  });
}

function copySpectatorLink() {
  if (!spectatorLink.value) return;
  navigator.clipboard.writeText(spectatorLink.value).then(() => {
    showCopiedTooltip.value = true;
    setTimeout(() => { showCopiedTooltip.value = false; }, 2000);
  });
}

function formatCompletionTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return `${String(date.getMinutes()).padStart(2,'0')}:${String(date.getSeconds()).padStart(2,'0')}`;
}

function getPlaceClass(index, player) {
  // only award special classes if player has a score
  const score = player?.score || 0;
  if (score > 0) {
    if (index === 0) return 'first-place';
    if (index === 1) return 'second-place';
    if (index === 2) return 'third-place';
  }
  return '';
}

onUnmounted(() => {
  if (rejoinIntervalId) clearInterval(rejoinIntervalId);
  socket.off('lobby_updated');
  socket.off('lobby_chat_message');
  socket.off('lobby_started');
  socket.off('lobby_leaderboard_update');
  socket.off('lobby_rejoined');
  socket.off('host_left');
});

const playerSlots = computed(() => {
  const maxSlots = lobby.value?.max_players || 45;
  return Array.from({ length: maxSlots }, (_, i) => {
    if (i < players.value.length) {
      const p   = players.value[i];
      const pid = p.user_id || p.userId;
      return {
        player: {
          name:    p.username,
          id:      pid,
          icon:    p.avatar_url || p.avatarUrl || 'asset/general/profile-user.png',
          isReady: p.is_ready === 1 || p.isReady === true,
          isHost:  pid === lobby.value?.host_user_id
        }
      };
    }
    return { player: null };
  });
});

// SheetJS for Excel export - loaded dynamically
function ensureSheetJS() {
  return new Promise((resolve) => {
    if (window.XLSX) return resolve(window.XLSX);
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => resolve(window.XLSX);
    document.head.appendChild(s);
  });
}


// ── Export results ──────────────────────────────────────────────────────────
const isExporting = ref(false);
const exportError = ref('');

async function exportResults() {
  if (!lobby.value?.lobby_id) return;
  isExporting.value = true;
  exportError.value = '';
  try {
    // Fetch data first
    const result = await new Promise((resolve, reject) => {
      socket.emit('get_lobby_export_data', { lobbyId: lobby.value.lobby_id }, (res) => {
        if (res.success) resolve(res);
        else reject(new Error(res.error || 'Failed to fetch data'));
      });
    });

    const { rounds, lobbyInfo } = result;

    if (!rounds || !rounds.length) {
      exportError.value = 'No completed rounds to export yet.';
      isExporting.value = false;
      return;
    }

    // Load ExcelJS
    await new Promise((res, rej) => {
      if (window.ExcelJS) return res();
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });

    const wb = new window.ExcelJS.Workbook();
    wb.creator = 'CodeDuel';
    wb.created = new Date();

    // ── Helpers ──────────────────────────────────────────────────────────
    const fmtTime = (secs) => {
      if (secs == null || secs === '') return 'N/A';
      const m = Math.floor(Number(secs) / 60);
      const s = Math.round(Number(secs) % 60);
      return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };

    const colLetter = (n) => {
      let s = '';
      while (n > 0) { s = String.fromCharCode(64 + (n % 26 || 26)) + s; n = Math.floor((n - 1) / 26); }
      return s;
    };

    // ── Theme ────────────────────────────────────────────────────────────
    const T = {
      dark:    '1a1a2e',
      mid:     '16213e',
      accent:  '0f3460',
      white:   'FFFFFFFF',
      light1:  'FFFAFBFF',
      light2:  'FFE8F0FE',
      gold:    'FFFFD700',
      green:   'FF22c55e',
      amber:   'FFf59e0b',
      red:     'FFef4444',
      grey:    'FF94a3b8',
      dark_txt:'FF1a1a2e',
    };

    const fill = (hex6) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + hex6 } });
    const font = (opts) => ({ size: 11, ...opts });
    const bw   = (size = 11) => font({ bold: true, color: { argb: T.white }, size });

    // ── One sheet per round ──────────────────────────────────────────────
    rounds.forEach((round) => {
      const ws = wb.addWorksheet(`Round ${round.roundNumber}`, {
        views: [{ showGridLines: false }],
        properties: { defaultRowHeight: 20 }
      });

      // Set column widths explicitly (do NOT set 'key' — that clashes with addRow headers)
      ws.getColumn(1).width = 8;
      ws.getColumn(2).width = 24;
      ws.getColumn(3).width = 14;
      ws.getColumn(4).width = 18;
      ws.getColumn(5).width = 14;

      // ── Row 1: Title ──
      ws.mergeCells('A1:E1');
      const r1 = ws.getRow(1);
      r1.height = 34;
      const c1 = ws.getCell('A1');
      c1.value     = `${lobbyInfo.room_name || lobbyInfo.room_code}  ·  Round ${round.roundNumber} of ${lobbyInfo.total_rounds}`;
      c1.font      = bw(15);
      c1.fill      = fill(T.dark);
      c1.alignment = { horizontal: 'center', vertical: 'middle' };

      // ── Row 2: Problem name ──
      ws.mergeCells('A2:E2');
      ws.getRow(2).height = 24;
      const c2 = ws.getCell('A2');
      c2.value     = `📝  Problem: ${round.problemName || 'N/A'}`;
      c2.font      = bw(12);
      c2.fill      = fill(T.mid);
      c2.alignment = { horizontal: 'center', vertical: 'middle' };

      // ── Row 3: Meta info (host · difficulty · date) ──
      ws.mergeCells('A3:B3');
      ws.mergeCells('C3:C3');
      ws.mergeCells('D3:E3');
      ws.getRow(3).height = 18;
      const metaStyle = { font: font({ italic: true, color: { argb: T.white }, size: 10 }), fill: fill(T.accent), alignment: { horizontal: 'center', vertical: 'middle' } };
      const c3a = ws.getCell('A3');
      c3a.value = `👑 Host: ${lobbyInfo.host_username || 'Unknown'}`;
      Object.assign(c3a, metaStyle);
      const c3b = ws.getCell('C3');
      c3b.value = `⚡ Difficulty: ${lobbyInfo.difficulty || 'Mixed'}`;
      Object.assign(c3b, metaStyle);
      const c3c = ws.getCell('D3');
      c3c.value = `🕒 ${round.startedAt ? new Date(round.startedAt).toLocaleString() : 'N/A'}`;
      Object.assign(c3c, metaStyle);

      // ── Row 4: Description (if any) ──
      let dataStartRow = 6;
      if (lobbyInfo.description) {
        ws.mergeCells('A4:E4');
        ws.getRow(4).height = 16;
        const c4 = ws.getCell('A4');
        c4.value     = lobbyInfo.description;
        c4.font      = font({ italic: true, color: { argb: 'FFaab4d0' }, size: 9 });
        c4.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0e1623' } };
        c4.alignment = { horizontal: 'center', vertical: 'middle' };
        // Row 5: Spacer
        ws.getRow(5).height = 6;
        // Row 6: Column headers
        const hdrRow6 = ws.getRow(6);
        hdrRow6.height = 22;
        ['Rank', 'Player', 'Score (%)', 'Time', 'Status'].forEach((label, ci) => {
          const cell = hdrRow6.getCell(ci + 1);
          cell.value = label; cell.font = bw(); cell.fill = fill(T.accent);
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = { bottom: { style: 'medium', color: { argb: T.gold } } };
        });
        dataStartRow = 7;
      } else {
        // Row 4: Spacer
        ws.getRow(4).height = 6;
        // Row 5: Column headers
        const hdr = ws.getRow(5);
        hdr.height = 22;
        ['Rank', 'Player', 'Score (%)', 'Time', 'Status'].forEach((label, ci) => {
          const cell = hdr.getCell(ci + 1);
          cell.value = label; cell.font = bw(); cell.fill = fill(T.accent);
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = { bottom: { style: 'medium', color: { argb: T.gold } } };
        });
        dataStartRow = 6;
      }

      // ── Player rows ──
      round.players.forEach((p, i) => {
        const rowIdx = dataStartRow + i;
        const status = p.score === 100 ? 'Perfect'
                     : p.score > 0    ? 'Partial'
                     : p.score === 0  ? 'Attempted'
                     : 'DNS';
        const medal  = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(p.rank);
        const scoreDisp = p.score !== null ? `${p.score}%` : 'DNS';
        const rowData   = [medal, p.username, scoreDisp, fmtTime(p.completionTime), status];
        const bgArgb    = i % 2 === 0 ? T.light1 : 'FFECF3FF';

        const row = ws.getRow(rowIdx);
        row.height = 20;
        rowData.forEach((val, ci) => {
          const cell = row.getCell(ci + 1);
          cell.value     = val;
          cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
          cell.font      = font({ color: { argb: T.dark_txt } });
          cell.alignment = { horizontal: ci === 1 ? 'left' : 'center', vertical: 'middle' };
        });

        // Score cell colour
        const sc = row.getCell(3);
        if      (p.score === 100) sc.font = font({ bold: true, color: { argb: T.green } });
        else if (p.score > 0)     sc.font = font({ bold: true, color: { argb: T.amber } });
        else if (p.score === 0)   sc.font = font({ bold: true, color: { argb: T.red   } });
        else                      sc.font = font({ color: { argb: T.grey } });
      });

      // ── Spacer + Class Average ──
      const afterPlayers = dataStartRow + round.players.length;
      ws.getRow(afterPlayers).height = 6;

      const submitted = round.players.filter(p => p.score !== null);
      if (submitted.length) {
        const avg    = (submitted.reduce((s, p) => s + p.score, 0) / submitted.length).toFixed(1);
        const avgRow = ws.getRow(afterPlayers + 1);
        avgRow.height = 20;
        const avgData = ['', 'Class Average', `${avg}%`, '', `${submitted.length}/${round.players.length} submitted`];
        avgData.forEach((val, ci) => {
          const cell = avgRow.getCell(ci + 1);
          cell.value     = val;
          cell.font      = font({ bold: true, color: { argb: 'FF' + T.accent } });
          cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: T.light2 } };
          cell.alignment = { horizontal: ci === 1 ? 'left' : 'center', vertical: 'middle' };
        });
      }
    });

    // ── Summary sheet ────────────────────────────────────────────────────
    const sumWs = wb.addWorksheet('Summary', {
      views: [{ showGridLines: false }],
      properties: { defaultRowHeight: 20 }
    });

    // Columns: Player | R1 Score | R1 Time | R2 Score | R2 Time | ... | Best Score
    const totalCols  = 1 + rounds.length * 2 + 1;
    const lastColLet = colLetter(totalCols);

    sumWs.getColumn(1).width = 24;
    rounds.forEach((r, i) => {
      sumWs.getColumn(2 + i * 2).width = 16;
      sumWs.getColumn(3 + i * 2).width = 16;
    });
    sumWs.getColumn(totalCols).width = 13;

    // Row 1: Title
    sumWs.mergeCells(`A1:${lastColLet}1`);
    sumWs.getRow(1).height = 30;
    const st1 = sumWs.getCell('A1');
    st1.value     = `${lobbyInfo.room_name || lobbyInfo.room_code || 'Lobby'}  ·  ${rounds.length} Round${rounds.length !== 1 ? 's' : ''}  ·  Host: ${lobbyInfo.host_username || 'Unknown'}`;
    st1.font      = bw(15);
    st1.fill      = fill(T.dark);
    st1.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 2: Problem names per round
    sumWs.mergeCells(`A2:${lastColLet}2`);
    sumWs.getRow(2).height = 18;
    const st2 = sumWs.getCell('A2');
    st2.value     = rounds.map(r => `R${r.roundNumber}: ${r.problemName || 'N/A'}`).join('   |   ');
    st2.font      = font({ italic: true, color: { argb: T.white }, size: 10 });
    st2.fill      = fill(T.accent);
    st2.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 3: Spacer
    sumWs.getRow(3).height = 8;

    // Row 4: Headers
    const sumHdrRow = sumWs.getRow(4);
    sumHdrRow.height = 22;
    const sumHdrVals = ['Player'];
    rounds.forEach(r => { sumHdrVals.push(`Round ${r.roundNumber} Score`); sumHdrVals.push(`Round ${r.roundNumber} Time`); });
    sumHdrVals.push('Best Score');
    sumHdrVals.forEach((label, ci) => {
      const cell = sumHdrRow.getCell(ci + 1);
      cell.value     = label;
      cell.font      = bw();
      cell.fill      = fill(T.accent);
      cell.alignment = { horizontal: ci === 0 ? 'left' : 'center', vertical: 'middle' };
      cell.border    = { bottom: { style: 'medium', color: { argb: T.gold } } };
    });

    // Player rows
    const allPlayers = new Map();
    rounds.forEach(r => r.players.forEach(p => allPlayers.set(p.userId, p.username)));

    let pIdx = 0;
    allPlayers.forEach((username, uid) => {
      const rowIdx  = 5 + pIdx;
      const sumRow  = sumWs.getRow(rowIdx);
      sumRow.height = 20;
      const bgArgb  = pIdx % 2 === 0 ? T.light1 : 'FFECF3FF';

      const rowVals = [username];
      rounds.forEach(r => {
        const p = r.players.find(x => x.userId === uid);
        rowVals.push(p && p.score !== null ? `${p.score}%` : 'DNS');
        rowVals.push(p ? fmtTime(p.completionTime) : 'N/A');
      });
      const allScores = rounds.map(r => { const p = r.players.find(x => x.userId === uid); return p?.score ?? -1; });
      const best      = Math.max(...allScores.filter(s => s >= 0));
      rowVals.push(best >= 0 ? `${best}%` : 'DNS');

      rowVals.forEach((val, ci) => {
        const cell = sumRow.getCell(ci + 1);
        cell.value     = val;
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
        cell.font      = font({ bold: ci === 0, color: { argb: T.dark_txt } });
        cell.alignment = { horizontal: ci === 0 ? 'left' : 'center', vertical: 'middle' };
      });

      // Best score colour (last column)
      const bc = sumRow.getCell(totalCols);
      if      (best === 100) bc.font = font({ bold: true, color: { argb: T.green } });
      else if (best > 0)     bc.font = font({ bold: true, color: { argb: T.amber } });
      else                   bc.font = font({ color: { argb: T.grey } });

      pIdx++;
    });

    // ── Download ─────────────────────────────────────────────────────────
    const lobbyName = (lobbyInfo.room_name || lobbyInfo.room_code || 'lobby').replace(/[^a-zA-Z0-9]/g, '_');
    const buffer    = await wb.xlsx.writeBuffer();
    const blob      = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url       = URL.createObjectURL(blob);
    const a         = document.createElement('a');
    a.href = url; a.download = `CodeDuel_${lobbyName}_Results.xlsx`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);

    console.log(`[Export] Exported ${rounds.length} rounds for lobby ${lobby.value.lobby_id}`);
  } catch (err) {
    console.error('[Export] Error:', err);
    exportError.value = err.message || 'Export failed';
  } finally {
    isExporting.value = false;
  }
}
</script>

<template>
  <!-- ══ LEFT: Players + Chat ══ -->
  <section class="col-players">

    <!-- Players card -->
    <div class="room-card players-card">
      <div class="card-header">
        <div class="card-header-left">
          <div class="room-name-block">
            <span class="room-icon">⚔️</span>
            <span class="room-name">{{ lobby?.room_name || 'Waiting Room' }}</span>
          </div>
          <div class="room-meta" v-if="lobby">
            <span class="meta-pill">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C14 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              {{ players.length }}/{{ lobby.max_players }}
            </span>
            <span v-if="lobby.difficulty" class="meta-pill meta-pill--diff" :class="'diff-' + (lobby.difficulty || 'easy').toLowerCase()">
              {{ lobby.difficulty }}
            </span>
            <span v-if="lobby.programming_language" class="meta-pill meta-pill--lang">{{ lobby.programming_language }}</span>
          </div>
        </div>
        <div class="card-header-right">
          <span v-if="lobby?.is_private" class="lock-badge">🔒</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-orb">
          <div class="orb-ring orb-ring--1"></div>
          <div class="orb-ring orb-ring--2"></div>
          <div class="orb-ring orb-ring--3"></div>
          <div class="orb-core">⚔️</div>
        </div>
        <p class="loading-text">Joining the arena…</p>
        <div class="loading-dots"><span></span><span></span><span></span></div>
      </div>

      <template v-else>
        <!-- Player grid -->
        <div class="players-grid-wrap">
          <RoomPanel :title="lobby?.room_name || 'Battle Room'" :slots="playerSlots" />
        </div>

        <!-- Actions bar -->
        <div class="actions-bar">
          <div class="actions-left">
            <button v-if="!isHost" :class="['action-btn', isReady ? 'btn-ready-on' : 'btn-ready-off']" @click="toggleReady">
              <svg v-if="isReady" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20,6 9,17 4,12"/></svg>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/></svg>
              {{ isReady ? 'Ready!' : 'Ready Up' }}
            </button>
            <button v-if="isHost" class="action-btn btn-start" @click="startMatch">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              Start Match
            </button>
            <button v-if="isHost" class="action-btn btn-export" @click="exportResults" :disabled="isExporting">
              <svg v-if="!isExporting" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span v-if="isExporting" class="spin-icon">⟳</span>
              {{ isExporting ? 'Exporting…' : 'Export' }}
            </button>
            <span v-if="exportError" class="export-err">{{ exportError }}</span>
          </div>
          <button class="action-btn btn-leave" @click="leaveLobby">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Leave
          </button>
        </div>
      </template>
    </div>

    <!-- Chat card -->
    <div id="chat-window" class="room-card chat-card">
      <div class="card-header">
        <span class="card-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          Chat
        </span>
        <span v-if="messages.length" class="count-badge">{{ messages.length }}</span>
      </div>
      <ChatPanel
        :label="currentUser?.username || 'Guest'"
        placeholder="Say something…"
        name="room-chat-client"
        @send="sendMessage"
      >
        <template #content>
          <ChatMsg v-for="(msg, i) in messages" :key="i" :user="msg.username" :message="msg.message" :timestamp="msg.timestamp" />
          <div v-if="messages.length === 0" class="chat-empty">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.25"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <span>No messages yet</span>
          </div>
        </template>
      </ChatPanel>
    </div>

  </section>

  <!-- ══ MIDDLE: Settings (host only) ══ -->
  <section v-if="isHost" class="col-settings">
    <div class="room-card settings-card">
      <div class="card-header">
        <span class="card-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Room Settings
        </span>
        <span class="host-crown">👑 Host</span>
      </div>
      <div class="settings-scroll">
        <!-- Hide difficulty controls when host is in Pick mode (difficulty irrelevant when problem is pinned) -->
        <!-- ── Room Settings Panel (always visible) ── -->
        <RoomSettingPanel
          ref="roomSettingsPanelRef"
          :lobby="lobby"
          :currentUserId="currentUser?.id"
          :hideDifficulty="questionMode === 'pick'"
        />

        <!-- ── Question Mode Picker ── -->
        <div class="qpicker-section">
          <!-- Mode toggle -->
          <div class="qpicker-mode-row">
            <div class="qpicker-mode-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Question Mode
            </div>
            <div class="qpicker-toggle">
              <button :class="['qpicker-btn', questionMode === 'random' ? 'qpicker-btn--active' : '']" @click="setQuestionMode('random')">
                🎲 Random
              </button>
              <button :class="['qpicker-btn', questionMode === 'pick' ? 'qpicker-btn--active' : '']" @click="setQuestionMode('pick')">
                📌 Pick
              </button>
            </div>
          </div>

          <!-- Random: just a hint, difficulty filter stays in RoomSettingPanel above -->
          <div v-if="questionMode === 'random'" class="qpicker-hint">
            🎲 A random question will be picked<template v-if="lobby && lobby.difficulty && lobby.difficulty !== 'All'"> from <strong>{{ lobby.difficulty }}</strong> difficulty</template> when the match starts.
          </div>

          <!-- Pick: difficulty filter dropdown + problem selector -->
          <div v-if="questionMode === 'pick'" class="qpicker-pick-body">
            <!-- Difficulty filter for the pick list -->
            <div class="qpicker-filter-row">
              <label class="qpicker-filter-label">Filter by difficulty</label>
              <div class="qpicker-diff-pills">
                <button
                  v-for="d in ['All','Easy','Medium','Hard']"
                  :key="d"
                  :class="['diff-pill', 'diff-pill--' + d.toLowerCase(), pickDiffFilter === d ? 'diff-pill--active' : '']"
                  @click="pickDiffFilter = d"
                >{{ d }}</button>
              </div>
            </div>

            <!-- Problem list -->
            <div v-if="problemsLoading" class="qpicker-loading">
              <div class="qpicker-spinner"></div>
              Loading questions…
            </div>
            <div v-else class="qpicker-list">
              <button
                v-for="p in filteredProblems"
                :key="p.problem_id"
                :class="['qpicker-item', Number(p.problem_id) === Number(selectedProblemId) ? 'qpicker-item--selected' : '']"
                @click="onProblemPicked(p.problem_id)"
              >
                <span :class="['qpicker-diff-badge', 'badge--' + (p.difficulty || 'medium').toLowerCase()]">{{ p.difficulty }}</span>
                <span class="qpicker-item-name">{{ p.problem_name }}</span>
                <svg v-if="Number(p.problem_id) === Number(selectedProblemId)" class="qpicker-check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
              <div v-if="filteredProblems.length === 0" class="qpicker-empty">No problems for this difficulty.</div>
            </div>

            <!-- Pinned confirmation -->
            <div v-if="selectedProblemId" class="qpicker-pinned">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Pinned: <strong>{{ problemsList.find(p => Number(p.problem_id) === Number(selectedProblemId))?.problem_name }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ══ RIGHT: Live Leaderboard ══ -->
  <section class="col-leaderboard">
    <div class="room-card lb-card">
      <div class="card-header">
        <span class="card-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zm-6 3a3 3 0 11.001-6.001A3 3 0 0115 20zm9-11a3 3 0 11-.001 6.001A3 3 0 0114 9z"/></svg>
          Live Leaderboard
        </span>
        <span v-if="playerScores.length" class="count-badge count-badge--gold">{{ playerScores.length }}</span>
      </div>

      <div v-if="playerScores.length === 0" class="lb-empty">
        <div class="lb-empty-icon">🎯</div>
        <p>No submissions yet</p>
        <small>Leaderboard updates live</small>
      </div>
      <div v-else-if="playerScores.every(p => (p.score || 0) === 0)" class="lb-empty">
        <div class="waiting-pulse"></div>
        <small>Waiting for first submission…</small>
      </div>

      <TransitionGroup v-if="playerScores.length > 0" name="lb-anim" tag="div" class="lb-list">
        <div
          v-for="(player, index) in playerScores" :key="player.userId"
          :class="['lb-row', getPlaceClass(index, player), { 'lb-row--me': Number(player.userId) === Number(currentUser?.id) }]"
        >
          <div class="lb-rank">
            <span v-if="index === 0 && player.score > 0" class="lb-medal">🥇</span>
            <span v-else-if="index === 1 && player.score > 0" class="lb-medal">🥈</span>
            <span v-else-if="index === 2 && player.score > 0" class="lb-medal">🥉</span>
            <span v-else class="lb-num">#{{ index + 1 }}</span>
          </div>
          <div class="lb-avatar">
            <img v-if="player.avatar_url" :src="player.avatar_url" :alt="player.username" />
            <div v-else class="lb-av-ph">{{ player.username?.[0]?.toUpperCase() }}</div>
          </div>
          <div class="lb-info">
            <div class="lb-name">
              {{ player.username }}
              <span v-if="Number(player.userId) === Number(currentUser?.id)" class="you-tag">you</span>
            </div>
            <div v-if="player.completionTime" class="lb-time">{{ formatCompletionTime(player.completionTime) }}</div>
          </div>
          <div :class="['lb-score', { 'lb-score--perfect': player.score === 100 }]">
            {{ player.score }}<span class="score-pct">%</span>
          </div>
        </div>
      </TransitionGroup>

    </div>
  </section>

  <!-- ══ Host Left Warning ══ -->
  <Teleport to="body">
    <Transition name="host-left-fade">
      <div v-if="showHostLeft" class="host-left-overlay">
        <div class="host-left-box">
          <div class="host-left-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </div>
          <div class="host-left-content">
            <p class="host-left-title">Host Left the Room</p>
            <p class="host-left-msg">{{ hostLeftMessage }}</p>
          </div>
          <div class="host-left-countdown">
            <div class="host-left-bar"></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ══ Shared card ══ */
.room-card {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ══ Card header ══ */
.card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 16px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(0,0,0,0.15);
  flex-shrink: 0;
}
.card-title {
  display: flex; align-items: center; gap: 7px;
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.05em;
  color: rgba(255,255,255,0.6); text-transform: uppercase;
}
.card-title svg { opacity: 0.7; flex-shrink: 0; }

/* ══ Room header ══ */
.card-header-left  { display: flex; flex-direction: column; gap: 5px; }
.card-header-right { display: flex; align-items: center; }
.room-name-block   { display: flex; align-items: center; gap: 8px; }
.room-icon { font-size: 1rem; }
.room-name {
  font-size: 0.95rem; font-weight: 800;
  color: rgba(255,255,255,0.92); letter-spacing: 0.01em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px;
}
.room-meta { display: flex; gap: 5px; flex-wrap: wrap; }
.meta-pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 10px;
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.03em;
  background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.45);
  border: 1px solid rgba(255,255,255,0.08);
}
.meta-pill--lang { background: rgba(30,136,229,0.12); color: #64b5f6; border-color: rgba(30,136,229,0.2); }
.diff-easy   { background: rgba(76,175,80,0.12); color: #81c784; border-color: rgba(76,175,80,0.2); }
.diff-medium { background: rgba(255,152,0,0.12);  color: #ffb74d; border-color: rgba(255,152,0,0.2); }
.diff-hard   { background: rgba(229,57,53,0.12);  color: #ef9a9a; border-color: rgba(229,57,53,0.2); }
.lock-badge { font-size: 0.85rem; opacity: 0.6; }
.host-crown { font-size: 0.7rem; color: #ffd600; letter-spacing: 0.04em; font-weight: 700; }

/* ══ Column layouts ══ */
.col-players     { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.col-settings    { width: 100%; }
.col-leaderboard { width: 100%; }

.players-card { flex: 0 0 auto; }
.chat-card    { flex: 1; min-height: 0; background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.12) !important; }
.lb-card      { height: 100%; }

/* ══ Loading ══ */
.loading-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 60px 20px; gap: 16px;
}
.loading-orb { position: relative; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; }
.orb-ring { position: absolute; border-radius: 50%; border: 2px solid transparent; }
.orb-ring--1 { width: 64px; height: 64px; border-top-color: #4caf50; animation: orb-spin 1.1s linear infinite; }
.orb-ring--2 { width: 48px; height: 48px; border-right-color: #1e88e5; animation: orb-spin 0.8s linear infinite reverse; }
.orb-ring--3 { width: 32px; height: 32px; border-bottom-color: rgba(255,255,255,0.15); animation: orb-spin 1.6s linear infinite; }
.orb-core { font-size: 1.1rem; z-index: 1; }
@keyframes orb-spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 0.78rem; font-weight: 600; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; margin: 0; }
.loading-dots { display: flex; gap: 5px; }
.loading-dots span {
  width: 5px; height: 5px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  animation: dot-pop 1.2s ease-in-out infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot-pop { 0%,80%,100% { transform: scale(1); opacity: 0.2; } 40% { transform: scale(1.5); opacity: 1; } }

/* ══ Player grid wrap ══ */
.players-grid-wrap {
  overflow-y: auto; padding: 10px;
  max-height: 320px;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
}
.players-grid-wrap::-webkit-scrollbar { width: 3px; }
.players-grid-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }

/* ══ Actions bar ══ */
.actions-bar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; padding: 10px 14px 12px;
  background: rgba(0,0,0,0.18);
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.actions-left { display: flex; gap: 7px; align-items: center; }

.action-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px; border: none;
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.03em;
  cursor: pointer; white-space: nowrap;
  transition: transform 0.12s, filter 0.12s, box-shadow 0.12s;
}
.action-btn:hover  { transform: translateY(-2px); filter: brightness(1.12); }
.action-btn:active { transform: translateY(0); filter: brightness(0.92); }

.btn-ready-off { background: transparent; border: 1.5px solid rgba(76,175,80,0.5) !important; color: #81c784; }
.btn-ready-off:hover { background: rgba(76,175,80,0.1); }
.btn-ready-on  { background: linear-gradient(135deg,#43a047,#2e7d32); color: #fff; box-shadow: 0 2px 10px rgba(67,160,71,0.35); }
.btn-start     { background: linear-gradient(135deg,#1e88e5,#1565c0); color: #fff; box-shadow: 0 2px 10px rgba(30,136,229,0.4); }
.btn-export    { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.65); border: 1px solid rgba(255,255,255,0.1) !important; }
.btn-export:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }
.btn-leave     { background: transparent; border: 1.5px solid rgba(229,57,53,0.4) !important; color: #ef9a9a; }
.btn-leave:hover { background: rgba(229,57,53,0.1); border-color: #e53935 !important; }
.spin-icon { display: inline-block; animation: orb-spin 0.8s linear infinite; }
.export-err { font-size: 0.72rem; color: #ef5350; }

/* ══ Chat ══ */
.chat-card { min-height: 200px; background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.12) !important; }
.count-badge {
  padding: 1px 8px; border-radius: 10px;
  font-size: 0.62rem; font-weight: 700; font-family: monospace;
  background: rgba(30,136,229,0.15); color: #64b5f6; border: 1px solid rgba(30,136,229,0.2);
}
.count-badge--gold { background: rgba(255,214,0,0.12); color: #ffd600; border-color: rgba(255,214,0,0.2); }
.chat-empty {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 28px 16px; color: rgba(255,255,255,0.25); font-size: 0.8rem;
}

/* ══ Deep: chat internals — force white text throughout ══ */
#chat-window :deep(.body-window) { display: flex; flex-direction: column; }
#chat-window :deep(.chatroom) {
  flex: 1; overflow-y: auto; min-height: 0;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
}
#chat-window :deep(.chatroom)::-webkit-scrollbar { width: 3px; }
#chat-window :deep(.chatroom)::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }

/* Nuclear white-text override — covers any class the child components use */
#chat-window :deep(*) {
  color: #e8eaf0 !important;
}
/* Dim the timestamps slightly */
#chat-window :deep(.timestamp),
#chat-window :deep(.time),
#chat-window :deep([class*="time"]),
#chat-window :deep([class*="stamp"]) {
  color: rgba(255,255,255,0.35) !important;
  font-size: 0.68rem !important;
}
/* Input field */
#chat-window :deep(input),
#chat-window :deep(textarea) {
  color: #fff !important;
  background: rgba(255,255,255,0.07) !important;
  border: 1px solid rgba(255,255,255,0.14) !important;
  border-radius: 8px !important;
}
#chat-window :deep(input::placeholder),
#chat-window :deep(textarea::placeholder) {
  color: rgba(255,255,255,0.35) !important;
}
/* Send button */
#chat-window :deep(button) {
  background: linear-gradient(135deg, #1e88e5, #1565c0) !important;
  color: #fff !important;
  border: none !important;
  border-radius: 8px !important;
}

/* ══ Settings ══ */
.settings-card { height: 100%; background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.12) !important; }
.settings-scroll {
  overflow-y: auto; padding: 12px;
  flex: 1; min-height: 0;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
}
.settings-scroll::-webkit-scrollbar { width: 3px; }
.settings-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* ══ Question Picker ══ */
.qpicker-section {
  margin-top: 10px;
  padding: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  display: flex; flex-direction: column; gap: 10px;
}
.qpicker-mode-row {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.qpicker-mode-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em;
  color: rgba(255,255,255,0.4); text-transform: uppercase;
}
.qpicker-toggle { display: flex; gap: 5px; }
.qpicker-btn {
  padding: 5px 12px; border-radius: 6px;
  border: 1.5px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.4);
  font-size: 0.73rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.qpicker-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); }
.qpicker-btn--active {
  background: rgba(30,136,229,0.18) !important;
  border-color: rgba(30,136,229,0.5) !important;
  color: #64b5f6 !important;
}
.qpicker-hint {
  font-size: 0.72rem; color: rgba(255,255,255,0.3);
  line-height: 1.5; font-style: italic;
  padding: 6px 8px;
  background: rgba(255,255,255,0.02);
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.05);
}
.qpicker-hint strong { color: rgba(255,255,255,0.55); font-style: normal; }

/* Pick body */
.qpicker-pick-body { display: flex; flex-direction: column; gap: 8px; }

/* Difficulty filter pills */
.qpicker-filter-row { display: flex; flex-direction: column; gap: 5px; }
.qpicker-filter-label {
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em;
  color: rgba(255,255,255,0.3); text-transform: uppercase;
}
.qpicker-diff-pills { display: flex; gap: 4px; flex-wrap: wrap; }
.diff-pill {
  padding: 3px 10px; border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.4);
  font-size: 0.68rem; font-weight: 700; cursor: pointer;
  transition: all 0.15s;
}
.diff-pill--all.diff-pill--active    { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3); color: #fff; }
.diff-pill--easy.diff-pill--active   { background: rgba(76,175,80,0.15);  border-color: rgba(76,175,80,0.4);  color: #81c784; }
.diff-pill--medium.diff-pill--active { background: rgba(255,152,0,0.12);  border-color: rgba(255,152,0,0.4);  color: #ffb74d; }
.diff-pill--hard.diff-pill--active   { background: rgba(229,57,53,0.12);  border-color: rgba(229,57,53,0.4);  color: #ef9a9a; }

/* Problem list */
.qpicker-list {
  display: flex; flex-direction: column; gap: 3px;
  max-height: 220px; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
}
.qpicker-list::-webkit-scrollbar { width: 3px; }
.qpicker-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
.qpicker-item {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px; border-radius: 7px;
  border: 1px solid rgba(255,255,255,0.05);
  background: rgba(255,255,255,0.02);
  cursor: pointer; text-align: left; width: 100%;
  transition: all 0.12s;
}
.qpicker-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); }
.qpicker-item--selected {
  background: rgba(30,136,229,0.12) !important;
  border-color: rgba(30,136,229,0.35) !important;
}
.qpicker-item-name {
  flex: 1; font-size: 0.76rem; font-weight: 500;
  color: rgba(255,255,255,0.8); white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.qpicker-check { color: #64b5f6; flex-shrink: 0; }
.qpicker-diff-badge {
  flex-shrink: 0; padding: 1px 6px; border-radius: 4px;
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.04em;
}
.badge--easy   { background: rgba(76,175,80,0.12);  color: #81c784; }
.badge--medium { background: rgba(255,152,0,0.1);   color: #ffb74d; }
.badge--hard   { background: rgba(229,57,53,0.1);   color: #ef9a9a; }
.qpicker-empty { font-size: 0.72rem; color: rgba(255,255,255,0.25); padding: 8px; text-align: center; }
.qpicker-loading {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.74rem; color: rgba(255,255,255,0.3); padding: 8px 0;
}
.qpicker-spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.1);
  border-top-color: #1e88e5;
  animation: qp-spin 0.7s linear infinite; flex-shrink: 0;
}
@keyframes qp-spin { to { transform: rotate(360deg); } }
.qpicker-pinned {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.72rem; color: #81c784;
  padding: 6px 10px; border-radius: 7px;
  background: rgba(76,175,80,0.08);
  border: 1px solid rgba(76,175,80,0.2);
}
.qpicker-pinned strong { color: #a5d6a7; }
.settings-difficulty-wrap { width: 100%; }
.settings-pick-notice {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.72rem; color: rgba(255,255,255,0.3);
  font-style: italic; padding: 6px 2px;
}

/* ══ Leaderboard ══ */
/* ══ Leaderboard ══ */
.waiting-pulse {
  width: 9px; height: 9px; border-radius: 50%; background: #4caf50;
  animation: wpulse 1.6s ease-in-out infinite;
}
@keyframes wpulse { 0%,100% { box-shadow: 0 0 0 0 rgba(76,175,80,0.5); } 50% { box-shadow: 0 0 0 10px rgba(76,175,80,0); } }

.lb-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 50px 20px; text-align: center;
}
.lb-empty-icon { font-size: 2.2rem; }
.lb-empty p     { color: rgba(255,255,255,0.38); font-size: 0.88rem; font-weight: 600; margin: 0; }
.lb-empty small { color: rgba(255,255,255,0.2); font-size: 0.74rem; }

.lb-list {
  display: flex; flex-direction: column; gap: 5px;
  padding: 10px; overflow-y: auto; max-height: 480px;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
}
.lb-list::-webkit-scrollbar { width: 3px; }
.lb-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

.lb-row {
  display: grid; grid-template-columns: 34px 28px 1fr auto;
  align-items: center; gap: 9px;
  padding: 9px 12px 9px 10px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.025);
  position: relative; overflow: hidden;
  transition: transform 0.14s, border-color 0.14s, background 0.14s, box-shadow 0.14s;
  cursor: default;
}
.lb-row::before {
  content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
  width: 3px; border-radius: 2px; opacity: 0;
}
.lb-row:hover { transform: translateX(3px); background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.14); }

.lb-row.first-place  { background: rgba(255,214,0,0.055); border-color: rgba(255,214,0,0.18); }
.lb-row.first-place::before  { opacity: 1; background: #ffd600; }
.lb-row.second-place { background: rgba(192,192,210,0.04); border-color: rgba(192,192,210,0.15); }
.lb-row.second-place::before { opacity: 1; background: #b0b0c8; }
.lb-row.third-place  { background: rgba(205,127,50,0.05); border-color: rgba(205,127,50,0.18); }
.lb-row.third-place::before  { opacity: 1; background: #cd7f32; }
.lb-row.lb-row--me {
  background: rgba(30,136,229,0.09) !important;
  border-color: rgba(30,136,229,0.3) !important;
  box-shadow: 0 0 12px rgba(30,136,229,0.12);
}

.lb-rank { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: rgba(0,0,0,0.2); border-radius: 50%; }
.lb-medal { font-size: 1.15rem; line-height: 1; }
.lb-num   { font-size: 0.68rem; font-weight: 700; color: rgba(255,255,255,0.3); font-family: monospace; }

.lb-avatar img, .lb-av-ph { width: 26px; height: 26px; border-radius: 50%; }
.lb-avatar img { object-fit: cover; display: block; }
.lb-av-ph {
  background: rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700; color: rgba(255,255,255,0.4);
}

.lb-info  { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.lb-name  {
  font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.85);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  display: flex; align-items: center; gap: 5px;
}
.lb-time  { font-size: 0.65rem; color: rgba(255,255,255,0.28); font-family: monospace; }
.you-tag  {
  font-style: normal; font-size: 0.56rem; font-weight: 700; letter-spacing: 0.04em;
  color: #64b5f6; background: rgba(100,181,246,0.15);
  padding: 1px 5px; border-radius: 3px; flex-shrink: 0;
}

.lb-score {
  font-family: monospace; font-size: 1.05rem; font-weight: 800;
  color: #66bb6a; text-align: right; white-space: nowrap; letter-spacing: -0.02em;
}
.lb-row.first-place  .lb-score { color: #ffd600; }
.lb-row.second-place .lb-score { color: #b0b0c8; }
.lb-row.third-place  .lb-score { color: #cd7f32; }
.lb-score--perfect { color: #00e5ff !important; text-shadow: 0 0 12px rgba(0,229,255,0.4); }
.score-pct { font-size: 0.65rem; opacity: 0.45; }

/* ── Force dark card background + white text regardless of page theme ── */
.lb-card {
  background: rgba(10,12,20,0.85) !important;
  border-color: rgba(255,255,255,0.1) !important;
}
.lb-card .card-header {
  background: rgba(0,0,0,0.35) !important;
  border-bottom-color: rgba(255,255,255,0.08) !important;
}
.lb-card .card-title { color: rgba(255,255,255,0.55) !important; }
.lb-card .lb-list    { background: transparent !important; }
.lb-card .lb-row     { background: rgba(255,255,255,0.04) !important; }
.lb-card .lb-row.first-place  { background: rgba(255,214,0,0.07) !important; }
.lb-card .lb-row.second-place { background: rgba(192,192,210,0.05) !important; }
.lb-card .lb-row.third-place  { background: rgba(205,127,50,0.06) !important; }
.lb-card .lb-row.lb-row--me   { background: rgba(30,136,229,0.1) !important; }
.lb-card .lb-name  { color: rgba(255,255,255,0.88) !important; }
.lb-card .lb-score { color: #66bb6a !important; }
.lb-card .lb-num   { color: rgba(255,255,255,0.3) !important; }
.lb-card .lb-time  { color: rgba(255,255,255,0.3) !important; }
.lb-card .lb-empty p     { color: rgba(255,255,255,0.4) !important; }
.lb-card .lb-empty small { color: rgba(255,255,255,0.22) !important; }

/* ══ Transitions ══ */
.lb-anim-enter-active { transition: all 0.26s ease; }
.lb-anim-enter-from   { opacity: 0; transform: translateX(14px); }
.lb-anim-move         { transition: transform 0.32s ease; }

/* ══ Host Left Warning ══ */
.host-left-overlay {
  position: fixed; inset: 0;
  display: flex; align-items: flex-start; justify-content: center;
  padding-top: 40px;
  z-index: 99999;
  pointer-events: none;
}
.host-left-box {
  pointer-events: auto;
  background: linear-gradient(135deg, #1a0a0a 0%, #2a1010 100%);
  border: 1px solid rgba(239,83,80,0.4);
  border-radius: 14px;
  padding: 20px 24px;
  min-width: 340px; max-width: 460px;
  box-shadow: 0 8px 40px rgba(239,83,80,0.25), 0 0 0 1px rgba(239,83,80,0.1) inset;
  display: flex; flex-direction: column; gap: 14px;
  animation: host-left-in 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes host-left-in {
  from { opacity: 0; transform: translateY(-20px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.host-left-icon {
  display: flex; align-items: center; justify-content: center;
  width: 48px; height: 48px; border-radius: 12px;
  background: rgba(239,83,80,0.15);
  border: 1px solid rgba(239,83,80,0.3);
  color: #ef5350;
  flex-shrink: 0;
  align-self: center;
}
.host-left-content { text-align: center; }
.host-left-title {
  margin: 0 0 4px;
  font-size: 1rem; font-weight: 800;
  color: #ef9a9a; letter-spacing: 0.04em;
}
.host-left-msg {
  margin: 0;
  font-size: 0.82rem; color: rgba(255,255,255,0.55);
  line-height: 1.5;
}
.host-left-countdown {
  height: 3px; border-radius: 2px;
  background: rgba(255,255,255,0.08); overflow: hidden;
}
.host-left-bar {
  height: 100%;
  background: linear-gradient(90deg, #ef5350, #e53935);
  border-radius: 2px;
  animation: host-left-drain 3s linear forwards;
  transform-origin: left;
}
@keyframes host-left-drain {
  from { width: 100%; }
  to   { width: 0%; }
}

.host-left-fade-enter-active { transition: all 0.25s ease; }
.host-left-fade-leave-active { transition: all 0.2s ease; }
.host-left-fade-enter-from, .host-left-fade-leave-to { opacity: 0; }
</style>
