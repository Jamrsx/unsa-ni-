<template>
  <div class="code-editor" ref="container">
    <div class="line-numbers" ref="lines" @mousedown.prevent="focusTextarea">
      <!-- `pre` so numbers keep their spacing and line breaks -->
      <pre>{{ numbersText }}</pre>
    </div>

    <div class="editor-wrap">
      <textarea
        ref="ta"
        v-model="localValue"
        @input="onInput"
        @scroll="syncScroll"
        spellcheck="false"
        wrap="off"
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        class="editor-textarea"
        :aria-label="ariaLabel"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: 
  { 
    type: String,
    default: '' 
},
  ariaLabel: 
  { 
    type: String, 
    default: 'Code editor' 
}
})
const emit = defineEmits(['update:modelValue'])

const localValue = ref(props.modelValue)
const ta = ref(null)
const lines = ref(null)
const container = ref(null)

watch(() => props.modelValue, (v) => {
  if (v !== localValue.value) localValue.value = v ?? ''
})

watch(localValue, (v) => {
  emit('update:modelValue', v)
  // update numbers after DOM updates so number count reflects new lines
  nextTick(syncScroll)
})

const onInput = (e) => {
  // kept minimal — v-model already updates localValue
  // we call syncScroll in nextTick so line numbers' height & scroll align
  nextTick(() => {
    updateNumbers()
    syncScroll()
  })
}

const updateNumbers = () => {
  // This forces recompute of numbersText via localValue change
  // (no-op function kept for clarity / extension)
  return
}

const syncScroll = () => {
  if (!ta.value || !lines.value) return
  // copy vertical scroll position so line numbers scroll in sync
  lines.value.scrollTop = ta.value.scrollTop
  // optionally sync horizontal scroll visually by translating the numbers container,
  // but usually we keep numbers fixed so only vertical sync is needed.
}

const focusTextarea = () => {
  if (ta.value) ta.value.focus()
}

// computed string of line numbers — same number of lines as textarea value
const numbersText = computed(() => {
  // split by \n; if value ends with newline, split will create last empty entry — that's desired
  const text = localValue.value ?? ''
  const linesArr = text.split(/\r\n|\r|\n/)
  // If the file is empty, show 1
  const count = Math.max(1, linesArr.length)
  // create "1\n2\n3\n..." string
  return Array.from({ length: count }, (_, i) => i + 1).join('\n')
})
</script>
