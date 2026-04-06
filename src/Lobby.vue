<!-- src/Lobby.vue -->
<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { getSocket } from './js/socket.js';
import Window from './components/window.vue';
import ButtonText from './components/button-text.vue';
import ScrollVerticalCarousel from './components/scroll-vertical-carousel.vue';
import ScrollCard from './components/scroll-card.vue';
import CardLobbyRoom from './components/card-lobby-room.vue';
import SearchPanel from './components/search-panel.vue';

// State
const lobbies = ref([]);
const searchQuery = ref('');
const showCreateModal = ref(false);
const showPasswordModal = ref(false);
const passwordInput = ref('');
const pendingRoomCode = ref('');
const pendingRoomName = ref('');
const isLoading = ref(false);
const isAuthenticated = ref(false);
const selectedLang = ref('');
let refreshInterval = null;

// Lazy socket getter — always fetches the current singleton
function getS() { return getSocket(); }

// Create lobby form
const newLobby = ref({
  roomName: '',
  description: '',
  language: 'Python',
  isPrivate: false,
  password: '',
  maxPlayers: 45,
  difficulty: 'Easy'
});

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

watch(() => newLobby.value.isPrivate, (isPrivate) => {
  newLobby.value.password = isPrivate ? generatePassword() : '';
});

function resetLobbyForm() {
  newLobby.value = { roomName: '', description: '', language: 'Python', isPrivate: false, password: '', maxPlayers: 45, difficulty: 'Easy' };
}
function openCreateModal() { resetLobbyForm(); showCreateModal.value = true; }
function closeCreateModal() { showCreateModal.value = false; resetLobbyForm(); }

async function loadLobbies() {
  isLoading.value = true;
  getS().emit('get_lobbies', { search: searchQuery.value }, (response) => {
    if (response.success) lobbies.value = response.lobbies;
    else console.error('Failed to load lobbies:', response.error);
    isLoading.value = false;
  });
}

// Computed: split lobbies into waiting and in_progress
const filteredLobbies = computed(() => {
  return lobbies.value.filter(l => {
    if (selectedLang.value && l.programming_language !== selectedLang.value) return false;
    return true;
  });
});
const waitingLobbies = computed(() => filteredLobbies.value.filter(l => !l.status || l.status === 'waiting'));
const activeLobbies  = computed(() => filteredLobbies.value.filter(l => l.status === 'in_progress'));

function createLobby() {
  if (!newLobby.value.roomName.trim()) { alert('Please enter a room name'); return; }
  getS().emit('create_lobby', newLobby.value, (response) => {
    if (response.success) {
      if (newLobby.value.isPrivate && newLobby.value.password)
        sessionStorage.setItem(`lobby_password_${response.roomCode}`, newLobby.value.password);
      window.location.href = `/room.html?code=${response.roomCode}&created=true`;
    } else {
      alert('Failed to create lobby: ' + response.error);
    }
  });
}

function joinLobby(roomCode, isPrivate = false, roomName = '', status = 'waiting') {
  if (!getS()?.connected) { alert('Not connected to server. Please refresh.'); return; }
  if (!isAuthenticated.value) { setTimeout(() => joinLobby(roomCode, isPrivate, roomName, status), 500); return; }
  if (status === 'in_progress') {
    window.location.href = `/room.html?code=${roomCode}`;
    return;
  }
  if (isPrivate) {
    pendingRoomCode.value = roomCode;
    pendingRoomName.value = roomName;
    passwordInput.value = '';
    showPasswordModal.value = true;
  } else {
    proceedToRoom(roomCode, '');
  }
}

function proceedToRoom(roomCode, password) {
  if (password) sessionStorage.setItem(`room_password_${roomCode}`, password);
  window.location.href = `/room.html?code=${roomCode}`;
}

