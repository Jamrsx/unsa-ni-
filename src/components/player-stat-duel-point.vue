<template>
  <div class="player-stat-duel-point">

    <div class="level-ring">
      <svg class="progress-ring" :width="size" :height="size">
        <!-- Background circle -->
        <circle
          class="ring-bg"
          :r="radius"
          :cx="center"
          :cy="center"
        />
      </svg>

      <!-- Center text -->
      <div class="rank-text">
        <h5>Rank no.</h5>
        <h1>{{ rank }}</h1>
      </div>
    </div>

    <div class="points-text">
      <h3>{{ points }}</h3>
    </div>

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
  rank: {
    type: Number,
    default: 1
  },
  points: {
    type: Number,
    default: 1
  },
  size: {
    type: Number,
    default: 120
  },
  stroke: {
    type: Number,
    default: 8 // added for proper circle sizing
  }
})

/* ---------------------------------------------------
   Computed SVG values
--------------------------------------------------- */
const center = computed(() => props.size / 2)

/* radius must subtract half the stroke width or else the circle gets cut off */
const radius = computed(() => (props.size - props.stroke) / 2)
</script>
