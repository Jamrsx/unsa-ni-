<script>
import { ref, watch, computed } from 'vue';
import TextPill from '../../../text-pill.vue';

export default {
    props: {
        blog: {
            type: Object,
            default: () => null
        }
    },
    components: {
        TextPill
    },
    setup(props) {
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

        const imageErrorOccurred = ref(false);

        const FALLBACK_THUMB = '/asset/event/default.png';

        const thumbnailSrc = computed(() => {
            if (imageErrorOccurred.value) return FALLBACK_THUMB;
            const thumb = props.blog?.ThumbnailUrl || props.blog?.thumbnail_url || '';
            if (!thumb) return FALLBACK_THUMB;
            return thumb.startsWith('/') ? thumb : `/${thumb}`;
        });

        const handleImageError = (event) => {
            imageErrorOccurred.value = true;
            try {
                const current = (event?.target?.src || '').toString();
                if (!current.includes(FALLBACK_THUMB)) {
                    event.target.onerror = null;
                    event.target.src = FALLBACK_THUMB;
                }
            } catch (e) {}
        };

        return {
            formatDateTime,
            thumbnailSrc,
            handleImageError
        };
    }
}
</script>

<template>
    <div class="modal fade" id="viewBlogModal" tabindex="-1" aria-labelledby="viewBlogModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="viewBlogModalLabel">View Blog</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" v-if="blog">
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <img :src="thumbnailSrc" alt="Blog Thumbnail" class="img-fluid blog-thumbnail" @error="handleImageError" />
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Title:</label>
                            <p>{{ blog.Title }}</p>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Author:</label>
                            <p>{{ blog.AuthorName || 'Unknown' }}</p>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Published Date:</label>
                            <p>{{ formatDateTime(blog.PublishedAt) }}</p>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Last Updated:</label>
                            <p>{{ formatDateTime(blog.UpdatedAt) }}</p>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Status:</label>
                            <div>
                                <TextPill
                                    :allowed="['draft', 'pending_review', 'approved', 'rejected', 'published', 'archived']"
                                    :colors="['var(--c_lightcoding)', 'var(--c_yellowwarning)', 'var(--c_greenmain)', 'var(--c_redwarning)', 'var(--c_greenmain)', 'var(--c_backgroundcoding)']"
                                    :word="blog.Status"
                                />
                            </div>
                        </div>
                        <div class="col-md-6" v-if="blog.ContentType">
                            <label class="form-label fw-bold">Content Type:</label>
                            <p>{{ blog.ContentType }}</p>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <label class="form-label fw-bold">Content:</label>
                            <div class="blog-content" v-html="blog.Content"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.blog-thumbnail {
    max-height: 300px;
    object-fit: cover;
    border-radius: 8px;
}

.blog-content {
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    min-height: 200px;
    white-space: pre-wrap;
}
</style>
