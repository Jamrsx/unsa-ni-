<template>
  <Modals
    :modal_id="modalId"
    :modal_title="'User Details'"
    :close_btn_header_bool="true"
  >
    <template #content>
      <div class="user-details" v-if="user">
        <div class="detail-row">
          <div class="detail-label">User ID</div>
          <div class="detail-value">{{ user.id || user.user_id || user.UserID || 'N/A' }}</div>
        </div>

        <div class="detail-row">
          <div class="detail-label">Username</div>
          <div class="detail-value">{{ user.username || user.Username || 'N/A' }}</div>
        </div>

        <div class="detail-row">
          <div class="detail-label">Email</div>
          <div class="detail-value">{{ user.email || user.Email || 'N/A' }}</div>
        </div>

        <div class="detail-row">
          <div class="detail-label">Role</div>
          <div class="detail-value">
            <span :class="['role-badge', getRoleClass(user.role || user.Role)]">
              {{ formatRole(user.role || user.Role) }}
            </span>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-label">Status</div>
          <div class="detail-value">
            <span :class="['status-badge', user.is_active ? 'active' : 'inactive']">
              {{ user.is_active || user.IsActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-label">Created At</div>
          <div class="detail-value">{{ formatDate(user.created_at || user.CreatedAt) }}</div>
        </div>

        <div class="detail-row" v-if="user.last_login || user.LastLogin">
          <div class="detail-label">Last Login</div>
          <div class="detail-value">{{ formatDate(user.last_login || user.LastLogin) }}</div>
        </div>

        <div class="detail-row" v-if="user.updated_at || user.UpdatedAt">
          <div class="detail-label">Last Updated</div>
          <div class="detail-value">{{ formatDate(user.updated_at || user.UpdatedAt) }}</div>
        </div>
      </div>

      <div v-else class="text-center text-muted py-4">
        <p>No user data available</p>
      </div>
    </template>

    <template #modal_footer>
      <button
        type="button"
        class="btn btn-secondary"
        data-bs-dismiss="modal"
      >
        Close
      </button>
    </template>
  </Modals>
</template>

<script setup>
import { computed } from 'vue'
import Modals from '../../../modal.vue'

const props = defineProps({
  modalId: {
    type: String,
    required: true
  },
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

function formatRole(role) {
  if (!role) return 'N/A'
  const roleMap = {
    'admin': 'Administrator',
    'faculty': 'Faculty',
    'student': 'Student'
  }
  return roleMap[role.toLowerCase()] || role
}

function getRoleClass(role) {
  if (!role) return ''
  const roleMap = {
    'admin': 'role-admin',
    'faculty': 'role-faculty',
    'student': 'role-student'
  }
  return roleMap[role.toLowerCase()] || ''
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}
</script>

<style scoped>
.user-details {
  padding: 0.5rem 0;
}

.detail-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid #eee;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.detail-value {
  color: #333;
  font-size: 14px;
  word-break: break-word;
}

.role-badge,
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.role-admin {
  background: #dc3545;
  color: white;
}

.role-faculty {
  background: #667eea;
  color: white;
}

.role-student {
  background: #28a745;
  color: white;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #6c757d;
}

.py-4 {
  padding: 1.5rem 0;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

@media (max-width: 576px) {
  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  
  .detail-label {
    font-size: 12px;
    color: #777;
  }
}
</style>
