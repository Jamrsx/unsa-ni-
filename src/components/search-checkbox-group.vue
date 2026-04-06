<!-- 
 Hierarchy:
 search-panel.vue
    search-bar-and-sort.vue
    search-checkbox-group.vue
    dropdown-array.vue
-->

<template>
  <button
    @click="toggle"
    :class="[
      'search-checkbox-btn',
      unavailable ? 'search-checkbox-btn-unavailable' : (
        model
          ? 'search-checkbox-btn-enable'
          : 'search-checkbox-btn-disable'
      )
    ]"
    :disabled="unavailable"
  >
    {{ label }}
  </button>
</template>

<script setup>
const model = defineModel({ type: Boolean })
const props = defineProps({ 
  label: String,
  unavailable: { type: Boolean, default: false }
})

function toggle() {
  if (!props.unavailable) {
    model.value = !model.value
  }
}
</script>

<style scoped>
.search-checkbox-btn-unavailable {
  background-color: #ffebee;
  color: #c62828;
  border-color: #ef5350;
  opacity: 0.7;
  cursor: not-allowed;
}

.search-checkbox-btn-unavailable:hover {
  background-color: #ffcdd2;
  border-color: #e53935;
}
</style>
