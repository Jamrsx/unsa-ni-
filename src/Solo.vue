<!-- src/App.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import Window from './components/window.vue'
import TableList from './components/table-list.vue'
import ScrollVerticalCarousel from './components/scroll-vertical-carousel.vue'
import ButtonText from './components/button-text.vue'
import SearchPanel from './components/search-panel.vue'
import ModalButton from './components/modal-button.vue'
import Modal from './components/modal.vue'
import CreateQuestionModal from './components/dashboard/create_question_modal.vue'
import TextPill from './components/text-pill.vue'

import { get_solo_questions, filter_solo_questions, get_solo_problem_details, create_solo_problem } from './js/solo.js'
import { can, initPermissions } from './js/permissions.js'
import { ensureProblemCreateAllowed } from './js/solo-dashboard.js'

const solo_question_rows = ref([])
const currentProblem = ref({
  ProblemID: 0,
  ProblemName: '',
  Difficulty: 'Easy',
  TimeLimitSeconds: 0,
  MemoryLimitMB: 0,
  Description: '',
})
const currentTestCases = ref([])
const isProblemLoading = ref(false)
const createModalId = 'soloCreateQuestionModal'

const currentProblemLink = computed(() =>
  currentProblem.value?.ProblemID ? `/problem/${currentProblem.value.ProblemID}` : '#'
)

// Topic pill helpers
const TOPIC_COLORS = ['#0d6efd', '#20c997', '#6f42c1', '#fd7e14', '#e83e8c', '#198754', '#0dcaf0', '#dc3545', '#6c757d']
function getTopicsFromRow(row) {
  if (!row || !row.TopicsText) return []
  return row.TopicsText.split(',').map(t => t.trim()).filter(Boolean)
}
function getTopicColors(topics) {
  return (topics || []).map((_, i) => TOPIC_COLORS[i % TOPIC_COLORS.length])
}
function getCurrentProblemTopicNames() {
  return (currentProblem.value?.Topics || []).map(t => t.TopicName)
}

function loadQuestions() {
  get_solo_questions((data) => {
    if (!data || !data.success) {
      solo_question_rows.value = []
      return
    }
    solo_question_rows.value = data.questions || []
  })
}

function handleFiltersUpdated(filters) {
  filter_solo_questions(filters, (data) => {
    if (!data || !data.success) {
      solo_question_rows.value = []
      return
    }
    solo_question_rows.value = data.questions || []
  })
}

function handlePlay(problemId) {
  if (!problemId) return
  isProblemLoading.value = true
  currentProblem.value = {
    ProblemID: problemId,
    ProblemName: 'Loading... ',
    Difficulty: 'Easy',
    TimeLimitSeconds: 0,
    MemoryLimitMB: 0,
    Description: '',
  }
  currentTestCases.value = []

  get_solo_problem_details(problemId, (data) => {
    if (!data || !data.success) {
      isProblemLoading.value = false
      return
    }
    currentProblem.value = { ...data.problem, Topics: data.topics || [] }
    currentTestCases.value = data.testCases || []
    isProblemLoading.value = false
  })
}

// === CREATE-PROBLEM-FLOW: user submits a new problem for approval
function handleCreateSoloQuestion(problemPayload) {
  try {
    initPermissions(() => {
      // ensureProblemCreateAllowed is async (server-backed) so await its result
      ensureProblemCreateAllowed().then((allowed) => {
        if (!allowed) {
          try { alert('You are not authorized to create problems.'); } catch (e) {}
          return
        }
        create_solo_problem(problemPayload, (response) => {
        const status = response.status || 'pending'
        const message = status === 'approved'
          ? 'Question created and approved'
          : 'Question submitted for approval'
        alert(message)

        if (status === 'approved') {
          loadQuestions()
        }

        const modalEl = document.getElementById(createModalId)
        if (modalEl && window.bootstrap?.Modal) {
          const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
          instance.hide()
        }
        })
      })
    })
  } catch (e) {
    console.error('permission check failed', e)
  }
}

function onCreateNewSoloQuestion() {
  try {
    const modalEl = document.getElementById(createModalId)
    if (modalEl && window.bootstrap?.Modal) {
      const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
      instance.show()
    }
  } catch (e) {
    console.error('Failed to open solo create modal', e)
  }
}

function formatProgressStatus(status) {
  if (status === 'complete') return '✓ Completed'
  if (status === 'unfinished') return '◐ Unfinished'
  if (status === 'untouch') return '○ Untouched'
  return 'Unknown'
}

function getProgressClass(status) {
  if (status === 'complete') return 'progress-completed'
  if (status === 'unfinished') return 'progress-unfinished'
  return 'progress-untouched'
}

onMounted(() => {
  loadQuestions()
})

function handleModalDraftSaved(payload) {
  alert('Draft saved successfully')
  loadQuestions()
}
</script>

