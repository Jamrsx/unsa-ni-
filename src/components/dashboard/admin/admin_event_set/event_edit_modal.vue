<template>
    <Modal 
        :modal_id="modalId" 
        :modal_title="modalTitle"
        :close_btn_footer_bool="false"
    >
        <template #content>
            <div class="event-edit-container">
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
                        <div class="thumbnail-preview">
                            <img 
                                :src="thumbnailSrc" 
                                :alt="eventData.EventName || 'Event thumbnail'"
                                class="preview-img"
                                @error="handleImageError"
                            />
                        </div>
                        <input 
                            type="file" 
                            class="form-control"
                            accept="image/*"
                            @change="handleImageUpload"
                        />
                        <small class="form-text text-muted">
                            Upload new image to replace current thumbnail
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
                title="Save Changes"
                alt-text="save changes button"
                @click="handleSubmit"
                class="modal-submit-btn"
            />
        </template>
    </Modal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import Modal from '../../../modal.vue'
import TextField from '../../../text-field.vue'
import DropdownArray from '../../../dropdown-array.vue'
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
            ThumbnailUrl: '',
            RewardPoints: 0,
            RewardLevel: 0,
            Status: '',
            StartsAt: '',
            EndsAt: ''
        })
    }
})

const emit = defineEmits(['update-event'])

const modalTitle = computed(() => `Edit Event: ${props.eventData.EventName || 'Loading...'}`)

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
const imageErrorOccurred = ref(false)

const thumbnailSrc = computed(() => {
    if (imageErrorOccurred.value) {
        return '/asset/event/default.png'
    }
    
    // If there's a preview from file upload, use it
    if (thumbnailPreview.value) {
        return thumbnailPreview.value
    }
    
    // If thumbnail URL exists in database, use it
    if (props.eventData.ThumbnailUrl) {
        return props.eventData.ThumbnailUrl
    }
    
    // Otherwise, construct path from event name
    if (props.eventData.EventName) {
        const filename = props.eventData.EventName.toLowerCase().replace(/\s+/g, '-')
        return `/asset/event/${filename}.png`
    }
    
    return '/asset/event/default.png'
})

// Define formatDateTimeLocal BEFORE watch
const formatDateTimeLocal = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Watch for changes in eventData prop and update formData
watch(() => props.eventData, (newData) => {
    if (newData && newData.EventID) {
        formData.value.eventName = newData.EventName
        formData.value.startsAt = formatDateTimeLocal(newData.StartsAt)
        formData.value.endsAt = formatDateTimeLocal(newData.EndsAt)
        formData.value.rewardPoints = newData.RewardPoints
        formData.value.rewardLevel = newData.RewardLevel
        formData.value.status = newData.Status
            // Include existing thumbnail URL so server keeps it when no new image uploaded
            formData.value.thumbnailUrl = newData.ThumbnailUrl || ''
            // Reset preview and file input when loading new event
            thumbnailPreview.value = null
            imageErrorOccurred.value = false
            formData.value.thumbnailData = null
            formData.value.thumbnailFileName = null
            // Clear the file input element if present (so selecting same file will fire change)
            nextTick(() => {
                try {
                    if (fileInputRef.value) fileInputRef.value.value = ''
                } catch (e) { /* ignore */ }
            })
    }
}, { immediate: true })

const fileInputRef = ref(null)

const handleImageUpload = (event) => {
    const file = (event.target && event.target.files && event.target.files[0]) || null
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = (e) => {
        const dataUrl = e.target?.result || reader.result
        thumbnailPreview.value = dataUrl
        // Store base64 data for upload and clear any existing thumbnailUrl so server knows to use upload
        formData.value.thumbnailData = dataUrl
        formData.value.thumbnailFileName = file.name
        formData.value.thumbnailUrl = ''
        imageErrorOccurred.value = false
    }
    reader.readAsDataURL(file)
}

const handleImageError = (event) => {
    if (!imageErrorOccurred.value) {
        imageErrorOccurred.value = true
    }
}

const handleSubmit = () => {
    // Validate dates
    if (new Date(formData.value.startsAt) >= new Date(formData.value.endsAt)) {
        alert('End date must be after start date')
        return
    }
    
    // Ensure we send existing thumbnailUrl when user didn't upload a new image
    const submitData = {
        eventId: props.eventData.EventID,
        ...formData.value,
        thumbnailUrl: formData.value.thumbnailUrl || props.eventData.ThumbnailUrl || ''
    };
    
    // submitting event update
    
    emit('update-event', submitData)
    
    // Close modal after successful submission
    const modalElement = document.getElementById(props.modalId)
    if (modalElement) {
        const modal = window.bootstrap.Modal.getInstance(modalElement)
        if (modal) {
            modal.hide()
        }
    }
}
</script>

<style scoped>
.event-edit-container {
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
