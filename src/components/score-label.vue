
<template>
	<div class="score-label">
		<h1 id="score-label-title">{{ title }}</h1>
		<p id="score-label-subtitle">{{ subtitle }}</p>
	</div>
</template>

<script setup>
const props = defineProps({
	title: {
		type: String,
		default: ''
	},
	subtitle: {
		type: String,
		default: ''
	}
});
</script>
