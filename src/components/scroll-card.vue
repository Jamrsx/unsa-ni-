<!-- 
 Hierarchy:
 scroll-vertical-carousel.vue
    scroll-card.vue
        card-*.vue
-->

<template>
    <div class="scroll-card">
      <slot>
        <!-- content components with prefix "card-" goes here -->
      </slot>
    </div>
</template>

<script setup>
// No props needed ok :/, just a slot for cards
</script>
