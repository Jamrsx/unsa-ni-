<template>
  <!-- CREATE-PROBLEM-FLOW: modal UI for composing a new problem/question -->
  <Modal
    :modal_id="modalId"
    :modal_title="modalTitle"
    :close_btn_footer_bool="false"
    :requirePermission="requirePermission"
    :requireAnyPermissions="requireAnyPermissions"
  >
    <template #content>
      <div class="create-question-form">
        <div class="row g-3">
          <div class="col-12">
            <TextField
              label="Question Name"
              name="question_name"
              placeholder="e.g., Two Sum"
              v-model="form.ProblemName"
            />
            <div v-if="!nameValid && (touchedName || attemptedSubmit)" class="small text-danger mt-1">Question name must be at least 3 characters.</div>
          </div>

          <div class="col-6">
            <label class="form-label">Difficulty</label>
            <DropdownArray
              v-model="form.Difficulty"
              :options="difficulties"
            />
          </div>

          <div class="col-3">
            <label class="form-label" for="time_limit">Time Limit (s)</label>
            <input
              id="time_limit"
              type="number"
              min="1"
              class="form-control"
              v-model.number="form.TimeLimitSeconds"
            />
          </div>

          <div class="col-3">
            <label class="form-label" for="memory_limit">Memory (MB)</label>
            <input
              id="memory_limit"
              type="number"
              min="16"
              step="16"
              class="form-control"
              v-model.number="form.MemoryLimitMB"
            />
          </div>

          <div class="col-12">
            <label class="form-label">Description</label>
            <textarea
              id="description"
              rows="3"
              class="form-control"
              placeholder="Problem statement"
              v-model="form.Description"
            ></textarea>
            <div v-if="!descriptionValid && (touchedDescription || attemptedSubmit)" class="small text-danger mt-1">Description must be at least 20 characters.</div>
          </div>

          <div class="col-12">
            <label class="form-label">Topics (select applicable tags)</label>
            <div class="topics-grid">
              <div v-for="topic in availableTopics" :key="topic.topic_id" class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="`topic-${topic.topic_id}`"
                  :value="topic.topic_id"
                  v-model="selectedTopics"
                />
                <label class="form-check-label" :for="`topic-${topic.topic_id}`">
                  {{ topic.topic_name }}
                </label>
              </div>
              <div v-if="availableTopics.length === 0" class="text-muted small">
                No topics available
              </div>
            </div>
            <div v-if="availableTopics.length > 0 && !topicsValid && (touchedTopics || attemptedSubmit)" class="small text-danger mt-1">Select at least one topic.</div>
          </div>

          <div class="col-12">
            <label class="form-label">Solution Code (for testing)</label>
            <div class="row g-2">
              <div class="col-3">
                <DropdownArray
                  v-model="language"
                  :options="codeLanguages"
                />
              </div>
              <div class="col-9">
                <CodeEditor v-model="sourceCode" aria-label="Solution source code" />
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="form-label mb-0">Test Cases</label>
              <div class="btn-group" role="group">
                <button class="btn btn-sm btn-outline-primary" type="button" @click="addTestCase(true)" :disabled="!canAdd">Add Sample</button>
                <button class="btn btn-sm btn-outline-secondary" type="button" @click="addTestCase(false)" :disabled="!canAdd">Add Hidden</button>
              </div>
            </div>

            <div class="small text-muted mb-2">
              {{ form.TestCases.length }} test case(s). Require at least {{ MIN_SAMPLE_CASES }} sample and {{ MIN_HIDDEN_CASES }} hidden ({{ MIN_SAMPLE_CASES + MIN_HIDDEN_CASES }} total) up to {{ MAX_CASES }} total.
              <span v-if="!countValid">Please add at least {{ MIN_SAMPLE_CASES + MIN_HIDDEN_CASES }} test cases.</span>
              <span v-else-if="form.TestCases.length > MAX_CASES" class="text-danger">Maximum {{ MAX_CASES }} test cases allowed.</span>
            </div>
            <div class="small mb-2">
              <div v-if="(incompleteCases && (touchedTestCases || attemptedSubmit))" class="text-danger">Some test cases are missing input or expected output.</div>
              <div v-else-if="(!sampleValid && (touchedTestCases || attemptedSubmit))" class="text-danger">At least {{ MIN_SAMPLE_CASES }} sample test cases are required.</div>
              <div v-else-if="(!hiddenValid && (touchedTestCases || attemptedSubmit))" class="text-danger">At least {{ MIN_HIDDEN_CASES }} hidden test cases are required.</div>
              <div v-else-if="(!totalValid && (touchedTestCases || attemptedSubmit))" class="text-danger">Total test cases must be between {{ MIN_SAMPLE_CASES + MIN_HIDDEN_CASES }} and {{ MAX_CASES }}.</div>
              <div v-else-if="(!scoreValid && (touchedTestCases || attemptedSubmit))" class="text-danger">Total test case score must be greater than 0.</div>
              <div v-if="!testUpToDate" class="text-warning">Test inputs or source changed since last run — please re-run tests.</div>
            </div>

            <div v-for="(tc, index) in form.TestCases" :key="index" class="testcase-card">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <strong>#{{ index + 1 }} <span class="badge bg-light text-dark">{{ tc.IsSample ? 'Sample' : 'Hidden' }}</span></strong>
                <button
                  v-if="canRemoveIndex(index)"
                  class="btn btn-sm btn-outline-danger"
                  type="button"
                  @click="removeTestCase(index)"
                >
                  Remove
                </button>
              </div>
              <div class="mb-2">
                <label class="form-label" :for="`input-${index}`">Input</label>
                <textarea
                  class="form-control"
                  :id="`input-${index}`"
                  rows="2"
                  placeholder="Input payload"
                  v-model="tc.InputData"
                ></textarea>
              </div>
              <div class="mb-2">
                <label class="form-label" :for="`expected-${index}`">Expected Output</label>
                <textarea
                  class="form-control"
                  :id="`expected-${index}`"
                  rows="2"
                  placeholder="Expected output"
                  v-model="tc.ExpectedOutput"
                ></textarea>
              </div>
              <div class="row g-2">
                <div class="col-6">
                  <label class="form-label" :for="`score-${index}`">Score</label>
                  <input
                    class="form-control"
                    type="number"
                    min="0"
                    :id="`score-${index}`"
                    v-model.number="tc.Score"
                  />
                </div>
                <div class="col-6 d-flex align-items-end">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="`sample-${index}`"
                      v-model="tc.IsSample"
                    />
                    <label class="form-check-label" :for="`sample-${index}`">Sample case</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #modal_footer>
      <button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">Cancel</button>
      <button v-if="showDraftButton" class="btn btn-outline-info" type="button" :disabled="!canSaveDraft || isSaving" @click="handleDraftAction">
        {{ isSaving ? 'Saving...' : draftButtonLabel }}
      </button>
      <button class="btn btn-outline-primary" type="button" :disabled="!canTest || isTesting" @click="handleTest">
        {{ isTesting ? 'Testing...' : 'Test' }}
      </button>
      <button class="btn btn-primary" type="button" @click="handlePrimaryAction">
        {{ primaryButtonLabel }}
      </button>
    </template>
  </Modal>

  <!-- Test Results Modal -->
  <Modal
    :modal_id="testModalId"
    modal_title="Test Results"
    :close_btn_footer_bool="true"
  >
    <template #content>
      <div v-if="!testResults.success" class="text-danger">{{ testResults.message || 'No results' }}</div>
      <div v-else>
        <p><strong>Verdict:</strong> {{ testResults.verdict }}</p>
        <ul class="list-group">
          <li class="list-group-item" v-for="(r, idx) in testResults.results" :key="idx">
            <div><strong>#{{ idx + 1 }}</strong> - <span :class="r.passed ? 'text-success' : 'text-danger'">{{ r.passed ? 'Passed' : 'Failed' }}</span></div>
            <div class="small"><strong>Input:</strong> <pre class="mb-0">{{ r.input }}</pre></div>
            <div class="small"><strong>Expected:</strong> <pre class="mb-0">{{ r.expected }}</pre></div>
            <div class="small"><strong>Output:</strong> <pre class="mb-0">{{ r.output }}</pre></div>
            <div v-if="r.raw_run_error" class="small text-muted"><strong>Error:</strong> {{ r.raw_run_error }}</div>
          </li>
        </ul>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'
