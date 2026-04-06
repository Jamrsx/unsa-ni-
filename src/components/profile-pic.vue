<template>
    <img :src="imgSrc || '/asset/general/profile-user.png'" :alt="'username '+userName" class="profile-pic_icon" />
</template>

<script setup>
const props = defineProps({
    imgSrc: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        default: ''
    },
});
</script>
