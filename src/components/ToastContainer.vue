<template>
  <div id="dc-toast-container" aria-live="polite" aria-atomic="true"></div>
</template>

<script setup>
// Toast container is a simple DOM holder; programmatic toasts mount into body.
</script>

<style scoped>
#dc-toast-container {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 99999;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  max-width: 360px;
}

/* Individual toast elements should allow pointer events so buttons/links work */
.dc-toast {
  pointer-events: auto;
  background: var(--toast-bg, rgba(30,30,30,0.95));
  color: var(--toast-color, #fff);
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  margin: 0;
}
</style>
