<template>
    <Modal
        :modal_id="modalId"
        modal_title="Create New Blog"
        :close_btn_footer_bool="false"
        :requireAnyPermissions="requireAnyPermissions"
    >
        <template #content>
            <div class="row mb-3">
                <div class="col-md-12">
                    <label class="form-label fw-bold">Title *</label>
                    <input type="text" v-model="title" class="form-control" placeholder="Enter blog title" />
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Thumbnail Image</label>
                    <input type="file" @change="handleImageUpload" accept="image/*" class="form-control" />
                    <img v-if="thumbnailUrl" :src="thumbnailUrl" alt="Preview" class="img-fluid mt-2 blog-thumbnail-preview" />
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Content Type</label>
                    <input type="text" v-model="contentType" class="form-control" placeholder="e.g., Article, Tutorial, Announcement" />
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-12">
                    <label class="form-label fw-bold">Content *</label>
                    <textarea v-model="content" class="form-control blog-content-textarea" rows="10" placeholder="Write your blog content here..."></textarea>
                </div>
            </div>
        </template>

        <template #modal_footer>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="resetForm">Cancel</button>
            <button type="button" class="btn btn-primary" @click="handleSubmit">Create Blog</button>
        </template>
    </Modal>
</template>

<script setup>
import { ref } from 'vue'
import Modal from '../../../modal.vue'

const props = defineProps({
    modalId: { type: String, default: 'createBlogModal' },
    requireAnyPermissions: { type: Array, default: () => [] }
})

import { ensureCan } from '../../../../js/permissions.js'
import { toastError } from '../../../Toast.vue'

const emit = defineEmits(['create-blog'])

const title = ref('')
const content = ref('')
const thumbnailUrl = ref('')
const contentType = ref('')

const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            thumbnailUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

const resetForm = () => {
    title.value = ''
    content.value = ''
    thumbnailUrl.value = ''
    contentType.value = ''
}

const handleSubmit = async () => {
    if (!title.value.trim() || !content.value.trim()) {
        alert('Title and content are required')
        return
    }

        // submitting blog create

        try {
            const allowed = await ensureCan('blog.create')
            if (!allowed) { toastError('You are not authorized to create a blog.'); return }
        } catch (e) {
            console.error(e); toastError('Unable to verify permissions'); return
        }

        emit('create-blog', {
                Title: title.value,
                Content: content.value,
                ThumbnailUrl: thumbnailUrl.value,
                ContentType: contentType.value
        })

    // Close modal
    const modalElement = document.getElementById(props.modalId)
    if (modalElement) {
        const modal = window.bootstrap.Modal.getInstance(modalElement)
        if (modal) modal.hide()
    }

    resetForm()
}
</script>

<style scoped>
.blog-thumbnail-preview {
    max-height: 200px;
    object-fit: cover;
    border-radius: 8px;
}

.blog-content-textarea {
    font-family: inherit;
    resize: vertical;
}
</style>
