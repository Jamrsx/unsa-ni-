<template>
  <div class="ob-timer">
    <div class="ob-timer-top">
      <i class="bi bi-alarm-fill ob-timer-icon"></i>
      <span class="ob-timer-time" :class="timeClass">{{ formattedTime }}</span>
      <span class="ob-timer-diff" :class="'diff--' + difficulty">{{ difficulty.toUpperCase() }}</span>
    </div>
    <div class="ob-timer-bar-bg">
      <div
        class="ob-timer-bar-fill"
        :style="{ width: barPercentage + '%', backgroundColor: barColor, transition: 'width 1s linear, background-color 0.5s' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { getSocket } from '../js/socket.js';

const socket = getSocket();

// ── Difficulty → duration mapping ────────────────────────────────────────────
const DIFFICULTY_MINUTES = { easy: 15, medium: 25, hard: 40 };

const difficulty = ref(localStorage.getItem('matchDifficulty') || 'medium');
const defaultMinutes = DIFFICULTY_MINUTES[difficulty.value] || 25;

const duration  = ref((parseInt(localStorage.getItem('matchDuration')) || defaultMinutes) * 60);
const remaining = ref(duration.value);
const matchEndTime   = ref(null);
const matchStartedAt = ref(null);
let timer = null;

// Expose elapsed time to Onboarding.vue submit
window.getOnboardingElapsedTime = () => {
  if (matchStartedAt.value) return Math.floor((Date.now() - matchStartedAt.value) / 1000);
  return duration.value - remaining.value;
};

const formattedTime = computed(() => {
  const m = Math.floor(remaining.value / 60);
  const s = remaining.value % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
});

const barPercentage = computed(() => (remaining.value / duration.value) * 100);

const barColor = computed(() => {
  const pct = remaining.value / duration.value;
  if (pct > 0.5) return '#4CAF50';
  if (pct > 0.25) return '#FFC107';
  return '#f44336';
});

const timeClass = computed(() => {
  const pct = remaining.value / duration.value;
  if (pct > 0.5) return 'time--green';
  if (pct > 0.25) return 'time--yellow';
  return 'time--red';
});

function startCountdown() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (matchEndTime.value) {
      remaining.value = Math.max(0, Math.ceil((matchEndTime.value.getTime() - Date.now()) / 1000));
    } else {
      remaining.value = Math.max(0, remaining.value - 1);
    }
    if (remaining.value <= 0) {
      clearInterval(timer);
      window.dispatchEvent(new Event('time-up'));
    }
  }, 1000);
}

onMounted(async () => {
  const storedEndTime  = localStorage.getItem('matchEndTime');
  const storedDuration = localStorage.getItem('matchDuration');
  const storedDiff     = localStorage.getItem('matchDifficulty');

  if (storedDiff) difficulty.value = storedDiff;

  if (storedEndTime) {
    // ✅ Reload-safe: restore from localStorage
    matchEndTime.value   = new Date(storedEndTime);
    const mins           = parseInt(storedDuration) || defaultMinutes;
    duration.value       = mins * 60;
    matchStartedAt.value = new Date(matchEndTime.value.getTime() - duration.value * 1000);
    remaining.value      = Math.max(0, Math.ceil((matchEndTime.value.getTime() - Date.now()) / 1000));
    console.log('[TIMER] Restored from localStorage, remaining:', remaining.value + 's');
  } else if (socket) {
    // First load — get from server
    const matchId = localStorage.getItem('currentMatchId') || localStorage.getItem('match_id');
    if (matchId) {
      socket.emit('get_match_timer', { match_id: matchId }, (res) => {
        if (res?.matchEndTime) {
          matchEndTime.value   = new Date(res.matchEndTime);
          const mins           = res.duration || defaultMinutes;
          duration.value       = mins * 60;
          matchStartedAt.value = new Date(res.startedAt);
          remaining.value      = Math.max(0, Math.ceil((matchEndTime.value.getTime() - Date.now()) / 1000));
          localStorage.setItem('matchEndTime', matchEndTime.value.toISOString());
          localStorage.setItem('matchDuration', String(mins));
          console.log('[TIMER] Got from server, remaining:', remaining.value + 's');
        } else {
          console.warn('[TIMER] No server timer, using difficulty default:', defaultMinutes + ' min');
        }
      });
    }
  }

  startCountdown();
});

onBeforeUnmount(() => { clearInterval(timer); });
</script>

<style scoped>
.ob-timer { display: flex; flex-direction: column; gap: 5px; }

.ob-timer-top {
  display: flex; align-items: center; gap: 6px;
}

.ob-timer-icon { font-size: 0.75rem; color: rgba(255,255,255,0.4); flex-shrink: 0; }

.ob-timer-time {
  font-family: monospace; font-size: 0.88rem; font-weight: 800; letter-spacing: 0.04em;
  transition: color 0.4s;
}
.time--green  { color: #81c784; }
.time--yellow { color: #ffb74d; }
.time--red    { color: #ef9a9a; animation: pulse-red 1s ease-in-out infinite; }
@keyframes pulse-red { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }

.ob-timer-diff {
  font-size: 0.52rem; font-weight: 800; letter-spacing: 0.1em;
  padding: 2px 6px; border-radius: 6px; text-transform: uppercase;
  margin-left: auto; flex-shrink: 0;
}
.diff--easy   { background: rgba(76,175,80,0.15);  color: #81c784; border: 1px solid rgba(76,175,80,0.3); }
.diff--medium { background: rgba(255,193,7,0.12);  color: #ffca28; border: 1px solid rgba(255,193,7,0.3); }
.diff--hard   { background: rgba(229,57,53,0.12);  color: #ef9a9a; border: 1px solid rgba(229,57,53,0.3); }

.ob-timer-bar-bg {
  width: 100%; height: 4px; border-radius: 2px;
  background: rgba(255,255,255,0.08); overflow: hidden;
}
.ob-timer-bar-fill { height: 100%; border-radius: 2px; }
</style>
