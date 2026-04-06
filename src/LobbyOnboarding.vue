<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { getSocket } from './js/socket.js';

const socket = getSocket();

if (!socket) {
  console.error('[LobbyOnboarding] No socket available');
  if (!localStorage.getItem('jwt_token')) {
    window.location.href = '/signin.html';
  }
}

const selectedLanguage = ref("Python");
const userCode = ref("");
const showResults = ref(false);
const judgeResult = ref(null);
const returnCountdown = ref(0);
const problem = ref({ title: "", description: "", testcases: [] });
const isSubmitting = ref(false);

// ── ANTI-CHEAT STATE ─────────────────────────────────────────
const tabSwitchCount = ref(0);
const tabSwitchWarning = ref(false);
const tabSwitchWarningMsg = ref('');
const warningDismissTimer = ref(null);
const MAX_TAB_SWITCHES = 3;
const isDisqualified = ref(false);

function emitCheatEvent(type, detail = {}) {
  if (!socket) return;
  socket.emit('cheat_detected', {
    lobbyId: lobbyId.value,
    userId: getUserId(),
    type,
    ...detail
  });
}

function showWarning(msg, autoDismiss = 4000) {
  tabSwitchWarning.value = true;
  tabSwitchWarningMsg.value = msg;
  if (warningDismissTimer.value) clearTimeout(warningDismissTimer.value);
  if (autoDismiss) {
    warningDismissTimer.value = setTimeout(() => {
      tabSwitchWarning.value = false;
    }, autoDismiss);
  }
}

function handleVisibilityChange() {
  if (document.hidden && !isDisqualified.value) {
    tabSwitchCount.value++;
    emitCheatEvent('tab_switch', { count: tabSwitchCount.value });
    if (tabSwitchCount.value >= MAX_TAB_SWITCHES) {
      isDisqualified.value = true;
      tabSwitchWarning.value = true;
      tabSwitchWarningMsg.value = 'You have been disqualified - too many tab switches detected.';
      emitCheatEvent('disqualified', { reason: 'tab_switch_limit' });
    } else {
      const remaining = MAX_TAB_SWITCHES - tabSwitchCount.value;
      showWarning(`Warning: Tab switch detected (${tabSwitchCount.value}/${MAX_TAB_SWITCHES}) - ${remaining} more will disqualify you.`);
    }
  }
}

function blockContextMenu(e) { e.preventDefault(); }

function blockDevKeys(e) {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['i','I','j','J','c','C','u','U'].includes(e.key)) ||
    (e.ctrlKey && ['u','U'].includes(e.key))
  ) {
    e.preventDefault();
    showWarning('🔒 DevTools are restricted during the match.');
    emitCheatEvent('devtools_attempt');
  }
}

// Lobby-specific data
const lobbyId = ref(null);
const problemId = ref(null);
const lobby = ref(null);

const playerScores = ref([]);
const currentUserId = computed(() => Number(getUserId()));

// Timer data
const matchDuration = ref(300);
const remainingTime = ref(300);
const timerInterval = ref(null);
const matchStartTime = ref(null);

// Code streaming
let codeUpdateTimeout = null;

watch(showResults, (newVal, oldVal) => {
  console.log('[LobbyOnboarding] showResults changed:', oldVal, '->', newVal);
});

// Component Imports
import Window from './components/window.vue';
import ButtonText from './components/button-text.vue';
import TestCaseCarousel from './components/testcase-carousel.vue';
import TestCaseCard from './components/testcase-card.vue';
import TestcaseIO from './components/testcase-io.vue';
import DropdownArray from './components/dropdown-array.vue';
import CodeEditor from './components/codeeditor.vue';

function getUserId() {
  if (socket?.user?.id) return socket.user.id;
  if (socket?.user?.user_id) return socket.user.user_id;
  if (window.user?.id) return window.user.id;
  if (window.user?.user_id) return window.user.user_id;
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      if (u?.id) return u.id;
      if (u?.user_id) return u.user_id;
    }
  } catch (e) {}
  console.warn('[getUserId] Could not find user ID');
  return null;
}

// Watch for code changes and broadcast to spectators
watch([userCode, selectedLanguage], () => {
  clearTimeout(codeUpdateTimeout);
  codeUpdateTimeout = setTimeout(() => {
    if (lobbyId.value && userCode.value && socket) {
      socket.emit('player_code_update', {
        lobbyId: parseInt(lobbyId.value),
        code: userCode.value,
        language: selectedLanguage.value,
        userId: getUserId()
      });
    }
  }, 500);
});

