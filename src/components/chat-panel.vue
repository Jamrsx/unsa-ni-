<script>
    import TextField from './text-field.vue';
    export default{
        contents:{
            TextField
        }
    }
</script>
<template>
    <div class="chatroom"> <!-- this div should 'y-overlay: scroll' -->
        <slot name="content">
        
        </slot>
    </div>
    <div class="chatfield">
        <form @submit.prevent="handleSubmit">
            <TextField
                :label=label
                :name=name
                :placeholder=placeholder
                v-model="message"
                @keyup.enter="handleSubmit"
            />
        </form>
    </div>
</template>
<script setup>
    import { ref } from 'vue';
    
    const props = defineProps({
        label:{
            type: String,
            default: ''
        },
        placeholder:{
            type: String,
            default: ''
        },
        name:{
            type: String,
            default: ''
        }
    });
    
    // Declare emitted events to fix Vue warning
    const emit = defineEmits(['send']);
    
    const message = ref('');
    
    function handleSubmit() {
        if (message.value.trim()) {
            emit('send', message.value);
            message.value = '';
        }
    }
</script>
<style>
    .chatroom{
        height: 100%;
        overflow-y: scroll;
    }
</style>
