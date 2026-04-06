<template>
  <!-- 
    USER MY QUESTIONS VIEW
    Displays all questions created by the current user, grouped by approval status
    - Approved: Questions approved by admin and visible to all users
    - Pending: Questions submitted for review, awaiting admin approval
    - Denied: Questions rejected by admin with optional reason
    - Draft: Incomplete questions saved for later completion
  -->
  <SplitContentView>
    <template #title><span>My Questions</span></template>
    <template #content>
      <section class="myq-layout d-flex flex-row row g-3">
        <div class="col-lg-8 col-12">
          <Window
            :showLabel="false"
          >
            <template #title><span>My Questions</span></template>
            <template #content>
              <div class="my-questions-container">
                <!-- Approved Questions -->
                <div class="status-section mb-4">
                  <h5 class="text-success">Approved ({{ approvedQuestions.length }})</h5>
                  <template v-if="approvedQuestions.length > 0">
                    <UserQuestionTable
                      :question_rows="approvedQuestions"
                      :actionsDisabled="isFetchingDetails"
                      @view-problem="handleViewProblem"
                      @edit-question="handleEditQuestion"
                      @delete-question="handleDeleteQuestion"
                    />
                  </template>
                  <template v-else>
                    <div class="no-questions-msg">No approved questions</div>
                  </template>
                </div>

                <!-- Pending Questions -->
                <div class="status-section mb-4">
                  <h5 class="text-warning">Pending Review ({{ pendingQuestions.length }})</h5>
                  <template v-if="pendingQuestions.length > 0">
                    <UserQuestionTable
                      :question_rows="pendingQuestions"
                      :actionsDisabled="isFetchingDetails"
                      @view-problem="handleViewProblem"
                      @edit-question="handleEditQuestion"
                      @delete-question="handleDeleteQuestion"
                    />
                  </template>
                  <template v-else>
                    <div class="no-questions-msg">No pending questions</div>
                  </template>
                </div>

                <!-- Denied Questions -->
                <div class="status-section mb-4">
                  <h5 class="text-danger">Denied ({{ deniedQuestions.length }})</h5>
                  <template v-if="deniedQuestions.length > 0">
                    <UserQuestionTable
                      :question_rows="deniedQuestions"
                      :actionsDisabled="isFetchingDetails"
                      @view-problem="handleViewProblem"
                      @edit-question="handleEditQuestion"
                      @delete-question="handleDeleteQuestion"
                    />
                  </template>
                  <template v-else>
                    <div class="no-questions-msg">No denied questions</div>
                  </template>
                </div>

                <!-- Draft Questions -->
                <div class="status-section mb-4">
                  <h5 class="text-secondary">Drafts ({{ draftQuestions.length }})</h5>
                  <template v-if="draftQuestions.length > 0">
                    <UserQuestionTable
                      :question_rows="draftQuestions"
                      :actionsDisabled="isFetchingDetails"
                      @view-problem="handleViewProblem"
                      @edit-question="handleEditQuestion"
                      @delete-question="handleDeleteQuestion"
                    />
                  </template>
                  <template v-else>
                    <div class="no-questions-msg">No draft questions</div>
                  </template>
                </div>
              </div>
            </template>
          </Window>
        </div>

        <div class="col-lg-4 col-12">
          <Window>
            <template #title><span>Search & Filter</span></template>
            <template #content>
              <SearchPanel :showProgress="false" @filters-updated="handleFiltersUpdated" />
            </template>
          </Window>
          <Window>
            <template #title><span>Your Set Questions</span></template>
            <template #content>
              <ModalButton
                modal_btn_id="adminCreateQuestionModal"
                modal_btn_title="Create New Question +"
                :auto="false"
                @click="handleCreateNewQuestion"
                class="w-100"
              />
            </template>
          </Window>
        </div>
      </section>
    </template>
  </SplitContentView>

  <!-- View Modal -->
  <ProblemViewModal
    modalId="viewProblemModal"
    :problemData="currentProblem"
    :testCases="currentTestCases"
  />

  <!-- Edit/Create Modal reused for updates and creating -->
        <CreateQuestionModal
    modalId="adminCreateQuestionModal"
      :submitLabel="editingQuestion ? 'Update Question' : 'Create Question'"
    :editingQuestion="editingQuestion"
    sourceTable="myquestions"
    @create-question="handleCreateQuestion"
      @update-question="handleUpdateQuestion"
      @submit-draft="handleSubmitDraft"
      @move-to-draft="handleMoveToDraft"
      @move-to-pending="handleMoveToPending"
      @draft-saved="onDraftSaved"
      @refresh-problems="loadMyQuestions"
  />
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { can, initPermissions, getPermissions, ensureCan } from '../../../js/permissions.js'
import { toastError } from '../../Toast.vue'
import { normalizeTopic, topicPermissionAllowed, ensureProblemEditAllowed } from '../../../js/user-dashboard.js'
import { getSocket } from '../../../js/socket.js'
import SplitContentView from '../../split-content-view.vue'
import UserQuestionTable from '../admin/admin_question_set/user_question_table.vue'
import CreateQuestionModal from '../../dashboard/create_question_modal.vue'
import ProblemViewModal from '../admin/admin_question_set/problem_view_modal.vue'
import SearchPanel from '../../search-panel.vue'
import ModalButton from '../../modal-button.vue'
import Window from '../../window.vue'

