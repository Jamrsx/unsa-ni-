<template>
    <div class="modal fade" id="viewApprovalBlogModal" tabindex="-1" aria-labelledby="viewApprovalBlogModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="viewApprovalBlogModalLabel">View Blog Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" v-if="blogData">
                    <!-- Blog Thumbnail -->
                    <div class="row mb-3">
                        <div class="col-12">
                            <img 
                                :src="blogData.blog_thumbnail || '/asset/event/default.png'" 
                                alt="Blog Thumbnail" 
                                class="blog-thumbnail-img"
                                @error="handleImageError"
                            />
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Title:</label>
                            <p>{{ blogData.blog_title || 'N/A' }}</p>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Author:</label>
                            <p>{{ blogData.blog_author || 'Unknown' }}</p>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Published Date:</label>
                            <p>{{ formatDateTime(blogData.blog_date) }}</p>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Content Type:</label>
                            <p>{{ blogData.blog_content_type || 'N/A' }}</p>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Submitted Date:</label>
                            <p>{{ formatDateTime(blogData.requested_at) }}</p>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Status:</label>
                            <div>
                                <TextPill
                                    :allowed="['Pending', 'Approved', 'Denied']"
                                    :colors="['var(--c_yellowwarning)', 'var(--c_greenmain)', 'var(--c_redwarning)']"
                                    :word="blogData.status || 'Pending'"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <!-- Blog Content -->
                    <div class="row mb-3" v-if="blogData.blog_content">
                        <div class="col-12">
                            <label class="form-label fw-bold">Content:</label>
                            <div class="blog-content" v-html="blogData.blog_content"></div>
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

<script>
import TextPill from '../../../text-pill.vue';

export default {
    components: {
        TextPill
    },
    props: {
        blogData: {
            type: Object,
            default: () => ({})
        }
    },
    setup() {
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

        const FALLBACK_THUMB = '/asset/event/default.png';

        const handleImageError = (event) => {
            try {
                const current = (event?.target?.src || '').toString();
                if (!current.includes(FALLBACK_THUMB)) {
                    event.target.onerror = null;
                    event.target.src = FALLBACK_THUMB;
                }
            } catch (e) { /* ignore */ }
        };

        return {
            formatDateTime,
            handleImageError
        };
    }
}
</script>

<style scoped>
.blog-thumbnail-img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
    object-fit: cover;
    display: block;
    margin: 0 auto;
}

.blog-content {
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 5px;
    min-height: 200px;
    max-height: 400px;
    overflow-y: auto;
}
</style>
