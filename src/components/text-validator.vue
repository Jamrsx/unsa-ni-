<!-- similar to component 'text-pill.vue' but without bg-color functions. good for making table  column validators -->
<script setup>
import { computed } from "vue"

const props = defineProps({
  allowed: { type: Array, required: true },
  word: { type: String, required: true }
})

// Find index of displayed word inside allowed[]
// const index = computed(() => props.allowed.indexOf(props.word))
const correctedWord = computed(() => props.allowed.includes(props.word)? props.word : '') //fallback to no text if no match to allowed
</script>

<template>
  <span
    class="text-validator"
  >
    {{ correctedWord }}
  </span>
</template>

<style scoped>
.text-validator {
  padding: 6px 12px;
  border-radius: 30px;
  font-size: 13px;
  text-transform: capitalize;
  display: inline-block;
  font-weight: 600;
}
</style>
