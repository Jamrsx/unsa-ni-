<script setup>
import { computed } from "vue"

const props = defineProps({
  allowed: { type: Array, required: true },
  colors: { type: Array, required: true },
  word: { type: String, required: true },
  size: { type: String, default: 'md' } // 'sm' | 'md'
})

// Find index of displayed word inside allowed[]
const index = computed(() => props.allowed.indexOf(props.word))

// Get corresponding background color
const bgColor = computed(() => props.colors[index.value] || "#ddd") // fallback color

const pillClass = computed(() => ({
  'text-pill': true,
  'text-pill-sm': props.size === 'sm'
}))
</script>

<template>
  <span
    :class="pillClass"
    :style="{ background: bgColor, color: 'white' }"
  >
    {{ word }}
  </span>
</template>

<style scoped>
.text-pill {
  padding: 6px 12px;
  border-radius: 30px;
  font-size: 13px;
  text-transform: capitalize;
  display: inline-block;
  font-weight: 600;
}

.text-pill-sm {
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 11px;
}
</style>
