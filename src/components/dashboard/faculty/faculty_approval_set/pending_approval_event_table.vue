<script setup>
import { ref, computed, watch } from 'vue'
import TableList from '../../../table-list.vue'
import SearchBarAndSort from '../../../search-bar-and-sort.vue'
import ButtonImg from '../../../button-img.vue'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  perms: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['approve-item', 'deny-item', 'view-item'])

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

const getProposed = (row) => {
  if (!row) return {}
  if (typeof row.proposed_data === 'string') {
    try { return JSON.parse(row.proposed_data) } catch (e) { return {} }
  }
  return row.proposed_data || {}
}

const getName = (row) => {
  const proposed = getProposed(row)
  return (row.event_name || row.title || proposed.event_name || proposed.title || '').toLowerCase()
}

const getHost = (row) => {
  const proposed = getProposed(row)
  return (row.event_host || row.host || proposed.host || proposed.host_id || '').toString().toLowerCase()
}

const filteredRows = computed(() => {
  const term1 = searchName.value.toLowerCase()
  const term2 = searchHost.value.toLowerCase()

  let filtered = (props.rows || []).filter((row) => {
    const name = getName(row)
    const host = getHost(row)
    const okName = term1 ? name.includes(term1) : true
    const okHost = term2 ? host.includes(term2) : true
    return okName && okHost
  })

  // Apply sorting similar to admin pending events table
  if (sortHost.value !== 'none') {
    filtered = filtered.slice().sort((a, b) => {
      const aVal = getHost(a)
      const bVal = getHost(b)
      return sortHost.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    })
  } else if (sortName.value !== 'none') {
    filtered = filtered.slice().sort((a, b) => {
      const aVal = getName(a)
      const bVal = getName(b)
      return sortName.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    })
  }

  return filtered
})

const onApprove = (row) => emit('approve-item', { approval_id: row.id || row.approval_id, content_type: row.content_type || 'event', row })
const onDeny = (row) => emit('deny-item', { approval_id: row.id || row.approval_id, content_type: row.content_type || 'event', row })
const onView = (row) => emit('view-item', row)
</script>

<template>
  <TableList class="solo-table" :column_slot="['appr_name','appr_host','appr_schedule','appr_status','appr_action']">
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
    <template #appr_schedule>
      <div><p>Submitted</p></div>
    </template>
    <template #appr_status>
      <div><p>Status</p></div>
    </template>
    <template #appr_action>
      <div><p>Action</p></div>
    </template>

    <template #content>
      <tr class="solo-table-row" v-for="(row, idx) in filteredRows" :key="row.id || idx">
        <td>{{ (row.event_name || row.title) || ((typeof row.proposed_data === 'string') ? (JSON.parse(row.proposed_data || '{}').event_name || JSON.parse(row.proposed_data || '{}').title) : (row.proposed_data && (row.proposed_data.event_name || row.proposed_data.title))) || 'Untitled Event' }}</td>
        <td>{{ row.event_host || row.host || ((typeof row.proposed_data === 'string') ? (JSON.parse(row.proposed_data || '{}').host || JSON.parse(row.proposed_data || '{}').author_id) : (row.proposed_data && (row.proposed_data.host || row.proposed_data.author_id))) || '—' }}</td>
        <td>{{ formatDateTime(row.created_at || row.requested_at || (row.proposed_data && (row.proposed_data.created_at || row.created_at))) }}</td>
        <td>{{ row.status || 'pending' }}</td>
        <td class="action-cell">
          <button class="btn small pending_table_view_btn" :disabled="!perms?.canManageApprovals" @click="onView(row)">View</button>
          <div class="img-btn-bg">
            <ButtonImg
              alt-text="pending check button"
              class="pending_table_check_btn"
              :class="{ disabled: !perms?.canManageApprovals }"
              @click="perms?.canManageApprovals && onApprove(row)"
            />
          </div>
          <div class="img-btn-bg">
            <ButtonImg
              alt-text="pending deny button"
              class="pending_table_deny_btn"
              :class="{ disabled: !perms?.canManageApprovals }"
              @click="perms?.canManageApprovals && onDeny(row)"
            />
          </div>
        </td>
      </tr>
      <tr v-if="filteredRows.length === 0">
        <td colspan="5" class="empty">No pending events</td>
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
  margin-right: 6px;
  font-size: 12px;
}
.btn.small { padding: 6px 8px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.action-cell { min-width: 240px; }
.empty { text-align: center; color: #666; }
</style>
