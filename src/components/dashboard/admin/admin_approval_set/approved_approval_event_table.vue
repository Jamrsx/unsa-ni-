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
    emits: ['view-event'],
    setup(props, { emit }) {
        const searchEventName = ref('');
        const sortEventName = ref('none');
        const searchHostName = ref('');
        const sortHostName = ref('none');
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

        return {
            searchEventName,
            sortEventName,
            searchHostName,
            sortHostName,
            filterApprovedDate,
            filteredAndSortedEvents,
            formatDateTime,
            handleView
        };
    }
}
</script>
<template>
    <TableList class="solo-table" :column_slot="['event_name','event_host','event_schedule','event_participants','event_approved','event_approver','event_status','event_action']">
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
        <template #event_approved>
            <div>
                <p>Approved Date</p>
                <DateFilter 
                    v-model="filterApprovedDate"
                />
            </div>
        </template>
        <template #event_approver>
            <div>
                <p>Approved By</p>
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
                                modal_btn_id="viewApprovalEventModal"
                                modal_btn_title="View"
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
