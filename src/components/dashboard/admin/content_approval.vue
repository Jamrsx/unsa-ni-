<script>
import Window from '../../window.vue';
import SplitMainWindow from '../../split-main-window.vue';

// Pending Approval Tables
import Pending_approval_event_table from './admin_approval_set/pending_approval_event_table.vue';
import Pending_approval_blog_table from './admin_approval_set/pending_approval_blog_table.vue';
import Pending_approval_question_table from './admin_approval_set/pending_approval_question_table.vue';

// Approved Approval Tables
import Approved_approval_event_table from './admin_approval_set/approved_approval_event_table.vue';
import Approved_approval_blog_table from './admin_approval_set/approved_approval_blog_table.vue';
import Approved_approval_question_table from './admin_approval_set/approved_approval_question_table.vue';

// Draft Question Table
import Draft_question_table from './admin_approval_set/draft_question_table.vue';

// View Modals
import ApprovalEventViewModal from './admin_approval_set/approval_event_view_modal.vue';
import ApprovalBlogViewModal from './admin_approval_set/approval_blog_view_modal.vue';
import ApprovalQuestionViewModal from './admin_approval_set/approval_question_view_modal.vue';

export default{
  components:{
    Window,
    SplitMainWindow,
    
    // Pending tables
    Pending_approval_event_table,
    Pending_approval_blog_table,
    Pending_approval_question_table,
    
    // Approved tables
    Approved_approval_event_table,
    Approved_approval_blog_table,
    Approved_approval_question_table,
    
    // Draft table
    Draft_question_table,
    
    // View modals
    ApprovalEventViewModal,
    ApprovalBlogViewModal,
    ApprovalQuestionViewModal
  }
}
</script>
<template>
    <div class="row d-flex flex-row">
        <!-- Pending Approvals Section (Upper Table) -->
        <section class="approval-section">
            <Window>
                <template #title>Pending Approvals</template>
                <template #content>
                    <SplitMainWindow 
                        :sections="pending_sections" 
                        default-section="pending_event" 
                        :show-label="false"
                        class="top-split-main-window approval-pending-nav"
                    >
                        <!-- Pending Event Table -->
                        <template #pending_event>
                            <Pending_approval_event_table 
                                    :rows="pending_approval_events"
                                    @approve-item="$emit('approve-item', $event)"
                                    @deny-item="$emit('deny-item', $event)"
                                    @view-event="$emit('view-event', $event)"
                                />
                        </template>
                        
                        <!-- Pending Blog Table -->
                        <template #pending_blog>
                            <Pending_approval_blog_table 
                                :rows="pending_approval_blogs"
                                @approve-item="$emit('approve-item', $event)"
                                @deny-item="$emit('deny-item', $event)"
                                @view-blog="$emit('view-blog', $event)"
                            />
                        </template>
                        
                        <!-- Pending Question Table -->
                        <template #pending_question>
                            <Pending_approval_question_table 
                                :rows="pending_approval_problems"
                                @approve-item="$emit('approve-item', $event)"
                                @deny-item="$emit('deny-item', $event)"
                                @view-question="$emit('view-question', $event)"
                            />
                        </template>
                    </SplitMainWindow>
                </template>
            </Window>
        </section>

        <!-- Approved Items Section (Lower Table) -->
        <section class="approval-section">
            <Window>
                <template #title>Approved Items</template>
                <template #content>
                    <SplitMainWindow 
                        :sections="approved_sections" 
                        default-section="approved_event" 
                        :show-label="false"
                        class="top-split-main-window approval-approved-nav"
                    >
                        <!-- Approved Event Table -->
                        <template #approved_event>
                            <Approved_approval_event_table 
                                :rows="approved_approval_events" 
                                @view-event="$emit('view-event', $event)"
                            />
                        </template>
                        
                        <!-- Approved Blog Table -->
                        <template #approved_blog>
                            <Approved_approval_blog_table 
                                :rows="approved_approval_blogs" 
                                @view-blog="$emit('view-blog', $event)"
                            />
                        </template>
                        
                        <!-- Approved Question Table -->
                        <template #approved_question>
                            <Approved_approval_question_table 
                                :rows="approved_approval_problems" 
                                @view-question="$emit('view-question', $event)"
                            />
                        </template>
                    </SplitMainWindow>
                </template>
            </Window>
        </section>

        <!-- Draft Questions Section (Third Table) -->
        <section class="approval-section">
            <Window>
                <template #title>Draft Questions</template>
                <template #content>
                    <Draft_question_table 
                        :rows="draft_questions"
                        @view-question="emit('view-question', $event)"
                    />
                </template>
            </Window>
        </section>
    </div>

    <!-- View Modals -->
    <ApprovalEventViewModal :eventData="currentApprovalEvent" />
    <ApprovalBlogViewModal :blogData="currentApprovalBlog" />
    <ApprovalQuestionViewModal :questionData="currentApprovalQuestion" />
</template>

<script setup>
    import { defineProps, defineEmits } from 'vue';

    // Define props from parent
    const props = defineProps({
        pending_approval_events: Array,
        pending_approval_blogs: Array,
        pending_approval_problems: Array,
        approved_approval_events: Array,
        approved_approval_blogs: Array,
        approved_approval_problems: Array,
        draft_questions: Array,
        currentApprovalEvent: Object,
        currentApprovalBlog: Object,
        currentApprovalQuestion: Object
    });

    // Define emits
    const emit = defineEmits(['approve-item', 'deny-item', 'view-event', 'view-blog', 'view-question']);

    // Navigation sections for pending approvals
    const pending_sections = [
        { id: 'pending_event', name: 'Events' },
        { id: 'pending_blog', name: 'Blogs' },
        { id: 'pending_question', name: 'Problems' }
    ];

    // Navigation sections for approved items
    const approved_sections = [
        { id: 'approved_event', name: 'Events' },
        { id: 'approved_blog', name: 'Blogs' },
        { id: 'approved_question', name: 'Problems' }
    ];

    // Clickable table rows
    document.addEventListener('DOMContentLoaded', function(){
        const rows = document.querySelectorAll('tr[data-href]');
        rows.forEach(row => {
            row.addEventListener('click',function(){
                window.location.href = this.dataset.href;
            });
        });
    });
</script>
