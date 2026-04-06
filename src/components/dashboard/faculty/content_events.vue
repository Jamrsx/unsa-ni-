<template>
  <div class="row d-flex flex-row">
    <section class="flex-2">
      <Window>
        <template #title>Events</template>
        <template #content>
          <div class="header">
            <ButtonText title="+ Create Event" :class="{disabled: !perms?.canManageEvents}" @click="onCreate" />
          </div>
          <SplitMainWindow 
            v-model:currentSection="activeSection"
            :sections="eventSections" 
            default-section="event_all" 
            :show-label="false"
            class="top-split-main-window events_nav"
          >
            <template #event_all>
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Event ID</th>
                      <th>
                        <div>
                          <p>Event Name</p>
                          <SearchBarAndSort
                            placeholder="Search event name"
                            :search="filters.name"
                            :sort="sortState.field === 'name' ? sortState.order : 'asc'"
                            @update:search="onSearch('name', $event)"
                            @update:sort="onSort('name', $event)"
                          />
                        </div>
                      </th>
                      <th>
                        <div>
                          <p>Status</p>
                          <SearchBarAndSort
                            placeholder="Search status"
                            :search="filters.status"
                            :sort="sortState.field === 'status' ? sortState.order : 'asc'"
                            @update:search="onSearch('status', $event)"
                            @update:sort="onSort('status', $event)"
                          />
                        </div>
                      </th>
                      <th>Starts At</th>
                      <th>Ends At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody v-if="filteredAll.length > 0">
                    <tr v-for="event in filteredAll" :key="event.event_id || event.EventID">
                      <td>{{ event.event_id || event.EventID }}</td>
                      <td>{{ event.EventName || event.event_name }}</td>
                      <td>
                        <span v-if="event.pending_action === 'delete'" class="badge bg-danger">Pending Delete</span>
                        <span
                          v-else
                          class="badge"
                          :class="getEventStatusClass(event.Status || event.status)"
                        >
                          {{ (event.Status || event.status) === 'draft' ? 'Draft' : ((event.Status || event.status) || 'Active') }}
                        </span>
                      </td>
                      <td>{{ formatDate(event.StartsAt || event.starts_at) }}</td>
                      <td>{{ formatDate(event.EndsAt || event.ends_at) }}</td>
                      <td class="actions">
                        <button class="btn-small" @click="onView(event)">View</button>
                        <button class="btn-small" :class="{disabled: !perms?.canManageEvents}" @click="onEdit(event)">Edit</button>
                        <button class="btn-small" :class="{disabled: !perms?.canManageEvents}" @click="onManage(event)">Participants</button>
                        <button class="btn-small btn-danger" :class="{disabled: !perms?.canManageEvents}" @click="onDelete(event)">{{ getDeleteLabel(event) }}</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="filteredAll.length === 0" class="empty-state">
                  <p>No events found. Create one to get started!</p>
                  <ButtonText title="Create Event" :class="{disabled: !perms?.canManageEvents}" @click="onCreate" />
                </div>
              </div>
            </template>

            <template #event_faculty>
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Event ID</th>
                      <th>
                        <div>
                          <p>Event Name</p>
                          <SearchBarAndSort
                            placeholder="Search event name"
                            :search="filters.name"
                            :sort="sortState.field === 'name' ? sortState.order : 'asc'"
                            @update:search="onSearch('name', $event)"
                            @update:sort="onSort('name', $event)"
                          />
                        </div>
                      </th>
                      <th>
                        <div>
                          <p>Status</p>
                          <SearchBarAndSort
                            placeholder="Search status"
                            :search="filters.status"
                            :sort="sortState.field === 'status' ? sortState.order : 'asc'"
                            @update:search="onSearch('status', $event)"
                            @update:sort="onSort('status', $event)"
                          />
                        </div>
                      </th>
                      <th>Starts At</th>
                      <th>Ends At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody v-if="filteredFaculty.length > 0">
                    <tr v-for="event in filteredFaculty" :key="event.event_id || event.EventID">
                      <td>{{ event.event_id || event.EventID }}</td>
                      <td>{{ event.EventName || event.event_name }}</td>
                      <td>
                        <span v-if="event.pending_action === 'delete'" class="badge bg-danger">Pending Delete</span>
                        <span
                          v-else
                          class="badge"
                          :class="getEventStatusClass(event.Status || event.status)"
                        >
                          {{ (event.Status || event.status) === 'draft' ? 'Draft' : ((event.Status || event.status) || 'Active') }}
                        </span>
                      </td>
                      <td>{{ formatDate(event.StartsAt || event.starts_at) }}</td>
                      <td>{{ formatDate(event.EndsAt || event.ends_at) }}</td>
                      <td class="actions">
                        <button class="btn-small" @click="onView(event)">View</button>
                        <button class="btn-small" :class="{disabled: !perms?.canManageEvents}" @click="onEdit(event)">Edit</button>
                        <button class="btn-small" :class="{disabled: !perms?.canManageEvents}" @click="onManage(event)">Participants</button>
                        <button class="btn-small btn-danger" :class="{disabled: !perms?.canManageEvents}" @click="onDelete(event)">{{ getDeleteLabel(event) }}</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="filteredFaculty.length === 0" class="empty-state">
                  <p>No faculty events found</p>
                </div>
              </div>
            </template>

            <template #event_pending>
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Event ID</th>
                      <th>
                        <div>
                          <p>Event Name</p>
                          <SearchBarAndSort
                            placeholder="Search event name"
                            :search="filters.name"
                            :sort="sortState.field === 'name' ? sortState.order : 'asc'"
                            @update:search="onSearch('name', $event)"
                            @update:sort="onSort('name', $event)"
                          />
                        </div>
                      </th>
                      <th>
                        <div>
                          <p>Status</p>
                          <SearchBarAndSort
                            placeholder="Search status"
                            :search="filters.status"
                            :sort="sortState.field === 'status' ? sortState.order : 'asc'"
                            @update:search="onSearch('status', $event)"
                            @update:sort="onSort('status', $event)"
                          />
                        </div>
                      </th>
                      <th>Starts At</th>
                      <th>Ends At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody v-if="filteredPending.length > 0">
                    <tr v-for="(event, idx) in filteredPending" :key="event.event_id || event.EventID || event.id || idx">
                      <td>{{ event.event_id || event.EventID || event.id || '' }}</td>
                      <td>{{ displayEventName(event) }}</td>
                      <td>
                        <span v-if="event.pending_action === 'delete'" class="badge bg-danger">Pending Delete</span>
                        <span v-else class="badge" :class="getEventStatusClass(event.Status || event.status)">{{ (event.Status || event.status) || 'pending' }}</span>
                      </td>
                      <td>{{ formatDate(displayStarts(event)) }}</td>
                      <td>{{ formatDate(displayEnds(event)) }}</td>
                      <td class="actions">
                        <button class="btn-small" @click="onView(event)">View</button>
                        <!-- Pending tab shows approvals for OTHER faculty only; hide edit/delete/manage -->
                        <div class="img-btn-bg">
                          <ButtonImg
                            alt-text="pending check button"
                            class="pending_table_check_btn"
                            @click="onApprovePending(event)"
                          />
                        </div>
                        <div class="img-btn-bg">
                          <ButtonImg
                            alt-text="pending deny button"
                            class="pending_table_deny_btn"
                            @click="onDenyPending(event)"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="filteredPending.length === 0" class="empty-state">
                  <p>No pending events found</p>
                </div>
              </div>
            </template>
          </SplitMainWindow>
        </template>
      </Window>
    </section>

    <!-- Event Form Modal -->
    <EventFormModal
      modal-id="event-form-modal"
      :event="editingEvent"
      :loading="modalLoading"
      @submit="handleEventSubmit"
      @close="closeModal"
    />

    <!-- Event View Modal -->
    <Modals
      modal_id="event-view-modal"
      modal_title="Event Details"
      :close_btn_header_bool="true"
      :close_btn_footer_bool="true"
    >
      <template #content>
        <div v-if="viewEvent" class="p-2">
          <!-- Thumbnail -->
          <div class="row mb-3">
            <div class="col-12 text-center">
              <img :src="eventThumbnailSrc" alt="Event Thumbnail" class="img-fluid event-thumbnail" @error="onEventThumbError" />
            </div>
          </div>

          <!-- Header row: ID + Status -->
          <div class="row mb-2">
            <div class="col-6">
              <p class="label">Event ID</p>
              <p class="value">{{ viewEvent.event_id || viewEvent.EventID }}</p>
            </div>
            <div class="col-6 text-end">
              <span class="badge" :class="getEventStatusClass(viewEvent.status || viewEvent.Status)">
                {{ (viewEvent.status || viewEvent.Status) || 'Active' }}
              </span>
            </div>
          </div>

          <!-- Name + Host -->
          <div class="row mb-3">
            <div class="col-6">
              <p class="label">Event Name</p>
              <p class="value fw-bold">{{ viewEvent.event_name || viewEvent.EventName }}</p>
            </div>
            <div class="col-6">
              <p class="label">Host</p>
              <p class="value">{{ viewEvent.host_name || viewEvent.HostName || 'Unknown' }}</p>
            </div>
          </div>

          <!-- Schedule -->
          <div class="row mb-3">
            <div class="col-6">
              <p class="label">Starts At</p>
              <p class="value">{{ formatDate(viewEvent.starts_at || viewEvent.StartsAt) }}</p>
            </div>
            <div class="col-6">
              <p class="label">Ends At</p>
              <p class="value">{{ formatDate(viewEvent.ends_at || viewEvent.EndsAt) }}</p>
            </div>
          </div>

          <!-- Rewards -->
          <div class="row mb-3">
            <div class="col-6">
              <p class="label">Reward Points</p>
              <p class="value">{{ viewEvent.reward_points || viewEvent.RewardPoints || 0 }}</p>
            </div>
            <div class="col-6">
              <p class="label">Reward Level</p>
              <p class="value">{{ viewEvent.reward_level || viewEvent.RewardLevel || 0 }}</p>
            </div>
          </div>

          <!-- Participants list (if available) -->
          <div v-if="Array.isArray(viewParticipants) && viewParticipants.length" class="participants-box">
            <h6 class="label">Participants ({{ viewParticipants.length }})</h6>
            <div class="participants-grid">
              <div v-for="p in viewParticipants" :key="p.UserId || p.user_id" class="participant-item">
                <img :src="normalizeUrl(p.AvatarUrl || p.avatar_url, '/asset/default-avatar.png')" :alt="p.Username || p.username" class="avatar" />
                <div class="participant-meta">
                  <div class="name">{{ p.FullName || p.full_name || p.Username || p.username }}</div>
                  <div class="email">{{ p.Email || p.email }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-muted">No event selected</div>
      </template>
    </Modals>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import * as facultySocket from '/js/faculty-socket-helpers.js'
import { toastError, toastSuccess } from '../../Toast.vue'
import Window from '../../window.vue'
import SplitMainWindow from '../../split-main-window.vue'
import SearchPanel from '../../search-panel.vue'
import SearchBarAndSort from '../../search-bar-and-sort.vue'
import ButtonText from '../../button-text.vue'
import ButtonImg from '../../button-img.vue'
import EventFormModal from './modals/event-form-modal.vue'
import Modals from '../../modal.vue'

const props = defineProps({
  event_rows: { type: Array, default: () => [] },
  currentEvent: Object,
  currentParticipants: Array,
  perms: { type: Object, default: () => ({}) },
  socket: Object,
  sessionToken: String
})

const loading = ref(false)
const selectedEvent = ref(null)
const modalLoading = ref(false)
const editingEvent = ref(null)
const viewEvent = ref(null)
const eventThumbnailSrc = computed(() => normalizeUrl(viewEvent.value?.thumbnail_url || viewEvent.value?.ThumbnailUrl, '/asset/event/default-event.png'))

function getDeleteLabel(eventItem) {
  if (eventItem && eventItem.change_id && (eventItem.is_mine === 1 || eventItem.is_mine === true)) {
    return 'Cancel Change'
  }
  return 'Delete'
}

// Backend disabled: skip socket init
onMounted(() => {
  try {
    if (props.socket) facultySocket.initSocket(props.socket)
    // fetch initial events for parent
    try {
      facultySocket.getFacultyEvents({ token_session: props.sessionToken }, (resp) => {
        if (resp && resp.success && Array.isArray(resp.events)) emit('refresh-events', resp.events)
      })
    } catch (e) { console.warn('facultySocket.getFacultyEvents failed', e) }
  } catch (e) {}
})

function _openViewEventHandler(e){
  try{
    const payload = e && e.detail ? e.detail : null
    if(!payload) return
    viewEvent.value = payload
    openViewModal()
  }catch(err){ console.warn('openViewEvent handler failed', err) }
}

function _openEditEventHandler(e){
  try{
    const payload = e && e.detail ? e.detail : null
    if(!payload) return
    editingEvent.value = payload
    openModal()
  }catch(err){ console.warn('openEditEvent handler failed', err) }
}

onMounted(() => {
  try{
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('faculty.openViewEvent', _openViewEventHandler)
      window.addEventListener('faculty.openEditEvent', _openEditEventHandler)
    }
  }catch(e){}
})

