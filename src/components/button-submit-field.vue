
<template>
	<input class="txt-btn" type="submit" :value="displayValue" :name="name" :id="name" :alt="altText" :disabled="disabled">
</template>

<script setup>
const props = defineProps({
	name: {
		type: String,
		required: true
	},
	placeholder:{
		type: String,
		default: ''
	},
	displayValue: {
		type: String,
		default: ''
	},
	altText: {
		type: String,
		default: ''
	},
	disabled: {
    type: Boolean,
    default: false
  }
});
</script>
