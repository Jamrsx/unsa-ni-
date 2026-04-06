<script setup>
import { reactive, ref, onMounted } from 'vue';
import { getSocket } from './js/socket.js';

import GameResultPanel from './components/game-result-panel.vue';
import PlayerStatDuelPoint from './components/player-stat-duel-point.vue';
import PlayerStatLevel from './components/player-stat-level.vue';
import Window from './components/window.vue';
import ScrollVerticalCarousel from './components/scroll-vertical-carousel.vue';
import ScrollCard from './components/scroll-card.vue';
import CardPlayerStatPoint from './components/card-player-stat-point.vue';
import ButtonText from './components/button-text.vue';

const socket = getSocket();

if (!socket) {
  console.error('[Result] No socket available - no token found');
  if (!localStorage.getItem('jwt_token')) {
    window.location.href = '/signin.html';
  } else {
    console.error('[Result] Token exists but socket creation failed');
    alert('Connection error. Please refresh the page.');
  }
}

const resultMode = ref('casual');
const matchId = ref(localStorage.getItem('currentMatchId') || null);

const Player1Properties = reactive({
  isFinished: false,
  imgSrcPlayer1: '/asset/general/profile-user.png',
  namePlayer1: 'Player 1',
  resultCompletionPlayer1: '0%',
  resultDurationPlayer1: '00:00',
  resultTestDonePlayer1: '0/0',
  resultLanguagePlayer1: ''
});

const Player2Properties = reactive({
  isFinished: false,
  imgSrcPlayer2: '/asset/general/profile-user.png',
  namePlayer2: 'Player 2',
  resultCompletionPlayer2: '0%',
  resultDurationPlayer2: '00:00',
  resultTestDonePlayer2: '0/0',
  resultLanguagePlayer2: ''
});

const Player1Score = reactive({ codePoints: 0, timePoints: 0, totalPoints: 0 });
const Player2Score = reactive({ codePoints: 0, timePoints: 0, totalPoints: 0 });
const PlayerWinSide = ref(0);
const serverWinnerId = ref(null); // Winner from server (1, 2, or null for tie)
const currentPlayerNumber = ref(null);
const currentPlayerScore = reactive({
  testScore: 0,
  languagePoints: 0,
  bonusPoints: 0,
  timeBonus: 0,
  totalCodePoints: 0,
  duelPointsEarned: 0,
  duelPointsBreakdown: { base: 0, bonus: 0, total: 0, label1: 'Base Points', label2: 'Bonus/Penalty' }
});

const playerLevel = ref(1);
const playerExp = ref(0);
const maxExp = ref(1000);
const duelRank = ref(1);
const duelPoints = ref(0);
const xpGained = ref(0);
const duelPointsChange = ref(0);
const leveledUp = ref(false);

function showOpponentAbandonedNotification(data) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;z-index:99999;backdrop-filter:blur(10px) saturate(180%);`;
  const card = document.createElement('div');
  card.style.cssText = `background:linear-gradient(135deg,rgba(102,126,234,0.9) 0%,rgba(118,75,162,0.9) 100%);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.3);color:white;padding:40px;border-radius:24px;box-shadow:0 25px 70px rgba(102,126,234,0.4);max-width:500px;text-align:center;`;
  const title = document.createElement('h2');
  title.textContent = '🏆 Opponent Forfeited!';
  title.style.cssText = 'margin:0 0 20px 0;font-size:28px;';
  const message = document.createElement('p');
  message.textContent = data.message || 'Your opponent left the match.';
  message.style.cssText = 'margin:0 0 15px 0;font-size:18px;';
  const details = document.createElement('div');
  let detailsHTML = '<p style="margin:10px 0;font-size:16px;">✨ <strong>You win by forfeit!</strong></p>';
  if (data.bonusDP > 0) detailsHTML += `<p style="margin:10px 0;font-size:20px;color:#ffd700;">💰 <strong>+${data.bonusDP} DP!</strong></p>`;
  details.innerHTML = detailsHTML;
  details.style.cssText = 'margin:20px 0;padding:20px;background:rgba(255,255,255,0.2);border-radius:10px;';
  const button = document.createElement('button');
  button.textContent = 'Understood';
  button.style.cssText = `padding:12px 40px;margin-top:20px;background:white;color:#667eea;border:none;border-radius:12px;font-size:16px;font-weight:bold;cursor:pointer;`;
  button.onclick = () => document.body.removeChild(overlay);
  card.appendChild(title); card.appendChild(message); card.appendChild(details); card.appendChild(button);
  overlay.appendChild(card); document.body.appendChild(overlay);
}

