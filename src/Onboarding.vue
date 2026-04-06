<script setup>
// ── All imports MUST be at the top in ES modules ──────────────────────────────
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getSocket } from './js/socket.js';

// ── Component imports ─────────────────────────────────────────────────────────
import Window from './components/window.vue';
import ButtonImage from './components/button-img.vue';
import ButtonText from './components/button-text.vue';
import PlayerMatchLabel from './components/player-match-label.vue';
import TestCaseCarousel from './components/testcase-carousel.vue';
import TestCaseCard from './components/testcase-card.vue';
import TestcaseIO from './components/testcase-io.vue';
import DropdownArray from './components/dropdown-array.vue';
import CodeEditor from './components/codeeditor.vue';
import OnboardingTimer from './components/onboarding-timer.vue';

// ── Runtime init (after all imports) ─────────────────────────────────────────
const socket = getSocket();

if (!socket) {
  console.error('[Onboarding] No socket available - no token found');
  if (!localStorage.getItem('jwt_token')) {
    window.location.href = '/signin.html';
  } else {
    console.error('[Onboarding] Token exists but socket creation failed');
    alert('Connection error. Please refresh the page.');
  }
}

const selectedLanguage = ref("Python");
const userCode = ref("");
const showResults = ref(false);
const judgeResult = ref(null);
const problem = ref({ title: "", description: "", testcases: [] });

const collectedResults = ref({ player1: null, player2: null });
let finalizeTimer = null;

// ✅ DUPLICATE SUBMISSION PREVENTION
const isSubmitting = ref(false);
let hasSubmitted = false;
let matchEnded = false;

// ── Result overlay (shown for 3s before redirecting) ──────────────────────────
const showResultOverlay = ref(false);
const overlayResult = ref(null);   // { verdict, passed, total, score, isWin, isDraw }
const overlayCountdown = ref(3);
let overlayTimer = null;

// ── Anti-cheat ───────────────────────────────────────────────────────────────
const violations     = ref(0)
const MAX_VIOLATIONS = 3
const showWarning    = ref(false)
const warningMessage = ref('')
let   antiCheatActive = false

function hydrateUser() {
  if (window.user) return window.user;
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) { window.user = JSON.parse(storedUser); return window.user; }
  } catch (e) { console.warn('Could not parse stored user:', e); }
  return null;
}

function getPlayerNumber() {
  const playerNum = Number(localStorage.getItem('playerNumber'));
  if (playerNum === 1 || playerNum === 2) return playerNum;
  return null;
}

function getUserId() {
  if (socket?.user?.id) return socket.user.id;
  if (socket?.user?.user_id) return socket.user.user_id;
  const u = window.user || hydrateUser();
  if (u?.id) return u.id;
  if (u?.user_id) return u.user_id;
  if (u?.user?.id) return u.user.id;
  if (u?.user?.user_id) return u.user.user_id;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      if (userObj?.user_id) return userObj.user_id;
      if (userObj?.id) return userObj.id;
    }
  } catch (e) { console.error('[getUserId] Failed to parse user from localStorage:', e); }
  console.warn('[getUserId] Could not find user ID - server will use socket.user as fallback');
  return null;
}

function getPlayerId() { return getPlayerNumber() || getUserId(); }

