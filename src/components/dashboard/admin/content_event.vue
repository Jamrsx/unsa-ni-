<script>
import Window from '../../window.vue';

import SplitMainWindow from '../../split-main-window.vue';

import SearchBarAndSort from '../../search-bar-and-sort.vue';
import DropdownArray from '../../dropdown-array.vue';
import ScrollVerticalCarousel from '../../scroll-vertical-carousel.vue';
import ScrollCard from '../../scroll-card.vue';

import ButtonImage from '../../button-img.vue';
import ButtonText from '../../button-text.vue';
import ScoreLabel from '../../score-label.vue';
import SearchPanel from '../../search-panel.vue';
import TextField from '../../text-field.vue';

import Modals from '../../modal.vue';
import ModalButton from '../../modal-button.vue';

import Global_event_table from './admin_event_set/global_event_table.vue';
import User_event_table from './admin_event_set/user_event_table.vue';
import Pending_event_table from './admin_event_set/pending_event_table.vue';

import EventViewModal from './admin_event_set/event_view_modal.vue';
import EventEditModal from './admin_event_set/event_edit_modal.vue';
import EventCreateModal from './admin_event_set/event_create_modal.vue';
import EventParticipantsModal from './admin_event_set/event_participants_modal.vue';

import { get_event_details } from '../../../js/admin-dashboard.js'
import { can, initPermissions, ensureCan } from '../../../js/permissions.js'
import { toastError } from '../../Toast.vue'

