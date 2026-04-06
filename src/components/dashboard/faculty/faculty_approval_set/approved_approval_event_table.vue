<script setup>
import { ref, computed, watch } from 'vue'
import TableList from '../../../table-list.vue'
import SearchBarAndSort from '../../../search-bar-and-sort.vue'
import TextPill from '../../../text-pill.vue'

const props = defineProps({
  rows: { type: Array, default: () => [] }
})

const emit = defineEmits(['view-item'])

const searchName = ref('')
const sortName = ref('none')
const searchHost = ref('')
const sortHost = ref('none')

// Ensure only one column sort is active at a time
watch(sortName, (val) => {
  if (val !== 'none') sortHost.value = 'none'
})
watch(sortHost, (val) => {
  if (val !== 'none') sortName.value = 'none'
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
  } catch (e) {
    return {}
  }
}

const filteredRows = computed(() => {
  const t1 = searchName.value.toLowerCase()
  const t2 = searchHost.value.toLowerCase()

  let filtered = (props.rows || []).filter((row) => {
    const pd = parseProposed(row)
    const name = (row.event_name || row.title || pd.event_name || pd.title || '').toLowerCase()
    const host = (row.event_host || row.host || pd.host || pd.event_host || row.faculty_username || '').toLowerCase()
    const okName = t1 ? name.includes(t1) : true
    const okHost = t2 ? host.includes(t2) : true
    return okName && okHost
  })

  // Apply sorting similar to admin approved events table
  if (sortHost.value !== 'none') {
    filtered = filtered.slice().sort((a, b) => {
      const aVal = displayHost(a).toString().toLowerCase()
      const bVal = displayHost(b).toString().toLowerCase()
      return sortHost.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    })
  } else if (sortName.value !== 'none') {
    filtered = filtered.slice().sort((a, b) => {
      const aVal = displayName(a).toString().toLowerCase()
      const bVal = displayName(b).toString().toLowerCase()
      return sortName.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    })
  }

  return filtered
})

const onView = (row) => emit('view-item', row)

const displayName = (row) => {
  const pd = parseProposed(row)
  return row.event_name || row.title || pd.event_name || pd.title || 'Untitled Event'
}

const displayHost = (row) => {
  const pd = parseProposed(row)
  return row.event_host || row.host || pd.host || pd.event_host || row.faculty_username || '—'
}

const displayCommitted = (row) => row.admin_review_date || row.updated_at || parseProposed(row).created_at
</script>

<template>
  <TableList class="solo-table" :column_slot="['appr_name','appr_host','appr_committed','appr_status','appr_action']">
    <template #appr_name>
      <div>
        <p>Event Name</p>
        <SearchBarAndSort
          v-model:search="searchName"
          v-model:sort="sortName"
        />
      </div>
    </template>
    <template #appr_host>
      <div>
        <p>Host</p>
        <SearchBarAndSort
          v-model:search="searchHost"
          v-model:sort="sortHost"
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
        <td>{{ displayName(row) }}</td>
        <td>{{ displayHost(row) }}</td>
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
        <td colspan="5" class="empty">No approved events</td>
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
