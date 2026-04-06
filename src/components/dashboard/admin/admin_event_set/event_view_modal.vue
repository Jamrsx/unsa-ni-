<template>
    <Modal 
        :modal_id="modalId" 
        :modal_title="modalTitle"
        :close_btn_footer_bool="false"
    >
        <template #content>
            <div class="event-details-container">
                <!-- Event Thumbnail -->
                <div class="event-thumbnail-section">
                    <img 
                        :src="thumbnailSrc" 
                        :alt="eventData.EventName"
                        class="event-thumbnail-img"
                        @error="handleImageError"
                    />
                </div>

                <!-- Event Information Section -->
                <div class="event-info-section">
                    <TextField
                        label="Event Name"
                        name="event_name"
                        :modelValue="eventData.EventName"
                        :disabled="true"
                        placeholder="Event Name"
                    />
                    
                    <TextField
                        label="Host"
                        name="host_name"
                        :modelValue="eventData.HostName"
                        :disabled="true"
                        placeholder="Host Name"
                    />
                    
                    <TextField
                        label="Event Schedule"
                        name="event_schedule"
                        :modelValue="`${eventData.StartsAt} - ${eventData.EndsAt}`"
                        :disabled="true"
                        placeholder="Event Schedule"
                    />
                    
                    <TextField
                        label="Reward Points"
                        name="reward_points"
                        :modelValue="String(eventData.RewardPoints || '')"
                        :disabled="true"
                        placeholder="Reward Points"
                    />
                    
                    <TextField
                        label="Reward Level"
                        name="reward_level"
                        :modelValue="String(eventData.RewardLevel || '')"
                        :disabled="true"
                        placeholder="Reward Level"
                    />
                    
                    <TextField
                        label="Status"
                        name="status"
                        :modelValue="eventData.Status"
                        :disabled="true"
                        placeholder="Status"
                    />
                </div>

                <!-- Participants Section -->
                <div class="participants-section">
                    <h6 class="participants-title">Participants ({{ participants.length }})</h6>
                    <ScrollVerticalCarousel>
                        <ScrollCard v-for="participant in participants" :key="participant.UserId">
                            <div class="participant-card">
                                <div class="participant-avatar">
                                    <img 
                                        :src="normalizeUrl(participant.AvatarUrl, '/asset/default-avatar.png')"
                                        :alt="participant.Username"
                                        class="avatar-img"
                                    />
                                </div>
                                <div class="participant-info">
                                    <h6 class="participant-name">{{ participant.FullName }}</h6>
                                    <p class="participant-username">@{{ participant.Username }}</p>
                                    <p class="participant-email">{{ participant.Email }}</p>
                                    <p class="participant-joined">Joined: {{ formatDate(participant.JoinedAt) }}</p>
                                </div>
                            </div>
                        </ScrollCard>
                    </ScrollVerticalCarousel>
                </div>
            </div>
        </template>

        <template #modal_footer>
            <ButtonText
                title="Close"
                alt-text="close modal button"
                data-bs-dismiss="modal"
                class="modal-close-btn"
            />
        </template>
    </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '../../../modal.vue'
import TextField from '../../../text-field.vue'
import ScrollVerticalCarousel from '../../../scroll-vertical-carousel.vue'
import ScrollCard from '../../../scroll-card.vue'
import ButtonText from '../../../button-text.vue'

const props = defineProps({
    modalId: {
        type: String,
        required: true
    },
    eventData: {
        type: Object,
        default: () => ({
            EventID: 0,
            EventName: '',
            HostName: '',
            ThumbnailUrl: '',
            RewardPoints: 0,
            RewardLevel: 0,
            Status: '',
            StartsAt: '',
            EndsAt: ''
        })
    },
    participants: {
        type: Array,
        default: () => []
    }
})

const modalTitle = computed(() => `View Event: ${props.eventData.EventName || 'Loading...'}`)

const imageErrorOccurred = ref(false)

// Normalize URLs: keep absolute http/data URLs, ensure local paths start with '/'
function normalizeUrl(u, fallback) {
    if (!u) return fallback || '';
    if (typeof u !== 'string') return fallback || '';
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    if (u.startsWith('/')) return u;
    return '/' + u.replace(/^\/+/, '');
}

const thumbnailSrc = computed(() => {
    if (imageErrorOccurred.value) {
        return '/asset/event/default.png'
    }

    if (props.eventData.ThumbnailUrl) {
        return normalizeUrl(props.eventData.ThumbnailUrl, '/asset/event/default.png')
    }

    if (props.eventData.EventName) {
        const filename = props.eventData.EventName.toLowerCase().replace(/\s+/g, '-')
        return `/asset/event/${filename}.png`
    }

    return '/asset/event/default.png'
})

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const handleImageError = (event) => {
    if (!imageErrorOccurred.value) {
        imageErrorOccurred.value = true
    }
}

// Reset image error state when a different event is loaded into the modal
watch(
    () => [props.eventData.EventID, props.eventData.ThumbnailUrl, props.eventData.EventName],
    () => {
        imageErrorOccurred.value = false
    }
)
</script>

<style scoped>
.event-details-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.event-thumbnail-section {
    display: flex;
    justify-content: center;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.event-thumbnail-img {
    max-width: 100%;
    max-height: 300px;
    width: auto;
    height: auto;
    border-radius: 8px;
    object-fit: contain;
    border: 2px solid #007bff;
}

.event-info-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.participants-section {
    padding: 1rem;
}

.participants-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
}

.participant-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background-color: #fff;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    transition: transform 0.2s;
}

.participant-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.participant-avatar {
    flex-shrink: 0;
}

.avatar-img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #007bff;
}

.participant-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.participant-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: #333;
}

.participant-username {
    font-size: 0.9rem;
    color: #007bff;
    margin: 0;
}

.participant-email {
    font-size: 0.85rem;
    color: #666;
    margin: 0;
}

.participant-joined {
    font-size: 0.8rem;
    color: #999;
    margin: 0;
    margin-top: 0.25rem;
}

.modal-close-btn {
    margin-top: 1rem;
}
</style>