function getMatchId() {
  const candidates = [
    localStorage.getItem('currentMatchId'),
    localStorage.getItem('match_id'),
    localStorage.getItem('latestMatchId'),
  ];
  for (const c of candidates) {
    if (!c || c === 'undefined' || c === 'null') continue;
    const n = Number(c);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return null;
}

// -------------------------
// Anti-cheat violation handler
// -------------------------
function recordViolation(reason) {
  if (hasSubmitted || matchEnded) return
  violations.value++
  warningMessage.value = reason
  showWarning.value = true

  const matchId = getMatchId()
  if (socket && matchId) {
    socket.emit('anticheat_violation', { match_id: matchId, reason, count: violations.value })
  }

  setTimeout(() => { showWarning.value = false }, 3500)

  if (violations.value >= MAX_VIOLATIONS) {
    antiCheatActive = false
    warningMessage.value = `🚫 Too many violations (${MAX_VIOLATIONS}). Auto-submitting your code now.`
    showWarning.value = true
    setTimeout(() => { submitCode() }, 2500)
  }
}

// -------------------------
// On Mounted
// -------------------------
onMounted(() => {
  console.log('===== ONBOARDING PAGE LOADED =====');
  hydrateUser();

  const matchId = getMatchId();
  const playerNumber = getPlayerNumber();
  const mode = localStorage.getItem('mode') || 'casual';

  if (!matchId || !playerNumber) {
    console.warn('[ONBOARDING] Missing match ID or player number at mount time');
  }

  if (socket && matchId) {
    const notifyServer = () => {
      if (socket.connected) {
        socket.emit('onboarding_page_loaded', { match_id: matchId, mode });
      } else {
        socket.once('connect', () => {
          setTimeout(() => { socket.emit('onboarding_page_loaded', { match_id: matchId, mode }); }, 200);
        });
      }
    };
    notifyServer();
  }

  socket.on('onboarding_access_denied', (data) => {
    let message = 'You cannot access this match.';
    if (data.reason === 'grace_expired') message = 'Your grace period has expired.';
    else if (data.reason === 'already_abandoned') message = 'You have already abandoned this match.';
    else if (data.reason === 'not_authenticated') message = 'Please sign in to continue.';
    else if (data.message) message = data.message;
    alert(message);
    window.location.href = data.redirectTo || '/duel.html';
  });

  socket.on('onboarding_access_granted', (data) => {
    console.log('[ONBOARDING] ✅ Access granted for match', data.matchId);
    if (data.graceRemaining && data.graceRemaining > 0) {
      const banner = document.createElement('div');
      banner.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);background:#ff9800;color:white;padding:12px 24px;border-radius:6px;z-index:9999;font-weight:bold;box-shadow:0 4px 6px rgba(0,0,0,0.3);';
      banner.textContent = `⚠️ You have ${data.graceRemaining}s remaining to complete this match!`;
      document.body.appendChild(banner);
      setTimeout(() => banner.remove(), 5000);
    }
  });

  window.addEventListener("onboarding-data", (e) => {
    problem.value = e.detail;
    console.log("📥 Loaded onboarding problem:", problem.value);
  });

  // ── Navigation prevention ────────────────────────────────────────────────
  const handleBeforeUnload = (e) => {
    if (!hasSubmitted && !matchEnded) {
      e.preventDefault();
      e.returnValue = 'You are in an active match. Leaving will count as abandonment.';
      return e.returnValue;
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);

  const handlePopState = (e) => {
    if (!hasSubmitted && !matchEnded) {
      const shouldLeave = confirm('You are in an active match. Going back will count as abandonment. Are you sure?');
      if (!shouldLeave) window.history.pushState(null, '', window.location.href);
    }
  };
  window.history.pushState(null, '', window.location.href);
  window.addEventListener('popstate', handlePopState);

  // ── Anti-cheat event listeners ───────────────────────────────────────────
  antiCheatActive = true

  const handleVisibilityChange = () => {
    if (!antiCheatActive || hasSubmitted || matchEnded) return
    if (document.hidden) recordViolation('⚠️ Tab switching is not allowed during a match!')
  }

  const handleWindowBlur = () => {
    if (!antiCheatActive || hasSubmitted || matchEnded) return
    recordViolation('⚠️ Window focus lost! Stay on this tab during the match.')
  }

  const handlePaste = (e) => {
    if (!antiCheatActive || hasSubmitted || matchEnded) return
    e.preventDefault()
    recordViolation('⚠️ Pasting code is not allowed during a match!')
  }

  const handleContextMenu = (e) => {
    if (!antiCheatActive || hasSubmitted || matchEnded) return
    e.preventDefault()
  }

  const handleKeyDown = (e) => {
    if (!antiCheatActive || hasSubmitted || matchEnded) return
    const blocked = (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I','J','C','K'].includes(e.key.toUpperCase())) ||
      (e.ctrlKey && ['U','S'].includes(e.key.toUpperCase()))
    )
    if (blocked) {
      e.preventDefault()
      recordViolation('⚠️ Developer tools are not allowed during a match!')
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('blur', handleWindowBlur)
  document.addEventListener('paste', handlePaste)
  document.addEventListener('contextmenu', handleContextMenu)
  document.addEventListener('keydown', handleKeyDown)

  onBeforeUnmount(() => {
    antiCheatActive = false
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('popstate', handlePopState);
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('blur', handleWindowBlur)
    document.removeEventListener('paste', handlePaste)
    document.removeEventListener('contextmenu', handleContextMenu)
    document.removeEventListener('keydown', handleKeyDown)
    socket.off('onboarding_access_denied');
    socket.off('onboarding_access_granted');
  });
});

// -------------------------
// Submit Code
// -------------------------
function submitCode() {
  if (hasSubmitted) { console.warn('[SUBMIT] Already submitted'); return; }
  if (isSubmitting.value) { console.warn('[SUBMIT] Submission in progress'); return; }
  isSubmitting.value = true;
  if (!socket) { alert('Connection error. Please refresh.'); isSubmitting.value = false; return; }
  if (!socket.connected) { alert('Not connected. Please wait or refresh.'); isSubmitting.value = false; return; }
  hydrateUser();
  const matchId = getMatchId();
  const playerNumber = getPlayerNumber();
  let userId = getUserId();
  if (!userId && socket?.user) userId = socket.user.id || socket.user.user_id;
  if (!playerNumber) { alert("Cannot submit: missing player position. Please requeue."); isSubmitting.value = false; return; }
  hasSubmitted = true;
  antiCheatActive = false
  const elapsedSeconds = (typeof window.getOnboardingElapsedTime === 'function') ? window.getOnboardingElapsedTime() : 0;
  const mode = localStorage.getItem('mode') || 'casual';
  if (socket && matchId) {
    socket.emit('onboarding_code_submitted', { match_id: matchId });
  }
  socket.emit("submit_code", {
    problem_id: problem.value.id || 0,
    match_id: matchId,
    player_id: playerNumber,
    user_id: userId,
    language: selectedLanguage.value.toLowerCase(),
    source_code: userCode.value,
    submission_duration: elapsedSeconds,
    mode: mode
  });
  console.log('[SUBMIT] Code submitted, waiting for judge_result...');
}

let timerAutoSubmitCalled = false;
window.addEventListener("time-up", () => {
  if (timerAutoSubmitCalled || hasSubmitted) return;
  timerAutoSubmitCalled = true;
  console.log("Timer finished → AUTO SUBMIT");
  submitCode();
});

function redirectToResult() {
  window.location.href = 'result.html';
}

function showOverlayThenRedirect(verdict, passed, total, score) {
  const playerNum = getPlayerNumber();
  overlayResult.value = { verdict, passed, total, score };
  overlayCountdown.value = 3;
  showResultOverlay.value = true;
  overlayTimer = setInterval(() => {
    overlayCountdown.value--;
    if (overlayCountdown.value <= 0) {
      clearInterval(overlayTimer);
      redirectToResult();
    }
  }, 1000);
}

socket.on("judge_result", (data) => {
  console.log("RECEIVED judge_result:", data);
  matchEnded = true;
  if (!data || data.success === false) { alert(`Error: ${data?.message || "Execution failed"}`); return; }
  judgeResult.value = data;
  isSubmitting.value = false;
  const modeFromStorage = localStorage.getItem('mode');
  const mode = modeFromStorage || 'casual';
  const matchId = getMatchId();
  const normalized = {
    username: data.username || `Player${data.player_id || ''}`,
    completion: Math.round((data.passed / (data.total || 1)) * 100),
    passed: data.passed, total: data.total,
    duration: data.duration || '00:00',
    language: data.language || '',
    verdict: data.verdict || '',
    matchId, playerId: data.player_id
  };
  if (data.player_id === 1) collectedResults.value.player1 = normalized;
  else if (data.player_id === 2) collectedResults.value.player2 = normalized;
  else if (!collectedResults.value.player1) collectedResults.value.player1 = normalized;
  else collectedResults.value.player2 = normalized;

  if (collectedResults.value.player1 && collectedResults.value.player2) {
    localStorage.setItem('latestMatchResult', JSON.stringify({ mode, player1: collectedResults.value.player1, player2: collectedResults.value.player2, waitingForOpponent: false }));
    showOverlayThenRedirect(data.verdict, data.passed, data.total, data.score ?? Math.round((data.passed / (data.total || 1)) * 100));
    return;
  }
  const opponentStub = { username: 'Waiting for opponent', completion: 0, passed: 0, total: normalized.total, duration: '00:00', language: '', verdict: 'Pending...', matchId, playerId: (data.player_id === 1) ? 2 : 1 };
  const resultToStore = { mode, player1: (data.player_id === 1) ? normalized : opponentStub, player2: (data.player_id === 2) ? normalized : opponentStub, waitingForOpponent: true };
  localStorage.setItem('latestMatchResult', JSON.stringify(resultToStore));
  showOverlayThenRedirect(data.verdict, data.passed, data.total, data.score ?? Math.round((data.passed / (data.total || 1)) * 100));
});

socket.on("match_finished", (data) => {
  console.log("RECEIVED match_finished:", data);
  matchEnded = true;
  if (finalizeTimer) { clearTimeout(finalizeTimer); finalizeTimer = null; }
  const mode = data.mode || localStorage.getItem('mode') || 'casual';
  const matchId = getMatchId();
  const p1 = { username: data.player1.username, completion: Math.round((data.player1.passed / (data.player1.total || 1)) * 100), passed: data.player1.passed, total: data.player1.total, duration: data.player1.duration || '00:00', language: data.player1.language || '', verdict: data.player1.verdict || '', matchId, playerId: data.player1.player_id };
  const p2 = { username: data.player2.username, completion: Math.round((data.player2.passed / (data.player2.total || 1)) * 100), passed: data.player2.passed, total: data.player2.total, duration: data.player2.duration || '00:00', language: data.player2.language || '', verdict: data.player2.verdict || '', matchId, playerId: data.player2.player_id };
  localStorage.setItem('latestMatchResult', JSON.stringify({ mode, player1: p1, player2: p2, waitingForOpponent: false }));
  // Determine verdict from match_finished data
  const playerNum = getPlayerNumber();
  const myData = playerNum === 1 ? data.player1 : data.player2;
  showOverlayThenRedirect(myData?.verdict || '', myData?.passed || 0, myData?.total || 0, Math.round(((myData?.passed || 0) / (myData?.total || 1)) * 100));
});
</script>

<template>

  <!-- ══ LEFT ══ -->
  <section class="lo-col lo-col--left">

    <div class="lo-card info-card">
      <div class="info-header">
        <div class="info-icon">⚔️</div>
        <div class="info-body">
          <div class="info-label">DUEL MATCH</div>
          <div class="info-id">1 v 1</div>
        </div>
      </div>
      <div class="info-timer-row">
        <OnboardingTimer/>
      </div>
    </div>

    <div class="lo-card ob-vs-card">
      <div class="lo-card-header">
        <span class="lo-card-title">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Players
        </span>
      </div>
      <div class="ob-vs-body">
        <div class="ob-vs-row">
          <div class="ob-vs-player">
            <div class="ob-vs-avatar"><img src="/asset/general/profile-user.png" alt="You" /></div>
            <span class="ob-vs-name">You</span>
          </div>
          <div class="ob-vs-badge">VS</div>
          <div class="ob-vs-player">
            <div class="ob-vs-avatar"><img src="/asset/general/profile-user.png" alt="Opponent" /></div>
            <span class="ob-vs-name">Opponent</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Live results -->
    <div class="lo-card ob-results-card">
      <div class="lo-card-header">
        <span class="lo-card-title">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Results
        </span>
        <span v-if="judgeResult"
          :class="['verdict-badge', judgeResult.verdict === 'Accepted' ? 'vb-accepted' : judgeResult.passed > 0 ? 'vb-partial' : 'vb-failed']">
          {{ judgeResult.verdict === 'Accepted' ? '✓ AC' : judgeResult.passed > 0 ? '~ Partial' : '✗ WA' }}
        </span>
      </div>
      <div v-if="!judgeResult && !isSubmitting" class="rp-empty">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        <p>No submission yet</p>
        <small>Results appear after submit</small>
      </div>
      <div v-else-if="isSubmitting" class="rp-loading">
        <div class="rp-spinner"></div>
        <span>Judging…</span>
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
            <div class="rp-stat-label">Tests</div>
          </div>
        </div>
        <div v-if="judgeResult.results?.length" class="rp-tc-grid">
          <div v-for="(r, idx) in judgeResult.results" :key="idx"
            :class="['rp-tc-chip', r.status === 'Accepted' ? 'chip-pass' : 'chip-fail']" :title="r.status">
            <span class="chip-icon">{{ r.status === 'Accepted' ? '✓' : '✗' }}</span>
            <span class="chip-num">{{ idx + 1 }}</span>
          </div>
        </div>
        <div v-if="judgeResult.stderr || judgeResult.error" class="rp-error-box">
          <div class="rp-error-label">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Error
          </div>
          <pre class="rp-error-pre">{{ judgeResult.stderr || judgeResult.error }}</pre>
        </div>
      </div>
    </div>

  </section>

  <!-- ══ MIDDLE: Problem ══ -->
  <section class="lo-col lo-col--mid">
    <div class="lo-card problem-card">
      <div class="lo-card-header">
        <span class="lo-card-title problem-title">{{ problem.title || 'Loading problem…' }}</span>
      </div>

      <div class="problem-body">
        <div class="problem-description" v-html="problem.description || '<p>Loading…</p>'"></div>

        <div v-if="problem.testcases.filter(t => t.is_sample).length > 0" class="samples-section">
          <div class="sample-label">
            SAMPLE CASES
            <span class="lo-badge" style="margin-left:6px;">{{ problem.testcases.filter(t => t.is_sample).length }}</span>
          </div>
          <div class="samples-list">
            <div v-for="(tc, idx) in problem.testcases.filter(t => t.is_sample)" :key="tc.id || idx" class="sample-row">
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
  </section>

  <!-- ══ RIGHT: Code Editor ══ -->
  <section class="lo-col lo-col--right">
    <div class="lo-card editor-card">
      <div class="editor-toolbar">
        <div class="lang-badge"><span class="lang-dot"></span>{{ selectedLanguage }}</div>
        <div class="toolbar-right">
          <div class="input-hint-toggle" title="Input format hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div class="hint-popover">
              <div class="hint-title">Input Format</div>
              <code v-if="selectedLanguage === 'Python'">import sys; data = sys.stdin.read().strip()</code>
              <code v-else-if="selectedLanguage === 'Java'">Scanner sc = new Scanner(System.in);</code>
              <code v-else-if="selectedLanguage === 'PHP'">$input = trim(fgets(STDIN));</code>
              <div class="hint-out">Output: print to stdout (one line)</div>
            </div>
          </div>
          <DropdownArray id="languageSelect" :options="['Python', 'Java', 'PHP']" v-model="selectedLanguage" />
          <button
            :class="['submit-btn', { 'submit-btn--loading': isSubmitting, 'submit-btn--done': hasSubmitted }]"
            :disabled="isSubmitting || hasSubmitted" @click="submitCode">
            <svg v-if="!isSubmitting && !hasSubmitted" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <svg v-if="hasSubmitted" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span v-if="isSubmitting" class="submit-spin">⟳</span>
            {{ isSubmitting ? 'Judging…' : hasSubmitted ? 'Submitted ✓' : 'Submit' }}
          </button>
        </div>
      </div>
      <div class="editor-wrap">
        <CodeEditor ariaLabel="Code editor for writing solution" v-model="userCode" />
      </div>
    </div>

    <div class="lo-card hint-strip-card">
      <div class="hint-strip">
        <div class="hint-strip-title">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Input hint — {{ selectedLanguage }}
        </div>
        <code class="hint-code" v-if="selectedLanguage === 'Python'">import sys; data = sys.stdin.read().strip()</code>
        <code class="hint-code" v-else-if="selectedLanguage === 'Java'">Scanner sc = new Scanner(System.in); String line = sc.nextLine();</code>
        <code class="hint-code" v-else-if="selectedLanguage === 'PHP'">$input = trim(fgets(STDIN)); $data = json_decode($input);</code>
        <div class="hint-note">Output: print to stdout (one line)</div>
      </div>
    </div>
  </section>

  <!-- ══ Anti-cheat warning toast ══ -->
  <teleport to="body">
    <transition name="ac-warn">
      <div v-if="showWarning" class="ac-warning-toast">
        <div class="ac-warn-icon">⚠️</div>
        <div class="ac-warn-body">
          <div class="ac-warn-title">Fair Play Warning</div>
          <div class="ac-warn-msg">{{ warningMessage }}</div>
          <div class="ac-warn-count">Violations: {{ violations }} / {{ MAX_VIOLATIONS }}</div>
        </div>
      </div>
    </transition>
  </teleport>

  <!-- ══ Result overlay — shown for 3s before redirecting ══ -->
  <teleport to="body">
    <transition name="result-overlay-fade">
      <div v-if="showResultOverlay && overlayResult" class="result-overlay">
        <!-- Animated background rings -->
        <div class="ro-ring ro-ring--1"></div>
        <div class="ro-ring ro-ring--2"></div>
        <div class="ro-ring ro-ring--3"></div>

        <div class="ro-card">
          <!-- Verdict icon -->
          <div :class="['ro-icon', overlayResult.verdict === 'Accepted' ? 'ro-icon--win' : overlayResult.passed > 0 ? 'ro-icon--partial' : 'ro-icon--loss']">
            <span v-if="overlayResult.verdict === 'Accepted'">🏆</span>
            <span v-else-if="overlayResult.passed > 0">⚡</span>
            <span v-else>💀</span>
          </div>

          <!-- Verdict label -->
          <div :class="['ro-verdict', overlayResult.verdict === 'Accepted' ? 'ro-verdict--win' : overlayResult.passed > 0 ? 'ro-verdict--partial' : 'ro-verdict--loss']">
            {{ overlayResult.verdict === 'Accepted' ? 'Accepted!' : overlayResult.passed > 0 ? 'Partial' : 'Wrong Answer' }}
          </div>

          <!-- Score display -->
          <div class="ro-score-row">
            <div class="ro-score-block">
              <div :class="['ro-score-val', overlayResult.score === 100 ? 'sv--perfect' : overlayResult.score > 0 ? 'sv--partial' : 'sv--zero']">
                {{ overlayResult.score }}<span class="ro-pct">%</span>
              </div>
              <div class="ro-score-label">Score</div>
            </div>
            <div class="ro-score-divider"></div>
            <div class="ro-score-block">
              <div class="ro-score-val sv--neutral">{{ overlayResult.passed }}<span class="ro-pct">/{{ overlayResult.total }}</span></div>
              <div class="ro-score-label">Tests Passed</div>
            </div>
          </div>

          <!-- Test case chips -->
          <div v-if="judgeResult?.results?.length" class="ro-chips">
            <div v-for="(r, i) in judgeResult.results" :key="i"
              :class="['ro-chip', r.status === 'Accepted' ? 'ro-chip--pass' : 'ro-chip--fail']">
              {{ r.status === 'Accepted' ? '✓' : '✗' }} {{ i + 1 }}
            </div>
          </div>

          <!-- Redirect countdown -->
          <div class="ro-footer">
            <div class="ro-countdown-ring">
              <svg viewBox="0 0 36 36" class="ro-countdown-svg">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3"/>
                <circle cx="18" cy="18" r="15" fill="none"
                  stroke="rgba(255,255,255,0.55)" stroke-width="3"
                  stroke-dasharray="94.25"
                  :stroke-dashoffset="94.25 - (94.25 * overlayCountdown / 3)"
                  stroke-linecap="round"
                  transform="rotate(-90 18 18)"
                  style="transition: stroke-dashoffset 1s linear"/>
                <text x="18" y="22" text-anchor="middle" fill="white" font-size="11" font-weight="800">{{ overlayCountdown }}</text>
              </svg>
            </div>
            <span class="ro-footer-text">Redirecting to results…</span>
          </div>
        </div>
      </div>
    </transition>
  </teleport>

</template>

<style scoped>
/* ══════════════════════════════════════════════
   LAYOUT — fluid 3-column
══════════════════════════════════════════════ */

/* :global ensures these layout rules pierce the scoped boundary
   in case the parent page applies its own flex constraints */
:global(.lo-col--left) {
  flex: 0 0 280px !important;
  min-width: 280px !important;
  max-width: 280px !important;
}

.lo-col {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 0.7vw, 12px);
  min-width: 0;
  align-self: stretch;
}

/* Left sidebar — fixed width that cannot be shrunk by a parent flex container.
   Using both min-width AND flex-basis so even a constrained parent can't squash it. */
.lo-col--left {
  flex: 0 0 280px;   /* flex-grow:0, flex-shrink:0, flex-basis:280px */
  min-width: 280px;  /* belt-and-suspenders */
  max-width: 280px;
}

/* Middle — takes all remaining space */
.lo-col--mid {
  flex: 1 1 0;
  min-width: 0;
}

/* Right editor column */
.lo-col--right {
  flex: 0 0 clamp(320px, 38vw, 620px);
  min-width: 320px;
  max-width: 620px;
  overflow: visible;
}

/* ── Card base ── */
.lo-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: clamp(10px, 1vw, 14px);
  overflow: clip;
  display: flex;
  flex-direction: column;
}

.lo-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(8px, 0.75vw, 13px) clamp(12px, 1.1vw, 18px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(0,0,0,0.2);
  flex-shrink: 0;
  overflow: visible;
}

.lo-card-title {
  font-size: clamp(0.64rem, 0.72vw, 0.82rem);
  font-weight: 700;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
  white-space: nowrap;      /* stop "LAST SUBMISSION" wrapping */
  overflow: hidden;
  text-overflow: ellipsis;
}

.lo-badge {
  padding: 1px 7px;
  border-radius: 8px;
  font-size: clamp(0.55rem, 0.6vw, 0.68rem);
  font-weight: 700;
  font-family: monospace;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.35);
}