onMounted(() => {
  console.log('===== LOBBY ONBOARDING PAGE LOADED =====');

  // ── Single-fire auth + rejoin ────────────────────────────────
  let hasJoined = false;

  function doJoin() {
    if (hasJoined) return;
    hasJoined = true;

    if (socket.user) {
      if (!window.user) window.user = {};
      window.user.id       = socket.user.id;
      window.user.user_id  = socket.user.id;
      window.user.username = socket.user.username;
    }

    const uid = Number(getUserId());
    const lid = Number(lobbyId.value);
    if (!uid || !lid) return;

    // ── Reset stale match state from any previous room ──
    playerScores.value = [];
    judgeResult.value = null;
    showResults.value = false;
    isSubmitting.value = false;
    returnCountdown.value = 0;
    tabSwitchCount.value = 0;
    isDisqualified.value = false;
    tabSwitchWarning.value = false;
    problem.value = { title: '', description: '', testcases: [] };
    userCode.value = '';

    console.log('[LobbyOnboarding] doJoin lobby:', lid, 'user:', uid);
    socket.emit('rejoin_lobby_match', { lobbyId: lid, userId: uid });

    // Anti-cheat listeners (idempotent)
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('contextmenu', blockContextMenu);
    document.removeEventListener('keydown', blockDevKeys);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockDevKeys);

    if (!problem.value.title) loadProblem();
  }

  // Replace stale authenticated listener
  socket.off('authenticated');
  socket.on('authenticated', (data) => {
    if (data.userId) {
      if (!window.user) window.user = {};
      window.user.id       = data.userId;
      window.user.user_id  = data.userId;
      window.user.username = data.username;
    }
    doJoin();
  });

  // Get lobby info from URL or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  lobbyId.value = urlParams.get('lobby_id') || localStorage.getItem('currentMatchId');
  problemId.value = urlParams.get('problem_id');
  const duration = urlParams.get('match_duration');
  const urlLanguage = urlParams.get('language');
  if (urlLanguage) {
    selectedLanguage.value = urlLanguage;
    console.log('[LobbyOnboarding] Language locked from room settings:', urlLanguage);
  }

  console.log('[LobbyOnboarding] Lobby ID:', lobbyId.value);
  console.log('[LobbyOnboarding] Problem ID:', problemId.value);

  if (!lobbyId.value || !problemId.value) {
    alert('Missing lobby or problem information');
    window.location.href = '/lobbies.html';
    return;
  }

  // Seed leaderboard from server's authoritative state on rejoin
  socket.off('lobby_match_state');
  socket.on('lobby_match_state', (data) => {
    if (data && Array.isArray(data.players)) {
      playerScores.value = data.players.map(p => ({
        userId: Number(p.userId ?? p.user_id),
        username: p.username || 'Player',
        score: Number(p.score ?? 0),
        completionTime: p.completionTime ?? p.completion_time ?? null,
        avatar_url: p.avatar_url || null
      })).sort((a, b) => b.score - a.score || (a.completionTime||Infinity) - (b.completionTime||Infinity));
      console.log('[LobbyOnboarding] Seeded leaderboard from match state:', playerScores.value.length, 'players');
    }
  });

  // Register leaderboard listener (off first to prevent duplicates)
  function onLeaderboardUpdate(data) {
    const userId         = Number(data.userId ?? data.user_id);
    const completionTime = data.completionTime ?? data.completion_time ?? null;
    const score          = Number(data.score ?? 0);
    const updated        = playerScores.value.map(p => ({ ...p }));
    const idx            = updated.findIndex(p => Number(p.userId) === userId);
    if (idx >= 0) {
      updated[idx].score          = score;
      updated[idx].completionTime = completionTime;
    } else {
      updated.push({ userId, username: data.username || 'Player', score, completionTime, avatar_url: data.avatar_url || null });
    }
    updated.sort((a, b) => b.score !== a.score ? b.score - a.score : (a.completionTime || Infinity) - (b.completionTime || Infinity));
    playerScores.value = updated;
  }
  socket.off('lobby_leaderboard_update', onLeaderboardUpdate);
  socket.on('lobby_leaderboard_update', onLeaderboardUpdate);

  // If already authenticated, join immediately
  if (socket.connected && socket.user && socket.user.id) {
    doJoin();
  }

  // Set match duration and start timer
  if (duration) {
    matchDuration.value = parseInt(duration);
    remainingTime.value = parseInt(duration);
  }
  startTimer();

  // Get room code from localStorage if available
  const roomCode = localStorage.getItem('currentLobbyRoomCode');
  if (roomCode) {
    lobby.value = { room_code: roomCode };
  }
});

async function loadProblem() {
  if (!socket) return;
  if (problem.value.title) return;

  if (!socket.connected) {
    let waitAttempts = 0;
    while (!socket.connected && waitAttempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 200));
      waitAttempts++;
    }
    if (!socket.connected) {
      alert('Connection timeout. Please refresh the page.');
      return;
    }
  }

  socket.emit('register_for_lobby_match', {
    lobbyId: parseInt(lobbyId.value),
    problemId: parseInt(problemId.value)
  });

  socket.emit('get_problem_by_id', { problem_id: problemId.value }, (response) => {
    if (response && response.success) {
      problem.value = {
        title: response.question.title,
        description: response.question.description,
        testcases: response.question.testcases || []
      };
      console.log('[LobbyOnboarding] ✅ Problem loaded:', problem.value.title);
    } else {
      console.error('[LobbyOnboarding] ❌ Failed to load problem:', response);
      alert('Failed to load problem: ' + (response?.message || 'Unknown error'));
      setTimeout(() => { window.location.href = '/lobbies.html'; }, 3000);
    }
  });

  setTimeout(() => {
    if (!problem.value.title) {
      socket.emit('get_problem_by_id', { problem_id: problemId.value }, (response) => {
        if (response && response.success) {
          problem.value = {
            title: response.question.title,
            description: response.question.description,
            testcases: response.question.testcases || []
          };
        } else {
          alert('Unable to load problem. Please refresh the page.');
        }
      });
    }
  }, 5000);
}

function submitCode() {
  if (isSubmitting.value) return;
  if (!userCode.value.trim()) {
    alert('Please write some code before submitting!');
    return;
  }

  isSubmitting.value = true;

  socket.emit('player_submitted', {
    lobbyId: parseInt(lobbyId.value),
    userId: getUserId()
  });

  socket.emit("submit_code", {
    problem_id: problemId.value,
    language: selectedLanguage.value,
    source_code: userCode.value,
    lobby_id: lobbyId.value,
    user_id: getUserId(),
    mode: 'lobby',
    submission_duration: matchStartTime.value
      ? Math.floor((Date.now() - matchStartTime.value) / 1000)
      : 0
  });
}