function showAbandonmentPenaltyNotice(data) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.65);display:flex;justify-content:center;align-items:center;z-index:99999;backdrop-filter:blur(12px) saturate(180%);`;
  const card = document.createElement('div');
  card.style.cssText = `background:linear-gradient(135deg,rgba(241,39,17,0.95) 0%,rgba(245,175,25,0.95) 100%);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.2);color:white;padding:40px;border-radius:24px;box-shadow:0 25px 70px rgba(241,39,17,0.4);max-width:500px;text-align:center;`;
  const title = document.createElement('h2');
  title.textContent = data.isBanned ? '🚫 Account Banned' : '⚠️ Abandonment Penalty';
  title.style.cssText = 'margin:0 0 20px 0;font-size:28px;';
  const message = document.createElement('p');
  message.textContent = data.message || 'You abandoned the match.';
  message.style.cssText = 'margin:0 0 15px 0;font-size:18px;';
  const details = document.createElement('div');
  let detailsHTML = '';
  if (data.penaltyDP < 0) detailsHTML += `<p style="margin:10px 0;font-size:24px;color:#ffeb3b;">💸 <strong>${data.penaltyDP} DP</strong></p>`;
  detailsHTML += `<p style="margin:10px 0;font-size:16px;">Abandonments: <strong>${data.abandonCount}</strong></p>`;
  if (data.isBanned) detailsHTML += '<p style="margin:10px 0;font-size:16px;color:#ffeb3b;">⛔ You are temporarily banned from matchmaking.</p>';
  details.innerHTML = detailsHTML;
  details.style.cssText = 'margin:20px 0;padding:20px;background:rgba(255,255,255,0.2);border-radius:10px;';
  const button = document.createElement('button');
  button.textContent = 'I Understand';
  button.style.cssText = `padding:12px 40px;margin-top:20px;background:white;color:#f12711;border:none;border-radius:12px;font-size:16px;font-weight:bold;cursor:pointer;`;
  button.onclick = () => document.body.removeChild(overlay);
  card.appendChild(title); card.appendChild(message); card.appendChild(details); card.appendChild(button);
  overlay.appendChild(card); document.body.appendChild(overlay);
}