import { getSocket } from '../../js/socket.js'
import { can, initPermissions, getPermissions } from '../../js/permissions.js'
import { toastError } from '../Toast.vue'
import { normalizeTopic, topicPermissionAllowed } from '../../js/user-dashboard.js'
import { ensureCan } from '../../js/permissions.js'
import Modal from '../modal.vue'
import TextField from '../text-field.vue'
import DropdownArray from '../dropdown-array.vue'
import CodeEditor from '../codeeditor.vue'

// === CREATE-PROBLEM-FLOW: use shared socket instance
const socket = getSocket() || getSocket()

const emit = defineEmits([
  'create-question',
  'draft-saved',
  'update-question',
  'submit-draft',
  'test-run-recorded',
  'move-to-draft',
  'move-to-pending'
])

const props = defineProps({
  modalId: {
    type: String,
    required: true
  },
  submitLabel: {
    type: String,
    default: 'Create Question'
  },
  editingQuestion: {
    type: Object,
    default: null
  },
  sourceTable: {
    type: String,
    default: 'create' // 'create', 'admin', 'user', 'pending', 'myquestions'
  }
  ,
  // Permission guard for opening this modal (UI-level). Defaults to 'problem.create'.
  requirePermission: {
    type: String,
    default: 'problem.create'
  }
  ,
  // Allow callers to provide multiple alternative permissions; any one suffices
  requireAnyPermissions: {
    type: Array,
    default: () => []
  }
})

