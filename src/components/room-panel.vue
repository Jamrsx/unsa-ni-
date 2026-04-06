<!-- room-panel.vue -->
<!-- 
 Hierarchy:
 room-panel.vue
    room-panel-card.vue
        room-player-info.vue
-->

<script>
    import RoomPanelCard from './room-panel-card.vue'
    export default{
        components:{
            RoomPanelCard
        }
    }
</script>

<template>
  <div class="room-panel">

    <div class="panel-grid">
      <RoomPanelCard
        v-for="(slot, index) in slots"
        :key="index"
        :player="slot.player"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  slots: {
    type: Array,
    default: () => [
      { player: null },
      { player: null },
      { player: null },
      { player: null },
      { player: null },
      { player: null },
      { player: null },
      { player: null },
      { player: null },
      { player: null }
    ]
  }
})
</script>

<style scoped>
.room-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  min-height: 0;
}

.panel-grid {
  max-height: 100%;
  overflow-y: auto;
  padding-right: 8px;
  flex: 1;
  min-height: 0;
}

/* Custom scrollbar styling */
.panel-grid::-webkit-scrollbar {
  width: 8px;
}

.panel-grid::-webkit-scrollbar-track {
  background: #1e1e2f;
  border-radius: 4px;
}

.panel-grid::-webkit-scrollbar-thumb {
  background: #4a4a6a;
  border-radius: 4px;
}

.panel-grid::-webkit-scrollbar-thumb:hover {
  background: #5a5a7a;
}
</style>