function parseTests(str) {
  const [passed, total] = str.split('/').map(Number);
  return { passed: passed || 0, total: total || 1 };
}
function calculateCodePoints(passed, total) { return Math.round((passed / total) * 100); }
function calculateTimePoints(durationString) {
  const [minutes, seconds] = durationString.split(':').map(Number);
  const totalSeconds = (minutes || 0) * 60 + (seconds || 0);
  if (totalSeconds <= 30) return 50;
  if (totalSeconds <= 60) return 40;
  if (totalSeconds <= 120) return 25;
  if (totalSeconds <= 300) return 10;
  return 0;
}
function calculateLanguagePoints(language) {
  const languageBonus = { 'java': 15, 'php': 10, 'python': 5 };
  return languageBonus[language?.toLowerCase()] || 0;
}
function calculateBonusPoints(passed, total, duration) {
  if (passed === total && total > 0) return 10;
  const [m, s] = duration.split(':').map(Number);
  if ((m || 0) === 0 && (s || 0) < 60) return 5;
  return 0;
}
function calculateDuelPointsBreakdown(isWinner, isTie, testsPassed, totalTests) {
  if (isTie) return { base: 0, bonus: 0, total: 0, label1: 'Base Points', label2: 'Bonus' };
  const passingRate = totalTests > 0 ? testsPassed / totalTests : 0;
  if (!isWinner) {
    // Loss: base penalty is -25, performance can recover up to 15 of that
    const performanceAdjustment = Math.round(passingRate * 15);
    const total = Math.max(Math.round(-25 + performanceAdjustment), -25);
    return { base: -25, bonus: performanceAdjustment, total, label1: 'Loss Penalty', label2: 'Performance Adjustment' };
  }
  // Win: base reward is +10, performance adds up to +20 more
  const performanceBonus = Math.round(passingRate * 20);
  const total = 10 + performanceBonus;
  return { base: 10, bonus: performanceBonus, total, label1: 'Win Bonus', label2: 'Performance Bonus' };
}
function determineWinner(serverWinnerId) {
  if (!Player1Properties.isFinished || !Player2Properties.isFinished) return 0;

  // Always trust the server winner when available
  if (serverWinnerId === 1 || serverWinnerId === 2) return serverWinnerId;

  const p1Tests = parseTests(Player1Properties.resultTestDonePlayer1);
  const p2Tests = parseTests(Player2Properties.resultTestDonePlayer2);

  if (p1Tests.passed > p2Tests.passed) return 1;
  if (p2Tests.passed > p1Tests.passed) return 2;

  // Tests are equal (and > 0) → tiebreak by duration
  const toSeconds = (dur) => { const [m, s] = (dur || '00:00').split(':').map(Number); return (m || 0) * 60 + (s || 0); };
  const p1Secs = toSeconds(Player1Properties.resultDurationPlayer1);
  const p2Secs = toSeconds(Player2Properties.resultDurationPlayer2);
  if (p1Secs < p2Secs) return 1;
  if (p2Secs < p1Secs) return 2;

  // Duration also equal → tiebreak by total points
  if (Player1Score.totalPoints > Player2Score.totalPoints) return 1;
  if (Player2Score.totalPoints > Player1Score.totalPoints) return 2;
  return 0;
}
function updatePlayerScores() {
  const p1 = parseTests(Player1Properties.resultTestDonePlayer1);
  const p2 = parseTests(Player2Properties.resultTestDonePlayer2);
  Player1Score.codePoints = calculateCodePoints(p1.passed, p1.total);
  Player2Score.codePoints = calculateCodePoints(p2.passed, p2.total);
  if (resultMode.value === 'ranked') {
    Player1Score.timePoints = calculateTimePoints(Player1Properties.resultDurationPlayer1);
    Player2Score.timePoints = calculateTimePoints(Player2Properties.resultDurationPlayer2);
  } else {
    Player1Score.timePoints = 0;
    Player2Score.timePoints = 0;
  }
  Player1Score.totalPoints = Player1Score.codePoints + Player1Score.timePoints;
  Player2Score.totalPoints = Player2Score.codePoints + Player2Score.timePoints;
  PlayerWinSide.value = determineWinner(serverWinnerId.value);
}

