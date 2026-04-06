<!-- src/Duel.vue -->
<template>
  <!-- ══ LEFT: Main Duel Panel ══ -->
  <section class="duel-main-section">
    <Window>
      <template #title>
        <div class="duel-title-row">
          <div class="duel-title-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/></svg>
          </div>
          <span>DUEL CODING</span>
        </div>
      </template>

      <template #content>
        <!-- Matchmaking / Overlay Modal (untouched) -->
        <Modals
          modal_id="modal_match_id"
          :modal_title="searchingMode ? `Waiting for duel - ${searchingMode.charAt(0).toUpperCase() + searchingMode.slice(1)}` : 'Waiting for duel'"
          :close_btn_header_bool="!matchFound"
          :close_btn_footer_bool="false"
          :modal_footer_buttons="[]"
        >
          <template #content>
            <PlayerMatchLabel
              id="player-match-label"
              :imgSrc_player1="'/asset/general/profile-user.png'"
              :altText_player1="player1"
              img-src_center="'/asset/general/clock.png'"
              :imgSrc_player2="'/asset/general/profile-user.png'"
              :altText_player2="player2"
              :showNameBool="true"
            />

            <!-- Searching spinner shown while waiting for opponent -->
            <div v-if="!matchFound" class="searching-pulse">
              <div class="searching-ring"></div>
              <span class="searching-text">Finding opponent…</span>
            </div>

            <!-- Ready status chips shown after match found -->
            <div v-if="matchFound" class="ready-status">
              <div class="ready-row">
                <span class="ready-chip" :class="playerReady ? 'ready-chip--on' : 'ready-chip--off'">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline v-if="playerReady" points="20 6 9 17 4 12"/><circle v-else cx="12" cy="12" r="10"/></svg>
                  {{ playerReady ? 'You are ready' : 'Not ready yet' }}
                </span>
                <span class="ready-chip" :class="opponentReady ? 'ready-chip--on' : 'ready-chip--wait'">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline v-if="opponentReady" points="20 6 9 17 4 12"/><circle v-else cx="12" cy="12" r="10"/></svg>
                  {{ opponentReady ? 'Opponent ready' : 'Waiting for opponent…' }}
                </span>
              </div>
              <div class="ready-countdown" :class="readyCountdown <= 3 ? 'countdown-crit' : ''">
                {{ readyCountdown }}<span class="countdown-s">s</span>
              </div>
            </div>
          </template>
          <template #content_loading_footer>
            <MatchTimer :timer_color_fill_progress="String(timerProgress)" />
          </template>
          <template #modal_footer>
            <div v-if="matchFound" class="modal-action-row">
              <button v-if="!playerReady" class="duel-btn duel-btn--ready" @click="clickReady" :disabled="bothReady">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Ready
              </button>
              <button v-else class="duel-btn duel-btn--waiting" disabled>
                <span class="btn-spin">⟳</span> Waiting…
              </button>
              <button class="duel-btn duel-btn--exit" @click="clickExit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Exit
              </button>
            </div>
          </template>
        </Modals>

        <!-- ── Mode Cards ── -->
        <div class="mode-grid">
          <div class="mode-card mode-card--casual" @click="startMatch('casual')">
            <div class="mode-card-glow mode-card-glow--casual"></div>
            <div class="mode-card-inner">
              <img src="/asset/general/casual_logo.png" alt="Casual" class="mode-img" />
              <div class="mode-info">
                <span class="mode-badge mode-badge--casual">CASUAL</span>
                <p class="mode-desc">Practice with players for fun — no pressure</p>
              </div>
              <div class="mode-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </div>
          </div>

          <div class="mode-card mode-card--ranked" @click="startMatch('ranked')">
            <div class="mode-card-glow mode-card-glow--ranked"></div>
            <div class="mode-card-inner">
              <img src="/asset/general/ranked_logo.png" alt="Ranked" class="mode-img" />
              <div class="mode-info">
                <span class="mode-badge mode-badge--ranked">RANKED</span>
                <p class="mode-desc">Climb the leaderboard and earn duel points</p>
              </div>
              <div class="mode-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Stats ── -->
        <div class="stats-section">
          <div class="stats-label">YOUR STATISTICS</div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon stat-icon--rank">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <div class="stat-value">{{ userRanking }}</div>
              <div class="stat-label">Ranking</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon stat-icon--streak">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>
              </div>
              <div class="stat-value">{{ userWinStreaks }}</div>
              <div class="stat-label">Win Streak</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon stat-icon--winrate">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>
              </div>
              <div class="stat-value">{{ userWinRate }}</div>
              <div class="stat-label">Win Rate</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon stat-icon--points">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              </div>
              <div class="stat-value">{{ userDuelPoints }}</div>
              <div class="stat-label">Duel Points</div>
            </div>
          </div>
        </div>
      </template>
    </Window>
  </section>

  <!-- ══ RIGHT: Sidebar ══ -->
  <section class="duel-sidebar-section">
    <Window>
      <template #title>
        <div class="sidebar-title-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
          LEADERBOARD
        </div>
      </template>
      <template #content>
        <LeaderboardPreview :limit="5" :autoRefreshMs="10000" />
      </template>
    </Window>

    <Window>
      <template #title>
        <div class="sidebar-title-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          LOBBY
        </div>
      </template>
      <template #content>
        <div class="sidebar-links">
          <a href="/lobbies.html?create=1" class="sidebar-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create private match
          </a>
          <a href="/lobbies.html" class="sidebar-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Browse room list
          </a>
        </div>
      </template>
    </Window>

    <Window>
      <template #title>
        <div class="sidebar-title-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          YOUR QUESTIONS
        </div>
      </template>
      <template #content>
        <div class="sidebar-links">
          <a href="#" class="sidebar-link sidebar-link--accent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create new question
          </a>
        </div>
      </template>
    </Window>
  </section>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { getSocket } from './js/socket.js';

