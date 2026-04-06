<!-- 
 Hierarchy:
 scroll-vertical-carousel.vue
    scroll-card.vue
        card-*.vue
-->

<template>
  <div class="vertical-carousel-container">
    <div class="vertical-carousel-scroll">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
// No props needed ok :/, just a slot for cards
</script>