// Track if we're in edit mode
const isEditMode = computed(() => !!props.editingQuestion)
const isDraftEdit = computed(() => !!props.editingQuestion && props.editingQuestion.Status === 'draft')
const isAdminApprovedEdit = computed(() => props.sourceTable === 'admin' && props.editingQuestion?.Status === 'approved')
const isUserTableEdit = computed(() => props.sourceTable === 'user')
const modalTitle = computed(() => isDraftEdit.value ? 'Edit Draft Question' : (isEditMode.value ? 'Edit Question' : 'Create New Question'))
const draftButtonLabel = computed(() => isDraftEdit.value ? 'Update Draft' : 'Save Draft')
const showDraftButton = computed(() => {
  // Hide draft button for user table edits (admin shouldn't draft other users' work)
  if (isUserTableEdit.value) return false
  return true
})
const primaryButtonLabel = computed(() => {
  if (isDraftEdit.value) return 'Create Question'
  return isEditMode.value ? 'Update Question' : (props.submitLabel || 'Create Question')
})
const isValidForPrimary = computed(() => {
  // If editing a draft, relax some rules: require basic fields and a successful up-to-date test
  if (isDraftEdit.value) {
    const verdict = (testResults.verdict || '').toLowerCase()
    return nameValid.value && descriptionValid.value && topicsValid.value && testResults.success && verdict.includes('accept') && testUpToDate.value
  }
  // Same as isValid for non-draft primary actions
  return isValid.value
})

// === CREATE-PROBLEM-FLOW: local form state for problem payload ===
const difficulties = ['Easy', 'Medium', 'Hard']
const codeLanguages = ['python', 'php', 'java']
const language = ref('python')
const sourceCode = ref('')
const isTesting = ref(false)
const isSaving = ref(false)
const testResults = reactive({ success: false, verdict: '', passed: 0, total: 0, results: [], message: '' })
const lastTestSnapshot = ref('')
const testUpToDate = computed(() => {
  try {
    const snapshot = JSON.stringify({ cases: normalizeTestCases(), source: sourceCode.value })
    return snapshot === lastTestSnapshot.value
  } catch (e) {
    return false
  }
})
const testModalId = computed(() => `${props.modalId}-test`)
// touched state for UX: show validation messages after user interaction
const touchedName = ref(false)
const touchedDescription = ref(false)
const touchedTopics = ref(false)
const touchedSource = ref(false)
const touchedTestCases = ref(false)
const attemptedSubmit = ref(false)

const MIN_SAMPLE_CASES = 3
const MIN_HIDDEN_CASES = 10
const MAX_CASES = 15

const form = reactive({
  ProblemName: '',
  Difficulty: 'Easy',
  TimeLimitSeconds: 1,
  MemoryLimitMB: 64,
  Description: '',
  TestCases: [
    { InputData: '', ExpectedOutput: '', IsSample: true, Score: 0 },
    { InputData: '', ExpectedOutput: '', IsSample: false, Score: 0 },
    { InputData: '', ExpectedOutput: '', IsSample: false, Score: 0 },
    { InputData: '', ExpectedOutput: '', IsSample: false, Score: 0 }
  ]
})

