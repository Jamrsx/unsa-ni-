<template>
  <div class="player-stat-level-mini">
    <div class="level-ring">
        <svg class="progress-ring" :width="size" :height="size">
            <!-- Background circle -->
            <circle
                class="progress-ring-bg"
                :stroke-width="stroke"
                :r="center"
                :cx="center"
                :cy="center"
            />
        </svg>

        <!-- Center text -->
        <div class="level-text">
            <p>{{ level }}</p>
        </div>
    </div>
  </div>
  
  
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    level: {
      type: Number,
      default: 1
    },
    size:{
      type: Number,
      default: 10
    }
  })

  // derived values for SVG circle
  const center = computed(() => props.size / 2)
</script>
