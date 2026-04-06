<script>
import Window from '../../window.vue';

import SplitMainWindow from '../../split-main-window.vue';
import { can, initPermissions, ensureCan, getPermissions } from '../../../js/permissions.js'
import { normalizeTopic, topicPermissionAllowed } from '../../../js/user-dashboard.js'


import SearchBarAndSort from '../../search-bar-and-sort.vue';
import DropdownArray from '../../dropdown-array.vue';
import ScrollVerticalCarousel from '../../scroll-vertical-carousel.vue';
import ModalButton from '../../modal-button.vue';
// Canonical admin CreateQuestionModal: this is the single source of truth
// for create/edit problem UI. Faculty views reuse this component for parity.
import CreateQuestionModal from '../create_question_modal.vue';
// Canonical admin ProblemViewModal: displays problem details and test-case
// summaries. Other dashboards (faculty/user) reuse this component to keep
// presentation consistent and reduce duplication.
import ProblemViewModal from './admin_question_set/problem_view_modal.vue';

import ButtonImage from '../../button-img.vue';
import ButtonText from '../../button-text.vue';
import ScoreLabel from '../../score-label.vue';
import SearchPanel from '../../search-panel.vue';

import Admin_question_table from './admin_question_set/admin_question_table.vue';
import User_question_table from './admin_question_set/user_question_table.vue';
import Pending_question_table from './admin_question_set/pending_question_table.vue';

