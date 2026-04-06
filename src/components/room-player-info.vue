<!-- room-player-info.vue -->
<!-- 
 Hierarchy:
 room-panel.vue
    room-panel-card.vue
        room-player-info.vue
-->

<template>
  <div class="room-player-info player-info" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
    <img :src="playerIcon" alt="Icon" class="player-icon" />

    <div class="player-text">
      <span class="player-name">
        {{ playerName }}
        <span v-if="isHost" class="host-badge" title="Host">👑</span>
      </span>
      <span class="player-id">#{{ playerId }}</span>
    </div>

    <div class="ready-status-indicator">
      <span v-if="isReady" class="ready-badge" title="Ready">✓</span>
      <span v-else class="not-ready-badge" title="Not Ready">⏳</span>
    </div>

    <div v-if="showTooltip" class="tooltip">
      {{ playerName }}#{{ playerId }}
      <span v-if="isHost"> (Host)</span>
      <span v-if="isReady"> - Ready</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  playerName: { type: String, required: true },
  playerId: { type: [String, Number], required: true },
  playerIcon: { type: String, default: '/default-avatar.png' },
  isReady: { type: Boolean, default: false },
  isHost: { type: Boolean, default: false }
})

const showTooltip = ref(false)
</script>

<style scoped>
.room-player-info {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-text {
  flex: 1;
  min-width: 0;
}

.player-name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.host-badge {
  font-size: 0.9em;
  filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.6));
}

.ready-status-indicator {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.ready-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #28a745;
  color: white;
  font-weight: bold;
  font-size: 0.85em;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
  animation: pulse-ready 2s ease-in-out infinite;
}

.not-ready-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #6c757d;
  color: white;
  font-size: 0.85em;
  padding: 4px 8px;
  border-radius: 12px;
  opacity: 0.7;
}

@keyframes pulse-ready {
  0%, 100% {
    box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
  }
  50% {
    box-shadow: 0 2px 8px rgba(40, 167, 69, 0.6), 0 0 12px rgba(40, 167, 69, 0.4);
  }
}
</style>