socket.on("judge_result", (data) => {
  console.log('[LobbyOnboarding] Judge result received:', data);
  isSubmitting.value = false;
  judgeResult.value = data;
  returnCountdown.value = 3;
  const tick = setInterval(() => {
    returnCountdown.value--;
    if (returnCountdown.value <= 0) {
      clearInterval(tick);
      backToLobbyRoom();
    }
  }, 1000);
});

function startTimer() {
  matchStartTime.value = Date.now();
  timerInterval.value = setInterval(() => {
    const elapsed = Math.floor((Date.now() - matchStartTime.value) / 1000);
    remainingTime.value = Math.max(0, matchDuration.value - elapsed);
    if (remainingTime.value === 0) {
      clearInterval(timerInterval.value);
      // Force submit when time runs out
      if (!isSubmitting.value && !judgeResult.value) {
        console.log('[LobbyOnboarding] ⏰ Time is up! Force submitting...');
        if (!userCode.value.trim()) {
          // No code written — submit a placeholder so the player gets a 0% score
          // and the leaderboard/server registers them as having submitted
          userCode.value = '# Time expired - no submission';
        }
        forceSubmit();
      }
    }
  }, 1000);
}

function forceSubmit() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  socket.emit('player_submitted', {
    lobbyId: parseInt(lobbyId.value),
    userId: getUserId()
  });

  socket.emit('submit_code', {
    problem_id: problemId.value,
    language: selectedLanguage.value,
    source_code: userCode.value,
    lobby_id: lobbyId.value,
    user_id: getUserId(),
    mode: 'lobby',
    submission_duration: matchStartTime.value
      ? Math.floor((Date.now() - matchStartTime.value) / 1000)
      : 0,
    force_submit: true
  });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function backToLobbyRoom() {
  const roomCode = lobby.value?.room_code;
  if (roomCode) {
    window.location.href = `/room.html?code=${roomCode}&rejoining=1`;
  } else {
    window.location.href = '/lobbies.html';
  }
}

