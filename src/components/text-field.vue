<template>
  <div>
    <label :for="name" class="text-label form-label">{{ label }}:</label>
    <input
      type="text"
      :value="modelValueLocal"
      :name="name"
      class="form-control"
      :id="name"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
    >
  </div>
</template>

<script setup>
import { watch } from 'vue';
const props = defineProps({
  label: { type: String, default: 'Toggle' },
  name: { type: String, required: true },
  placeholder: { type: String, default: '' },
  modelValue: { type: String, default: '' }, // v-model binding
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

let modelValueLocal = props.modelValue;

// Update local value on typing
function onInput(e) {
  modelValueLocal = e.target.value;
  emit('update:modelValue', modelValueLocal); // emits for parent
}

// Watch parent change to update local value
watch(() => props.modelValue, val => modelValueLocal = val);
</script>
