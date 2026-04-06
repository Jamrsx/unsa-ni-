<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getSocket } from './js/socket.js'

const API_URL = import.meta.env.VITE_API_URL || ''

const liveStats = ref({ activeDuels: 0, totalDuels: 0, registeredUsers: 0, problemsSolved: 0 })
const leaderboard = ref([])
const leaderboardLoading = ref(true)
const isLoggedIn = ref(!!localStorage.getItem('jwt_token'))

const SNIPPETS = [
  'def two_sum(nums, target):',
  'function binarySearch(arr, x) {',
  'class Solution { public int[] ',
  'SELECT rank() OVER (ORDER BY ',
  'for i in range(len(grid)):',
]
const typedText = ref('')
const snippetIdx = ref(0)
const charIdx = ref(0)
const isDeleting = ref(false)
let typeTimer = null

function typeStep() {
  const current = SNIPPETS[snippetIdx.value]
  if (!isDeleting.value) {
    typedText.value = current.slice(0, charIdx.value + 1)
    charIdx.value++
    if (charIdx.value === current.length) {
      isDeleting.value = true; typeTimer = setTimeout(typeStep, 1800); return
    }
  } else {
    typedText.value = current.slice(0, charIdx.value - 1)
    charIdx.value--
    if (charIdx.value === 0) {
      isDeleting.value = false
      snippetIdx.value = (snippetIdx.value + 1) % SNIPPETS.length
      typeTimer = setTimeout(typeStep, 400); return
    }
  }
  typeTimer = setTimeout(typeStep, isDeleting.value ? 40 : 72)
}

const canvasRef = ref(null)
let animFrame = null, particles = []

function initCanvas() {
  const c = canvasRef.value; if (!c) return
  c.width = c.offsetWidth; c.height = c.offsetHeight
  particles = Array.from({ length: 50 }, () => ({
    x: Math.random() * c.width, y: Math.random() * c.height,
    vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.4 + 0.4, a: Math.random() * 0.3 + 0.08,
  }))
}

