<template>
  <div class="player-stat-level">
    <div class="level-ring">
      <svg class="progress-ring" :width="size" :height="size">
        <!-- Background circle -->
        <circle
          class="progress-ring-bg"
          :stroke-width="stroke"
          :r="radius"
          :cx="center"
          :cy="center"
        />
        <!-- Foreground progress circle -->
        <circle
          class="progress-ring-progress"
          :stroke-width="stroke"
          :r="radius"
          :cx="center"
          :cy="center"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>

      <!-- Center text -->
      <div class="level-text">
        <h5>Lvl</h5>
        <h1>{{ level }}</h1>
      </div>
    </div>
    <div class="exp-text">{{ currentExp }} / {{ maxExp }}</div>
  </div>
</template>

<script setup>
/* ---------------------------------------------------
   Imports
--------------------------------------------------- */
import { computed } from 'vue'

/* ---------------------------------------------------
   Props
--------------------------------------------------- */
const props = defineProps({
  level: {
    type: Number,
    default: 1
  },
  maxExp: {
    type: Number,
    default: 100
  },
  currentExp: {
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    default: 120
  },
  stroke: {
    type: Number,
    default: 10
  }
})

/* ---------------------------------------------------
   Derived SVG values
--------------------------------------------------- */
const center = computed(() => props.size / 2)
/* radius must subtract stroke to avoid clipping */
const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)

/* ---------------------------------------------------
   Progress calculation
--------------------------------------------------- */
const progress = computed(() => Math.min(props.currentExp / props.maxExp, 1))

/* stroke offset: how much of the circle is "empty" */
const dashOffset = computed(() => circumference.value * (1 - progress.value))
</script>
