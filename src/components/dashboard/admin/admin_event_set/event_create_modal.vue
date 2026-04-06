<template>
    <Modal 
        :modal_id="modalId" 
        modal_title="Create New Event"
        :close_btn_footer_bool="false"
        :requireAnyPermissions="requireAnyPermissions"
    >
        <template #content>
            <div class="event-create-container">
                <form @submit.prevent="handleSubmit">
                    <TextField
                        label="Event Name"
                        name="event_name"
                        v-model="formData.eventName"
                        placeholder="Enter event name"
                        required
                    />
                    
                    <div class="form-group">
                        <label>Event Thumbnail</label>
                        <div v-if="thumbnailPreview" class="thumbnail-preview">
                            <img :src="thumbnailPreview" alt="Thumbnail preview" class="preview-img" />
                        </div>
                        <input 
                            type="file" 
                            class="form-control"
                            accept="image/*"
                            @change="handleImageUpload"
                        />
                        <small class="form-text text-muted">
                            If no image is uploaded, default thumbnail will be used from /asset/event/eventname.png
                        </small>
                    </div>
                    
                    <div class="form-group">
                        <label>Start Date & Time</label>
                        <input 
                            type="datetime-local" 
                            class="form-control"
                            v-model="formData.startsAt"
                            required
                        />
                    </div>
                    
                    <div class="form-group">
                        <label>End Date & Time</label>
                        <input 
                            type="datetime-local" 
                            class="form-control"
                            v-model="formData.endsAt"
                            required
                        />
                    </div>
                    
                    <TextField
                        label="Reward Points"
                        name="reward_points"
                        type="number"
                        v-model="formData.rewardPoints"
                        placeholder="Enter reward points"
                        :min="0"
                        required
                    />
                    
                    <TextField
                        label="Reward Level"
                        name="reward_level"
                        type="number"
                        v-model="formData.rewardLevel"
                        placeholder="Enter reward level"
                        :min="0"
                        required
                    />
                    
                    <DropdownArray
                        label="Status"
                        v-model="formData.status"
                        :options="['active', 'upcoming', 'completed', 'cancelled']"
                    />
                </form>
            </div>
        </template>

        <template #modal_footer>
            <ButtonText
                title="Cancel"
                alt-text="cancel button"
                data-bs-dismiss="modal"
                class="modal-cancel-btn"
            />
            <ButtonText
                title="Create Event"
                alt-text="create event button"
                @click="handleSubmit"
                class="modal-submit-btn"
            />
        </template>
    </Modal>
</template>

<script setup>
import { ref } from 'vue'
import Modal from '../../../modal.vue'
import TextField from '../../../text-field.vue'
import DropdownArray from '../../../dropdown-array.vue'
import ButtonText from '../../../button-text.vue'

const props = defineProps({
    modalId: {
        type: String,
        required: true
    },
    requireAnyPermissions: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['create-event'])

const formData = ref({
    eventName: '',
    thumbnailData: null,
    thumbnailFileName: null,
    startsAt: '',
    endsAt: '',
    rewardPoints: 0,
    rewardLevel: 0,
    status: 'upcoming'
})

const thumbnailPreview = ref(null)

const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        // Create preview URL for immediate display
        const reader = new FileReader()
        reader.onload = (e) => {
            thumbnailPreview.value = e.target.result
            // Store base64 data for upload
            formData.value.thumbnailData = e.target.result
            formData.value.thumbnailFileName = file.name
        }
        reader.readAsDataURL(file)
    }
}

const handleSubmit = () => {
    // Validate dates
    if (new Date(formData.value.startsAt) >= new Date(formData.value.endsAt)) {
        alert('End date must be after start date')
        return
    }
    
    // submitting event create
    
    emit('create-event', formData.value)
    
    // Close modal and reset form after successful submission
    const modalElement = document.getElementById(props.modalId)
    if (modalElement) {
        const modal = window.bootstrap.Modal.getInstance(modalElement)
        if (modal) {
            modal.hide()
        }
    }
    
    // Reset form
    formData.value = {
        eventName: '',
        thumbnailData: null,
        thumbnailFileName: null,
        startsAt: '',
        endsAt: '',
        rewardPoints: 0,
        rewardLevel: 0,
        status: 'upcoming'
    }
    thumbnailPreview.value = null
}
</script>

<style scoped>
.event-create-container {
    padding: 1rem;
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

.thumbnail-preview {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #ddd;
}

.preview-img {
    max-width: 100%;
    max-height: 200px;
    width: auto;
    height: auto;
    border-radius: 4px;
    object-fit: contain;
}

.modal-cancel-btn {
    background-color: #6c757d;
    margin-right: 0.5rem;
}

.modal-submit-btn {
    background-color: #007bff;
}
</style>