onMounted(() => {
  const latestResult = localStorage.getItem('latestMatchResult');
  if (!latestResult) { window.location.href = '/duel.html'; return; }

  const resultData = JSON.parse(latestResult);
  const waiting = !!resultData.waitingForOpponent;
  const matchIdLocal = localStorage.getItem('currentMatchId');
  resultMode.value = resultData.mode || 'casual';

  const isStub = (p) => !p || (typeof p.username === 'string' && p.username.toLowerCase().includes('waiting'));

  const p1 = resultData.player1;
  Player1Properties.isFinished = !isStub(p1);
  Player1Properties.namePlayer1 = p1?.username || 'Player 1';
  Player1Properties.resultCompletionPlayer1 = `${p1?.completion || 0}%`;
  Player1Properties.resultDurationPlayer1 = p1?.duration || '00:00';
  Player1Properties.resultTestDonePlayer1 = `${p1?.passed || 0}/${p1?.total || 0}`;
  Player1Properties.resultLanguagePlayer1 = p1?.language || '';

  const p2 = resultData.player2;
  Player2Properties.isFinished = !isStub(p2);
  Player2Properties.namePlayer2 = p2?.username || 'Player 2';
  Player2Properties.resultCompletionPlayer2 = `${p2?.completion || 0}%`;
  Player2Properties.resultDurationPlayer2 = p2?.duration || '00:00';
  Player2Properties.resultTestDonePlayer2 = `${p2?.passed || 0}/${p2?.total || 0}`;
  Player2Properties.resultLanguagePlayer2 = p2?.language || '';
  serverWinnerId.value = resultData.winnerId || null; // Use server winner if cached

  updatePlayerScores();

  try {
    const user = window.user || JSON.parse(localStorage.getItem('user') || '{}');
    const currentUsername = user.username;
    if (currentUsername) {
      let playerProps, playerScore;
      if (Player1Properties.namePlayer1 === currentUsername) { currentPlayerNumber.value = 1; playerProps = Player1Properties; playerScore = Player1Score; }
      else if (Player2Properties.namePlayer2 === currentUsername) { currentPlayerNumber.value = 2; playerProps = Player2Properties; playerScore = Player2Score; }
      if (playerProps) {
        const tests = parseTests(playerProps[`resultTestDonePlayer${currentPlayerNumber.value}`]);
        currentPlayerScore.testScore = calculateCodePoints(tests.passed, tests.total);
        currentPlayerScore.languagePoints = calculateLanguagePoints(playerProps[`resultLanguagePlayer${currentPlayerNumber.value}`]);
        currentPlayerScore.bonusPoints = calculateBonusPoints(tests.passed, tests.total, playerProps[`resultDurationPlayer${currentPlayerNumber.value}`]);
        currentPlayerScore.totalCodePoints = currentPlayerScore.testScore + currentPlayerScore.languagePoints + currentPlayerScore.bonusPoints;
        currentPlayerScore.timeBonus = playerScore.timePoints;
        if (resultMode.value === 'ranked') {
          const breakdown = calculateDuelPointsBreakdown(PlayerWinSide.value === currentPlayerNumber.value, PlayerWinSide.value === 0, tests.passed, tests.total);
          currentPlayerScore.duelPointsBreakdown = breakdown;
          currentPlayerScore.duelPointsEarned = breakdown.total;
        }
      }
    }
  } catch (e) { console.error('Error determining current player:', e); }

  if (matchIdLocal) {
    const joinAndFetch = () => {
      socket.emit('join_match_room', { match_id: Number(matchIdLocal) });
      socket.emit('get_match_result', { match_id: Number(matchIdLocal) });
    };
    if (socket.connected) joinAndFetch();
    else socket.once('connect', joinAndFetch);
    socket.once('authenticated', () => {
      socket.emit('join_match_room', { match_id: Number(matchIdLocal) });
      socket.emit('get_match_result', { match_id: Number(matchIdLocal) });
    });
  }

  socket.on('match_finished', (data) => {
    if (!data || !data.player1 || !data.player2) return;
    resultMode.value = data.mode || 'casual';
    Player1Properties.namePlayer1 = data.player1.username || 'Player 1';
    Player1Properties.resultCompletionPlayer1 = `${Math.round((data.player1.passed / data.player1.total) * 100)}%`;
    Player1Properties.resultDurationPlayer1 = data.player1.duration || '00:00';
    Player1Properties.resultTestDonePlayer1 = `${data.player1.passed}/${data.player1.total}`;
    Player1Properties.resultLanguagePlayer1 = data.player1.language || '';
    Player1Properties.isFinished = true;
    Player2Properties.namePlayer2 = data.player2.username || 'Player 2';
    Player2Properties.resultCompletionPlayer2 = `${Math.round((data.player2.passed / data.player2.total) * 100)}%`;
    Player2Properties.resultDurationPlayer2 = data.player2.duration || '00:00';
    Player2Properties.resultTestDonePlayer2 = `${data.player2.passed}/${data.player2.total}`;
    Player2Properties.resultLanguagePlayer2 = data.player2.language || '';
    serverWinnerId.value = data.winnerId || null; // Store server winner for correct display
    Player2Properties.isFinished = true;
    updatePlayerScores();
    try {
      const user = window.user || JSON.parse(localStorage.getItem('user') || '{}');
      const currentUsername = user.username;
      if (currentUsername) {
        let playerProps, playerScore;
        if (Player1Properties.namePlayer1 === currentUsername) { currentPlayerNumber.value = 1; playerProps = Player1Properties; playerScore = Player1Score; }
        else if (Player2Properties.namePlayer2 === currentUsername) { currentPlayerNumber.value = 2; playerProps = Player2Properties; playerScore = Player2Score; }
        if (playerProps) {
          const tests = parseTests(playerProps[`resultTestDonePlayer${currentPlayerNumber.value}`]);
          currentPlayerScore.testScore = calculateCodePoints(tests.passed, tests.total);
          currentPlayerScore.languagePoints = calculateLanguagePoints(playerProps[`resultLanguagePlayer${currentPlayerNumber.value}`]);
          currentPlayerScore.bonusPoints = calculateBonusPoints(tests.passed, tests.total, playerProps[`resultDurationPlayer${currentPlayerNumber.value}`]);
          currentPlayerScore.totalCodePoints = currentPlayerScore.testScore + currentPlayerScore.languagePoints + currentPlayerScore.bonusPoints;
          currentPlayerScore.timeBonus = playerScore.timePoints;
          if (resultMode.value === 'ranked') {
            const breakdown = calculateDuelPointsBreakdown(PlayerWinSide.value === currentPlayerNumber.value, PlayerWinSide.value === 0, tests.passed, tests.total);
            currentPlayerScore.duelPointsBreakdown = breakdown;
            currentPlayerScore.duelPointsEarned = breakdown.total;
          }
        }
      }
    } catch (e) { console.error('Error updating current player score:', e); }
    localStorage.setItem('latestMatchResult', JSON.stringify({ mode: data.mode, player1: { username: data.player1.username, completion: Math.round((data.player1.passed / data.player1.total) * 100), passed: data.player1.passed, total: data.player1.total, duration: data.player1.duration, language: data.player1.language, verdict: data.player1.verdict, playerId: 1 }, player2: { username: data.player2.username, completion: Math.round((data.player2.passed / data.player2.total) * 100), passed: data.player2.passed, total: data.player2.total, duration: data.player2.duration, language: data.player2.language, verdict: data.player2.verdict, playerId: 2 }, waitingForOpponent: false, winnerId: data.winnerId || null }));
  });

  socket.on("abandonment_penalty", (data) => showAbandonmentPenaltyNotice(data));
  socket.on("opponent_abandoned", (data) => showOpponentAbandonedNotification(data));

  let statsReceived = false;
  socket.on('player_stats_update', (stats) => {
    statsReceived = true;
    playerLevel.value = stats.level;
    playerExp.value = stats.currentXP;
    maxExp.value = stats.xpForNextLevel;
    duelPoints.value = stats.duelPoints;
    duelRank.value = stats.rank || 1;
    xpGained.value = stats.xpGained || 0;
    const isTie = PlayerWinSide.value === 0;
    duelPointsChange.value = isTie ? 0 : (stats.duelPointsChange || 0);
    leveledUp.value = stats.leveledUp || false;
    if (resultMode.value === 'ranked' && currentPlayerNumber.value) {
      const testsStr = currentPlayerNumber.value === 1 ? Player1Properties.resultTestDonePlayer1 : Player2Properties.resultTestDonePlayer2;
      const tests = parseTests(testsStr);
      const breakdown = calculateDuelPointsBreakdown(PlayerWinSide.value === currentPlayerNumber.value, isTie, tests.passed, tests.total);
      // Only sync with server value when NOT a tie — ties are always 0
      if (!isTie && breakdown.total !== stats.duelPointsChange) { breakdown.bonus = stats.duelPointsChange - breakdown.base; breakdown.total = stats.duelPointsChange; }
      currentPlayerScore.duelPointsBreakdown = { base: breakdown.base, bonus: breakdown.bonus, total: breakdown.total, label1: breakdown.label1, label2: breakdown.label2 };
      currentPlayerScore.duelPointsEarned = isTie ? 0 : stats.duelPointsChange;
    } else if (resultMode.value === 'casual') {
      currentPlayerScore.duelPointsEarned = 0;
    }
  });

  const requestStatsWithRetry = (attempt = 1, maxAttempts = 8) => {
    if (statsReceived || attempt > maxAttempts) return;
    // First attempt waits 1500ms to let the server finish the DB write,
    // subsequent retries every 800ms
    setTimeout(() => { socket.emit('get_player_stats'); if (!statsReceived) requestStatsWithRetry(attempt + 1, maxAttempts); }, attempt === 1 ? 1500 : 800);
  };
  requestStatsWithRetry();
});

