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
    emits: ['approve-item', 'deny-item', 'view-event'],
    setup(props, { emit }) {
        const searchEventName = ref('');
        const sortEventName = ref('none');
        const searchHostName = ref('');
        const sortHostName = ref('none');
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

        const formatDateRange = (startsAt, endsAt) => {
            return `${formatDateTime(startsAt)} - ${formatDateTime(endsAt)}`;
        };

        const filteredAndSortedEvents = computed(() => {
            let filtered = [...(props.rows || [])];

            // Filter by event name
            if (searchEventName.value) {
                filtered = filtered.filter(row => 
                    row.event_name?.toLowerCase().includes(searchEventName.value.toLowerCase())
                );
            }

            // Filter by host name
            if (searchHostName.value) {
                filtered = filtered.filter(row => 
                    row.event_host?.toLowerCase().includes(searchHostName.value.toLowerCase())
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
            if (sortHostName.value !== 'none') {
                filtered = filtered.sort((a, b) => {
                    const nameA = a.event_host?.toLowerCase() || '';
                    const nameB = b.event_host?.toLowerCase() || '';
                    return sortHostName.value === 'asc' 
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                });
            } else if (sortEventName.value !== 'none') {
                filtered = filtered.sort((a, b) => {
                    const nameA = a.event_name?.toLowerCase() || '';
                    const nameB = b.event_name?.toLowerCase() || '';
                    return sortEventName.value === 'asc' 
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                });
            }

            return filtered;
        });

        const handleView = (eventData) => {
            emit('view-event', eventData);
        };

        const handleApprove = (approval_id) => {
            emit('approve-item', { approval_id, content_type: 'event' });
        };

        const handleDeny = (approval_id) => {
            emit('deny-item', { approval_id, content_type: 'event' });
        };

        return {
            searchEventName,
            sortEventName,
            searchHostName,
            sortHostName,
            filterSubmittedDate,
            filteredAndSortedEvents,
            formatDateTime,
            formatDateRange,
            handleView,
            handleApprove,
            handleDeny
        };
    }
}
</script>
<template>
    <TableList class="solo-table" :column_slot="['event_name','event_host','event_schedule','event_participants','event_submitted','event_status','event_action']">
        <template #event_name>
            <div>
                <p>Event Name</p>
                <SearchBarAndSort 
                    v-model:search="searchEventName"
                    v-model:sort="sortEventName"
                />
            </div>
        </template>
        <template #event_host>
            <div>
                <p>Host</p>
                <SearchBarAndSort 
                    v-model:search="searchHostName"
                    v-model:sort="sortHostName"
                />
            </div>
        </template>
        <template #event_schedule>
            <div>
                <p>Event Schedule</p>
            </div>
        </template>
        <template #event_participants>
            <div>
                <p>Max Participants</p>
            </div>
        </template>
        <template #event_submitted>
            <div>
                <p>Submitted Date</p>
                <DateFilter 
                    v-model="filterSubmittedDate"
                />
            </div>
        </template>
        <template #event_status>
            <div>
                <p>Status</p>
            </div>
        </template>
        <template #event_action>
            <div>
                <p>Action</p>
            </div>
        </template>

        <template #content>
            <tr class="solo-table-row" v-for="(data, index) in filteredAndSortedEvents" :key="index">
                <td>{{ index + 1 }}. {{ data.event_name }}</td>
                <td>{{ data.event_host }}</td>
                <td>{{ formatDateTime(data.event_date) }}</td>
                <td>{{ data.event_players }}</td>
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
                                modal_btn_id="viewApprovalEventModal"
                                modal_btn_title="View"
                                :auto="false"
                                class="pending_table_view_btn"
                                @click="handleView(data)"
                            />
                        </div>
                        <div class="col">
                            <div class="img-btn-bg">
                                <ButtonImg
                                    alt-text="approve event button"
                                    class="pending_table_check_btn"
                                    @click="handleApprove(data.approval_id)"
                                />
                            </div>
                        </div>
                        <div class="col">
                            <div class="img-btn-bg">
                                <ButtonImg
                                    alt-text="deny event button"
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
