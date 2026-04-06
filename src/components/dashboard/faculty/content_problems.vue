<template>
  <div class="row d-flex flex-row">
    <section>
      <Window>
        <template #title></template>
        <template #content>
          <SplitMainWindow 
            v-model:currentSection="activeSection"
            :sections="problemSections" 
            default-section="problem_all" 
            :show-label="false"
            class="top-split-main-window problem_nav"
          >
            <template #nav-menu-bottom>
              <ButtonText title="+ Create Problem" :class="{disabled: !perms?.canManageProblems}" @click="onCreate" />
            </template>

            <template #problem_all>
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Problem ID</th>
                      <th><div><p>Name</p></div></th>
                      <th><div><p>Topics</p></div></th>
                      <th><div><p>Difficulty</p></div></th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody v-if="filteredAll.length > 0">
                    <tr v-for="problem in filteredAll" :key="problem.problem_id">
                      <td>{{ problem.problem_id }}</td>
                      <td>{{ problem.problem_name }}</td>
                      <td>
                        <span v-if="getTopicsFromRow(problem).length === 0" class="text-muted small">None</span>
                        <span v-else>
                          <TextPill
                            v-for="(topic, i) in getTopicsFromRow(problem)"
                            :key="`${problem.problem_id}-topic-${i}`"
                            :allowed="getTopicsFromRow(problem)"
                            :colors="getTopicColors(getTopicsFromRow(problem))"
                            :word="topic"
                            size="sm"
                            class="me-1 mb-1 d-inline-block"
                          />
                        </span>
                      </td>
                      <td>
                        <span class="badge" :class="getDifficultyClass(problem.difficulty)">{{ problem.difficulty }}</span>
                      </td>
                      <td>
                        <span v-if="problem.pending_action === 'delete'" class="badge bg-danger">Pending Delete</span>
                        <span
                          v-else
                          class="badge"
                          :class="getStatusClass(problem.status)"
                        >
                          {{ problem.status === 'draft' ? 'Draft' : (problem.status || 'Active') }}
                        </span>
                      </td>
                      <td class="actions">
                        <button class="btn-small" @click="onView(problem)">View</button>
                        <button
                          class="btn-small"
                          :class="{disabled: !perms?.canManageProblems}"
                          @click="onEdit(problem.problem_id)"
                        >
                          Edit
                        </button>
                        <!-- Pending tab is approvals-only for OTHER faculty problems; hide delete here -->
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="filteredAll.length === 0" class="empty-state">
                  <p>No problems found</p>
                </div>
              </div>
            </template>

            <template #problem_faculty>
              <div class="table-container">
                <table v-if="myProblems.length > 0" class="table">
                  <thead>
                    <tr>
                      <th>Problem ID</th>
                      <th><div><p>Name</p></div></th>
                      <th><div><p>Topics</p></div></th>
                      <th>
                        <div>
                          <p>Difficulty</p>
                          
                        </div>
                      </th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="problem in filteredFaculty" :key="problem.problem_id">
                      <td>{{ problem.problem_id }}</td>
                      <td>{{ problem.problem_name }}</td>
                      <td>
                        <span v-if="getTopicsFromRow(problem).length === 0" class="text-muted small">None</span>
                        <span v-else>
                          <TextPill
                            v-for="(topic, i) in getTopicsFromRow(problem)"
                            :key="`${problem.problem_id}-topic-${i}`"
                            :allowed="getTopicsFromRow(problem)"
                            :colors="getTopicColors(getTopicsFromRow(problem))"
                            :word="topic"
                            size="sm"
                            class="me-1 mb-1 d-inline-block"
                          />
                        </span>
                      </td>
                      <td>
                        <span class="badge" :class="getDifficultyClass(problem.difficulty)">{{ problem.difficulty }}</span>
                      </td>
                      <td>
                        <span v-if="problem.pending_action === 'delete'" class="badge bg-danger">Pending Delete</span>
                        <span
                          v-else
                          class="badge"
                          :class="getStatusClass(problem.status)"
                        >
                          {{ problem.status === 'draft' ? 'Draft' : (problem.status || 'Active') }}
                        </span>
                      </td>
                      <td class="actions">
                        <button class="btn-small" @click="onView(problem)">View</button>
                        <button class="btn-small" :class="{disabled: !perms?.canManageProblems}" @click="onEdit(problem.problem_id)">Edit</button>
                        <button class="btn-small btn-danger" :class="{disabled: !perms?.canManageProblems}" @click="onDelete(problem)">{{ getDeleteLabel(problem) }}</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="filteredFaculty.length === 0" class="empty-state">
                  <p>No faculty problems found</p>
                </div>
              </div>
            </template>

            <template #problem_pending>
              <div class="table-container">
                <table v-if="pendingProblems.length > 0" class="table">
                  <thead>
                    <tr>
                      <th>Problem ID</th>
                      <th><div><p>Name</p></div></th>
                      <th><div><p>Topics</p></div></th>
                      <th><div><p>Difficulty</p></div></th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(problem, idx) in filteredPending" :key="problem.problem_id || problem.id || idx">
                      <td>{{ problem.problem_id || problem.id || '' }}</td>
                      <td>{{ displayTitle(problem) }}</td>
                      <td>
                        <span v-if="getTopicsFromRow(problem).length === 0" class="text-muted small">None</span>
                        <span v-else>
                          <TextPill
                            v-for="(topic, i) in getTopicsFromRow(problem)"
                            :key="`${problem.problem_id}-topic-${i}`"
                            :allowed="getTopicsFromRow(problem)"
                            :colors="getTopicColors(getTopicsFromRow(problem))"
                            :word="topic"
                            size="sm"
                            class="me-1 mb-1 d-inline-block"
                          />
                        </span>
                      </td>
                      <td>
                        <span class="badge" :class="getDifficultyClass(displayDiff(problem))">{{ displayDiff(problem) }}</span>
                      </td>
                      <td>
                        <span v-if="problem.pending_action === 'delete'" class="badge bg-danger">Pending Delete</span>
                        <span
                          v-else
                          class="badge"
                          :class="getStatusClass(problem.status)"
                        >
                          {{ problem.status === 'draft' ? 'Draft' : (problem.status || 'pending') }}
                        </span>
                      </td>
                      <td class="actions">
                        <button class="btn-small" @click="onView(problem)">View</button>
                        <!-- Pending tab is approvals-only for OTHER faculty problems; hide edit/delete/cancel here -->
                        <div class="img-btn-bg">
                          <ButtonImg
                            alt-text="pending check button"
                            class="pending_table_check_btn"
                            @click="onApprovePending(problem)"
                          />
                        </div>
                        <div class="img-btn-bg">
                          <ButtonImg
                            alt-text="pending deny button"
                            class="pending_table_deny_btn"
                            @click="onDenyPending(problem)"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="filteredPending.length === 0" class="empty-state">
                  <p>No pending problems found</p>
                </div>
              </div>
            </template>
          </SplitMainWindow>
        </template>
      </Window>
    </section>

    <!-- Problem Create/Edit Modal (admin parity) -->
    <CreateQuestionModal
      modalId="facultyCreateQuestionModal"
      submitLabel="Create Question"
      :editingQuestion="editingQuestion"
      :sourceTable="editingQuestion?.sourceTable || 'create'"
      @create-question="handleCreateQuestion"
      @update-question="handleUpdateQuestion"
      @submit-draft="handleSubmitDraft"
      @move-to-draft="handleMoveToDraft"
      @move-to-pending="handleMoveToPending"
      @draft-saved="handleDraftSaved"
      @test-run-recorded="handleTestRunRecorded"
      @refresh-problems="$emit('refresh-problems')"
    />

    <section>
      <Window>
        <template #title><span>Search & Filter</span></template>
        <template #content>
          <SearchPanel :showProgress="false" @filters-updated="handleFiltersUpdated" />
        </template>
      </Window>
    </section>

    <!-- Problem View Modal (reusing admin ProblemViewModal) -->
    <ProblemViewModal
      modalId="facultyProblemViewModal"
      :problemData="viewProblemData"
      :testCases="viewTestCases"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { initPermissions, ensureCan } from '../../../js/permissions.js'