// === CREATE-PROBLEM-FLOW: fetch available topics from database
const availableTopics = ref([])
const selectedTopics = ref([])

const nameValid = computed(() => form.ProblemName.trim().length >= 3)
const descriptionValid = computed(() => form.Description.trim().length >= 20)
const topicsValid = computed(() => selectedTopics.value && selectedTopics.value.length > 0)

const normalizedCases = computed(() => normalizeTestCases())
const sampleCount = computed(() => normalizedCases.value.filter(c => !!c.IsSample).length)
const hiddenCount = computed(() => normalizedCases.value.filter(c => !c.IsSample).length)
const casesTotal = computed(() => normalizedCases.value.length)

const sampleValid = computed(() => sampleCount.value >= MIN_SAMPLE_CASES)
const hiddenValid = computed(() => hiddenCount.value >= MIN_HIDDEN_CASES)
const totalValid = computed(() => casesTotal.value <= MAX_CASES && casesTotal.value >= (MIN_SAMPLE_CASES + MIN_HIDDEN_CASES))

const allCasesComplete = computed(() => normalizedCases.value.every(tc => tc.InputData.trim() && tc.ExpectedOutput.trim()))
const totalScore = computed(() => normalizedCases.value.reduce((s, c) => s + (Number.isFinite(c.Score) ? c.Score : 0), 0))
const scoreValid = computed(() => totalScore.value > 0)
const incompleteCases = computed(() => form.TestCases.some(tc => !tc.InputData.trim() || !tc.ExpectedOutput.trim()))

// isValid used to enable primary create/submit actions (not for draft)
const isValid = computed(() => {
  return nameValid.value && descriptionValid.value && topicsValid.value && allCasesComplete.value && sampleValid.value && hiddenValid.value && totalValid.value && scoreValid.value
})

const countValid = computed(() => form.TestCases.length >= (MIN_SAMPLE_CASES + MIN_HIDDEN_CASES))
const canAdd = computed(() => form.TestCases.length < MAX_CASES)
const canRemove = computed(() => form.TestCases.length > (MIN_SAMPLE_CASES + MIN_HIDDEN_CASES))
// Allow users to run tests early with at least one complete test case.
// Creation/submission still requires full validation elsewhere.
const canTest = computed(() => !!sourceCode.value.trim() && normalizedCases.value.length >= 1 && normalizedCases.value.length <= MAX_CASES)

// Draft can be saved with minimal requirements: just a name
const canSaveDraft = computed(() => !!form.ProblemName.trim())

function addTestCase(isSample) {
  if (!canAdd.value) return
  form.TestCases.push({ InputData: '', ExpectedOutput: '', IsSample: isSample, Score: 0 })
}

function removeTestCase(index) {
  // Allow users to remove any test case (even incomplete) for flexibility.
  if (index < 0 || index >= form.TestCases.length) return
  form.TestCases.splice(index, 1)
  // ensure at least one test-case object remains for UI
  if (form.TestCases.length === 0) form.TestCases.push({ InputData: '', ExpectedOutput: '', IsSample: true, Score: 0 })
  markTouchedTestCases()
  updateLastSnapshotIfNeeded()
}

function canRemoveIndex(index) {
  // Show remove button when there is more than one test case (allow user to manage list freely)
  return form.TestCases.length > 1
}

function markTouchedTestCases() {
  try {
    touchedTestCases.value = true
  } catch (e) {
    // noop
  }
}

function updateLastSnapshotIfNeeded() {
  try {
    // Invalidate last test snapshot when tests/source change
    lastTestSnapshot.value = ''
  } catch (e) {
    // noop
  }
}

