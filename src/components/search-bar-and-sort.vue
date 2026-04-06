<!-- 
 Hierarchy:
 search-panel.vue
    search-bar-and-sort.vue
    search-checkbox-group.vue
    dropdown-array.vue
-->

<!-- 
    To return:
    outside component:
    <SearchSort
        @update:search="searchQuery = $event"
        @update:sort="sortOrder = $event"
    />
-->

<template>
  <div class="search-bar-and-sort d-flex items-center gap-2">
    <!-- Search Input -->
    <input
      v-model="searchText"
      @input="emitSearch"
      type="text"
      :placeholder="placeholder"
      class="search-bar border rounded-lg px-3 py-1 w-full outline-none focus:ring focus:ring-blue-300"
    />

    <!-- Sort Toggle -->
    <button
      @click="toggleSort"
      class="search-sort px-3 py-1 rounded-lg border hover:bg-gray-100 transition"
    >
      <span v-if="sortOrder === 'asc'">⬆️</span>
      <span v-else>⬇️</span>
    </button>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  search: { type: String, default: '' },
  sort: { type: String, default: 'asc' },
  placeholder: { type: String, default: 'Search...' }
})

const emit = defineEmits(['update:search', 'update:sort'])

const searchText = ref(props.search)
const sortOrder = ref(props.sort)

function emitSearch() {
  emit('update:search', searchText.value)
}

function toggleSort() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  emit('update:sort', sortOrder.value)
}

watch(() => props.search, (val) => { searchText.value = val })
watch(() => props.sort, (val) => { sortOrder.value = val })
</script>
