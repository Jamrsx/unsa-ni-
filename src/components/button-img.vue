

<template>
	<button class="img-btn" @click="handleClick" :title="altText">
		<img v-if="imgSrc" :src="imgSrc" :alt="altText" class="img-btn_logo" />
		<p class="img-btn_title">{{ title }}</p>
		<p class="img-btn_desc">{{ description }}</p>
		<slot name="content"></slot>
	</button>
</template>

<script setup>

const props = defineProps({
	imgSrc: {
		type: String,
		required: false,
		default: ''
	},
	altText: {
		type: String,
		default: ''
	},
	title: {
		type: String,
		default: ''
	},
	description: {
		type: String,
		default: ''
	},
	link: {
		type: String,
		default: ''
	}
});

const emit = defineEmits(['click']);

function handleClick() {
	try { console.log('[ButtonImg] handleClick invoked', { altText: props.altText, imgSrc: props.imgSrc, link: props.link }) } catch(e){}
	emit('click');
	if (props.link) {
		// navigate in the same tab instead of opening a new tab
		window.location.href = props.link;
	}
}
</script>
