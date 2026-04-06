<script setup>
import { ref, computed, watch } from 'vue'
import TableList from '../../../table-list.vue'
import SearchBarAndSort from '../../../search-bar-and-sort.vue'
import TextPill from '../../../text-pill.vue'

const props = defineProps({
  rows: { type: Array, default: () => [] }
})

const emit = defineEmits(['view-item'])

const searchTitle = ref('')
const sortTitle = ref('none')
const searchAuthor = ref('')
const sortAuthor = ref('none')
const searchDifficulty = ref('')
const sortDifficulty = ref('none')

// Ensure only one column sort is active at a time
watch(sortDifficulty, (val) => {
  if (val !== 'none') {
    sortTitle.value = 'none'
    sortAuthor.value = 'none'
  }
})
watch(sortAuthor, (val) => {
  if (val !== 'none') {
    sortTitle.value = 'none'
    sortDifficulty.value = 'none'
  }
})
watch(sortTitle, (val) => {
  if (val !== 'none') {
    sortAuthor.value = 'none'
    sortDifficulty.value = 'none'
  }
})

const formatDateTime = (value) => {
  if (!value) return 'N/A'
  const dt = new Date(value)
  return dt.toLocaleString()
}

const parseProposed = (row) => {
  if (!row) return {}
  try {
    return typeof row.proposed_data === 'string' ? JSON.parse(row.proposed_data) : (row.proposed_data || {})
  } catch (e) { return {} }
}

const filteredRows = computed(() => {
  const t1 = searchTitle.value.toLowerCase()
  const t2 = searchAuthor.value.toLowerCase()
  const t3 = searchDifficulty.value.toLowerCase()

  let filtered = (props.rows || []).filter((row) => {
    const pd = parseProposed(row)
    const title = (row.problem_name || row.title || pd.problem_name || pd.title || '').toLowerCase()
    const author = (row.author || row.author_username || pd.author || pd.author_username || row.faculty_username || '').toLowerCase()
    const diff = (row.difficulty || pd.difficulty || '').toString().toLowerCase()
    const okTitle = t1 ? title.includes(t1) : true
    const okAuthor = t2 ? author.includes(t2) : true
    const okDiff = t3 ? diff.includes(t3) : true
    return okTitle && okAuthor && okDiff
  })

  // Apply sorting similar to admin approved questions table
  if (sortDifficulty.value !== 'none') {
    filtered = filtered.slice().sort((a, b) => {
      const aVal = displayDiff(a).toString().toLowerCase()
      const bVal = displayDiff(b).toString().toLowerCase()
      return sortDifficulty.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    })
  } else if (sortAuthor.value !== 'none') {
    filtered = filtered.slice().sort((a, b) => {
      const aVal = displayAuthor(a).toString().toLowerCase()
      const bVal = displayAuthor(b).toString().toLowerCase()
      return sortAuthor.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    })
  } else if (sortTitle.value !== 'none') {
    filtered = filtered.slice().sort((a, b) => {
      const aVal = displayTitle(a).toString().toLowerCase()
      const bVal = displayTitle(b).toString().toLowerCase()
      return sortTitle.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    })
  }

  return filtered
})

const onView = (row) => emit('view-item', row)

const displayTitle = (row) => {
  const pd = parseProposed(row)
  return row.problem_name || row.title || pd.problem_name || pd.title || 'Untitled Problem'
}

const displayAuthor = (row) => {
  const pd = parseProposed(row)
  return row.author || row.author_username || pd.author || pd.author_username || row.faculty_username || '—'
}

const displayDiff = (row) => row.difficulty || parseProposed(row).difficulty || '—'

const displayCommitted = (row) => row.admin_review_date || row.updated_at || parseProposed(row).created_at
</script>

<template>
  <TableList class="solo-table" :column_slot="['appr_title','appr_author','appr_diff','appr_committed','appr_status','appr_action']">
    <template #appr_title>
      <div>
        <p>Problem Title</p>
        <SearchBarAndSort
          v-model:search="searchTitle"
          v-model:sort="sortTitle"
        />
      </div>
    </template>
    <template #appr_author>
      <div>
        <p>Author</p>
        <SearchBarAndSort
          v-model:search="searchAuthor"
          v-model:sort="sortAuthor"
        />
      </div>
    </template>
    <template #appr_diff>
      <div>
        <p>Difficulty</p>
        <SearchBarAndSort
          v-model:search="searchDifficulty"
          v-model:sort="sortDifficulty"
        />
      </div>
    </template>
    <template #appr_committed>
      <div><p>Committed</p></div>
    </template>
    <template #appr_status>
      <div><p>Status</p></div>
    </template>
    <template #appr_action>
      <div><p>Action</p></div>
    </template>

    <template #content>
      <tr class="solo-table-row" v-for="(row, idx) in filteredRows" :key="row.id || idx">
        <td>{{ displayTitle(row) }}</td>
        <td>{{ displayAuthor(row) }}</td>
        <td>{{ displayDiff(row) }}</td>
        <td>{{ formatDateTime(displayCommitted(row)) }}</td>
        <td>
          <TextPill
            :allowed="['Committed']"
            :colors="['var(--c_greenmain)']"
            :word="'Committed'"
          />
        </td>
        <td class="action-cell">
          <button class="btn small" @click="onView(row)">View</button>
        </td>
      </tr>
      <tr v-if="filteredRows.length === 0">
        <td colspan="6" class="empty">No approved problems</td>
      </tr>
    </template>
  </TableList>
</template>

<style scoped>
.btn {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  background: #667eea;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}
.btn.small { padding: 6px 8px; }
.action-cell { min-width: 120px; }
.empty { text-align: center; color: #666; }
</style>