import { topicPermissionAllowed } from '../../../js/user-dashboard.js'
import { getSocket } from '../../../js/socket.js'
import { toastError, toastSuccess } from '../../Toast.vue'
import Window from '../../window.vue'
import SplitMainWindow from '../../split-main-window.vue'
import SearchPanel from '../../search-panel.vue'
import TextPill from '../../text-pill.vue'
import SearchBarAndSort from '../../search-bar-and-sort.vue'
import ButtonText from '../../button-text.vue'
import ButtonImg from '../../button-img.vue'
// Replace faculty problem form with admin's CreateQuestionModal for full parity
// Reuse admin problem create/edit modal to keep UI and behavior identical
// Note: `CreateQuestionModal` expects the admin-shaped payload; we map faculty fields
import CreateQuestionModal from '../create_question_modal.vue'
import ProblemViewModal from '../admin/admin_question_set/problem_view_modal.vue'

// Component props
const props = defineProps({
  problem_rows: { type: Array, default: () => [] },
  sessionToken: { type: String, default: '' },
  perms: { type: Object, default: () => ({}) }
})

// Shared socket used for draft transitions (admin/user question pipeline)
const socket = getSocket()


// Local state for viewing a problem
const viewProblem = ref(null)

// Map problem shape -> admin ProblemViewModal expected shape
const viewProblemData = computed(() => {
  const p = (typeof viewProblem !== 'undefined' ? viewProblem.value : {}) || {}
  return {
    ProblemID: p.problem_id ?? p.ProblemID ?? 0,
    ProblemName: p.problem_name ?? p.ProblemName ?? '',
    Difficulty: p.difficulty ?? p.Difficulty ?? 'Easy',
    TimeLimitSeconds: p.time_limit_seconds ?? p.TimeLimitSeconds ?? 1,
    MemoryLimitMB: p.memory_limit_mb ?? p.MemoryLimitMB ?? 64,
    Description: p.description ?? p.Description ?? '',
    SourceCode: p.sample_solution ?? p.SourceCode ?? ''
  }
})