onBeforeUnmount(() => {
  clearTimeout(codeUpdateTimeout);
  if (timerInterval.value) clearInterval(timerInterval.value);
  if (warningDismissTimer.value) clearTimeout(warningDismissTimer.value);
  if (socket) {
    socket.off("judge_result");
    socket.off('lobby_leaderboard_update');
    socket.off('lobby_match_state');
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  document.removeEventListener('contextmenu', blockContextMenu);
  document.removeEventListener('keydown', blockDevKeys);
});
</script>

<template>

  <!-- ══ DISQUALIFIED OVERLAY ══ -->
  <Teleport to="body">
    <div v-if="isDisqualified" class="dq-overlay">
      <div class="dq-card">
        <div class="dq-icon">⛔</div>
        <h2 class="dq-title">Disqualified</h2>
        <p class="dq-reason">You switched tabs or left the window too many times during the match.</p>
        <p class="dq-sub">Your submission has been voided. The match will continue for other players.</p>
        <button class="dq-btn" @click="backToLobbyRoom()">Return to Lobby</button>
      </div>
    </div>
  </Teleport>

  <!-- ══ TAB SWITCH WARNING TOAST ══ -->
  <Teleport to="body">
    <Transition name="toast-slide">
      <div v-if="tabSwitchWarning && !isDisqualified" class="cheat-toast">
        <span class="cheat-toast-icon">⚠️</span>
        <span class="cheat-toast-msg">{{ tabSwitchWarningMsg }}</span>
        <button class="cheat-toast-close" @click="tabSwitchWarning = false">✕</button>
      </div>
    </Transition>
  </Teleport>

  <!-- ══ LEFT: Lobby info + Leaderboard ══ -->
  <section class="lo-col lo-col--left">

    <div class="lo-card info-card">
      <div class="info-header">
        <div class="info-icon">⚔️</div>
        <div class="info-body">
          <div class="info-label">LOBBY</div>
          <div class="info-id">#{{ lobbyId }}</div>
        </div>
        <div class="timer-block" :class="{ 'timer-warn': remainingTime < 60, 'timer-crit': remainingTime < 30 }">
          <div class="timer-icon-wrap">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <span class="timer-val">{{ formatTime(remainingTime) }}</span>
        </div>
      </div>
      <div class="timer-bar-wrap">
        <div class="timer-bar" :style="{ width: Math.min((remainingTime / matchDuration) * 100, 100) + '%' }" :class="{ 'bar-warn': remainingTime < 60, 'bar-crit': remainingTime < 30 }"></div>
      </div>
    </div>

    <div class="lo-card lb-card">
      <div class="lo-card-header">
        <span class="lo-card-title">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" opacity="0.7"><path d="M5 3h14a1 1 0 011 1v16a1 1 0 01-.553.894l-7 3.5a1 1 0 01-.894 0l-7-3.5A1 1 0 014 20V4a1 1 0 011-1zm7 13.5l5 2.5V5H7v14l5-2.5z"/></svg>
          Leaderboard
        </span>
        <span v-if="playerScores.length" class="lo-badge">{{ playerScores.length }}</span>
      </div>

      <div v-if="playerScores.length === 0" class="lb-empty">
        <div class="lb-pulse"></div>
        <span>Waiting for submissions…</span>
      </div>

      <div v-else class="lb-scroll">
        <div v-if="playerScores.every(p => (p.score||0)===0)" class="lb-waiting-hint">
          <div class="lb-pulse"></div><span>Match in progress…</span>
        </div>
        <div
          v-for="(player, i) in playerScores" :key="player.userId"
          :class="['lb-row', i===0?'gold':i===1?'silver':i===2?'bronze':'', { 'lb-row--me': player.userId === currentUserId }]"
        >
          <div class="lb-rank">
            <span v-if="i===0 && player.score>0">🥇</span>
            <span v-else-if="i===1 && player.score>0">🥈</span>
            <span v-else-if="i===2 && player.score>0">🥉</span>
            <span v-else class="lb-num">#{{ i+1 }}</span>
          </div>
          <div class="lb-av">{{ player.username?.[0]?.toUpperCase() }}</div>
          <div class="lb-name">
            {{ player.username }}
            <span v-if="player.userId === currentUserId" class="you-tag">you</span>
          </div>
          <div class="lb-score" :class="{ 'score-zero': !player.score }">
            {{ player.score }}<span class="pct">%</span>
          </div>
        </div>
      </div>
    </div>

  </section>

  <!-- ══ MIDDLE: Problem + Results ══ -->
  <section class="lo-col lo-col--mid">

    <div class="lo-card problem-card">
      <div class="lo-card-header">
        <span class="lo-card-title problem-title">{{ problem.title || 'Loading problem…' }}</span>
      </div>
      <div class="problem-body">
        <div class="problem-description" v-html="problem.description || '<p>Loading…</p>'"></div>

        <div v-if="problem.testcases.filter(t=>t.is_sample).length > 0" class="samples-section">
          <div class="sample-label">
            SAMPLE CASES
            <span class="lo-badge" style="margin-left:6px;">{{ problem.testcases.filter(t=>t.is_sample).length }}</span>
          </div>
          <div class="samples-list">
            <div v-for="(tc, idx) in problem.testcases.filter(t=>t.is_sample)" :key="tc.id||idx" class="sample-row">
              <div class="sample-row-num">{{ idx + 1 }}</div>
              <div class="sample-row-io">
                <div class="sample-io-block">
                  <div class="io-label io-label--in">Input</div>
                  <div class="io-value">{{ tc.input }}</div>
                </div>
                <div class="sample-io-block">
                  <div class="io-label io-label--out">Output</div>
                  <div class="io-value">{{ tc.expected }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lo-card results-panel">
      <div class="lo-card-header">
        <span class="lo-card-title">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Last Submission
        </span>
        <span v-if="judgeResult"
          :class="['verdict-badge', judgeResult.verdict === 'Accepted' ? 'vb-accepted' : judgeResult.passed > 0 ? 'vb-partial' : 'vb-failed']">
          {{ judgeResult.verdict === 'Accepted' ? '✓ Accepted' : judgeResult.passed > 0 ? '~ Partial' : '✗ Failed' }}
        </span>
      </div>

      <div v-if="judgeResult && returnCountdown > 0" class="rp-countdown-banner">
        <div class="rp-countdown-num">{{ returnCountdown }}</div>
        <div class="rp-countdown-text">
          <strong>Returning to lobby…</strong>
          <span>You can also click below to go back now</span>
        </div>
        <button class="rp-go-now-btn" @click="backToLobbyRoom()">Go now →</button>
      </div>

      <div v-if="!judgeResult && !isSubmitting" class="rp-empty">
        <div class="rp-empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.2"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </div>
        <p>No submission yet</p>
        <small>Results will appear here after you submit</small>
      </div>

      <div v-else-if="isSubmitting" class="rp-loading">
        <div class="rp-spinner"></div>
        <span>Running test cases…</span>
      </div>

      <div v-else-if="judgeResult" class="rp-content">
        <div class="rp-score-row">
          <div class="rp-stat">
            <div class="rp-stat-val" :class="judgeResult.score === 100 ? 'val-perfect' : judgeResult.score > 0 ? 'val-partial' : 'val-zero'">
              {{ judgeResult.score ?? 0 }}<span class="rp-pct">%</span>
            </div>
            <div class="rp-stat-label">Score</div>
          </div>
          <div class="rp-stat">
            <div class="rp-stat-val val-neutral">{{ judgeResult.passed ?? 0 }}/{{ judgeResult.total ?? 0 }}</div>
            <div class="rp-stat-label">Tests Passed</div>
          </div>
          <div v-if="judgeResult.completionTime && matchStartTime" class="rp-stat">
            <div class="rp-stat-val val-neutral">{{ Math.floor((judgeResult.completionTime - matchStartTime) / 1000) }}s</div>
            <div class="rp-stat-label">Time</div>
          </div>
        </div>

        <div v-if="judgeResult.results?.length" class="rp-tc-grid">
          <div
            v-for="(r, idx) in judgeResult.results" :key="idx"
            :class="['rp-tc-chip', r.status === 'Accepted' ? 'chip-pass' : 'chip-fail']"
            :title="r.status"
          >
            <span class="chip-icon">{{ r.status === 'Accepted' ? '✓' : '✗' }}</span>
            <span class="chip-num">{{ idx + 1 }}</span>
          </div>
        </div>

        <div v-if="judgeResult.stderr || judgeResult.error" class="rp-error-box">
          <div class="rp-error-label">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Error Output
          </div>
          <pre class="rp-error-pre">{{ judgeResult.stderr || judgeResult.error }}</pre>
        </div>
      </div>
    </div>

  </section>

  <!-- ══ RIGHT: Editor ══ -->
  <section class="lo-col lo-col--right">
    <div class="lo-card editor-card">
      <div class="editor-toolbar">
        <div class="lang-badge">
          <span class="lang-dot"></span>
          {{ selectedLanguage }}
        </div>
        <div class="toolbar-right">
          <div class="input-hint-toggle" title="Input format hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div class="hint-popover">
              <div class="hint-title">Input Format</div>
              <code v-if="selectedLanguage==='Python'">import sys; data = sys.stdin.read().strip()</code>
              <code v-else-if="selectedLanguage==='JavaScript'">const input = require('fs').readFileSync(0,'utf-8').trim()</code>
              <code v-else-if="selectedLanguage==='Java'">Scanner sc = new Scanner(System.in);</code>
              <code v-else-if="selectedLanguage==='C++'">string input; getline(cin, input);</code>
              <div class="hint-out">Output: print to stdout</div>
            </div>
          </div>
          <button :class="['submit-btn', { 'submit-btn--loading': isSubmitting }]" :disabled="isSubmitting" @click="submitCode">
            <svg v-if="!isSubmitting" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <span v-if="isSubmitting" class="submit-spin">⟳</span>
            {{ isSubmitting ? 'Submitting…' : 'Submit' }}
          </button>
        </div>
      </div>

      <div class="editor-wrap">
        <CodeEditor v-model="userCode" :language="selectedLanguage.toLowerCase()" placeholder="// Write your solution here…" />
      </div>
    </div>

    <!-- Match Activity Feed -->
    <div class="lo-card activity-card">
      <div class="lo-card-header">
        <span class="lo-card-title">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Match Activity
        </span>
        <span class="lo-badge live-dot-badge">
          <span class="live-dot"></span> LIVE
        </span>
      </div>
      <div class="activity-body">
        <div v-if="playerScores.length === 0" class="activity-empty">
          <span>Waiting for match activity…</span>
        </div>
        <TransitionGroup v-else name="act-fade" tag="div" class="activity-list">
          <div
            v-for="(player, idx) in [...playerScores].reverse().slice(0, 6)"
            :key="player.userId + '-' + player.score"
            :class="['activity-item', player.score === 100 ? 'act-perfect' : player.score > 0 ? 'act-partial' : 'act-attempt']"
          >
            <div class="act-avatar">{{ player.username?.[0]?.toUpperCase() }}</div>
            <div class="act-info">
              <span class="act-name">{{ player.username }}</span>
              <span class="act-desc">
                {{ player.score === 100 ? 'solved it! 🎉' : player.score > 0 ? `scored ${player.score}%` : 'submitted' }}
              </span>
            </div>
            <div :class="['act-score', player.score === 100 ? 'as-perfect' : player.score > 0 ? 'as-partial' : 'as-zero']">
              {{ player.score }}<span style="font-size:0.55rem;opacity:0.5;">%</span>
            </div>
          </div>
        </TransitionGroup>

        <div class="hint-strip">
          <div class="hint-strip-title">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Input hint
          </div>
          <code class="hint-code" v-if="selectedLanguage==='Python'">import sys; data = sys.stdin.read().strip()</code>
          <code class="hint-code" v-else-if="selectedLanguage==='JavaScript'">require('fs').readFileSync(0,'utf-8').trim()</code>
          <code class="hint-code" v-else-if="selectedLanguage==='Java'">Scanner sc = new Scanner(System.in);</code>
          <code class="hint-code" v-else-if="selectedLanguage==='C++'">string s; getline(cin, s);</code>
          <div class="hint-note">Output: print to stdout (one line)</div>
        </div>
      </div>
    </div>

  </section>
</template>

<style scoped>
.lo-col { display: flex; flex-direction: column; gap: 10px; min-width: 0; align-self: stretch; }
.lo-col--left  { width: 210px; min-width: 190px; flex-shrink: 0; }
.lo-col--mid   { flex: 1; min-width: 260px; }
.lo-col--right { width: 42%; min-width: 320px; flex-shrink: 0; }

.lo-card { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; }
.lo-card-header { display: flex; align-items: center; justify-content: space-between; padding: 11px 14px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.18); flex-shrink: 0; }
.lo-card-title { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.05em; color: rgba(255,255,255,0.55); text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
.lo-badge { padding: 1px 7px; border-radius: 9px; font-size: 0.6rem; font-weight: 700; font-family: monospace; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.45); }

.info-card { flex-shrink: 0; }
.lb-card   { flex: 1; min-height: 0; overflow: hidden; }

.info-header { display: flex; align-items: center; gap: 10px; padding: 10px 12px 8px; }
.info-icon  { font-size: 1.3rem; line-height: 1; }
.info-body  { flex: 1; }
.info-label { font-size: 0.58rem; font-weight: 800; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); text-transform: uppercase; }
.info-id    { font-size: 0.9rem; font-weight: 800; color: rgba(255,255,255,0.85); font-family: monospace; }

