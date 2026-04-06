<script>
import TableList from '../../../table-list.vue';
import ModalButton from '../../../modal-button.vue';
import ButtonImg from '../../../button-img.vue';
import { can, getPermissions } from '../../../../js/permissions.js'
import { toastError } from '../../../Toast.vue'
    export default{
        props: {
            question_rows: {
                type: Array,
                default: () => []
            }
        },
        components:{
            TableList,
            ModalButton,
            ButtonImg
        }
        ,emits: ['view-problem','approve-question','deny-question'],
    mounted() {
        (this.question_rows || []).forEach((row, i) => {
            if (!row.TestSummary && !row.LastRun) {
                setTimeout(() => this.fetchRowSummary(row, i), i * 50)
            }
        })
    },
    methods: {
        fetchRowSummary(row, index) {
            try {
                const token = localStorage.getItem('jwt_token')
                if (!window.socket || !row || !row.QuestionID) return
                const problem_id = row.QuestionID
                const handler = (res) => {
                    if (!res || !res.success || !res.problem) return
                    if ((res.problem.ProblemID || res.problem.ProblemID === 0) && Number(res.problem.ProblemID) !== Number(problem_id)) return
                    row.TestSummary = res.TestSummary || null
                    row.LastRun = res.LastRun || null
                }
                window.socket.once('response_get_problem_details', handler)
                window.socket.emit('request_get_problem_details', { token_session: token, problem_id })
            } catch (e) {
                console.error('fetchRowSummary error', e)
            }
        }
        ,
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
        approveClicked(row) {
            try {
                initPermissions(() => {
                    if (!(can('approvals.manage') || can('roles.manage') || this.topicPermissionAllowed(row.Topics, 'problem.approvals.manage'))) {
                        try { toastError('You are not authorized to approve items.'); } catch (e) {}
                        return
                    }
                    this.$emit('approve-question', { QuestionID: row.QuestionID, ApprovalID: row.ApprovalID })
                })
            } catch (e) {
                if (!(can('approvals.manage') || can('roles.manage') || this.topicPermissionAllowed(row.Topics, 'problem.approvals.manage'))) {
                    try { toastError('You are not authorized to approve items.'); } catch (ee) {}
                    return
                }
                this.$emit('approve-question', { QuestionID: row.QuestionID, ApprovalID: row.ApprovalID })
            }
        },
        denyClicked(row) {
            try {
                initPermissions(() => {
                    if (!(can('approvals.manage') || can('roles.manage') || this.topicPermissionAllowed(row.Topics, 'problem.approvals.manage'))) {
                        try { toastError('You are not authorized to deny items.'); } catch (e) {}
                        return
                    }
                    this.$emit('deny-question', { QuestionID: row.QuestionID, ApprovalID: row.ApprovalID })
                })
            } catch (e) {
                if (!(can('approvals.manage') || can('roles.manage') || this.topicPermissionAllowed(row.Topics, 'problem.approvals.manage'))) {
                    try { toastError('You are not authorized to deny items.'); } catch (ee) {}
                    return
                }
                this.$emit('deny-question', { QuestionID: row.QuestionID, ApprovalID: row.ApprovalID })
            }
        }
    }
    }
</script>
<template>
    <TableList class="solo-table" :column_slot="['question_name','question_difficulty','question_action']">
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
                    <div class="row">
                        <div class="col">
                            <ModalButton
                                :modal_btn_id="`viewProblemModal`"
                                modal_btn_title="View"
                                :auto="false"
                                @click="$emit('view-problem', data.QuestionID)"
                                class="pending_table_view_btn"
                            />
                        </div>
                        <div class="col">
                            <div class="img-btn-bg">
                                <ButtonImg
                                    alt-text="pending check button"
                                    class="pending_table_check_btn"
                                    @click="approveClicked(data)"
                                />
                            </div>
                        </div>
                        <div class="col">
                            <div class="img-btn-bg">
                                <ButtonImg
                                    alt-text="pending deny button"
                                    class="pending_table_deny_btn"
                                    @click="denyClicked(data)"
                                />
                            </div>
                            
                        </div>
                    </div>
                </td>
            </tr>
        </template>
    </TableList>
</template>
