<!-- src/App.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import ModalButton from './components/modal-button.vue'
import Modals from './components/modal.vue'

const headerHTML = ref('')
const footerHTML = ref('')

onMounted(async () => {
  const [headerRes, footerRes] = await Promise.all([
    fetch('/header.html'),
    fetch('/footer.html'),
  ])
  headerHTML.value = await headerRes.text()
  footerHTML.value = await footerRes.text()
})
</script>

<template>
  <div v-html="headerHTML"></div>

  <!-- Page content is mounted separately per-page via main.js (e.g. #home_app, #duel_app) -->
  <slot />

  <ModalButton modal_btn_id="exampleModal" modal_btn_title="Open Modal" />
  <Modals
    modal_id="exampleModal"
    modal_title="Example Modal"
    :close_btn_footer_bool="true"
  >
    <template #content>
      <p>This is the modal content!</p>
    </template>
  </Modals>

  <div v-html="footerHTML"></div>
</template>

<style>
/* ── Global resets ── */
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background: #07070f;   /* matches HomeView dark bg — no green flash */
}

/* ── App root: column flex so header/page/footer stack correctly ── */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
}

/* ── RouterView fills all remaining space between header & footer ── */
#app > .v-router-view-root,
#app > * {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
}

/* ── Static header/footer injected divs ── */
#app > div:first-child,
#app > div:last-child {
  flex: 0 0 auto;
}

header, footer {
  background: #0c0c1a;
  padding: 10px;
  text-align: center;
  color: #8080aa;
  width: 100%;
}
</style>