import Window from './components/window.vue';
import ButtonImage from './components/button-img.vue';
import ButtonText from './components/button-text.vue';
import ScoreLabel from './components/score-label.vue';
import PlayerMatchLabel from './components/player-match-label.vue';
import Modals from './components/modal.vue';
import MatchTimer from './components/match-timer.vue';
import LeaderboardPreview from './components/leaderboard-preview.vue';

export default {
  components: { Window, ButtonImage, ButtonText, ScoreLabel, PlayerMatchLabel, Modals, MatchTimer, LeaderboardPreview },
  setup() {
    const socket = getSocket();
    
    if (!socket) {
      console.error('[Duel] No socket available - no token found');
      // Only redirect if there's genuinely no token
      if (!localStorage.getItem('jwt_token')) {
        window.location.href = '/signin.html';
      } else {
        // Token exists but socket creation failed - show error
        console.error('[Duel] Token exists but socket creation failed');
        alert('Connection error. Please refresh the page.');
      }
      return {};
    }

    const searchingMode = ref(null);
    const player1 = ref("You");
    const player2 = ref("Opponent");
    const matchFound = ref(false);
    const playerReady = ref(false);
    const opponentReady = ref(false);
    const bothReady = ref(false);
    const timerProgress = ref(100);
    const readyCountdown = ref(10);
    const isSearching = ref(false);
    let readyTimer = null;

    // User statistics
    const userRanking = ref('N/A');
    const userWinStreaks = ref(0);
    const userWinRate = ref('0%');
    const userDuelPoints = ref(0);
    let statsRetryCount = 0;
    const MAX_STATS_RETRIES = 3;

    // Function to fetch user statistics
    function fetchUserStats() {
      // Get user ID from multiple sources with priority
      let userId = null;
      
      // 1. Try window.user first (set by auth.js)
      if (window.user) {
        userId = window.user.id || window.user.user_id;
        console.log('[Duel] Got userId from window.user:', userId);
      }
      
      // 2. Try socket.user (if socket authentication completed)
      if (!userId && socket?.user) {
        userId = socket.user.id || socket.user.user_id;
        console.log('[Duel] Got userId from socket.user:', userId);
      }
      
      // 3. Fallback to localStorage
      if (!userId) {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            userId = user.user_id || user.id;
            console.log('[Duel] Got userId from localStorage:', userId);
          }
        } catch (e) {
          console.error('[Duel] Error parsing user from localStorage:', e);
        }
      }
      
      // Only emit if we have a valid userId
      if (userId) {
        console.log('[Duel] Fetching stats for user_id:', userId);
        socket.emit('get_user_stats', { user_id: userId });
        statsRetryCount = 0; // Reset retry count on success
      } else {
        if (statsRetryCount < MAX_STATS_RETRIES) {
          statsRetryCount++;
          console.warn(`[Duel] No userId found, retry ${statsRetryCount}/${MAX_STATS_RETRIES} (waiting for auth.js)`);
          setTimeout(fetchUserStats, 1500); // Increased delay to 1.5s for auth to complete
        } else {
          console.error('[Duel] Failed to get userId after', MAX_STATS_RETRIES, 'retries');
          console.error('[Duel] Debug info:', {
            windowUser: window.user,
            socketUser: socket?.user,
            localStorageUser: localStorage.getItem('user'),
            token: localStorage.getItem('jwt_token')
          });
        }
      }
    }

    // Set up modal event listeners when component mounts
    onMounted(() => {
      // Fetch user statistics
      fetchUserStats();
      
      // OLD: init_duel_session listener removed - duel page doesn't need abandonment tracking
      // Abandonment only tracked on onboarding page where players solve problems
      
      socket.on('user_stats_data', (data) => {
        console.log('[Duel] User stats received:', data);
        if (!data.error) {
          userRanking.value = data.ranking === 'N/A' ? 'N/A' : `${data.ranking}${getOrdinalSuffix(data.ranking)}`;
          userWinStreaks.value = data.winStreaks;
          userWinRate.value = data.winRate;
          userDuelPoints.value = data.duelPoints.toLocaleString();
        }
      });
      
      const modalEl = document.getElementById("modal_match_id");
      if (modalEl) {
        // Listen for modal hide event (triggered by X, ESC, or backdrop click)
        modalEl.addEventListener('hide.bs.modal', (event) => {
          console.log('Modal closing, checking if should leave queue');
          // If we're searching or in a match, leave the queue
          if (isSearching.value || searchingMode.value) {
            console.log('Leaving queue due to modal close');
            socket.emit("leave_queue", { mode: searchingMode.value });
            // Reset state
            matchFound.value = false;
            playerReady.value = false;
            opponentReady.value = false;
            bothReady.value = false;
            readyCountdown.value = 10;
            if (readyTimer) clearInterval(readyTimer);
            searchingMode.value = null;
            isSearching.value = false;
          }
        });
      }

      // Check if user clicked "Play Again" from result page
      const playAgainMode = localStorage.getItem('play_again_mode');
      console.log('DUEL PAGE LOADED - play_again_mode from localStorage:', playAgainMode);
      
      if (playAgainMode) {
        console.log('Play Again detected, will auto-queue for mode:', playAgainMode);
        
        // Clear the flag first to avoid re-triggering
        localStorage.removeItem('play_again_mode');
        
        // Validate mode
        if (playAgainMode === 'casual' || playAgainMode === 'ranked') {
          console.log(`Auto-queuing for ${playAgainMode} mode from Play Again`);
          // Small delay to ensure DOM is ready and socket is connected
          setTimeout(() => {
            startMatch(playAgainMode);
          }, 300);
        } else {
          console.warn('Invalid play_again_mode:', playAgainMode);
        }
      }
      
      // ========================================
      // NOTE: Abandonment notifications handled by AbandonmentTracker module
      // This allows notifications to work across ALL pages (Duel, Onboarding, Result, etc.)
      // No need for duplicate listeners here
      // ========================================
    });

    // ------------------------
    // SOCKET.IO EVENT HANDLERS
    // ------------------------
    socket.on("match_found", (data) => {
      // Ignore if we're not actively searching (already closed modal/left queue)
      if (!isSearching.value) {
        console.log('Ignoring match_found - not actively searching');
        socket.emit("leave_queue", { mode: data.mode });
        return;
      }
      
      console.log('MATCH_FOUND received:', { mode: data.mode, searchingMode: searchingMode.value });
      
      player1.value = data.player1; 
      player2.value = data.player2;
      matchFound.value = true;
      playerReady.value = false;
      opponentReady.value = false;
      bothReady.value = false;
      readyCountdown.value = 10;
      isSearching.value = false; // Found match, no longer searching

      // Save current match info for onboarding - use server's mode!
      try {
        if (data.match_id) localStorage.setItem("currentMatchId", String(data.match_id));
        localStorage.setItem("opponentUsername", data.player2);
        localStorage.setItem("mode", data.mode);  // USE SERVER MODE, NOT searchingMode
        console.log('===== MATCH_FOUND STORED MODE =====');
        console.log('Stored mode from match_found:', data.mode);
        console.log('Verification - localStorage.getItem("mode"):', localStorage.getItem('mode'));
        console.log('====================================');
      } catch(e) { console.warn("localStorage error:", e); }

      openModal();
      startReadyTimer();
    });

    socket.on("waiting_for_opponent", (data) => {
      if (!isSearching.value) {
        console.log('Ignoring waiting_for_opponent - not actively searching');
        return; // Only open modal if user is actively searching
      }
      matchFound.value = false;
      player1.value = "You";
      player2.value = "Opponent";
      searchingMode.value = data.mode;
      openModal();
    });

    socket.on("opponent_ready", () => {
      opponentReady.value = true;
    });

    // Handle ban notification
    socket.on("matchmaking_banned", (data) => {
      console.log('[BAN] User is banned from matchmaking:', data);
      alert(data.message || 'You have been banned from matchmaking.');
      isSearching.value = false;
      searchingMode.value = null;
      closeModal();
    });

    // Handle abandonment penalty notification
    socket.on("abandonment_penalty", (data) => {
      console.log('[ABANDON] Received abandonment penalty:', data);
      showAbandonmentPenaltyNotice(data);
    });

    // Handle opponent abandonment notification
    socket.on("opponent_abandoned", (data) => {
      console.log('[ABANDON] Opponent abandoned:', data);
      showOpponentAbandonedNotification(data);
    });

    // ------------------------
    // SOCKET.IO EVENT HANDLERS
    // ------------------------
    socket.on("both_ready", (data) => {
      bothReady.value = true;

      console.log('BOTH_READY received:', data);

      // Store current match ID for onboarding - only if valid
      if (data?.match_id && !isNaN(data.match_id) && data.match_id > 0) {
        localStorage.setItem("currentMatchId", String(data.match_id));
        console.log('Stored match_id:', data.match_id);
      } else {
        console.warn('Invalid match_id received:', data?.match_id);
      }
      
      // Store match timer data
      if (data?.matchEndTime) {
        localStorage.setItem("matchEndTime", data.matchEndTime);
        console.log('Stored matchEndTime:', data.matchEndTime);
      }
      if (data?.matchDuration) {
        localStorage.setItem("matchDuration", String(data.matchDuration));
        console.log('Stored matchDuration:', data.matchDuration);
      }

      // Store mode - prioritize server mode
      if (data?.mode) {
        localStorage.setItem("mode", data.mode);
        console.log('===== BOTH_READY STORED MODE =====');
        console.log('Stored mode from both_ready:', data.mode);
        console.log('Verification - localStorage.getItem("mode"):', localStorage.getItem('mode'));
        console.log('====================================');
      } else if (searchingMode.value) {
        localStorage.setItem("mode", searchingMode.value);
        console.log('Stored mode from searchingMode (fallback):', searchingMode.value);
        console.log('WARNING: Using searchingMode fallback - server did not provide mode!');
      } else {
        console.error('CRITICAL ERROR: No mode available in both_ready! Defaulting to casual');
        localStorage.setItem("mode", "casual");
      }

      // Store player number (1/2) so onboarding can submit correctly
      if (data?.player_id && !isNaN(data.player_id)) {
        localStorage.setItem("playerNumber", String(data.player_id));
        console.log('Stored player_id:', data.player_id);
      }

      // CRITICAL FIX: Stop the ready countdown timer when both_ready is received
      // Players should proceed to game without penalty
      if (readyTimer) {
        clearInterval(readyTimer);
        readyTimer = null;
        console.log('[BOTH_READY] Stopped countdown timer - proceeding to game');
      }

      // Ensure window.user is set before redirecting
      if (!window.user && localStorage.getItem('user')) {
        window.user = JSON.parse(localStorage.getItem('user'));
      }

      // Redirect to onboarding after short delay
      setTimeout(() => window.location.href = "/onboarding.html", 300);
    });

    socket.on("opponent_cancelled", (data) => {
      matchFound.value = false;
      player1.value = "You";
      player2.value = "Opponent";
      playerReady.value = false;
      opponentReady.value = false;
      bothReady.value = false;
      readyCountdown.value = 10;
      if (readyTimer) clearInterval(readyTimer);
      searchingMode.value = null;
      isSearching.value = false;
      closeModal();
      // Don't auto-requeue - let user click mode button again
    });

    // ------------------------
    // METHODS
    // ------------------------
    async function startMatch(mode) {
      console.log('START_MATCH called with mode:', mode);
      if (matchFound.value) return; // Only block if in active match modal
      
      // Reset to default state for new search
      player1.value = "You";
      player2.value = "Opponent";
      matchFound.value = false;
      playerReady.value = false;
      opponentReady.value = false;
      bothReady.value = false;
      readyCountdown.value = 10;
      
      // Leave any old queue/pair before entering new one - wait for confirmation
      if (isSearching.value || searchingMode.value) {
        await new Promise((resolve) => {
          socket.emit("leave_queue", { mode: searchingMode.value || mode }, () => {
            console.log('Left previous queue');
            resolve();
          });
          // Fallback timeout in case callback doesn't arrive
          setTimeout(resolve, 100);
        });
      }
      
      isSearching.value = true;
      searchingMode.value = mode;

      // Get user info — window.user may not be set yet on LAN (auth verify still in flight)
      // Fall back to localStorage which is set immediately after signin
      let username = window.user?.username || null;
      let user_id = window.user?.id || window.user?.user_id || null;
      if (!username || !user_id) {
        try {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          username = username || stored.username || 'Player';
          user_id = user_id || stored.id || stored.user_id || null;
        } catch(e) {}
      }
      username = username || 'Player';
      console.log('Emitting queue_enter with mode:', mode, 'user_id:', user_id);
      socket.emit("queue_enter", { mode, username, user_id });
    }

    function clickReady() {
      playerReady.value = true;
      // Clear timer once ready is clicked
      if (readyTimer) clearInterval(readyTimer);
      socket.emit("player_ready", { mode: searchingMode.value });
    }

    function clickExit() {
      socket.emit("leave_queue", { mode: searchingMode.value });
      matchFound.value = false;
      playerReady.value = false;
      opponentReady.value = false;
      bothReady.value = false;
      readyCountdown.value = 10;
      if (readyTimer) clearInterval(readyTimer);
      searchingMode.value = null;
      isSearching.value = false;
      closeModal();
    }

    function startReadyTimer() {
      readyTimer = setInterval(() => {
        readyCountdown.value--;
        if (readyCountdown.value <= 0) {
          clearInterval(readyTimer);
          // Timeout: emit ready_timeout to server and close modal
          socket.emit("ready_timeout", { mode: searchingMode.value });
          matchFound.value = false;
          playerReady.value = false;
          opponentReady.value = false;
          bothReady.value = false;
          readyCountdown.value = 10;
          searchingMode.value = null;
          isSearching.value = false;
          closeModal();
          // Don't auto-requeue - let user click mode button again
        }
      }, 1000);
    }

    function openModal() {
      const modalEl = document.getElementById("modal_match_id");
      if (modalEl) {
        let modal = bootstrap.Modal.getInstance(modalEl);
        if (!modal) modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    }

    function closeModal() {
      const modalEl = document.getElementById("modal_match_id");
      if (modalEl) {
        let modal = bootstrap.Modal.getInstance(modalEl);
        if (!modal) modal = new bootstrap.Modal(modalEl);
        modal.hide();
      }
    }

    function showOpponentAbandonedNotification(data) {
      // Create modal overlay with backdrop blur
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        backdrop-filter: blur(10px) saturate(180%);
        animation: fadeIn 0.3s ease-out;
      `;
      
      // Create notification card with glass-morphism
      const card = document.createElement('div');
      card.style.cssText = `
        background: rgba(102, 126, 234, 0.85);
        background-image: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 40px;
        border-radius: 24px;
        box-shadow: 0 25px 70px rgba(102, 126, 234, 0.4), 0 10px 25px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        text-align: center;
        animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      `;
      
      // Add animation keyframes
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from {
            transform: translateY(-30px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Build content
      const title = document.createElement('h2');
      title.textContent = '🏆 Match Ended - Opponent Forfeited!';
      title.style.cssText = 'margin: 0 0 20px 0; font-size: 28px; font-weight: bold;';
      
      const message = document.createElement('p');
      message.textContent = data.message || 'Your opponent left the match.';
      message.style.cssText = 'margin: 0 0 15px 0; font-size: 18px; line-height: 1.6;';
      
      const details = document.createElement('div');
      details.style.cssText = 'margin: 20px 0; padding: 20px; background: rgba(255,255,255,0.2); border-radius: 10px;';
      
      let detailsHTML = '<p style="margin: 10px 0; font-size: 16px;">✨ <strong>You win by forfeit!</strong></p>';
      
      if (data.bonusDP > 0) {
        detailsHTML += `<p style="margin: 10px 0; font-size: 20px; color: #ffd700;">💰 <strong>+${data.bonusDP} Duel Points Bonus!</strong></p>`;
      }
      
      details.innerHTML = detailsHTML;
      
      const button = document.createElement('button');
      button.textContent = 'Awesome!';
      button.style.cssText = `
        padding: 12px 40px;
        margin-top: 20px;
        background: rgba(255, 255, 255, 0.95);
        color: #667eea;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      `;
      button.onmouseover = () => { 
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
      };
      button.onmouseout = () => { 
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      };
      button.onclick = () => {
        document.body.removeChild(overlay);
      };
      
      card.appendChild(title);
      card.appendChild(message);
      card.appendChild(details);
      card.appendChild(button);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
    }

    function showAbandonmentPenaltyNotice(data) {
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.65);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        backdrop-filter: blur(12px) saturate(180%);
        animation: fadeIn 0.3s ease-out;
      `;
      
      const card = document.createElement('div');
      card.style.cssText = `
        background: rgba(241, 39, 17, 0.9);
        background-image: linear-gradient(135deg, rgba(241, 39, 17, 0.95) 0%, rgba(245, 175, 25, 0.95) 100%);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 40px;
        border-radius: 24px;
        box-shadow: 0 25px 70px rgba(241, 39, 17, 0.4), 0 10px 25px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        text-align: center;
        animation: shakeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      `;
      
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shakeIn {
          0% { transform: scale(0.5) rotate(-5deg); opacity: 0; }
          50% { transform: scale(1.05) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      
      const title = document.createElement('h2');
      title.textContent = '⚠️ Match Abandonment Penalty';
      title.style.cssText = 'margin: 0 0 20px 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);';
      
      const message = document.createElement('p');
      message.textContent = data.message || 'You abandoned a match.';
      message.style.cssText = 'margin: 0 0 20px 0; font-size: 18px; line-height: 1.6;';
      
      const details = document.createElement('div');
      details.style.cssText = 'margin: 20px 0; padding: 20px; background: rgba(255,255,255,0.15); border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);';
      
      let detailsHTML = '';
      if (data.penaltyDP && data.penaltyDP < 0) {
        detailsHTML += `<p style="margin: 10px 0; font-size: 24px; color: #ffeb3b;"><strong>${data.penaltyDP} Duel Points</strong></p>`;
      }
      detailsHTML += `<p style="margin: 10px 0; font-size: 16px;">Abandonments: ${data.abandonCount}/3</p>`;
      
      if (data.isBanned) {
        detailsHTML += '<p style="margin: 15px 0; font-size: 20px; color: #ff5252;"><strong>🚫 YOU ARE NOW BANNED</strong></p>';
        detailsHTML += '<p style="margin: 10px 0; font-size: 14px;">You cannot join any matches until your ban is lifted.</p>';
      } else if (data.abandonCount === 2) {
        detailsHTML += '<p style="margin: 15px 0; font-size: 16px; color: #ffeb3b;"><strong>⚠️ Warning: One more abandonment will result in a BAN!</strong></p>';
      }
      
      details.innerHTML = detailsHTML;
      
      const button = document.createElement('button');
      button.textContent = data.isBanned ? 'I Understand' : 'Got It';
      button.style.cssText = `
        padding: 12px 40px;
        margin-top: 20px;
        background: rgba(255, 255, 255, 0.95);
        color: #f12711;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      `;
      button.onmouseover = () => { 
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
      };
      button.onmouseout = () => { 
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      };
      button.onclick = () => {
        document.body.removeChild(overlay);
      };
      
      card.appendChild(title);
      card.appendChild(message);
      card.appendChild(details);
      card.appendChild(button);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
    }

    // Helper function to get ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
    function getOrdinalSuffix(num) {
      if (num === 'N/A' || typeof num !== 'number') return '';
      const j = num % 10;
      const k = num % 100;
      if (j === 1 && k !== 11) return 'st';
      if (j === 2 && k !== 12) return 'nd';
      if (j === 3 && k !== 13) return 'rd';
      return 'th';
    }

    // Clean up intervals on unmount
    onBeforeUnmount(() => {
      if (leaderboardRefreshInterval) {
        clearInterval(leaderboardRefreshInterval);
        console.log('[Duel] Stopped leaderboard auto-refresh');
      }
      if (readyTimer) {
        clearInterval(readyTimer);
      }
      // Remove socket listeners
      socket.off('leaderboard_data');
      socket.off('user_stats_data');
    });

    return {
      searchingMode,
      player1,
      player2,
      matchFound,
      playerReady,
      opponentReady,
      bothReady,
      timerProgress,
      readyCountdown,
      startMatch,
      clickReady,
      clickExit,
      userRanking,
      userWinStreaks,
      userWinRate,
      userDuelPoints
    };
  }
};
</script>


