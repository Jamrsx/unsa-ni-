<script setup>
import { ref, computed, watch } from 'vue';
import { getSocket } from '../js/socket.js';
import ToggleButton from './toggle-button.vue';
import TextField from './text-field.vue';
import ButtonText from './button-text.vue';
import ModalButton from './modal-button.vue';
import SliderRange from './slider-range.vue';
import DropdownArray from './dropdown-array.vue';

const socket = getSocket();

const props = defineProps({
  lobby: { type: Object, default: null },
  currentUserId: { type: Number, default: null }
});

// Difficulty — saves to server on change
const difficulty = ref(props.lobby?.difficulty || 'Easy');

// Programming language — saves to server on change, locks into LobbyOnboarding
const programmingLanguage = ref(props.lobby?.programming_language || 'Python');
const languageOptions = ['Python', 'Java', 'C++', 'JavaScript'];

// Timer
const matchDurationMinutes = ref(5);
const matchDurationSeconds = ref(0);
const totalMatchDuration = computed(() => (matchDurationMinutes.value * 60) + matchDurationSeconds.value);

// Host role
const hostRole = ref('player');
const isChangingRole = ref(false);

// Sync hostRole from lobby.players
watch(() => props.lobby?.players, (players) => {
  if (!players || !props.currentUserId || isChangingRole.value) return;
  const isInPlayers = players.some(p => p.user_id === props.currentUserId);
  const expectedRole = isInPlayers ? 'player' : 'spectator';
  if (hostRole.value !== expectedRole) hostRole.value = expectedRole;
}, { immediate: true, deep: true });

// Sync difficulty/language if lobby prop refreshes
watch(() => props.lobby?.difficulty, (val) => { if (val) difficulty.value = val; });
watch(() => props.lobby?.programming_language, (val) => { if (val) programmingLanguage.value = val; });

// Difficulty change → emit to server (debounced)
let difficultyTimer = null;
watch(difficulty, (newVal) => {
  if (!props.lobby?.lobby_id) return;
  clearTimeout(difficultyTimer);
  difficultyTimer = setTimeout(() => {
    socket.emit('update_lobby_settings', { lobbyId: props.lobby.lobby_id, difficulty: newVal }, (res) => {
      if (res.success) console.log('[RoomSettings] ✓ Difficulty saved:', newVal);
      else console.error('[RoomSettings] Failed to save difficulty:', res.error);
    });
  }, 300);
});

// Language change → emit immediately
watch(programmingLanguage, (newVal) => {
  if (!props.lobby?.lobby_id) return;
  socket.emit('update_lobby_settings', { lobbyId: props.lobby.lobby_id, programmingLanguage: newVal }, (res) => {
    if (res.success) console.log('[RoomSettings] ✓ Language saved:', newVal);
    else console.error('[RoomSettings] Failed to save language:', res.error);
  });
});

// Host role change
watch(hostRole, (newRole, oldRole) => {
  if (!props.lobby?.lobby_id || isChangingRole.value) return;
  isChangingRole.value = true;
  socket.emit('set_host_role', { lobbyId: props.lobby.lobby_id, role: newRole }, (response) => {
    if (response.success) {
      setTimeout(() => { isChangingRole.value = false; }, 500);
    } else {
      console.error('[RoomSettings] Failed to update host role:', response.error);
      isChangingRole.value = false;
      hostRole.value = oldRole;
    }
  });
});

defineExpose({ getMatchDuration: () => totalMatchDuration.value });
</script>

