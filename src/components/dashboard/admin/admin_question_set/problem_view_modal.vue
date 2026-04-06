<template>
    <Modal 
        :modal_id="modalId" 
        :modal_title="modalTitle"
        :close_btn_footer_bool="false"
    >
        <template #content>
            <div class="problem-details-container">
                <!-- Problem Information Section -->
                <div class="problem-info-section">
                    <TextField
                        label="Problem Name"
                        name="problem_name"
                        :modelValue="problemData.ProblemName"
                        :disabled="true"
                        placeholder="Problem Name"
                    />
                    
                    <DropdownArray
                        v-model="problemData.Difficulty"
                        :options="['Easy', 'Medium', 'Hard']"
                        :disabled="true"
                    />
                    
                    <TextField
                        label="Description"
                        name="description"
                        :modelValue="problemData.Description"
                        :disabled="true"
                        placeholder="Problem Description"
                    />
                    
                    <SliderRange
                        label="Time Limit (seconds)"
                        :min="1"
                        :max="10"
                        :step="1"
                        :defaultValue="problemData.TimeLimitSeconds"
                        v-model="problemData.TimeLimitSeconds"
                        :disabled="true"
                    />
                    
                    <SliderRange
                        label="Memory Limit (MB)"
                        :min="32"
                        :max="512"
                        :step="32"
                        :defaultValue="problemData.MemoryLimitMB"
                        v-model="problemData.MemoryLimitMB"
                        :disabled="true"
                    />
                </div>

                <!-- Test Cases Section -->
                <div class="result-summary mb-3" v-if="showResultSummary">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <span class="badge" :class="verdictClass">{{ verdictText }}</span>
                        </div>
                        <div>
                            <small class="text-muted">{{ passedTotalText }}</small>
                        </div>
                    </div>
                </div>
                <div class="test-cases-section">
                    <h6 class="test-cases-title">Test Cases</h6>
                    <ScrollVerticalCarousel>
                        <ScrollCard v-for="testCase in testCases" :key="testCase.TestCaseID">
                            <div class="test-case-card">
                                <h6 class="test-case-number">Test Case #{{ testCase.TestCaseNumber }}</h6>
                                
                                <div class="test-case-field">
                                    <label>Input Data:</label>
                                    <textarea 
                                        class="form-control test-case-textarea" 
                                        :value="testCase.InputData" 
                                        disabled
                                        rows="3"
                                    ></textarea>
                                </div>
                                
                                <div class="test-case-field">
                                    <label>Expected Output:</label>
                                    <textarea 
                                        class="form-control test-case-textarea" 
                                        :value="testCase.ExpectedOutput" 
                                        disabled
                                        rows="3"
                                    ></textarea>
                                </div>
                                
                                <div class="test-case-score">
                                    <label>Score:</label>
                                    <span class="score-value">{{ testCase.Score }}</span>
                                </div>
                                
                                <div v-if="testCase.IsSample" class="sample-badge">
                                    <span class="badge bg-info">Sample Test Case</span>
                                </div>
                            </div>
                        </ScrollCard>
                    </ScrollVerticalCarousel>
                </div>
            </div>
        </template>

        <template #modal_footer>
            <ButtonText
                title="Close"
                alt-text="close modal button"
                data-bs-dismiss="modal"
                class="modal-close-btn"
            />
        </template>
    </Modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import Modal from '../../../modal.vue'
import TextField from '../../../text-field.vue'
import DropdownArray from '../../../dropdown-array.vue'
import SliderRange from '../../../slider-range.vue'
import ScrollVerticalCarousel from '../../../scroll-vertical-carousel.vue'
import ScrollCard from '../../../scroll-card.vue'
import ButtonText from '../../../button-text.vue'

const props = defineProps({
    modalId: {
        type: String,
        required: true
    },
    problemData: {
        type: Object,
        default: () => ({
            ProblemID: 0,
            ProblemName: '',
            Difficulty: 'Easy',
            TimeLimitSeconds: 1,
            MemoryLimitMB: 64,
            Description: ''
        })
    },
    testCases: {
        type: Array,
        default: () => []
    }
})

const modalTitle = computed(() => `View Problem: ${props.problemData.ProblemName || 'Loading...'}`)

// Result summary computed properties (client-only display when metadata present)
const showResultSummary = computed(() => {
    // Prefer explicit summary from server: problemData.TestSummary or problemData.LastRun
    if (props.problemData && (props.problemData.TestSummary || props.problemData.LastRun)) return true
    // Otherwise show summary only if testCases include pass info
    if (Array.isArray(props.testCases) && props.testCases.length > 0) {
        return props.testCases.some(tc => tc.Passed !== undefined || tc.passed !== undefined)
    }
    return false
})

const verdictText = computed(() => {
    // server-provided summary preferred
    const s = props.problemData?.TestSummary || props.problemData?.LastRun
    if (s) {
        if (s.passed === s.total && s.total > 0) return 'Accepted'
        if ((s.passed || 0) > 0) return 'Partially Passed'
        return 'Failed'
    }

    // derive from testCases if they contain per-case pass flags
    if (Array.isArray(props.testCases) && props.testCases.length > 0) {
        const passCount = props.testCases.reduce((acc, tc) => acc + (tc.Passed || tc.passed ? 1 : 0), 0)
        const total = props.testCases.length
        if (total === 0) return 'Not tested'
        if (passCount === total) return 'Accepted'
        if (passCount > 0) return 'Partially Passed'
        return 'Failed'
    }

    return 'Not tested'
})

const passedTotalText = computed(() => {
    const s = props.problemData?.TestSummary || props.problemData?.LastRun
    if (s && typeof s.passed === 'number' && typeof s.total === 'number') {
        return `${s.passed} / ${s.total}`
    }
    if (Array.isArray(props.testCases) && props.testCases.length > 0) {
        const passCount = props.testCases.reduce((acc, tc) => acc + (tc.Passed || tc.passed ? 1 : 0), 0)
        // If no explicit per-test pass flags and no TestSummary, show 0 / total to indicate not run
        const inferredPassed = passCount || 0
        return `${inferredPassed} / ${props.testCases.length}`
    }
    return '—'
})

const verdictClass = computed(() => {
    const v = verdictText.value
    if (v === 'Accepted') return 'bg-success text-white'
    if (v === 'Partially Passed') return 'bg-warning text-dark'
    if (v === 'Failed') return 'bg-danger text-white'
    return 'bg-secondary text-white'
})
</script>

<style scoped>
.problem-details-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.problem-info-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.test-cases-section {
    margin-top: 1rem;
}

.test-cases-title {
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
}

.test-case-card {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    margin-bottom: 0.5rem;
}

.test-case-number {
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.75rem;
}

.test-case-field {
    margin-bottom: 0.75rem;
}

.test-case-field label {
    display: block;
    font-weight: 500;
    font-size: 0.9rem;
    color: #495057;
    margin-bottom: 0.25rem;
}

.test-case-textarea {
    resize: none;
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    background-color: #fff;
}

.test-case-score {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.test-case-score label {
    font-weight: 500;
    color: #495057;
}

.score-value {
    font-weight: 600;
    color: #28a745;
    font-size: 1.1rem;
}

.sample-badge {
    margin-top: 0.5rem;
}

.modal-close-btn {
    margin-top: 1rem;
}
</style>