const viewTestCases = computed(() => {
  const p = (typeof viewProblem !== 'undefined' ? viewProblem.value : {}) || {}
  const cases = p.test_cases || p.TestCases || []
  if (!Array.isArray(cases)) return []
  return cases.map((tc, idx) => ({
    TestCaseID: tc.TestCaseID ?? tc.test_case_id ?? idx + 1,
    TestCaseNumber: tc.TestCaseNumber ?? tc.test_case_number ?? idx + 1,
    InputData: tc.InputData ?? tc.input ?? '',
    ExpectedOutput: tc.ExpectedOutput ?? tc.expected ?? '',
    Score: tc.Score ?? tc.score ?? 0,
    IsSample: !!(tc.IsSample ?? tc.is_sample)
  }))
})

// No additional socket init required; we reuse the shared socket
onMounted(() => {})

// Load topic mapping so numeric topic IDs in pending rows can be displayed as names
const topicNameMap = ref({})
function loadTopicMap() {
  try {
    const s = socket
    if (!s || typeof s.emit !== 'function') return
    const token = typeof window !== 'undefined' ? window.localStorage?.getItem('token') : null
    if (!token) return

    s.emit('request_get_problem_topics', { token_session: token })
    // Use a dedicated handler; this socket instance is local to the faculty dashboard context
    s.on('response_get_problem_topics', (data) => {
      try {
        if (!data || !data.success || !Array.isArray(data.topics)) return
        const map = {}
        for (const t of data.topics) {
          if (t && typeof t.topic_id === 'number') {
            map[t.topic_id] = t.topic_name || String(t.topic_id)
          }
        }
        topicNameMap.value = map
      } catch (e) {
        // Fallback: keep existing map
        console.warn('Failed to build topicNameMap for faculty problems', e)
      }
    })
  } catch (e) {
    console.warn('loadTopicMap failed in faculty content_problems', e)
  }
}
onMounted(() => { loadTopicMap() })