export default{
  props: {
    admin_question_rows: {
      type: Array,
      default: () => []
    },
    user_question_rows: {
      type: Array,
      default: () => []
    },
    pending_question_rows: {
      type: Array,
      default: () => []
    },
    currentProblem: {
      type: Object,
      default: () => ({})
    },
    currentTestCases: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'view-problem',
    'delete-question',
    'approve-question',
    'deny-question',
        'filter-questions',
                'create-question',
        'edit-question',
        'update-question',
        'submit-draft',
        'move-to-draft',
        'move-to-pending'
  ],
  components:{
    Window,

    SplitMainWindow,
    SearchBarAndSort,
    DropdownArray,
        ScrollVerticalCarousel,
        ModalButton,
        CreateQuestionModal,
        ProblemViewModal,

    ButtonImage,
    ButtonText,
    ScoreLabel,
    SearchPanel,

    // tables
    Admin_question_table,
    User_question_table,
    Pending_question_table
  }
    ,
    data() {
        return { permsTick: 0 }
    },
    computed: {
        canCreateButton() {
            // hey gab, look at this in case you wonder why the create button shows or not based on permissions
            // depend on permsTick so this recomputes when permissions update
            const _tick = this.permsTick
            try {
                return can('problem.create') || can('problem.create.*') || can('problem.approvals.manage')
            } catch (e) { return false }
        }
    },
    mounted() {
        try {
            initPermissions(() => { this.permsTick = Date.now() })
        } catch (e) {}
        this._permListener = () => { this.permsTick = Date.now() }
        if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('my_permissions_updated', this._permListener)
    },
    beforeUnmount() {
        try { if (this._permListener && typeof window !== 'undefined' && window.removeEventListener) window.removeEventListener('my_permissions_updated', this._permListener) } catch (e) {}
    }
}
</script>
<template>
    <div class="row d-flex flex-row">
        <section>
            <Window>
            <template #title></template>
            <template #content>
                <!-- top navigation -->
                <SplitMainWindow 
                    v-model:currentSection="activeSection"
                    :sections="question_sections" 
                    default-section="admin_question" 
                    class="top-split-main-window question_set_nav"
                    @section-changed="onSectionChanged"
                >
                    <!-- table here -->
                    <template #admin_question>
                        <template v-if="admin_question_rows.length === 0">
                            <div class="no-questions-msg">No questions available.</div>
                        </template>
                        <template v-else>
                            <Admin_question_table 
                                :question_rows="admin_question_rows"
                                @view-problem="$emit('view-problem', $event)"
                                @delete-question="(id) => $emit('delete-question', { questionId: id, tableType: 'admin' })"
                                @edit-question="$emit('edit-question', $event)"
                            />
                        </template>
                    </template>
                    <template #user_question>
                        <template v-if="user_question_rows.length === 0">
                            <div class="no-questions-msg">No questions available.</div>
                        </template>
                        <template v-else>
                            <User_question_table 
                                :question_rows="user_question_rows"
                                @view-problem="$emit('view-problem', $event)"
                                @delete-question="(id) => $emit('delete-question', { questionId: id, tableType: 'user' })"
                                @edit-question="$emit('edit-question', $event)"
                            />
                        </template>
                    </template>
                    <template #pending_question>
                        <template v-if="pending_question_rows.length === 0">
                            <div class="no-questions-msg">No questions available.</div>
                        </template>
                        <template v-else>
                            <Pending_question_table 
                                :question_rows="pending_question_rows"
                                @view-problem="$emit('view-problem', $event)"
                                @approve-question="$emit('approve-question', $event)"
                                @deny-question="$emit('deny-question', $event)"
                            />
                        </template>
                    </template>
                </SplitMainWindow>
                
                
            </template>
            </Window>
        </section>
        <section>
            <Window>
            <template #title><span>Search & Filter</span></template>
            <template #content>
                <!-- search panel here - emits filters-updated to parent -->
                <SearchPanel :showProgress="false" @filters-updated="onFiltersUpdated"/>
            </template>
            </Window>
            <Window>
            <template #title><span>Your Set Questions</span></template>
            <template #content>
                <!-- CREATE-PROBLEM-FLOW: admin trigger to open create-question modal -->
                <!-- Render Create button always and rely on modal guard for permission checks -->
                <ModalButton
                    modal_btn_id="adminCreateQuestionModal"
                    modal_btn_title="Create New Question +"
                    :auto="false"
                    @click="onCreateNewQuestion"
                />
                <CreateQuestionModal
                    modalId="adminCreateQuestionModal"
                    submitLabel="Create Question"
                    :editingQuestion="editingQuestion"
                    :sourceTable="editingQuestion?.sourceTable || 'create'"
                    :requireAnyPermissions="['problem.create','problem.create.*','problem.approvals.manage']"
                    @create-question="(payload) => $emit('create-question', payload)"
                    @update-question="(payload) => {
                        $emit('update-question', payload);
                        editingQuestion.value = null;
                    }"
                    @submit-draft="(payload) => {
                        $emit('submit-draft', payload);
                        editingQuestion.value = null;
                    }"
                    @move-to-draft="(payload) => {
                        $emit('move-to-draft', payload);
                        editingQuestion.value = null;
                    }"
                    @move-to-pending="(payload) => {
                        $emit('move-to-pending', payload);
                        editingQuestion.value = null;
                    }"
                    @draft-saved="(payload) => {
                        // propagate to parent and clear editing mode
                        $emit('draft-saved', payload);
                        editingQuestion.value = null;
                    }"
                    @test-run-recorded="(payload) => { $emit('test-run-recorded', payload); editingQuestion.value = null }"
                    @refresh-problems="$emit('refresh-problems')"
                />
            </template>
            </Window>
        </section>
        
        <!-- Problem View Modal (canonical admin view; reused by faculty) -->
        <ProblemViewModal
            modalId="viewProblemModal"
            :problemData="currentProblem"
            :testCases="currentTestCases"
        />
    </div>
</template>

<style scoped>
/* Style for the no questions message */
.no-questions-msg {
  text-align: center;
  color: #888;
  font-size: 1.1em;
  margin: 2em 0;
}
</style>

