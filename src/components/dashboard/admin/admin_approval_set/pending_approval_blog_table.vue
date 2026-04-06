<script>
import { ref, computed } from 'vue';
import TableList from '../../../table-list.vue';
import ModalButton from '../../../modal-button.vue';
import ButtonImg from '../../../button-img.vue';
import SearchBarAndSort from '../../../search-bar-and-sort.vue';
import DateFilter from '../../../date-filter.vue';
import TextPill from '../../../text-pill.vue';
import { can, initPermissions } from '../../../../js/permissions.js'
import { toastError } from '../../../Toast.vue'

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
    emits: ['approve-item', 'deny-item', 'view-blog'],
    setup(props, { emit }) {
        const searchTitle = ref('');
        const sortTitle = ref('none');
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

        const filteredAndSortedBlogs = computed(() => {
            let filtered = [...(props.rows || [])];

            // Filter by title
            if (searchTitle.value) {
                filtered = filtered.filter(row => 
                    row.blog_title?.toLowerCase().includes(searchTitle.value.toLowerCase())
                );
            }

            // Filter by author
            if (searchAuthor.value) {
                filtered = filtered.filter(row => 
                    row.blog_author?.toLowerCase().includes(searchAuthor.value.toLowerCase())
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
            if (sortAuthor.value !== 'none') {
                filtered = filtered.sort((a, b) => {
                    const nameA = a.blog_author?.toLowerCase() || '';
                    const nameB = b.blog_author?.toLowerCase() || '';
                    return sortAuthor.value === 'asc' 
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                });
            } else if (sortTitle.value !== 'none') {
                filtered = filtered.sort((a, b) => {
                    const titleA = a.blog_title?.toLowerCase() || '';
                    const titleB = b.blog_title?.toLowerCase() || '';
                    return sortTitle.value === 'asc' 
                        ? titleA.localeCompare(titleB)
                        : titleB.localeCompare(titleA);
                });
            }

            return filtered;
        });

        const handleView = (blogData) => {
            emit('view-blog', blogData);
        };

        const handleApprove = (approval_id) => {
            emit('approve-item', { approval_id, content_type: 'blog' });
        };

        const handleDeny = (approval_id) => {
            emit('deny-item', { approval_id, content_type: 'blog' });
        };

        const tryApprove = (approval_id) => {
            if (can('blog.approvals.manage')) {
                handleApprove(approval_id)
                return
            }
            try {
                initPermissions(() => {
                    if (can('blog.approvals.manage')) {
                        handleApprove(approval_id)
                        return
                    }
                    try { toastError('You are not authorized to approve blogs.') } catch (e) {}
                })
            } catch (e) {
                try { toastError('You are not authorized to approve blogs.') } catch (e) {}
            }
        }

        const tryDeny = (approval_id) => {
            if (can('blog.approvals.manage')) {
                handleDeny(approval_id)
                return
            }
            try {
                initPermissions(() => {
                    if (can('blog.approvals.manage')) {
                        handleDeny(approval_id)
                        return
                    }
                    try { toastError('You are not authorized to deny blogs.') } catch (e) {}
                })
            } catch (e) {
                try { toastError('You are not authorized to deny blogs.') } catch (e) {}
            }
        }

        return {
            searchTitle,
            sortTitle,
            searchAuthor,
            sortAuthor,
            filterSubmittedDate,
            filteredAndSortedBlogs,
            formatDateTime,
            handleView,
            handleApprove,
            handleDeny,
            tryApprove,
            tryDeny
        };
    }
}
</script>
<template>
    <TableList class="solo-table" :column_slot="['blog_title','blog_author','blog_category','blog_submitted','blog_status','blog_action']">
        <template #blog_title>
            <div>
                <p>Title</p>
                <SearchBarAndSort 
                    v-model:search="searchTitle"
                    v-model:sort="sortTitle"
                />
            </div>
        </template>
        <template #blog_author>
            <div>
                <p>Author</p>
                <SearchBarAndSort 
                    v-model:search="searchAuthor"
                    v-model:sort="sortAuthor"
                />
            </div>
        </template>
        <template #blog_category>
            <div>
                <p>Category</p>
            </div>
        </template>
        <template #blog_submitted>
            <div>
                <p>Submitted Date</p>
                <DateFilter 
                    v-model="filterSubmittedDate"
                />
            </div>
        </template>
        <template #blog_status>
            <div>
                <p>Status</p>
            </div>
        </template>
        <template #blog_action>
            <div>
                <p>Action</p>
            </div>
        </template>

        <template #content>
            <tr class="solo-table-row" v-for="(data, index) in filteredAndSortedBlogs" :key="index">
                <td>{{ index + 1 }}. {{ data.blog_title }}</td>
                <td>{{ data.blog_author }}</td>
                <td>{{ data.blog_content_type }}</td>
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
                                modal_btn_id="viewApprovalBlogModal"
                                modal_btn_title="View"
                                :auto="false"
                                class="pending_table_view_btn"
                                @click="handleView(data)"
                            />
                        </div>
                        <div class="col">
                            <div class="img-btn-bg">
                                <ButtonImg
                                    alt-text="approve blog button"
                                    class="pending_table_check_btn"
                                    @click="tryApprove(data.approval_id)"
                                />
                            </div>
                        </div>
                        <div class="col">
                            <div class="img-btn-bg">
                                <ButtonImg
                                    alt-text="deny blog button"
                                    class="pending_table_deny_btn"
                                    @click="tryDeny(data.approval_id)"
                                />
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        </template>
    </TableList>
</template>
