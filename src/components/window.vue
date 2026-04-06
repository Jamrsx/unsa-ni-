<template>
    <div class="body-window">
        <div v-if="showLabel">
            <h3>
                <slot name="title">{{ title }}</slot>
            </h3>
        </div>
        <!-- Slot for content -->
        <slot name="content"></slot>
    </div>
</template>
<script>
    export default {
        name: "Window",
        props: {
            title: {
                type: String,
                default: ""
            },
            showLabel: {
                type: Boolean,
                default: true
            }
        }
    };
</script>