function drawCanvas() {
  const c = canvasRef.value; if (!c) return
  const ctx = c.getContext('2d')
  ctx.clearRect(0, 0, c.width, c.height)
  for (let i = 0; i < particles.length; i++)
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < 120) {
        ctx.beginPath(); ctx.strokeStyle = `rgba(96,165,250,${0.05 * (1 - d / 120)})`
        ctx.lineWidth = 0.5; ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke()
      }
    }
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy
    if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0
    if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(96,165,250,${p.a})`; ctx.fill()
  })
  animFrame = requestAnimationFrame(drawCanvas)
}

async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options)
    if (!res.ok) {
      console.warn(`[Home] ${url} → HTTP ${res.status} ${res.statusText}`)
      return null
    }
    return await res.json()
  } catch (e) {
    console.warn(`[Home] ${url} → network error:`, e.message)
    return null
  }
}

// ── Leaderboard via socket (same as leaderboard-preview.vue) ──
let leaderboardRefreshInterval = null

function fetchLeaderboard() {
  const socket = getSocket()
  if (!socket) return
  socket.emit('get_leaderboard', { limit: 5 })
}

function initLeaderboard() {
  const socket = getSocket()
  if (!socket) { leaderboardLoading.value = false; return }

  socket.on('leaderboard_data', (data) => {
    leaderboard.value = Array.isArray(data) ? data : (data?.players ?? [])
    leaderboardLoading.value = false
  })

  function startFetching() {
    fetchLeaderboard()
    leaderboardRefreshInterval = setInterval(fetchLeaderboard, 30000)
  }

  if (socket.connected && socket.user) {
    startFetching()
  } else {
    socket.once('authenticated', () => startFetching())
    setTimeout(() => { if (leaderboardLoading.value) fetchLeaderboard() }, 1500)
  }
}

async function fetchHomeData() {
  const token = localStorage.getItem('jwt_token')
  const h = token ? { Authorization: `Bearer ${token}` } : {}

  const stats = await safeFetch(`${API_URL}/api/stats/global`, { headers: h })

  if (stats) liveStats.value = {
    activeDuels:     stats.activeDuels     ?? stats.active_duels    ?? 0,
    totalDuels:      stats.totalDuels      ?? stats.total_duels     ?? 0,
    registeredUsers: stats.registeredUsers ?? stats.total_users     ?? 0,
    problemsSolved:  stats.problemsSolved  ?? stats.problems_solved ?? 0,
  }
}

const RANKS = [
  { min: 0,    label: 'Bronze',   color: '#cd7f32', icon: '🥉' },
  { min: 500,  label: 'Silver',   color: '#c0c0c0', icon: '🥈' },
  { min: 1000, label: 'Gold',     color: '#ffd700', icon: '🥇' },
  { min: 2000, label: 'Platinum', color: '#40e0d0', icon: '💠' },
  { min: 3500, label: 'Diamond',  color: '#88cfff', icon: '💎' },
  { min: 5000, label: 'Legend',   color: '#ff6b35', icon: '👑' },
]
function getRank(dp) { return [...RANKS].reverse().find(r => dp >= r.min) || RANKS[0] }
function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(n)
}

onMounted(() => {
  typeTimer = setTimeout(typeStep, 600)
  initCanvas(); drawCanvas(); fetchHomeData(); initLeaderboard()
  window.addEventListener('resize', initCanvas)
})
onBeforeUnmount(() => {
  clearTimeout(typeTimer); cancelAnimationFrame(animFrame)
  window.removeEventListener('resize', initCanvas)
  if (leaderboardRefreshInterval) clearInterval(leaderboardRefreshInterval)
  const socket = getSocket()
  try { if (socket) socket.off('leaderboard_data') } catch (e) {}
})
</script>

<template>
<div class="home">

  <!-- ══ HERO ══ -->
  <section class="hero">
    <canvas ref="canvasRef" class="hero-canvas"></canvas>
    <div class="hero-grid"></div>
    <div class="glow glow--blue"></div>
    <div class="glow glow--red"></div>

    <div class="hero-inner">
      <div class="eyebrow">
        <span class="pip"></span> Competitive Coding Arena <span class="pip"></span>
      </div>

      <h1 class="hero-title">
        Code.<br>
        <span class="accent">Duel.</span><br>
        Dominate.
      </h1>

      <p class="hero-sub">
        Real-time 1v1 coding battles. Outsmart opponents on live judge problems.
        Climb the ranked ladder. Prove your skills.
      </p>

      <div class="terminal">
        <div class="t-bar">
          <span class="t-dot t-dot--r"></span>
          <span class="t-dot t-dot--y"></span>
          <span class="t-dot t-dot--g"></span>
          <span class="t-label">solution.py · LIVE JUDGE</span>
          <span class="t-live">● BATTLE ACTIVE</span>
        </div>
        <div class="t-body">
          <span class="t-prompt">❯ </span><span class="t-code">{{ typedText }}</span><span class="t-cursor">█</span>
        </div>
      </div>

      <div class="hero-btns">
        <a v-if="isLoggedIn" href="/duel.html" class="btn btn--primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Find a Match
        </a>
        <a v-else href="/signup.html" class="btn btn--primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Start for Free
        </a>
        <a href="/leaderboard.html" class="btn btn--ghost">View Rankings</a>
      </div>
    </div>
  </section>

  <!-- ══ STATS ══ -->
  <div class="stats-strip">
    <div class="stats-wrap">
      <div class="stat">
        <span class="stat-pulse"></span>
        <span class="stat-n">{{ fmt(liveStats.activeDuels) }}</span>
        <span class="stat-l">Live Duels</span>
      </div>
      <div class="stat-div"></div>
      <div class="stat">
        <span class="stat-n">{{ fmt(liveStats.totalDuels) }}</span>
        <span class="stat-l">Total Matches</span>
      </div>
      <div class="stat-div"></div>
      <div class="stat">
        <span class="stat-n">{{ fmt(liveStats.registeredUsers) }}</span>
        <span class="stat-l">Coders</span>
      </div>
      <div class="stat-div"></div>
      <div class="stat">
        <span class="stat-n">{{ fmt(liveStats.problemsSolved) }}</span>
        <span class="stat-l">Problems Solved</span>
      </div>
    </div>
  </div>

  <!-- ══ GAME MODES ══ -->
  <section class="sec sec--dark">
    <div class="wrap">
      <div class="sec-head">
        <p class="sec-tag">GAME MODES</p>
        <h2 class="sec-title">Pick Your Battle</h2>
        <p class="sec-sub">Four ways to compete, practice, and climb the ranks.</p>
      </div>
      <div class="modes-grid">

        <a href="/duel.html" class="card card--blue">
          <div class="card-glow"></div>
          <div class="card-icon">⚔️</div>
          <span class="card-badge" style="--bc:rgba(96,165,250,.15);--bbc:rgba(96,165,250,.3);--btc:#93c5fd">CASUAL</span>
          <h3 class="card-title">Quick Duel</h3>
          <p class="card-desc">Jump into a 1v1 match instantly. No rank at stake — pure coding competition.</p>
          <ul class="card-list">
            <li>No rank penalty</li>
            <li>Random matchmaking</li>
            <li>All difficulties</li>
          </ul>
          <span class="card-cta" style="--cc:#93c5fd">Play now →</span>
        </a>

        <a href="/duel.html" class="card card--gold">
          <div class="card-glow"></div>
          <div class="card-icon">🏆</div>
          <span class="card-badge" style="--bc:rgba(252,211,77,.12);--bbc:rgba(252,211,77,.3);--btc:#fcd34d">RANKED</span>
          <h3 class="card-title">Ranked Duel</h3>
          <p class="card-desc">Your rank is on the line. Win to earn Duel Points and climb toward Legend.</p>
          <ul class="card-list">
            <li>Duel Points at stake</li>
            <li>Skill-based matchmaking</li>
            <li>Season leaderboard</li>
          </ul>
          <span class="card-cta" style="--cc:#fcd34d">Compete →</span>
        </a>

        <a href="/lobbies.html" class="card card--purple">
          <div class="card-glow"></div>
          <div class="card-new">NEW</div>
          <div class="card-icon">🎮</div>
          <span class="card-badge" style="--bc:rgba(192,132,252,.15);--bbc:rgba(192,132,252,.35);--btc:#d8b4fe">LOBBY</span>
          <h3 class="card-title">Private Lobby</h3>
          <p class="card-desc">Create a private room and invite friends with a code. Custom rules and time limits.</p>
          <ul class="card-list">
            <li>Invite via room code</li>
            <li>Custom settings</li>
            <li>Up to 8 spectators</li>
          </ul>
          <span class="card-cta" style="--cc:#d8b4fe">Create room →</span>
        </a>

        <a href="/solo.html" class="card card--green">
          <div class="card-glow"></div>
          <div class="card-icon">🧠</div>
          <span class="card-badge" style="--bc:rgba(74,222,128,.1);--bbc:rgba(74,222,128,.28);--btc:#86efac">SOLO</span>
          <h3 class="card-title">Solo Practice</h3>
          <p class="card-desc">Sharpen your skills alone. Browse the full problem library at your own pace.</p>
          <ul class="card-list">
            <li>Full problem library</li>
            <li>No time pressure</li>
            <li>Track your progress</li>
          </ul>
          <span class="card-cta" style="--cc:#86efac">Practice →</span>
        </a>

      </div>
    </div>
  </section>

  <!-- ══ RANK LADDER ══ -->
  <section class="sec">
    <div class="wrap">
      <div class="sec-head">
        <p class="sec-tag">PROGRESSION</p>
        <h2 class="sec-title">The Rank Ladder</h2>
        <p class="sec-sub">Win ranked duels to earn DP and climb to the top.</p>
      </div>
      <div class="ranks">
        <div v-for="rank in RANKS" :key="rank.label" class="rank-chip" :style="`--rc:${rank.color}`">
          <span class="rc-icon">{{ rank.icon }}</span>
          <span class="rc-label">{{ rank.label }}</span>
          <span class="rc-dp">{{ rank.min }}{{ rank.min === 5000 ? '+' : '' }} DP</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ══ LEADERBOARD ══ -->
  <section class="sec sec--dark">
    <div class="wrap">

        <div class="panel">
          <div class="panel-hd">
            <span class="panel-hd-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Top Players
            </span>
            <a href="/leaderboard.html" class="panel-link">See all →</a>
          </div>
          <div class="panel-body">
            <div v-if="leaderboardLoading" class="panel-empty">Loading rankings…</div>
            <div v-else-if="!leaderboard.length" class="panel-empty">No players yet.</div>
            <div v-for="(p, i) in leaderboard" :key="p.user_id || p.id || i" class="lb-row">
              <div class="lb-pos" :class="`lb-pos--${i + 1}`">
                {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${p.rank_number || i + 1}` }}
              </div>
              <div class="lb-av">
                <img v-if="p.avatar_url" :src="p.avatar_url" :alt="p.username" />
                <span v-else>{{ (p.username || '?')[0].toUpperCase() }}</span>
              </div>
              <div class="lb-info">
                <div class="lb-name">{{ p.username }}</div>
                <div class="lb-bar">
                  <div class="lb-fill" :style="`width:${Math.min(100,(p.statistic_duel_point||0)/60)}%;background:${getRank(p.statistic_duel_point||0).color}`"></div>
                </div>
              </div>
              <div class="lb-dp">
                <span class="lb-dp-n" :style="`color:${getRank(p.statistic_duel_point||0).color}`">{{ fmt(p.statistic_duel_point || 0) }}</span>
                <span class="lb-dp-u">DP</span>
              </div>
            </div>
          </div>
        </div>

    </div>
  </section>

  <!-- ══ HOW IT WORKS ══ -->
  <section class="sec">
    <div class="wrap">
      <div class="sec-head">
        <p class="sec-tag">HOW IT WORKS</p>
        <h2 class="sec-title">Three Steps to Glory</h2>
      </div>
      <div class="steps">
        <div class="step">
          <div class="step-n">01</div>
          <div class="step-ico">🔍</div>
          <h3 class="step-title">Queue Up</h3>
          <p class="step-desc">Choose your mode, pick your language, and enter matchmaking. Get paired in seconds.</p>
        </div>
        <div class="step-arr">→</div>
        <div class="step">
          <div class="step-n">02</div>
          <div class="step-ico">⌨️</div>
          <h3 class="step-title">Solve &amp; Submit</h3>
          <p class="step-desc">Write your solution in the live editor and submit before the timer ends. Instant judging.</p>
        </div>
        <div class="step-arr">→</div>
        <div class="step">
          <div class="step-n">03</div>
          <div class="step-ico">📈</div>
          <h3 class="step-title">Earn &amp; Climb</h3>
          <p class="step-desc">Win to earn Duel Points. Watch your rank climb the ladder toward Legend tier.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ══ FINAL CTA ══ -->
  <section class="cta-sec">
    <div class="cta-glow"></div>
    <div class="cta-inner">
      <p class="cta-tag">READY?</p>
      <h2 class="cta-title">Enter the Arena</h2>
      <p class="cta-sub">Join thousands of developers competing in real-time coding duels.</p>
      <div class="cta-btns">
        <a v-if="!isLoggedIn" href="/signup.html" class="btn btn--primary btn--lg">Create Account — It's Free</a>
        <a v-else href="/duel.html" class="btn btn--primary btn--lg">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Find a Match Now
        </a>
        <a href="/solo.html" class="btn btn--ghost">Practice Solo</a>
      </div>
    </div>
  </section>

