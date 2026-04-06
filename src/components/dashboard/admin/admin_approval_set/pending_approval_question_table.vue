<script>
import { ref, computed } from 'vue';
import TableList from '../../../table-list.vue';
import ModalButton from '../../../modal-button.vue';
import ButtonImg from '../../../button-img.vue';
import SearchBarAndSort from '../../../search-bar-and-sort.vue';
import DateFilter from '../../../date-filter.vue';
import TextPill from '../../../text-pill.vue';

export default{
    components:{
        TableList,
        ModalButton,
        ButtonImg,
        SearchBarAndSort,
        DateFilter,
        TextPill
    },
    props: {
        rows: {
            type: Array,
            default: () => []
        }
    },
    emits: ['approve-item', 'deny-item', 'view-question'],
    setup(props, { emit }) {
        const searchQuestionName = ref('');
        const sortQuestionName = ref('none');
        const searchAuthor = ref('');
        const sortAuthor = ref('none');
        const filterSubmittedDate = ref('All');

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

        const filteredAndSortedQuestions = computed(() => {
            let filtered = [...(props.rows || [])];

            // Filter by question name
            if (searchQuestionName.value) {
                filtered = filtered.filter(row => 
                    row.question_name?.toLowerCase().includes(searchQuestionName.value.toLowerCase())
                );
            }

            // Filter by author
            if (searchAuthor.value) {
                filtered = filtered.filter(row => 
                    row.author_username?.toLowerCase().includes(searchAuthor.value.toLowerCase())
                );
            }

            // Filter by submitted date
            if (filterSubmittedDate.value && filterSubmittedDate.value !== 'All') {
                filtered = filtered.filter(row => {
                    if (!row.requested_at) return false;
                    const date = new Date(row.requested_at);
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    return dateStr === filterSubmittedDate.value;
                });
            }

            // Apply sorting
            if (sortQuestionName.value !== 'none') {
                filtered = filtered.sort((a, b) => {
                    const nameA = a.question_name?.toLowerCase() || '';
                    const nameB = b.question_name?.toLowerCase() || '';
                    return sortQuestionName.value === 'asc' 
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                });
            } else if (sortAuthor.value !== 'none') {
                filtered = filtered.sort((a, b) => {
                    const nameA = a.author_username?.toLowerCase() || '';
                    const nameB = b.author_username?.toLowerCase() || '';
                    return sortAuthor.value === 'asc' 
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                });
            }

            return filtered;
        });

        const handleView = (questionData) => {
            emit('view-question', questionData);
        };

        const handleApprove = (approval_id) => {
            emit('approve-item', { approval_id, content_type: 'problem' });
        };

        const handleDeny = (approval_id) => {
            emit('deny-item', { approval_id, content_type: 'problem' });
        };

        return {
            searchQuestionName,
            sortQuestionName,
            searchAuthor,
            sortAuthor,
            filterSubmittedDate,
            filteredAndSortedQuestions,
            formatDateTime,
            handleView,
            handleApprove,
            handleDeny
        };
    }
}
</script>
<template>
    <TableList class="solo-table" :column_slot="['question_name','question_author','question_difficulty','question_category','question_submitted','question_status','question_action']">
        <template #question_name>
            <div>
                <p>Question Name</p>
                <SearchBarAndSort 
                    v-model:search="searchQuestionName"
                    v-model:sort="sortQuestionName"
                />
            </div>
        </template>
        <template #question_author>
            <div>
                <p>Author</p>
                <SearchBarAndSort 
                    v-model:search="searchAuthor"
                    v-model:sort="sortAuthor"
                />
            </div>
        </template>
        <template #question_difficulty>
            <div>
                <p>Difficulty</p>
            </div>
        </template>
        <template #question_category>
            <div>
                <p>Category</p>
            </div>
        </template>
        <template #question_submitted>
            <div>
                <p>Submitted Date</p>
                <DateFilter 
                    v-model="filterSubmittedDate"
                />
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
            <tr class="solo-table-row" v-for="(data, index) in filteredAndSortedQuestions" :key="index">
                <td>{{ index + 1 }}. {{ data.question_name }}</td>
                <td>{{ data.author_username || 'Unknown' }}</td>
                <td>{{ data.question_difficulty }}</td>
                <td>N/A</td>
                <td>{{ formatDateTime(data.requested_at) }}</td>
                <td>
                    <TextPill
                        :allowed="['Pending', 'Approved', 'Denied']"
                        :colors="['var(--c_yellowwarning)', 'var(--c_greenmain)', 'var(--c_redwarning)']"
                        :word="data.status || 'Pending'"
                    />
                </td>
                <td>
                    <div class="row">
                        <div class="col">
                            <ModalButton
                                modal_btn_id="viewApprovalQuestionModal"
                                modal_btn_title="View"
                                :auto="false"
                                class="pending_table_view_btn"
                                @click="handleView(data)"
                            />
                        </div>
                        <div class="col">
                            <div class="img-btn-bg">
                                <ButtonImg
                                    alt-text="approve question button"
                                    class="pending_table_check_btn"
                                    @click="handleApprove(data.approval_id)"
                                />
                            </div>
                        </div>
                        <div class="col">
                            <div class="img-btn-bg">
                                <ButtonImg
                                    alt-text="deny question button"
                                    class="pending_table_deny_btn"
                                    @click="handleDeny(data.approval_id)"
                                />
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        </template>
    </TableList>
</template>
