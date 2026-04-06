<template>
    <Modal 
        modal_id="viewApprovalQuestionModal" 
        modal_title="View Question Details"
        :close_btn_footer_bool="false"
    >
        <template #content>
            <div class="question-details-container" v-if="questionData">
                <!-- Question Information Section -->
                <div class="question-info-section">
                    <TextField
                        label="Problem Name"
                        name="question_name"
                        :modelValue="questionData.question_name || 'N/A'"
                        :disabled="true"
                        placeholder="Question Name"
                    />
                    
                    <DropdownArray
                        label="Difficulty"
                        :options="['Easy', 'Medium', 'Hard']"
                        :modelValue="questionData.question_difficulty || 'Easy'"
                        :disabled="true"
                    />
                    
                    <TextField
                        label="Description"
                        name="description"
                        :modelValue="questionData.question_description || 'N/A'"
                        :disabled="true"
                        placeholder="Problem Description"
                    />
                    
                    <SliderRange
                        label="Time Limit (seconds)"
                        :min="1"
                        :max="10"
                        :step="1"
                        :defaultValue="questionData.question_time_limit || 1"
                        v-model="questionData.question_time_limit"
                        :disabled="true"
                    />
                    
                    <SliderRange
                        label="Memory Limit (MB)"
                        :min="32"
                        :max="512"
                        :step="32"
                        :defaultValue="questionData.question_memory_limit || 64"
                        v-model="questionData.question_memory_limit"
                        :disabled="true"
                    />
                    
                    <TextField
                        label="Submitted Date"
                        name="requested_at"
                        :modelValue="formatDateTime(questionData.requested_at)"
                        :disabled="true"
                        placeholder="Submitted Date"
                    />
                    
                    <TextField
                        label="Status"
                        name="status"
                        :modelValue="questionData.status || 'Pending'"
                        :disabled="true"
                        placeholder="Status"
                    />
                </div>

                <!-- Test Cases Section -->
                <div class="test-cases-section" v-if="questionData.test_cases && questionData.test_cases.length > 0">
                    <h6 class="test-cases-title">Test Cases</h6>
                    <ScrollVerticalCarousel>
                        <ScrollCard v-for="testCase in questionData.test_cases" :key="testCase.test_case_id">
                            <div class="test-case-card">
                                <h6 class="test-case-number">Test Case #{{ testCase.test_case_number }}</h6>
                                
                                <div class="test-case-field">
                                    <label>Input Data:</label>
                                    <textarea 
                                        class="form-control test-case-textarea" 
                                        :value="testCase.input_data" 
                                        disabled
                                        rows="3"
                                    ></textarea>
                                </div>
                                
                                <div class="test-case-field">
                                    <label>Expected Output:</label>
                                    <textarea 
                                        class="form-control test-case-textarea" 
                                        :value="testCase.expected_output" 
                                        disabled
                                        rows="3"
                                    ></textarea>
                                </div>
                                
                                <div class="test-case-score">
                                    <label>Score:</label>
                                    <span class="score-value">{{ testCase.score || 0 }}</span>
                                </div>
                                
                                <div v-if="testCase.is_sample" class="sample-badge">
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
                class="btn-secondary"
            />
        </template>
    </Modal>
</template>

<script>
import Modal from '../../../modal.vue';
import TextField from '../../../text-field.vue';
import DropdownArray from '../../../dropdown-array.vue';
import SliderRange from '../../../slider-range.vue';
import ScrollVerticalCarousel from '../../../scroll-vertical-carousel.vue';
import ScrollCard from '../../../scroll-card.vue';
import ButtonText from '../../../button-text.vue';

export default {
    components: {
        Modal,
        TextField,
        DropdownArray,
        SliderRange,
        ScrollVerticalCarousel,
        ScrollCard,
        ButtonText
    },
    props: {
        questionData: {
            type: Object,
            default: () => ({})
        }
    },
    setup() {
        const formatDateTime = (dateTime) => {
            if (!dateTime) return 'N/A';
            const date = new Date(dateTime);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        };

        return {
            formatDateTime
        };
    }
}
</script>

<style scoped>
.question-details-container {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.question-info-section {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.test-cases-section {
    margin-top: 20px;
}

.test-cases-title {
    font-weight: 600;
    margin-bottom: 15px;
    color: var(--c_bluemain);
}

.test-case-card {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 15px;
}

.test-case-number {
    font-weight: 600;
    color: var(--c_bluemain);
    margin-bottom: 15px;
}

.test-case-field {
    margin-bottom: 15px;
}

.test-case-field label {
    font-weight: 500;
    margin-bottom: 5px;
    display: block;
}

.test-case-textarea {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    background-color: #fff;
}

.test-case-score {
    margin-bottom: 10px;
}

.test-case-score label {
    font-weight: 500;
    margin-right: 10px;
}

.score-value {
    font-weight: 600;
    color: var(--c_greenmain);
}

.sample-badge {
    margin-top: 10px;
}
</style>
