<template>
  <div class="io-row">
    <div class="io-col io-input">
      <label>Input</label>
      <div class="io-value">
        <p>{{ input }}</p>
      </div>
    </div>

    <div class="io-col io-output">
      <label>Output</label>
      <div class="io-value">
        <p>{{ output }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  input: { type: String, default: "" },
  output: { type: String, default: "" }
});
</script>
