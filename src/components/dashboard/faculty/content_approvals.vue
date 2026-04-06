<template>
  <div class="content-approvals">
    <!-- Pending Approvals Section -->
    <div class="content-approvals row d-flex flex-row">
      <!-- Pending Approvals -->
      <section class="approval-section">
        <Window>
          <template #title>Pending Approvals</template>
          <template #content>
            <SplitMainWindow
              :sections="pendingSections"
              default-section="pending_event"
              :show-label="false"
              class="top-split-main-window approval-pending-nav"
            >
              <template #pending_event>
                <PendingApprovalEventTable
                  :rows="pendingEvents"
                  :perms="perms"
                  @approve-item="onApprove"
                  @deny-item="onDeny"
                  @view-item="onView"
                />
              </template>
              <template #pending_blog>
                <PendingApprovalBlogTable
                  :rows="pendingBlogs"
                  :perms="perms"
                  @approve-item="onApprove"
                  @deny-item="onDeny"
                  @view-item="onView"
                />
              </template>
              <template #pending_problem>
                <PendingApprovalProblemTable
                  :rows="pendingProblems"
                  :perms="perms"
                  @approve-item="onApprove"
                  @deny-item="onDeny"
                  @view-item="onView"
                />
              </template>
            </SplitMainWindow>
          </template>
        </Window>
      </section>

      <!-- Approved Items -->
      <section class="approval-section">
        <Window>
          <template #title>Approved Items</template>
          <template #content>
            <SplitMainWindow
              :sections="approvedSections"
              default-section="approved_event"
              :show-label="false"
              class="top-split-main-window approval-approved-nav"
            >
              <template #approved_event>
                <ApprovedApprovalEventTable
                  :rows="approvedEvents"
                  @view-item="onView"
                />
              </template>
              <template #approved_blog>
                <ApprovedApprovalBlogTable
                  :rows="approvedBlogs"
                  @view-item="onView"
                />
              </template>
              <template #approved_problem>
                <ApprovedApprovalProblemTable
                  :rows="approvedProblems"
                  @view-item="onView"
                />
              </template>
            </SplitMainWindow>
          </template>
        </Window>
      </section>
    </div>

    <!-- Local view modal so approvals "View" does not navigate away -->
    <Modals
      modal_id="faculty-approval-view-modal"
      modal_title="Approval Details"
      :close_btn_header_bool="true"
      :close_btn_footer_bool="false"
    >
      <template #content>
        <div v-if="selectedApproval">
          <div v-if="viewData.type === 'event'" class="p-2">
            <h5 class="mb-3">Event</h5>
            <p><strong>Name:</strong> {{ viewData.name }}</p>
            <p><strong>Host:</strong> {{ viewData.host || 'Unknown' }}</p>
            <p><strong>Status:</strong> {{ viewData.status }}</p>
            <p><strong>Starts At:</strong> {{ formatDate(viewData.starts_at) }}</p>
            <p><strong>Ends At:</strong> {{ formatDate(viewData.ends_at) }}</p>
            <p><strong>Reward Points:</strong> {{ viewData.reward_points }}</p>
            <p><strong>Reward Level:</strong> {{ viewData.reward_level }}</p>
            <p v-if="viewData.description"><strong>Description:</strong> {{ viewData.description }}</p>
          </div>

          <div v-else-if="viewData.type === 'blog'" class="p-2">
            <h5 class="mb-3">Blog</h5>
            <p><strong>Title:</strong> {{ viewData.title }}</p>
            <p><strong>Author:</strong> {{ viewData.author }}</p>
            <p><strong>Content Type:</strong> {{ viewData.content_type }}</p>
            <p><strong>Published At:</strong> {{ formatDate(viewData.published_at) }}</p>
            <p><strong>Last Updated:</strong> {{ formatDate(viewData.updated_at) }}</p>
            <div class="mt-3">
              <p class="mb-1"><strong>Content:</strong></p>
              <div class="border p-2" v-html="viewData.content"></div>
            </div>
          </div>

          <div v-else-if="viewData.type === 'problem'" class="p-2">
            <h5 class="mb-3">Problem</h5>
            <p><strong>Name:</strong> {{ viewData.name }}</p>
            <p><strong>Difficulty:</strong> {{ viewData.difficulty }}</p>
            <p><strong>Time Limit (s):</strong> {{ viewData.time_limit_seconds }}</p>
            <p><strong>Memory Limit (MB):</strong> {{ viewData.memory_limit_mb }}</p>
            <div class="mt-3" v-if="viewData.description">
              <p class="mb-1"><strong>Description:</strong></p>
              <div class="border p-2">{{ viewData.description }}</div>
            </div>
          </div>

          <div v-else class="p-3 text-center text-muted">
            Unsupported approval type.
          </div>
        </div>
        <div v-else class="text-center text-muted p-3">No approval selected</div>
      </template>
    </Modals>
  </div>