// === CREATE-PROBLEM-FLOW: fetch topics from REST API on mount
async function fetchTopics() {
  try {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('jwt_token')
    const response = await axios.get('/api/problems/topics', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (response.data && response.data.success) {
      availableTopics.value = response.data.topics || []
    } else {
      console.error('Failed to fetch topics:', response.data?.message)
      availableTopics.value = []
    }
  } catch (err) {
    console.error('REST fetchTopics error:', err)
    availableTopics.value = []
  }
}

// Prefill form when entering edit mode
watch(() => props.editingQuestion, (newQuestion) => {
  if (newQuestion) {
    form.ProblemName = newQuestion.ProblemName || ''
    form.Difficulty = newQuestion.Difficulty || 'Easy'
    form.TimeLimitSeconds = newQuestion.TimeLimitSeconds || 1
    form.MemoryLimitMB = newQuestion.MemoryLimitMB || 64
    form.Description = newQuestion.Description || ''
    
    // Prefill topics - handle both Topic IDs and TopicID field
    if (newQuestion.Topics && Array.isArray(newQuestion.Topics)) {
      selectedTopics.value = newQuestion.Topics.map(t => t.TopicID || t)
    } else {
      selectedTopics.value = []
    }
    
    // Prefill test cases
    if (newQuestion.TestCases && newQuestion.TestCases.length > 0) {
      form.TestCases = newQuestion.TestCases.map(tc => ({
        InputData: tc.InputData || '',
        ExpectedOutput: tc.ExpectedOutput || '',
        IsSample: !!tc.IsSample,
        Score: tc.Score || 0,
        TestCaseID: tc.TestCaseID // Preserve ID for updates
      }))
    }
    // Prefill solution/source code if provided
    // Support multiple possible keys that could hold the saved sample solution
    sourceCode.value = newQuestion.SourceCode || newQuestion.sourceCode || newQuestion.sample_solution || newQuestion.sampleSolution || newQuestion.SampleSolution || ''
  } else {
    // Return to create mode: reset form to blank
    resetForm()
  }
}, { deep: true })

function normalizeTestCases() {
  return form.TestCases
    .filter(tc => tc.InputData.trim() && tc.ExpectedOutput.trim())
    .map((tc, idx) => ({
      InputData: tc.InputData,
      ExpectedOutput: tc.ExpectedOutput,
      IsSample: !!tc.IsSample,
      Score: Number.isFinite(tc.Score) ? tc.Score : 0,
      TestCaseNumber: idx + 1
    }))
}

function resetForm() {
  form.ProblemName = ''
  form.Difficulty = 'Easy'
  form.TimeLimitSeconds = 1
  form.MemoryLimitMB = 64
  form.Description = ''
  selectedTopics.value = []
  sourceCode.value = ''
  form.TestCases.splice(0, form.TestCases.length,
    { InputData: '', ExpectedOutput: '', IsSample: true, Score: 0 },
    { InputData: '', ExpectedOutput: '', IsSample: false, Score: 0 },
    { InputData: '', ExpectedOutput: '', IsSample: false, Score: 0 },
    { InputData: '', ExpectedOutput: '', IsSample: false, Score: 0 }
  )
  }
    lastTestSnapshot.value = ''
    attemptedSubmit.value = false
    touchedTestCases.value = false

function buildPayload(base = {}) {
  return Object.assign({}, base, {
    ProblemName: form.ProblemName.trim(),
    Difficulty: form.Difficulty,
    TimeLimitSeconds: Number(form.TimeLimitSeconds) || 1,
    MemoryLimitMB: Number(form.MemoryLimitMB) || 64,
    Description: form.Description.trim(),
    Topics: selectedTopics.value,
    TestCases: normalizeTestCases(),
    SourceCode: sourceCode.value || ''
  })
}

async function handleSubmit() {
  // mark that user attempted submit so inline validation messages show
  attemptedSubmit.value = true
  if (!ensureValidForSubmit()) return

  isSaving.value = true
  try {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('jwt_token')
    const payload = buildPayload()
    
    const endpoint = isEditMode.value ? `/api/problems/${props.editingQuestion.ProblemID}` : '/api/problems'
    const method = isEditMode.value ? 'PATCH' : 'POST'

    const response = await axios({
      method: method,
      url: endpoint,
      data: payload,
      headers: { Authorization: `Bearer ${token}` }
    })

    isSaving.value = false
    if (response.data && response.data.success) {
      alert(isEditMode.value ? 'Question updated successfully' : 'Question created successfully')
      emit('refresh-problems')
      resetForm()
      const modalEl = document.getElementById(props.modalId)
      if (modalEl && window.bootstrap?.Modal) {
        const instance = window.bootstrap.Modal.getInstance(modalEl)
        if (instance) instance.hide()
      }
    } else {
      alert('Failed: ' + (response.data.message || 'Unknown error'))
    }
  } catch (err) {
    isSaving.value = false
    console.error('REST handleSubmit error:', err)
    alert('Failed to submit question via REST API')
  }
}

async function handlePrimaryAction() {
  // Mark attempted submit to surface inline validation feedback
  attemptedSubmit.value = true
  // Block submit/create/update if validation fails
  if (!ensureValidForSubmit()) return

  // For modernization, all primary actions (Create/Update) go through handleSubmit which uses REST
  await handleSubmit()
}

function handleDraftAction() {
  const payload = buildPayload({ ProblemID: props.editingQuestion?.ProblemID })

  if (isDraftEdit.value) {
    // Update existing draft in place
    // Mark payload as draft so server-side validation is relaxed
    payload.isDraft = true
    
    emit('update-question', payload)
    return
  }

  if (isEditMode.value) {
    // Editing approved/pending/denied → move to draft (update + change status)
    emit('move-to-draft', payload)
    return
  }

  // Else (create flow) → create a brand new draft
  handleSaveDraft()
}

function ensureValidForSubmit() {
  // Primary create/update/submit actions must meet validation rules
  if (isDraftEdit.value) {
    // Relaxed checks for submitting a draft: basic fields + successful, up-to-date tests
    if (!nameValid.value || !descriptionValid.value || !topicsValid.value) {
      alert('Please complete required fields (name, description, topics) before submitting the draft.')
      return false
    }
    const verdict = (testResults.verdict || '').toLowerCase()
    if (!testResults.success || !verdict.includes('accept')) {
      alert('Please run tests and ensure the verdict is "Accepted" before submitting the draft.')
      return false
    }
    if (!testUpToDate.value) {
      alert('Test cases or solution changed since the last test run. Please re-run tests before submitting.')
      return false
    }
    return true
  }

  if (!isValid.value) {
    alert('Please complete required fields before submitting. Fix highlighted errors.')
    return false
  }

  // Require that the test run was executed and returned Accepted before allowing create/update/submit
  const verdict = (testResults.verdict || '').toLowerCase()
  if (!testResults.success || !verdict.includes('accept')) {
    alert('Please run tests and ensure the verdict is "Accepted" before submitting (except when saving as draft).')
    return false
  }

  // Require that test inputs/source haven't changed since last run
  if (!testUpToDate.value) {
    alert('Test cases or solution changed since the last test run. Please re-run tests before submitting.')
    return false
  }

  return true
}

function openTestModal() {
  const el = document.getElementById(testModalId.value)
  if (el && window.bootstrap?.Modal) {
    const instance = window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el)
    instance.show()
  }
}