onBeforeUnmount(() => {
  try{
    if (typeof window !== 'undefined' && window.removeEventListener) {
      window.removeEventListener('faculty.openViewEvent', _openViewEventHandler)
      window.removeEventListener('faculty.openEditEvent', _openEditEventHandler)
    }
  }catch(e){}
})

watch(() => props.sessionToken, (nv) => {
  try {
    if (!nv) return
    facultySocket.getFacultyEvents({ token_session: nv }, (resp) => {
      if (resp && resp.success && Array.isArray(resp.events)) emit('refresh-events', resp.events)
    })
  } catch (e) {}
})

const emit = defineEmits(['view-event', 'create-event', 'edit-event', 'update-event', 'delete-event', 'manage-participants', 'approve-event', 'deny-event', 'refresh-events'])

const activeSection = ref('event_all')
const eventSections = [
  { id: 'event_all', name: 'Global Event' },
  { id: 'event_faculty', name: 'My Event' },
  { id: 'event_pending', name: 'Pending Event' }
]

const myEvents = computed(() => {
  return (props.event_rows || []).filter(e => e.is_mine === 1 || e.is_mine === true)
})

const pendingEvents = computed(() => {
  const rows = props.event_rows || []
  const byKey = new Map()

  for (const e of rows) {
    const isMine = e.is_mine === 1 || e.is_mine === true
    let include = false

    // Shared Level 1 pending items from other faculty. When both a
    // committed/approvals row and a faculty_pending_changes-backed row
    // exist for the same event, we keep a single entry and prefer the
    // change-backed row.
    if (e.status === 'pending' && !isMine) include = true

    if (!include) continue

    const baseId = e.event_id ?? e.EventID ?? null
    const key = baseId != null ? `event:${baseId}` : (e.change_id ? `change:${e.change_id}` : `row:${byKey.size}`)

    if (!byKey.has(key)) {
      byKey.set(key, e)
    } else {
      const existing = byKey.get(key)
      const existingIsChange = !!existing.change_id
      const currentIsChange = !!e.change_id
      if (currentIsChange && !existingIsChange) {
        byKey.set(key, e)
      }
    }
  }

  return Array.from(byKey.values())
})

