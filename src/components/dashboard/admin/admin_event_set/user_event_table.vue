<script>
import { ref, computed } from 'vue';
import TableList from '../../../table-list.vue';
import ModalButton from '../../../modal-button.vue';
import SearchBarAndSort from '../../../search-bar-and-sort.vue';
import DateFilter from '../../../date-filter.vue';

export default{
    props: {
        event_rows: {
            type: Array,
            default: () => []
        }
    },
    components:{
        TableList,
        ModalButton,
        SearchBarAndSort,
        DateFilter
    },
    setup(props) {
        const searchEventName = ref('');
        const sortEventName = ref('none');
        const searchHostName = ref('');
        const sortHostName = ref('none');
        const filterStartDate = ref('All');

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
            // Create a shallow copy to avoid mutating the original array
            let filtered = [...props.event_rows];

            // Filter by event name
            if (searchEventName.value) {
                filtered = filtered.filter(row => 
                    row.EventName?.toLowerCase().includes(searchEventName.value.toLowerCase())
                );
            }

            // Filter by host name
            if (searchHostName.value) {
                filtered = filtered.filter(row => 
                    row.HostName?.toLowerCase().includes(searchHostName.value.toLowerCase())
                );
            }

            // Filter by start date
            if (filterStartDate.value && filterStartDate.value !== 'All') {
                filtered = filtered.filter(row => {
                    if (!row.StartsAt) return false;
                    const date = new Date(row.StartsAt);
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    return dateStr === filterStartDate.value;
                });
            }

            // Apply sorting (host name takes priority if both are active)
            if (sortHostName.value !== 'none') {
                filtered = filtered.sort((a, b) => {
                    const nameA = a.HostName?.toLowerCase() || '';
                    const nameB = b.HostName?.toLowerCase() || '';
                    return sortHostName.value === 'asc' 
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                });
            } else if (sortEventName.value !== 'none') {
                filtered = filtered.sort((a, b) => {
                    const nameA = a.EventName?.toLowerCase() || '';
                    const nameB = b.EventName?.toLowerCase() || '';
                    return sortEventName.value === 'asc' 
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                });
            }

            return filtered;
        });

        return {
            searchEventName,
            sortEventName,
            searchHostName,
            sortHostName,
            filterStartDate,
            filteredAndSortedEvents,
            formatDateRange
        };
    }
}
</script>
<template>
    <TableList class="solo-table" :column_slot="['event_name','event_host','event_date','event_player_limit','event_actions']">
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
                <p>Host Name</p>
                <SearchBarAndSort 
                    v-model:search="searchHostName"
                    v-model:sort="sortHostName"
                />
            </div>
        </template>
        <template #event_date>
            <div>
                <p>Start Date</p>
                <DateFilter 
                    v-model="filterStartDate"
                />
            </div>
        </template>

        <template #event_player_limit>
            <div>
                <p>Participants</p>
            </div>
        </template>

        <template #event_actions>
            <div>
                <p>Action</p>
            </div>
        </template>

        <template #content>
            <tr class="solo-table-row" v-for="(data,index) in filteredAndSortedEvents" :key="index" :data-href=data.EventID>
                <td>{{ index + 1 }}. {{ data.EventName }}</td>
                <td>{{ data.HostName || 'Unknown' }}</td>
                <td>{{ formatDateRange(data.StartsAt, data.EndsAt) }}</td>
                <td>{{ data.ParticipantCount }}</td>
                <td>
                    <div class="row">
                        <div class="col">
                            <ModalButton
                                :modal_btn_id="`viewEventModal`"
                                modal_btn_title="View"
                                :auto="false"
                                @click="$emit('view-event', data.EventID)"
                                class="event_table_view_btn"
                            />
                        </div>
                        <div class="col">
                            <ModalButton
                                :modal_btn_id="`editEventModal`"
                                modal_btn_title="Edit"
                                :auto="false"
                                @click="$emit('edit-event', data.EventID)"
                                class="event_table_edit_btn"
                            />
                        </div>
                        <div class="col">
                            <ModalButton
                                :modal_btn_id="`deleteEventModal`"
                                modal_btn_title="Delete"
                                :auto="false"
                                @click="$emit('delete-event', data.EventID)"
                                class="event_table_delete_btn"
                            />
                        </div>
                    </div>
                    <ModalButton
                        :modal_btn_id="`manageParticipantsModal`"
                        modal_btn_title="Add participants"
                        :auto="false"
                        @click="$emit('manage-participants', data.EventID)"
                        class="event_table_add_participants_btn"
                    />
                </td>
            </tr>
        </template>
    </TableList>
</template>
