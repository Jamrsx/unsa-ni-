<template>
  <Modals
    :modal_id="modalId"
    :modal_title="isEditMode ? 'Edit Blog' : 'Create New Blog'"
    :close_btn_header_bool="true"
  >
    <template #content>
      <form @submit.prevent="handleSubmit" class="blog-form">
        <div class="form-group">
          <label class="form-label">Blog Title <span class="text-danger">*</span></label>
          <input
            v-model="formData.title"
            type="text"
            class="form-control"
            placeholder="Enter blog title"
            required
            maxlength="200"
          />
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">Thumbnail Image</label>
              <div v-if="thumbnailPreview" class="thumbnail-preview mb-2">
                <img :src="thumbnailPreview" alt="Preview" class="preview-img img-fluid blog-thumbnail-preview" />
              </div>
              <input 
                type="file" 
                class="form-control"
                accept="image/*"
                @change="handleImageUpload"
              />
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">Content Type</label>
              <input
                v-model="formData.content_type"
                type="text"
                class="form-control"
                placeholder="e.g., Article, Tutorial, Announcement"
                maxlength="100"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Blog Content <span class="text-danger">*</span></label>
          <textarea
            v-model="formData.content"
            class="form-control blog-content-textarea"
            rows="15"
            placeholder="Write your blog content here..."
            required
            maxlength="50000"
          ></textarea>
          <small class="text-muted">{{ formData.content?.length || 0 }}/50000 characters</small>
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
          {{ isEditMode ? 'Update Blog' : 'Create Blog' }}
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
  blog: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'close'])

const isEditMode = computed(() => !!props.blog)

const thumbnailPreview = ref(null)

const formData = ref({
  title: '',
  content: '',
  thumbnail_data: null,
  thumbnail_file_name: null,
  content_type: ''
})

const errorMessage = ref('')

const normalizeThumb = (path) => {
  if (!path) return null
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

// Populate form when editing
watch(() => props.blog, (newBlog) => {
  if (newBlog) {
    formData.value = {
      title: newBlog.Title || newBlog.title || newBlog.blog_title || '',
      content: newBlog.Content || newBlog.content || newBlog.blog_content || '',
      thumbnail_data: null,
      thumbnail_file_name: null,
      content_type: newBlog.ContentType || newBlog.content_type || ''
    }
    const existingThumb = newBlog.ThumbnailUrl || newBlog.thumbnail_url || newBlog.thumbnailUrl
    thumbnailPreview.value = normalizeThumb(existingThumb)
  } else {
    resetForm()
  }
}, { immediate: true })

const isFormValid = computed(() => {
  return formData.value.title?.trim() &&
         formData.value.content?.trim()
})

function resetForm() {
  formData.value = {
    title: '',
    content: '',
    thumbnail_data: null,
    thumbnail_file_name: null,
    content_type: ''
  }
  thumbnailPreview.value = null
  errorMessage.value = ''
}

function handleSubmit() {
  if (!isFormValid.value) {
    errorMessage.value = 'Please fill in all required fields'
    return
  }

  if (formData.value.title.trim().length < 3) {
    errorMessage.value = 'Blog title must be at least 3 characters long'
    return
  }

  if (formData.value.content.trim().length < 10) {
    errorMessage.value = 'Blog content must be at least 10 characters long'
    return
  }

  errorMessage.value = ''
  
  const payload = {
    title: formData.value.title.trim(),
    content: formData.value.content.trim(),
    thumbnail_data: formData.value.thumbnail_data,
    thumbnail_file_name: formData.value.thumbnail_file_name,
    content_type: formData.value.content_type,
    blog_id: props.blog?.blog_id || props.blog?.BlogID,
    // Preserve existing thumbnail URL when editing if no new
    // thumbnail is chosen so the backend does not clear it.
    thumbnail_url: props.blog?.ThumbnailUrl || props.blog?.thumbnail_url || props.blog?.thumbnailUrl || null
  }

  emit('submit', payload)
}

// Expose reset for parent component
defineExpose({ resetForm })
</script>

<style scoped>
.blog-form {
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

.content-editor {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 14px;
  line-height: 1.6;
}

.text-danger {
  color: #dc3545;
}

.text-muted {
  color: #6c757d;
  font-size: 12px;
}

.d-block {
  display: block;
}

.mt-1 {
  margin-top: 0.25rem;
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
</style>
