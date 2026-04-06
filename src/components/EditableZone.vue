<template>
  <div
    contenteditable="true"
    class="editable"
    @input="updateText"
    ref="editable"
  >{{ text }}</div>
</template>

<script setup>
import { ref } from 'vue'

const text = ref('Edit this text and sync with the public zone!!!')
const editable = ref(null)

function updateText() {
  text.value = editable.value.innerText
  console.log('Edited:', text.value)
}
</script>

<style scoped>
.editable {
  border: 1px dashed blue;
  padding: 8px;
  min-height: 50px;
}
</style>