.timer-block { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease; }
.timer-block.timer-warn { background: rgba(255,152,0,0.1); border-color: rgba(255,152,0,0.3); }
.timer-block.timer-crit { background: rgba(229,57,53,0.12); border-color: rgba(229,57,53,0.4); animation: crit-pulse 0.8s ease-in-out infinite; }
@keyframes crit-pulse { 0%,100%{opacity:1;}50%{opacity:0.75;} }
.timer-icon-wrap { color: rgba(255,255,255,0.5); flex-shrink: 0; }
.timer-block.timer-warn .timer-icon-wrap { color: #ff9800; }
.timer-block.timer-crit .timer-icon-wrap { color: #ef5350; }
.timer-val { font-family: monospace; font-size: 0.88rem; font-weight: 800; color: rgba(255,255,255,0.85); letter-spacing: 0.04em; }
.timer-block.timer-warn .timer-val { color: #ffb74d; }
.timer-block.timer-crit .timer-val { color: #ef9a9a; }
.timer-bar-wrap { height: 3px; background: rgba(255,255,255,0.06); flex-shrink: 0; }
.timer-bar { height: 100%; background: #1e88e5; transition: width 1s linear, background 0.3s; }
.timer-bar.bar-warn { background: #ff9800; }
.timer-bar.bar-crit { background: #ef5350; }

.lb-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 16px; color: rgba(255,255,255,0.28); font-size: 0.78rem; flex: 1; justify-content: center; }
.lb-pulse { width: 8px; height: 8px; border-radius: 50%; background: #4caf50; animation: lbpulse 1.5s ease-in-out infinite; }
@keyframes lbpulse { 0%,100%{box-shadow:0 0 0 0 rgba(76,175,80,0.5);}50%{box-shadow:0 0 0 9px rgba(76,175,80,0);} }
.lb-scroll { overflow-y: auto; flex: 1; min-height: 0; padding: 8px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
.lb-scroll::-webkit-scrollbar { width: 3px; }
.lb-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.lb-waiting-hint { display: flex; align-items: center; gap: 7px; padding: 4px 4px 8px; font-size: 0.7rem; color: rgba(255,255,255,0.25); }
.lb-row { display: grid; grid-template-columns: 28px 24px 1fr auto; align-items: center; gap: 7px; padding: 7px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); margin-bottom: 4px; position: relative; transition: transform 0.12s, background 0.12s; cursor: default; }
.lb-row::before { content:''; position:absolute; left:0; top:20%; bottom:20%; width:2.5px; border-radius:2px; opacity:0; }
.lb-row:hover { background: rgba(255,255,255,0.045); transform: translateX(2px); }
.lb-row.gold   { background: rgba(255,214,0,0.05);   border-color: rgba(255,214,0,0.15); }
.lb-row.gold::before   { opacity:1; background:#ffd600; }
.lb-row.silver { background: rgba(192,192,210,0.04); border-color: rgba(192,192,210,0.12); }
.lb-row.silver::before { opacity:1; background:#b0b0c8; }
.lb-row.bronze { background: rgba(205,127,50,0.04);  border-color: rgba(205,127,50,0.15); }
.lb-row.bronze::before { opacity:1; background:#cd7f32; }
.lb-row.lb-row--me { background: rgba(30,136,229,0.08) !important; border-color: rgba(30,136,229,0.28) !important; }
.lb-rank { display:flex; align-items:center; justify-content:center; font-size:0.95rem; }
.lb-num  { font-size:0.62rem; font-weight:700; color:rgba(255,255,255,0.3); font-family:monospace; }
.lb-av   { width:22px; height:22px; border-radius:50%; background:rgba(255,255,255,0.09); display:flex; align-items:center; justify-content:center; font-size:0.62rem; font-weight:700; color:rgba(255,255,255,0.5); flex-shrink:0; }
.lb-name { font-size:0.78rem; font-weight:600; color:rgba(255,255,255,0.82); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:flex; align-items:center; gap:4px; }
.you-tag { font-size:0.52rem; font-weight:700; color:#64b5f6; background:rgba(100,181,246,0.14); padding:1px 4px; border-radius:3px; flex-shrink:0; }
.lb-score { font-family:monospace; font-size:0.88rem; font-weight:800; color:#66bb6a; }
.lb-score.score-zero { color:rgba(255,255,255,0.2); }
.pct { font-size:0.55rem; opacity:0.5; }

.lo-col--mid .problem-card { flex: 0 0 auto; max-height: 55%; min-height: 200px; }
.lo-col--mid .results-panel { flex: 1; min-height: 0; }

.problem-title { font-size: 0.88rem; text-transform: none; letter-spacing: 0; color: rgba(255,255,255,0.82); font-weight: 700; }
.problem-body { padding: 14px 16px; overflow-y: auto; flex: 1; min-height: 0; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
.problem-body::-webkit-scrollbar { width: 3px; }
.problem-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.problem-description { font-size: 0.84rem; line-height: 1.7; color: rgba(255,255,255,0.78); }
.problem-description :deep(pre), .problem-description :deep(code) { background: rgba(0,0,0,0.3); border-radius: 5px; padding: 2px 6px; font-size: 0.8rem; }

.samples-section { margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 12px; }
.sample-label { display: flex; align-items: center; gap: 6px; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.08em; color: rgba(255,255,255,0.3); text-transform: uppercase; margin-bottom: 8px; }
.samples-list { display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto; padding-right: 4px; scrollbar-width: thin; }
.samples-list::-webkit-scrollbar { width: 4px; }
.samples-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
.sample-row { display: flex; gap: 8px; align-items: flex-start; }
.sample-row-num { width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 800; color: rgba(255,255,255,0.35); flex-shrink: 0; margin-top: 16px; }
.sample-row-io { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; flex: 1; }
.sample-io-block { display: flex; flex-direction: column; gap: 3px; }
.io-label { font-size: 0.6rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; }
.io-label--in  { color: #64b5f6; }
.io-label--out { color: #81c784; }
.io-value { background: rgba(0,0,0,0.28); border: 1px solid rgba(255,255,255,0.09); border-radius: 6px; padding: 6px 9px; font-family: monospace; font-size: 0.78rem; color: rgba(255,255,255,0.82); white-space: pre-wrap; word-break: break-all; min-height: 30px; }

.lo-col--right .editor-card { flex: 1; min-height: 0; }
.editor-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(0,0,0,0.22); flex-shrink: 0; }
.lang-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); font-size: 0.74rem; font-weight: 700; letter-spacing: 0.05em; color: rgba(255,255,255,0.65); text-transform: uppercase; user-select: none; }
.lang-dot { width: 6px; height: 6px; border-radius: 50%; background: #4caf50; box-shadow: 0 0 6px rgba(76,175,80,0.8); flex-shrink: 0; }
.toolbar-right { display: flex; align-items: center; gap: 10px; }
.input-hint-toggle { position: relative; color: rgba(255,255,255,0.3); cursor: pointer; display: flex; align-items: center; }
.input-hint-toggle:hover { color: rgba(255,255,255,0.6); }
.hint-popover { display: none; position: absolute; right: 0; top: calc(100% + 8px); background: #1c1c2e; border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 12px 14px; min-width: 260px; z-index: 100; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
.input-hint-toggle:hover .hint-popover { display: block; }
.hint-title { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 7px; }
.hint-popover code { display: block; font-family: monospace; font-size: 0.75rem; color: #81c784; background: rgba(0,0,0,0.3); padding: 6px 8px; border-radius: 5px; }
.hint-out { margin-top: 7px; font-size: 0.72rem; color: rgba(255,255,255,0.35); }
.submit-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; border: none; background: linear-gradient(135deg, #1e88e5, #1565c0); color: #fff; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.03em; cursor: pointer; box-shadow: 0 2px 10px rgba(30,136,229,0.4); transition: transform 0.12s, filter 0.12s, box-shadow 0.12s; }
.submit-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 4px 18px rgba(30,136,229,0.5); }
.submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }
.submit-btn--loading { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); box-shadow: none; }
.submit-spin { display: inline-block; animation: submit-spin 0.7s linear infinite; }
@keyframes submit-spin { to { transform: rotate(360deg); } }
.editor-wrap { flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
.editor-wrap :deep(.code-editor), .editor-wrap :deep(.cm-editor), .editor-wrap :deep(.CodeMirror), .editor-wrap > :deep(*) { height: 100% !important; flex: 1; }

.results-panel { flex: 1; min-height: 0; }
.verdict-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.04em; }
.vb-accepted { background: rgba(76,175,80,0.15); color: #81c784; border: 1px solid rgba(76,175,80,0.3); }
.vb-partial  { background: rgba(255,152,0,0.12); color: #ffb74d; border: 1px solid rgba(255,152,0,0.3); }
.vb-failed   { background: rgba(229,57,53,0.12); color: #ef9a9a; border: 1px solid rgba(229,57,53,0.3); }
.rp-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; flex: 1; padding: 24px; color: rgba(255,255,255,0.22); text-align: center; }
.rp-empty-icon { margin-bottom: 4px; }
.rp-empty p    { font-size: 0.84rem; font-weight: 600; margin: 0; }
.rp-empty small{ font-size: 0.72rem; }
.rp-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; flex: 1; padding: 24px; color: rgba(255,255,255,0.4); font-size: 0.8rem; }
.rp-spinner { width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1); border-top-color: #1e88e5; animation: rp-spin 0.8s linear infinite; }
@keyframes rp-spin { to { transform: rotate(360deg); } }
.rp-content { display: flex; flex-direction: column; gap: 12px; padding: 14px; flex: 1; min-height: 0; overflow-y: auto; }
.rp-score-row { display: flex; gap: 10px; }
.rp-stat { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 12px 8px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); }
.rp-stat-val { font-family: monospace; font-size: 1.3rem; font-weight: 800; line-height: 1; }
.rp-pct { font-size: 0.7rem; opacity: 0.5; }
.rp-stat-label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.3); }
.val-perfect { color: #00e5ff; text-shadow: 0 0 10px rgba(0,229,255,0.3); }
.val-partial  { color: #ffb74d; }
.val-zero     { color: rgba(255,255,255,0.25); }
.val-neutral  { color: rgba(255,255,255,0.75); }
.rp-tc-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.rp-tc-chip { display: flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 7px; border: 1px solid transparent; font-size: 0.74rem; font-weight: 700; cursor: default; transition: transform 0.1s; }
.rp-tc-chip:hover { transform: scale(1.05); }
.chip-pass { background: rgba(76,175,80,0.12); border-color: rgba(76,175,80,0.3); color: #81c784; }
.chip-fail { background: rgba(229,57,53,0.1);  border-color: rgba(229,57,53,0.25); color: #ef9a9a; }
.chip-icon { font-weight: 900; }
.chip-num  { font-family: monospace; opacity: 0.7; }
.rp-error-box { background: rgba(229,57,53,0.07); border: 1px solid rgba(229,57,53,0.2); border-radius: 8px; padding: 10px 12px; flex-shrink: 0; }
.rp-error-label { display: flex; align-items: center; gap: 5px; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #ef9a9a; margin-bottom: 6px; }
.rp-error-pre { font-family: monospace; font-size: 0.74rem; color: rgba(255,150,150,0.8); margin: 0; white-space: pre-wrap; word-break: break-all; max-height: 80px; overflow-y: auto; }

.activity-card { flex-shrink: 0; height: 240px; }
.activity-body { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; padding: 10px; gap: 6px; }
.live-dot-badge { display: flex; align-items: center; gap: 5px; color: #ef5350 !important; background: rgba(239,83,80,0.1) !important; border: 1px solid rgba(239,83,80,0.25) !important; }
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: #ef5350; animation: lbpulse 1.2s ease-in-out infinite; flex-shrink: 0; }
.activity-empty { display: flex; align-items: center; justify-content: center; flex: 1; font-size: 0.76rem; color: rgba(255,255,255,0.2); }
.activity-list { display: flex; flex-direction: column; gap: 5px; flex: 1; overflow-y: auto; }
.activity-item { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.025); transition: all 0.2s ease; }
.act-perfect { border-color: rgba(0,229,255,0.15); background: rgba(0,229,255,0.04); }
.act-partial  { border-color: rgba(255,152,0,0.15); background: rgba(255,152,0,0.04); }
.act-avatar { width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; color: rgba(255,255,255,0.6); flex-shrink: 0; }
.act-info { flex: 1; min-width: 0; display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.act-name { font-size: 0.78rem; font-weight: 700; color: rgba(255,255,255,0.82); white-space: nowrap; }
.act-desc { font-size: 0.72rem; color: rgba(255,255,255,0.4); white-space: nowrap; }
.act-score { font-family: monospace; font-size: 0.85rem; font-weight: 800; flex-shrink: 0; }
.as-perfect { color: #00e5ff; }
.as-partial  { color: #ffb74d; }
.as-zero     { color: rgba(255,255,255,0.25); }
.act-fade-enter-active { transition: all 0.3s ease; }
.act-fade-enter-from   { opacity: 0; transform: translateY(-8px); }
.act-fade-move         { transition: transform 0.3s ease; }
.hint-strip { margin-top: auto; padding: 8px 10px; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
.hint-strip-title { display: flex; align-items: center; gap: 5px; font-size: 0.6rem; font-weight: 800; letter-spacing: 0.06em; color: rgba(255,255,255,0.25); text-transform: uppercase; margin-bottom: 5px; }
.hint-code { display: block; font-family: monospace; font-size: 0.72rem; color: #81c784; background: rgba(0,0,0,0.25); padding: 4px 8px; border-radius: 5px; word-break: break-all; }
.hint-note { font-size: 0.65rem; color: rgba(255,255,255,0.22); margin-top: 4px; }

.rp-countdown-banner { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: linear-gradient(135deg, rgba(30,136,229,0.18), rgba(21,101,192,0.12)); border-bottom: 1px solid rgba(30,136,229,0.3); flex-shrink: 0; }
.rp-countdown-num { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #1e88e5, #1565c0); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; color: #fff; font-family: monospace; flex-shrink: 0; box-shadow: 0 0 14px rgba(30,136,229,0.5); animation: num-pulse 1s ease-in-out infinite; }
@keyframes num-pulse { 0%,100%{transform:scale(1);box-shadow:0 0 14px rgba(30,136,229,0.5);}50%{transform:scale(1.08);box-shadow:0 0 22px rgba(30,136,229,0.8);} }
.rp-countdown-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.rp-countdown-text strong { font-size: 0.82rem; font-weight: 700; color: #fff; }
.rp-countdown-text span { font-size: 0.68rem; color: rgba(255,255,255,0.45); }
.rp-go-now-btn { padding: 6px 14px; border-radius: 7px; border: 1px solid rgba(30,136,229,0.4); background: rgba(30,136,229,0.3); color: #90caf9; font-size: 0.76rem; font-weight: 700; cursor: pointer; flex-shrink: 0; transition: background 0.15s, color 0.15s; }
.rp-go-now-btn:hover { background: #1e88e5; color: #fff; }

/* ══ ANTI-CHEAT UI ══ */
.dq-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.92); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
.dq-card { background: #12151c; border: 1px solid rgba(239,68,68,0.3); border-radius: 16px; padding: 40px 48px; max-width: 420px; width: 90%; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 14px; box-shadow: 0 0 60px rgba(239,68,68,0.15); }
.dq-icon { font-size: 48px; }
.dq-title { font-size: 1.5rem; font-weight: 900; color: #f87171; margin: 0; letter-spacing: 0.02em; }
.dq-reason { font-size: 0.9rem; color: rgba(255,255,255,0.7); margin: 0; line-height: 1.5; }
.dq-sub    { font-size: 0.78rem; color: rgba(255,255,255,0.35); margin: 0; }
.dq-btn { margin-top: 8px; padding: 10px 28px; border-radius: 8px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.35); color: #f87171; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: background 0.15s; }
.dq-btn:hover { background: rgba(239,68,68,0.3); }
.cheat-toast { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 9998; background: #1a1200; border: 1px solid rgba(245,158,11,0.5); border-radius: 10px; padding: 12px 18px; display: flex; align-items: center; gap: 10px; max-width: 520px; width: 90%; box-shadow: 0 4px 24px rgba(0,0,0,0.5); }
.cheat-toast-icon { font-size: 1.1rem; flex-shrink: 0; }
.cheat-toast-msg  { flex: 1; font-size: 0.82rem; font-weight: 600; color: #fbbf24; line-height: 1.4; }
.cheat-toast-close { background: none; border: none; color: rgba(255,255,255,0.3); font-size: 0.9rem; cursor: pointer; padding: 2px 4px; flex-shrink: 0; }
.cheat-toast-close:hover { color: rgba(255,255,255,0.7); }
.toast-slide-enter-active { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.toast-slide-leave-active  { transition: all 0.2s ease-in; }
.toast-slide-enter-from    { opacity: 0; transform: translateX(-50%) translateY(-16px); }
.toast-slide-leave-to      { opacity: 0; transform: translateX(-50%) translateY(-16px); }
</style>