// === Socket connection for real-time data ===
const socket = getSocket() || getSocket()

// === Reactive data: All questions from current user ===
// Questions are fetched from backend and contain: ID, Name, Difficulty, CreatedAt, Status, Reason
const allQuestions = ref([])

// View/Edit state
const currentProblem = ref({})
const currentTestCases = ref([])
const isProblemLoading = ref(false)
const editingQuestion = ref(null)
const isFetchingDetails = ref(false)

// Filtered data for each status section
const filteredApproved = ref([])
const filteredPending = ref([])
const filteredDenied = ref([])
const filteredDrafts = ref([])

// === Computed filters: Separate questions by approval status ===
// Each computed property returns a filtered array for its respective status
// Used to populate the 4 separate table sections
const approvedQuestions = computed(() => filteredApproved.value)
const pendingQuestions = computed(() => filteredPending.value)
const deniedQuestions = computed(() => filteredDenied.value)
const draftQuestions = computed(() => filteredDrafts.value)

// === Load user's questions on mount ===
// Requests all questions created by current user from backend via socket
onMounted(() => {
  loadMyQuestions()
  // Clear edit state when modal closes
  const modalEl = document.getElementById('adminCreateQuestionModal')
  if (modalEl) {
    modalEl.addEventListener('hidden.bs.modal', () => {
      editingQuestion.value = null
    })
  }

  // Re-fetch when socket connects (ensure initial load after auth)
  try {
    const socket = getSocket(); if (socket && socket.on) {
      getSocket().on('connect', loadMyQuestions)
    }
  } catch (e) { /* ignore */ }

  // Parent handles `@draft-saved` emit from CreateQuestionModal; no global listener here.
})

onBeforeUnmount(() => {
  try {
    if (socket && socket.off) getSocket().off('connect', loadMyQuestions)
  } catch (e) {}
  // no global listener to remove
})

// Handle filter updates from SearchPanel
function handleFiltersUpdated(filters) {
  const token = localStorage.getItem('jwt_token')

  // Map logical UI statuses to DB status values where they differ
  const statusMap = { approved: 'approved', pending: 'pending', denied: 'denied', draft: 'draft' }

  const statuses = [
    { status: 'approved', target: filteredApproved },
    { status: 'pending', target: filteredPending },
    { status: 'denied', target: filteredDenied },
    { status: 'draft', target: filteredDrafts }
  ]

  statuses.forEach(({ status, target }) => {
    const dbStatus = statusMap[status] || status
    getSocket().emit('request_filter_my_questions', {
      token_session: token,
      status: dbStatus,
      search: filters.search,
      sortOrder: filters.sortOrder,
      difficulty: filters.difficulty,
      topicIds: filters.selectedTopics
    })

    // Use string concatenation to avoid template/backtick edge-cases
    const offEvent = 'response_filter_my_questions_' + status
    const onEvent = 'response_filter_my_questions_' + status
    getSocket().off(offEvent)
    getSocket().on(onEvent, (data) => {
      if (data && data.success) {
        target.value = data.questions || []
      }
    })
  })
}

