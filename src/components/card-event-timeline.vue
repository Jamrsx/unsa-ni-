<!-- architecture -->
<!-- 
  carousel-card-thumb.vue
    | card-event-timeline.vue
-->
<script>
import CarouselCardThumb from './carousel-card-thumb.vue';

  export default{
    components:{
      CarouselCardThumb
    }
  }
</script>
<template>
  <a :href="hyperlink" class="card-event-thumb_link">
    <div class="card-thumb">
        <h3>Ongoing Event</h3>
        <div class="card-thumb_img">
            <img v-if="imgSrc" :src="imgSrc" :alt="title"/>
        </div>
        <div class="card-thumb_body">
        <h4 class="card-thumb_title">{{ title }}</h4>
        <div class="row">
          <div class="col-6">
            <p class="card-thumb_desc">Time of event</p>
          </div>
          <div class="col-6 row flex-column">
            <div class="col">
              <p class="card-thumb_desc">{{ startTime }}</p>
            </div>
            <div class="col">
              <p class="card-thumb_desc">{{ endTime }}</p>
            </div>
          </div>
        </div>
        </div>
    </div>
  </a>
</template>
<script setup>


const props = defineProps({
    hyperlink: {
    type: String,
    default: '#'
    },
    imgSrc: {
    type: String,
    default: ''
    },
    title: {
    type: String,
    default: ''
    },
    startTime: {
    type: String,
    default: ''
    },
    endTime: {
    type: String,
    default: ''
    }
});
</script>