// === SAVE DRAFT: Save incomplete question for later editing via REST ===
async function handleSaveDraft() {
  if (!canSaveDraft.value || isSaving.value) return
  
  isSaving.value = true
  try {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('jwt_token')
    const payload = buildPayload()
    payload.is_draft = true
    // override normalized TestCases with raw form test cases so drafts keep incomplete entries
    payload.test_cases = form.TestCases.map((tc, idx) => ({
      input_data: tc.InputData || '',
      expected_output: tc.ExpectedOutput || '',
      is_sample: !!tc.IsSample,
      score: Number.isFinite(tc.Score) ? tc.Score : 0
    }))

    const endpoint = isEditMode.value ? `/api/problems/${props.editingQuestion.ProblemID}` : '/api/problems'
    const method = isEditMode.value ? 'PATCH' : 'POST'
    
    const response = await axios({
      method: method,
      url: endpoint,
      data: payload,
      headers: { Authorization: `Bearer ${token}` }
    })

    isSaving.value = false
    if (response.data && response.data.success) {
      emit('draft-saved', { ...payload, ProblemID: response.data.problem_id })
      resetForm()
      const modalEl = document.getElementById(props.modalId)
      if (modalEl && window.bootstrap?.Modal) {
        const instance = window.bootstrap.Modal.getInstance(modalEl)
        if (instance) instance.hide()
      }
    } else {
      alert('Failed to save draft: ' + (response.data.message || 'Unknown error'))
    }
  } catch (err) {
    isSaving.value = false
    console.error('REST save draft error:', err)
    alert('Failed to save draft via REST API')
  }
}