// Helpers for proposed_data fallback
const parseProposed = (row) => {
  if (!row) return {}
  try { return typeof row.proposed_data === 'string' ? JSON.parse(row.proposed_data) : (row.proposed_data || {}) } catch (e) { return {} }
}

const displayEventName = (row) => {
  const pd = parseProposed(row)
  return row.EventName || row.event_name || pd.EventName || pd.event_name || 'Untitled Event'
}

const displayStarts = (row) => {
  const pd = parseProposed(row)
  return row.StartsAt || row.starts_at || pd.starts_at || pd.StartsAt || pd.start_time || ''
}

const displayEnds = (row) => {
  const pd = parseProposed(row)
  return row.EndsAt || row.ends_at || pd.ends_at || pd.EndsAt || pd.end_time || ''
}

const filters = reactive({ name: '', status: '' })
const sortState = reactive({ field: 'name', order: 'asc' })

function onSearch(field, value){ filters[field] = value }
function onSort(field, order){ sortState.field = field; sortState.order = order }

function applyFiltersAndSort(arr){
  let out = arr || []
  const term = (v) => (v||'').toString().toLowerCase()
  if (filters.name) out = out.filter(e => term(e.EventName||e.event_name).includes(term(filters.name)))
  if (filters.status) out = out.filter(e => term(e.Status||e.status) === term(filters.status))
  const getFieldVal = (e, field) => {
    if (field === 'name') return term(e.EventName||e.event_name)
    if (field === 'status') return term(e.Status||e.status)
    return ''
  }
  const sf = sortState.field
  const so = sortState.order
  out = out.slice().sort((a,b)=>{
    const av = getFieldVal(a,sf); const bv = getFieldVal(b,sf)
    if (av === bv) return 0; const cmp = av > bv ? 1 : -1; return so === 'asc' ? cmp : -cmp
  })
  return out
}

