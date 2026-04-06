<!-- 
 Hierarchy:
 search-panel.vue
    search-bar-and-sort.vue
    search-checkbox-group.vue
    dropdown-array.vue
-->

<script>
import SearchSort from './search-bar-and-sort.vue'
import SelectableButton from './search-checkbox-group.vue'
import DropdownArray from './dropdown-array.vue'
export default {
        components:{
            SearchSort,
            SelectableButton,
            DropdownArray
        }
    };
</script>

<template>
    <form @submit.prevent class="search-panel">
        <div class="search-panel-bar">
            <SearchSort @update:search="onSearch" @update:sort="onSort"/>
        </div>

        <div class="search-panel-topics">
            <h5>Programming Language</h5>
            <div class="search-panel-topics-grid">
                <SelectableButton
                    v-for="(filter, index) in filters"
                    :key="filter.name"
                    v-model="filter.active"
                    :label="filter.name"
                    :unavailable="filter.unavailable"
                    @update:modelValue="onTopicChange"
                />
            </div>
        </div>

        <div class="search-panel-filters">
            <h5>Filters</h5>
            <div v-if="props.showProgress">
                <label for="FilterProgressDropdown">Progress: </label>
                <DropdownArray 
                    id="FilterProgressDropdown"
                    :options="progressOptions"
                    v-model="progress"
                    @update:modelValue="onProgressChange"
                />
            </div>
            <div>
                <label for="FilterDifficultyDropdown">Difficulty: </label>
                <DropdownArray 
                    id="FilterDifficultyDropdown"
                    :options="['All', 'Easy', 'Medium', 'Hard']"
                    v-model="difficulty"
                    @update:modelValue="onDifficultyChange"
                />
            </div>
        </div>
    </form>
</template>

<script setup>
// Dynamically resolve server URL — works for localhost and LAN testers
const SERVER_URL = (() => {
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3000';
  return 'http://' + h + ':3000';
})();


import { onMounted, ref, watch } from 'vue'
import { io } from 'socket.io-client'

const emit = defineEmits(['filters-updated'])

const props = defineProps({
  showProgress: {
    type: Boolean,
    default: true
  }
})

const search = ref('')
const sortOrder = ref('asc')
// Topics loaded from DB (problem_topics.topic_name)
const filters = ref([])
// Prevent emitting filter updates during initial topic load
const initialized = ref(false)
const difficulty = ref('All');
const progress = ref('All');

// Progress dropdown options
const progressOptions = [
  'All',
  'Complete',
  'Unfinished',
  'Untouched'
];

function onSearch(val) {
  search.value = val
  emitFilters()
}

function onSort(val) {
  sortOrder.value = val
  emitFilters()
}

function onTopicChange() {
  emitFilters()
}

function onProgressChange(val) {
  progress.value = val
  emitFilters()
}

function onDifficultyChange(val) {
  difficulty.value = val
  emitFilters()
}

function emitFilters() {
  if (!initialized.value) return
  const selectedTopics = filters.value.filter(f => f.active).map(f => f.id)
  
  // Map display names to database enum values
  const progressValue = progress.value === 'All' ? null : 
    progress.value === 'Complete' ? 'complete' :
    progress.value === 'Unfinished' ? 'unfinished' :
    progress.value === 'Untouched' ? 'untouch' : null;
  
  const difficultyValue = difficulty.value === 'All' ? null : difficulty.value;
  
  emit('filters-updated', {
    search: search.value,
    sortOrder: sortOrder.value,
    difficulty: difficultyValue,
    progress: progressValue,
    selectedTopics: selectedTopics
  })
}

// Watch for changes to emit filter updates
watch([search, sortOrder, difficulty, progress, () => filters.value.map(f => f.active)], () => {
  emitFilters()
}, { deep: true })

// Load topics from backend on mount
import { getSocket } from '../js/socket.js';
const socket = getSocket();

function loadTopics() {
  const token = localStorage.getItem('jwt_token')
  socket.emit('request_get_problem_topics', { token_session: token })
  socket.off('response_get_problem_topics')
  socket.on('response_get_problem_topics', (data) => {
    if (!data?.success) {
      console.error('SearchPanel: failed to load topics', data?.message)
      filters.value = []
      return
    }
    filters.value = (data.topics || []).map(t => ({
      id: t.topic_id,
      name: t.topic_name,
      active: false
    }))
    // Allow filters to start emitting after topics are loaded
    initialized.value = true
  })
}

onMounted(() => {
  loadTopics()
  // Ensure we mark initialized only after topics have been loaded in loadTopics()
})
</script>
