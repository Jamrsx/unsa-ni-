<!-- 
Architecture "Split"
split-main-window.vue
  |- split-navigation-menu.vue
  |- split-content-view.vue 
-->

<template>
  <div
    v-for="section in visibleSections"
    :key="getSectionId(section)"
    class="split-section"
    :id="getSectionId(section)"
  >
    <component
      v-if="showLabel && ($slots[`${getSectionId(section)}-label`] || getSectionName(section))"
      :is="labelTag"
      class="split-label"
    >
      <slot :name="`${getSectionId(section)}-label`">
        {{ getSectionName(section) }}
      </slot>
    </component>

    <slot :name="getSectionId(section)"></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Allow sections/currentSelection to be optional so single-slot usages (e.g. My Questions)
// do not throw when props are omitted.
const props = defineProps({
  sections: { type: Array, default: () => ['content'] },
  currentSelection: { type: String, default: 'content' },
  labelTag: { type: String, default: 'h2' },
  showLabel: { type: Boolean, default: true }
})

function getSectionId(section) {
  return typeof section === 'object' ? section.id : section
}
function getSectionName(section) {
  return typeof section === 'object' ? section.name : null
}

// Filter only the current section (reactive)
const visibleSections = computed(() => {
  const sections = Array.isArray(props.sections) ? props.sections : [];
  // If no match is found, fallback to rendering the first section so content still appears.
  const match = sections.filter(s => getSectionId(s) === props.currentSelection);
  return match.length > 0 ? match : sections.slice(0, 1);
})
</script>
