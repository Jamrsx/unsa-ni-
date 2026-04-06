import { getsocket } from './socket.js';
const socket = getsocket();

// DOM elements
const duelMenu = document.getElementById('duel-menu');
const duelQueue = document.getElementById('duel-queue');
const duelOverlay = document.getElementById('duel-overlay');
const duelWaiting = document.getElementById('duel-waiting');
const player1NameElem = document.getElementById('player1-name');
const player2NameElem = document.getElementById('player2-name');

const createLobbyBtn = document.getElementById('createLobby');
const cancelQueueBtn = document.getElementById('cancelQueueBtn');
const readyBtn = document.getElementById('readyBtn');
const cancelMatchBtn = document.getElementById('cancelMatchBtn');

let currentMode = null;
let matchFoundTimeout = null;
let opponentFinished = false;
let playerFinished = false;

// --- Helpers ---
function showSection(section) {
  duelMenu.classList.add('hidden');
  duelQueue.classList.add('hidden');
  duelOverlay.classList.add('hidden');

  section.classList.remove('hidden');
}

function resetToMenu() {
  if (matchFoundTimeout) clearTimeout(matchFoundTimeout);
  currentMode = null;
  opponentFinished = false;
  playerFinished = false;
  duelWaiting.textContent = "Waiting for opponent...";
  showSection(duelMenu);
}

// --- Mode Buttons ---
createLobbyBtn.addEventListener('click', () => {
  currentMode = 'lobby';
  console.log('Creating lobby (feature coming soon)');
});

// --- Queueing ---
function startQueueing() {
  console.log(`Entered ${currentMode} queue`);
  showSection(duelQueue);

  matchFoundTimeout = setTimeout(() => {
    showMatchFound();
  }, 4000);
}

cancelQueueBtn.addEventListener('click', () => {
  console.log('Cancelled queue');
  resetToMenu();
});

// --- Match Found ---
function showMatchFound() {
  console.log('Match found!');
  showSection(duelOverlay);

  // For now, mock names
  player1NameElem.textContent = window.user ? window.user.username : 'You';
  player2NameElem.textContent = 'Opponent';

  duelWaiting.style.display = 'block';
  readyBtn.disabled = false;
  readyBtn.textContent = 'Ready';
}

// --- Ready Button ---
readyBtn.addEventListener('click', () => {
  console.log(`${window.user?.username || 'You'} is ready!`);
  readyBtn.disabled = true;
  readyBtn.textContent = 'Ready';
  socket.emit('player_ready', { mode: currentMode });
});

// --- Cancel Match ---
cancelMatchBtn.addEventListener('click', () => {
  console.log('Match cancelled');
  resetToMenu();
});

// --- Socket Events ---

// Opponent finishes
socket.on('opponent_finished', (data) => {
  console.log('Opponent finished:', data);
  opponentFinished = true;

  if (!playerFinished) {
    duelWaiting.textContent = `${data.username} finished. Waiting for you...`;
  } else {
    duelWaiting.textContent = 'Both players finished. Calculating result...';
  }
});

// Player finishes submission
socket.on('judge_result', (data) => {
  if (!data.isFinished) return;

  playerFinished = true;

  if (opponentFinished) {
    duelWaiting.textContent = 'Both players finished. Calculating result...';
    // Now the result page can be shown
    // e.g., save localStorage and redirect
    localStorage.setItem('latestMatchResult', JSON.stringify({
      mode: currentMode,
      player1: data.player_id === 1 ? data : null,
      player2: data.player_id === 2 ? data : null
    }));
    window.location.href = 'result.html';
  } else {
    duelWaiting.textContent = 'You finished. Waiting for opponent...';
  }
});

// Match found notification from server
socket.on('match_found', (data) => {
  console.log('Match found from server:', data);
  showMatchFound();
  if (data.player1) player1NameElem.textContent = data.player1;
  if (data.player2) player2NameElem.textContent = data.player2;
});

// Handle rematch
socket.on('rematch_error', (data) => {
  console.error(data.message);
});
