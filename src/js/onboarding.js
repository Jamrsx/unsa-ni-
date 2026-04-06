// Dynamically resolve server URL
const SERVER_URL = (() => {
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3000';
  return 'http://' + h + ':3000';
})();

import { getSocket } from './socket.js';
const socket = getSocket();

// ── Get match context from localStorage ──────────────────────────────────────
const matchId = localStorage.getItem('currentMatchId') || localStorage.getItem('match_id');
const matchProblemId = localStorage.getItem('matchProblemId'); // Set by both_ready in Duel.vue
const cachedKey = matchId ? 'onboarding_question_' + matchId : null;

// ── Restore cached question on reload ────────────────────────────────────────
// Only use cache if we don't have a fresh matchProblemId from both_ready.
// A fresh matchProblemId means this is a new match — always fetch from server
// to guarantee the correct problem is shown.
if (cachedKey && !matchProblemId) {
  const cached = localStorage.getItem(cachedKey);
  if (cached) {
    try {
      const question = JSON.parse(cached);
      console.log('[Onboarding] Restoring cached question for match', matchId, ':', question.title);
      window.dispatchEvent(new CustomEvent('onboarding-data', { detail: question }));
    } catch (e) {
      console.warn('[Onboarding] Failed to parse cached question, re-fetching');
      localStorage.removeItem(cachedKey);
      socket.emit('get_onboarding_question', { match_id: matchId, problem_id: matchProblemId });
    }
  } else {
    // No cached question — request from server
    console.log('[Onboarding] No cached question, requesting from server for match', matchId);
    socket.emit('get_onboarding_question', { match_id: matchId });
  }
} else {
  // Fresh match (matchProblemId set by both_ready) — always fetch from server
  // so the correct assigned problem is loaded, not a random one
  console.log('[Onboarding] Fresh match detected, requesting correct problem from server. match_id:', matchId, 'problem_id:', matchProblemId);
  // Clear matchProblemId so reloads use the cache instead
  localStorage.removeItem('matchProblemId');
  socket.emit('get_onboarding_question', { match_id: matchId, problem_id: matchProblemId });
}

// Listen for server response
socket.on('onboarding_question_data', (data) => {
  if (!data.success) {
    console.error('Failed to load onboarding question:', data.message);
    return;
  }

  console.log('[Onboarding] Question received from server:', data.question?.title);

  // Cache it so reloads don't re-fetch
  if (cachedKey && data.question) {
    try {
      localStorage.setItem(cachedKey, JSON.stringify(data.question));
      console.log('[Onboarding] Question cached for match', matchId);
    } catch (e) {
      console.warn('[Onboarding] Failed to cache question:', e);
    }
  }

  window.dispatchEvent(new CustomEvent('onboarding-data', { detail: data.question }));
});