<template>
    <form action="">
        <div class="row d-flex flex-column">
            <div class="col row room-details-panel d-flex flex-column">
                <div class="col room-details-panel-col">
                    <!-- Room Type (read-only) -->
                    <div class="highlighted-field">
                        <TextField
                            label="Room Type"
                            name="room_type"
                            :modelValue="props.lobby?.is_private ? 'Private Room' : 'Public Room'"
                            :disabled="true"
                        />
                    </div>

                    <!-- Programming Language — editable, locks into LobbyOnboarding -->
                    <div class="highlighted-field language-field">
                        <label class="field-label">PROGRAMMING LANGUAGE</label>
                        <select v-model="programmingLanguage" class="language-select">
                            <option v-for="lang in languageOptions" :key="lang" :value="lang">{{ lang }}</option>
                        </select>
                    </div>

                    <div v-if="props.lobby?.is_private" class="highlighted-field">
                        <TextField
                            label="Password"
                            name="room_password"
                            :modelValue="props.lobby?.password || 'No password set'"
                            :disabled="true"
                        />
                    </div>
                </div>

                <div class="col room-details-panel-col">
                    <ModalButton modal_btn_id="modal-btn-problem-set" modal_btn_title="Choose problem set" :auto="false" />

                    <!-- Match Duration Timer -->
                    <div class="timer-input-container">
                        <label class="timer-label">⏱️ MATCH DURATION</label>
                        <div class="timer-inputs">
                            <div class="timer-field">
                                <input type="number" v-model.number="matchDurationMinutes" min="0" max="60" class="timer-input" placeholder="Min" />
                                <span class="timer-unit">MIN</span>
                            </div>
                            <span class="timer-separator">:</span>
                            <div class="timer-field">
                                <input type="number" v-model.number="matchDurationSeconds" min="0" max="59" class="timer-input" placeholder="Sec" />
                                <span class="timer-unit">SEC</span>
                            </div>
                        </div>
                        <p class="timer-total">Total: <strong>{{ totalMatchDuration }}</strong> seconds</p>
                    </div>

                </div>

                <div class="col room-details-panel-col">
                    <ModalButton modal_btn_id="modal-btn-topic-filter" modal_btn_title="Select topic and filters" :auto="false" />

                    <!-- Difficulty — now saves to server -->
                    <DropdownArray
                        id="FilterDifficultyDropdown"
                        :options="['Easy', 'Medium', 'Hard']"
                        v-model="difficulty"
                    />

                    <!-- Host Role Selection -->
                    <div class="host-role-selector" :class="{ 'loading': isChangingRole }">
                        <label class="role-label">YOUR ROLE (HOST):</label>
                        <div v-if="isChangingRole" class="role-loading">
                            <span class="spinner">⏳</span>
                            <span>Updating role...</span>
                        </div>
                        <div class="role-options">
                            <label class="role-option" :class="{ 'active': hostRole === 'player', 'disabled': isChangingRole }">
                                <input type="radio" v-model="hostRole" value="player" :disabled="isChangingRole" />
                                <span class="role-icon">🎮</span>
                                <span class="role-text">Join as Player</span>
                                <span class="role-desc">Participate in match</span>
                            </label>
                            <label class="role-option" :class="{ 'active': hostRole === 'spectator', 'disabled': isChangingRole }">
                                <input type="radio" v-model="hostRole" value="spectator" :disabled="isChangingRole" />
                                <span class="role-icon">👁️</span>
                                <span class="role-text">Spectate Only</span>
                                <span class="role-desc">Observe without playing</span>
                            </label>
                        </div>
                        <p v-if="hostRole === 'spectator' && !isChangingRole" class="role-warning">
                            ⚠️ As spectator, you won't take a player slot and cannot participate
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </form>
</template>

<style scoped>
/* ── Base field card ── */
.highlighted-field {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-left: 3px solid #1e88e5;
    padding: 10px 14px;
    margin-bottom: 12px;
    border-radius: 8px;
    transition: border-color 0.2s ease, background 0.2s ease;
}
.highlighted-field:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.14);
    border-left-color: #42a5f5;
}
.highlighted-field :deep(.form-control) {
    background: transparent;
    color: rgba(255,255,255,0.85);
    border: none;
    font-weight: 600;
    padding: 0;
}
.highlighted-field :deep(.text-label) {
    color: rgba(255,255,255,0.4);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    margin-bottom: 2px;
}