// Global = approved only
const filteredAll = computed(()=> applyFiltersAndSort((props.event_rows || []).filter(e => e.status === 'approved')))
// My = everything I created (approved or pending)
const filteredFaculty = computed(()=> applyFiltersAndSort(myEvents.value || []))
// Pending = items created by OTHER faculty that are still pending
const filteredPending = computed(()=> applyFiltersAndSort(pendingEvents.value || []))

function onFiltersUpdated(f){ /* no-op; header controls used */ }

function guard(actionAllowed, errMsg, cb){ if(!actionAllowed){ toastError(errMsg); return } cb() }

function openModal() {
  if (typeof window !== 'undefined' && window.bootstrap) {
    const modalElement = document.getElementById('event-form-modal')
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement)
      modal.show()
    }
  }
}

function openViewModal() {
  if (typeof window !== 'undefined' && window.bootstrap) {
    const modalElement = document.getElementById('event-view-modal')
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement)
      modal.show()
    }
  }
}

function closeModal() {
  if (typeof window !== 'undefined' && window.bootstrap) {
    const modalElement = document.getElementById('event-form-modal')
    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement)
      if (modal) modal.hide()
    }
  }
  editingEvent.value = null
}

const onCreate = () => {
  guard(props.perms?.canManageEvents, 'You do not have permission to create events', () => {
    editingEvent.value = null
    openModal()
  })
}

