<template>
  <Modals
    :modal_id="modalId"
    :modal_title="isEditMode ? 'Edit Problem' : 'Create New Problem'"
    :close_btn_header_bool="true"
  >
    <template #content>
      <form @submit.prevent="handleSubmit" class="problem-form">
        <div class="form-group">
          <label class="form-label">Problem Name <span class="text-danger">*</span></label>
          <input
            v-model="formData.problem_name"
            type="text"
            class="form-control"
            placeholder="Enter problem name"
            required
            maxlength="200"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Difficulty <span class="text-danger">*</span></label>
          <select v-model="formData.difficulty" class="form-control" required>
            <option value="">Select difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">Time Limit (seconds)</label>
              <input
                v-model.number="formData.time_limit_seconds"
                type="number"
                class="form-control"
                placeholder="e.g., 5"
                min="1"
                max="300"
              />
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">Memory Limit (MB)</label>
              <input
                v-model.number="formData.memory_limit_mb"
                type="number"
                class="form-control"
                placeholder="e.g., 256"
                min="1"
                max="2048"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Description <span class="text-danger">*</span></label>
          <textarea
            v-model="formData.description"
            class="form-control"
            rows="6"
            placeholder="Describe the problem, input format, output format, constraints, etc."
            required
            maxlength="5000"
          ></textarea>
          <small class="text-muted">{{ formData.description?.length || 0 }}/5000 characters</small>
        </div>

        <!-- Topics selection -->
        <div class="form-group">
          <label class="form-label">Topics (select applicable tags)</label>
          <div class="topics-grid">
            <div v-for="topic in availableTopics" :key="topic.topic_id || topic.id" class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                :id="`topic-${topic.topic_id || topic.id}`"
                :value="topic.topic_id || topic.id"
                v-model="selectedTopics"
              />
              <label class="form-check-label" :for="`topic-${topic.topic_id || topic.id}`">
                {{ topic.topic_name || topic.name }}
              </label>
            </div>
            <div v-if="availableTopics.length === 0" class="text-muted small">No topics available</div>
          </div>
        </div>

        <!-- Solution code + language -->
        <div class="form-group">
          <label class="form-label">Solution Code (for testing)</label>
          <div class="row">
            <div class="col-md-6">
              <select v-model="solutionLanguage" class="form-control">
                <option v-for="lang in codeLanguages" :key="lang" :value="lang">{{ lang }}</option>
              </select>
            </div>
            <div class="col-md-6">
              <textarea
                v-model="solutionCode"
                class="form-control code-textarea"
                rows="8"
                placeholder="Provide a reference solution for tests"
                maxlength="50000"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Test cases -->
        <div class="form-group">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label mb-0">Test Cases</label>
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-primary" @click="addTestCase(true)" :disabled="!canAdd">Add Sample</button>
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="addTestCase(false)" :disabled="!canAdd">Add Hidden</button>
            </div>
          </div>
          <div class="small text-muted mb-2">
            {{ testCases.length }} case(s). Require at least {{ MIN_SAMPLE_CASES }} sample and {{ MIN_HIDDEN_CASES }} hidden ({{ MIN_SAMPLE_CASES + MIN_HIDDEN_CASES }} total) up to {{ MAX_CASES }}.
          </div>
          <div class="small mb-2">
            <span v-if="!countValid" class="text-danger">Please add at least {{ MIN_SAMPLE_CASES + MIN_HIDDEN_CASES }} test cases.</span>
          </div>

          <div v-for="(tc, idx) in testCases" :key="idx" class="testcase-card">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <strong>#{{ idx + 1 }} <span class="badge bg-light text-dark">{{ tc.IsSample ? 'Sample' : 'Hidden' }}</span></strong>
              <button v-if="canRemoveIndex(idx)" type="button" class="btn btn-sm btn-outline-danger" @click="removeTestCase(idx)">Remove</button>
            </div>
            <div class="mb-2">
              <label class="form-label" :for="`input-${idx}`">Input</label>
              <textarea class="form-control" :id="`input-${idx}`" rows="2" placeholder="Input payload" v-model="tc.InputData"></textarea>
            </div>
            <div class="mb-2">
              <label class="form-label" :for="`expected-${idx}`">Expected Output</label>
              <textarea class="form-control" :id="`expected-${idx}`" rows="2" placeholder="Expected output" v-model="tc.ExpectedOutput"></textarea>
            </div>
            <div class="row">
              <div class="col-md-6">
                <label class="form-label" :for="`score-${idx}`">Score</label>
                <input class="form-control" type="number" min="0" :id="`score-${idx}`" v-model.number="tc.Score" />
              </div>
              <div class="col-md-6 d-flex align-items-end">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :id="`sample-${idx}`" v-model="tc.IsSample" />
                  <label class="form-check-label" :for="`sample-${idx}`">Sample case</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>
      </form>
    </template>

    <template #modal_footer>
      <button
        type="button"
        class="btn btn-secondary"
        data-bs-dismiss="modal"
        :disabled="loading"
      >
        Cancel
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click="handleSubmit"
        :disabled="loading || !isFormValid"
      >
        <span v-if="loading">
          <span class="spinner-border spinner-border-sm me-2"></span>
          {{ isEditMode ? 'Updating...' : 'Creating...' }}
        </span>
        <span v-else>
          {{ isEditMode ? 'Update Problem' : 'Create Problem' }}
        </span>
      </button>
    </template>
  </Modals>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Modals from '../../../modal.vue'
