<template>
  <transition name="toast-fade">
    <div v-if="visible" :class="['dc-toast', typeClass]" role="status" aria-live="polite">
      <div class="dc-toast-inner">
        <slot>{{ message }}</slot>
        <button class="dc-toast-close" @click="close">✕</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';

const props = defineProps({
  message: { type: String, default: '' },
  type: { type: String, default: 'gray' }, // 'success'|'error'|'gray'
  duration: { type: Number, default: 3000 },
  modelValue: { type: Boolean, default: true }
});

const emits = defineEmits(['update:modelValue', 'close']);

const visible = ref(props.modelValue);

watch(() => props.modelValue, (v) => {
  visible.value = v;
});

watch(visible, (v) => {
  emits('update:modelValue', v);
});

let timer = null;

function startTimer() {
  if (props.duration > 0) {
    clearTimer();
    timer = setTimeout(() => {
      close();
    }, props.duration);
  }
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function close() {
  clearTimer();
  visible.value = false;
  emits('close');
}

onMounted(() => {
  startTimer();
});

const typeClass = computed(() => {
  switch (props.type) {
    case 'success': return 'dc-toast-success';
    case 'error': return 'dc-toast-error';
    default: return 'dc-toast-gray';
  }
});
</script>

<style scoped>
.dc-toast {
  position: fixed;
  right: 20px;
  top: 20px;
  min-width: 220px;
  max-width: 360px;
  padding: 12px 14px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  color: #fff;
  z-index: 9999;
  display: flex;
  align-items: center;
}
.dc-toast-inner { display:flex; align-items:center; width:100%; }
.dc-toast-close {
  margin-left: 12px;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
}

.dc-toast-success { background: #2ecc71; }
.dc-toast-error { background: #e74c3c; }
.dc-toast-gray { background: #7f8c8d; }

.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.25s; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; }
</style>

<script context="module">
import { createApp, h } from 'vue';

// Programmatic helper to show a one-off toast using this component file.
export function showToast(message, type = 'success', duration = 3000) {
  return new Promise((resolve) => {
    // dynamically import the SFC module (this file) so bundlers return the compiled component
    import('./Toast.vue').then((mod) => {
      const ToastComp = mod.default;
        // prefer mounting into the global toast container if available
        const host = document.querySelector('#dc-toast-container') || document.body;
        const container = document.createElement('div');
        // mark wrapper to make debugging easier
        container.className = 'dc-toast-wrapper';
        host.appendChild(container);

      const app = createApp({
        render() {
          return h(ToastComp, {
            message,
            type,
            duration,
            onClose: () => {
              // unmount and remove
              setTimeout(() => {
                app.unmount();
                if (container.parentNode) container.parentNode.removeChild(container);
                resolve();
              }, 0);
            }
          });
        }
      });

      app.mount(container);
    }).catch((err) => {
      console.error('Failed to load Toast component for programmatic show:', err);
      resolve();
    });
  });
}

export const toastSuccess = (msg, d = 3000) => showToast(msg, 'success', d);
export const toastError = (msg, d = 4000) => showToast(msg, 'error', d);
export const toastInfo = (msg, d = 3000) => showToast(msg, 'gray', d);
</script>
