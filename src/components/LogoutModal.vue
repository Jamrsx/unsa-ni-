<template>
  <Modal :modal_id="modalId" modal_title="Confirm logout">
    <template #content>
      Are you sure you want to log out?
    </template>
    <template #modal_footer>
      <button type="button" class="btn" data-bs-dismiss="modal">Cancel</button>
      <button type="button" class="btn btn-danger" @click="handleConfirm">Log out</button>
    </template>
  </Modal>
</template>

<script setup>
import { defineEmits, defineProps, onMounted } from 'vue'
import Modal from './modal.vue'

const emit = defineEmits(['confirm'])
const props = defineProps({
  modalId: { type: String, default: 'logout-modal' }
})

function handleConfirm() {
  emit('confirm')
}

function show() {
  try {
    const el = document.getElementById(props.modalId)
    if (el && window.bootstrap && typeof window.bootstrap.Modal === 'function') {
      const m = new window.bootstrap.Modal(el)
      m.show()
    } else {
      // fallback: find data-bs-target
      const btn = document.querySelector(`[data-bs-target="#${props.modalId}"]`)
      if (btn) btn.click()
    }
  } catch (e) { console.error('LogoutModal.show error', e) }
}

defineExpose({ show })
</script>

<!-- LogoutModal.vue: convenience wrapper around Modal.vue that exposes a `show()` method and emits `confirm` -->
