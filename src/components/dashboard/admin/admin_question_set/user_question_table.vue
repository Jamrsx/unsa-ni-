<script>
import TableList from '../../../table-list.vue';
import ModalButton from '../../../modal-button.vue';
import TextPill from '../../../text-pill.vue';
import { can, getPermissions, initPermissions, ensureCan } from '../../../../js/permissions.js'
import { toastError } from '../../../Toast.vue'

export default {
    props: {
        question_rows: {
            type: Array,
            default: () => []
        },
        actionsDisabled: {
            type: Boolean,
            default: false
        }
    },
    components: {
        TableList,
        ModalButton,
        TextPill
    },
    emits: ['view-problem','edit-question','delete-question'],
    data() {
        return {
            TOPIC_COLORS: ['#0d6efd', '#20c997', '#6f42c1', '#fd7e14', '#e83e8c', '#198754', '#0dcaf0', '#dc3545', '#6c757d']
        }
    },
    mounted() {
        // fetch per-row summary if missing
        (this.question_rows || []).forEach((row, i) => {
            if (!row.TestSummary && !row.LastRun) {
                // stagger requests to avoid flooding socket
                setTimeout(() => this.fetchRowSummary(row, i), i * 50)
            }
        })
    },
    methods: {
        getTopicColors(topics) {
            return (topics || []).map((_, i) => this.TOPIC_COLORS[i % this.TOPIC_COLORS.length])
        },
        getTopicNames(topics) {
            return (topics || []).map(t => t.TopicName || t)
        },
        normalizeTopic(t) {
            if (!t) return ''
            const s = (t.TopicName || t || '').toString().trim().toLowerCase()
            return s.replace(/[^a-z0-9]+/g, '_')
        },
        topicPermissionAllowed(topics, permBase) {
            try {
                if (can(permBase)) return true
                const perms = getPermissions()
                if (perms.includes(`${permBase}.any`)) return true
                if (perms.some(p => p.startsWith(`${permBase}.`) && !p.endsWith('.own') && p !== `${permBase}.any`)) return true
                const names = (topics || []).map(t => this.normalizeTopic(t)).filter(Boolean)
                if (!names.length) return false
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
                            this.$emit('edit-question', { ...row, sourceTable: 'user' })
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
                initPermissions(() => {
                    Promise.resolve().then(async () => {
                        const [anyAllowed, ownAllowed] = await Promise.all([
                            ensureCan('problem.delete.any'),
                            ensureCan('problem.delete.own')
                        ])
                        const allowed = anyAllowed || ownAllowed || this.topicPermissionAllowed(row.Topics, 'problem.delete')
                        if (allowed) {
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
                            :allowed="getTopicNames(data.Topics)"
                            :colors="getTopicColors(data.Topics)"
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
                            <button
                                type="button"
                                class="btn btn-primary w-100"
                                :disabled="actionsDisabled"
                                @click="$emit('view-problem', data.QuestionID)"
                            >
                                View
                            </button>
                        </div>
                        <div class="col">
                            <button
                                type="button"
                                class="btn btn-primary w-100"
                                :disabled="actionsDisabled"
                                @click="onEditClicked(data)"
                            >
                                Edit
                            </button>
                        </div>
                        <div class="col">
                            <button
                                type="button"
                                class="btn btn-primary w-100"
                                :disabled="actionsDisabled"
                                    @click="onDeleteClicked(data)"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        </template>
    </TableList>
</template>