function backToLobby() {
  localStorage.removeItem('play_again_mode');
  window.location.href = '/duel.html';
}
function playAgain() {
  localStorage.setItem('play_again_mode', resultMode.value);
  window.location.href = '/duel.html';
}
</script>

<template>
  <section class="result-page">

    <!-- ── Header ── -->
    <div class="result-header-card lo-card">
      <div class="result-header-inner">
        <div class="result-header-icon">🏆</div>
        <div class="result-header-text">
          <div class="result-header-label">MATCH FINISHED</div>
          <div v-if="resultMode">
            <span :class="['result-mode-badge', resultMode === 'ranked' ? 'badge--ranked' : 'badge--casual']">
              {{ resultMode.toUpperCase() }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Result Panel ── -->
    <div class="result-panel-card lo-card">
      <div class="rp-card-header">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <span>Result</span>
      </div>
      <!-- Dark overlay wrapper so GameResultPanel text is always readable -->
      <div class="rp-panel-body">
        <GameResultPanel
          :PlayerWinSide="PlayerWinSide"
          :Player1Properties="Player1Properties"
          :Player2Properties="Player2Properties"
        />
      </div>
    </div>

    <!-- ── Action Buttons — centered ── -->
    <div class="result-actions">
      <button class="result-btn result-btn--lobby" @click="backToLobby">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to Lobby
      </button>
      <button class="result-btn result-btn--again" @click="playAgain">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        Play Again
      </button>
    </div>

    <!-- ── Stats Grid (Ranked) ── -->
    <div v-if="resultMode === 'ranked'" class="result-stats-grid">

      <div class="lo-card stat-card">
        <div class="stat-card-header">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
          <span>Level Progress</span>
        </div>
        <div class="stat-card-body">
          <PlayerStatLevel :level="playerLevel" :currentExp="playerExp" :maxExp="maxExp" :size="150" :stroke="14" />
          <div class="stat-breakdown">
            <div class="stat-row">
              <span class="stat-row-label">Test Score</span>
              <span class="stat-row-val stat-val--xp">+{{ currentPlayerScore.testScore }}xp</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Language Points</span>
              <span class="stat-row-val stat-val--xp">+{{ currentPlayerScore.languagePoints }}xp</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Bonus Code Points</span>
              <span class="stat-row-val stat-val--xp">+{{ currentPlayerScore.bonusPoints }}xp</span>
            </div>
          </div>
        </div>
      </div>

      <div class="lo-card stat-card">
        <div class="stat-card-header">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
          <span>Duel Points</span>
          <span
            class="dp-change-badge"
            :class="{
              'dp-pos': (currentPlayerScore.duelPointsBreakdown?.total || duelPointsChange) > 0,
              'dp-neg': (currentPlayerScore.duelPointsBreakdown?.total || duelPointsChange) < 0,
              'dp-neu': (currentPlayerScore.duelPointsBreakdown?.total || duelPointsChange) === 0
            }"
          >
            {{ (currentPlayerScore.duelPointsBreakdown?.total || duelPointsChange) >= 0 ? '+' : '' }}{{ currentPlayerScore.duelPointsBreakdown?.total || duelPointsChange }} DP
          </span>
        </div>
        <div class="stat-card-body">
          <PlayerStatDuelPoint :rank="duelRank" :points="duelPoints" :size="150" />
          <div class="stat-breakdown">
            <div class="stat-row">
              <span class="stat-row-label">{{ currentPlayerScore.duelPointsBreakdown.label1 || 'Base Points' }}</span>
              <span class="stat-row-val">{{ currentPlayerScore.duelPointsBreakdown.base >= 0 ? '+' : '' }}{{ currentPlayerScore.duelPointsBreakdown.base }}dp</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">{{ currentPlayerScore.duelPointsBreakdown.label2 || 'Bonus/Penalty' }}</span>
              <span class="stat-row-val">{{ currentPlayerScore.duelPointsBreakdown.bonus >= 0 ? '+' : '' }}{{ currentPlayerScore.duelPointsBreakdown.bonus }}dp</span>
            </div>
            <div class="stat-row stat-row--total">
              <span class="stat-row-label">Total Change</span>
              <span class="stat-row-val">{{ currentPlayerScore.duelPointsBreakdown.total >= 0 ? '+' : '' }}{{ currentPlayerScore.duelPointsBreakdown.total }}dp</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ── Stats Grid (Casual) ── -->
    <div v-if="resultMode === 'casual'" class="result-stats-grid result-stats-grid--single">
      <div class="lo-card stat-card">
        <div class="stat-card-header">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
          <span>Level Progress</span>
        </div>
        <div class="stat-card-body">
          <PlayerStatLevel :level="playerLevel" :currentExp="playerExp" :maxExp="maxExp" :size="150" :stroke="14" />
          <div class="stat-breakdown">
            <div class="stat-row">
              <span class="stat-row-label">Test Score</span>
              <span class="stat-row-val stat-val--xp">+{{ currentPlayerScore.testScore }}xp</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Language Points</span>
              <span class="stat-row-val stat-val--xp">+{{ currentPlayerScore.languagePoints }}xp</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Bonus Code Points</span>
              <span class="stat-row-val stat-val--xp">+{{ currentPlayerScore.bonusPoints }}xp</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<style scoped>
