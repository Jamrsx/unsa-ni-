<!-- 
 Hierarchy:
 scroll-vertical-carousel.vue
    scroll-card.vue
        card-*.vue
-->
<script>

    import ButtonImg from './button-img.vue';
    import ButtonText from './button-text.vue';
    import ProfilePic from './profile-pic.vue';
    export default {
        components:{
            ButtonImg,
            ButtonText,
            ProfilePic
        }
    }
</script>
<template>
  <div class="lobby-card">
        <div class="lobby-info">
          <div class="lobby-info-text">
            <h3>{{ title }}</h3>
            <p>{{ description }}</p>
          </div>
          <div class="lobby-info-host">
            <ButtonImg 
                class="lobby-info-host-profile-pic"
                imgSrc=""
            >
                <template #content>
                    <ProfilePic
                        :imgSrc=HostImgSrc
                    />
                </template>
            </ButtonImg>
            <p class="lobby-info-host-name">{{ HostName }}</p>
          </div>
        </div>
        <div class="lobby-players">
          <p>Players:</p>
          <div class="lobby-players-icons">
            <!-- Player icons placeholders -->
            <span>@</span><span>@</span><span>@</span>
          </div>
        </div>
        <div class="lobby-join">
          <button 
            class="lobby-room-join-btn btn btn-primary"
            @click="$emit('join')"
          >
            Join
          </button>
        </div>
      </div>
</template>

<script setup>
const props = defineProps({
    title: {
    type: String,
    default: 'Room'
    },
    description: {
    type: String,
    default: 'No description provided'
    },
    HostImgSrc:{
        type: String,
        default: ''
    },
    HostName:{
        type: String,
        default: ''
    },
    roomCode: {
    type: String,
    required: true
    },
    isPrivate: {
    type: Boolean,
    default: false
    }
});

// Declare emitted events
defineEmits(['join']);
</script>
<style scoped>
.lobby-room-join-btn {
  width: 100%;
  padding: 8px 16px;
  font-weight: 600;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.lobby-room-join-btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

.lobby-room-join-btn:active {
  transform: translateY(0);
}
</style>
