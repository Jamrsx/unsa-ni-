<template>
  <Modals
    :modal_id="modalId"
    :modal_title="'Review Approval Request'"
    :close_btn_header_bool="true"
  >
    <template #content>
      <div class="approval-review" v-if="approval">
        <!-- Content Details -->
        <div class="content-details-section">
          <h6 class="section-title">Content Details</h6>
          
          <div class="detail-row">
            <div class="detail-label">Content Type</div>
            <div class="detail-value">
              <span class="content-type-badge">
                {{ formatContentType(approval.content_type || approval.ContentType) }}
              </span>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Submitted By</div>
            <div class="detail-value">
              {{ approval.submitted_by || approval.SubmittedBy || 'Unknown' }}
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Submitted At</div>
            <div class="detail-value">
              {{ formatDate(approval.submitted_at || approval.SubmittedAt) }}
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Current Status</div>
            <div class="detail-value">
              <span :class="['status-badge', getStatusClass(approval.status || approval.Status)]">
                {{ formatStatus(approval.status || approval.Status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Content Preview -->
        <div class="content-preview-section">
          <h6 class="section-title">Content Preview</h6>
          <div class="preview-box">
            <div v-if="approval.title || approval.Title" class="preview-title">
              {{ approval.title || approval.Title }}
            </div>
            <div v-if="approval.description || approval.Description" class="preview-description">
              {{ truncateText(approval.description || approval.Description, 300) }}
            </div>
            <div v-if="approval.content || approval.Content" class="preview-content">
              {{ truncateText(approval.content || approval.Content, 500) }}
            </div>
          </div>
        </div>

        <!-- Review Action Form -->
        <div class="review-action-section">
          <h6 class="section-title">Review Action</h6>
          
          <div class="action-buttons">
            <button
              type="button"
              class="action-btn approve-btn"
              @click="setAction('approve')"
              :class="{ active: selectedAction === 'approve' }"
              :disabled="loading"
            >
              <i class="bi bi-check-circle"></i> Approve
            </button>
            
            <button
              type="button"
              class="action-btn deny-btn"
              @click="setAction('deny')"
              :class="{ active: selectedAction === 'deny' }"
              :disabled="loading"
            >
              <i class="bi bi-x-circle"></i> Deny
            </button>
            
            <button
              type="button"
              class="action-btn forward-btn"
              @click="setAction('forward')"
              :class="{ active: selectedAction === 'forward' }"
              :disabled="loading"
            >
              <i class="bi bi-arrow-right-circle"></i> Forward to Admin
            </button>
          </div>

          <div v-if="selectedAction" class="action-form">
            <label class="form-label">
              {{ selectedAction === 'approve' ? 'Comment (Optional)' : 'Reason (Required)' }}
              <span v-if="selectedAction !== 'approve'" class="text-danger">*</span>
            </label>
            <textarea
              v-model="reviewComment"
              class="form-control"
              rows="4"
              :placeholder="getCommentPlaceholder()"
              :required="selectedAction !== 'approve'"
              maxlength="1000"
            ></textarea>
            <small class="text-muted">{{ reviewComment.length }}/1000 characters</small>
          </div>

          <div v-if="errorMessage" class="alert alert-danger mt-3">
            {{ errorMessage }}
          </div>
        </div>
      </div>

      <div v-else class="text-center text-muted py-4">
        <p>No approval data available</p>
      </div>
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
          Submitting...
        </span>
        <span v-else>
          Submit Review
        </span>
      </button>
    </template>
  </Modals>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Modals from '../../../modal.vue'

const props = defineProps({
  modalId: {
    type: String,
    required: true
  },
  approval: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['approve', 'deny', 'forward', 'close'])

const selectedAction = ref('')
const reviewComment = ref('')
const errorMessage = ref('')

// Reset form when approval changes
watch(() => props.approval, () => {
  resetForm()
}, { immediate: true })

const isFormValid = computed(() => {
  if (!selectedAction.value) return false
  
  // Approve doesn't require comment
  if (selectedAction.value === 'approve') return true
  
  // Deny and Forward require comment
  return reviewComment.value.trim().length > 0
})

function setAction(action) {
  selectedAction.value = action
  errorMessage.value = ''
}

function getCommentPlaceholder() {
  const placeholders = {
    'approve': 'Add an optional comment about this approval...',
    'deny': 'Please explain why you are denying this submission...',
    'forward': 'Add notes for the admin reviewer...'
  }
  return placeholders[selectedAction.value] || 'Add your comment...'
}

function formatContentType(type) {
  if (!type) return 'N/A'
  const typeMap = {
    'problem': 'Problem',
    'event': 'Event',
    'blog': 'Blog',
    'announcement': 'Announcement'
  }
  return typeMap[type.toLowerCase()] || type
}

function formatStatus(status) {
  if (!status) return 'N/A'
  const statusMap = {
    'pending': 'Pending Review',
    'approved': 'Approved',
    'denied': 'Denied',
    'forwarded': 'Forwarded to Admin'
  }
  return statusMap[status.toLowerCase()] || status
}

function getStatusClass(status) {
  if (!status) return ''
  const classMap = {
    'pending': 'status-pending',
    'approved': 'status-approved',
    'denied': 'status-denied',
    'forwarded': 'status-forwarded'
  }
  return classMap[status.toLowerCase()] || ''
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function resetForm() {
  selectedAction.value = ''
  reviewComment.value = ''
  errorMessage.value = ''
}

function handleSubmit() {
  if (!isFormValid.value) {
    errorMessage.value = 'Please select an action and provide required information'
    return
  }

  if (selectedAction.value !== 'approve' && reviewComment.value.trim().length < 10) {
    errorMessage.value = 'Please provide a more detailed reason (at least 10 characters)'
    return
  }

  errorMessage.value = ''

  const payload = {
    approval_id: props.approval?.approval_id || props.approval?.ApprovalID,
    content_id: props.approval?.content_id || props.approval?.ContentID,
    content_type: props.approval?.content_type || props.approval?.ContentType,
    comment: reviewComment.value.trim() || null,
    action: selectedAction.value
  }

  // Emit specific event based on action
  if (selectedAction.value === 'approve') {
    emit('approve', payload)
  } else if (selectedAction.value === 'deny') {
    emit('deny', payload)
  } else if (selectedAction.value === 'forward') {
    emit('forward', payload)
  }
}

// Expose reset for parent component
defineExpose({ resetForm })
</script>

<style scoped>
.approval-review {
  padding: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.content-details-section,
.content-preview-section,
.review-action-section {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 1rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid #eee;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #555;
  font-size: 13px;
}

.detail-value {
  color: #333;
  font-size: 13px;
}

.content-type-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  background: #667eea;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-approved {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-denied {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-forwarded {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.preview-box {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.preview-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 0.5rem;
  color: #333;
}

.preview-description,
.preview-content {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  white-space: pre-wrap;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 140px;
  padding: 0.75rem 1rem;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.action-btn.active {
  border-color: currentColor;
  box-shadow: 0 0 0 3px currentColor;
  opacity: 0.2;
}

.approve-btn {
  color: #28a745;
}

.approve-btn.active {
  background: #28a745;
  color: white;
  opacity: 1;
}

.deny-btn {
  color: #dc3545;
}

.deny-btn.active {
  background: #dc3545;
  color: white;
  opacity: 1;
}

.forward-btn {
  color: #667eea;
}

.forward-btn.active {
  background: #667eea;
  color: white;
  opacity: 1;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-form {
  margin-top: 1rem;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
  font-size: 13px;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s;
  resize: vertical;
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

.text-center {
  text-align: center;
}

.py-4 {
  padding: 1.5rem 0;
}

.mt-3 {
  margin-top: 1rem;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 0;
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

.me-2 {
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    min-width: 100%;
  }
  
  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
</style>
