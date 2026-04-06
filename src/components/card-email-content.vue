<template>
  <div class="email-content-panel">
    <div class="content-header">
      <p class="title">{{ safeTitle }}</p>
      <p class="date">{{ safeDate }}</p>
    </div>

    <p class="body">{{ safeBody }}</p>

    <div class="actions">
        <!-- emits @delete to outside/parent then calls delete function in content_email.vue -->
      <button @click="$emit('delete')" class="delete-button">Delete Message</button>
    </div>
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
  },
  body: {
    type: String,
    default: 'No content.'
  }
});

/* Auto-correct the values */
const safeTitle = computed(() => {
  const allowed = ['Match finished', 'Friend request', 'Welcome back', 'Inactivity detected', 'Room invited'];
  return allowed.includes(props.title) ? props.title : 'Match finished';
});

const safeDate = computed(() => props.date || new Date().toLocaleDateString());

const safeBody = computed(() => props.body || 'No message available.');
</script>
