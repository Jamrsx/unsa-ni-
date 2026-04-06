<template>
  <div>
    <label :for="name" class="password-label form-label">{{ label }}:</label>
    <input
      type="password"
      :value="modelValueLocal"
      :name="name"
      class="form-control"
      :id="name"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="isRequired"
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
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  isRequired: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

let modelValueLocal = props.modelValue;

function onInput(e) {
  modelValueLocal = e.target.value;
  emit('update:modelValue', modelValueLocal);
}

watch(() => props.modelValue, val => modelValueLocal = val);
</script>