/* ── Language select ── */
.field-label {
    display: block;
    color: rgba(255,255,255,0.4);
    font-weight: 700;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 6px;
}
.language-select {
    width: 100%;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 6px;
    color: rgba(255,255,255,0.85);
    padding: 8px 12px;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s ease, background 0.2s ease;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 32px;
}
.language-select:focus {
    border-color: #1e88e5;
    background-color: rgba(30,136,229,0.08);
}
.language-select option {
    background: #1a1a2e;
    color: white;
}

/* ── Timer ── */
.timer-input-container {
    margin-bottom: 14px;
    padding: 14px;
    background: rgba(255,152,0,0.06);
    border: 1px solid rgba(255,152,0,0.18);
    border-left: 3px solid #ff9800;
    border-radius: 8px;
}
.timer-label {
    display: block;
    color: rgba(255,152,0,0.8);
    font-weight: 700;
    font-size: 0.72rem;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}
.timer-inputs {
    display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
}
.timer-field { display: flex; align-items: center; gap: 5px; flex: 1; }
.timer-input {
    width: 100%; padding: 8px; text-align: center;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,152,0,0.25);
    border-radius: 6px;
    font-size: 1rem; font-weight: 700;
    color: rgba(255,255,255,0.9);
    transition: border-color 0.2s ease;
}
.timer-input:focus { outline: none; border-color: #ff9800; }
.timer-input::-webkit-inner-spin-button,
.timer-input::-webkit-outer-spin-button { opacity: 1; height: 24px; }
.timer-unit { font-size: 0.65rem; color: rgba(255,255,255,0.35); font-weight: 700; text-transform: uppercase; }
.timer-separator { font-size: 1.4rem; font-weight: 700; color: rgba(255,152,0,0.6); }
.timer-total {
    margin: 0; padding: 6px 10px;
    background: rgba(255,152,0,0.08);
    border-radius: 4px; font-size: 0.8rem;
    color: rgba(255,255,255,0.4); text-align: center;
}
.timer-total strong { color: #ff9800; }

/* ── Host Role Selector ── */
.host-role-selector {
    margin-top: 14px; padding: 14px;
    background: rgba(102,126,234,0.07);
    border: 1px solid rgba(102,126,234,0.2);
    border-left: 3px solid #667eea;
    border-radius: 8px;
    transition: opacity 0.2s ease;
}
.host-role-selector.loading { opacity: 0.6; pointer-events: none; }
.role-label {
    display: block;
    color: rgba(102,126,234,0.9);
    font-weight: 700; font-size: 0.72rem;
    margin-bottom: 10px;
    text-transform: uppercase; letter-spacing: 0.06em;
}
.role-options { display: flex; flex-direction: column; gap: 8px; }
.role-option {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px; cursor: pointer;
    transition: all 0.18s ease;
}
.role-option:hover {
    background: rgba(102,126,234,0.1);
    border-color: rgba(102,126,234,0.3);
    transform: translateX(2px);
}
.role-option.active {
    background: rgba(102,126,234,0.14);
    border-color: rgba(102,126,234,0.45);
    box-shadow: 0 2px 12px rgba(102,126,234,0.15);
}
.role-option.disabled { opacity: 0.45; cursor: not-allowed; pointer-events: none; }
.role-option input[type="radio"] { width: 15px; height: 15px; cursor: pointer; accent-color: #667eea; }
.role-loading {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px; margin-bottom: 8px;
    background: rgba(255,193,7,0.08); border-radius: 5px;
    font-size: 0.82rem; color: rgba(255,193,7,0.8);
}
.role-loading .spinner { animation: rc-spin 1s linear infinite; display: inline-block; }
@keyframes rc-spin { to { transform: rotate(360deg); } }
.role-icon { font-size: 1.3rem; }
.role-text { font-weight: 700; color: rgba(255,255,255,0.85); flex: 1; font-size: 0.85rem; }
.role-desc { font-size: 0.7rem; color: rgba(255,255,255,0.3); font-style: italic; }
.role-warning {
    margin: 8px 0 0 0; padding: 7px 10px;
    background: rgba(255,193,7,0.1);
    border-left: 2px solid #ffc107;
    border-radius: 4px; font-size: 0.75rem; color: rgba(255,193,7,0.8);
}
</style>   
