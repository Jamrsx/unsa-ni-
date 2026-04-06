<script>
import TableList from '../../../table-list.vue';
import ModalButton from '../../../modal-button.vue';
import TextPill from '../../../text-pill.vue';
import { can, getPermissions, initPermissions, ensureCan } from '../../../../js/permissions.js'
import { toastError } from '../../../Toast.vue'
export default{
    props: {
        question_rows: {
            type: Array,
            default: () => []
        }
    },
    emits: ['view-problem','edit-question','delete-question'],
    components:{
        TableList,
        ModalButton
        ,TextPill
    }
    ,mounted() {
        // fetch per-row summary if missing
        (this.question_rows || []).forEach((row, i) => {
            if (!row.TestSummary && !row.LastRun) {
                // stagger requests to avoid flooding socket
                setTimeout(() => this.fetchRowSummary(row, i), i * 50)
            }
        })
    },
    methods: {
        normalizeTopic(t) {
            if (!t) return ''
            const s = (t.TopicName || t || '').toString().trim().toLowerCase()
            return s.replace(/[^a-z0-9]+/g, '_')
        },
        topicPermissionAllowed(topics, permBase) {
            try {
                if (can(permBase)) return true
                const perms = getPermissions()
                // explicit any grants
                if (perms.includes(`${permBase}.any`)) return true
                // any wildcard grant other than '.own' should grant broader access
                if (perms.some(p => p.startsWith(`${permBase}.`) && !p.endsWith('.own') && p !== `${permBase}.any`)) return true

                const names = (topics || []).map(t => this.normalizeTopic(t)).filter(Boolean)
                if (!names.length) {
                    // no topic tags: only allow if non-own wildcard/any exists (already checked)
                    return false
                }
                // allow if user has permission for ANY topic on the problem
                return names.some(n => can(`${permBase}.${n}`))
            } catch (e) {
                return false
            }
        },
        onEditClicked(row) {
            try {
                initPermissions(() => {
                    Promise.resolve().then(async () => {
                        const anyAllowed = await ensureCan('problem.edit.any')
                        const allowed = anyAllowed || this.topicPermissionAllowed(row.Topics, 'problem.edit')
                        if (allowed) {
                            this.$emit('edit-question', { ...row, sourceTable: 'admin' })
                            return
                        }
                        try { toastError('You are not authorized to edit this problem.'); } catch(e){}
                    })
                })
            } catch (e) {
                console.error('permission check failed', e)
                try { toastError('You are not authorized to edit this problem.'); } catch(e){}
            }
        },
        onDeleteClicked(row) {
            try {
                console.log('[DEBUG] Delete clicked for question:', row.QuestionID);
                initPermissions(() => {
                    Promise.resolve().then(async () => {
                        const [anyAllowed, ownAllowed] = await Promise.all([
                            ensureCan('problem.delete.any'),
                            ensureCan('problem.delete.own')
                        ])
                        console.log('[DEBUG] Delete permissions check:', { anyAllowed, ownAllowed, topics: row.Topics });
                        const allowed = anyAllowed || ownAllowed || this.topicPermissionAllowed(row.Topics, 'problem.delete')
                        console.log('[DEBUG] Delete allowed:', allowed);
                        if (allowed) {
                            console.log('[DEBUG] Emitting delete-question event for:', row.QuestionID);
                            this.$emit('delete-question', row.QuestionID)
                            return
                        }
                        try { toastError('You are not authorized to delete this problem.'); } catch(e){}
                    })
                })
            } catch (e) {
                console.error('permission check failed', e)
                try { toastError('You are not authorized to delete this problem.'); } catch(e){}
            }
        },
        fetchRowSummary(row, index) {
            try {
                const token = localStorage.getItem('jwt_token')
                if (!window.socket || !row || !row.QuestionID) return
                const problem_id = row.QuestionID
                const handler = (res) => {
                    if (!res || !res.success || !res.problem) return
                    if ((res.problem.ProblemID || res.problem.ProblemID === 0) && Number(res.problem.ProblemID) !== Number(problem_id)) return
                    // assign fields into the existing row object so parent list updates
                    row.TestSummary = res.TestSummary || null
                    row.LastRun = res.LastRun || null
                }
                window.socket.once('response_get_problem_details', handler)
                window.socket.emit('request_get_problem_details', { token_session: token, problem_id })
            } catch (e) {
                console.error('fetchRowSummary error', e)
            }
        }
    }
}
</script>
<template>
    <TableList class="solo-table" :column_slot="['question_name','question_difficulty','question_topics','question_status','question_action']">
        <template #question_name>
            <div>
                <p>Question Name</p>
            </div>
        </template>
        <template #question_topics>
            <div>
                <p>Topics</p>
            </div>
        </template>
        <template #question_difficulty>
            <div>
                <p>Difficulty</p>
            </div>
        </template>
        <template #question_status>
            <div>
                <p>Status</p>
            </div>
        </template>

        <template #question_action>
            <div>
                <p>Action</p>
            </div>
        </template>

        <template #content>
            <tr class="solo-table-row" v-for="(data,index) in question_rows" :key="index">
                <td>{{ index + 1 }}. {{ data.QuestionName }}</td>
                <td>{{ data.QuestionDifficulty }}</td>
                <td>
                    <span v-if="!data.Topics || data.Topics.length === 0" class="text-muted small">None</span>
                    <span v-else>
                        <TextPill
                            v-for="(topic, i) in data.Topics"
                            :key="`${data.QuestionID}-topic-${i}`"
                            :allowed="(data.Topics||[]).map(t => t.TopicName || t)"
                            :colors="(data.Topics||[]).map((_, i) => ['#0d6efd', '#20c997', '#6f42c1', '#fd7e14', '#e83e8c', '#198754', '#0dcaf0', '#dc3545', '#6c757d'][i % 9])"
                            :word="topic.TopicName || topic"
                            size="sm"
                            class="me-1 mb-1 d-inline-block"
                        />
                    </span>
                </td>
                <td>
                    <div>{{ data.Status || 'approved' }}</div>
                    <div class="mt-1">
                        <span v-if="data.TestSummary" class="badge bg-success">{{ data.TestSummary.passed }} / {{ data.TestSummary.total }}</span>
                        <span v-else-if="data.LastRun" :class="['badge', data.LastRun.result === 'passed' ? 'bg-success' : 'bg-danger']">{{ data.LastRun.result }}</span>
                        <span v-else class="text-muted small">—</span>
                    </div>
                </td>
                <td>
                    <div class="row">
                        <div class="col">
                            <ModalButton
                                :modal_btn_id="`viewProblemModal`"
                                modal_btn_title="View"
                                :auto="false"
                                @click="$emit('view-problem', data.QuestionID)"
                                class="user_table_view_btn"
                            />
                        </div>
                        <div class="col">
                            <ModalButton
                                :modal_btn_id="`adminCreateQuestionModal`"
                                modal_btn_title="Edit"
                                :auto="false"
                                @click="onEditClicked(data)"
                                class="question_table_edit_btn"
                            />
                        </div>
                                                <div class="col">
                                                        <div class="modal-button w-100">
                                                            <button
                                                                type="button"
                                                                class="modal-button btn btn-primary open-btn w-100"
                                                                @click="onDeleteClicked(data)"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                </div>
                    </div>
                </td>
            </tr>
        </template>
    </TableList>
</template>
