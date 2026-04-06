<template>
  <Teleport to="body">
    <div v-if="enabled" class="mp-root" :class="expanded ? 'mp-root--expanded' : ''">

      <!-- Visualizer bars -->
      <div class="mp-viz" :class="playing ? 'mp-viz--active' : ''">
        <span v-for="i in 5" :key="i" class="mp-bar" :style="`--i:${i}`"></span>
      </div>

      <!-- Toggle expand -->
      <button class="mp-toggle" @click="expanded = !expanded" :title="expanded ? 'Collapse' : 'Expand player'">
        <svg v-if="!expanded" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
      </button>

      <!-- Expanded panel -->
      <div v-if="expanded" class="mp-panel">
        <div class="mp-track-info">
          <div class="mp-disc" :class="playing ? 'mp-disc--spinning' : ''">🎵</div>
          <div class="mp-meta">
            <div class="mp-track-name">{{ currentTrackRef.name }}</div>
            <div class="mp-track-genre">Lofi · Jazz · Focus</div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mp-progress-wrap" @click="seek">
          <div class="mp-progress-bg">
            <div class="mp-progress-fill" :style="`width:${progressVal}%`"></div>
          </div>
          <div class="mp-times">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <!-- Controls -->
        <div class="mp-controls">
          <button class="mp-btn" @click="prevTrack" title="Previous">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </button>
          <button class="mp-btn mp-btn--play" @click="togglePlay">
            <svg v-if="!playing" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          </button>
          <button class="mp-btn" @click="nextTrack" title="Next">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/></svg>
          </button>
        </div>

        <!-- Volume -->
        <div class="mp-volume-row">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path v-if="volume > 0" d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          <input class="mp-volume" type="range" min="0" max="1" step="0.01" v-model="volume" @input="setVolume" />
          <span class="mp-vol-pct">{{ Math.round(volume * 100) }}%</span>
        </div>

        <!-- Turn off -->
        <button class="mp-off-btn" @click="turnOff">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Turn off music
        </button>
      </div>

      <audio ref="audioEl" @timeupdate="onTimeUpdate" @ended="nextTrack" @loadedmetadata="onMeta" preload="none"></audio>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

// ── Tracks ──────────────────────────────────────────────────────────────────
// Free lofi/jazz tracks — hosted on archive.org (no CORS, public domain)
const TRACKS = [
  {
    name: 'Midnight Lofi',
    url: 'https://archive.org/download/lofi-jazz-playlist/01_lofi_jazz_1.mp3'
  },
  {
    name: 'Late Night Keys',
    url: 'https://archive.org/download/lofi-jazz-playlist/02_lofi_jazz_2.mp3'
  },
  {
    name: 'Rain & Coffee',
    url: 'https://archive.org/download/lofi-jazz-playlist/03_lofi_jazz_3.mp3'
  },
]

// ── State ────────────────────────────────────────────────────────────────────
const enabled      = ref(false)
const expanded     = ref(false)
const playing      = ref(false)
const trackIndex   = ref(0)
const volume       = ref(0.5)
const currentTime  = ref(0)
const duration     = ref(0)
const audioEl      = ref(null)



// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  const saved = localStorage.getItem('music_enabled')
  if (saved === 'true') {
    enabled.value = true
    // Don't autoplay — user must click play
  }

  const savedVol = parseFloat(localStorage.getItem('music_volume') || '0.5')
  volume.value = isNaN(savedVol) ? 0.5 : savedVol

  // Listen for settings changes from other components
  window.addEventListener('music-setting-changed', onSettingChanged)
})

onBeforeUnmount(() => {
  window.removeEventListener('music-setting-changed', onSettingChanged)
  if (audioEl.value) audioEl.value.pause()
})

function onSettingChanged(e) {
  if (e.detail?.enabled !== undefined) {
    enabled.value = e.detail.enabled
    if (!enabled.value) {
      playing.value = false
      if (audioEl.value) audioEl.value.pause()
    }
  }
}

// ── Controls ─────────────────────────────────────────────────────────────────
function loadTrack() {
  if (!audioEl.value) return
  audioEl.value.src = TRACKS[trackIndex.value].url
  audioEl.value.volume = volume.value
  if (playing.value) audioEl.value.play().catch(() => {})
}

function togglePlay() {
  if (!audioEl.value) return
  if (!audioEl.value.src || audioEl.value.src === window.location.href) {
    loadTrack()
    playing.value = true
    return
  }
  if (playing.value) {
    audioEl.value.pause()
    playing.value = false
  } else {
    audioEl.value.play().catch(() => {})
    playing.value = true
  }
}

function nextTrack() {
  trackIndex.value = (trackIndex.value + 1) % TRACKS.length
  loadTrack()
  playing.value = true
}

function prevTrack() {
  trackIndex.value = (trackIndex.value - 1 + TRACKS.length) % TRACKS.length
  loadTrack()
  playing.value = true
}

