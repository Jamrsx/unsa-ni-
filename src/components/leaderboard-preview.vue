<template>
  <div class="lbp-root">
    <div class="lbp-header">
      <span class="lbp-title">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        Leaderboard
      </span>
      <a class="lbp-see-all" :href="showMoreLink">See all</a>
    </div>

    <div v-if="loading" class="lbp-loading">
      <div class="lbp-spinner"></div>
    </div>

    <div v-else-if="topPlayers.length === 0" class="lbp-empty">No players yet</div>

    <div v-else class="lbp-list">
      <div
        v-for="(player, idx) in topPlayers"
        :key="player.user_id || player.username"
        class="lbp-row"
        :class="idx === 0 ? 'lbp-row--first' : ''"
      >
        <div class="lbp-rank">
          <span v-if="idx === 0">🥇</span>
          <span v-else-if="idx === 1">🥈</span>
          <span v-else-if="idx === 2">🥉</span>
          <span v-else class="lbp-rank-num">{{ player.rank_number }}</span>
        </div>
        <div class="lbp-avatar">
          <img :src="player.avatar_url || '/asset/general/profile-user.png'" alt="" />
        </div>
        <div class="lbp-username">{{ player.username }}</div>
        <div class="lbp-dp">{{ (player.statistic_duel_point || 0).toLocaleString() }}<span class="lbp-dp-unit">DP</span></div>
      </div>
    </div>

    <button class="lbp-more-btn" @click="handleShowMore">
      View Full Rankings
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getSocket } from '../js/socket.js'

const props = defineProps({
  limit:        { type: Number, default: 5 },
  showMoreLink: { type: String, default: '/leaderboard.html' },
  autoRefreshMs:{ type: Number, default: 30000 }
})

const topPlayers = ref([])
const loading    = ref(true)
let refreshInterval = null

function fetchTopLeaderboard() {
  const socket = getSocket()
  if (!socket) return
  socket.emit('get_leaderboard', { limit: props.limit })
}

onMounted(() => {
  const socket = getSocket()
  if (!socket) { loading.value = false; return }

  socket.on('leaderboard_data', (data) => {
    topPlayers.value = Array.isArray(data) ? data : (data?.players ?? [])
    loading.value = false
  })

  function startFetching() {
    fetchTopLeaderboard()
    if (props.autoRefreshMs > 0) {
      if (refreshInterval) clearInterval(refreshInterval)
      refreshInterval = setInterval(fetchTopLeaderboard, props.autoRefreshMs)
    }
  }

  if (socket.connected && socket.user) {
    startFetching()
  } else {
    socket.once('authenticated', () => startFetching())
    setTimeout(() => { if (loading.value) fetchTopLeaderboard() }, 1500)
  }
})

onBeforeUnmount(() => {
  const socket = getSocket()
  try { if (socket) socket.off('leaderboard_data') } catch (e) {}
  if (refreshInterval) { clearInterval(refreshInterval); refreshInterval = null }
})

function handleShowMore() {
  window.location.href = props.showMoreLink
}
</script>

<style scoped>
.lbp-root {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  overflow: hidden;
  padding: 14px;
}
.lbp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.lbp-title { display: flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; color: rgba(255,255,255,0.4); }
.lbp-see-all { font-size: 0.68rem; font-weight: 700; color: #64b5f6; text-decoration: none; letter-spacing: 0.04em; opacity: 0.7; transition: opacity 0.15s; }
.lbp-see-all:hover { opacity: 1; }

.lbp-loading { display: flex; justify-content: center; padding: 16px; }
.lbp-spinner { width: 20px; height: 20px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.06); border-top-color: #1e88e5; animation: lbp-spin 0.8s linear infinite; }
@keyframes lbp-spin { to { transform: rotate(360deg); } }
.lbp-empty { text-align: center; font-size: 0.75rem; color: rgba(255,255,255,0.2); padding: 12px; }

.lbp-list { display: flex; flex-direction: column; gap: 3px; }
.lbp-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid transparent;
  transition: background 0.12s;
}
.lbp-row:hover { background: rgba(255,255,255,0.06); }
.lbp-row--first { background: rgba(255,215,0,0.06); border-color: rgba(255,215,0,0.12); }

.lbp-rank { width: 24px; text-align: center; font-size: 0.95rem; flex-shrink: 0; }
.lbp-rank-num { font-family: monospace; font-size: 0.7rem; font-weight: 700; color: rgba(255,255,255,0.25); }
.lbp-avatar { width: 26px; height: 26px; border-radius: 50%; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; background: rgba(255,255,255,0.05); }
.lbp-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.lbp-username { flex: 1; font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.75); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lbp-dp { font-family: monospace; font-size: 0.75rem; font-weight: 800; color: #81c784; flex-shrink: 0; }
.lbp-dp-unit { font-size: 0.58rem; opacity: 0.55; margin-left: 2px; }

.lbp-more-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  margin-top: 6px; padding: 9px;
  border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.45); font-size: 0.72rem; font-weight: 700;
  cursor: pointer; letter-spacing: 0.04em;
  transition: all 0.15s;
}
.lbp-more-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.75); }
</style>
