<!--
    Usage:
    place as very last component/element inside template (to avoid css selector such as ':nth-child()')
-->
<template>
    <div class="loading-con" :class="isShow()">
        <div class="loading-con-window">
            <div class="loading-con-window-logo">
                <h1 class="h1">DUELCODE</h1>
            </div>
            <div class="loading-con-window-gametip">
                <p>{{ gametip }}</p>
            </div>
        </div>
    </div>
</template>
<script setup>
    const props = defineProps({
        gametip:{
            type: String
        },
        show:{
            type: Boolean,
            default: false
        }
    })

    function isShow(){return (props.show)? 'show':'hide'}
</script>
