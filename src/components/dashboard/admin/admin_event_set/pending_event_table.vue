<script>
import { ref, computed } from 'vue';
import TableList from '../../../table-list.vue';
import ModalButton from '../../../modal-button.vue';
import ButtonImg from '../../../button-img.vue';
import SearchBarAndSort from '../../../search-bar-and-sort.vue';
import { can } from '../../../../js/permissions.js'
import { toastError } from '../../../Toast.vue'
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
        ButtonImg,
        SearchBarAndSort,
        DateFilter
    },
    setup(props, { emit }) {
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
            ,
            approveClicked: (row) => {
                if (!(can('approvals.manage') || can('roles.manage'))) {
                    try { toastError('You are not authorized to approve items.'); } catch (e) {}
                    return
                }
                emit('approve-event', { EventID: row.EventID, ApprovalID: row.ApprovalID })
            },
            denyClicked: (row) => {
                if (!(can('approvals.manage') || can('roles.manage'))) {
                    try { toastError('You are not authorized to deny items.'); } catch (e) {}
                    return
                }
                emit('deny-event', { EventID: row.EventID, ApprovalID: row.ApprovalID })
            }
        };
    }
}
</script>
<template>
    <TableList class="solo-table" :column_slot="['event_name','event_host','event_date','event_players','event_action']">
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
        <template #event_players>
            <div>
                <p>Participants</p>
            </div>
        </template>
        <template #event_action>
            <div>
                <p>Action</p>
            </div>
        </template>

        <template #content>
            <tr class="solo-table-row" v-for="(data,index) in filteredAndSortedEvents" :key="index">
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