/* ── Info card ── */
.info-card { flex-shrink: 0; overflow: visible; }
.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
}
.info-icon { font-size: 1.1rem; line-height: 1; flex-shrink: 0; }
.info-body { flex: 1; min-width: 0; overflow: hidden; }
.info-label {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.28);
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.info-id {
  font-size: 0.9rem;
  font-weight: 800;
  color: rgba(255,255,255,0.88);
  font-family: monospace;
  white-space: nowrap;
}
/* Timer in its own row — full width with room for the progress bar */
.info-timer-row {
  padding: 8px 12px 10px;
  border-top: 1px solid rgba(255,255,255,0.07);
  width: 100%;
  box-sizing: border-box;
}

/* ── VS card ── */
.ob-vs-card { flex-shrink: 0; }
.ob-vs-body { padding: clamp(8px, 0.8vw, 14px) clamp(10px, 1vw, 16px); }
.ob-vs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(6px, 0.6vw, 12px);
}
.ob-vs-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(4px, 0.4vw, 7px);
  flex: 1;
  min-width: 0;
}
.ob-vs-avatar {
  width: clamp(36px, 3.5vw, 52px);
  height: clamp(36px, 3.5vw, 52px);
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.07);
  flex-shrink: 0;
}
.ob-vs-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ob-vs-name {
  font-size: clamp(0.65rem, 0.72vw, 0.82rem);
  font-weight: 700;
  color: rgba(255,255,255,0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.ob-vs-badge {
  font-size: clamp(0.56rem, 0.6vw, 0.72rem);
  font-weight: 900;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 3px 8px;
  flex-shrink: 0;
}

/* ── Results card ── */
.ob-results-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.verdict-badge {
  padding: 2px 8px;
  border-radius: 20px;
  font-size: clamp(0.56rem, 0.62vw, 0.7rem);
  font-weight: 800;
  flex-shrink: 0;
  white-space: nowrap;
}
.vb-accepted { background: rgba(76,175,80,0.15); color: #81c784; border: 1px solid rgba(76,175,80,0.3); }
.vb-partial  { background: rgba(255,152,0,0.12);  color: #ffb74d; border: 1px solid rgba(255,152,0,0.3); }
.vb-failed   { background: rgba(229,57,53,0.12);  color: #ef9a9a; border: 1px solid rgba(229,57,53,0.3); }

.rp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  padding: clamp(16px, 2vw, 28px);
  color: rgba(255,255,255,0.18);
  text-align: center;
}
.rp-empty p     { font-size: clamp(0.72rem, 0.78vw, 0.88rem); font-weight: 600; margin: 0; }
.rp-empty small { font-size: clamp(0.62rem, 0.66vw, 0.76rem); }

.rp-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  padding: 16px;
  color: rgba(255,255,255,0.38);
  font-size: clamp(0.7rem, 0.76vw, 0.86rem);
}
.rp-spinner {
  width: clamp(20px, 2.2vw, 28px);
  height: clamp(20px, 2.2vw, 28px);
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.08);
  border-top-color: #1e88e5;
  animation: rp-spin 0.8s linear infinite;
}
@keyframes rp-spin { to { transform: rotate(360deg); } }

.rp-content {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 0.7vw, 10px);
  padding: clamp(10px, 1vw, 16px);
  flex: 1;
  overflow-y: auto;
}
.rp-score-row { display: flex; gap: clamp(6px, 0.6vw, 9px); }
.rp-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: clamp(8px, 0.8vw, 13px) 4px;
  border-radius: 9px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
}
.rp-stat-val {
  font-family: monospace;
  font-size: clamp(1rem, 1.2vw, 1.4rem);
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}
.rp-pct { font-size: clamp(0.56rem, 0.62vw, 0.7rem); opacity: 0.5; }
.rp-stat-label {
  font-size: clamp(0.54rem, 0.58vw, 0.66rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.24);
}
.val-perfect { color: #00e5ff; }
.val-partial  { color: #ffb74d; }
.val-zero     { color: rgba(255,255,255,0.22); }
.val-neutral  { color: rgba(255,255,255,0.75); }

.rp-tc-grid { display: flex; flex-wrap: wrap; gap: clamp(3px, 0.35vw, 5px); }
.rp-tc-chip {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: clamp(2px, 0.3vw, 5px) clamp(6px, 0.65vw, 9px);
  border-radius: 5px;
  border: 1px solid transparent;
  font-size: clamp(0.63rem, 0.7vw, 0.8rem);
  font-weight: 700;
}
.chip-pass { background: rgba(76,175,80,0.12); border-color: rgba(76,175,80,0.3); color: #81c784; }
.chip-fail { background: rgba(229,57,53,0.1);  border-color: rgba(229,57,53,0.25); color: #ef9a9a; }

.rp-error-box {
  background: rgba(229,57,53,0.06);
  border: 1px solid rgba(229,57,53,0.2);
  border-radius: 7px;
  padding: clamp(6px, 0.65vw, 10px) clamp(8px, 0.85vw, 12px);
}
.rp-error-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: clamp(0.55rem, 0.6vw, 0.68rem);
  font-weight: 800;
  text-transform: uppercase;
  color: #ef9a9a;
  margin-bottom: 4px;
}
.rp-error-pre {
  font-family: monospace;
  font-size: clamp(0.62rem, 0.68vw, 0.76rem);
  color: rgba(255,150,150,0.8);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: clamp(60px, 8vh, 100px);
  overflow-y: auto;
}

/* ── Problem card (middle) ── */
.lo-col--mid .problem-card { flex: 1; min-height: 0; }

.problem-title {
  font-size: clamp(0.84rem, 0.95vw, 1.08rem);
  text-transform: none;
  letter-spacing: 0;
  color: rgba(255,255,255,0.9);
  font-weight: 700;
}

/* FIX: problem body scroll + breathing room */
.problem-body {
  padding: clamp(14px, 1.4vw, 22px) clamp(16px, 1.6vw, 24px);
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.07) transparent;
}
.problem-body::-webkit-scrollbar { width: 4px; }
.problem-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* FIX: description typography — readable line height, proper paragraph spacing */
.problem-description {
  font-size: clamp(0.82rem, 0.92vw, 1.02rem);
  line-height: 1.78;
  color: rgba(255,255,255,0.82);
  margin-bottom: clamp(12px, 1.2vw, 18px);
}
.problem-description :deep(p) { margin: 0 0 0.9em 0; }
.problem-description :deep(p:last-child) { margin-bottom: 0; }
.problem-description :deep(pre),
.problem-description :deep(code) {
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 5px;
  padding: 2px 6px;
  font-size: clamp(0.76rem, 0.84vw, 0.94rem);
  color: #80cbc4;
}
.problem-description :deep(strong) { color: rgba(255,255,255,0.95); font-weight: 700; }

/* FIX: sample cases — each row gets its own card frame */
.samples-section {
  margin-top: clamp(14px, 1.4vw, 20px);
  border-top: 1px solid rgba(255,255,255,0.07);
  padding-top: clamp(12px, 1.2vw, 16px);
}
.sample-label {
  display: flex;
  align-items: center;
  font-size: clamp(0.58rem, 0.62vw, 0.72rem);
  font-weight: 800;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  margin-bottom: clamp(8px, 0.85vw, 12px);
}
.samples-list {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 0.85vw, 12px);
}

/* FIX: sample row — card-style with padding, clear separation between cases */
.sample-row {
  display: flex;
  gap: clamp(8px, 0.85vw, 12px);
  align-items: flex-start;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 9px;
  padding: clamp(8px, 0.85vw, 13px);
}
.sample-row-num {
  width: clamp(18px, 1.6vw, 24px);
  height: clamp(18px, 1.6vw, 24px);
  border-radius: 50%;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.55rem, 0.6vw, 0.68rem);
  font-weight: 800;
  color: rgba(255,255,255,0.3);
  flex-shrink: 0;
  margin-top: 2px;
}
.sample-row-io {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(6px, 0.65vw, 10px);
  flex: 1;
}
.sample-io-block { display: flex; flex-direction: column; gap: 4px; }
.io-label {
  font-size: clamp(0.58rem, 0.62vw, 0.7rem);
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.io-label--in  { color: #64b5f6; }
.io-label--out { color: #81c784; }
.io-value {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 6px;
  padding: clamp(5px, 0.55vw, 9px) clamp(8px, 0.85vw, 12px);
  font-family: monospace;
  font-size: clamp(0.75rem, 0.82vw, 0.94rem);
  color: rgba(255,255,255,0.85);
  white-space: pre-wrap;
  word-break: break-all;
  min-height: clamp(28px, 2.8vw, 38px);
  line-height: 1.5;
}

/* ── Code editor ── */
.lo-col--right .editor-card { flex: 1; min-height: 0; }

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(8px, 0.85vw, 13px) clamp(12px, 1.2vw, 18px);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  background: rgba(0,0,0,0.25);
  flex-shrink: 0;
  overflow: visible;
}
.lang-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: clamp(3px, 0.35vw, 6px) clamp(10px, 1vw, 15px);
  border-radius: 20px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  font-size: clamp(0.66rem, 0.72vw, 0.82rem);
  font-weight: 700;
  color: rgba(255,255,255,0.62);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.lang-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4caf50;
  box-shadow: 0 0 6px rgba(76,175,80,0.7);
  flex-shrink: 0;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: clamp(8px, 0.85vw, 13px);
}
.input-hint-toggle {
  position: relative;
  color: rgba(255,255,255,0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
}
.input-hint-toggle:hover { color: rgba(255,255,255,0.65); }
.hint-popover {
  display: none;
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  background: #1a1a2e;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: clamp(10px, 1.1vw, 16px);
  min-width: clamp(210px, 22vw, 290px);
  z-index: 100;
  box-shadow: 0 10px 30px rgba(0,0,0,0.55);
}
.input-hint-toggle:hover .hint-popover { display: block; }
.hint-title {
  font-size: clamp(0.6rem, 0.65vw, 0.74rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.32);
  text-transform: uppercase;
  margin-bottom: 6px;
}
.hint-popover code {
  display: block;
  font-family: monospace;
  font-size: clamp(0.68rem, 0.75vw, 0.86rem);
  color: #80cbc4;
  background: rgba(0,0,0,0.3);
  padding: 6px 8px;
  border-radius: 5px;
}
.hint-out { margin-top: 6px; font-size: clamp(0.64rem, 0.7vw, 0.8rem); color: rgba(255,255,255,0.28); }

.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: clamp(7px, 0.75vw, 10px) clamp(14px, 1.5vw, 22px);
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #1e88e5, #1565c0);
  color: #fff;
  font-size: clamp(0.75rem, 0.82vw, 0.94rem);
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(30,136,229,0.35);
  transition: transform 0.12s, filter 0.12s, box-shadow 0.12s;
  white-space: nowrap;
  letter-spacing: 0.02em;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.12);
  box-shadow: 0 4px 16px rgba(30,136,229,0.45);
}
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { opacity: 0.48; cursor: not-allowed; }
.submit-btn--loading { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.4); box-shadow: none; }
.submit-btn--done { background: linear-gradient(135deg, #43a047, #2e7d32) !important; box-shadow: 0 2px 10px rgba(67,160,71,0.35) !important; }
.submit-spin { display: inline-block; animation: submit-spin 0.7s linear infinite; }
@keyframes submit-spin { to { transform: rotate(360deg); } }

/* FIX: editor-wrap — dark background so no teal bleed through from uninitialized editor;
   force the CodeMirror/CM6 scroll container to fill height properly */
.editor-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #1e1e2e;
}
.editor-wrap :deep(.code-editor),
.editor-wrap :deep(.cm-editor),
.editor-wrap :deep(.CodeMirror),
.editor-wrap > :deep(*) {
  height: 100% !important;
  flex: 1;
  min-height: 0 !important;
}
.editor-wrap :deep(.cm-scroller),
.editor-wrap :deep(.CodeMirror-scroll) {
  flex: 1;
  min-height: 0;
  overflow: auto !important;
}

/* ── Hint strip ── */
.hint-strip-card { flex-shrink: 0; }
.hint-strip {
  padding: clamp(8px, 0.85vw, 13px) clamp(12px, 1.2vw, 18px);
}
.hint-strip-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: clamp(0.58rem, 0.62vw, 0.72rem);
  font-weight: 800;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.22);
  text-transform: uppercase;
  margin-bottom: 5px;
}
.hint-code {
  display: block;
  font-family: monospace;
  font-size: clamp(0.67rem, 0.74vw, 0.84rem);
  color: #80cbc4;
  background: rgba(0,0,0,0.25);
  padding: clamp(4px, 0.4vw, 7px) clamp(7px, 0.75vw, 10px);
  border-radius: 5px;
  word-break: break-all;
}
.hint-note {
  font-size: clamp(0.58rem, 0.62vw, 0.72rem);
  color: rgba(255,255,255,0.18);
  margin-top: 4px;
}