const onView = (eventItem) => {
  const targetId = typeof eventItem === 'object' ? (eventItem.event_id || eventItem.EventID) : eventItem
  // Backend disabled: view using provided row only
  loading.value = false
  const fallback = typeof eventItem === 'object' ? eventItem : null
  const target = fallback
  if (!target) { toastError('Event not found'); return }
  viewEvent.value = target
  openViewModal()
  emit('view-event', target)
}

const onEdit = (eventItem) => {
  guard(props.perms?.canManageEvents, 'You do not have permission to edit events', () => {
    // Allow editing only for committed events created by this faculty
    const event = typeof eventItem === 'object'
      ? eventItem
      : (props.event_rows || []).find(e => (e.event_id || e.EventID) === eventItem)

    if (!event) { toastError('Event not found'); return }
    // Allow editing for:
    //  - committed events created by this faculty (have event_id/EventID)
    //  - draft/pending creates that live only in faculty_pending_changes
    //    (no event_id yet) but belong to this faculty (is_mine=1).
    if (!event.event_id && !event.EventID) {
      if (!event.change_id || !(event.is_mine === 1 || event.is_mine === true)) {
        toastError('This pending event cannot be edited directly. Use approvals.');
        return
      }
    } else if (event.is_mine === 0 || event.is_mine === false) {
      toastError('You can only edit events you created');
      return
    }
    editingEvent.value = event
    openModal()
  })
}

const onManage = (eventItem) => {
  guard(props.perms?.canManageEvents, 'You do not have permission to manage events', () => {
    const event = typeof eventItem === 'object'
      ? eventItem
      : (props.event_rows || []).find(e => (e.event_id || e.EventID) === eventItem)

    if (!event || (!event.event_id && !event.EventID)) {
      toastError('Cannot manage participants for this pending event');
      return
    }
    emit('manage-participants', event.event_id || event.EventID)
  })
}

