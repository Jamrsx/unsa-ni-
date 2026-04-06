<script>
import ProfilePic from './components/profile-pic.vue';
export default {
  components: { ProfilePic }
}
</script>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { getSocket } from './js/socket.js';
import ProfilePic from './components/profile-pic.vue';

const socket = getSocket();
if (!socket) {
  if (!localStorage.getItem('jwt_token')) window.location.href = '/signin.html';
  else alert('Connection error. Please refresh the page.');
}

const leaderboard_rows = ref([]);
const currentUserRank  = ref(null);
const isLoading        = ref(true);
const searchUsername   = ref('');
const filterLanguage   = ref('All');
let refreshInterval    = null;

const languages = ['All', 'Python', 'Java', 'PHP'];

const filteredRows = computed(() => {
  let rows = leaderboard_rows.value;
  if (searchUsername.value.trim())
    rows = rows.filter(r => r.UserName.toLowerCase().includes(searchUsername.value.toLowerCase()));
  if (filterLanguage.value !== 'All')
    rows = rows.filter(r => r.UserLanguage === filterLanguage.value);
  return rows;
});

function fetchLeaderboard() {
  if (!socket) return;
  socket.emit('get_leaderboard', {
    limit: 100,
    searchUsername: searchUsername.value,
    filterLanguage: filterLanguage.value === 'All' ? null : filterLanguage.value
  });
  socket.emit('get_user_rank');
}

function rankIcon(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
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

function dpColor(dp) {
  return getRank(dp).color;
}

onMounted(() => {
  fetchLeaderboard();
  refreshInterval = setInterval(fetchLeaderboard, 15000);

  socket.on('leaderboard_data', (data) => {
    leaderboard_rows.value = data.map(p => ({
      UserRank:     p.rank_number,
      UserName:     p.username,
      UserImg:      p.avatar_url || '/asset/general/profile-user.png',
      UserLvl:      p.statistic_level || 1,
      UserDP:       p.statistic_duel_point || 0,
      UserLanguage: p.most_language || 'Python',
      UserCountry:  p.country || '—',
    }));
    isLoading.value = false;
  });

  socket.on('user_rank_data', (data) => {
    if (data && data.rank_number) {
      currentUserRank.value = {
        UserRank:     data.rank_number,
        UserName:     data.username,
        UserImg:      data.avatar_url || '/asset/general/profile-user.png',
        UserLvl:      data.statistic_level || 1,
        UserDP:       data.statistic_duel_point || 0,
        UserLanguage: data.most_language || 'Python',
        UserCountry:  data.country || '—',
      };
    }
  });

  socket.on('connect_error', () => { isLoading.value = false; });
});

onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval);
  if (socket) {
    socket.off('leaderboard_data');
    socket.off('user_rank_data');
  }
});
</script>