// Listen for parent-driven open events so the parent can ask this child to open modals.
function _handleOpenViewProblem(e) {
  try {
    const payload = e && e.detail ? e.detail : null
    if (!payload) return
    viewProblem.value = payload
    openViewModal()
  } catch (err) { console.warn('openViewProblem handler failed', err) }
}

function _handleOpenEditProblem(e) {
  try {
    const payload = e && e.detail ? e.detail : null
    if (!payload) return
    // only allow editing if owner
    if (!payload.is_mine) { toastError('You can only edit your own problems'); return }
    editingProblem.value = payload
    editingQuestion.value = mapProblemToQuestion(payload)
    openCreateQuestionModal()
  } catch (err) { console.warn('openEditProblem handler failed', err) }
}

onMounted(() => {
  try {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('faculty.openViewProblem', _handleOpenViewProblem)
      window.addEventListener('faculty.openEditProblem', _handleOpenEditProblem)
    }
  } catch (e) {}
})

onBeforeUnmount(() => {
  try {
    if (typeof window !== 'undefined' && window.removeEventListener) {
      window.removeEventListener('faculty.openViewProblem', _handleOpenViewProblem)
      window.removeEventListener('faculty.openEditProblem', _handleOpenEditProblem)
    }
  } catch (e) {}
})

const emit = defineEmits(['view-problem', 'create-problem', 'edit-problem', 'update-problem', 'delete-problem', 'approve-question', 'deny-question', 'refresh-problems'])

const activeSection = ref('problem_all')
const problemSections = [
  { id: 'problem_all', name: 'Global Problem' },
  { id: 'problem_faculty', name: 'My Problem' },
  { id: 'problem_pending', name: 'Pending Problem' }
]

// Ownership and status helpers
const myProblems = computed(() => {
  return (props.problem_rows || []).filter(p => p.is_mine === 1 || p.is_mine === true)
})

const pendingProblems = computed(() => {
  const rows = props.problem_rows || []
  const byKey = new Map()

  for (const p of rows) {
    const isMine = p.is_mine === 1 || p.is_mine === true
    let include = false

    // Shared Level 1 pending items from other faculty. When both a
    // committed/approvals row and a faculty_pending_changes-backed row
    // exist for the same problem, we keep a single entry and prefer the
    // change-backed row.
    if (p.status === 'pending' && !isMine) include = true

    if (!include) continue

    // Use committed problem id when available to collapse duplicate
    // representations of the same logical problem.
    const baseId = p.problem_id ?? p.ProblemID ?? null
    const key = baseId != null ? `problem:${baseId}` : (p.change_id ? `change:${p.change_id}` : `row:${byKey.size}`)

    if (!byKey.has(key)) {
      byKey.set(key, p)
    } else {
      const existing = byKey.get(key)
      const existingIsChange = !!existing.change_id
      const currentIsChange = !!p.change_id
      // Prefer the faculty_pending_changes-backed row when both exist
      if (currentIsChange && !existingIsChange) {
        byKey.set(key, p)
      }
    }
  }

  return Array.from(byKey.values())
})

const searchText = ref('')
const filterDifficulty = ref('')
const filters = ref({ name: '', difficulty: '', selectedTopics: [] })

// Topic pill helpers
const TOPIC_COLORS = ['#0d6efd', '#20c997', '#6f42c1', '#fd7e14', '#e83e8c', '#198754', '#0dcaf0', '#dc3545', '#6c757d']
function getTopicsFromRow(row) {
  if (!row) return []
  // allow topics to come from row.topics or from proposed_data.topics
  const pd = (() => {
    try { return typeof row.proposed_data === 'string' ? JSON.parse(row.proposed_data) : (row.proposed_data || {}) } catch (e) { return {} }
  })()
  const topicsSource = row.topics || pd.topics || []
  // topics may be array of objects { TopicID, TopicName }, numeric ids, or strings
  return (topicsSource || []).map(t => {
    if (t && typeof t === 'object') return (t.TopicName || t.topic_name || '')
    const asNum = (typeof t === 'string' && /^\d+$/.test(t)) ? Number(t) : (typeof t === 'number' ? t : null)
    if (asNum && topicNameMap.value && topicNameMap.value[asNum]) return topicNameMap.value[asNum]
    return String(t || '')
  }).filter(Boolean)
}