const onDelete = (eventItem) => {
  guard(props.perms?.canManageEvents, 'You do not have permission to delete events', () => {
    const event = typeof eventItem === 'object'
      ? eventItem
      : (props.event_rows || []).find(e => (e.event_id || e.EventID) === eventItem)

    if (!event) { toastError('Event not found'); return }

    // If this is a pending faculty change owned by this user, treat delete
    // as "cancel my pending change" using the change_id.
    if (event.change_id && (event.is_mine === 1 || event.is_mine === true)) {
      if (!confirm('Are you sure you want to cancel this pending change?')) return
      emit('delete-event', { change_id: event.change_id })
      return
    }

    // Do not attempt to delete purely pending events that have no committed event_id
    if (!event.event_id && !event.EventID) {
      toastError('This pending event cannot be deleted here. Use approvals.');
      return
    }

    if (!confirm('Are you sure you want to delete this event?')) return
    // Delegate deletion to parent/FacultyDashboard using the committed id
    emit('delete-event', event.event_id || event.EventID)
  })
}

const onApprovePending = (event) => {
  guard(props.perms?.canManageEvents, 'You do not have permission to approve events', () => {
    emit('approve-event', event)
  })
}

const onDenyPending = (event) => {
  guard(props.perms?.canManageEvents, 'You do not have permission to deny events', () => {
    emit('deny-event', event)
  })
}

function handleEventSubmit(payload) {
  modalLoading.value = true
  try {
    // If we are editing a draft/pending event coming from
    // faculty_pending_changes, the editingEvent will carry a
    // change_id but the payload will not yet have an event_id.
    // In that case, treat this as an update so the dashboard can
    // update the underlying pending change instead of creating a
    // brand new event.
    if (!payload.EventID && !payload.event_id && !payload.id && editingEvent.value && editingEvent.value.change_id) {
      payload.change_id = editingEvent.value.change_id
    }

    const hasId = payload && (payload.EventID || payload.event_id || payload.id)
    const eventName = hasId || payload.change_id ? 'update-event' : 'create-event'
    // Forward to parent/FacultyDashboard, which will call the backend
    emit(eventName, payload)
  } finally {
    modalLoading.value = false
    closeModal()
  }
}

function normalizeUrl(path, fallback) {
  if (!path) return fallback
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return path
  return '/' + path.replace(/^\//, '')
}

function getEventStatusClass(status) {
  const map = { 'Active': 'bg-success', 'Inactive': 'bg-secondary', 'Upcoming': 'bg-info', 'Completed': 'bg-secondary', 'Pending': 'bg-warning', 'pending': 'bg-warning' }
  return map[status] || map[(status||'').toString()] || 'bg-secondary'
}
function formatDate(dateStr) { if (!dateStr) return '-'; try { return new Date(dateStr).toLocaleDateString() } catch(e) { return '-' } }
</script>

<style scoped>
/* Banner for feature disabled state */
.feature-disabled {
  background: #fff3cd;
  color: #664d03;
  border: 1px solid #ffecb5;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}
.content-events { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header h3 { font-size: 24px; font-weight: 600; margin: 0; }

.tab-nav {
  display: flex;
  gap: 5px;
  margin-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
}

.tab-btn {
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab-btn:hover {
  color: #667eea;
  background: #f9fafb;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}
.btn-primary { background: #667eea; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; }
.btn-primary:hover { background: #5568d3; }
.btn-primary.disabled, .btn-small.disabled { opacity: .6; }
.table-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,.1); }
.table { width: 100%; border-collapse: collapse; margin: 0; }
.table thead { background: #f5f5f5; }
.table th { padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid #ddd; }
.table td { padding: 12px 15px; border-bottom: 1px solid #eee; }
.table tbody tr:hover { background: #f9f9f9; }
.actions { display: flex; gap: 8px; }
.btn-small { background: #667eea; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px; white-space: nowrap; }
.btn-small:hover { background: #5568d3; }
.btn-small.btn-danger { background: #dc3545; }
.btn-small.btn-danger:hover { background: #c82333; }
.badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; color: white; }
.empty-state { padding: 40px; text-align: center; color: #999; }
.empty-state button { margin-top: 15px; }
.search-input, .search-select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; min-width: 200px; }
</style>
