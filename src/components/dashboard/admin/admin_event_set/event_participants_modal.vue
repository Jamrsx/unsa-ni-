<template>
    <Modal 
        :modal_id="modalId" 
        :modal_title="modalTitle"
        :close_btn_footer_bool="false"
    >
        <template #content>
            <div class="participants-manage-container">
                <!-- Current Participants List -->
                <div class="participants-list-section">
                    <h6 class="section-title">Current Participants ({{ participants.length }})</h6>
                    <ScrollVerticalCarousel>
                        <ScrollCard v-for="participant in participants" :key="participant.UserId">
                            <div class="participant-item">
                                <div class="participant-avatar">
                                    <img 
                                        :src="participant.AvatarUrl || '/asset/default-avatar.png'" 
                                        :alt="participant.Username"
                                        class="avatar-img"
                                    />
                                </div>
                                <div class="participant-info">
                                    <h6 class="participant-name">{{ participant.FullName }}</h6>
                                    <p class="participant-username">@{{ participant.Username }}</p>
                                    <p class="participant-email">{{ participant.Email }}</p>
                                </div>
                                <div class="participant-actions">
                                    <ButtonText
                                        title="Remove"
                                        alt-text="remove participant button"
                                        @click="handleRemoveParticipant(participant.UserId)"
                                        class="remove-participant-btn"
                                    />
                                </div>
                            </div>
                        </ScrollCard>
                    </ScrollVerticalCarousel>
                </div>

                <!-- Add Participants Section -->
                <div class="add-participants-section">
                    <h6 class="section-title">Add Participants</h6>
                    <div class="form-group">
                        <label>Search Users</label>
                        <input 
                            type="text" 
                            class="form-control"
                            v-model="searchQuery"
                            placeholder="Search by username or email"
                        />
                    </div>
                    <div class="form-group">
                        <label>Or Add by User ID</label>
                        <div class="input-group">
                            <input 
                                type="number" 
                                class="form-control"
                                v-model="newUserId"
                                placeholder="Enter user ID"
                            />
                            <ButtonText
                                title="Add"
                                alt-text="add participant button"
                                @click="handleAddParticipant"
                                class="add-participant-btn"
                            />
                        </div>
                    </div>
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
import { ref, computed } from 'vue'
import Modal from '../../../modal.vue'
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
            EventName: ''
        })
    },
    participants: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['add-participant', 'remove-participant'])

const modalTitle = computed(() => `Manage Participants: ${props.eventData.EventName || 'Event'}`)

const searchQuery = ref('')
const newUserId = ref(null)

const handleAddParticipant = () => {
    if (newUserId.value) {
        emit('add-participant', {
            eventId: props.eventData.EventID,
            userId: newUserId.value
        })
        newUserId.value = null
    }
}

const handleRemoveParticipant = (userId) => {
    if (confirm('Are you sure you want to remove this participant?')) {
        emit('remove-participant', {
            eventId: props.eventData.EventID,
            userId: userId
        })
    }
}
</script>

<style scoped>
.participants-manage-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.section-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
}

.participants-list-section {
    max-height: 400px;
}

.participant-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background-color: #fff;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    align-items: center;
}

.participant-avatar {
    flex-shrink: 0;
}

.avatar-img {
    width: 50px;
    height: 50px;
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

.participant-actions {
    flex-shrink: 0;
}

.remove-participant-btn {
    background-color: #dc3545;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
}

.add-participants-section {
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
}

.form-control {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.input-group {
    display: flex;
    gap: 0.5rem;
}

.input-group .form-control {
    flex: 1;
}

.add-participant-btn {
    background-color: #28a745;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
}

.modal-close-btn {
    margin-top: 1rem;
}
</style>
