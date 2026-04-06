<template>
  <Modals
    :modal_id="modalId"
    :modal_title="isEditMode ? 'Edit Event' : 'Create New Event'"
    :close_btn_header_bool="true"
  >
    <template #content>
      <form @submit.prevent="handleSubmit" class="event-form">
        <div class="form-group">
          <label class="form-label">Event Name <span class="text-danger">*</span></label>
          <input
            v-model="formData.event_name"
            type="text"
            class="form-control"
            placeholder="Enter event name"
            required
            maxlength="200"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Event Thumbnail</label>
          <div v-if="thumbnailPreview" class="thumbnail-preview mb-2">
            <img :src="thumbnailPreview" alt="Thumbnail preview" class="preview-img" />
          </div>
          <input 
            type="file" 
            class="form-control"
            accept="image/*"
            @change="handleImageUpload"
          />
          <small class="form-text text-muted d-block mt-1">
            If no image is uploaded, default thumbnail will be used from /asset/event/eventname.png
          </small>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">Start Date & Time <span class="text-danger">*</span></label>
              <input
                v-model="formData.starts_at"
                type="datetime-local"
                class="form-control"
                required
              />
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">End Date & Time <span class="text-danger">*</span></label>
              <input
                v-model="formData.ends_at"
                type="datetime-local"
                class="form-control"
                required
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Reward Points</label>
          <input
            v-model.number="formData.reward_points"
            type="number"
            class="form-control"
            placeholder="Enter reward points"
            :min="0"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Reward Level</label>
          <input
            v-model.number="formData.reward_level"
            type="number"
            class="form-control"
            placeholder="Enter reward level"
            :min="0"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Status</label>
          <select v-model="formData.status" class="form-control">
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div v-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>
      </form>
    </template>

    <template #modal_footer>
      <button
        type="button"
        class="btn btn-secondary"
        data-bs-dismiss="modal"
        :disabled="loading"
      >
        Cancel
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click="handleSubmit"
        :disabled="loading || !isFormValid"
      >
        <span v-if="loading">
          <span class="spinner-border spinner-border-sm me-2"></span>
          {{ isEditMode ? 'Updating...' : 'Creating...' }}
        </span>
        <span v-else>
          {{ isEditMode ? 'Update Event' : 'Create Event' }}
        </span>
      </button>
    </template>
  </Modals>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Modals from '../../../modal.vue'
import { toastError } from '../../../Toast.vue'

const props = defineProps({
  modalId: {
    type: String,
    required: true
  },
  event: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'close'])

const isEditMode = computed(() => !!props.event)

const thumbnailPreview = ref(null)

const formData = ref({
  event_name: '',
  thumbnail_data: null,
  thumbnail_file_name: null,
  starts_at: '',
  ends_at: '',
  reward_points: 0,
  reward_level: 0,
  status: 'upcoming'
})

const errorMessage = ref('')

const normalizeThumb = (path) => {
  if (!path) return null
  if (typeof path !== 'string') return null
  if (path.startsWith('http')) return path
  return '/' + path.replace(/^\//, '')
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      thumbnailPreview.value = e.target.result
      formData.value.thumbnail_data = e.target.result
      formData.value.thumbnail_file_name = file.name
    }
    reader.readAsDataURL(file)
  }
}

// Format datetime for input (YYYY-MM-DDTHH:mm)
function formatDateTimeLocal(dateStr) {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (e) {
    return ''
  }
}

// Populate form when editing
watch(() => props.event, (newEvent) => {
  if (newEvent) {
    formData.value = {
      event_name: newEvent.EventName || newEvent.event_name || '',
      thumbnail_data: null,
      thumbnail_file_name: null,
      starts_at: formatDateTimeLocal(newEvent.StartsAt || newEvent.starts_at),
      ends_at: formatDateTimeLocal(newEvent.EndsAt || newEvent.ends_at),
      reward_points: newEvent.RewardPoints || newEvent.reward_points || 0,
      reward_level: newEvent.RewardLevel || newEvent.reward_level || 0,
      status: newEvent.Status || newEvent.status || 'upcoming'
    }
    const existingThumb = newEvent.ThumbnailUrl || newEvent.thumbnail_url || newEvent.thumbnailUrl
    thumbnailPreview.value = normalizeThumb(existingThumb)
  } else {
    resetForm()
  }
}, { immediate: true })

const isFormValid = computed(() => {
  return formData.value.event_name?.trim() &&
         formData.value.starts_at &&
         formData.value.ends_at
})

function resetForm() {
  formData.value = {
    event_name: '',
    thumbnail_data: null,
    thumbnail_file_name: null,
    starts_at: '',
    ends_at: '',
    reward_points: 0,
    reward_level: 0,
    status: 'upcoming'
  }
  thumbnailPreview.value = null
  errorMessage.value = ''
}

function handleSubmit() {
  if (!isFormValid.value) {
    errorMessage.value = 'Please fill in all required fields'
    return
  }

  // Validate dates
  const startDate = new Date(formData.value.starts_at)
  const endDate = new Date(formData.value.ends_at)

  if (startDate >= endDate) {
    errorMessage.value = 'End date must be after start date'
    return
  }

  errorMessage.value = ''
  
  const payload = {
    event_name: formData.value.event_name,
    starts_at: new Date(formData.value.starts_at).toISOString(),
    ends_at: new Date(formData.value.ends_at).toISOString(),
    reward_points: formData.value.reward_points,
    reward_level: formData.value.reward_level,
    status: formData.value.status,
    thumbnail_data: formData.value.thumbnail_data,
    thumbnail_file_name: formData.value.thumbnail_file_name,
    event_id: props.event?.event_id || props.event?.EventID,
    // Preserve the existing thumbnail URL when editing if no new
    // file is uploaded so the backend does not clear it.
    thumbnail_url: props.event?.ThumbnailUrl || props.event?.thumbnail_url || props.event?.thumbnailUrl || null
  }

  emit('submit', payload)
}

// Expose reset for parent component
defineExpose({ resetForm })
</script>

<style scoped>
.event-form {
  padding: 0;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
  font-size: 14px;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.text-danger {
  color: #dc3545;
}

.text-muted {
  color: #6c757d;
  font-size: 12px;
}

.alert {
  padding: 0.75rem 1rem;
  margin-top: 1rem;
  margin-bottom: 0;
  border-radius: 4px;
}

.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

.row {
  display: flex;
  margin-left: -0.5rem;
  margin-right: -0.5rem;
}

.col-md-6 {
  flex: 0 0 50%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

@media (max-width: 768px) {
  .col-md-6 {
    flex: 0 0 100%;
  }
}
</style>