<template>
  <div class="lb-root">

    <!-- Header -->
    <div class="lb-header">
      <div class="lb-header-left">
        <div class="lb-header-icon">🏆</div>
        <div>
          <div class="lb-header-title">Leaderboard</div>
          <div class="lb-header-sub">Top ranked duelists</div>
        </div>
      </div>
      <div class="lb-header-controls">
        <div class="lb-search-wrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            class="lb-search"
            v-model="searchUsername"
            placeholder="Search player…"
            spellcheck="false"
          />
        </div>
        <div class="lb-lang-pills">
          <button
            v-for="lang in languages" :key="lang"
            :class="['lb-lang-pill', filterLanguage === lang ? 'lb-lang-pill--active' : '']"
            @click="filterLanguage = lang"
          >{{ lang }}</button>
        </div>
      </div>
    </div>

    <!-- Podium (top 3) -->
    <div v-if="!isLoading && filteredRows.length >= 3" class="lb-podium-wrap">
    <div class="lb-podium">
      <!-- 2nd -->
      <div class="lb-podium-card lb-podium-card--2">
        <div class="lb-podium-avatar">
          <img :src="filteredRows[1].UserImg" alt="" />
          <div class="lb-podium-medal">🥈</div>
        </div>
        <div class="lb-podium-name">{{ filteredRows[1].UserName }}</div>
        <div class="lb-podium-dp">{{ filteredRows[1].UserDP.toLocaleString() }} DP</div>
        <div class="lb-podium-block lb-podium-block--2">2</div>
      </div>
      <!-- 1st -->
      <div class="lb-podium-card lb-podium-card--1">
        <div class="lb-podium-crown">👑</div>
        <div class="lb-podium-avatar lb-podium-avatar--1">
          <img :src="filteredRows[0].UserImg" alt="" />
          <div class="lb-podium-medal">🥇</div>
        </div>
        <div class="lb-podium-name">{{ filteredRows[0].UserName }}</div>
        <div class="lb-podium-dp">{{ filteredRows[0].UserDP.toLocaleString() }} DP</div>
        <div class="lb-podium-block lb-podium-block--1">1</div>
      </div>
      <!-- 3rd -->
      <div class="lb-podium-card lb-podium-card--3">
        <div class="lb-podium-avatar">
          <img :src="filteredRows[2].UserImg" alt="" />
          <div class="lb-podium-medal">🥉</div>
        </div>
        <div class="lb-podium-name">{{ filteredRows[2].UserName }}</div>
        <div class="lb-podium-dp">{{ filteredRows[2].UserDP.toLocaleString() }} DP</div>
        <div class="lb-podium-block lb-podium-block--3">3</div>
      </div>
    </div>
    </div>

    <!-- Table -->
    <div class="lb-card">
      <div class="lb-card-header">
        <span class="lb-card-title">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><polyline points="3 6 4 7 6 5"/><polyline points="3 12 4 13 6 11"/><polyline points="3 18 4 19 6 17"/></svg>
          Rankings
        </span>
        <span class="lb-count-badge">{{ filteredRows.length }} players</span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="lb-loading">
        <div class="lb-spinner"></div>
        <span>Loading rankings…</span>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredRows.length === 0" class="lb-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>No players found</p>
      </div>

      <!-- Rows -->
      <div v-else class="lb-table-wrap">
        <table class="lb-table">
          <thead>
            <tr>
              <th class="col-rank">Rank</th>
              <th class="col-player">Player</th>
              <th class="col-dp">Duel Points</th>
              <th class="col-lang">Language</th>
              <th class="col-lvl">Level</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in filteredRows"
              :key="row.UserName"
              :class="[
                'lb-row',
                row.UserRank <= 3 ? 'lb-row--top' : '',
                currentUserRank && row.UserName === currentUserRank.UserName ? 'lb-row--me' : ''
              ]"
            >
              <td class="col-rank">
                <span v-if="rankIcon(row.UserRank)" class="lb-medal">{{ rankIcon(row.UserRank) }}</span>
                <span v-else class="lb-rank-num">{{ row.UserRank }}</span>
              </td>
              <td class="col-player">
                <div class="lb-player">
                  <div class="lb-avatar">
                    <img :src="row.UserImg" alt="" />
                  </div>
                  <span class="lb-username">{{ row.UserName }}</span>
                  <span v-if="currentUserRank && row.UserName === currentUserRank.UserName" class="lb-you-tag">YOU</span>
                  <span class="lb-rank-badge" :style="`--rc:${getRank(row.UserDP).color}`">
                    {{ getRank(row.UserDP).icon }} {{ getRank(row.UserDP).label }}
                  </span>
                </div>
              </td>
              <td class="col-dp">
                <span class="lb-dp" :style="{ color: dpColor(row.UserDP) }">
                  {{ row.UserDP.toLocaleString() }}
                  <span class="lb-dp-unit">DP</span>
                </span>
              </td>
              <td class="col-lang">
                <span class="lb-lang-tag">{{ row.UserLanguage }}</span>
              </td>
              <td class="col-lvl">
                <span class="lb-lvl-badge">Lv.{{ row.UserLvl }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Your rank sticky bar -->
    <div v-if="currentUserRank" class="lb-myrank-bar">
      <div class="lb-myrank-left">
        <span class="lb-myrank-label">YOUR RANK</span>
        <span class="lb-myrank-num">#{{ currentUserRank.UserRank }}</span>
      </div>
      <div class="lb-myrank-player">
        <div class="lb-avatar lb-avatar--sm">
          <img :src="currentUserRank.UserImg" alt="" />
        </div>
        <span class="lb-myrank-name">{{ currentUserRank.UserName }}</span>
        <span class="lb-rank-badge" :style="`--rc:${getRank(currentUserRank.UserDP).color}`">
          {{ getRank(currentUserRank.UserDP).icon }} {{ getRank(currentUserRank.UserDP).label }}
        </span>
      </div>
      <div class="lb-myrank-right">
        <span class="lb-dp" :style="{ color: dpColor(currentUserRank.UserDP) }">
          {{ currentUserRank.UserDP.toLocaleString() }}
          <span class="lb-dp-unit">DP</span>
        </span>
        <span class="lb-lvl-badge">Lv.{{ currentUserRank.UserLvl }}</span>
      </div>
    </div>

  </div>
</template>

<style scoped>
.lb-root {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  min-height: 100vh;
  background: #080810;
  color: rgba(255,255,255,0.85);
  font-family: 'Segoe UI', system-ui, sans-serif;
  padding-bottom: 80px;
}

/* Header */
.lb-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
.lb-header-left { display: flex; align-items: center; gap: 14px; }
.lb-header-icon { font-size: 2rem; line-height: 1; }
.lb-header-title { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: #fff; }
.lb-header-sub { font-size: 0.72rem; color: rgba(255,255,255,0.3); font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
.lb-header-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.lb-search-wrap { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 8px 12px; color: rgba(255,255,255,0.3); }
.lb-search { background: none; border: none; outline: none; color: rgba(255,255,255,0.85); font-size: 0.82rem; width: 160px; }
.lb-search::placeholder { color: rgba(255,255,255,0.25); }
.lb-lang-pills { display: flex; gap: 5px; }
.lb-lang-pill { padding: 6px 12px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.15s; }
.lb-lang-pill:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.2); }
.lb-lang-pill--active { background: rgba(30,136,229,0.18); border-color: rgba(30,136,229,0.5); color: #64b5f6; }

/* Podium */
.lb-podium-wrap {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  overflow: hidden;
  padding-bottom: 0;
}
.lb-podium { display: flex; align-items: flex-end; justify-content: center; gap: 0; padding: 32px 0 0; width: 100%; }
.lb-podium-card { display: flex; flex-direction: column; align-items: center; gap: 8px; position: relative; flex: 1; }
.lb-podium-card--1 { order: 2; background: radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.07) 0%, transparent 70%); }
.lb-podium-card--2 { order: 1; background: radial-gradient(ellipse at 50% 0%, rgba(192,192,192,0.04) 0%, transparent 70%); }
.lb-podium-card--3 { order: 3; background: radial-gradient(ellipse at 50% 0%, rgba(205,127,50,0.04) 0%, transparent 70%); }
.lb-podium-crown { font-size: 1.8rem; margin-bottom: -6px; animation: crown-bounce 2s ease-in-out infinite; }
@keyframes crown-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.lb-podium-avatar { position: relative; }
.lb-podium-avatar img { border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.15); }
.lb-podium-avatar--1 img { width: 96px; height: 96px; border-color: #ffd700; box-shadow: 0 0 28px rgba(255,215,0,0.45); }
.lb-podium-card--2 .lb-podium-avatar img { width: 78px; height: 78px; border-color: #c0c0c0; box-shadow: 0 0 16px rgba(192,192,192,0.25); }
.lb-podium-card--3 .lb-podium-avatar img { width: 68px; height: 68px; border-color: #cd7f32; box-shadow: 0 0 14px rgba(205,127,50,0.2); }
.lb-podium-medal { position: absolute; bottom: -8px; right: -8px; font-size: 1.3rem; }
.lb-podium-name { font-size: 0.95rem; font-weight: 700; color: rgba(255,255,255,0.85); text-align: center; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lb-podium-dp { font-size: 0.82rem; font-weight: 800; color: rgba(255,255,255,0.45); font-family: monospace; }
.lb-podium-card--1 .lb-podium-dp { font-size: 0.82rem; font-weight: 800; color: rgba(255,255,255,0.45); font-family: monospace; }
.lb-podium-block { display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; border-radius: 12px 12px 0 0; width: 100%; }
.lb-podium-block--1 { height: 90px; background: linear-gradient(180deg, rgba(255,215,0,0.18), rgba(255,215,0,0.04)); border: 1px solid rgba(255,215,0,0.25); border-bottom: none; color: #ffd700; }
.lb-podium-block--2 { height: 68px; background: linear-gradient(180deg, rgba(192,192,192,0.12), rgba(192,192,192,0.03)); border: 1px solid rgba(192,192,192,0.18); border-bottom: none; color: #c0c0c0; }
.lb-podium-block--3 { height: 50px; background: linear-gradient(180deg, rgba(205,127,50,0.12), rgba(205,127,50,0.03)); border: 1px solid rgba(205,127,50,0.18); border-bottom: none; color: #cd7f32; }

/* Card */
.lb-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; }
.lb-card-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(0,0,0,0.2); }
.lb-card-title { display: flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.45); }
.lb-count-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 10px; background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.3); font-family: monospace; }

/* Loading/empty */
.lb-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 40px; color: rgba(255,255,255,0.3); font-size: 0.82rem; }
.lb-spinner { width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.08); border-top-color: #1e88e5; animation: lb-spin 0.8s linear infinite; }
@keyframes lb-spin { to { transform: rotate(360deg); } }
.lb-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px; color: rgba(255,255,255,0.2); }
.lb-empty p { font-size: 0.82rem; margin: 0; }