/* ── Anti-cheat toast ── */
.ac-warn-enter-active, .ac-warn-leave-active { transition: all 0.25s ease; }
.ac-warn-enter-from, .ac-warn-leave-to { opacity: 0; transform: translateY(-12px) scale(0.97); }
.ac-warning-toast {
  position: fixed;
  top: clamp(14px, 1.5vh, 26px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(12,4,4,0.97);
  border: 1px solid rgba(229,57,53,0.5);
  border-radius: 12px;
  padding: clamp(11px, 1.1vw, 17px) clamp(15px, 1.5vw, 22px);
  display: flex;
  align-items: flex-start;
  gap: 11px;
  z-index: 99999;
  min-width: clamp(250px, 24vw, 390px);
  max-width: clamp(290px, 32vw, 460px);
  box-shadow: 0 8px 32px rgba(229,57,53,0.24);
  backdrop-filter: blur(20px);
}
.ac-warn-icon { font-size: clamp(1.1rem, 1.3vw, 1.6rem); flex-shrink: 0; }
.ac-warn-body { flex: 1; }
.ac-warn-title {
  font-size: clamp(0.76rem, 0.82vw, 0.94rem);
  font-weight: 800;
  color: #ef9a9a;
  margin-bottom: 3px;
}
.ac-warn-msg {
  font-size: clamp(0.7rem, 0.76vw, 0.88rem);
  color: rgba(255,255,255,0.72);
  line-height: 1.45;
}
.ac-warn-count {
  margin-top: 5px;
  font-size: clamp(0.58rem, 0.62vw, 0.72rem);
  font-weight: 700;
  color: rgba(229,57,53,0.65);
  font-family: monospace;
}

/* ══════════════════════════════════════════════
   RESULT OVERLAY
══════════════════════════════════════════════ */
.result-overlay-fade-enter-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.result-overlay-fade-leave-active { transition: opacity 0.25s ease, transform 0.2s ease; }
.result-overlay-fade-enter-from  { opacity: 0; transform: scale(1.04); }
.result-overlay-fade-leave-to    { opacity: 0; transform: scale(0.96); }

.result-overlay {
  position: fixed;
  inset: 0;
  z-index: 99998;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(4, 4, 12, 0.88);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
}

/* Animated background rings */
.ro-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.04);
  animation: ro-pulse 3s ease-in-out infinite;
  pointer-events: none;
}
.ro-ring--1 { width: 340px; height: 340px; animation-delay: 0s; }
.ro-ring--2 { width: 520px; height: 520px; animation-delay: 0.6s; opacity: 0.6; }
.ro-ring--3 { width: 700px; height: 700px; animation-delay: 1.2s; opacity: 0.35; }
@keyframes ro-pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50%       { transform: scale(1.06); opacity: 0.08; }
}