function submitPassword() {
  if (!passwordInput.value.trim()) { alert('Please enter a password'); return; }
  showPasswordModal.value = false;
  proceedToRoom(pendingRoomCode.value, passwordInput.value);
}
function closePasswordModal() {
  showPasswordModal.value = false;
  passwordInput.value = '';
  pendingRoomCode.value = '';
  pendingRoomName.value = '';
}

function handleSearch(query) { searchQuery.value = query; loadLobbies(); }

onMounted(() => {
  // Auto-open create modal if redirected from Duel page
  const params = new URLSearchParams(window.location.search);
  if (params.get('create') === '1') openCreateModal();

  getS().on('authenticated', () => { isAuthenticated.value = true; loadLobbies(); });
  if (getS()?.connected) { isAuthenticated.value = true; loadLobbies(); }
  else getS().on('connect', () => { isAuthenticated.value = true; loadLobbies(); });

  // Real-time refresh when any lobby changes
  getS().on('lobbies_updated', () => loadLobbies());

  refreshInterval = setInterval(() => { if (getS()?.connected) loadLobbies(); }, 3000);
});

onUnmounted(() => {
  clearInterval(refreshInterval);
  getS().off('authenticated');
  getS().off('connect');
  getS().off('lobbies_updated');
});
</script>