// Display helpers that also look into proposed_data when top-level fields are missing
const displayTitle = (row) => {
  if (!row) return 'Untitled Problem'
  const pd = (() => { try { return typeof row.proposed_data === 'string' ? JSON.parse(row.proposed_data) : (row.proposed_data || {}) } catch (e) { return {} } })()
  return row.problem_name || row.title || pd.problem_name || pd.title || 'Untitled Problem'
}

const displayDiff = (row) => {
  const pd = (() => { try { return typeof row.proposed_data === 'string' ? JSON.parse(row.proposed_data) : (row.proposed_data || {}) } catch (e) { return {} } })()
  return row.difficulty || pd.difficulty || '—'
}

const displayCommitted = (row) => {
  const pd = (() => { try { return typeof row.proposed_data === 'string' ? JSON.parse(row.proposed_data) : (row.proposed_data || {}) } catch (e) { return {} } })()
  return row.admin_review_date || row.updated_at || pd.created_at || pd.updated_at
}

function getTopicColors(topics) {
  return (topics || []).map((_, i) => TOPIC_COLORS[i % TOPIC_COLORS.length])
}
const sortState = ref({ field: 'name', order: 'asc' })

// UI state
const VIEW_MODAL_ID = 'facultyProblemViewModal'
const loading = ref(false)
const modalLoading = ref(false)
const editingProblem = ref(null)
const editingQuestion = ref(null)

function getDeleteLabel(problem) {
  if (problem && problem.change_id) return 'Cancel Change'
  return 'Delete'
}

function applySort(arr){
  const term = (v) => (v||'').toString().toLowerCase()
  const getFieldVal = (p, field) => {
    if (field === 'name') return term(p.problem_name)
    if (field === 'difficulty') return term(p.difficulty)
    return ''
  }
  const sf = sortState.value.field
  const so = sortState.value.order
  return (arr||[]).slice().sort((a,b)=>{
    const av = getFieldVal(a,sf); const bv = getFieldVal(b,sf)
    if (av === bv) return 0; const cmp = av > bv ? 1 : -1; return so === 'asc' ? cmp : -cmp
  })
}
// Global = approved only
const filteredAll = computed(() => applySort(applyFilters((props.problem_rows || []).filter(p => p.status === 'approved'))))
// My = everything I created (approved/pending/denied)
const filteredFaculty = computed(() => applySort(applyFilters(myProblems.value || [])))
// Pending = my items that are not approved
const filteredPending = computed(() => applySort(applyFilters(pendingProblems.value || [])))



// Allow filtering by selected topic ids (from SearchPanel)
function problemHasTopicIds(problem, selectedIds) {
  if (!selectedIds || !selectedIds.length) return true
  const topics = Array.isArray(problem.topics) ? problem.topics : []
  const ids = topics.map(t => (t && typeof t === 'object') ? (t.TopicID || t.topic_id || null) : null).filter(Boolean)
  return selectedIds.some(id => ids.includes(id))
}

function applyFilters(arr){
  let out = arr
  const nameTerm = (filters.value.name || searchText.value || '').toLowerCase()
  const diffTerm = (filters.value.difficulty || filterDifficulty.value || '').toLowerCase()
  const selectedTopicIds = filters.value.selectedTopics || []
  if (nameTerm) out = out.filter(p => (p.problem_name||'').toLowerCase().includes(nameTerm))
  if (diffTerm) out = out.filter(p => (p.difficulty||'').toLowerCase() === diffTerm)
  if (selectedTopicIds.length) out = out.filter(p => problemHasTopicIds(p, selectedTopicIds))
  return out
}

