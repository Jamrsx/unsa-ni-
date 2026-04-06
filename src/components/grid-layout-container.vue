<!-- 
architecture:
    grid-layout-container.vue
    |   grid-layout-card.vue
        |   'card-*.vue'
-->

<template>
    <div class="grid-layout-container w-100">
        <slot>
        <!-- grid-layout-card goes here -->
        </slot>
    </div>
</template>

<style scoped>
</style>