// === Fetch user's created questions from server (all statuses) ===
// Emits socket event to backend, backend responds with array of questions
// Each question includes: QuestionID, QuestionName, QuestionDifficulty, CreatedAt, Status, Reason
function loadMyQuestions() {
  // Request all questions created by current user and populate section lists
  try {
    const token = localStorage.getItem('jwt_token')
    getSocket().emit('request_get_my_questions', { token_session: token })

    getSocket().off('response_get_my_questions')
    getSocket().once('response_get_my_questions', (res) => {
      if (!res || !res.success) {
        console.warn('loadMyQuestions: failed to fetch my questions', res?.message)
        // clear lists to avoid stale data
        filteredApproved.value = []
        filteredPending.value = []
        filteredDenied.value = []
        filteredDrafts.value = []
        return
      }

      const questions = Array.isArray(res.questions) ? res.questions : []

      // Partition by status (server uses 'approved','pending','denied','draft')
      filteredApproved.value = questions.filter(q => (q.Status || '').toString().toLowerCase() === 'approved')
      filteredPending.value = questions.filter(q => (q.Status || '').toString().toLowerCase() === 'pending')
      filteredDenied.value = questions.filter(q => (q.Status || '').toString().toLowerCase() === 'denied')
      filteredDrafts.value = questions.filter(q => (q.Status || '').toString().toLowerCase() === 'draft')
    })
  } catch (e) {
    console.error('loadMyQuestions error', e)
  }
}

// === Format date helper ===
// Converts ISO timestamp to readable format: "MM/DD/YYYY HH:MM AM/PM"
function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// View modal handler
function handleViewProblem(problemId) {
  if (!problemId || isFetchingDetails.value) return
  isProblemLoading.value = true
  isFetchingDetails.value = true
  currentProblem.value = { ProblemID: problemId, ProblemName: 'Loading...' }
  currentTestCases.value = []

  const token = localStorage.getItem('jwt_token')
  getSocket().emit('request_get_problem_details', { token_session: token, problem_id: problemId })

  getSocket().once('response_get_problem_details', (res) => {
    if (!res || !res.success) {
      isProblemLoading.value = false
      isFetchingDetails.value = false
      return
    }
    currentProblem.value = { ...res.problem, Topics: res.topics || [], TestSummary: res.TestSummary || null, LastRun: res.LastRun || null }
    currentTestCases.value = res.testCases || []
    isProblemLoading.value = false
    isFetchingDetails.value = false
    
    // Open the view modal after data is loaded
    const modalEl = document.getElementById('viewProblemModal')
    if (modalEl && window.bootstrap?.Modal) {
      const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
      instance.show()
    }
  })
}