/* ══════════════════════════════════════════════
   PAGE WRAPPER
══════════════════════════════════════════════ */
.result-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  padding: 0 4px;
  box-sizing: border-box;
}

/* ── Card base ── */
.lo-card {
  background: rgba(14, 14, 22, 0.72);       /* FIX: dark transparent so child text is always readable */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* ══════════════════════════════════════════════
   HEADER CARD
══════════════════════════════════════════════ */
.result-header-card { flex-shrink: 0; }

.result-header-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
}
.result-header-icon { font-size: 2rem; line-height: 1; }
.result-header-text { display: flex; flex-direction: column; gap: 5px; }
.result-header-label {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  color: rgba(255, 255, 255, 0.92);
  text-transform: uppercase;
}
.result-mode-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.badge--ranked { background: rgba(255, 152, 0, 0.14); color: #ffb74d; border: 1px solid rgba(255, 152, 0, 0.3); }
.badge--casual { background: rgba(76, 175, 80, 0.14); color: #81c784; border: 1px solid rgba(76, 175, 80, 0.3); }

/* ══════════════════════════════════════════════
   RESULT PANEL CARD
   FIX: dark overlay on the inner body so that GameResultPanel
   content (player names, scores etc.) is always visible
   regardless of what the child component renders
══════════════════════════════════════════════ */
.result-panel-card { flex-shrink: 0; }

.rp-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(0, 0, 0, 0.3);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  flex-shrink: 0;
}

.rp-panel-body {
  padding: 16px;
  /* Dark semi-transparent background ensures all text from the
     GameResultPanel child component is legible */
  background: rgba(8, 8, 16, 0.55);
  /* Force text colour inheritance for any unstyled text nodes in the slot */
  color: rgba(255, 255, 255, 0.9);
}

/* Pierce into GameResultPanel to guarantee text visibility */
.rp-panel-body :deep(*) {
  color: inherit;
}
.rp-panel-body :deep(h1),
.rp-panel-body :deep(h2),
.rp-panel-body :deep(h3),
.rp-panel-body :deep(h4),
.rp-panel-body :deep(p),
.rp-panel-body :deep(span),
.rp-panel-body :deep(div) {
  /* Only apply if not already explicitly colored by the child */
  color: rgba(255, 255, 255, 0.88);
}
/* Let explicitly colored elements (badges, accents) keep their own color */
.rp-panel-body :deep([style*="color"]) {
  color: revert;
}

/* ══════════════════════════════════════════════
   ACTION BUTTONS — centered
══════════════════════════════════════════════ */
.result-actions {
  display: flex;
  gap: 10px;
  justify-content: center;   /* FIX: was missing, buttons were left-aligned */
  align-items: center;
  flex-shrink: 0;
  padding: 2px 0;
}

.result-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 28px;
  border-radius: 9px;
  border: none;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s, filter 0.12s, box-shadow 0.12s;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.result-btn:hover  { transform: translateY(-2px); filter: brightness(1.1); }
.result-btn:active { transform: translateY(0); }

.result-btn--lobby {
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.13);
}
.result-btn--lobby:hover {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.95);
}