export default{
        emits: ['view-event','edit-event','delete-event','manage-participants','create-event','update-event','approve-event','deny-event','add-participant','remove-participant'],
    props: {
        global_event_rows: {
            type: Array,
            default: () => []
        },
        user_event_rows: {
            type: Array,
            default: () => []
        },
        pending_event_rows: {
            type: Array,
            default: () => []
        },
        currentEvent: {
            type: Object,
            default: () => ({})
        },
        currentParticipants: {
            type: Array,
            default: () => []
        }
    },
    components:{
        Window,

        SplitMainWindow,
        SearchBarAndSort,
        DropdownArray,
        ScrollVerticalCarousel,
        ScrollCard,

        ButtonImage,
        ButtonText,
        ScoreLabel,
        SearchPanel,
        TextField,

        Modals,
        ModalButton,

        // tables
        Global_event_table,
        User_event_table,
        Pending_event_table,

        // modals
        EventViewModal,
        EventEditModal,
        EventCreateModal,
        EventParticipantsModal
    },
    data() {
        return { permsTick: 0 }
    },
    computed: {
        canCreateButton() {
            const _t = this.permsTick
            try { return can('event.create') || can('event.create.*') }
            catch (e) { return false }
        }
    },
    mounted() {
        try { initPermissions(() => { this.permsTick = Date.now() }) } catch (e) {}
        this._permListener = () => { this.permsTick = Date.now() }
        if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('my_permissions_updated', this._permListener)
    },
    beforeUnmount() {
        try { if (this._permListener && typeof window !== 'undefined' && window.removeEventListener) window.removeEventListener('my_permissions_updated', this._permListener) } catch (e) {}
    },
    methods: {
        async handleOpenCreate() {
            try {
                const allowed = await ensureCan('event.create')
                if (!allowed) { toastError('You are not authorized to create events.'); return }
                const el = document.getElementById('createEventModal')
                if (el) {
                    const bs = window.bootstrap?.Modal.getInstance(el) || new window.bootstrap.Modal(el)
                    bs.show()
                }
            } catch (e) { console.error(e); toastError('Unable to verify permissions') }
        },

        // forward after modal validated
        handleCreateEvent(payload) { this.$emit('create-event', payload) },

        handleViewEvent(eventId) { this.$emit('view-event', eventId) },

        async handleEditEvent(eventId) {
            try {
                const eventData = await new Promise((resolve, reject) => {
                    get_event_details(eventId, (d) => { if (!d || !d.event) return reject(new Error('Failed to load event')); resolve(d.event) })
                })
                const hostId = eventData.HostID || eventData.HostId || eventData.host_id || eventData.HostID
                const currentUserId = window.user?.userId || window.user?.id || null

                if (await ensureCan('event.edit.any')) { this.$emit('edit-event', eventId); return }
                if (hostId && currentUserId && Number(hostId) === Number(currentUserId)) {
                    if (await ensureCan('event.edit.own')) { this.$emit('edit-event', eventId); return }
                }

                toastError('You are not authorized to edit this event.')
            } catch (e) { console.error(e); toastError('Unable to verify permissions for editing') }
        },

        async handleDeleteEvent(eventId) {
            try {
                // set global delete candidate so the centralized DeleteConfirmModal can act
                try { window.__deleteCandidate = eventId; window.__deleteCandidateType = 'event' } catch (e) {}

                const eventData = await new Promise((resolve, reject) => {
                    get_event_details(eventId, (d) => { if (!d || !d.event) return reject(new Error('Failed to load event')); resolve(d.event) })
                })
                const hostId = eventData.HostID || eventData.HostId || eventData.host_id || eventData.HostID
                const currentUserId = window.user?.userId || window.user?.id || null

                if (await ensureCan('event.delete.any')) {
                    const el = document.getElementById('deleteConfirmModal')
                    if (el) {
                        const bs = window.bootstrap?.Modal.getInstance(el) || new window.bootstrap.Modal(el)
                        bs.show()
                    }
                    return
                }

                if (hostId && currentUserId && Number(hostId) === Number(currentUserId)) {
                    if (await ensureCan('event.delete.own')) {
                        const el = document.getElementById('deleteConfirmModal')
                        if (el) {
                            const bs = window.bootstrap?.Modal.getInstance(el) || new window.bootstrap.Modal(el)
                            bs.show()
                        }
                        return
                    }
                }

                toastError('You are not authorized to delete this event.')
                try { window.__deleteCandidate = null; window.__deleteCandidateType = null } catch (e) {}
            } catch (e) { console.error(e); toastError('Unable to verify permissions for delete'); try { window.__deleteCandidate = null; window.__deleteCandidateType = null } catch (er) {} }
        },

        async handleManageParticipants(eventId) {
            try {
                const allowed = await ensureCan('event.participants.manage')
                if (!allowed) { toastError('You are not authorized to manage participants.'); return }
                this.$emit('manage-participants', eventId)
            } catch (e) { console.error(e); toastError('Unable to verify permissions for participants') }
        },

        async handleApproveEvent(data) {
            // Level 1 event approval is governed by approvals permissions,
            // not edit-any/own. Align with server-side checks
            // (event.approvals.manage / approvals.manage / roles.manage).
            try {
                const eventId = data?.EventID
                if (!eventId || !data?.ApprovalID) {
                    toastError('Missing event/approval id for approval')
                    return
                }

                const canEventApprovals = await ensureCan('event.approvals.manage')
                const canGlobalApprovals = await ensureCan('approvals.manage')
                const canRoles = await ensureCan('roles.manage')

                if (canEventApprovals || canGlobalApprovals || canRoles) {
                    this.$emit('approve-event', eventId, data.ApprovalID)
                    return
                }

                toastError('You are not authorized to approve this event.')
            } catch (e) { console.error(e); toastError('Unable to verify permissions for approve') }
        },

        async handleDenyEvent(data) {
            try {
                const eventId = data?.EventID
                if (!eventId || !data?.ApprovalID) {
                    toastError('Missing event/approval id for denial')
                    return
                }

                const canEventApprovals = await ensureCan('event.approvals.manage')
                const canGlobalApprovals = await ensureCan('approvals.manage')
                const canRoles = await ensureCan('roles.manage')

                if (canEventApprovals || canGlobalApprovals || canRoles) {
                    this.$emit('deny-event', eventId, data.ApprovalID)
                    return
                }

                toastError('You are not authorized to deny this event.')
            } catch (e) { console.error(e); toastError('Unable to verify permissions for deny') }
        },

        // forward update after modal guard
        handleUpdateEvent(payload) { this.$emit('update-event', payload) }
    }
}
</script>
<template>
    <div class="row d-flex flex-row">
        <section>
            <Window>
            <template #title></template>
            <template #content>
                <!-- top navigation -->
                <SplitMainWindow :sections="event_sections" default-section="global_event" :show-label="false" class="top-split-main-window event_nav">
                    <template #nav-menu-bottom>
                                <ButtonText
                                    title="Create New Event"
                                    altText="event create button"
                                    class="event_table_create_btn"
                                    @click="handleOpenCreate"
                                />
                    </template>
                    <!-- table here -->
                    <template #global_event>
                        <Global_event_table
                            :event_rows="global_event_rows"
                            @view-event="handleViewEvent"
                            @edit-event="handleEditEvent"
                            @delete-event="handleDeleteEvent"
                            @manage-participants="handleManageParticipants"
                        />
                    </template>
                    <template #user_event>
                        <User_event_table
                            :event_rows="user_event_rows"
                            @view-event="handleViewEvent"
                            @edit-event="handleEditEvent"
                            @delete-event="handleDeleteEvent"
                            @manage-participants="handleManageParticipants"
                        />
                    </template>
                    <template #pending_event>
                        <Pending_event_table
                            :event_rows="pending_event_rows"
                            @view-event="handleViewEvent"
                            @approve-event="handleApproveEvent"
                            @deny-event="handleDenyEvent"
                        />
                    </template>
                </SplitMainWindow>
            </template>
            </Window>
        </section>
    </div>

    <!-- Event Modals -->
    <EventViewModal
        modal-id="viewEventModal"
        :eventData="currentEvent"
        :participants="currentParticipants"
    />

    <EventEditModal
        modal-id="editEventModal"
        :eventData="currentEvent"
        @update-event="$emit('update-event', $event)"
    />

    <EventCreateModal
        modal-id="createEventModal"
        @create-event="$emit('create-event', $event)"
    />

    <EventParticipantsModal
        modal-id="manageParticipantsModal"
        :eventData="currentEvent"
        :participants="currentParticipants"
        @add-participant="$emit('add-participant', $event)"
        @remove-participant="$emit('remove-participant', $event)"
    />
</template>

<script setup>
    const event_sections = [
        { id: 'global_event', name: 'Global Event' },
        { id: 'user_event', name: 'My Event' },
        { id: 'pending_event', name: 'Pending Event' }
    ]

    // pressable [data-href] tr's
    // will user property 'data-href' in admin_question_set folder
    document.addEventListener('DOMContentLoaded', function(){
        const rows = document.querySelectorAll('tr[data-href]');
        rows.forEach(row => {
            row.addEventListener('click',function(){
                window.location.href = this.dataset.href;
            });
        });
    });
</script>
