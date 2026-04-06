<template>
  <div class="row d-flex flex-row">
    <section>
      <Window>
        <template #title></template>
        <template #content>
          <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                            <th>User ID</th>
                            <th>
                                <div>
                                    <p>Username</p>
                                    <SearchBarAndSort
                                      placeholder="Search username"
                                      :search="searchUsername"
                                      :sort="sortState.field === 'username' ? sortState.order : 'asc'"
                                      @update:search="(v)=>{ searchUsername.value = v }"
                                      @update:sort="(o)=>{ sortState.field='username'; sortState.order=o }"
                                    />
                                </div>
                            </th>
                            <th>
                                <div>
                                    <p>Email</p>
                                    <SearchBarAndSort
                                      placeholder="Search email"
                                      :search="searchEmail"
                                      :sort="sortState.field === 'email' ? sortState.order : 'asc'"
                                      @update:search="(v)=>{ searchEmail.value = v }"
                                      @update:sort="(o)=>{ sortState.field='email'; sortState.order=o }"
                                    />
                                </div>
                            </th>
                            <th>
                                <div>
                                    <p>Role</p>
                                    <select v-model="filterRole" class="search-select">
                                    <option value="">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="user">User</option>
                                    </select>
                                </div>
                            </th>
                            <th>Created At</th>
                            <th>Actions</th>
                    </tr>
                </thead>
                <tbody v-if="filteredUsers.length > 0">
                <tr v-for="user in filteredUsers" :key="user.user_id">
                  <td>{{ user.user_id }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="badge" :class="getBadgeClass(user.role)">{{ user.role || 'user' }}</span>
                  </td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td class="actions">
                    <button class="btn-small" @click="onViewUser(user.user_id)">View</button>
                    <button class="btn-small btn-danger" :class="{disabled: !perms?.canManageUsers}" @click="onBanUser(user.user_id)">Ban</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="filteredUsers.length === 0" class="empty-state">
              <p>No users found</p>
              <small v-if="searchUsername || searchEmail || filterRole">Try adjusting your search filters</small>
            </div>
          </div>
        </template>
      </Window>
    </section>

    <!-- User View Modal -->
    <UserViewModal
      modal-id="user-view-modal"
      :user="selectedUser"
      @close="closeUserModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import * as facultySocket from '/js/faculty-socket-helpers.js'
import { toastError, toastSuccess } from '../../Toast.vue'
import Window from '../../window.vue'
import SearchBarAndSort from '../../search-bar-and-sort.vue'
import UserViewModal from './modals/user-view-modal.vue'

const props = defineProps({
  user_rows: { type: Array, default: () => [] },
  perms: { type: Object, default: () => ({}) },
  socket: Object,
  sessionToken: String
})

const searchUsername = ref('')
const searchEmail = ref('')
const filterRole = ref('')
const sortState = reactive({ field: 'username', order: 'asc' })
const loading = ref(false)
const selectedUser = ref(null)

// Initialize socket on mount
onMounted(() => {
  if (props.socket) {
    facultySocket.initSocket(props.socket)
  }
})

const filteredUsers = computed(() => {
  let filtered = props.user_rows || []
  
  if (searchUsername.value) {
    filtered = filtered.filter(u => 
      u.username?.toLowerCase().includes(searchUsername.value.toLowerCase())
    )
  }
  
  if (searchEmail.value) {
    filtered = filtered.filter(u => 
      u.email?.toLowerCase().includes(searchEmail.value.toLowerCase())
    )
  }
  
  if (filterRole.value) {
    filtered = filtered.filter(u => u.role === filterRole.value)
  }
  
  // Apply sorting
  const term = (v) => (v||'').toString().toLowerCase()
  const getFieldVal = (u, field) => {
    if (field === 'username') return term(u.username)
    if (field === 'email') return term(u.email)
    return ''
  }
  const sf = sortState.field
  const so = sortState.order
  filtered = filtered.slice().sort((a,b)=>{
    const av = getFieldVal(a,sf); const bv = getFieldVal(b,sf)
    if (av === bv) return 0; const cmp = av > bv ? 1 : -1; return so === 'asc' ? cmp : -cmp
  })
  
  return filtered
})

function getBadgeClass(role) {
  const roleMap = { 'admin': 'bg-danger', 'faculty': 'bg-warning', 'user': 'bg-info' }
  return roleMap[role] || 'bg-secondary'
}
function formatDate(dateStr) { return !dateStr ? '-' : new Date(dateStr).toLocaleDateString() }

function openUserModal() {
  if (typeof window !== 'undefined' && window.bootstrap) {
    const modalElement = document.getElementById('user-view-modal')
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement)
      modal.show()
    }
  }
}

function closeUserModal() {
  if (typeof window !== 'undefined' && window.bootstrap) {
    const modalElement = document.getElementById('user-view-modal')
    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement)
      if (modal) modal.hide()
    }
  }
  selectedUser.value = null
}

function onViewUser(userId) {
  loading.value = true
  facultySocket.viewFacultyUser({
    token_session: props.sessionToken,
    user_id: userId
  }, (response) => {
    loading.value = false
    if (response.success) {
      selectedUser.value = response.user
      openUserModal()
    } else {
      // Let the backend be the source of truth for permissions;
      // surface its message but do not pre-block the action here.
      toastError(response.message || 'Failed to load user details')
    }
  })
}

function onBanUser(userId) {
  if (!props.perms?.canManageUsers) {
    toastError('You do not have permission to manage users')
    return
  }
  if (!userId) {
    toastError('Invalid user id')
    return
  }

  facultySocket.banUser({
    token_session: props.sessionToken,
    user_id: userId
  }, (response) => {
    if (!response) {
      toastError('Ban failed: no response from server')
      return
    }
    if (response.success) {
      try { toastSuccess('User banned successfully') } catch (e) {}
    } else {
      toastError(response.message || 'You are not authorized to ban users')
    }
  })
}
</script>

<style scoped>
.content-users {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header h3 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.search-input,
.search-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  flex: 1;
  min-width: 200px;
}

.search-input:focus,
.search-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.search-select {
  flex: 0 0 150px;
  cursor: pointer;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}

.table thead {
  background: #f5f5f5;
}

.table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}

.table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

.table tbody tr:hover {
  background: #f9f9f9;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #999;
}
</style>