function setVolume() {
  if (audioEl.value) audioEl.value.volume = volume.value
  localStorage.setItem('music_volume', volume.value)
}

function onTimeUpdate() {
  if (!audioEl.value) return
  currentTime.value = audioEl.value.currentTime
  duration.value    = audioEl.value.duration || 0
}

function onMeta() {
  duration.value = audioEl.value?.duration || 0
}

const progress = computed => duration.value > 0
  ? (currentTime.value / duration.value) * 100 : 0

function seek(e) {
  if (!audioEl.value || !duration.value) return
  const rect = e.currentTarget.querySelector('.mp-progress-bg').getBoundingClientRect()
  const pct  = (e.clientX - rect.left) / rect.width
  audioEl.value.currentTime = pct * duration.value
}

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

function turnOff() {
  enabled.value  = false
  expanded.value = false
  playing.value  = false
  if (audioEl.value) audioEl.value.pause()
  localStorage.setItem('music_enabled', 'false')
  window.dispatchEvent(new CustomEvent('music-setting-changed', { detail: { enabled: false } }))
}

// expose computed as plain refs for template
import { computed } from 'vue'
const progressVal    = computed(() => duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0)
const currentTrackRef = computed(() => TRACKS[trackIndex.value])
</script>

<style scoped>
.mp-root {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
  pointer-events: none;
}
.mp-root > * { pointer-events: all; }

/* Visualizer */
.mp-viz {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 20px;
  margin-bottom: 6px;
  opacity: 0.5;
}
.mp-bar {
  width: 3px;
  border-radius: 2px;
  background: #64b5f6;
  height: 4px;
  transition: height 0.1s;
}
.mp-viz--active .mp-bar {
  animation: bar-dance 0.8s ease-in-out infinite alternate;
  animation-delay: calc(var(--i) * 0.12s);
}
@keyframes bar-dance {
  0%   { height: 4px; }
  100% { height: 16px; }
}

/* Toggle button */
.mp-toggle {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 1px solid rgba(100,181,246,0.3);
  color: #64b5f6;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(100,181,246,0.15);
  transition: transform 0.15s, box-shadow 0.15s;
}
.mp-toggle:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 24px rgba(0,0,0,0.6), 0 0 16px rgba(100,181,246,0.3);
}

/* Panel */
.mp-panel {
  margin-top: 8px;
  background: rgba(12,12,24,0.96);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 16px;
  width: 240px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.6);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Track info */
.mp-track-info { display: flex; align-items: center; gap: 10px; }
.mp-disc {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}
.mp-disc--spinning { animation: disc-spin 4s linear infinite; }
@keyframes disc-spin { to { transform: rotate(360deg); } }
.mp-meta { min-width: 0; }
.mp-track-name { font-size: 0.78rem; font-weight: 700; color: rgba(255,255,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-track-genre { font-size: 0.62rem; color: rgba(255,255,255,0.3); margin-top: 2px; letter-spacing: 0.04em; }

/* Progress */
.mp-progress-wrap { cursor: pointer; }
.mp-progress-bg { height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; position: relative; overflow: hidden; }
.mp-progress-fill { height: 100%; background: linear-gradient(90deg, #1e88e5, #64b5f6); border-radius: 2px; transition: width 0.3s linear; }
.mp-times { display: flex; justify-content: space-between; font-size: 0.6rem; color: rgba(255,255,255,0.25); margin-top: 4px; font-family: monospace; }

/* Controls */
.mp-controls { display: flex; align-items: center; justify-content: center; gap: 10px; }
.mp-btn {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.12s;
}
.mp-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
.mp-btn--play {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #1e88e5, #1565c0);
  border-color: transparent; color: #fff;
  box-shadow: 0 2px 12px rgba(30,136,229,0.4);
}
.mp-btn--play:hover { filter: brightness(1.1); transform: scale(1.05); }

/* Volume */
.mp-volume-row { display: flex; align-items: center; gap: 8px; }
.mp-volume {
  flex: 1; height: 3px;
  -webkit-appearance: none; appearance: none;
  background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;
}
.mp-volume::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 10px; height: 10px; border-radius: 50%;
  background: #64b5f6; cursor: pointer;
}
.mp-vol-pct { font-size: 0.6rem; color: rgba(255,255,255,0.25); font-family: monospace; min-width: 28px; text-align: right; }

/* Turn off */
.mp-off-btn {
  display: flex; align-items: center; justify-content: center; gap: 5px;
  padding: 6px; border-radius: 7px;
  background: none; border: 1px solid rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.25); font-size: 0.65rem; font-weight: 600;
  cursor: pointer; letter-spacing: 0.04em; transition: all 0.15s;
}
.mp-off-btn:hover { border-color: rgba(229,57,53,0.3); color: #ef9a9a; background: rgba(229,57,53,0.06); }
</style>