function guard(actionAllowed, errMsg, cb){ if(!actionAllowed){ toastError(errMsg); return } cb() }

function openCreateQuestionModal() {
  if (typeof window !== 'undefined' && window.bootstrap) {
    const modalElement = document.getElementById('facultyCreateQuestionModal')
    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement)
      modal.show()
    }
  }
}

function openViewModal() {
  if (typeof window !== 'undefined' && window.bootstrap) {
    const modalElement = document.getElementById(VIEW_MODAL_ID)
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement)
      modal.show()
    }
  }
}

function closeCreateQuestionModal() {
  if (typeof window !== 'undefined' && window.bootstrap) {
    const modalElement = document.getElementById('facultyCreateQuestionModal')
    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement)
      if (modal) modal.hide()
    }
  }
  editingProblem.value = null
  editingQuestion.value = null
}

const onCreate = () => {
  guard(props.perms?.canManageProblems, 'You do not have permission to create problems', () => {
    editingProblem.value = null
    editingQuestion.value = null
    openCreateQuestionModal()
  })
}

const onView = (problem) => {
  const targetId = typeof problem === 'object' ? problem.problem_id : problem
  loading.value = true
  // Backend disabled: view using provided row only
  loading.value = false
  const fallback = typeof problem === 'object' ? problem : null
  const target = fallback
  if (!target) { toastError('Problem not found'); return }
  viewProblem.value = target
  openViewModal()
  emit('view-problem', target)
}

const onEdit = (id) => {
  guard(props.perms?.canManageProblems, 'You do not have permission to edit problems', () => {
    // Backend disabled: open editor with current selection only
    const dummy = (props.problem_rows || []).find(p => p.problem_id === id) || null
    if (!dummy) { toastError('Problem not found'); return }
    if (!dummy.is_mine) { toastError('You can only edit your own problems'); return }
    editingProblem.value = dummy
    editingQuestion.value = mapProblemToQuestion(dummy)
    openCreateQuestionModal()
  })
}

function onSubmitDraft(problem){
  guard(props.perms?.canManageProblems, 'You do not have permission to submit drafts', () => {
    const payload = mapProblemToQuestion(problem)
    handleSubmitDraft(payload)
  })
}

const onDelete = (objOrId) => {
  guard(props.perms?.canManageProblems, 'You do not have permission to delete problems', () => {
    const problem = (objOrId && typeof objOrId === 'object') ? objOrId : null
    const id = problem ? problem.problem_id : objOrId

    // If this is a pending faculty change (create/update/delete) with a change_id,
    // treat delete as "cancel my pending change" by asking the parent to reject it.
    if (problem && problem.change_id) {
      if (!confirm('Are you sure you want to cancel this pending change?')) return
      emit('delete-problem', { change_id: problem.change_id })
      return
    }

    if (!confirm('Are you sure you want to delete this problem?')) return
    // Delegate to parent/FacultyDashboard, which will call the backend
    emit('delete-problem', id)
  })
}

// Handlers for CreateQuestionModal emits
function handleCreateQuestion(payload) {
  // Forward admin-shaped payload to parent/FacultyDashboard
  emit('create-problem', payload)
}

function handleUpdateQuestion(payload) {
  // Forward admin-shaped payload to parent/FacultyDashboard
  emit('update-problem', payload)
}

