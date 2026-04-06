<template>
    <!-- will add props for timer on graphic and minute:second text -->
    <div class="match-timer-bar" :style="'background-color:' + timer_color_bg" >
        <div class="match-timer-bar-fill" :style="'background-color:' + timer_color_fill+'; width:'+timer_color_fill_progress+'%;'"></div>
    </div>
</template>
<script setup>
// script here brubs for timer change
const props = defineProps({
    timer_color_bg: {
        type: String,
        default: 'var(--c_lightcoding)'
    },
    timer_color_fill: {
        type: String,
        default: 'var(--c_yellowconstrastsat_light)'
    },
    timer_color_fill_progress:{
        type: String,
        default: '100'
    }
});
</script>
