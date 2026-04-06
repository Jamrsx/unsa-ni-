<template>
  <div class="header-notif-wrapper" ref="triggerRef" @mouseenter="open" @mouseleave="close">
    <slot name="trigger"></slot>

    <transition name="fade">
      <div v-if="visible" ref="menuRef" :style="menuStyles" class="notif-dropdown" @mouseenter="keepOpen" @mouseleave="close">
        <div class="notif-dropdown-header">
          <strong>Notifications</strong>
        </div>
        <div class="notif-dropdown-body">
          <scroll-vertical-carousel>
            <scroll-card v-for="(n, i) in (props.notifications || []).slice(0,3)" :key="i">
              <card-notification :title="n.title" :message="n.message" :time="n.time" :avatar="n.avatar" :unread="n.unread" />
            </scroll-card>
          </scroll-vertical-carousel>
        </div>
        <div class="notif-dropdown-footer">
          <ButtonText v-if="(props.notifications || []).length > 3"
            :title="`and ${ (props.notifications || []).length - 3 } more...`"
            data-bs-toggle="modal"
            :data-bs-target="'#'+props.modalId"
          />
          <ButtonText v-else
            title="View all"
            data-bs-toggle="modal"
            :data-bs-target="'#'+props.modalId"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onBeforeUnmount } from 'vue';
import ScrollVerticalCarousel from './scroll-vertical-carousel.vue';
import ScrollCard from './scroll-card.vue';
import CardNotification from './card-notification.vue';
import ButtonText from './button-text.vue';

const props = defineProps({
  notifications: { type: Array, default: () => [] },
  modalId: { type: String, default: 'notification_modal_btn' }
})

const visible = ref(false)
let closeTimer = null

// element refs for sizing
const triggerRef = ref(null)
const menuRef = ref(null)
const menuStyles = ref({})

function open() {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
  visible.value = true
}

function keepOpen() {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
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
    const baseline = 240
    menuStyles.value = { minWidth: Math.max(baseline, w) + 'px' }
  } catch (e) {}
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
</script>

<!-- Styles for notification dropdown moved to public/css/mainpage.css -->