// Draft transition handlers (faculty uses shared admin/user draft pipeline)
async function handleSubmitDraft(problemData){
  if (!problemData || !problemData.ProblemID) {
    toastError('Cannot submit draft: missing problem id')
    return
  }
  modalLoading.value = true
  try {
    await new Promise((resolve) => initPermissions(resolve))
    const topics = problemData?.Topics || []

    const [anyAllowed, ownAllowed] = await Promise.all([
      ensureCan('problem.edit.any'),
      ensureCan('problem.edit.own')
    ])
    const allowed = anyAllowed || ownAllowed || topicPermissionAllowed(topics, 'problem.edit')
    if (!allowed) {
      toastError('You are not authorized to submit this draft for approval.')
      return
    }

    const token = localStorage.getItem('jwt_token')
    if (!socket) {
      toastError('Socket not initialized')
      return
    }

    // First update the draft content
    socket.emit('request_update_question', { token_session: token, problemData })
    socket.off('response_update_question')
    socket.on('response_update_question', (res) => {
      if (!res || !res.success) {
        alert(res?.message || 'Failed to update draft')
        modalLoading.value = false
        return
      }

      // Then submit draft for approval
      socket.emit('request_submit_draft', { token_session: token, ProblemID: problemData.ProblemID })
      socket.off('response_submit_draft')
      socket.on('response_submit_draft', (subRes) => {
        modalLoading.value = false
        if (subRes && subRes.success) {
          alert(subRes.message || 'Draft submitted')
          emit('refresh-problems')
          const modalEl = document.getElementById('facultyCreateQuestionModal')
          if (modalEl && window.bootstrap?.Modal) {
            const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
            instance.hide()
          }
          editingQuestion.value = null
        } else {
          alert(subRes?.message || 'Failed to submit draft')
        }
      })
    })
  } catch (e) {
    console.error('permission pre-check failed', e)
    modalLoading.value = false
  }
}

function handleMoveToDraft(problemData){
  if (!problemData || !problemData.ProblemID) {
    toastError('Cannot move to draft: missing problem id')
    return
  }
  const token = localStorage.getItem('jwt_token')
  if (!socket) {
    toastError('Socket not initialized')
    return
  }
  modalLoading.value = true
  // Update content first
  socket.emit('request_update_question', { token_session: token, problemData })
  socket.off('response_update_question')
  socket.on('response_update_question', (res) => {
    if (!res || !res.success) {
      alert(res?.message || 'Failed to update before moving to draft')
      modalLoading.value = false
      return
    }
    // Move status to draft
    socket.emit('request_move_to_draft', { token_session: token, ProblemID: problemData.ProblemID })
    socket.off('response_move_to_draft')
    socket.on('response_move_to_draft', (subRes) => {
      modalLoading.value = false
      if (subRes && subRes.success) {
        alert(subRes.message || 'Moved to draft')
        emit('refresh-problems')
        const modalEl = document.getElementById('facultyCreateQuestionModal')
        if (modalEl && window.bootstrap?.Modal) {
          const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
          instance.hide()
        }
        editingQuestion.value = null
      } else {
        alert(subRes?.message || 'Failed to move to draft')
      }
    })
  })
}

function handleMoveToPending(problemData){
  if (!problemData || !problemData.ProblemID) {
    toastError('Cannot move to pending: missing problem id')
    return
  }
  const token = localStorage.getItem('jwt_token')
  if (!socket) {
    toastError('Socket not initialized')
    return
  }
  modalLoading.value = true
  // Update content first
  socket.emit('request_update_question', { token_session: token, problemData })
  socket.off('response_update_question')
  socket.on('response_update_question', (res) => {
    if (!res || !res.success) {
      alert(res?.message || 'Failed to update before moving to pending')
      modalLoading.value = false
      return
    }
    // Move status to pending
    socket.emit('request_move_to_pending', { token_session: token, ProblemID: problemData.ProblemID })
    socket.off('response_move_to_pending')
    socket.on('response_move_to_pending', (subRes) => {
      modalLoading.value = false
      if (subRes && subRes.success) {
        alert(subRes.message || 'Moved to pending')
        emit('refresh-problems')
        const modalEl = document.getElementById('facultyCreateQuestionModal')
        if (modalEl && window.bootstrap?.Modal) {
          const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
          instance.hide()
        }
        editingQuestion.value = null
      } else {
        alert(subRes?.message || 'Failed to move to pending')
      }
    })
  })
}