async function handleTest() {
  if (!canTest.value || isTesting.value) return
  isTesting.value = true
  const cases = normalizeTestCases().map(tc => ({ input_data: tc.InputData, expected_output: tc.ExpectedOutput }))
  
  try {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('jwt_token')
    const response = await axios.post('/api/problems/test-source-code', {
      language: language.value,
      source_code: sourceCode.value,
      testCases: cases
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = response.data
    isTesting.value = false
    testResults.success = !!data.success
    testResults.verdict = data.verdict || ''
    testResults.passed = data.passed || 0
    testResults.total = data.total || cases.length
    testResults.results = data.results || []
    testResults.message = data.message || ''
    
    try {
      lastTestSnapshot.value = JSON.stringify({ cases: normalizeTestCases(), source: sourceCode.value })
    } catch (e) {
      lastTestSnapshot.value = ''
    }
    openTestModal()
  } catch (err) {
    isTesting.value = false
    console.error('REST handleTest error:', err)
  }
}

// === CREATE-PROBLEM-FLOW: fetch topics when modal component mounts
onMounted(() => {
  fetchTopics()
  // Listen for create/update responses so we can reset the form and close modal on success
  getSocket().off('response_create_problem')
  getSocket().on('response_create_problem', (data) => {
    if (data && data.success) {
      resetForm()
      const modalEl = document.getElementById(props.modalId)
      if (modalEl && window.bootstrap?.Modal) {
        const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
        instance.hide()
      }
      // If we ran tests before creating and have a snapshot, record the run against the newly created problem
      try {
        const createdProblemId = data.problem_id || data.problemId || null
        if (createdProblemId && testResults && (typeof testResults.passed === 'number')) {
          
          getSocket().emit('request_record_test_run', { token_session: localStorage.getItem('jwt_token'), ProblemID: createdProblemId, passed: testResults.passed, total: testResults.total, verdict: testResults.verdict, results: testResults.results })
        }
      } catch (e) {
        // ignore
      }
    }
  })

  getSocket().off('response_record_test_run')
  getSocket().on('response_record_test_run', (data) => {
    
    try {
      if (data && data.success) {
        const pid = data.problem_id || data.ProblemID || data.problemId || null
        if (pid) {
          // request fresh problem details and emit upward so parent lists can refresh
          getSocket().once('response_get_problem_details', (pd) => {
            if (pd && pd.success && pd.problem) {
              emit('test-run-recorded', { ProblemID: pd.problem.ProblemID, TestSummary: pd.TestSummary, LastRun: pd.LastRun })
            } else {
              emit('test-run-recorded', { ProblemID: pid })
            }
          })
          getSocket().emit('request_get_problem_details', { token_session: localStorage.getItem('jwt_token'), problem_id: pid })
        } else {
          emit('test-run-recorded', {})
        }
      }
    } catch (e) { /* ignore */ }
  })

  getSocket().off('response_update_question')
  getSocket().on('response_update_question', (data) => {
    if (data && data.success) {
      resetForm()
      const modalEl = document.getElementById(props.modalId)
      if (modalEl && window.bootstrap?.Modal) {
        const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
        instance.hide()
      }
    }
  })
})

onUnmounted(() => {
  try {
    const _s = getSocket(); if (_s && typeof _s.off === 'function') {
      getSocket().off('response_create_problem')
      getSocket().off('response_update_question')
    }
  } catch (e) {
    // ignore
  }
})

// Watch for edits to source or testcases to mark touched state and invalidate snapshots
watch(sourceCode, () => {
  touchedSource.value = true
  updateLastSnapshotIfNeeded()
})

watch(() => form.TestCases.map(tc => `${tc.InputData}||${tc.ExpectedOutput}||${tc.Score}||${tc.IsSample}`), () => {
  markTouchedTestCases()
  updateLastSnapshotIfNeeded()
})

// Debug: watch key validity flags so we can see why primary actions are disabled
import { watchEffect } from 'vue'
watchEffect(() => {
  // debug logging removed
})
</script>

<style scoped>
.create-question-form {
  max-height: 65vh;
  overflow-y: auto;
}

.testcase-card {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background: #fafafa;
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  padding: 8px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  background: #f9f9f9;
}
</style>
