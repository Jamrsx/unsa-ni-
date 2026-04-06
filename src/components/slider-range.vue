<!-- input with slider range from min to max  -->

<template>
  <div class="slider-container">
    <label v-if="label" class="slider-label">{{ label }}</label>
    <span class="slider-value">{{ model }}</span>
    <input
      type="range"
      v-model="model"
      :min="min"
      :max="max"
      :step="step"
      class="slider"
    />
  </div>
</template>

<script setup>
import {watch} from 'vue'
const props = defineProps({
  label: String,
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  defaultValue: { type: Number, default: 0 }
})

// using defineModel for two-way binding
const model = defineModel({
  type: Number,
  default: 0
})

watch(
  () => props.defaultValue,
  (val) => (model.value = val),
  { immediate: true }
)
</script>