<script setup>
    import { ref, watch, onMounted } from 'vue'
    import { can, initPermissions, getPermissions } from '../../../js/permissions.js'
    import { toastError } from '../../Toast.vue'

    const emit = defineEmits([
        'view-problem',
        'delete-question',
        'approve-question',
        'deny-question',
        'filter-questions',
        'create-question',
        'edit-question',
        'update-question',
        'submit-draft',
        'move-to-draft',
        'move-to-pending',
        'draft-saved',
        'test-run-recorded'
    ])

    const question_sections = [
        { id: 'admin_question', name: 'Admin' },
        { id: 'user_question', name: 'User' },
        { id: 'pending_question', name: 'Pending Question' }
    ]

    // Track current active section
    const activeSection = ref('admin_question')
    // Keep the last applied filters to re-apply on tab switch
    const lastFilters = ref(null)
    // When set programmatically, skip re-applying last filters (prevent race)
    const skipNextReapply = ref(false)
    // Track editing question for modal prefill
    const editingQuestion = ref(null)

    // Map section IDs to table types
    const sectionToTableType = {
        'admin_question': 'admin',
        'user_question': 'user',
        'pending_question': 'pending'
    }

    function onSectionChanged(sectionId) {
        activeSection.value = sectionId
        // Re-apply last filters when switching tabs (if any)
        if (lastFilters.value && !skipNextReapply.value) {
            const tableType = sectionToTableType[activeSection.value]
            emit('filter-questions', {
                tableType,
                filters: lastFilters.value
            })
        }
    }

    function onFiltersUpdated(filters) {
        const tableType = sectionToTableType[activeSection.value]
        // Store latest filters for re-application on tab switch
        lastFilters.value = filters

        // Emit with the current active table type
        emit('filter-questions', {
            tableType: tableType,
            filters: filters
        })
    }

    function onEditQuestion(questionData) {
        // Refresh permissions then evaluate whether the current user
        // may edit this problem (global or per-topic). If not allowed,
        // show a toast and do not open the modal.
        try {
                initPermissions(() => {
                    const topics = questionData?.Topics || []
                    Promise.resolve().then(async () => {
                        const anyAllowed = await ensureCan('problem.edit.any')
                        const allowed = anyAllowed || topicPermissionAllowed(topics, 'problem.edit')
                        if (allowed) {
                            editingQuestion.value = questionData
                            // Open the modal
                            const modalEl = document.getElementById('adminCreateQuestionModal')
                            if (modalEl && window.bootstrap?.Modal) {
                                const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
                                instance.show()
                            }
                        } else {
                            try { toastError('You are not authorized to edit this problem.') } catch (e) {}
                        }
                    })
                })
            } catch (e) {
                console.error('permission check failed before opening edit modal', e)
            }
    }

    // Listen for edit event from parent and clear edit state when modal hides
    onMounted(() => {
        const handleEditEvent = (event) => {
            const questionData = window.editingQuestionData || event.detail
            if (questionData) {
                onEditQuestion(questionData)
            }
        }
        window.addEventListener('openEditQuestion', handleEditEvent)

        // Allow parent to set active inner section via window event
        const handleSetSection = (ev) => {
            const detail = ev.detail || {}
            const section = detail.section || ev.detail
            if (section && question_sections.find(s => s.id === section)) {
                // optionally skip reapply
                skipNextReapply.value = !!detail.skipReapply
                activeSection.value = section
                // clear skip flag after next tick
                setTimeout(() => { skipNextReapply.value = false }, 50)
            }
        }
        window.addEventListener('setQuestionSection', handleSetSection)

        // Clear editing state when modal is closed
        const modalEl = document.getElementById('adminCreateQuestionModal')
        if (modalEl) {
            modalEl.addEventListener('hidden.bs.modal', () => {
                editingQuestion.value = null
            })
        }
        return () => {
            window.removeEventListener('openEditQuestion', handleEditEvent)
            window.removeEventListener('setQuestionSection', handleSetSection)
            if (modalEl) {
                modalEl.removeEventListener('hidden.bs.modal', () => {
                    editingQuestion.value = null
                })
            }
        }
    })

    // Also react to v-model section changes and re-apply filters
    watch(activeSection, (newSection) => {
        if (lastFilters.value) {
            const tableType = sectionToTableType[newSection]
            emit('filter-questions', {
                tableType,
                filters: lastFilters.value
            })
        }
    })

    // pressable [data-href] tr's
    // will user property 'data-href' in admin_question_set folder
    document.addEventListener('DOMContentLoaded', function(){
        const rows = document.querySelectorAll('tr[data-href]');
        rows.forEach(row => {
            row.addEventListener('click',function(){
                window.location.href = this.dataset.href;
            });
        });
    });

    // Handler for Create New Question button to reset editing state
    function onCreateNewQuestion() {
        try {
            if (typeof editingQuestion !== 'undefined' && editingQuestion !== null) {
                editingQuestion.value = null
            }
        } catch (e) {
            console.error('onCreateNewQuestion failed', e)
        }
        // Programmatically open the create question modal (button uses :auto="false")
        try {
            const modalEl = document.getElementById('adminCreateQuestionModal')
            if (modalEl && window.bootstrap?.Modal) {
                const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
                instance.show()
            }
        } catch (e) { console.error('Failed to open create question modal', e) }
    }
</script>