</div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');

.home, .home * { box-sizing: border-box; }

.home {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  min-height: 100vh;
  background: #07070f;
  color: #e2e2f0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  line-height: 1.5;
  overflow-x: hidden;
  isolation: isolate;
  margin: 0 !important;
  padding: 0 !important;
  position: relative;
  flex: 1 1 100%;
  align-self: stretch;
}

/* ── HERO ── */
.hero {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 100px 24px 72px;
  background: #07070f;
}
.hero-canvas {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  pointer-events: none; display: block;
}
.hero-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(96,165,250,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96,165,250,.025) 1px, transparent 1px);
  background-size: 52px 52px;
}
.glow {
  position: absolute; border-radius: 50%;
  filter: blur(130px); pointer-events: none;
}
.glow--blue {
  width: min(640px,80vw); height: min(640px,80vw);
  background: rgba(30,90,200,.14); top: -15%; left: -8%;
}
.glow--red {
  width: min(380px,55vw); height: min(380px,55vw);
  background: rgba(180,40,40,.08); bottom: 0; right: 5%;
}
.hero-inner {
  position: relative; z-index: 2;
  width: 100%; max-width: 660px;
  display: flex; flex-direction: column; align-items: center;
  text-align: center;
}
.eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: .6rem; font-weight: 700; letter-spacing: .16em;
  color: #93c5fd; text-transform: uppercase;
  padding: 6px 18px; margin-bottom: 22px;
  border: 1px solid rgba(96,165,250,.25); border-radius: 20px;
  background: rgba(96,165,250,.08); backdrop-filter: blur(8px);
}
.pip {
  display: inline-block; width: 4px; height: 4px; border-radius: 50%;
  background: #93c5fd; box-shadow: 0 0 6px #93c5fd; flex-shrink: 0;
}
.hero-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(2.8rem,10vw,5rem);
  font-weight: 800; line-height: .93; letter-spacing: -.03em;
  color: #f0f0ff; margin-bottom: 24px;
  word-break: break-word; width: 100%;
  text-shadow: 0 2px 40px rgba(7,7,15,.8);
}
.accent {
  color: #60a5fa;
  text-shadow: 0 0 60px rgba(96,165,250,.35), 0 2px 40px rgba(7,7,15,.8);
}
.hero-sub {
  font-size: clamp(.78rem,1.8vw,.94rem);
  line-height: 1.85; color: #a0a0c8;
  margin-bottom: 32px; padding: 12px 20px;
  background: rgba(7,7,15,.55); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,.07); border-radius: 10px;
  width: 100%;
}

