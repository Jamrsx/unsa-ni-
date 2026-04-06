<!-- 
architecture:
    grid-layout-container.vue
    |   grid-layout-card.vue
-->

<template>
    <div>
        <div class="row justify-content-center align-items-center gap-2">
            <slot>
                <!-- grid-layout-card goes here without using 'template#content'-->
            </slot>
        </div>
    </div>
</template>

<style scoped>
</style>
