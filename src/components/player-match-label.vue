<template>
	<div class="player-match-label">
		<div class="player player1">
			<img :src="imgSrc_player1 || 'public/asset/general/profile-user.png'" :alt="altText_player1" class="txt-btn_logo player1_icon" />
			<p v-if="showNameBool">{{ altText_player1 }}</p>
		</div>
		<div class="center"><img :src="imgSrc_center || 'public/asset/general/match.png'" :alt="versus" class="txt-btn_logo center_icon" /></div>
		<div class="player player2">
			<img :src="imgSrc_player2 || 'public/asset/general/profile-user.png'" :alt="altText_player2" class="txt-btn_logo player2_icon" />
			<p v-if="showNameBool">{{ altText_player2 }}</p>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	imgSrc_player1: {
		type: String,
		default: ''
	},
	altText_player1: {
		type: String,
		default: ''
	},
	imgSrc_center: {
		type: String,
		default: ''
	},
	imgSrc_player2: {
		type: String,
		default: ''
	},
	altText_player2: {
		type: String,
		default: ''
	},
	showNameBool: {
		type: Boolean,
		default: false
	},
	versus: {
        type: String,
        default: ''
    }
});
</script>
