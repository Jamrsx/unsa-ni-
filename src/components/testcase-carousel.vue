<template>
  <div class="testcase-carousel">
    <div class="onboarding-testcase-header">
        <div class="onboarding-testcase-header-title">
            <h3>Test Cases</h3>
        </div>
        <div>
            <slot name="button"></slot>
        </div>
    </div>
    <hr>
    <div class="testcase-scroll">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
// No props needed, just a slot for cards
</script>
