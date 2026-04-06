<template>
  <div class="testcase-card">
    <div class="testcase-card-left">
        <!-- will check input checkbox into if-else statement images to avoid editing checkbox through DOM -->
        <input type="checkbox" v-model="checked" class="testcase-checkbox" disabled style="pointer-events: none;" />
        
    </div>
    <div class="testcase-card-right">
        <p><span class="testcase-number">Test Case #{{ number }}</span></p>
        <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps({
  number: {
    type: Number,
    required: true
  },
  checked: {
    type: Boolean,
    default: false
  }
});
const checked = ref(props.checked);
</script>