import { toastError } from '../../../Toast.vue'

const props = defineProps({
  modalId: {
    type: String,
    required: true
  },
  problem: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'close'])

const isEditMode = computed(() => !!props.problem)

const formData = ref({
  problem_name: '',
  difficulty: '',
  time_limit_seconds: 5,
  memory_limit_mb: 256,
  description: '',
  sample_solution: ''
})

// Additional fields (parity with admin create question)
const availableTopics = ref([]) // optional: can be provided via props or fetched later
const selectedTopics = ref([])
const codeLanguages = ['python', 'javascript', 'cpp', 'java']
const solutionLanguage = ref('python')
const solutionCode = ref('')

// Test cases
const MIN_SAMPLE_CASES = 3
const MIN_HIDDEN_CASES = 10
const MAX_CASES = 15
const testCases = ref([])

const errorMessage = ref('')

// Populate form when editing
watch(() => props.problem, (newProblem) => {
  if (newProblem) {
    formData.value = {
      problem_name: newProblem.problem_name || '',
      difficulty: newProblem.difficulty || '',
      time_limit_seconds: newProblem.time_limit_seconds || 5,
      memory_limit_mb: newProblem.memory_limit_mb || 256,
      description: newProblem.description || '',
      sample_solution: newProblem.sample_solution || ''
    }
    // hydrate additional fields if present
    selectedTopics.value = newProblem.topics || []
    solutionLanguage.value = newProblem.solution_language || 'python'
    solutionCode.value = newProblem.solution_code || ''
    testCases.value = Array.isArray(newProblem.test_cases) ? newProblem.test_cases.map(tc => ({
      InputData: tc.InputData || tc.input || '',
      ExpectedOutput: tc.ExpectedOutput || tc.expected || '',
      Score: tc.Score ?? 0,
      IsSample: !!(tc.IsSample ?? tc.is_sample)
    })) : []
  } else {
    resetForm()
  }
}, { immediate: true })

// isFormValid defined later alongside test case validation

function resetForm() {
  formData.value = {
    problem_name: '',
    difficulty: '',
    time_limit_seconds: 5,
    memory_limit_mb: 256,
    description: '',
    sample_solution: ''
  }
  selectedTopics.value = []
  solutionLanguage.value = 'python'
  solutionCode.value = ''
  testCases.value = []
  errorMessage.value = ''
}

// Test case helpers
const canAdd = computed(() => testCases.value.length < MAX_CASES)
function addTestCase(isSample){ if(!canAdd.value) return; testCases.value.push({ InputData:'', ExpectedOutput:'', Score:0, IsSample: !!isSample }) }
function removeTestCase(idx){ testCases.value.splice(idx,1) }
function canRemoveIndex(idx){ return testCases.value.length > (MIN_SAMPLE_CASES + MIN_HIDDEN_CASES) }

// Validation for counts (simplified)
const countValid = computed(() => testCases.value.length >= (MIN_SAMPLE_CASES + MIN_HIDDEN_CASES))
const isFormValid = computed(() => {
  return formData.value.problem_name?.trim() &&
         formData.value.difficulty &&
         formData.value.description?.trim() &&
         countValid.value
})

function handleSubmit() {
  if (!isFormValid.value) {
    errorMessage.value = 'Please fill in all required fields'
    return
  }

  // Basic validation
  if (formData.value.time_limit_seconds < 1 || formData.value.time_limit_seconds > 300) {
    errorMessage.value = 'Time limit must be between 1 and 300 seconds'
    return
  }

  if (formData.value.memory_limit_mb < 1 || formData.value.memory_limit_mb > 2048) {
    errorMessage.value = 'Memory limit must be between 1 and 2048 MB'
    return
  }

  errorMessage.value = ''
  
  const payload = {
    ...formData.value,
    problem_id: props.problem?.problem_id,
    topics: selectedTopics.value,
    solution_language: solutionLanguage.value,
    solution_code: solutionCode.value,
    test_cases: testCases.value
  }

  emit('submit', payload)
}

// Expose reset for parent component
defineExpose({ resetForm })
</script>

<style scoped>
.problem-form {
  padding: 0;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
  font-size: 14px;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.code-textarea {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
}

.text-danger {
  color: #dc3545;
}

.text-muted {
  color: #6c757d;
  font-size: 12px;
}

.alert {
  padding: 0.75rem 1rem;
  margin-top: 1rem;
  margin-bottom: 0;
  border-radius: 4px;
}

.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
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

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

.row {
  display: flex;
  margin-left: -0.5rem;
  margin-right: -0.5rem;
}

.col-md-6 {
  flex: 0 0 50%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

@media (max-width: 768px) {
  .col-md-6 {
    flex: 0 0 100%;
  }
}
</style>
