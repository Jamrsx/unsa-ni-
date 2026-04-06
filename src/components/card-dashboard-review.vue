<!-- 
architecture:
    grid-layout-container.vue
    |   grid-layout-card.vue
-->
<script>
    import ButtonImg from './button-img.vue';

    export default{
        components:{
            ButtonImg
        }
    }
</script>
<template>  
    <!-- no div -->
    <div class="col-5">
        <ButtonImg 
        id="setting_btn"
        :imgSrc=icon
        altText="Settings"
    >
    </ButtonImg>
    <h4>{{ title }}</h4>
    <h2>{{ value }}</h2>
    </div>

</template>

<script setup>

    const props = defineProps({
        icon:{
            type: String,
            default: ''
        },
        title:{
            type: String,
            default: ''
        },
        value:{
            type: Number,
            default: ''
        }
    });
</script>