<style scoped>
/* ══ Section layout ══ */
.duel-main-section    { display: flex; flex-direction: column; width: 100%; }
.duel-sidebar-section { display: flex; flex-direction: column; gap: 12px; width: 100%; }

/* ══ Title row ══ */
.duel-title-row {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.78rem; font-weight: 800; letter-spacing: 0.12em;
  color: rgba(255,255,255,0.7);
}
.duel-title-icon {
  display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border-radius: 6px;
  background: rgba(30,136,229,0.15); border: 1px solid rgba(30,136,229,0.25);
  color: #64b5f6; flex-shrink: 0;
}
.sidebar-title-row {
  display: flex; align-items: center; gap: 7px;
  font-size: 0.72rem; font-weight: 800; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.55);
}

/* ══ Ready status (inside modal) ══ */
.ready-status {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  margin-top: 16px;
}
.ready-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.ready-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: 20px;
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
}
.ready-chip--on   { background: rgba(76,175,80,0.15); color: #81c784; border: 1px solid rgba(76,175,80,0.3); }
.ready-chip--off  { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.1); }
.ready-chip--wait { background: rgba(255,152,0,0.1); color: #ffb74d; border: 1px solid rgba(255,152,0,0.25); }
.ready-countdown {
  font-size: 2.4rem; font-weight: 900; font-family: monospace;
  color: rgba(255,255,255,0.7); line-height: 1;
  transition: color 0.3s;
}
.ready-countdown.countdown-crit { color: #ef5350; animation: crit-pulse 0.7s ease-in-out infinite; }
.countdown-s { font-size: 1rem; opacity: 0.5; margin-left: 2px; }
@keyframes crit-pulse { 0%,100%{opacity:1}50%{opacity:0.6} }

/* ══ Modal action buttons ══ */
.modal-action-row { display: flex; gap: 10px; justify-content: center; padding: 4px 0; }
.duel-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 20px; border-radius: 8px; border: none;
  font-size: 0.82rem; font-weight: 700; letter-spacing: 0.04em;
  cursor: pointer; transition: transform 0.12s, filter 0.12s, box-shadow 0.12s;
}
.duel-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
.duel-btn:active { transform: translateY(0); }
.duel-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
.duel-btn--ready  {
  background: linear-gradient(135deg, #43a047, #2e7d32);
  color: #fff; box-shadow: 0 2px 12px rgba(67,160,71,0.35);
}
.duel-btn--waiting {
  background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.4);
  border: 1px solid rgba(255,255,255,0.1);
}
.duel-btn--exit {
  background: rgba(239,83,80,0.12); color: #ef9a9a;
  border: 1px solid rgba(239,83,80,0.25);
}
.btn-spin { display: inline-block; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ Mode cards ══ */
.mode-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  padding: 16px 0 4px;
}
.mode-card {
  position: relative; border-radius: 12px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(10,10,18,0.6);
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.mode-card:hover { transform: translateY(-3px); }
.mode-card--casual:hover { border-color: rgba(76,175,80,0.4); box-shadow: 0 8px 28px rgba(76,175,80,0.15); }
.mode-card--ranked:hover { border-color: rgba(255,152,0,0.4); box-shadow: 0 8px 28px rgba(255,152,0,0.15); }

.mode-card-glow {
  position: absolute; inset: 0; pointer-events: none; opacity: 0;
  transition: opacity 0.2s;
}
.mode-card:hover .mode-card-glow { opacity: 1; }
.mode-card-glow--casual { background: radial-gradient(ellipse at 20% 50%, rgba(76,175,80,0.12) 0%, transparent 70%); }
.mode-card-glow--ranked { background: radial-gradient(ellipse at 20% 50%, rgba(255,152,0,0.12) 0%, transparent 70%); }

.mode-card-inner {
  position: relative; display: flex; align-items: center; gap: 14px;
  padding: 16px;
}
.mode-img {
  width: 42px; height: 42px; object-fit: contain; flex-shrink: 0;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
}
.mode-info { flex: 1; min-width: 0; }
.mode-badge {
  display: inline-block;
  padding: 2px 9px; border-radius: 20px;
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.1em;
  margin-bottom: 5px;
}
.mode-badge--casual { background: rgba(76,175,80,0.15); color: #81c784; border: 1px solid rgba(76,175,80,0.3); }
.mode-badge--ranked { background: rgba(255,152,0,0.15); color: #ffb74d; border: 1px solid rgba(255,152,0,0.3); }
.mode-desc {
  font-size: 0.74rem; color: rgba(255,255,255,0.45); line-height: 1.4; margin: 0;
}
.mode-arrow {
  color: rgba(255,255,255,0.2); flex-shrink: 0;
  transition: color 0.15s, transform 0.15s;
}
.mode-card:hover .mode-arrow { color: rgba(255,255,255,0.6); transform: translateX(3px); }

/* ══ Stats ══ */
.stats-section { padding: 12px 0 4px; }
.stats-label {
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.12em;
  color: rgba(255,255,255,0.25); text-transform: uppercase;
  padding: 0 2px 10px; border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 12px;
}
.stats-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
}
.stat-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 14px 8px; border-radius: 10px;
  background: rgba(10,10,18,0.55);
  border: 1px solid rgba(255,255,255,0.07);
  transition: border-color 0.15s, background 0.15s;
}
.stat-card:hover { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); }
.stat-icon {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-icon--rank    { background: rgba(255,214,0,0.12); color: #ffd600; border: 1px solid rgba(255,214,0,0.2); }
.stat-icon--streak  { background: rgba(255,87,34,0.12); color: #ff7043; border: 1px solid rgba(255,87,34,0.2); }
.stat-icon--winrate { background: rgba(76,175,80,0.12); color: #81c784; border: 1px solid rgba(76,175,80,0.2); }
.stat-icon--points  { background: rgba(30,136,229,0.12); color: #64b5f6; border: 1px solid rgba(30,136,229,0.2); }
.stat-value {
  font-size: 1.1rem; font-weight: 800; font-family: monospace;
  color: rgba(255,255,255,0.88); line-height: 1;
}
.stat-label {
  font-size: 0.62rem; font-weight: 600; letter-spacing: 0.05em;
  color: rgba(255,255,255,0.3); text-transform: uppercase;
}

/* ══ Sidebar links ══ */
.sidebar-links { display: flex; flex-direction: column; gap: 6px; }
.sidebar-link {
  display: flex; align-items: center; gap: 9px;
  padding: 10px 13px; border-radius: 8px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.55); font-size: 0.82rem; font-weight: 600;
  text-decoration: none;
  transition: background 0.14s, border-color 0.14s, color 0.14s, transform 0.12s;
}
.sidebar-link:hover {
  background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.16);
  color: rgba(255,255,255,0.88); transform: translateX(3px);
}
.sidebar-link--accent {
  background: rgba(30,136,229,0.08); border-color: rgba(30,136,229,0.2);
  color: #64b5f6;
}
.sidebar-link--accent:hover {
  background: rgba(30,136,229,0.15); border-color: rgba(30,136,229,0.35);
  color: #90caf9;
}
</style>

<!-- Non-scoped: Bootstrap modal lives in <body>, outside Vue component scope -->
<style>
/* ══ Matchmaking Modal — Bootstrap overrides ══ */

/* Backdrop */
#modal_match_id ~ .modal-backdrop,
.modal-backdrop {
  background: rgba(0, 0, 0, 0.82) !important;
  backdrop-filter: blur(10px) !important;
}

/* Dialog sizing */
#modal_match_id .modal-dialog {
  max-width: 460px !important;
}

/* Card */
#modal_match_id .modal-content.custom-modal {
  background: linear-gradient(160deg, #0d0d1a 0%, #111122 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 18px !important;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255,255,255,0.04) inset !important;
  overflow: hidden !important;
  padding: 0 !important;
}

/* Top shimmer accent line */
#modal_match_id .modal-content.custom-modal::before {
  content: '';
  display: block;
  height: 3px;
  background: linear-gradient(90deg, #1565c0, #1e88e5, #42a5f5, #1e88e5, #1565c0);
  background-size: 200% 100%;
  animation: duel-modal-shimmer 2.5s linear infinite;
  flex-shrink: 0;
}
@keyframes duel-modal-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Header */
#modal_match_id .modal-header {
  background: rgba(0, 0, 0, 0.2) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  padding: 14px 20px !important;
}
#modal_match_id .modal-title {
  font-size: 0.72rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.12em !important;
  text-transform: uppercase !important;
  color: rgba(255, 255, 255, 0.55) !important;
}
#modal_match_id .btn-close {
  filter: invert(1) !important;
  opacity: 0.3 !important;
  transition: opacity 0.15s !important;
}
#modal_match_id .btn-close:hover {
  opacity: 0.8 !important;
}