function handleDraftSaved(payload){
  // Faculty dashboard uses its own problem CRUD/approval pipeline.
  // Drafts saved via CreateQuestionModal are stored in the shared
  // admin/user draft system and are not part of the faculty problems
  // tables. Treat this as a local success notification only.
  try { toastSuccess('Draft saved') } catch (e) {}
  activeSection.value = 'problem_faculty'
}
function handleTestRunRecorded(payload){ /* no-op for now */ }
function onApprovePending(problem) {
  // Emit to parent so it can call faculty/admin approval handlers
  guard(props.perms?.canManageProblems, 'You do not have permission to approve problems', () => {
    emit('approve-question', { row: problem })
  })
}
function onDenyPending(problem) {
  // Emit to parent so it can call faculty/admin denial handlers
  guard(props.perms?.canManageProblems, 'You do not have permission to deny problems', () => {
    emit('deny-question', { row: problem })
  })
}

function mapProblemToQuestion(problem){
  const tcList = Array.isArray(problem?.test_cases) ? problem.test_cases : []
  return {
    ProblemID: problem.problem_id,
    ProblemName: problem.problem_name || '',
    Difficulty: problem.difficulty || 'Easy',
    TimeLimitSeconds: problem.time_limit_seconds ?? 1,
    MemoryLimitMB: problem.memory_limit_mb ?? 64,
    Description: problem.description || '',
    Topics: Array.isArray(problem.topics) ? problem.topics : [],
    TestCases: tcList.map((tc, idx) => ({
      InputData: tc.InputData || tc.input || tc.input_data || '',
      ExpectedOutput: tc.ExpectedOutput || tc.expected || tc.expected_output || '',
      IsSample: !!(tc.IsSample ?? tc.is_sample),
      Score: tc.Score ?? tc.score ?? 0,
      TestCaseNumber: tc.TestCaseNumber || tc.test_case_number || (idx + 1)
    })),
    SourceCode: problem.sample_solution || '',
    Status: problem.status || problem.Status || null
  }
}

function getDifficultyClass(difficulty) {
  const map = { 'Easy': 'bg-success', 'easy': 'bg-success', 'Medium': 'bg-warning', 'medium': 'bg-warning', 'Hard': 'bg-danger', 'hard': 'bg-danger' }
  return map[difficulty] || 'bg-secondary'
}
function getStatusClass(status) {
  const map = { 'Active': 'bg-success', 'active': 'bg-success', 'Inactive': 'bg-secondary', 'inactive': 'bg-secondary', 'Draft': 'bg-warning', 'draft': 'bg-warning', 'pending': 'bg-warning' }
  return map[status] || 'bg-secondary'
}

function onFiltersUpdated(filters){
  try{
    const text = (filters?.text||'').toLowerCase()
    searchText.value = text
    const diff = filters?.difficulty || ''
    filterDifficulty.value = diff
  }catch(e){ console.error('Problems onFiltersUpdated', e) }
}

// Handler for SearchPanel filters-updated (admin parity)
function handleFiltersUpdated(payload) {
  try {
    filters.value.name = payload?.search || ''
    filters.value.difficulty = payload?.difficulty || ''
    filters.value.selectedTopics = Array.isArray(payload?.selectedTopics) ? payload.selectedTopics : []
    // store sort if needed
    if (payload?.sortOrder) {
      sortState.value.field = sortState.value.field || 'name'
      sortState.value.order = payload.sortOrder
    }
  } catch (e) { console.error('handleFiltersUpdated failed', e) }
}
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
.content-problems { padding: 20px; }
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
.table { width: 100%; border-collapse: collapse; margin:0; }
.table thead { background: #f5f5f5; }
.table th { padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid #ddd; }
.table td { padding: 12px 15px; border-bottom: 1px solid #eee; }
.table tbody tr:hover { background: #f9f9f9; }
.actions { display: flex; gap: 8px; }
.btn-small { background: #667eea; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px; }
.btn-small:hover { background: #5568d3; }
.btn-small.btn-danger { background: #dc3545; }
.btn-small.btn-danger:hover { background: #c82333; }
.badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; color: white; }
.empty-state { padding: 40px; text-align: center; color: #999; }
.empty-state button { margin-top: 15px; }
.search-input, .search-select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; min-width: 200px; }
</style>
