<template>
  <div class="header-dropdown" @mouseenter="open" @mouseleave="close">
    <div class="header-dropdown-trigger" ref="triggerRef">
      <slot />
    </div>

    <transition name="fade">
      <div v-if="visible" ref="menuRef" :style="menuStyles" class="dropdown-menu" role="menu" @mouseenter="keepOpen" @mouseleave="close">
        <ButtonText title="Profile" class="dropdown-item" alt-text="profile" link="#" />
        <ButtonText title="Log out" class="dropdown-item" alt-text="logout" @click="showLogoutModal" />
      </div>
    </transition>
    <LogoutModal ref="logoutModalRef" modalId="logout-modal-header" @confirm="confirmLogout" />
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onBeforeUnmount } from 'vue'
import ButtonText from './button-text.vue'
import LogoutModal from './LogoutModal.vue'
import { logout } from '../js/auth.js'

const visible = ref(false)
let closeTimer = null

// element refs for sizing
const triggerRef = ref(null)
const menuRef = ref(null)
const menuStyles = ref({})
const logoutModalRef = ref(null)

function open() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  visible.value = true
}

function keepOpen() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  visible.value = true
}

function close() {
  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = setTimeout(() => {
    visible.value = false
    closeTimer = null
  }, 150)
}

function updateMenuWidth() {
  try {
    const el = triggerRef.value
    if (!el) return
    const w = Math.ceil(el.getBoundingClientRect().width)
    // use min-width so the menu won't become smaller than a usable baseline
    const baseline = 220
    menuStyles.value = { minWidth: Math.max(baseline, w) + 'px' }
  } catch (e) {
    // ignore measurement failures
  }
}

watch(visible, async (v) => {
  if (v) {
    await nextTick()
    updateMenuWidth()
    window.addEventListener('resize', updateMenuWidth)
  } else {
    window.removeEventListener('resize', updateMenuWidth)
    menuStyles.value = {}
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMenuWidth)
})

function showLogoutModal() {
  try {
    if (logoutModalRef && logoutModalRef.value && typeof logoutModalRef.value.show === 'function') {
      logoutModalRef.value.show()
      return
    }
    const el = document.getElementById('logout-modal-header')
    if (el && window.bootstrap && typeof window.bootstrap.Modal === 'function') {
      const m = new window.bootstrap.Modal(el)
      m.show()
      return
    }
    const btn = document.querySelector('[data-bs-target="#logout-modal-header"]')
    if (btn) btn.click()
  } catch (e) {
    console.error('Show logout modal failed', e)
  }
}

async function confirmLogout() {
  try {
    await logout()
  } catch (e) {
    console.error('Logout failed', e)
  }
}
</script>

<!-- styles moved to public/css/mainpage.css under header.vue -->
