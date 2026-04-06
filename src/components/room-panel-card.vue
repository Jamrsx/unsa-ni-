<!-- room-panel-card.vue -->
<!-- 
 Hierarchy:
 room-panel.vue
    room-panel-card.vue
        room-player-info.vue
-->

<script>
    import RoomPlayerInfo from './room-player-info.vue'
    export default{
        components:{
            RoomPlayerInfo
        }
    }
</script>
<template>
  <div class="room-panel-card panel-card">
    <RoomPlayerInfo
      v-if="player"
      :player-name="player.name"
      :player-id="player.id"
      :player-icon="player.icon"
      :is-ready="player.isReady"
      :is-host="player.isHost"
    />
    <div v-else class="waiting">
        <div class="spinner-border" role="status" alt="Waiting...">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p>Waiting for player...</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  player: {
    type: Object,
    default: null
  }
})
</script>