<template>
  <section>
    <Window>
      <template #title><span>Solo Problem Sets</span></template>
      <template #content>
        <ScrollVerticalCarousel>
          <TableList class="solo-table" :column_slot="['question_name','question_difficulty','question_topics','progress','actions']">
            <template #question_name>
              <div>
                <p>Question Name</p>
              </div>
            </template>
            <template #question_difficulty>
              <div>
                <p>Difficulty</p>
              </div>
            </template>
            <template #question_topics>
              <div>
                <p>Topics</p>
              </div>
            </template>
            <template #progress>
              <div>
                <p>Progress</p>
              </div>
            </template>
            <template #actions>
              <div>
                <p>Action</p>
              </div>
            </template>

            <template #content>
              <tr class="solo-table-row" v-for="(data, index) in solo_question_rows" :key="data.QuestionID || index">
                <td>
                  {{ index + 1 }}. {{ data.QuestionName }}
                </td>
                <td>{{ data.QuestionDifficulty }}</td>
                <td>
                  <span v-if="getTopicsFromRow(data).length === 0" class="text-muted small">None</span>
                  <span v-else>
                    <TextPill
                      v-for="(topic, i) in getTopicsFromRow(data)"
                      :key="`${data.QuestionID || index}-topic-${i}`"
                      :allowed="getTopicsFromRow(data)"
                      :colors="getTopicColors(getTopicsFromRow(data))"
                      :word="topic"
                      size="sm"
                      class="me-1 mb-1 d-inline-block"
                    />
                  </span>
                </td>
                <td>
                  <span :class="getProgressClass(data.ProgressStatus)">
                    {{ formatProgressStatus(data.ProgressStatus) }}
                  </span>
                </td>
                <td>
                  <ModalButton
                    modal_btn_id="soloProblemModal"
                    modal_btn_title="Play"
                    :auto="false"
                    @click="handlePlay(data.QuestionID)"
                  />
                </td>
              </tr>
              <tr v-if="solo_question_rows.length === 0">
                <td colspan="5" class="text-center">No approved questions available.</td>
              </tr>
            </template>
          </TableList>
        </ScrollVerticalCarousel>
      </template>
    </Window>
  </section>

  <section>
    <Window>
      <template #title><span>Search</span></template>
      <template #content>
        <SearchPanel @filters-updated="handleFiltersUpdated" />
      </template>
    </Window>
    <Window>
      <template #title><span>Your Set Questions</span></template>
      <template #content>
        <!-- CREATE-PROBLEM-FLOW: user trigger to open create-question modal -->
        <ModalButton
          :modal_btn_id="createModalId"
          modal_btn_title="Create New Question +"
          :auto="false"
          @click="onCreateNewSoloQuestion"
        />
        <CreateQuestionModal
          :modalId="createModalId"
          submitLabel="Submit Question"
          @create-question="handleCreateSoloQuestion"
          @draft-saved="handleModalDraftSaved"
        />
      </template>
    </Window>
  </section>

  <Modal 
    modal_id="soloProblemModal" 
    modal_title="Play Question"
    :close_btn_footer_bool="false"
  >
    <template #content>
      <div class="problem-details-container">
        <h5 class="mb-2">{{ currentProblem.ProblemName }}</h5>
        <p class="mb-1"><strong>Difficulty:</strong> {{ currentProblem.Difficulty }}</p>
        <p class="mb-1"><strong>Time Limit:</strong> {{ currentProblem.TimeLimitSeconds }}s</p>
        <p class="mb-1"><strong>Memory Limit:</strong> {{ currentProblem.MemoryLimitMB }} MB</p>
        <p class="mb-3"><strong>Description:</strong> {{ currentProblem.Description }}</p>
        <div v-if="currentProblem.Topics && currentProblem.Topics.length" class="mb-2">
          <strong>Topics:</strong>
          <span class="ms-2">
            <TextPill
              v-for="(topic, i) in getCurrentProblemTopicNames()"
              :key="`current-problem-topic-${i}`"
              :allowed="getCurrentProblemTopicNames()"
              :colors="getTopicColors(getCurrentProblemTopicNames())"
              :word="topic"
              size="sm"
              class="me-1 mb-1 d-inline-block"
            />
          </span>
        </div>

        <div v-if="isProblemLoading">Loading test cases...</div>
        <div v-else>
          <h6 class="mb-2">Test Cases (debug)</h6>
          <div v-if="currentTestCases.length === 0" class="mb-2">No test cases found.</div>
          <ul class="list-unstyled">
            <li v-for="tc in currentTestCases" :key="tc.TestCaseID" class="mb-2">
              <div><strong>#{{ tc.TestCaseNumber }}</strong> (Score: {{ tc.Score }}) <span v-if="tc.IsSample">[Sample]</span></div>
              <div><small>Input:</small> <code>{{ tc.InputData }}</code></div>
              <div><small>Expected:</small> <code>{{ tc.ExpectedOutput }}</code></div>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <template #modal_footer>
      <ButtonText
        title="Play"
        alt-text="play this question"
        :link="currentProblemLink"
      />
      <ButtonText
        title="Close"
        alt-text="close modal"
        data-bs-dismiss="modal"
      />
    </template>
  </Modal>
</template>

<style scoped>
/* Progress status styling */
.progress-completed {
  color: #28a745;
  font-weight: bold;
}

.progress-unfinished {
  color: #ffc107;
  font-weight: bold;
}

.progress-untouched {
  color: #6c757d;
  font-weight: normal;
}

.solo-table-row td {
  vertical-align: middle;
}
</style>