// Edit modal handler (async refactor below)
async function handleEditQuestion(questionData) {
  const problemId = questionData?.QuestionID
  if (!problemId || isFetchingDetails.value) return
  isFetchingDetails.value = true

  try {
    // initPermissions uses a callback; wrap it so we can await it
    await new Promise((resolve) => initPermissions(resolve))

    const topics = questionData?.Topics || []
    const anyAllowed = await ensureCan('problem.edit.any')
    const allowed = anyAllowed || topicPermissionAllowed(topics, 'problem.edit')
    if (!allowed) {
      try { toastError('You are not authorized to edit this problem.') } catch (e) {}
      isFetchingDetails.value = false
      return
    }

    // allowed: fetch details and open modal as before
    const token = localStorage.getItem('jwt_token')
    getSocket().emit('request_get_problem_details', { token_session: token, problem_id: problemId })

    getSocket().once('response_get_problem_details', (res) => {
      if (!res || !res.success) {
        isFetchingDetails.value = false
        return
      }

      // Set editing payload expected by CreateQuestionModal
      const serverStatus = (res.status || res.problem?.status || questionData?.Status || '')
      const serverReason = (res.reason || questionData?.Reason || '')
      let normStatus = (serverStatus || '').toString().trim()
      if (!normStatus && (serverReason || '').toString().toLowerCase().includes('draft')) normStatus = 'draft'

      editingQuestion.value = {
        ProblemID: res.problem.ProblemID,
        ProblemName: res.problem.ProblemName,
        Difficulty: res.problem.Difficulty,
        TimeLimitSeconds: res.problem.TimeLimitSeconds,
        MemoryLimitMB: res.problem.MemoryLimitMB,
        Description: res.problem.Description,
        SourceCode: res.problem.SourceCode || res.problem.sourceCode || '',
        Topics: (res.topics || []).map(t => ({ TopicID: t.TopicID, TopicName: t.TopicName })),
        TestCases: res.testCases || [],
        TestSummary: res.TestSummary || null,
        LastRun: res.LastRun || null,
        Status: normStatus || null
      }

      // Open the edit modal after data is loaded
      const modalEl = document.getElementById('adminCreateQuestionModal')
      if (modalEl && window.bootstrap?.Modal) {
        const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
        instance.show()
      }
      isFetchingDetails.value = false
    })
  } catch (e) {
    console.error('permission pre-check failed', e)
    isFetchingDetails.value = false
  }
}

// Handler for Create New Question button
function handleCreateNewQuestion() {
  editingQuestion.value = null
  // Programmatically open the create question modal (button uses :auto="false")
  try {
    const modalEl = document.getElementById('adminCreateQuestionModal')
    if (modalEl && window.bootstrap?.Modal) {
      const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
      instance.show()
    }
  } catch (e) { console.error('Failed to open create question modal', e) }
}

function handleUpdateQuestion(payload) {
  try {
    initPermissions(() => {
      const topics = payload?.Topics || []

      // Use server-backed checks so explicit user denies are respected
      Promise.resolve().then(async () => {
        const [anyAllowed, ownAllowed] = await Promise.all([ensureCan('problem.edit.any'), ensureCan('problem.edit.own')])
        const allowed = anyAllowed || ownAllowed || topicPermissionAllowed(topics, 'problem.edit')
        if (!allowed) {
          try { toastError('You are not authorized to update this problem.') } catch (e) {}
          return
        }

        const token = localStorage.getItem('jwt_token')
        getSocket().emit('request_update_question', { token_session: token, problemData: payload })
        getSocket().off('response_update_question')
        getSocket().on('response_update_question', (res) => {
          if (res && res.success) {
            alert('Question updated successfully')
            loadMyQuestions()
            const modalEl = document.getElementById('adminCreateQuestionModal')
            if (modalEl && window.bootstrap?.Modal) {
              const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
              instance.hide()
            }
            editingQuestion.value = null
          } else {
            alert(res?.message || 'Failed to update question')
          }
        })
      })
    })
  } catch (e) {
    console.error('permission pre-check failed', e)
  }
}

function handleDeleteQuestion(problemId) {
  if (!problemId) return
  if (!confirm('Delete this question? This cannot be undone.')) return
  const token = localStorage.getItem('jwt_token')
  // send as question_id for backend compatibility
  getSocket().emit('request_delete_question', { token_session: token, question_id: problemId })
  getSocket().off('response_delete_question')
  getSocket().on('response_delete_question', (res) => {
    if (res && res.success) {
      alert('Question deleted')
      loadMyQuestions()
    } else {
      alert(res?.message || 'Failed to delete question')
    }
  })
}

