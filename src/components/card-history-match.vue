<!-- 
 Hierarchy:
 scroll-vertical-carousel.vue
    scroll-card.vue
        card-*.vue
-->
<script setup>
  import ButtonImg from './button-img.vue';
  import ProfilePic from './profile-pic.vue';
  import { computed } from 'vue'; 
  /**
   * @typedef {'WON' | 'LOSS'} MatchResultVerdict
   */
  const props = defineProps({
      Player1ImgSrc:{
        type: String,
        default: ''
      },
      Player1Name:{
        type: String,
        default: ''
      },
      Player2ImgSrc:{
        type: String,
        default: ''
      },
      Player2Name:{
        type: String,
        default: ''
      },
      MatchResult:{
        /**
         * @type MatchResultVerdict
         */
        default: 'LOSS',
        required: true
      },
      MatchDuration:{
        type: String,
        default: ''
      },
      MatchDate:{
        type: String,
        default: ''
      }
  });

  const matchResultCorrect = computed(() => {
    return ['WON', 'LOSS'].includes(props.MatchResult)
      ? props.MatchResult
      : 'LOSS';
  });
</script>

<template>
  <div class="card-match-history" :class="matchResultCorrect === 'WON'? 'card-win' : 'card-lose'">
    <div class="row">
      <div class="col match-history-players">
        <div class="player-div player1">
            <ButtonImg 
                class="player1-profile-pic"
                imgSrc=""
                link="/"
            >
                <template #content>
                    <ProfilePic
                        :imgSrc=Player1ImgSrc
                    />
                </template>
            </ButtonImg>
            <h4 class="playerName player1Name">{{ Player1Name }}</h4>
          </div>

          <div class="center"><img src='/asset/general/match.png' alt="versus" class="txt-btn_logo center_icon" /></div>

          <div class="player-div player2">
            <ButtonImg 
                class="player2-profile-pic"
                imgSrc=""
                link="/"
            >
                <template #content>
                    <ProfilePic
                        :imgSrc=Player2ImgSrc
                    />
                </template>
            </ButtonImg>
            <h4 class="playerName player2Name">{{ Player2Name }}</h4>
          </div>
      </div>
      <div class="col row row-match-detail">
        <div class="col match-detail-result">
          <p class="match-label">Match Result</p>
          <h1>{{ matchResultCorrect }}</h1>
        </div>
        <div class="col match-detail-duration">
          <p class="match-label">Match Duration</p>
          <h1>{{ MatchDuration }}</h1>
        </div>
        <div class="col match-detail-date">
          <p class="match-label">Date</p>
          <h1>{{ MatchDate }}</h1>
        </div>
      </div>
    </div>
  </div>
</template>