/* Body */
#modal_match_id .modal-body {
  padding: 24px 24px 8px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  background: transparent !important;
  min-height: 180px !important;
  justify-content: center !important;
}

/* Footer */
#modal_match_id .modal-footer {
  background: rgba(0, 0, 0, 0.15) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
  padding: 14px 20px !important;
  justify-content: center !important;
  gap: 10px !important;
}

/* MatchTimer loading footer */
#modal_match_id .modal-footer-loading {
  padding: 0 !important;
  line-height: 0 !important;
}
#modal_match_id .modal-footer-loading > * {
  border-radius: 0 0 18px 18px !important;
  overflow: hidden !important;
  display: block !important;
}

/* ══ Searching animation ══ */
.searching-pulse {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 8px 0 16px;
}
.searching-ring {
  width: 56px; height: 56px;
  border-radius: 50%;
  border: 3px solid rgba(30, 136, 229, 0.15);
  border-top-color: #1e88e5;
  animation: duel-ring-spin 1s linear infinite;
  position: relative;
}
.searching-ring::after {
  content: '';
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  border: 2px solid rgba(30, 136, 229, 0.08);
  border-top-color: rgba(30, 136, 229, 0.4);
  animation: duel-ring-spin 1.5s linear infinite reverse;
}
@keyframes duel-ring-spin { to { transform: rotate(360deg); } }
.searching-text {
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.4); text-transform: uppercase;
  animation: duel-blink 1.6s ease-in-out infinite;
}
@keyframes duel-blink { 0%,100%{opacity:0.35} 50%{opacity:0.75} }

