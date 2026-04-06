<template>
  <Modal :modal_id="modalId" :modal_title="title" :close_btn_header_bool="true" :close_btn_footer_bool="false">
    <template #content>
      <p>{{ message }}</p>
    </template>
    <template #modal_footer>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      <button type="button" class="btn btn-danger" @click="confirm">Delete</button>
    </template>
  </Modal>
</template>

<script setup>
import Modal from './modal.vue';
import { defineEmits, defineProps } from 'vue';

const props = defineProps({
  modalId: { type: String, default: 'deleteConfirmModal' },
  title: { type: String, default: 'Confirm Delete' },
  message: { type: String, default: 'Are you sure you want to delete this item?' }
});

const emit = defineEmits(['confirm']);

function confirm() {
  emit('confirm');
  // hide modal programmatically
  try {
    const el = document.getElementById(props.modalId);
    if (el && window.bootstrap && typeof window.bootstrap.Modal === 'function') {
      const instance = window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el);
      instance.hide();
    }
  } catch (e) { console.error('Failed to hide delete confirm modal', e) }
}
</script>
