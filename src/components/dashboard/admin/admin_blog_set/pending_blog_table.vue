<script>
import { ref, computed } from 'vue';
import TableList from '../../../table-list.vue';
import ModalButton from '../../../modal-button.vue';
import ButtonImg from '../../../button-img.vue';
import SearchBarAndSort from '../../../search-bar-and-sort.vue';
import { can } from '../../../../js/permissions.js'
import { toastError } from '../../../Toast.vue'
import DateFilter from '../../../date-filter.vue';
import TextPill from '../../../text-pill.vue';

export default{
    props: {
        blog_rows: {
            type: Array,
            default: () => []
        }
    },
    emits: ['view-blog','approve-blog','deny-blog'],
    components:{
        TableList,
        ModalButton,
        ButtonImg,
        SearchBarAndSort,
        DateFilter,
        TextPill
    },
    setup(props, { emit }) {
        const searchTitle = ref('');
        const sortTitle = ref('none');
        const searchAuthor = ref('');
        const sortAuthor = ref('none');
        const filterPublishedDate = ref('All');

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
            let filtered = [...props.blog_rows];

            // Filter by title
            if (searchTitle.value) {
                filtered = filtered.filter(row => 
                    row.Title?.toLowerCase().includes(searchTitle.value.toLowerCase())
                );
            }

            // Filter by author
            if (searchAuthor.value) {
                filtered = filtered.filter(row => 
                    row.AuthorName?.toLowerCase().includes(searchAuthor.value.toLowerCase())
                );
            }

            // Filter by published date
            if (filterPublishedDate.value && filterPublishedDate.value !== 'All') {
                filtered = filtered.filter(row => {
                    if (!row.PublishedAt) return false;
                    const date = new Date(row.PublishedAt);
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    return dateStr === filterPublishedDate.value;
                });
            }

            // Apply sorting (author name takes priority if both are active)
            if (sortAuthor.value !== 'none') {
                filtered = filtered.sort((a, b) => {
                    const nameA = a.AuthorName?.toLowerCase() || '';
                    const nameB = b.AuthorName?.toLowerCase() || '';
                    return sortAuthor.value === 'asc' 
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                });
            } else if (sortTitle.value !== 'none') {
                filtered = filtered.sort((a, b) => {
                    const titleA = a.Title?.toLowerCase() || '';
                    const titleB = b.Title?.toLowerCase() || '';
                    return sortTitle.value === 'asc' 
                        ? titleA.localeCompare(titleB)
                        : titleB.localeCompare(titleA);
                });
            }

            return filtered;
        });

        return {
            searchTitle,
            sortTitle,
            searchAuthor,
            sortAuthor,
            filterPublishedDate,
            filteredAndSortedBlogs,
            formatDateTime,
            approveClicked: (row) => {
                if (!(can('approvals.manage') || can('roles.manage'))) {
                    try { toastError('You are not authorized to approve items.'); } catch (e) {}
                    return
                }
                emit('approve-blog', { BlogID: row.BlogID, ApprovalID: row.ApprovalID })
            },
            denyClicked: (row) => {
                if (!(can('approvals.manage') || can('roles.manage'))) {
                    try { toastError('You are not authorized to deny items.'); } catch (e) {}
                    return
                }
                emit('deny-blog', { BlogID: row.BlogID, ApprovalID: row.ApprovalID })
            }
        };
    }
}
</script>
<template>
    <TableList class="solo-table" :column_slot="['blog_title','blog_author','blog_date','blog_status','blog_action']">
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
        <template #blog_date>
            <div>
                <p>Published Date</p>
                <DateFilter 
                    v-model="filterPublishedDate"
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
            <tr class="solo-table-row" v-for="(data,index) in filteredAndSortedBlogs" :key="index">
                <td>{{ index + 1 }}. {{ data.Title }}</td>
                <td>{{ data.AuthorName || 'Unknown' }}</td>
                <td>{{ formatDateTime(data.PublishedAt) }}</td>
                <td>
                    <TextPill
                        :allowed="['draft', 'pending_review', 'approved', 'rejected', 'published', 'archived']"
                        :colors="['var(--c_lightcoding)', 'var(--c_yellowwarning)', 'var(--c_greenmain)', 'var(--c_redwarning)', 'var(--c_greenmain)', 'var(--c_backgroundcoding)']"
                        :word="data.Status"
                    />
                </td>
                <td>
                    <div class="row">
                        <div class="col">
                            <ModalButton
                                :modal_btn_id="`viewBlogModal`"
                                modal_btn_title="View"
                                :auto="false"
                                @click="$emit('view-blog', data.BlogID)"
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
