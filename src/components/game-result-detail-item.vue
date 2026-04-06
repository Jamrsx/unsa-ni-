<!-- game-result-detail-item.vue -->
<template>
  <div class="grdi-row">
    <span class="grdi-title">{{ title }}</span>
    <span class="grdi-value">{{ value }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  value: { type: String, default: '' }
});
</script>

<style scoped>
.grdi-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  gap: 8px;
}
.grdi-row:last-child { border-bottom: none; }
.grdi-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
.grdi-value {
  font-size: 0.82rem;
  font-weight: 800;
  font-family: monospace;
  color: rgba(255,255,255,0.82);
  text-align: right;
}
</style>
