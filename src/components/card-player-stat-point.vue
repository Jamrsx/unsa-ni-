<template>
  <div>
    <!-- Title of the stat -->
    <p>{{ title }}</p>

    <!-- Display points (can include suffix like xp or dp) -->
    <p>{{ typeof points === 'string' ? points : formattedPoints }}</p>
  </div>
</template>

<script setup>
/* ---------------------------------------------------
   Props
--------------------------------------------------- */
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  points: {
    type: [Number, String],
    default: 0
  }
})

/* ---------------------------------------------------
   Computed: format points for Number type
   Add '+' sign for positive values and 'xp' suffix
--------------------------------------------------- */
import { computed } from 'vue'

const formattedPoints = computed(() => {
  if (typeof props.points === 'number') {
    return props.points >= 0 ? `+${props.points}xp` : `${props.points}xp`
  }
  return props.points
})
</script>
