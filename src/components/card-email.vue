<template>
    <!-- emits @select to outside/parent then overwrites 'select' variable in content_email.vue even const -->
  <div class="card-email" @click="$emit('select')">
    <div class="email-title">{{ safeTitle }}</div>
    <div class="email-date">{{ safeDate }}</div>
  </div>
</template>

<script setup>
/**
 * @typedef {'Match finished' | 'Friend request' | 'Welcome back' | 'Inactivity detected' | 'Room invited'} EmailTitle
 */

import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    /**
     * @type {EmailTitle}
     */
    default: 'Match finished'
  },
  date: {
    type: String,
    default: ''
  }
});

/* Auto-correct invalid titles */
const safeTitle = computed(() => {
  const allowed = ['Match finished', 'Friend request', 'Welcome back', 'Inactivity detected', 'Room invited'];
  return allowed.includes(props.title) ? props.title : 'Match finished';
});

/* Auto-correct invalid date (fallback today) */
const safeDate = computed(() => {
  return props.date || new Date().toLocaleDateString();
});
</script>
