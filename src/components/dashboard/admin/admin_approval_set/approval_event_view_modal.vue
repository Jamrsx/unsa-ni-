<template>
    <Modal 
        modal_id="viewApprovalEventModal" 
        modal_title="View Event Details"
        :close_btn_footer_bool="false"
    >
        <template #content>
            <div class="event-details-container" v-if="eventData">
                <!-- Event Thumbnail -->
                <div class="event-thumbnail-section">
                    <img 
                        :src="thumbnailSrc" 
                        :alt="eventData.event_name || 'Event Thumbnail'"
                        class="event-thumbnail-img"
                        @error="handleImageError"
                    />
                </div>
                
                <!-- Event Information Section -->
                <div class="event-info-section">
                    <TextField
                        label="Event Name"
                        name="event_name"
                        :modelValue="eventData.event_name || 'N/A'"
                        :disabled="true"
                        placeholder="Event Name"
                    />
                    
                    <TextField
                        label="Host"
                        name="host_name"
                        :modelValue="eventData.event_host || 'N/A'"
                        :disabled="true"
                        placeholder="Host Name"
                    />
                    
                    <TextField
                        label="Event Date"
                        name="event_date"
                        :modelValue="formatDateTime(eventData.event_date)"
                        :disabled="true"
                        placeholder="Event Date"
                    />
                    
                    <TextField
                        label="Participants"
                        name="event_players"
                        :modelValue="eventData.event_players || '0'"
                        :disabled="true"
                        placeholder="Participants"
                    />
                    
                    <TextField
                        label="Submitted Date"
                        name="requested_at"
                        :modelValue="formatDateTime(eventData.requested_at)"
                        :disabled="true"
                        placeholder="Submitted Date"
                    />
                    
                    <TextField
                        label="Status"
                        name="status"
                        :modelValue="eventData.status || 'Pending'"
                        :disabled="true"
                        placeholder="Status"
                    />
                </div>
            </div>
        </template>

        <template #modal_footer>
            <ButtonText
                title="Close"
                alt-text="close modal button"
                data-bs-dismiss="modal"
                class="btn-secondary"
            />
        </template>
    </Modal>
</template>

<script>
import Modal from '../../../modal.vue';
import TextField from '../../../text-field.vue';
import ButtonText from '../../../button-text.vue';
import { ref, computed, watch } from 'vue';

export default {
    components: {
        Modal,
        TextField,
        ButtonText
    },
    props: {
        eventData: {
            type: Object,
            default: () => ({})
        }
    },
    setup(props) {
        const imageErrorOccurred = ref(false);

        const thumbnailSrc = computed(() => {
            const data = props.eventData || {};

            if (imageErrorOccurred.value) {
                return '/asset/event/default.png';
            }

            // If thumbnail URL exists in database, use it
            if (data.event_thumbnail) {
                return data.event_thumbnail;
            }

            // Otherwise, construct path from event name
            if (data.event_name) {
                const filename = data.event_name.toLowerCase().replace(/\s+/g, '-');
                return `/asset/event/${filename}.png`;
            }

            return '/asset/event/default.png';
        });

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

        const handleImageError = () => {
            imageErrorOccurred.value = true;
        };

        // Reset image error when a new event is loaded into the modal
        watch(
            () => [props.eventData && props.eventData.event_thumbnail, props.eventData && props.eventData.event_name],
            () => { imageErrorOccurred.value = false }
        );

        return {
            formatDateTime,
            handleImageError,
            thumbnailSrc
        };
    }
}
</script>

<style scoped>
.event-details-container {
    padding: 20px;
}

.event-thumbnail-section {
    margin-bottom: 20px;
    text-align: center;
}

.event-thumbnail-img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
    object-fit: cover;
}

.event-info-section {
    display: flex;
    flex-direction: column;
    gap: 15px;
}
</style>