/* Terminal */
.terminal {
  width: 100%; max-width: 480px;
  background: #050510;
  border: 1px solid rgba(255,255,255,.1); border-radius: 10px;
  overflow: hidden; margin-bottom: 36px;
  box-shadow: 0 20px 60px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.03);
}
.t-bar {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 14px;
  background: rgba(255,255,255,.02);
  border-bottom: 1px solid rgba(255,255,255,.06);
  font-size: .59rem; color: #3a3a5a;
}
.t-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.t-dot--r { background: #ff5f57; }
.t-dot--y { background: #ffbd2e; }
.t-dot--g { background: #28c840; }
.t-label { flex: 1; margin-left: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #4a4a6a; }
.t-live { color: #4ade80; font-weight: 700; flex-shrink: 0; animation: blink 1.2s step-end infinite; }
@keyframes blink { 50% { opacity: .2; } }
.t-body { padding: 14px 16px; font-size: .83rem; min-height: 46px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.t-prompt { color: #4ade80; font-weight: 700; }
.t-code { color: #93c5fd; }
.t-cursor { display: inline-block; color: #e0e0f0; animation: cur .75s step-end infinite; margin-left: 1px; }
@keyframes cur { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

/* Buttons */
.hero-btns { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; width: 100%; }
.btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 11px 26px; border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: .8rem; font-weight: 700; text-decoration: none;
  transition: all .15s; letter-spacing: .02em; white-space: nowrap;
}
.btn--primary {
  background: linear-gradient(135deg,#2563eb,#1d4ed8);
  color: #fff; border: 1px solid rgba(96,165,250,.3);
  box-shadow: 0 4px 24px rgba(37,99,235,.45);
}
.btn--primary:hover { filter: brightness(1.12); transform: translateY(-1px); box-shadow: 0 6px 32px rgba(37,99,235,.6); }
.btn--ghost {
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.14);
  color: #9090b8;
}
.btn--ghost:hover { background: rgba(255,255,255,.09); border-color: rgba(255,255,255,.28); color: #d0d0ee; }
.btn--lg { padding: 14px 32px; font-size: .9rem; }

/* ── STATS ── */
.stats-strip {
  width: 100%; background: rgba(255,255,255,.015);
  border-top: 1px solid rgba(255,255,255,.07);
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.stats-wrap {
  max-width: 900px; margin: 0 auto; padding: 0 16px;
  display: flex; align-items: stretch; justify-content: center; flex-wrap: wrap;
}
.stat {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  flex: 1 1 130px; padding: 18px 20px;
}
.stat-pulse {
  width: 7px; height: 7px; border-radius: 50%;
  background: #4ade80; box-shadow: 0 0 8px rgba(74,222,128,.7);
  animation: pulse 2s ease-in-out infinite; flex-shrink: 0;
}
@keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(.6); opacity: .5; } }
.stat-n {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.1rem,3vw,1.5rem); font-weight: 800; color: #f0f0ff;
}
.stat-l { font-size: .59rem; color: #7070a0; text-transform: uppercase; letter-spacing: .09em; }
.stat-div { width: 1px; background: rgba(255,255,255,.07); align-self: stretch; flex-shrink: 0; }

/* ── SECTIONS ── */
.sec { width: 100%; padding: clamp(56px,8vw,96px) clamp(16px,4vw,24px); background: #07070f; }
.sec--dark { background: #0c0c1a; }
.wrap { width: 100%; max-width: 1160px; margin: 0 auto; }
.sec-head { width: 100%; text-align: center; margin-bottom: clamp(36px,5vw,60px); }
.sec-tag {
  font-size: .57rem; font-weight: 800; letter-spacing: .2em;
  color: #60a5fa; text-transform: uppercase; margin-bottom: 10px;
  display: inline-block; padding: 4px 12px; border-radius: 20px;
  background: rgba(96,165,250,.08); border: 1px solid rgba(96,165,250,.2);
}
.sec-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.8rem,4vw,3rem); font-weight: 800;
  color: #f0f0ff; letter-spacing: -.025em; margin-bottom: 12px;
  text-shadow: 0 2px 30px rgba(7,7,15,.7);
}
.sec-sub { font-size: clamp(.76rem,1.8vw,.86rem); color: #8080aa; line-height: 1.7; }

/* ── MODE CARDS ── */
.modes-grid {
  display: grid; grid-template-columns: repeat(4,1fr);
  gap: 16px; width: 100%;
}
.card {
  position: relative; background: #0f0f20;
  border: 1px solid rgba(255,255,255,.08); border-radius: 16px;
  padding: 24px 20px; text-decoration: none;
  display: flex; flex-direction: column;
  overflow: hidden;
  transition: transform .18s, border-color .2s, box-shadow .2s;
}
.card:hover { transform: translateY(-5px); }
.card--blue:hover   { border-color: rgba(96,165,250,.4);  box-shadow: 0 20px 50px rgba(96,165,250,.12); }
.card--gold:hover   { border-color: rgba(252,211,77,.4);  box-shadow: 0 20px 50px rgba(252,211,77,.12); }
.card--purple:hover { border-color: rgba(192,132,252,.4); box-shadow: 0 20px 50px rgba(192,132,252,.12); }
.card--green:hover  { border-color: rgba(74,222,128,.4);  box-shadow: 0 20px 50px rgba(74,222,128,.12); }
.card-glow {
  position: absolute; top: -50px; right: -50px;
  width: 150px; height: 150px; border-radius: 50%;
  filter: blur(55px); pointer-events: none; opacity: .5;
}
.card--blue   .card-glow { background: rgba(96,165,250,.25); }
.card--gold   .card-glow { background: rgba(252,211,77,.2); }
.card--purple .card-glow { background: rgba(192,132,252,.22); }
.card--green  .card-glow { background: rgba(74,222,128,.2); }
.card-new {
  position: absolute; top: 12px; right: 12px;
  font-size: .5rem; font-weight: 800; letter-spacing: .12em;
  padding: 2px 7px; border-radius: 20px;
  background: rgba(192,132,252,.15); border: 1px solid rgba(192,132,252,.4);
  color: #d8b4fe; text-transform: uppercase;
}
.card-icon { font-size: 1.8rem; margin-bottom: 14px; line-height: 1; }
.card-badge {
  display: inline-block;
  font-size: .53rem; font-weight: 800; letter-spacing: .13em;
  padding: 3px 9px; border-radius: 5px;
  background: var(--bc); border: 1px solid var(--bbc); color: var(--btc);
  text-transform: uppercase; margin-bottom: 10px;
}
.card-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 800; color: #f0f0ff; margin-bottom: 10px; }
.card-desc  { font-size: .73rem; color: #8888aa; line-height: 1.78; margin-bottom: 14px; flex: 1; }
.card-list  { list-style: none; display: flex; flex-direction: column; gap: 5px; margin-bottom: 20px; }
.card-list li { font-size: .68rem; padding-left: 13px; position: relative; }
.card-list li::before { content: '›'; position: absolute; left: 0; font-weight: 800; }
.card--blue   .card-list li { color: #6a88a0; } .card--blue   .card-list li::before { color: #93c5fd; }
.card--gold   .card-list li { color: #8a7a50; } .card--gold   .card-list li::before { color: #fcd34d; }
.card--purple .card-list li { color: #7a6888; } .card--purple .card-list li::before { color: #d8b4fe; }
.card--green  .card-list li { color: #5a7a5a; } .card--green  .card-list li::before { color: #86efac; }
.card-cta { display: inline-flex; align-items: center; gap: 4px; font-size: .71rem; font-weight: 700; color: var(--cc); margin-top: auto; }

/* ── RANK LADDER ── */
.ranks { display: flex; align-items: stretch; justify-content: center; flex-wrap: wrap; gap: 10px; width: 100%; }
.rank-chip {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 16px 20px; min-width: 90px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.08); border-radius: 12px;
  box-shadow: inset 0 -2px 0 var(--rc);
}
.rc-icon { font-size: 1.5rem; }
.rc-label { font-size: .68rem; font-weight: 800; color: var(--rc); text-transform: uppercase; letter-spacing: .06em; text-shadow: 0 0 14px var(--rc); }
.rc-dp { font-size: .54rem; color: #4a4a6a; }

/* ── PANELS ── */
.two-col { display: grid; grid-template-columns: repeat(auto-fit,minmax(min(100%,300px),1fr)); gap: 20px; width: 100%; }
.panel { background: #0f0f20; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; overflow: hidden; }
.panel-hd { display: flex; align-items: center; justify-content: space-between; padding: 13px 16px; border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(0,0,0,.3); }
.panel-hd-label { display: flex; align-items: center; gap: 7px; font-size: .63rem; font-weight: 800; color: #7070a0; text-transform: uppercase; letter-spacing: .08em; }
.panel-link { font-size: .63rem; color: #60a5fa; text-decoration: none; }
.panel-link:hover { text-decoration: underline; }
.panel-body { padding: 4px 0; }
.panel-empty { padding: 32px 16px; text-align: center; font-size: .71rem; color: #4a4a6a; }
.lb-row { display: flex; align-items: center; gap: 10px; padding: 11px 16px; border-bottom: 1px solid rgba(255,255,255,.03); transition: background .1s; }
.lb-row:last-child { border-bottom: none; }
.lb-row:hover { background: rgba(255,255,255,.025); }
.lb-pos { font-size: .7rem; font-weight: 800; min-width: 28px; text-align: center; color: #5a5a7a; }
.lb-pos--1 { font-size: 1rem; } .lb-pos--2 { font-size: .9rem; } .lb-pos--3 { font-size: .85rem; }
.lb-av { width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); display: flex; align-items: center; justify-content: center; font-size: .7rem; font-weight: 800; color: #8080a8; overflow: hidden; flex-shrink: 0; }
.lb-av img { width: 100%; height: 100%; object-fit: cover; }
.lb-info { flex: 1; min-width: 0; }
.lb-name { font-size: .75rem; font-weight: 700; color: #d0d0f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lb-bar { height: 2px; background: rgba(255,255,255,.06); border-radius: 1px; margin-top: 5px; }
.lb-fill { height: 100%; border-radius: 1px; transition: width .5s ease; }
.lb-dp { text-align: right; flex-shrink: 0; }
.lb-dp-n { font-family: 'Syne', sans-serif; font-size: .9rem; font-weight: 800; }
.lb-dp-u { font-size: .53rem; color: #5a5a7a; margin-left: 2px; }
.match-row { display: flex; align-items: center; gap: 10px; padding: 11px 16px; border-bottom: 1px solid rgba(255,255,255,.03); }
.match-row:last-child { border-bottom: none; }
.mr-tag { width: 20px; height: 20px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: .55rem; font-weight: 800; flex-shrink: 0; }
.mr-tag--r { background: rgba(252,211,77,.1); color: #fcd34d; border: 1px solid rgba(252,211,77,.2); }
.mr-tag--c { background: rgba(96,165,250,.08); color: #93c5fd; border: 1px solid rgba(96,165,250,.15); }
.mr-names { flex: 1; display: flex; align-items: center; gap: 6px; font-size: .71rem; min-width: 0; }
.mr-n1, .mr-n2 { color: #c0c0e0; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px; }
.mr-vs { color: #4a4a6a; font-size: .57rem; flex-shrink: 0; }
.mr-result { font-size: .6rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; white-space: nowrap; flex-shrink: 0; }
.mr-result--p1  { background: rgba(96,165,250,.12); color: #93c5fd; border: 1px solid rgba(96,165,250,.2); }
.mr-result--p2  { background: rgba(248,113,113,.12); color: #fca5a5; border: 1px solid rgba(248,113,113,.2); }
.mr-result--tie { background: rgba(255,255,255,.04); color: #5a5a7a; border: 1px solid rgba(255,255,255,.08); }

/* ── HOW IT WORKS ── */
.steps { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: center; gap: 12px; width: 100%; }
.step { background: #0f0f20; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: clamp(20px,3vw,30px) clamp(16px,2.5vw,22px); text-align: center; }
.step-arr { font-size: 1.2rem; color: rgba(255,255,255,.15); flex-shrink: 0; text-align: center; }
.step-n { font-family: 'Syne', sans-serif; font-size: .58rem; font-weight: 800; color: rgba(255,255,255,.08); letter-spacing: .1em; margin-bottom: 10px; }
.step-ico { font-size: 1.7rem; margin-bottom: 12px; }
.step-title { font-family: 'Syne', sans-serif; font-size: .96rem; font-weight: 800; color: #f0f0ff; margin-bottom: 8px; }
.step-desc { font-size: .7rem; color: #7070a0; line-height: 1.8; }

/* ── FINAL CTA ── */
.cta-sec {
  position: relative; width: 100%;
  padding: clamp(72px,10vw,120px) clamp(16px,4vw,24px);
  text-align: center; overflow: hidden;
  border-top: 1px solid rgba(255,255,255,.07);
  background: #07070f;
}
.cta-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: min(700px,90vw); height: min(360px,50vw); background: radial-gradient(ellipse,rgba(30,80,200,.15) 0%,transparent 65%); pointer-events: none; }
.cta-inner { position: relative; z-index: 1; max-width: 580px; margin: 0 auto; }
.cta-tag { display: inline-block; font-size: .58rem; font-weight: 800; letter-spacing: .2em; color: #60a5fa; text-transform: uppercase; margin-bottom: 14px; padding: 4px 12px; border-radius: 20px; background: rgba(96,165,250,.08); border: 1px solid rgba(96,165,250,.2); }
.cta-title { font-family: 'Syne', sans-serif; font-size: clamp(2.4rem,6vw,4rem); font-weight: 800; color: #f0f0ff; letter-spacing: -.025em; margin-bottom: 16px; text-shadow: 0 2px 40px rgba(7,7,15,.8); }
.cta-sub { font-size: clamp(.77rem,1.8vw,.86rem); color: #8080aa; margin-bottom: 36px; line-height: 1.7; }
.cta-btns { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }

/* ── RESPONSIVE ── */
@media (max-width: 1080px) { .modes-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 900px)  { .steps { grid-template-columns: 1fr; gap: 10px; } .step-arr { transform: rotate(90deg); } }
@media (max-width: 768px)  { .hero { padding: 90px 20px 60px; } .stat-div { display: none; } .stat { flex: 1 1 44%; padding: 14px 10px; } }
@media (max-width: 600px)  { .modes-grid { grid-template-columns: 1fr; } .step-arr { display: none; } }
@media (max-width: 540px) {
  .hero { padding: 80px 16px 48px; min-height: 100svh; }
  .hero-title { font-size: clamp(2.4rem,13vw,3.2rem); }
  .hero-sub { font-size: .78rem; }
  .terminal { max-width: 100%; }
  .t-live { display: none; }
  .hero-btns { flex-direction: column; align-items: stretch; }
  .btn { justify-content: center; width: 100%; }
  .stat { flex: 1 1 100%; }
  .two-col { gap: 14px; }
  .cta-btns { flex-direction: column; align-items: stretch; }
  .btn--lg { justify-content: center; width: 100%; }
  .mr-n1, .mr-n2 { max-width: 58px; }
}
@media (max-width: 380px) {
  .hero-title { font-size: 2rem; }
  .eyebrow { font-size: .5rem; padding: 4px 10px; }
  .rank-chip { min-width: 60px; padding: 10px; }
  .rc-dp { display: none; }
}
</style>
