<script>
import { ref, computed } from 'vue';
import TableList from '../../../table-list.vue';
import ModalButton from '../../../modal-button.vue';
import SearchBarAndSort from '../../../search-bar-and-sort.vue';
import DateFilter from '../../../date-filter.vue';
import TextPill from '../../../text-pill.vue';

export default{
    components:{
        TableList,
        ModalButton,
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
    emits: ['view-blog'],
    setup(props, { emit }) {
        const searchTitle = ref('');
        const sortTitle = ref('none');
        const searchAuthor = ref('');
        const sortAuthor = ref('none');
        const filterApprovedDate = ref('All');

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

            // Filter by approved date
            if (filterApprovedDate.value && filterApprovedDate.value !== 'All') {
                filtered = filtered.filter(row => {
                    if (!row.approved_at) return false;
                    const date = new Date(row.approved_at);
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    return dateStr === filterApprovedDate.value;
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

        return {
            searchTitle,
            sortTitle,
            searchAuthor,
            sortAuthor,
            filterApprovedDate,
            filteredAndSortedBlogs,
            formatDateTime,
            handleView
        };
    }
}
</script>
<template>
    <TableList class="solo-table" :column_slot="['blog_title','blog_author','blog_category','blog_approved','blog_approver','blog_status','blog_action']">
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
        <template #blog_approved>
            <div>
                <p>Approved Date</p>
                <DateFilter 
                    v-model="filterApprovedDate"
                />
            </div>
        </template>
        <template #blog_approver>
            <div>
                <p>Approved By</p>
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
                <td>{{ formatDateTime(data.approved_at) }}</td>
                <td>Admin</td>
                <td>
                    <TextPill
                        :allowed="['Pending', 'Approved', 'Denied']"
                        :colors="['var(--c_yellowwarning)', 'var(--c_greenmain)', 'var(--c_redwarning)']"
                        :word="'Approved'"
                    />
                </td>
                <td>
                    <div class="row">
                        <div class="col">
                            <ModalButton
                                modal_btn_id="viewApprovalBlogModal"
                                modal_btn_title="View"
                                :auto="false"
                                class="approved_table_view_btn"
                                @click="handleView(data)"
                            />
                        </div>
                    </div>
                </td>
            </tr>
        </template>
    </TableList>
</template>
