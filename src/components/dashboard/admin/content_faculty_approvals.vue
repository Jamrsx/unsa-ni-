<template>
  <div class="faculty-approvals">
    <h3>Faculty Pending Changes (Admin Review)</h3>
    <div v-if="!rows || rows.length === 0" class="empty-state">No pending faculty changes.</div>
    <table v-else class="table table-striped table-hover">
      <thead>
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Table</th>
          <th>Record</th>
          <th>Action</th>
          <th>Proposed</th>
          <th>Submitted</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td>{{ row.id }}</td>
          <td>{{ row.change_type }}</td>
          <td>{{ row.table_name }}</td>
          <td>{{ row.record_id }}</td>
          <td>{{ row.action_type }}</td>
          <td><pre class="proposed">{{ formatJson(row.proposed_data) }}</pre></td>
          <td>{{ formatDate(row.created_at) }}</td>
          <td class="actions">
                    <button class="btn btn-success btn-sm" @click="approveRow(row)">Approve</button>
                    <button class="btn btn-danger btn-sm" @click="rejectRow(row)">Reject</button>
                  </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>

import { defineProps, defineEmits } from 'vue';
import { can, getPermissions } from '../../../js/permissions.js'
import { toastError } from '../../Toast.vue'
import { normalizeTopic, topicPermissionAllowed } from '../../../js/user-dashboard.js'

const props = defineProps({ rows: { type: Array, default: () => [] } });
const emit = defineEmits(['approve-change','reject-change'])

function approveRow(row) {
  // If this is a problem change, require topic-specific permission as well
  if (!(can('roles.manage') || can('approvals.manage'))) {
    // fallback to topic-specific check for problem changes
    if (row.change_type === 'problem') {
      let proposed = null
      try { proposed = typeof row.proposed_data === 'string' ? JSON.parse(row.proposed_data) : row.proposed_data } catch (e) { proposed = null }
      const topics = (proposed && proposed.topics) ? proposed.topics : []
      if (!topicPermissionAllowed(topics, 'problem.approvals.manage')) {
        try { toastError('You are not authorized to approve faculty changes.'); } catch (e) {}
        return
      }
    } else {
      try { toastError('You are not authorized to approve faculty changes.'); } catch (e) {}
      return
    }
  }
  emit('approve-change', row)
}

function rejectRow(row) {
  if (!(can('roles.manage') || can('approvals.manage'))) {
    if (row.change_type === 'problem') {
      let proposed = null
      try { proposed = typeof row.proposed_data === 'string' ? JSON.parse(row.proposed_data) : row.proposed_data } catch (e) { proposed = null }
      const topics = (proposed && proposed.topics) ? proposed.topics : []
      if (!topicPermissionAllowed(topics, 'problem.approvals.manage')) {
        try { toastError('You are not authorized to reject faculty changes.'); } catch (e) {}
        return
      }
    } else {
      try { toastError('You are not authorized to reject faculty changes.'); } catch (e) {}
      return
    }
  }
  emit('reject-change', row)
}

function formatJson(val) {
  try {
    if (!val) return '{}';
    return typeof val === 'string' ? JSON.stringify(JSON.parse(val), null, 2) : JSON.stringify(val, null, 2);
  } catch (e) {
    return String(val);
  }
}

function formatDate(d) {
  try { return new Date(d).toLocaleString(); } catch (e) { return d || ''; }
}
</script>

<style scoped>
.faculty-approvals { margin-top: 16px; }
.empty-state { padding: 8px; color: #666; }
.table .proposed { max-width: 380px; white-space: pre-wrap; font-size: 12px; }
.actions { display: flex; gap: 8px; }
</style>
