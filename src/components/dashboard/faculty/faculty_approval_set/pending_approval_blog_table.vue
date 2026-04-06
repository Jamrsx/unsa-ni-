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

const searchTitle = ref('')
const sortTitle = ref('none')
const searchAuthor = ref('')
const sortAuthor = ref('none')

// Ensure only one column sort is active at a time
watch(sortTitle, (val) => {
  if (val !== 'none') sortAuthor.value = 'none'
})
watch(sortAuthor, (val) => {
  if (val !== 'none') sortTitle.value = 'none'
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

const getTitle = (row) => {
  const proposed = getProposed(row)
  return (row.blog_title || row.title || proposed.title || proposed.blog_title || '').toLowerCase()
}

const getAuthor = (row) => {
  const proposed = getProposed(row)
  return (row.author || row.blog_author || proposed.author || proposed.author_id || '').toString().toLowerCase()
}

const filteredRows = computed(() => {
  const t1 = searchTitle.value.toLowerCase()
  const t2 = searchAuthor.value.toLowerCase()

  let filtered = (props.rows || []).filter((row) => {
    const title = getTitle(row)
    const author = getAuthor(row)
    const okTitle = t1 ? title.includes(t1) : true
    const okAuthor = t2 ? author.includes(t2) : true
    return okTitle && okAuthor
  })

  // Apply sorting similar to admin pending blogs table
  if (sortAuthor.value !== 'none') {
    filtered = filtered.slice().sort((a, b) => {
      const aVal = getAuthor(a)
      const bVal = getAuthor(b)
      return sortAuthor.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    })
  } else if (sortTitle.value !== 'none') {
    filtered = filtered.slice().sort((a, b) => {
      const aVal = getTitle(a)
      const bVal = getTitle(b)
      return sortTitle.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    })
  }

  return filtered
})

const onApprove = (row) => emit('approve-item', { approval_id: row.id || row.approval_id, content_type: row.content_type || 'blog', row })
const onDeny = (row) => emit('deny-item', { approval_id: row.id || row.approval_id, content_type: row.content_type || 'blog', row })
const onView = (row) => emit('view-item', row)
</script>

<template>
  <TableList class="solo-table" :column_slot="['appr_title','appr_author','appr_submitted','appr_status','appr_action']">
    <template #appr_title>
      <div>
        <p>Blog Title</p>
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
    <template #appr_submitted>
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
        <td>{{ row.blog_title || row.title || ((typeof row.proposed_data === 'string') ? (JSON.parse(row.proposed_data || '{}').title || JSON.parse(row.proposed_data || '{}').blog_title) : (row.proposed_data && (row.proposed_data.title || row.proposed_data.blog_title))) || 'Untitled Blog' }}</td>
        <td>{{ row.author || row.blog_author || ((typeof row.proposed_data === 'string') ? (JSON.parse(row.proposed_data || '{}').author || JSON.parse(row.proposed_data || '{}').author_id) : (row.proposed_data && (row.proposed_data.author || row.proposed_data.author_id))) || '—' }}</td>
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
        <td colspan="5" class="empty">No pending blogs</td>
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
