<script setup>
import { toRefs, computed } from 'vue';
import GameResultDetailItem from './game-result-detail-item.vue';
import ProfilePic from './profile-pic.vue';

const props = defineProps({
  PlayerWinSide: Number,
  Player1Properties: Object,
  Player2Properties: Object
});

const { Player1Properties, Player2Properties } = toRefs(props);

const p1 = computed(() => ({
  img: Player1Properties.value?.imgSrcPlayer1 || "/asset/general/profile-user.png",
  name: Player1Properties.value?.namePlayer1 || "Player 1",
  completion: Player1Properties.value?.resultCompletionPlayer1 || "0%",
  duration: Player1Properties.value?.resultDurationPlayer1 || "00:00",
  tests: Player1Properties.value?.resultTestDonePlayer1 || "0/0",
  language: Player1Properties.value?.resultLanguagePlayer1 || "",
  finished: Player1Properties.value?.isFinished ?? false,
}));

const p2 = computed(() => ({
  img: Player2Properties.value?.imgSrcPlayer2 || "/asset/general/profile-user.png",
  name: Player2Properties.value?.namePlayer2 || "Player 2",
  completion: Player2Properties.value?.resultCompletionPlayer2 || "0%",
  duration: Player2Properties.value?.resultDurationPlayer2 || "00:00",
  tests: Player2Properties.value?.resultTestDonePlayer2 || "0/0",
  language: Player2Properties.value?.resultLanguagePlayer2 || "",
  finished: Player2Properties.value?.isFinished ?? false,
}));

function verdict(playerNum) {
  if (!p1.value.finished || !p2.value.finished) return "waiting";
  return props.PlayerWinSide === playerNum ? "win" : "lose";
}
</script>

<template>
  <div class="grp-root">

    <!-- PLAYER 1 -->
    <div class="grp-card" :class="verdict(1)">
      <div class="grp-verdict-bar">
        <span v-if="verdict(1) === 'win'"  class="grp-verdict-label grp-verdict-label--win">🏆 WINNER</span>
        <span v-else-if="verdict(1) === 'lose'" class="grp-verdict-label grp-verdict-label--lose">DEFEATED</span>
        <span v-else class="grp-verdict-label grp-verdict-label--wait">WAITING…</span>
      </div>
      <div class="grp-player-header">
        <div class="grp-avatar-wrap">
          <ProfilePic :img-src="p1.img" :user-name="p1.name" />
        </div>
        <div class="grp-player-name">{{ p1.name }}</div>
      </div>
      <div class="grp-divider"></div>
      <div v-if="p1.finished" class="grp-details">
        <GameResultDetailItem title="Completion"     :value="p1.completion" />
        <GameResultDetailItem title="Duration"       :value="p1.duration" />
        <GameResultDetailItem title="Tests"          :value="p1.tests" />
        <GameResultDetailItem title="Language"       :value="p1.language" />
      </div>
      <div v-else class="grp-waiting">
        <div class="grp-wait-spinner"></div>
        <span>Awaiting submission…</span>
      </div>
    </div>

    <!-- VS divider -->
    <div class="grp-vs">
      <div class="grp-vs-line"></div>
      <div class="grp-vs-badge">VS</div>
      <div class="grp-vs-line"></div>
    </div>

    <!-- PLAYER 2 -->
    <div class="grp-card" :class="verdict(2)">
      <div class="grp-verdict-bar">
        <span v-if="verdict(2) === 'win'"  class="grp-verdict-label grp-verdict-label--win">🏆 WINNER</span>
        <span v-else-if="verdict(2) === 'lose'" class="grp-verdict-label grp-verdict-label--lose">DEFEATED</span>
        <span v-else class="grp-verdict-label grp-verdict-label--wait">WAITING…</span>
      </div>
      <div class="grp-player-header">
        <div class="grp-avatar-wrap">
          <ProfilePic :img-src="p2.img" :user-name="p2.name" />
        </div>
        <div class="grp-player-name">{{ p2.name }}</div>
      </div>
      <div class="grp-divider"></div>
      <div v-if="p2.finished" class="grp-details">
        <GameResultDetailItem title="Completion"     :value="p2.completion" />
        <GameResultDetailItem title="Duration"       :value="p2.duration" />
        <GameResultDetailItem title="Tests"          :value="p2.tests" />
        <GameResultDetailItem title="Language"       :value="p2.language" />
      </div>
      <div v-else class="grp-waiting">
        <div class="grp-wait-spinner"></div>
        <span>Awaiting submission…</span>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── Root layout ── */
.grp-root {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: start;
  width: 100%;
}

/* ── Player card ── */
.grp-card {
  display: flex; flex-direction: column; gap: 0;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.grp-card.win  {
  border-color: rgba(255,214,0,0.35);
  box-shadow: 0 0 24px rgba(255,214,0,0.08);
  background: rgba(255,214,0,0.04);
}
.grp-card.lose {
  border-color: rgba(255,255,255,0.07);
  opacity: 0.75;
}

/* ── Verdict bar ── */
.grp-verdict-bar {
  padding: 6px 12px;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: center;
  min-height: 30px;
}
.grp-verdict-label {
  font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em;
}
.grp-verdict-label--win  { color: #ffd600; }
.grp-verdict-label--lose { color: rgba(255,255,255,0.28); }
.grp-verdict-label--wait {
  color: rgba(255,255,255,0.25);
  animation: grp-blink 1.4s ease-in-out infinite;
}
@keyframes grp-blink { 0%,100%{opacity:0.25} 50%{opacity:0.6} }

/* ── Player header (avatar + name) ── */
.grp-player-header {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px 12px 12px;
}
/* constrain ProfilePic to a fixed size */
.grp-avatar-wrap {
  width: 56px; height: 56px;
  border-radius: 50%; overflow: hidden;
  border: 2px solid rgba(255,255,255,0.12);
  flex-shrink: 0;
}
.grp-avatar-wrap :deep(img),
.grp-avatar-wrap :deep(.profile-pic),
.grp-avatar-wrap :deep(*) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
  max-width: 100% !important;
  max-height: 100% !important;
}
.grp-card.win .grp-avatar-wrap {
  border-color: rgba(255,214,0,0.4);
  box-shadow: 0 0 12px rgba(255,214,0,0.2);
}
.grp-player-name {
  font-size: 0.88rem; font-weight: 800;
  color: rgba(255,255,255,0.88); text-align: center;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 100%;
}

/* ── Divider ── */
.grp-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 0; }

/* ── Detail rows ── */
.grp-details {
  display: flex; flex-direction: column; gap: 0;
  padding: 4px 0;
}

/* ── Waiting state ── */
.grp-waiting {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 20px 12px;
  color: rgba(255,255,255,0.28); font-size: 0.76rem;
}
.grp-wait-spinner {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.08);
  border-top-color: rgba(255,255,255,0.3);
  animation: grp-spin 0.9s linear infinite;
}
@keyframes grp-spin { to { transform: rotate(360deg); } }

/* ── VS divider ── */
.grp-vs {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 6px; padding-top: 60px;
}
.grp-vs-line {
  width: 1px; height: 32px;
  background: rgba(255,255,255,0.1);
}
.grp-vs-badge {
  font-size: 0.68rem; font-weight: 900; letter-spacing: 0.12em;
  color: rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px; padding: 4px 8px;
}
</style>
