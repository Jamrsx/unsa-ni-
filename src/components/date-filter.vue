<!-- 
    Date Filter Component for Table Sorting
    Returns selected date string in format: "Dec 11, 2025" or "All"
-->

<template>
  <div class="date-filter d-flex items-center gap-2">
    <!-- Date Input -->
    <input
      v-model="selectedDate"
      @change="emitDateChange"
      type="date"
      class="date-input border rounded-lg px-3 py-1 w-full outline-none focus:ring focus:ring-blue-300"
    />

    <!-- Clear Button -->
    <button
      @click="clearDate"
      class="clear-date-btn px-3 py-1 rounded-lg border hover:bg-gray-100 transition"
      title="Clear filter"
    >
      ✕
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: 'All' }
})

const emit = defineEmits(['update:modelValue'])

const selectedDate = ref('')

// Convert "Dec 11, 2025" format to "2025-12-11" for input
function formatToInputDate(dateStr) {
  if (!dateStr || dateStr === 'All') return ''
  try {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

// Convert "2025-12-11" to "Dec 11, 2025" format
function formatToDisplayDate(inputDate) {
  if (!inputDate) return 'All'
  try {
    const date = new Date(inputDate + 'T00:00:00')
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  } catch {
    return 'All'
  }
}

function emitDateChange() {
  const formattedDate = formatToDisplayDate(selectedDate.value)
  emit('update:modelValue', formattedDate)
}

function clearDate() {
  selectedDate.value = ''
  emit('update:modelValue', 'All')
}

watch(() => props.modelValue, (val) => { 
  selectedDate.value = formatToInputDate(val)
})

// Initialize
if (props.modelValue && props.modelValue !== 'All') {
  selectedDate.value = formatToInputDate(props.modelValue)
}
</script>

<style scoped>
.date-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  flex: 1;
  min-width: 150px;
}

.clear-date-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
}

.clear-date-btn:hover {
  background-color: #f3f4f6;
}
</style>