// Submit draft flow: update current draft then submit for approval
async function handleSubmitDraft(problemData) {
  try {
    await new Promise((resolve) => initPermissions(resolve))
    const topics = problemData?.Topics || []

    const [anyAllowed, ownAllowed] = await Promise.all([
      ensureCan('problem.edit.any'),
      ensureCan('problem.edit.own')
    ])
    const allowed = anyAllowed || ownAllowed || topicPermissionAllowed(topics, 'problem.edit')
    if (!allowed) {
      try { toastError('You are not authorized to submit this draft for approval.') } catch (e) {}
      return
    }

    const token = localStorage.getItem('jwt_token')
    // First update the draft content
    getSocket().emit('request_update_question', { token_session: token, problemData })
    getSocket().off('response_update_question')
    getSocket().on('response_update_question', (res) => {
      if (!res || !res.success) {
        alert(res?.message || 'Failed to update draft')
        return
      }

      // Then submit draft for approval
      getSocket().emit('request_submit_draft', { token_session: token, ProblemID: problemData.ProblemID })
      getSocket().off('response_submit_draft')
      getSocket().on('response_submit_draft', (subRes) => {
        if (subRes && subRes.success) {
          alert(subRes.message || 'Draft submitted')
          loadMyQuestions()
          const modalEl = document.getElementById('adminCreateQuestionModal')
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
  }
}

// Move to draft flow: update current content then set status to draft
function handleMoveToDraft(problemData) {
  const token = localStorage.getItem('jwt_token')
  // Update content first
  getSocket().emit('request_update_question', { token_session: token, problemData })
  getSocket().off('response_update_question')
  getSocket().on('response_update_question', (res) => {
    if (!res || !res.success) {
      alert(res?.message || 'Failed to update before moving to draft')
      return
    }
    // Move status to draft
    getSocket().emit('request_move_to_draft', { token_session: token, ProblemID: problemData.ProblemID })
    getSocket().off('response_move_to_draft')
    getSocket().on('response_move_to_draft', (subRes) => {
      if (subRes && subRes.success) {
        alert(subRes.message || 'Moved to draft')
        loadMyQuestions()
        const modalEl = document.getElementById('adminCreateQuestionModal')
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

// Move to pending: update current content then set status to pending
function handleMoveToPending(problemData) {
  const token = localStorage.getItem('jwt_token')
  // Update content first
  getSocket().emit('request_update_question', { token_session: token, problemData })
  getSocket().off('response_update_question')
  getSocket().on('response_update_question', (res) => {
    if (!res || !res.success) {
      alert(res?.message || 'Failed to update before moving to pending')
      return
    }
    // Move status to pending
    getSocket().emit('request_move_to_pending', { token_session: token, ProblemID: problemData.ProblemID })
    getSocket().off('response_move_to_pending')
    getSocket().on('response_move_to_pending', (subRes) => {
      if (subRes && subRes.success) {
        alert(subRes.message || 'Moved to pending')
        loadMyQuestions()
        const modalEl = document.getElementById('adminCreateQuestionModal')
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

function handleCreateQuestion(payload) {
  const token = localStorage.getItem('jwt_token')
  getSocket().emit('request_create_problem', { token_session: token, problemData: payload })
  getSocket().off('response_create_problem')
  getSocket().on('response_create_problem', (res) => {
    if (res && res.success) {
      const status = res.status || 'pending'
      const message = status === 'approved'
        ? 'Question created and approved'
        : 'Question submitted for approval'
      alert(message)
      loadMyQuestions()
      const modalEl = document.getElementById('adminCreateQuestionModal')
      if (modalEl && window.bootstrap?.Modal) {
        const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
        instance.hide()
      }
    } else {
      alert(res?.message || 'Failed to create question')
    }
  })
}

// Draft saved handler (modal emit)
function onDraftSaved(savedPayload) {
  alert('Draft saved successfully')
  loadMyQuestions()
}

</script>