/* Ready status chips (inside modal slot) */
.ready-status {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  margin-top: 16px;
}
.ready-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.ready-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: 20px;
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
}
.ready-chip--on   { background: rgba(76,175,80,0.15); color: #81c784; border: 1px solid rgba(76,175,80,0.3); }
.ready-chip--off  { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.1); }
.ready-chip--wait { background: rgba(255,152,0,0.1); color: #ffb74d; border: 1px solid rgba(255,152,0,0.25); }
.ready-countdown {
  font-size: 2.4rem; font-weight: 900; font-family: monospace;
  color: rgba(255,255,255,0.7); line-height: 1;
}
.ready-countdown.countdown-crit { color: #ef5350; animation: duel-crit-pulse 0.7s ease-in-out infinite; }
.countdown-s { font-size: 1rem; opacity: 0.5; margin-left: 2px; }
@keyframes duel-crit-pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }

/* Modal action buttons */
.modal-action-row { display: flex; gap: 10px; justify-content: center; }
.duel-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 20px; border-radius: 8px; border: none;
  font-size: 0.82rem; font-weight: 700; letter-spacing: 0.04em;
  cursor: pointer; transition: transform 0.12s, filter 0.12s;
}
.duel-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
.duel-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.duel-btn--ready  { background: linear-gradient(135deg, #43a047, #2e7d32); color: #fff; box-shadow: 0 2px 12px rgba(67,160,71,0.35); }
.duel-btn--waiting { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.1); }
.duel-btn--exit   { background: rgba(239,83,80,0.12); color: #ef9a9a; border: 1px solid rgba(239,83,80,0.25); }
.btn-spin { display: inline-block; animation: duel-ring-spin 0.8s linear infinite; }
</style>