/* Table */
.lb-table-wrap { overflow-x: auto; }
.lb-table { width: 100%; border-collapse: collapse; }
.lb-table thead tr { border-bottom: 1px solid rgba(255,255,255,0.07); }
.lb-table th { padding: 10px 16px; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.25); text-align: left; white-space: nowrap; }
.lb-row { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.12s; }
.lb-row:hover { background: rgba(255,255,255,0.03); }
.lb-row--top { background: rgba(255,215,0,0.025); }
.lb-row--me { background: rgba(30,136,229,0.08) !important; outline: 1px solid rgba(30,136,229,0.25); }
.lb-row td { padding: 12px 16px; font-size: 0.84rem; vertical-align: middle; }

.col-rank { width: 60px; text-align: center; }
.col-dp, .col-lvl { text-align: right; white-space: nowrap; }
.lb-medal { font-size: 1.1rem; }
.lb-rank-num { font-family: monospace; font-weight: 700; font-size: 0.82rem; color: rgba(255,255,255,0.3); }

.lb-player { display: flex; align-items: center; gap: 10px; }
.lb-avatar { width: 34px; height: 34px; border-radius: 50%; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; background: rgba(255,255,255,0.05); }
.lb-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.lb-avatar--sm { width: 28px; height: 28px; }
.lb-username { font-weight: 600; color: rgba(255,255,255,0.82); }
.lb-you-tag { font-size: 0.58rem; font-weight: 900; letter-spacing: 0.08em; padding: 2px 6px; border-radius: 4px; background: rgba(30,136,229,0.2); color: #64b5f6; border: 1px solid rgba(30,136,229,0.3); }

.lb-dp { font-family: monospace; font-weight: 800; font-size: 0.9rem; }
.lb-dp-unit { font-size: 0.65rem; opacity: 0.5; margin-left: 2px; }
.lb-lang-tag { font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); }
.lb-lvl-badge { font-size: 0.7rem; font-weight: 700; font-family: monospace; padding: 3px 8px; border-radius: 6px; background: rgba(100,181,246,0.1); border: 1px solid rgba(100,181,246,0.2); color: #64b5f6; }

/* My rank sticky bar */
.lb-myrank-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: rgba(10,10,22,0.92);
  border-top: 1px solid rgba(30,136,229,0.3);
  backdrop-filter: blur(16px);
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 24px;
  z-index: 100;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.4);
}
.lb-myrank-left { display: flex; align-items: center; gap: 10px; }
.lb-myrank-label { font-size: 0.6rem; font-weight: 800; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); text-transform: uppercase; }
.lb-myrank-num { font-size: 1.2rem; font-weight: 900; font-family: monospace; color: #64b5f6; }
.lb-myrank-player { display: flex; align-items: center; gap: 8px; }
.lb-myrank-name { font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.75); }
.lb-myrank-right { display: flex; align-items: center; gap: 10px; }

/* Rank badge */
.lb-rank-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.06em;
  padding: 2px 8px; border-radius: 20px; text-transform: uppercase;
  background: rgba(0,0,0,0.25);
  border: 1px solid var(--rc);
  color: var(--rc);
  text-shadow: 0 0 10px var(--rc);
  white-space: nowrap;
}
</style>
