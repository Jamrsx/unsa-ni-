<script>
import { ref, watch } from 'vue';
import DropdownArray from '../../../dropdown-array.vue';

export default {
    props: {
        blog: {
            type: Object,
            default: () => null
        }
    },
    emits: ['update-blog'],
    components: {
        DropdownArray
    },
    setup(props, { emit }) {
        const title = ref('');
        const content = ref('');
        const thumbnailUrl = ref('');
        const status = ref('draft');
        const contentType = ref('');

        watch(() => props.blog, (newBlog) => {
            if (newBlog) {
                title.value = newBlog.Title || '';
                content.value = newBlog.Content || '';
                thumbnailUrl.value = newBlog.ThumbnailUrl || '';
                status.value = newBlog.Status || 'draft';
                contentType.value = newBlog.ContentType || '';
            }
        }, { immediate: true });

        const handleImageUpload = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    thumbnailUrl.value = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        };

        const handleSubmit = async () => {
            if (!title.value.trim() || !content.value.trim()) {
                alert('Title and content are required');
                return;
            }

            // Determine ownership (props.blog should be present)
            const authorId = props.blog?.AuthorID || props.blog?.AuthorId || props.blog?.author_id || props.blog?.AuthorID
            const currentUserId = window.user?.userId || window.user?.id || null

            try {
                const { ensureCan } = await import('../../../../js/permissions.js')
                // If user has any-edit, allow. Otherwise if owner, check own-edit.
                if (await ensureCan('blog.edit.any')) {
                    emit('update-blog', {
                        BlogID: props.blog.BlogID,
                        Title: title.value,
                        Content: content.value,
                        ThumbnailUrl: thumbnailUrl.value,
                        Status: status.value,
                        ContentType: contentType.value
                    })
                    return
                }

                if (authorId && currentUserId && Number(authorId) === Number(currentUserId)) {
                    if (await ensureCan('blog.edit.own')) {
                        emit('update-blog', {
                            BlogID: props.blog.BlogID,
                            Title: title.value,
                            Content: content.value,
                            ThumbnailUrl: thumbnailUrl.value,
                            Status: status.value,
                            ContentType: contentType.value
                        })
                        return
                    }
                }

                // Not authorized
                const { toastError } = await import('../../../Toast.vue')
                toastError('You are not authorized to update this blog.')
            } catch (e) {
                console.error(e)
                const { toastError } = await import('../../../Toast.vue')
                toastError('Unable to verify permissions')
            }
        };

        return {
            title,
            content,
            thumbnailUrl,
            status,
            contentType,
            handleImageUpload,
            handleSubmit
        };
    }
}
</script>

<template>
    <div class="modal fade" id="editBlogModal" tabindex="-1" aria-labelledby="editBlogModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editBlogModalLabel">Edit Blog</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" v-if="blog">
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
                            <label class="form-label fw-bold">Status</label>
                            <DropdownArray
                                id="EditBlogStatusDropdown"
                                :options="['draft', 'pending_review', 'approved', 'rejected', 'published', 'archived']"
                                v-model="status"
                            />
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <label class="form-label fw-bold">Content *</label>
                            <textarea v-model="content" class="form-control blog-content-textarea" rows="10" placeholder="Write your blog content here..."></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" @click="handleSubmit">Update Blog</button>
                </div>
            </div>
        </div>
    </div>
</template>

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