.result-btn--again {
  background: linear-gradient(135deg, #1e88e5, #1565c0);
  color: #fff;
  box-shadow: 0 3px 14px rgba(30, 136, 229, 0.38);
}
.result-btn--again:hover {
  box-shadow: 0 5px 20px rgba(30, 136, 229, 0.52);
}

/* ══════════════════════════════════════════════
   STATS GRID
══════════════════════════════════════════════ */
.result-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.result-stats-grid--single {
  grid-template-columns: 1fr;
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.stat-card { flex: 1; }

.stat-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(0, 0, 0, 0.25);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  flex-shrink: 0;
}

.stat-card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 18px 16px 16px;
}

/* ── DP change badge ── */
.dp-change-badge {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 800;
  font-family: monospace;
  letter-spacing: 0.04em;
}
.dp-pos { background: rgba(76,175,80,0.14); color: #81c784; border: 1px solid rgba(76,175,80,0.3); }
.dp-neg { background: rgba(239,83,80,0.12); color: #ef9a9a; border: 1px solid rgba(239,83,80,0.28); }
.dp-neu { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.35); border: 1px solid rgba(255,255,255,0.1); }

/* ── Breakdown rows ── */
.stat-breakdown {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 7px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  padding-top: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.48);
}
.stat-row--total {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.78);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 7px;
  margin-top: 2px;
}
.stat-row-label { flex: 1; }
.stat-row-val { font-family: monospace; font-weight: 700; color: rgba(255,255,255,0.72); }
.stat-val--xp  { color: #81c784; }
</style>
