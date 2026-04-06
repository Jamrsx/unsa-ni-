<template>
    <div>
        <p>
            <span class="chat-message-left">{{ user }}: </span>
            <span class="chat-message-right">{{ message }}</span>
        </p>
    </div>
</template>
<script setup>
// might change "user" paramater since what if the case when player is switched username during chat...
    const props = defineProps({
        user:{
            type: String,
            default: ''
        },
        message:{
            type: String,
            default: ''
        },
    })
</script>
