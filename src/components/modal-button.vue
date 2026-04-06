<!-- needed "modal.vue" to interact -->
<template>
    <!-- Button to open modal -->
    <div class="modal-button">
      <button 
        type="button" 
        :class="btnClass"
        :data-bs-toggle="auto ? 'modal' : null"
        :data-bs-target="auto ? '#'+modal_btn_id : null"
        @click="handleClick($event)"
      >
        <template v-if="imgSrc">
          <img :src="imgSrc" :alt="modal_btn_title || ''" class="img-btn_logo" />
        </template>
        <slot>
          {{modal_btn_title}}
        </slot>
      </button>
    </div>
</template>

<script setup>
// No JS logic needed for data-bs modal
const emit = defineEmits(['click'])
const props = defineProps({
  modal_btn_id: {
    type: String,
    required: true
  },
  modal_btn_title:{
    type: String,
    default: ''
  },
  imgSrc: {
    type: String,
    default: ''
  },
  btnClass: {
    type: String,
    default: 'modal-button btn btn-primary open-btn'
  }
  ,
  auto: {
    type: Boolean,
    default: true
  }
});

function handleClick(e) {
  // If auto is disabled, prevent Bootstrap's delegated click handler
  // from receiving the event so the modal won't auto-open.
  if (!props.auto) {
    try { e.stopImmediatePropagation(); } catch (err) { /* ignore */ }
    try { e.preventDefault(); } catch (err) { /* ignore */ }
  }
  // emit click to parent
  emit('click', e)
}
</script>