/* Main card */
.ro-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  background: rgba(16, 16, 28, 0.92);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 22px;
  padding: 36px 44px 28px;
  min-width: 320px;
  max-width: 420px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.7);
  text-align: center;
  animation: ro-card-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes ro-card-in {
  from { transform: scale(0.82) translateY(20px); opacity: 0; }
  to   { transform: scale(1) translateY(0); opacity: 1; }
}

/* Verdict icon */
.ro-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  border: 2px solid transparent;
  animation: ro-icon-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;
}
@keyframes ro-icon-pop {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
.ro-icon--win     { background: rgba(76,175,80,0.18);  border-color: rgba(76,175,80,0.4);  box-shadow: 0 0 32px rgba(76,175,80,0.25); }
.ro-icon--partial { background: rgba(255,193,7,0.14);  border-color: rgba(255,193,7,0.35); box-shadow: 0 0 32px rgba(255,193,7,0.2); }
.ro-icon--loss    { background: rgba(229,57,53,0.14);  border-color: rgba(229,57,53,0.35); box-shadow: 0 0 32px rgba(229,57,53,0.2); }

/* Verdict text */
.ro-verdict {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  animation: ro-slide-up 0.4s ease 0.15s both;
}
@keyframes ro-slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ro-verdict--win     { color: #81c784; text-shadow: 0 0 24px rgba(76,175,80,0.5); }
.ro-verdict--partial { color: #ffca28; text-shadow: 0 0 24px rgba(255,193,7,0.4); }
.ro-verdict--loss    { color: #ef9a9a; text-shadow: 0 0 24px rgba(229,57,53,0.4); }

/* Score row */
.ro-score-row {
  display: flex;
  align-items: center;
  gap: 20px;
  animation: ro-slide-up 0.4s ease 0.22s both;
}
.ro-score-block { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.ro-score-divider {
  width: 1px;
  height: 36px;
  background: rgba(255,255,255,0.1);
  border-radius: 1px;
}
.ro-score-val {
  font-family: monospace;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
}
.ro-pct { font-size: 1rem; opacity: 0.55; }
.ro-score-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.28);
}
.sv--perfect { color: #00e5ff; text-shadow: 0 0 20px rgba(0,229,255,0.4); }
.sv--partial  { color: #ffb74d; }
.sv--zero     { color: rgba(255,255,255,0.22); }
.sv--neutral  { color: rgba(255,255,255,0.78); }

/* Test chips */
.ro-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
  max-width: 340px;
  animation: ro-slide-up 0.4s ease 0.28s both;
}
.ro-chip {
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1px solid transparent;
}
.ro-chip--pass { background: rgba(76,175,80,0.12); border-color: rgba(76,175,80,0.3); color: #81c784; }
.ro-chip--fail { background: rgba(229,57,53,0.1);  border-color: rgba(229,57,53,0.25); color: #ef9a9a; }

/* Footer countdown */
.ro-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  border-top: 1px solid rgba(255,255,255,0.07);
  padding-top: 16px;
  width: 100%;
  justify-content: center;
  animation: ro-slide-up 0.4s ease 0.34s both;
}
.ro-countdown-ring { width: 32px; height: 32px; flex-shrink: 0; }
.ro-countdown-svg { width: 100%; height: 100%; }
.ro-footer-text {
  font-size: 0.74rem;
  color: rgba(255,255,255,0.32);
  font-weight: 600;
  letter-spacing: 0.02em;
}
</style>