<template>
  <!-- ══ LEFT: Lobby List ══ -->
  <section class="lobbies-section">
    <Window class="lobby-window">
      <template #title>
        <div class="lobby-title-row">
          <span>Online Lobbies</span>
          <div class="lobby-counts">
            <span class="count-pill count-waiting">{{ waitingLobbies.length }} open</span>
            <span v-if="activeLobbies.length" class="count-pill count-active">
              <span class="live-dot"></span>{{ activeLobbies.length }} live
            </span>
            <button class="refresh-btn" @click="loadLobbies" :class="{ spinning: isLoading }" title="Refresh">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
          </div>
        </div>
      </template>
      <template #content>
        <!-- Loading skeleton -->
        <div v-if="isLoading" class="lobby-loading">
          <div v-for="i in 4" :key="i" class="skeleton-card">
            <div class="sk sk-title"></div>
            <div class="sk sk-sub"></div>
            <div class="sk sk-row">
              <div class="sk sk-chip"></div>
              <div class="sk sk-chip"></div>
            </div>
          </div>
        </div>

        <template v-else>
          <!-- Empty state -->
          <div v-if="lobbies.length === 0" class="empty-lobbies">
            <div class="empty-icon">🎮</div>
            <p>No lobbies found</p>
            <small>Be the first to create one!</small>
          </div>

          <div v-else class="lobby-scroll">
            <!-- In-progress / Live lobbies -->
            <div v-if="activeLobbies.length" class="lobby-group">
              <div class="group-label">
                <span class="live-dot"></span>
                MATCH IN PROGRESS
              </div>
              <div
                v-for="lobby in activeLobbies"
                :key="lobby.lobby_id"
                class="lobby-card lobby-card--live"
                @click="joinLobby(lobby.room_code, false, lobby.room_name, lobby.status)"
              >
                <div class="lc-accent lc-accent--live"></div>
                <div class="lc-left">
                  <div class="lc-name">{{ lobby.room_name }}</div>
                  <div class="lc-host">by {{ lobby.host_username }}</div>
                </div>
                <div class="lc-right">
                  <div class="lc-players">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                    {{ lobby.player_count }}/{{ lobby.max_players }}
                  </div>
                  <span class="lc-badge lc-badge--live">LIVE</span>
                </div>
              </div>
            </div>

            <!-- Waiting lobbies -->
            <div v-if="waitingLobbies.length" class="lobby-group">
              <div v-if="activeLobbies.length" class="group-label">OPEN TO JOIN</div>
              <div
                v-for="lobby in waitingLobbies"
                :key="lobby.lobby_id"
                class="lobby-card"
                @click="joinLobby(lobby.room_code, lobby.is_private === 1, lobby.room_name, lobby.status)"
              >
                <div class="lc-accent"></div>
                <div class="lc-left">
                  <div class="lc-name">
                    {{ lobby.room_name }}
                    <span v-if="lobby.is_private === 1" class="lock-icon">🔒</span>
                  </div>
                  <div class="lc-host">by {{ lobby.host_username }}</div>
                  <div v-if="lobby.description" class="lc-desc">{{ lobby.description }}</div>
                </div>
                <div class="lc-right">
                  <div class="lc-players">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                    {{ lobby.player_count }}/{{ lobby.max_players }}
                  </div>
                  <div class="player-bar-wrap">
                    <div class="player-bar" :style="{ width: Math.min((lobby.player_count / lobby.max_players) * 100, 100) + '%' }"></div>
                  </div>
                  <span class="lc-badge lc-badge--join">JOIN</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>
    </Window>
  </section>

  <!-- ══ RIGHT: Search + Create ══ -->
  <section class="sidebar-section">
    <Window>
      <template #title><span>🔍 Search</span></template>
      <template #content>
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="searchQuery"
            class="search-input"
            type="text"
            placeholder="Search lobbies…"
            @input="handleSearch(searchQuery)"
          />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''; handleSearch('')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="filter-section">
          <p class="filter-label">LANGUAGE</p>
          <div class="filter-pills">
            <button
              v-for="lang in ['Python', 'Java', 'PHP']"
              :key="lang"
              class="filter-pill"
              :class="{ 'filter-pill--active': selectedLang === lang }"
              @click="selectedLang = selectedLang === lang ? '' : lang"
            >{{ lang }}</button>
          </div>
        </div>
        <div class="filter-section">
          <p class="filter-label">LANGUAGE</p>
          <div class="filter-pills">
            <button
              class="filter-pill"
              :class="{ 'filter-pill--active': selectedLang === '' }"
              @click="selectedLang = ''"
            >All</button>
            <button
              v-for="lang in ['Python', 'PHP', 'Java']"
              :key="lang"
              class="filter-pill"
              :class="{ 'filter-pill--active': selectedLang === lang }"
              @click="selectedLang = lang"
            >{{ lang }}</button>
          </div>
        </div>
        <p class="refresh-hint">Refreshes every 3 seconds</p>
      </template>
    </Window>

    <Window>
      <template #title><span>⚔️ Create Room</span></template>
      <template #content>
        <button class="create-btn" @click="openCreateModal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Room
        </button>
      </template>
    </Window>
  </section>

  <!-- ══ Password Modal ══ -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showPasswordModal" class="modal-backdrop" @click.self="closePasswordModal">
        <div class="modal-box pw-modal">
          <div class="modal-icon">🔒</div>
          <h3 class="modal-heading">Private Room</h3>
          <p class="modal-sub">{{ pendingRoomName }}</p>
          <div class="modal-field">
            <label class="modal-label">ROOM PASSWORD</label>
            <input
              v-model="passwordInput"
              type="text"
              class="modal-input pw-input"
              placeholder="XXXXXX"
              maxlength="6"
              @keyup.enter="submitPassword"
              autofocus
            />
          </div>
          <div class="modal-actions">
            <button class="modal-btn modal-btn--primary" @click="submitPassword">Enter Room</button>
            <button class="modal-btn modal-btn--ghost" @click="closePasswordModal">Cancel</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══ Create Lobby Modal ══ -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showCreateModal" class="modal-backdrop" @click.self="closeCreateModal">
        <div class="modal-box create-modal">
          <div class="modal-icon">🎮</div>
          <h3 class="modal-heading">New Lobby</h3>

          <div class="modal-field">
            <label class="modal-label">ROOM NAME <span class="required">*</span></label>
            <input v-model="newLobby.roomName" type="text" class="modal-input" placeholder="My Awesome Arena" maxlength="40" />
          </div>

          <div class="modal-field">
            <label class="modal-label">DESCRIPTION</label>
            <textarea v-model="newLobby.description" class="modal-input modal-textarea" rows="2" placeholder="Optional description…"></textarea>
          </div>

          <div class="modal-row">
            <div class="modal-field modal-field--half">
              <label class="modal-label">LANGUAGE</label>
              <select v-model="newLobby.language" class="modal-input modal-select">
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="JavaScript">JavaScript</option>
                <option value="C++">C++</option>
              </select>
            </div>
            <div class="modal-field modal-field--half">
              <label class="modal-label">DIFFICULTY</label>
              <select v-model="newLobby.difficulty" class="modal-input modal-select">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <label class="modal-toggle">
            <input type="checkbox" v-model="newLobby.isPrivate" class="toggle-check" />
            <div class="toggle-track">
              <div class="toggle-thumb"></div>
            </div>
            <span class="toggle-label">Private Room</span>
          </label>

          <div v-if="newLobby.isPrivate && newLobby.password" class="password-preview">
            <span class="pw-preview-label">Password</span>
            <span class="pw-preview-code">{{ newLobby.password }}</span>
            <button class="pw-regen" title="Regenerate" @click="newLobby.password = generatePassword()">↺</button>
          </div>

          <div class="modal-actions">
            <button class="modal-btn modal-btn--primary" @click="createLobby">Create Room</button>
            <button class="modal-btn modal-btn--ghost" @click="closeCreateModal">Cancel</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ══ Layout ══ */
