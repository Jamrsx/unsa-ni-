<!-- 
Architecture "Split"
split-main-window.vue
  |- split-navigation-menu.vue
  |- split-content-view.vue 
-->

<!-- need context here -->
<template>
  <div class="split-layout row">
    <aside class="col row">
      <SplitNavigationMenu
        :buttons="sections"
        :active="currentSection"
        @select="selectSection"
        class="col split-aside-nav"
        :class="currentSection"
        id="split-aside-nav"
      />

      <!-- log out -->
      <slot name="nav-menu-bottom">
      </slot>
    </aside>

    <section class="col content-area">
      <SplitContentView
        :sections="sections"
        :current-selection="currentSection"
        :label-tag="labelTag"
        :show-label="showLabel"
      >
        <template v-for="section in sections" #[section.id]>
          <slot :name="section.id"></slot>
        </template>

        <!-- Pass through optional label overrides -->
        <template v-for="section in sections" #[`${section.id}-label`]>
          <slot :name="`${section.id}-label`"></slot>
        </template>
      </SplitContentView>
    </section>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import SplitNavigationMenu from './split-navigation-menu.vue'
import SplitContentView from './split-content-view.vue'
import ButtonText from './button-text.vue'

const props = defineProps({
  sections: Array,
  labelTag: { type: String, default: 'h2' },
  defaultSection: String,
  showLabel: { type: Boolean, default: true },
  // v-model support: allow parent to bind currentSection
  currentSection: String
})

const emit = defineEmits(['update:currentSection', 'section-changed'])

const currentSection = ref(props.currentSection ?? props.defaultSection ?? props.sections[0]?.id ?? null)

// keep local state in sync if parent updates v-model
watch(() => props.currentSection, (val) => {
  if (val && val !== currentSection.value) {
    currentSection.value = val
  }
})

// fix soon where immediate load profile is intended
function selectSection(id) {
  if (id === currentSection.value) return
  currentSection.value = id
  emit('update:currentSection', id)
  emit('section-changed', id)
}
</script>
