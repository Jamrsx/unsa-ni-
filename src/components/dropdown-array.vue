<!-- <template>
  <div class="dropdown-container">
    <select class="dropdown-select" v-model="selected">
      <option v-for="(item, idx) in options" :key="idx" :value="item">{{ item }}</option>
    </select>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const model = defineModel()
const props = defineProps({
  options: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: String,
    default: ''
  }
});
const selected = ref(props.modelValue);
</script> -->


<template>
  <div class="dropdown-container">
    <select class="dropdown-select" v-model="model" :disabled="disabled">
      <option 
        v-for="(item, idx) in options" 
        :key="idx" 
        :value="item"
      >
        {{ item }}
      </option>
    </select>
  </div>
</template>

<script setup>
const model = defineModel() // this replaces manual props/emits setup

const props = defineProps({
  options: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>
