<script setup>
import Window from './components/window.vue'
import ButtonImg from './components/button-img.vue'
import ButtonText from './components/button-text.vue'

const heroTitle = 'Welcome to DuelCode'
const heroSubtitle = 'Practice, compete and learn — an online multiplayer programming platform.'
</script>

<template>
  <section>
    <Window>
      <template #title>
        <span>{{ heroTitle }}</span>
      </template>

      <template #content>
        <div class="landing-hero">
          <div class="hero-left">
            <h2>{{ heroTitle }}</h2>
            <p class="lead">{{ heroSubtitle }}</p>

            <div class="landing-cta">
              <ButtonText title="Get Started" alt-text="Go to signup" :link="'/signup.html'" />
              <ButtonText title="Sign In" alt-text="Sign in" :link="'/signin.html'" />
            </div>
          </div>

          <div class="hero-right">
            <ButtonImg class="promo-card" :link="'/solo.html'" title="Solo Problems" alt-text="Play solo problems" />
          </div>
        </div>
      </template>
    </Window>
  </section>
</template>

<style scoped>
.landing-hero {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}
.hero-left {
  flex: 1 1 60%;
}
.hero-right {
  flex: 0 0 35%;
  display: flex;
  justify-content: center;
}
.landing-cta {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
.lead {
  color: var(--c_lightcoding, #97ADAB);
}
.promo-card .img-btn {
  padding: 18px;
}
</style>
