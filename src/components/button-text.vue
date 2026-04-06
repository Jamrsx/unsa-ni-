<template>
  <button class="txt-btn" :disabled="disabled" @click="handleClick">
    <!-- Button text -->
    <div class="txt-btn_desc">{{ title }}</div>

    <!-- Optional logo image -->
    <img
      v-if="imgSrc"
      :src="imgSrc"
      :alt="altText"
      class="txt-btn_logo"
    />

    <!-- Optional slot content -->
    <slot name="content"></slot>
  </button>
</template>

<script setup>
/* ---------------------------------------------------
   Props
--------------------------------------------------- */
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  imgSrc: {
    type: String,
    default: ''
  },
  altText: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

/* ---------------------------------------------------
   Emits
--------------------------------------------------- */
const emit = defineEmits(['click'])

/* ---------------------------------------------------
   Handle button click
   - Emit 'click' event
   - Navigate to link if provided
--------------------------------------------------- */
function handleClick() {
  if (props.disabled) return;
  emit('click')
  if (props.link) {
    window.location.href = props.link
  }
}
</script>