.lobbies-section { display: flex; flex-direction: column; width: 100%; }
.sidebar-section  { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.lobby-window     { flex: 1; }

/* ══ Title row ══ */
.lobby-title-row  { display: flex; align-items: center; gap: 10px; }
.lobby-counts     { display: flex; gap: 6px; margin-left: auto; align-items: center; }
.count-pill {
  padding: 2px 9px; border-radius: 10px;
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.04em; font-family: monospace;
}
.count-waiting { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); }
.count-active  { background: rgba(76,175,80,0.15); color: #66bb6a; border: 1px solid rgba(76,175,80,0.25); display: flex; align-items: center; gap: 5px; }
.refresh-btn {
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.3); padding: 2px 4px; border-radius: 4px;
  display: flex; align-items: center;
  transition: color 0.15s ease;
}
.refresh-btn:hover { color: rgba(255,255,255,0.7); }
.refresh-btn svg { transition: transform 0.4s ease; }
.refresh-btn.spinning svg { animation: rc-spin 0.6s linear infinite; }
@keyframes rc-spin { to { transform: rotate(360deg); } }

/* ══ Live dot ══ */
.live-dot {
  display: inline-block; width: 7px; height: 7px;
  border-radius: 50%; background: #4caf50;
  box-shadow: 0 0 6px #4caf50;
  animation: live-pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes live-pulse {
  0%,100% { box-shadow: 0 0 4px #4caf50; }
  50%      { box-shadow: 0 0 10px #4caf50, 0 0 18px rgba(76,175,80,0.3); }
}

/* ══ Loading skeletons ══ */
.lobby-loading { display: flex; flex-direction: column; gap: 10px; padding: 12px; }
.skeleton-card {
  background: rgba(10,10,18,0.6); border-radius: 10px;
  padding: 14px 16px; display: flex; flex-direction: column; gap: 8px;
  border: 1px solid rgba(255,255,255,0.06);
}
.sk {
  border-radius: 4px; background: linear-gradient(90deg,
    rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { to { background-position: -200% 0; } }
.sk-title  { height: 13px; width: 55%; }
.sk-sub    { height: 10px; width: 35%; }
.sk-row    { display: flex; gap: 8px; }
.sk-chip   { height: 20px; width: 60px; border-radius: 10px; }

/* ══ Empty state ══ */
.empty-lobbies {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px 20px; gap: 8px;
}
.empty-icon  { font-size: 2.8rem; }
.empty-lobbies p     { color: rgba(255,255,255,0.4); font-size: 0.9rem; font-weight: 600; margin: 0; }
.empty-lobbies small { color: rgba(255,255,255,0.2); font-size: 0.76rem; }

/* ══ Lobby scroll container ══ */
.lobby-scroll {
  display: flex; flex-direction: column; gap: 18px;
  padding: 12px; overflow-y: auto; max-height: 65vh;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
}
.lobby-scroll::-webkit-scrollbar       { width: 4px; }
.lobby-scroll::-webkit-scrollbar-track { background: transparent; }
.lobby-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }

/* ══ Group label ══ */
.lobby-group { display: flex; flex-direction: column; gap: 8px; }
.group-label {
  display: flex; align-items: center; gap: 7px;
  font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.28); padding: 0 2px;
  text-transform: uppercase;
}

/* ══ Lobby card ══ */
.lobby-card {
  display: flex; align-items: stretch; gap: 0;
  border-radius: 10px;
  background: rgba(10,10,18,0.72);
  border: 1px solid rgba(255,255,255,0.09);
  cursor: pointer; position: relative; overflow: hidden;
  transition: transform 0.14s ease, border-color 0.14s ease,
              background 0.14s ease, box-shadow 0.14s ease;
  backdrop-filter: blur(4px);
}
.lobby-card:hover {
  transform: translateY(-2px);
  background: rgba(10,10,18,0.85);
  border-color: rgba(255,255,255,0.18);
  box-shadow: 0 6px 20px rgba(0,0,0,0.45);
}
.lobby-card--live {
  background: rgba(10,18,12,0.78);
  border-color: rgba(76,175,80,0.25);
}
.lobby-card--live:hover {
  background: rgba(10,22,14,0.88);
  border-color: rgba(76,175,80,0.4);
  box-shadow: 0 6px 20px rgba(0,0,0,0.45), 0 0 0 1px rgba(76,175,80,0.15);
}

/* Esports accent strip on left edge */
.lc-accent {
  width: 3px; flex-shrink: 0;
  background: rgba(30,136,229,0.35);
  transition: background 0.14s ease;
}
.lobby-card:hover .lc-accent { background: #1e88e5; }
.lc-accent--live { background: rgba(76,175,80,0.45); }
.lobby-card--live:hover .lc-accent--live { background: #4caf50; }

.lc-left  { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; padding: 13px 12px 13px 14px; }
.lc-name  {
  font-size: 0.9rem; font-weight: 700;
  color: rgba(255,255,255,0.88); display: flex; align-items: center; gap: 6px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lock-icon { font-size: 0.78rem; opacity: 0.7; }
.lc-host  { font-size: 0.72rem; color: rgba(255,255,255,0.35); }
.lc-desc  { font-size: 0.72rem; color: rgba(255,255,255,0.28); font-style: italic; margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }

.lc-right {
  display: flex; flex-direction: column; align-items: flex-end; gap: 6px;
  flex-shrink: 0; padding: 13px 14px 13px 12px;
}
.lc-players {
  display: flex; align-items: center; gap: 4px;
  font-size: 0.72rem; font-weight: 600; font-family: monospace;
  color: rgba(255,255,255,0.4);
}
.player-bar-wrap {
  width: 56px; height: 3px;
  background: rgba(255,255,255,0.07); border-radius: 2px; overflow: hidden;
}
.player-bar {
  height: 100%; background: #1e88e5; border-radius: 2px;
  transition: width 0.4s ease;
}
.lc-badge {
  padding: 3px 10px; border-radius: 20px;
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.08em;
}
.lc-badge--join { background: rgba(30,136,229,0.15); color: #64b5f6; border: 1px solid rgba(30,136,229,0.25); }
.lc-badge--live { background: rgba(76,175,80,0.15); color: #81c784; border: 1px solid rgba(76,175,80,0.3); }

/* ══ Sidebar ══ */
.create-btn {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; padding: 11px 16px;
  background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
  color: #fff; border: none; border-radius: 8px;
  font-size: 0.85rem; font-weight: 700; letter-spacing: 0.04em;
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease;
  box-shadow: 0 2px 12px rgba(30,136,229,0.35);
}
.create-btn:hover  { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 4px 20px rgba(30,136,229,0.5); }
.create-btn:active { transform: translateY(0); filter: brightness(0.95); }

.filter-section { margin-top: 10px; display: flex; flex-direction: column; gap: 7px; }
.filter-label {
  font-size: 0.62rem; font-weight: 800; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.28); text-transform: uppercase; margin: 0;
}
.filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-pill {
  padding: 5px 13px; border-radius: 20px;
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
}
.filter-pill:hover {
  background: rgba(255,255,255,0.09);
  border-color: rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.75);
  transform: translateY(-1px);
}
.filter-pill--active {
  background: rgba(30,136,229,0.18);
  border-color: rgba(30,136,229,0.45);
  color: #64b5f6;
}
.filter-pill--active:hover {
  background: rgba(30,136,229,0.26);
  border-color: rgba(30,136,229,0.6);
  color: #90caf9;
}

/* ══ Sidebar search ══ */
.search-wrap {
  position: relative; display: flex; align-items: center;
}
.search-icon {
  position: absolute; left: 10px;
  color: rgba(255,255,255,0.28); pointer-events: none; flex-shrink: 0;
}
.search-input {
  width: 100%; padding: 9px 30px 9px 32px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: rgba(255,255,255,0.88); font-size: 0.85rem;
  outline: none;
  transition: border-color 0.18s ease, background 0.18s ease;
}
.search-input:focus {
  border-color: rgba(30,136,229,0.55);
  background: rgba(30,136,229,0.07);
}
.search-input::placeholder { color: rgba(255,255,255,0.22); }
.search-clear {
  position: absolute; right: 8px;
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.3); display: flex; align-items: center; padding: 2px;
  transition: color 0.15s;
}
.search-clear:hover { color: rgba(255,255,255,0.7); }

.refresh-hint { font-size: 0.68rem; color: rgba(255,255,255,0.2); margin: 8px 0 0; text-align: center; }

/* ══ Modal backdrop ══ */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 20px;
}

/* ══ Modal box ══ */
.modal-box {
  background: linear-gradient(145deg, #0f0f1a 0%, #141428 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 18px;
  padding: 32px 28px;
  width: 100%; max-width: 440px;
  box-shadow: 0 30px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset;
  display: flex; flex-direction: column; gap: 18px;
}
.create-modal { max-width: 480px; }

.modal-icon    { font-size: 2.4rem; text-align: center; line-height: 1; }
.modal-heading { margin: 0; font-size: 1.3rem; font-weight: 800; color: #fff; text-align: center; }
.modal-sub     { margin: -10px 0 0; font-size: 0.88rem; color: rgba(255,255,255,0.45); text-align: center; }

/* Fields */
.modal-field   { display: flex; flex-direction: column; gap: 6px; }
.modal-field--half { flex: 1; }
.modal-row     { display: flex; gap: 12px; }
.modal-label   { font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em; color: rgba(255,255,255,0.38); text-transform: uppercase; }
.required      { color: #ef5350; }

.modal-input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; padding: 10px 13px;
  color: rgba(255,255,255,0.88); font-size: 0.88rem;
  width: 100%; outline: none;
  transition: border-color 0.18s ease, background 0.18s ease;
}
.modal-input:focus { border-color: rgba(30,136,229,0.6); background: rgba(30,136,229,0.07); }
.modal-input::placeholder { color: rgba(255,255,255,0.2); }
.modal-textarea { resize: none; font-family: inherit; }
.modal-select   { appearance: none; -webkit-appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center; padding-right: 30px;
}
.modal-select option { background: #0f0f1a; }

/* Password input */
.pw-input {
  font-family: 'Courier New', monospace; font-size: 1.6rem;
  font-weight: 800; letter-spacing: 12px; text-align: center; text-transform: uppercase;
}
.pw-input::placeholder { letter-spacing: 8px; font-size: 1rem; opacity: 0.25; }

/* Toggle */
.modal-toggle {
  display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none;
}
.toggle-check { display: none; }
.toggle-track {
  width: 40px; height: 22px; border-radius: 11px;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.14);
  position: relative; transition: background 0.2s ease, border-color 0.2s ease;
  flex-shrink: 0;
}
.toggle-check:checked ~ .toggle-track { background: #1e88e5; border-color: #1565c0; }
.toggle-thumb {
  width: 16px; height: 16px; border-radius: 50%;
  background: rgba(255,255,255,0.5); position: absolute; top: 2px; left: 2px;
  transition: transform 0.2s ease, background 0.2s ease;
}
.toggle-check:checked ~ .toggle-track .toggle-thumb {
  transform: translateX(18px); background: #fff;
}
.toggle-label { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.7); }

/* Password preview */
.password-preview {
  display: flex; align-items: center; gap: 10px;
  background: rgba(30,136,229,0.08); border: 1px solid rgba(30,136,229,0.2);
  border-radius: 8px; padding: 10px 14px;
}
.pw-preview-label { font-size: 0.7rem; font-weight: 700; color: rgba(255,255,255,0.35); letter-spacing: 0.05em; text-transform: uppercase; }
.pw-preview-code  { flex: 1; font-family: monospace; font-size: 1.3rem; font-weight: 800; color: #64b5f6; letter-spacing: 8px; text-align: center; }
.pw-regen {
  background: none; border: none; color: rgba(255,255,255,0.4);
  font-size: 1.1rem; cursor: pointer; padding: 2px 6px;
  transition: color 0.15s ease, transform 0.2s ease;
}
.pw-regen:hover { color: #64b5f6; transform: rotate(180deg); }

/* Modal actions */
.modal-actions { display: flex; gap: 10px; }
.modal-btn {
  flex: 1; padding: 11px; border-radius: 8px;
  font-size: 0.88rem; font-weight: 700; cursor: pointer;
  border: none; transition: transform 0.12s ease, filter 0.12s ease;
}
.modal-btn:hover  { transform: translateY(-1px); filter: brightness(1.1); }
.modal-btn:active { transform: translateY(0); }
.modal-btn--primary {
  background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
  color: #fff; box-shadow: 0 2px 12px rgba(30,136,229,0.3);
}
.modal-btn--ghost {
  background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.1);
}

/* ══ Language filter ══ */
.filter-section { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
.filter-label {
  font-size: 0.62rem; font-weight: 800; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.28); text-transform: uppercase; margin: 0;
}
.filter-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.filter-pill {
  padding: 5px 13px; border-radius: 20px;
  font-size: 0.74rem; font-weight: 700; letter-spacing: 0.04em;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.filter-pill:hover {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.75);
  border-color: rgba(255,255,255,0.2);
}
.filter-pill--active {
  background: rgba(30,136,229,0.18);
  border-color: rgba(30,136,229,0.45);
  color: #64b5f6;
}
.filter-pill--active:hover {
  background: rgba(30,136,229,0.26);
  border-color: rgba(30,136,229,0.6);
}

/* ══ Modal transition ══ */
.modal-fade-enter-active { transition: all 0.22s ease; }
.modal-fade-leave-active { transition: all 0.16s ease; }
.modal-fade-enter-from  { opacity: 0; }
.modal-fade-leave-to    { opacity: 0; }
.modal-fade-enter-from .modal-box { transform: translateY(20px) scale(0.97); }
.modal-fade-leave-to   .modal-box { transform: translateY(10px) scale(0.98); }
</style>
