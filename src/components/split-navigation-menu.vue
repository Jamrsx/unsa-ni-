<!-- 
Architecture "Split"
split-main-window.vue
  |- split-navigation-menu.vue
  |- split-content-view.vue 
--> 

<template>
  <nav>
    <ul>
      <li
        v-for="btn in buttons" 
        :key="btn.id"
        class="nav-item"
        :class="{ active: active === btn.id }"
        @click="$emit('select', btn.id)"
        tabindex="0"
        role="button"
        @keydown.enter="$emit('select', btn.id)"
        @keydown.space.prevent="$emit('select', btn.id)"
      >
        <strong>{{ btn.name }}</strong>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const props = defineProps({
  buttons: {
    type: Array,
    required: true
  },
  active: { type: String, required: false } //for highlighting navs on current content
})
</script>
