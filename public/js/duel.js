import { getsocket } from './socket.js';
const socket = getsocket();

// Section references
const duelMenu = document.getElementById('duel-menu');
const duelQueue = document.getElementById('duel-queue');
const duelOverlay = document.getElementById('duel-overlay');

// Button references
const casualBtn = document.getElementById('casualMode');
const rankedBtn = document.getElementById('rankedMode');
const createLobbyBtn = document.getElementById('createLobby');
const cancelQueueBtn = document.getElementById('cancelQueueBtn');
const readyBtn = document.getElementById('readyBtn');
const cancelMatchBtn = document.getElementById('cancelMatchBtn');

// Current mode (for tracking)
let currentMode = null;
let matchFoundTimeout = null;


// Helper Functions
function showSection(section) {
  duelMenu.classList.add('hidden');
  duelQueue.classList.add('hidden');
  duelOverlay.classList.add('hidden');

  section.classList.remove('hidden');
}

function resetToMenu() {
  if (matchFoundTimeout) clearTimeout(matchFoundTimeout);
  currentMode = null;
  showSection(duelMenu);
}

// Mode Button Handlers
casualBtn.addEventListener('click', () => {
  currentMode = 'casual';
  startQueueing();
});

rankedBtn.addEventListener('click', () => {
  currentMode = 'ranked';
  startQueueing();
});

createLobbyBtn.addEventListener('click', () => {
  currentMode = 'lobby';
  console.log('Creating lobby (feature coming soon)');
  // Later: show lobby creation modal
});


// Queueing Logic
function startQueueing() {
  console.log(`Entered ${currentMode} queue`);
  showSection(duelQueue);

  // Simulate matchmaking for now
  matchFoundTimeout = setTimeout(() => {
    showMatchFound();
  }, 4000); // 4 seconds before "match found"
}

// Cancel queue
cancelQueueBtn.addEventListener('click', () => {
  console.log('Cancelled queue');
  resetToMenu();
});

// Match Found Logic
function showMatchFound() {
  console.log('Match found!');
  showSection(duelOverlay);

  // Update player names dynamically (for now mock)
  const playerElements = duelOverlay.querySelectorAll('.username');
  playerElements[0].textContent = window.user ? window.user.username : 'You';
  playerElements[1].textContent = 'Opponent';
}

// Ready button (temporary simulation)
readyBtn.addEventListener('click', () => {
  console.log(`${window.user?.username || 'You'} is ready!`);
  readyBtn.disabled = true;
  readyBtn.textContent = 'Ready';
});

// Cancel match
cancelMatchBtn.addEventListener('click', () => {
  console.log('Match cancelled');
  resetToMenu();
});
