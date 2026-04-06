<script>
import TableList from '../../../table-list.vue';
import ButtonText from '../../../button-text.vue';
import SearchBarAndSort from '../../../search-bar-and-sort.vue';
import DropdownArray from '../../../dropdown-array.vue';
import TextPill from '../../../text-pill.vue';
import TextValidator from '../../../text-validator.vue';
export default{
    components:{
        TableList,
        ButtonText,
        SearchBarAndSort,
        DropdownArray,
        TextPill,
        TextValidator
    }
}
</script>
<template>
    <TableList class="approval-table" :column_slot="['approval_name','approval_date','approval_status','approval_actions']">
        <template #approval_name>
            <div>
                <p>Name</p>
                <SearchBarAndSort />
            </div>
        </template>
        <template #approval_date>
            <div>
                <p>Date</p>
                <DropdownArray 
                    id="EventDateDropdown"
                    :options="['Date', 'Date', 'Date']"
                    modelValue="Date"
                    v-model="blog_date_dropdown"
                />
            </div>
        </template>
        <template #approval_status>
            <div>
                <p>Status</p>
            </div>
        </template>
        <template #approval_actions>
            <div>
                <p>Action</p>
            </div>
        </template>

        <template #content>
            <tr class="approval-table-row" v-for="(data,index) in approval_queue_rows" :key="index">
                <td>
                    <div class="row row_approval_detail">
                        <div class="col">{{ data.ApprovalType }}</div>
                        <div class="col row">
                            <div class="col">
                                <p>{{ data.ApprovalName }}</p>
                            </div>
                            <div class="col">
                                <p>by {{ data.ApprovalUser }}</p>
                                <p>{{ eventStatus(data.ApprovalEventStartTime, data.ApprovalEventEndTime) }}</p>
                                <p>{{ eventPlayerLimit(data.ApprovalPlayerLimit) }}</p>
                            </div>
                        </div>
                    </div>
                </td>
                <td>{{ data.ApprovalDate }}</td>
                <td>
                    <TextPill
                        :allowed="['Pending','Denied','Approved']"
                        :colors="['var(--c_redwarning)', 'var(--c_slightlightcoding)', 'var(--c_slightlightcoding)']"
                        :word=data.ApprovalStatus
                    />
                </td>
                <td>
                    <div class="row row_approval_action">
                        <div class="col">
                            <ButtonText
                                title="View"
                                altText="view approval queue button"
                                link="/"
                                class="approval_queue_table_view_btn"
                            />
                        </div>
                        <div class="col">
                            <ButtonText
                                title="Approve"
                                altText="Approve approval queue button"
                                link="/"
                                class="approval_queue_table_aprove_btn"
                                @click.prevent="handleApprove(data)"
                            />
                        </div>
                        <div class="col">
                            <ButtonText
                                title="Request Edit"
                                altText="Request edit approval queue button"
                                link="/"
                                class="approval_queue_table_request_edit_btn"
                            />
                        </div>
                        <div class="col">
                            <ButtonText
                                title="Reject"
                                altText="Reject approval queue button"
                                link="/"
                                class="approval_queue_table_reject_btn"
                                @click.prevent="handleDeny(data)"
                            />
                        </div>
                    </div>
                </td>
            </tr>
        </template>
    </TableList>
</template>
<script setup>
    import { toastSuccess, toastError } from '../../../../components/Toast.vue';
    import { approve_question, deny_question } from '../../../../js/admin-dashboard.js';

    const approval_queue_rows = [
        // ApprovalDate means when this was queue for approval... not the event start time and end time
        {ApprovalType: 'Event', ApprovalName: 'Algorithim 2025', ApprovalUser:'username', ApprovalEventStartTime: '2025-11-11', ApprovalEventEndTime: '2025-11-17', ApprovalPlayerLimit: '10', ApprovalDate: 'November 15, 2025', ApprovalStatus:'Pending'},
        {ApprovalType: 'Blog', ApprovalName: 'Articles about Lorem Ipsum', ApprovalUser:'username', ApprovalEventStartTime: '', ApprovalEventEndTime: '', ApprovalPlayerLimit: '', ApprovalDate: 'November 15, 2025', ApprovalStatus:'Pending'},
        {ApprovalType: 'Blog', ApprovalName: 'Articles about Lorem Ipsum', ApprovalUser:'username', ApprovalEventStartTime: '', ApprovalEventEndTime: '', ApprovalPlayerLimit: '', ApprovalDate: 'November 16, 2025', ApprovalStatus:'Denied'}
    ]

    function eventStatus(startDate, endDate) {
        const today = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        const day = 1000 * 60 * 60 * 24;

        const daysToStart = Math.ceil((start - today) / day);       // positive = not started yet
        const daysFromStart = Math.floor((today - start) / day);    // if started
        const eventDuration = Math.ceil((end - start) / day);       // total event length
        const daysRemaining = Math.ceil((end - today) / day);       // before event ends

        // Status Conditions
        if(startDate && endDate){
            if (daysToStart > 0) {
                return `Starts in ${daysToStart} day${daysToStart>1?'s':''} (${eventDuration} day${eventDuration>1?'s':''} event)`;
            }
            else if (today >= start && today <= end) {
                return `Event ongoing (${daysRemaining} day${daysRemaining>1?'s':''} remaining)`;
            }
            else {
                return `Event ended (${eventDuration} day${eventDuration>1?'s':''} event)`;
            }
        }   
    }

    function eventPlayerLimit(PlayerLimitValue){
        return PlayerLimitValue ? 'Player/s limited to '+PlayerLimitValue : '';
    }

    // approve / deny handlers for action buttons
    function handleApprove(data) {
        try {
            const approvalId = data.ApprovalID || data.approval_id || data.ApprovalId || data.approvalid || data.approvalID;
            const questionId = data.ContentItemID || data.content_item_id || data.contentItemId || data.content_item || data.content_item_id;
            approve_question(approvalId, approvalId);
            toastSuccess('Approval request sent');
        } catch (e) {
            console.error('approve action failed', e);
            toastError('Failed to send approve');
        }
    }

    function handleDeny(data) {
        try {
            const approvalId = data.ApprovalID || data.approval_id || data.ApprovalId || data.approvalid || data.approvalID;
            deny_question(approvalId, approvalId, 'Rejected by admin');
            toastSuccess('Deny request sent');
        } catch (e) {
            console.error('deny action failed', e);
            toastError('Failed to send deny');
        }
    }

</script>