</template>

    <script setup>
      import { computed, ref, onMounted } from 'vue'
    // Backend disabled: do not import or use faculty socket helpers
    // import * as facultySocket from '/js/faculty-socket-helpers.js'
    import { toastError } from '../../Toast.vue'
    import Window from '../../window.vue'
    import SplitMainWindow from '../../split-main-window.vue'

    import PendingApprovalEventTable from './faculty_approval_set/pending_approval_event_table.vue'
    import PendingApprovalBlogTable from './faculty_approval_set/pending_approval_blog_table.vue'
    import PendingApprovalProblemTable from './faculty_approval_set/pending_approval_problem_table.vue'

    import ApprovedApprovalEventTable from './faculty_approval_set/approved_approval_event_table.vue'
    import ApprovedApprovalBlogTable from './faculty_approval_set/approved_approval_blog_table.vue'
    import ApprovedApprovalProblemTable from './faculty_approval_set/approved_approval_problem_table.vue'

    const props = defineProps({
      pending_approvals: { type: Array, default: () => [] },
      approved_approvals: { type: Array, default: () => [] },
      current_approval: Object,
      perms: { type: Object, default: () => ({}) },
      socket: Object,
      sessionToken: String
    })

    const loading = ref(false)

    // Initialize faculty socket and fetch pending approvals
    import * as facultySocket from '/js/faculty-socket-helpers.js'

    onMounted(() => {
      try {
        if (props.socket) facultySocket.initSocket(props.socket)
        try {
          facultySocket.getFacultyPendingApprovals({ token_session: props.sessionToken }, (resp) => {
            if (resp && resp.success && Array.isArray(resp.pending)) emit('refresh-pending-approvals', resp.pending)
          })
        } catch (e) { console.warn('facultySocket.getFacultyPendingApprovals failed', e) }
      } catch (e) {}
    })

    // refresh when token changes
    try { /* watch isn't available in this script block, parent may re-render with new props */ } catch (e) {}

    const emit = defineEmits(['view-approval', 'approve', 'deny', 'forward-to-admin', 'refresh-pending-approvals'])

    const pendingSections = [
      { id: 'pending_event', name: 'Events' },
      { id: 'pending_blog', name: 'Blogs' },
      { id: 'pending_problem', name: 'Problems' }
    ]

    const approvedSections = [
      { id: 'approved_event', name: 'Events' },
      { id: 'approved_blog', name: 'Blogs' },
      { id: 'approved_problem', name: 'Problems' }
    ]

    // Normalize approval/change row type so that legacy values like
    // "question"/"questions" and plural table names all resolve to the
    // singular type expected by the filters below.
    const typeOf = (a) => {
      const raw = (a && (a.change_type || a.content_type || a.table_name || '')).toString().toLowerCase()
      if (!raw) return ''

      if (raw === 'question' || raw === 'questions' || raw === 'problem' || raw === 'problems') return 'problem'
      if (raw === 'event' || raw === 'events') return 'event'
      if (raw === 'blog' || raw === 'blogs') return 'blog'

      return raw
    }


    const pendingEvents = computed(() => (props.pending_approvals || []).filter((a) => typeOf(a) === 'event'))
    const pendingBlogs = computed(() => (props.pending_approvals || []).filter((a) => typeOf(a) === 'blog'))
    const pendingProblems = computed(() => (props.pending_approvals || []).filter((a) => typeOf(a) === 'problem'))

    const approvedEvents = computed(() => (props.approved_approvals || []).filter((a) => typeOf(a) === 'event'))
    const approvedBlogs = computed(() => (props.approved_approvals || []).filter((a) => typeOf(a) === 'blog'))
    const approvedProblems = computed(() => (props.approved_approvals || []).filter((a) => typeOf(a) === 'problem'))

    const guard = (allowed, cb) => {
      if (!allowed) {
        toastError('You do not have permission to manage approvals')
        return
      }
      cb()
    }

    const onApprove = (payload) => {
      guard(props.perms?.canManageApprovals, () => {
        // Find the full approval/change row from pending_approvals so
        // the parent can route it through the correct Level 1 flow.
        const id = payload.approval_id || payload.change_id || payload.id
        const approval = (props.pending_approvals || []).find(a =>
          (a.approval_id || a.id || a.change_id) === id
        )
        const row = approval || payload
        if (!row) {
          toastError('Approval not found')
          return
        }
        emit('approve', row)
      })
    }

    const onDeny = (payload) => {
      guard(props.perms?.canManageApprovals, () => {
        const id = payload.approval_id || payload.change_id || payload.id
        const approval = (props.pending_approvals || []).find(a =>
          (a.approval_id || a.id || a.change_id) === id
        )
        const row = approval || payload
        if (!row) {
          toastError('Approval not found')
          return
        }
        // Deny reason is collected by the parent via the shared
        // deny modal; we just forward the row upward.
        emit('deny', row)
      })
    }

    const onView = (payload) => {
      if (!props.perms?.canManageApprovals) {
        toastError('You do not have permission to manage approvals')
        return
      }

      const targetId = payload?.approval_id || payload?.change_id || payload?.content_id || payload?.id || payload
      const findLocal = () => {
        const pool = [
          ...(props.pending_approvals || []),
          ...(props.approved_approvals || [])
        ]
        return pool.find(a => (a.approval_id || a.change_id || a.content_id || a.id) === targetId)
      }

      const target = findLocal()
      if (!target) { toastError('Approval not found'); return }
      // Delegate to the parent so it can re-use the
      // Problems/Events/Blogs view modals for a consistent UX.
      emit('view-approval', target)
    }
    </script>

    <style scoped>
    .content-approvals {
      gap: 20px;
    }

    .approval-section {
      flex: 1;
      margin-bottom: 20px;
    }

    
</style>
