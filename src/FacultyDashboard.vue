<template>
  <section>
    <Window>
      <template #content>
        <SplitMainWindow v-model:currentSection="current" :sections="sections" default-section="dashboard">
          <!-- nav menu -->
          <template #nav-menu-bottom>
            <ButtonText
              title="Log out"
              class="col split-aside-logout"
              alt-text="logout button"
              @click="showLogoutModal"
            />
          </template>

          <!-- dashboard content -->
          <template #dashboard>
            <content_faculty_dashboard
              :total_users="total_users"
              :total_problems="total_problems"
              :total_events="total_events"
              :total_pending="pending_approvals.length"
            />
          </template>

          <!-- edit account content -->
          <template #edit_account>
            <content_edit_account
              :user_profile_pic="user_profile_pic"
              :user_full_name="user_full_name"
              :user_email="user_email"
              :user_password="user_password"
              :form-submit-method="handleRequestChangeUserAccountProfile"
            />
          </template>

          <!-- users content -->
          <template #users>
            <content_faculty_users
              :user_rows="user_rows"
              :perms="perms"
              :sessionToken="sessionToken"
              :socket="socket"
            />
          </template>

          <!-- problems management -->
          <template #problems>
            <content_faculty_problems
              :problem_rows="problem_rows"
              :sessionToken="sessionToken"
              :perms="perms"
              @view-problem="handleViewProblem"
              @create-problem="handleCreateProblem"
              @edit-problem="handleEditProblem"
              @update-problem="handleUpdateProblem"
              @delete-problem="handleDeleteProblem"
              @approve-question="handleApproveQuestionFromProblems"
              @deny-question="payload => openDenyModal(handleDenyQuestionFromProblems, payload)"
              @refresh-problems="loadProblems"
            />
          </template>

          <!-- events management -->
          <template #events>
            <content_faculty_events
              :event_rows="event_rows"
              :perms="perms"
              :sessionToken="sessionToken"
              @view-event="handleViewEvent"
              @create-event="handleCreateEvent"
              @edit-event="handleEditEvent"
              @update-event="handleUpdateEvent"
              @delete-event="handleDeleteEvent"
              @approve-event="handleApproveEventFromEvents"
              @deny-event="payload => openDenyModal(handleDenyEventFromEvents, payload)"
              @refresh-events="onRefreshEvents"
            />
          </template>

          <!-- blogs management -->
          <template #blogs>
            <content_faculty_blogs
              :blog_rows="blog_rows"
              :currentBlog="currentBlog"
              :perms="perms"
              :sessionToken="sessionToken"
              @view-blog="handleViewBlog"
              @create-blog="handleCreateBlog"
              @edit-blog="handleEditBlog"
              @update-blog="handleUpdateBlog"
              @delete-blog="handleDeleteBlog"
              @approve-blog="handleApproveBlogFromBlogs"
              @deny-blog="payload => openDenyModal(handleDenyBlogFromBlogs, payload)"
              @refresh-blogs="onRefreshBlogs"
            />
          </template>

          <!-- approvals (two-level review system) -->
          <template #approvals>
            <content_faculty_approvals
              :pending_approvals="pending_approvals"
              :approved_approvals="approved_approvals"
              :current_approval="current_approval"
              :perms="perms"
              :sessionToken="sessionToken"
              @view-approval="handleViewApproval"
              @approve="handleApproveChange"
              @deny="payload => openDenyModal(handleDenyChange, payload)"
              @forward-to-admin="handleForwardToAdmin"
              @refresh-pending-approvals="onRefreshPendingApprovals"
            />
          </template>
        </SplitMainWindow>
      </template>
    </Window>
    <!-- Faculty logout confirmation modal -->
    <LogoutModal ref="logoutModalFaculty" modalId="logout-modal-faculty" @confirm="confirmLogout" />

    <!-- Faculty deny reason modal (shared for problems/events/blogs) -->
    <Modals
      modal_id="faculty-deny-reason-modal"
      modal_title="Deny reason"
      :close_btn_header_bool="true"
      :close_btn_footer_bool="false"
    >
      <template #content>
        <div class="p-3">
          <div class="mb-3">
            <label for="faculty-deny-reason-input" class="form-label">Reason for denial</label>
            <textarea
              id="faculty-deny-reason-input"
              v-model="denyReasonText"
              class="form-control"
              rows="3"
              placeholder="Enter a short explanation (optional)"
            ></textarea>
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" @click="onCancelDeny">Cancel</button>
            <button type="button" class="btn btn-danger" @click="onConfirmDeny">Deny</button>
          </div>
        </div>
      </template>
    </Modals>

    <!-- Faculty Approval View Modals (reuse admin approval view components) -->
    <ApprovalEventViewModal :eventData="facultyApprovalEvent" />
    <ApprovalBlogViewModal :blogData="facultyApprovalBlog" />
    <ApprovalQuestionViewModal :questionData="facultyApprovalQuestion" />
  </section>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { io } from 'socket.io-client'
import * as facultySocket from './js/faculty-socket-helpers.js'
import Window from './components/window.vue'
import SplitMainWindow from './components/split-main-window.vue'
import ButtonText from './components/button-text.vue'
import LogoutModal from './components/LogoutModal.vue'
import Modals from './components/modal.vue'
import { logout } from './js/auth.js'

import content_faculty_dashboard from './components/dashboard/faculty/content_dashboard.vue'
import content_edit_account from './components/dashboard/faculty/content_edit_account.vue'
import content_faculty_users from './components/dashboard/faculty/content_users.vue'
import content_faculty_problems from './components/dashboard/faculty/content_problems.vue'
import content_faculty_events from './components/dashboard/faculty/content_events.vue'
import content_faculty_blogs from './components/dashboard/faculty/content_blogs.vue'
import content_faculty_approvals from './components/dashboard/faculty/content_approvals.vue'

// Reuse admin approval view modals so faculty approvals "View" behaves
// like admin approvals without navigating to other sections.
import ApprovalEventViewModal from './components/dashboard/admin/admin_approval_set/approval_event_view_modal.vue'
import ApprovalBlogViewModal from './components/dashboard/admin/admin_approval_set/approval_blog_view_modal.vue'
import ApprovalQuestionViewModal from './components/dashboard/admin/admin_approval_set/approval_question_view_modal.vue'

import { toastSuccess, toastError, toastInfo } from './components/Toast.vue'
import { get_user_account_profile, response_change_user_account_profile_avatar, response_change_user_account_profile } from './js/user-dashboard.js'
import { broadcastAvatarUpdated } from './js/avatar-utils.js'
import { buildAvatarUrl as buildAvatarUrlUtil } from './js/avatar-utils.js'
// Admin approval helpers (used to resolve ApprovalID and trigger approve/deny actions)
import { 
  get_pending_questions, approve_question, deny_question,
  approve_event, deny_event,
  approve_blog, deny_blog
} from './js/admin-dashboard.js'

// Debug: faculty dashboard bundle executed

// ==========================
// Sections for SplitMainWindow
// ==========================
const sections = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'edit_account', name: 'Edit Account' },
  { id: 'users', name: 'Users' },
  { id: 'problems', name: 'Problems' },
  { id: 'events', name: 'Events' },
  { id: 'blogs', name: 'Blogs' },
  { id: 'approvals', name: 'Approvals' }
]

// ==========================
// Reactive variables
// ==========================

// current navigation
const current = ref('dashboard')

// permissions gating
const perms = ref({
  canViewUsers: false,
  canManageUsers: false,
  canManageProblems: false,
  canManageEvents: false,
  canManageBlogs: false,
  canManageApprovals: false
})

// dashboard totals
const total_users = ref(0)
const total_problems = ref(0)
const total_events = ref(0)

// user profile
const user_profile_pic = ref('')
const user_full_name = ref('')
const user_email = ref('')
const user_password = ref('')

// users list
const user_rows = ref([])

// problems list
const problem_rows = ref([])
const currentProblem = ref({
  ProblemID: 0,
  ProblemName: '',
  Difficulty: 'Easy',
  TimeLimitSeconds: 1,
  MemoryLimitMB: 64,
  Description: ''
})
const currentTestCases = ref([])

// events list
const event_rows = ref([])
const currentEvent = ref({
  EventID: 0,
  EventName: '',
  HostName: '',
  ThumbnailUrl: '',
  RewardPoints: 0,
  RewardLevel: 0,
  Status: '',
  StartsAt: '',
  EndsAt: ''
})
const currentParticipants = ref([])

// blogs list
const blog_rows = ref([])
const currentBlog = ref({
  BlogID: 0,
  Title: '',
  AuthorName: '',
  ThumbnailUrl: '',
  Content: '',
  PublishedAt: '',
  UpdatedAt: '',
  Status: '',
  ContentType: ''
})

// approvals (faculty pending changes)
const pending_approvals = ref([])
const approved_approvals = ref([])
const current_approval = ref({})

// Per-type view state for faculty approvals tab modals
// Use empty objects instead of null so admin approval modals
// (which expect an object) don't crash on initial mount.
const facultyApprovalEvent = ref({})
const facultyApprovalBlog = ref({})
const facultyApprovalQuestion = ref({})

// Shared deny-reason modal state
const denyReasonText = ref('')
let pendingDenyHandler = null
let pendingDenyPayload = null

// session token shared with child components for socket helpers
const sessionToken = ref('')

// socket management
let socket = null

// API base helper (dev: hit backend on :3000, prod: same-origin)
const SERVER_URL = (() => {
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3000';
  return 'http://' + h + ':3000';
})();
const apiBase = (typeof window !== 'undefined' && window.location && window.location.port && window.location.port.startsWith('517'))
  ? SERVER_URL
  : ''
const apiUrl = (path) => `${apiBase}${path}`
// token helper: accepts legacy key 'token' and new 'jwt_token'
const getToken = () => localStorage.getItem('jwt_token') || localStorage.getItem('jwt_token') || ''

// logout modal
const logoutModalFaculty = ref(null)

// ===============
// Deny modal helpers
// ===============

function openDenyModal(handler, payload) {
  pendingDenyHandler = handler
  pendingDenyPayload = payload
  denyReasonText.value = ''
  const modalEl = document.getElementById('faculty-deny-reason-modal')
  if (modalEl && window.bootstrap?.Modal) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl)
    modal.show()
  }
}

function closeDenyModal() {
  const modalEl = document.getElementById('faculty-deny-reason-modal')
  if (modalEl && window.bootstrap?.Modal) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl)
    modal.hide()
  }
}

function onCancelDeny() {
  pendingDenyHandler = null
  pendingDenyPayload = null
  denyReasonText.value = ''
  closeDenyModal()
}

function onConfirmDeny() {
  if (!pendingDenyHandler) {
    closeDenyModal()
    return
  }
  // Pass reason through the shared hook used by the deny handlers
  window.facultyDenyReason = denyReasonText.value || 'Denied by faculty'
  const handler = pendingDenyHandler
  const payload = pendingDenyPayload
  pendingDenyHandler = null
  pendingDenyPayload = null
  closeDenyModal()
  try {
    handler(payload)
  } finally {
    // Clear the hook so subsequent denies without modal don't reuse it
    window.facultyDenyReason = null
  }
}

// ==========================
// Helper functions
// ==========================

async function refreshPermissions() {
  // Probe backend for capabilities by attempting lightweight requests.
  const token = getToken()
  sessionToken.value = token
  // Default false
  perms.value = {
    canViewUsers: false,
    canManageUsers: false,
    canManageProblems: false,
    canManageEvents: false,
    canManageBlogs: false,
    canManageApprovals: false
  }
  try {
    // If fetching users succeeds, allow user management
    facultySocket.getFacultyUsers({ token_session: token }, (res) => {
      if (res && res.success) {
        perms.value.canViewUsers = true
        // Treat successful list access as indication that this user
        // can at least manage basic user actions; server will still
        // enforce fine-grained permissions on sensitive operations.
        perms.value.canManageUsers = true
      }
    })
    // Try problems list to infer problem management
    facultySocket.getFacultyProblems({ token_session: token }, (res) => {
      if (res && res.success) perms.value.canManageProblems = true
    })
    // Try events
    facultySocket.getFacultyEvents({ token_session: token }, (res) => {
      if (res && res.success) perms.value.canManageEvents = true
    })
    // Try blogs
    facultySocket.getFacultyBlogs({ token_session: token }, (res) => {
      if (res && res.success) perms.value.canManageBlogs = true
    })
    // Try pending approvals
    facultySocket.getFacultyPendingApprovals({ token_session: token }, (res) => {
      if (res && res.success) perms.value.canManageApprovals = true
    })
  } catch (e) {
    console.warn('[Faculty] refreshPermissions probe failed', e)
  }
}

async function loadDashboard() {
  const token = getToken()
  try {
    facultySocket.getFacultyDashboard({ token_session: token }, (res) => {
      if (res && res.success && res.totals) {
        total_users.value = res.totals.users || 0
        total_problems.value = res.totals.problems || 0
        total_events.value = res.totals.events || 0
      }
    })
  } catch (e) {
    console.warn('[Faculty] loadDashboard failed', e)
  }
}

async function loadPendingApprovals() {
  try {
    const token = sessionToken.value || getToken()
    if (!token) {
      pending_approvals.value = []
      return
    }

    await new Promise((resolve, reject) => {
      try {
        // Use faculty-specific pending approvals; the child approvals
        // component will also refresh via socket and emit updated
        // lists back to this parent.
        facultySocket.getFacultyPendingApprovals({ token_session: token }, (resp) => {
          if (!resp || !resp.success) {
            return reject(new Error(resp?.message || 'Failed to load pending approvals'))
          }

          const pending = Array.isArray(resp.pending) ? resp.pending : []
          pending_approvals.value = pending
          resolve()
        })
      } catch (e) {
        reject(e)
      }
    })
  } catch (e) {
    console.warn('[Faculty] loadPendingApprovals failed', e)
    pending_approvals.value = []
  }
}

async function loadApprovedApprovals() {
  const token = getToken()
  try {
    const url = apiUrl('/api/faculty/approved-items')
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
    const data = await res.json()
    if (data && data.success) approved_approvals.value = data.approved || []
    else approved_approvals.value = []
  } catch (e) {
    console.warn('[Faculty] loadApprovedApprovals failed', e)
    approved_approvals.value = []
  }
}

async function loadUsers() {
  const token = getToken()
  try {
      facultySocket.getFacultyUsers({ token_session: token }, (res) => {
    if (res && res.success) {
      user_rows.value = res.users || []
    } else {
      user_rows.value = []
      if (res && res.message) {
        try { toastError(res.message) } catch (e) {}
      }
    }
      })
  } catch (e) {
    console.warn('[Faculty] loadUsers failed', e)
    user_rows.value = []
  }
}

async function loadProblems() {
  try {
    const token = getToken() || sessionToken.value
    if (!token) return

    const response = await axios.get('/api/problems', {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.data && response.data.success) {
      problem_rows.value = response.data.problems || []
    } else {
      console.warn('[Faculty] loadProblems returned failure', response.data?.message)
      problem_rows.value = []
    }
  } catch (e) {
    console.error('[Faculty] loadProblems REST error', e)
    problem_rows.value = []
  }
}

async function loadEvents() {
  const token = getToken()
  try {
    facultySocket.getFacultyEvents({ token_session: token }, (res) => {
      if (res && res.success) event_rows.value = res.events || []
      else event_rows.value = []
    })
  } catch (e) {
    console.warn('[Faculty] loadEvents failed', e)
    event_rows.value = []
  }
}

async function loadBlogs() {
  const token = getToken()
  try {
    facultySocket.getFacultyBlogs({ token_session: token }, (res) => {
      if (res && res.success) blog_rows.value = res.blogs || []
      else blog_rows.value = []
    })
  } catch (e) {
    console.warn('[Faculty] loadBlogs failed', e)
    blog_rows.value = []
  }
}

// Handlers for child "refresh-*" events. Child components emit updated lists
// so the parent can update its reactive arrays immediately.
function onRefreshEvents(events) {
  event_rows.value = Array.isArray(events) ? events : []
}

function onRefreshBlogs(blogs) {
  blog_rows.value = Array.isArray(blogs) ? blogs : []
}

function onRefreshPendingApprovals(pending) {
  pending_approvals.value = Array.isArray(pending) ? pending : []
}

// buildAvatarUrl centralized in src/js/avatar-utils.js

// Safe JWT decode helper — returns payload object or null
function safeDecodeJWT(token) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (!parts[1]) return null
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(Array.from(atob(b64)).map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
    return JSON.parse(json)
  } catch (e) {
    console.error('[Faculty] safeDecodeJWT failed', e)
    return null
  }
}

function loadProfile() {
  // Reset: do not load profile from backend; leave defaults
  user_full_name.value = ''
  user_email.value = ''
  user_profile_pic.value = ''
}

// Listen for profile changes (including avatar, name, email)
function listenForProfileChanges() {
  response_change_user_account_profile((data) => {
    // profile change received
    if (data && data.avatar_url) {
      const newUrl = buildAvatarUrlUtil(data.avatar_url)
      // updated profile pic
      user_profile_pic.value = newUrl
    }
    if (data && data.full_name) {
      user_full_name.value = data.full_name
    }
    if (data && data.email) {
      user_email.value = data.email
    }
    toastSuccess('Profile updated')
  })

  // Also listen to avatar-specific change event and update preview immediately
  response_change_user_account_profile_avatar((data) => {
    // avatar change received
    if (data && data.avatar_url) {
      const newUrl = buildAvatarUrlUtil(data.avatar_url)
      // avatar-specific: set preview URL
      user_profile_pic.value = newUrl
      // Broadcast avatar update so Header picks it up instantly
      broadcastAvatarUpdated(data.avatar_url)
    }
  })

    // Initial load of user profile for edit_account (align with Admin)
    try {
      get_user_account_profile((data) => {
        try { user_profile_pic.value = buildAvatarUrlUtil(data.avatar_url) } catch (e) { user_profile_pic.value = data.avatar_url }
        user_full_name.value = data.full_name
        user_email.value = data.email
        user_password.value = data.password
      })
    } catch (e) {}
}

// ==========================
// Logout
// ==========================

function showLogoutModal() {
  try {
    if (logoutModalFaculty && logoutModalFaculty.value && typeof logoutModalFaculty.value.show === 'function') {
      logoutModalFaculty.value.show()
      return
    }
    const el = document.getElementById('logout-modal-faculty')
    if (el && window.bootstrap && typeof window.bootstrap.Modal === 'function') {
      const m = new window.bootstrap.Modal(el)
      m.show()
      return
    }
  } catch (e) {
    console.error('Show logout modal failed', e)
  }
}

async function confirmLogout() {
  try {
    await logout()
  } catch (e) {
    console.error('Logout failed', e)
  }
}

// ==========================
// Edit Account Handler
// ==========================

function handleRequestChangeUserAccountProfile(formData) {
  try {
    const token = sessionToken.value || getToken()
    // Accept multiple key shapes from various child forms (camelCase or snake_case)
    const fullName = formData?.full_name || formData?.username || formData?.fullName || null
    const email = formData?.email || null
    const newPassword = formData?.new_password || formData?.password || formData?.confirmPassword || null
    const currentPassword = formData?.current_password || formData?.previousPassword || formData?.previous_password || null
    const profilePicture = formData?.profile_picture || formData?.profilePicture || null

    facultySocket.updateFacultyProfile({
      token_session: token,
      full_name: fullName,
      email: email,
      new_password: newPassword,
      current_password: currentPassword,
      profile_picture: profilePicture
    }, (resp) => {
      if (resp && resp.success) {
        toastSuccess('Profile updated')
        // reload local profile values from response if provided
        if (resp.full_name) user_full_name.value = resp.full_name
        if (resp.email) user_email.value = resp.email
        if (resp.avatar_url) user_profile_pic.value = buildAvatarUrlUtil(resp.avatar_url)
      } else {
        toastError(resp?.message || 'Failed to update profile')
      }
    })
  } catch (e) {
    console.error('handleRequestChangeUserAccountProfile error', e)
    toastError('Profile update failed')
  }
}

// ==========================
// View/Create/Edit handlers
// ==========================

function handleViewProblem(problemId) {
  // Accept either an object or an id. Ensure problems tab is visible and forward to child via window event.
  try {
    current.value = 'problems'
    const full = (typeof problemId === 'object') ? problemId : (problem_rows.value || []).find(p => Number(p.problem_id || p.ProblemID) === Number(problemId))
    if (!full) { toastError('Problem not found'); return }
    // dispatch window event that child listens for
    try { window.dispatchEvent(new CustomEvent('faculty.openViewProblem', { detail: full })) } catch (e) { console.warn('dispatch openViewProblem failed', e) }
  } catch (e) { console.error('View problem handler failed', e); toastError('Unable to open problem view') }
}

function handleCreateProblem(problemData) {
  try {
    const token = sessionToken.value || getToken()
    facultySocket.createFacultyProblem({
      token_session: token,
      problem_name: problemData?.ProblemName || problemData?.problem_name || '',
      description: problemData?.Description || problemData?.description || '',
      difficulty: problemData?.Difficulty || problemData?.difficulty || 'Easy',
      time_limit_seconds: problemData?.TimeLimitSeconds || problemData?.time_limit_seconds || 1,
      memory_limit_mb: problemData?.MemoryLimitMB || problemData?.memory_limit_mb || 64,
      // Map admin modal SourceCode/sample_solution into backend sample_solution column
      sample_solution: problemData?.SourceCode || problemData?.SampleSolution || problemData?.sample_solution || '',
      topics: problemData?.Topics || problemData?.topics || [],
      test_cases: problemData?.TestCases || problemData?.test_cases || []
    }, (resp) => {
      if (resp && resp.success) {
        toastSuccess('Problem created')
        loadProblems()
      } else {
        toastError(resp?.message || 'Failed to create problem')
      }
    })
  } catch (e) {
    console.error('handleCreateProblem error', e)
    toastError('Create problem failed')
  }
}

function handleEditProblem(problemId) {
  try {
    current.value = 'problems'
    const full = (typeof problemId === 'object') ? problemId : (problem_rows.value || []).find(p => Number(p.problem_id || p.ProblemID) === Number(problemId))
    if (!full) { toastError('Problem not found'); return }
    try { window.dispatchEvent(new CustomEvent('faculty.openEditProblem', { detail: full })) } catch (e) { console.warn('dispatch openEditProblem failed', e) }
  } catch (e) { console.error('Edit problem handler failed', e); toastError('Unable to open problem editor') }
}

function handleUpdateProblem(problemData) {
  try {
    const token = sessionToken.value || getToken()
    facultySocket.updateFacultyProblem({
      token_session: token,
      problem_id: problemData?.ProblemID || problemData?.problem_id || problemData?.id,
      problem_name: problemData?.ProblemName || problemData?.problem_name || '',
      description: problemData?.Description || problemData?.description || '',
      difficulty: problemData?.Difficulty || problemData?.difficulty || 'Easy',
      time_limit_seconds: problemData?.TimeLimitSeconds || problemData?.time_limit_seconds || 1,
      memory_limit_mb: problemData?.MemoryLimitMB || problemData?.memory_limit_mb || 64,
      // Preserve or update solution code via SourceCode/sample_solution mapping
      sample_solution: problemData?.SourceCode || problemData?.SampleSolution || problemData?.sample_solution || '',
      topics: problemData?.Topics || problemData?.topics || [],
      test_cases: problemData?.TestCases || problemData?.test_cases || []
    }, (resp) => {
      if (resp && resp.success) {
        toastSuccess('Problem updated')
        loadProblems()
      } else {
        toastError(resp?.message || 'Failed to update problem')
      }
    })
  } catch (e) {
    console.error('handleUpdateProblem error', e)
    toastError('Update problem failed')
  }
}

function handleDeleteProblem(problemId) {
  try {
    const token = sessionToken.value || getToken()
    // If the payload is an object with a change_id, this represents a
    // pending faculty change (create/update/delete). Treat delete as
    // "cancel my pending change" via rejectFacultyChange.
    if (problemId && typeof problemId === 'object' && problemId.change_id) {
      facultySocket.rejectFacultyChange({
        token_session: token,
        change_id: problemId.change_id,
        comment: 'Cancelled by faculty'
      }, (resp) => {
        if (resp && resp.success) {
          toastSuccess('Pending change cancelled')
          loadProblems()
        } else {
          toastError(resp?.message || 'Failed to cancel pending change')
        }
      })
      return
    }

    facultySocket.deleteFacultyProblem({ token_session: token, problem_id: problemId }, (resp) => {
      if (resp && resp.success) {
        toastSuccess('Problem delete requested')
        loadProblems()
      } else {
        toastError(resp?.message || 'Failed to delete problem')
      }
    })
  } catch (e) {
    console.error('handleDeleteProblem error', e)
    toastError('Delete problem failed')
  }
}

// Approve/Deny pending questions from the Problems > Pending view
function handleApproveQuestionFromProblems(payload) {
  try {
    const row = payload?.row || payload
    const changeId = row?.change_id
    const token = sessionToken.value || getToken()

    // If this is a faculty_pending_changes row (identified by
    // change_id), always route through the faculty approval pipeline
    // instead of the admin question approval helpers.
    if (changeId) {
      facultySocket.approveFacultyChange({
        token_session: token,
        change_id: changeId,
        comment: ''
      }, (resp) => {
        if (resp && resp.success) {
          toastSuccess('Change approved')
          loadProblems()
          loadPendingApprovals()
        } else {
          toastError(resp?.message || 'Failed to approve change')
        }
      })
      return
    }
    // Approvals-backed pending questions (no change_id): faculty Level 1
    // acts just like admin by calling approve_question on the matching
    // approval row. The admin socket logic will keep faculty_pending_changes
    // in sync (committed/rejected) as needed.
    const approvalId = row?.approval_id || row?.ApprovalID
    const questionId = row?.problem_id || row?.ProblemID
    if (!approvalId || !questionId) {
      toastError('Missing approval/question id for this pending item')
      return
    }

    approve_question(questionId, approvalId, (resp) => {
      if (resp && resp.success) {
        toastSuccess('Question approved')
        loadProblems()
        loadPendingApprovals()
      } else {
        toastError(resp?.message || 'Failed to approve question')
      }
    })
  } catch (e) {
    console.error('handleApproveQuestionFromProblems error', e)
    toastError('Approve failed')
  }
}

function handleDenyQuestionFromProblems(payload) {
  try {
    const row = payload?.row || payload
    const changeId = row?.change_id
    const token = sessionToken.value || getToken()

    // Any row with a change_id is a faculty_pending_changes row and
    // should be handled via the faculty change pipeline.
    if (changeId) {
      const reason = window.facultyDenyReason || prompt('Enter reason for denial:') || 'Denied by faculty'
      facultySocket.rejectFacultyChange({
        token_session: token,
        change_id: changeId,
        comment: reason
      }, (resp) => {
        if (resp && resp.success) {
          // Optimistically remove the denied change-backed row from
          // the local problems list so it disappears from the
          // Problems > Pending view immediately.
          problem_rows.value = (problem_rows.value || []).filter(p => p.change_id !== changeId)
          // Show toast and refresh lists
          toastSuccess('Change denied')
          loadProblems()
          loadPendingApprovals()
        } else {
          toastError(resp?.message || 'Failed to deny change')
        }
      })
      return
    }
    // Approvals-backed pending questions (no change_id): faculty Level 1
    // denial calls the same deny_question helper used by admin.
    const approvalId = row?.approval_id || row?.ApprovalID
    const questionId = row?.problem_id || row?.ProblemID
    if (!approvalId || !questionId) {
      toastError('Missing approval/question id for this pending item')
      return
    }

    const reason = window.facultyDenyReason || 'Denied by faculty'
    deny_question(questionId, approvalId, reason, (resp) => {
      if (resp && resp.success) {
        toastSuccess('Question denied')
        loadProblems()
        loadPendingApprovals()
      } else {
        toastError(resp?.message || 'Failed to deny question')
      }
    })
  } catch (e) {
    console.error('handleDenyQuestionFromProblems error', e)
    toastError('Deny failed')
  }
}

function handleViewEvent(eventId) {
  try {
    current.value = 'events'
    const full = (typeof eventId === 'object') ? eventId : (event_rows.value || []).find(e => Number(e.event_id || e.EventID) === Number(eventId))
    if (!full) { toastError('Event not found'); return }
    try { window.dispatchEvent(new CustomEvent('faculty.openViewEvent', { detail: full })) } catch (e) { console.warn('dispatch openViewEvent failed', e) }
  } catch (e) { console.error('View event handler failed', e); toastError('Unable to open event view') }
}

function handleCreateEvent(eventData) {
  try {
    const token = sessionToken.value || getToken()
    facultySocket.createFacultyEvent({
      token_session: token,
      event_name: eventData?.EventName || eventData?.event_name || '',
      description: eventData?.Description || eventData?.description || '',
      starts_at: eventData?.StartsAt || eventData?.starts_at || '',
      ends_at: eventData?.EndsAt || eventData?.ends_at || '',
      thumbnail_data: eventData?.thumbnail_data || null,
      thumbnail_file_name: eventData?.thumbnail_file_name || null,
      reward_points: eventData?.RewardPoints || eventData?.reward_points || 0,
      reward_level: eventData?.RewardLevel || eventData?.reward_level || 0
    }, (resp) => {
      if (resp && resp.success) {
        toastSuccess('Event created')
        loadEvents()
      } else {
        toastError(resp?.message || 'Failed to create event')
      }
    })
  } catch (e) {
    console.error('handleCreateEvent error', e)
    toastError('Create event failed')
  }
}

function handleEditEvent(eventId) {
  try {
    current.value = 'events'
    const full = (typeof eventId === 'object') ? eventId : (event_rows.value || []).find(e => Number(e.event_id || e.EventID) === Number(eventId))
    if (!full) { toastError('Event not found'); return }
    try { window.dispatchEvent(new CustomEvent('faculty.openEditEvent', { detail: full })) } catch (e) { console.warn('dispatch openEditEvent failed', e) }
  } catch (e) { console.error('Edit event handler failed', e); toastError('Unable to open event editor') }
}

function handleUpdateEvent(eventData) {
  try {
    const token = sessionToken.value || getToken()
    const eventId = eventData?.EventID || eventData?.event_id || eventData?.id

    // If there is no committed event_id yet but we have a
    // change_id, this represents a draft/pending event backed by
    // faculty_pending_changes. Update the proposed_data payload
    // on that pending change instead of hitting the normal
    // updateFacultyEvent endpoint, which requires a real event id.
    if (!eventId && eventData?.change_id) {
      const proposed = {
        event_name: eventData?.EventName || eventData?.event_name || '',
        thumbnail_url: eventData?.ThumbnailUrl || eventData?.thumbnail_url || null,
        reward_points: eventData?.RewardPoints || eventData?.reward_points || 0,
        reward_level: eventData?.RewardLevel || eventData?.reward_level || 0,
        // keep status if provided, otherwise default to active
        status: eventData?.Status || eventData?.status || 'active',
        starts_at: eventData?.StartsAt || eventData?.starts_at || '',
        ends_at: eventData?.EndsAt || eventData?.ends_at || ''
      }

      facultySocket.updateFacultyChangeProposed({
        token_session: token,
        change_id: eventData.change_id,
        proposed_data: proposed
      }, (resp) => {
        if (resp && resp.success) {
          toastSuccess('Event draft updated')
          loadEvents()
        } else {
          toastError(resp?.message || 'Failed to update event draft')
        }
      })
      return
    }

    facultySocket.updateFacultyEvent({
      token_session: token,
      event_id: eventId,
      event_name: eventData?.EventName || eventData?.event_name || '',
      description: eventData?.Description || eventData?.description || '',
      starts_at: eventData?.StartsAt || eventData?.starts_at || '',
      ends_at: eventData?.EndsAt || eventData?.ends_at || '',
      thumbnail_url: eventData?.ThumbnailUrl || eventData?.thumbnail_url || '',
      reward_points: eventData?.RewardPoints || eventData?.reward_points || 0,
      reward_level: eventData?.RewardLevel || eventData?.reward_level || 0,
      thumbnail_data: eventData?.thumbnail_data || null,
      thumbnail_file_name: eventData?.thumbnail_file_name || null
    }, (resp) => {
      if (resp && resp.success) {
        toastSuccess('Event updated')
        loadEvents()
      } else {
        toastError(resp?.message || 'Failed to update event')
      }
    })
  } catch (e) {
    console.error('handleUpdateEvent error', e)
    toastError('Update event failed')
  }
}

function handleDeleteEvent(eventId) {
  try {
    const token = sessionToken.value || getToken()
    // If we receive an object with change_id, treat this as
    // "cancel my pending event change" instead of deleting.
    if (eventId && typeof eventId === 'object' && eventId.change_id) {
      facultySocket.rejectFacultyChange({
        token_session: token,
        change_id: eventId.change_id,
        comment: 'Cancelled by faculty'
      }, (resp) => {
        if (resp && resp.success) {
          toastSuccess('Pending event change cancelled')
          loadEvents()
        } else {
          toastError(resp?.message || 'Failed to cancel pending event change')
        }
      })
      return
    }

    facultySocket.deleteFacultyEvent({ token_session: token, event_id: eventId }, (resp) => {
      if (resp && resp.success) {
        toastSuccess('Event delete requested')
        loadEvents()
      } else {
        toastError(resp?.message || 'Failed to delete event')
      }
    })
  } catch (e) {
    console.error('handleDeleteEvent error', e)
    toastError('Delete event failed')
  }
}

function handleApproveEventFromEvents(payload) {
  try {
    const row = payload?.row || payload
    const changeId = row?.change_id
    const token = sessionToken.value || getToken()

    // Any row with a change_id represents a faculty_pending_changes
    // entry and must go through the faculty change pipeline rather
    // than the direct admin event approval helpers.
    if (changeId) {
      facultySocket.approveFacultyChange({
        token_session: token,
        change_id: changeId,
        comment: ''
      }, (resp) => {
        if (resp && resp.success) {
          toastSuccess('Change approved')
          loadEvents()
          loadPendingApprovals()
        } else {
          toastError(resp?.message || 'Failed to approve change')
        }
      })
      return
    }
    // Approvals-backed pending events (no change_id): faculty Level 1
    // calls the same approve_event helper used by admin.
    const approvalId = row?.approval_id || row?.ApprovalID
    const eventId = row?.event_id || row?.EventID
    if (!approvalId || !eventId) {
      toastError('Missing approval/event id for this pending item')
      return
    }

    approve_event(eventId, approvalId, (resp) => {
      if (resp && resp.success) {
        toastSuccess('Event approved')
        loadEvents()
        loadPendingApprovals()
      } else {
        toastError(resp?.message || 'Failed to approve event')
      }
    })
  } catch (e) {
    console.error('handleApproveEventFromEvents error', e)
    toastError('Approve failed')
  }
}

function handleDenyEventFromEvents(payload) {
  try {
    const row = payload?.row || payload
    const changeId = row?.change_id
    const token = sessionToken.value || getToken()

    // Faculty_pending_changes rows are always handled via the
    // faculty change pipeline when denied.
    if (changeId) {
      const reason = window.facultyDenyReason || 'Denied by faculty'
      facultySocket.rejectFacultyChange({
        token_session: token,
        change_id: changeId,
        comment: reason
      }, (resp) => {
        if (resp && resp.success) {
          // Remove denied change-backed event rows locally so they
          // disappear from the Events > Pending view right away.
          event_rows.value = (event_rows.value || []).filter(e => e.change_id !== changeId)
          // Show toast and refresh lists
          toastSuccess('Change denied')
          loadEvents()
          loadPendingApprovals()
        } else {
          toastError(resp?.message || 'Failed to deny change')
        }
      })
      return
    }
    // Approvals-backed pending events (no change_id): faculty Level 1
    // denial uses the same deny_event helper as admin.
    const approvalId = row?.approval_id || row?.ApprovalID
    const eventId = row?.event_id || row?.EventID
    if (!approvalId || !eventId) {
      toastError('Missing approval/event id for this pending item')
      return
    }

    const reason = window.facultyDenyReason || 'Denied by faculty'
    deny_event(eventId, approvalId, reason, (resp) => {
      if (resp && resp.success) {
        toastSuccess('Event denied')
        loadEvents()
        loadPendingApprovals()
      } else {
        toastError(resp?.message || 'Failed to deny event')
      }
    })
  } catch (e) {
    console.error('handleDenyEventFromEvents error', e)
    toastError('Deny failed')
  }
}

function handleManageParticipants(eventId) {
  // manage participants invoked
}

function handleViewBlog(blogId) {
  try {
    current.value = 'blogs'
    const full = (typeof blogId === 'object') ? blogId : (blog_rows.value || []).find(b => Number(b.blog_id || b.BlogID) === Number(blogId))
    if (!full) { toastError('Blog not found'); return }
    try { window.dispatchEvent(new CustomEvent('faculty.openViewBlog', { detail: full })) } catch (e) { console.warn('dispatch openViewBlog failed', e) }
  } catch (e) { console.error('View blog handler failed', e); toastError('Unable to open blog view') }
}

function handleCreateBlog(blogData) {
  try {
    const token = sessionToken.value || getToken()
    facultySocket.createFacultyBlog({
      token_session: token,
      blog_title: blogData?.Title || blogData?.blog_title || blogData?.title || '',
      blog_content: blogData?.Content || blogData?.blog_content || blogData?.content || '',
      thumbnail_data: blogData?.thumbnail_data || null,
      thumbnail_file_name: blogData?.thumbnail_file_name || null,
      content_type: blogData?.ContentType || blogData?.content_type || 'article'
    }, (resp) => {
      if (resp && resp.success) {
        toastSuccess('Blog created')
        loadBlogs()
      } else {
        toastError(resp?.message || 'Failed to create blog')
      }
    })
  } catch (e) {
    console.error('handleCreateBlog error', e)
    toastError('Create blog failed')
  }
}

function handleEditBlog(blogId) {
  try {
    current.value = 'blogs'
    const full = (typeof blogId === 'object') ? blogId : (blog_rows.value || []).find(b => Number(b.blog_id || b.BlogID) === Number(blogId))
    if (!full) { toastError('Blog not found'); return }
    try { window.dispatchEvent(new CustomEvent('faculty.openEditBlog', { detail: full })) } catch (e) { console.warn('dispatch openEditBlog failed', e) }
  } catch (e) { console.error('Edit blog handler failed', e); toastError('Unable to open blog editor') }
}

function handleUpdateBlog(blogData) {
  try {
    const token = sessionToken.value || getToken()
    const blogId = blogData?.BlogID || blogData?.blog_id || blogData?.id

    // Draft/pending blogs without a committed blog_id but with a
    // change_id should update the underlying faculty_pending_changes
    // row instead of calling the normal updateFacultyBlog endpoint.
    if (!blogId && blogData?.change_id) {
      const proposed = {
        title: blogData?.Title || blogData?.blog_title || blogData?.title || '',
        content: blogData?.Content || blogData?.blog_content || blogData?.content || '',
        thumbnail_url: blogData?.thumbnail_url || blogData?.ThumbnailUrl || null,
        content_type: blogData?.ContentType || blogData?.content_type || 'article'
      }

      facultySocket.updateFacultyChangeProposed({
        token_session: token,
        change_id: blogData.change_id,
        proposed_data: proposed
      }, (resp) => {
        if (resp && resp.success) {
          toastSuccess('Blog draft updated')
          loadBlogs()
        } else {
          toastError(resp?.message || 'Failed to update blog draft')
        }
      })
      return
    }

    facultySocket.updateFacultyBlog({
      token_session: token,
      blog_id: blogId,
      blog_title: blogData?.Title || blogData?.blog_title || blogData?.title || '',
      blog_content: blogData?.Content || blogData?.blog_content || blogData?.content || '',
      thumbnail_url: blogData?.ThumbnailUrl || blogData?.thumbnail_url || blogData?.thumbnailUrl || null,
      thumbnail_data: blogData?.thumbnail_data || null,
      thumbnail_file_name: blogData?.thumbnail_file_name || null,
      content_type: blogData?.ContentType || blogData?.content_type || 'article'
    }, (resp) => {
      if (resp && resp.success) {
        toastSuccess('Blog updated')
        loadBlogs()
      } else {
        toastError(resp?.message || 'Failed to update blog')
      }
    })
  } catch (e) {
    console.error('handleUpdateBlog error', e)
    toastError('Update blog failed')
  }
}

function handleDeleteBlog(blogId) {
  try {
    const token = sessionToken.value || getToken()
    // If we receive an object with change_id, interpret this as
    // "cancel my pending blog change" and reject the pending change.
    if (blogId && typeof blogId === 'object' && blogId.change_id) {
      facultySocket.rejectFacultyChange({
        token_session: token,
        change_id: blogId.change_id,
        comment: 'Cancelled by faculty'
      }, (resp) => {
        if (resp && resp.success) {
          toastSuccess('Pending blog change cancelled')
          loadBlogs()
        } else {
          toastError(resp?.message || 'Failed to cancel pending blog change')
        }
      })
      return
    }

    facultySocket.deleteFacultyBlog({ token_session: token, blog_id: blogId }, (resp) => {
      if (resp && resp.success) {
        toastSuccess('Blog delete requested')
        loadBlogs()
      } else {
        toastError(resp?.message || 'Failed to delete blog')
      }
    })
  } catch (e) {
    console.error('handleDeleteBlog error', e)
    toastError('Delete blog failed')
  }
}

  // ==========================
  // Faculty Approval Handlers (Two-level workflow)
  // ==========================

  function handleApproveBlogFromBlogs(payload) {
    try {
      const row = payload?.row || payload
      const changeId = row?.change_id
      const token = sessionToken.value || getToken()

      // Any row with a change_id represents a faculty_pending_changes
      // entry and should be routed through the faculty change pipeline.
      if (changeId) {
        facultySocket.approveFacultyChange({
          token_session: token,
          change_id: changeId,
          comment: ''
        }, (resp) => {
          if (resp && resp.success) {
            toastSuccess('Change approved')
            loadBlogs()
            loadPendingApprovals()
          } else {
            toastError(resp?.message || 'Failed to approve change')
          }
        })
        return
      }
      // Approvals-backed pending blogs (no change_id): faculty Level 1
      // calls approve_blog to finalize at Level 1.
      const approvalId = row?.approval_id || row?.ApprovalID
      const blogId = row?.blog_id || row?.BlogID
      if (!approvalId || !blogId) {
        toastError('Missing approval/blog id for this pending item')
        return
      }

      approve_blog(blogId, approvalId, (resp) => {
        if (resp && resp.success) {
          toastSuccess('Blog approved')
          loadBlogs()
          loadPendingApprovals()
        } else {
          toastError(resp?.message || 'Failed to approve blog')
        }
      })
    } catch (e) {
      console.error('handleApproveBlogFromBlogs error', e)
      toastError('Approve failed')
    }
  }

  function handleDenyBlogFromBlogs(payload) {
    try {
      const row = payload?.row || payload
      const changeId = row?.change_id
      const token = sessionToken.value || getToken()

      // Denials on faculty_pending_changes-backed rows always use the
      // faculty change pipeline.
      if (changeId) {
        const reason = window.facultyDenyReason || 'Denied by faculty'
        facultySocket.rejectFacultyChange({
          token_session: token,
          change_id: changeId,
          comment: reason
        }, (resp) => {
          if (resp && resp.success) {
            // Remove denied change-backed blog rows locally so they
            // disappear from the Blogs > Pending view right away.
            blog_rows.value = (blog_rows.value || []).filter(b => b.change_id !== changeId)
            // Show toast and refresh lists
            toastSuccess('Change denied')
            loadBlogs()
            loadPendingApprovals()
          } else {
            toastError(resp?.message || 'Failed to deny change')
          }
        })
        return
      }
      // Approvals-backed pending blogs (no change_id): faculty Level 1
      // denial calls deny_blog.
      const approvalId = row?.approval_id || row?.ApprovalID
      const blogId = row?.blog_id || row?.BlogID
      if (!approvalId || !blogId) {
        toastError('Missing approval/blog id for this pending item')
        return
      }

      const reason = window.facultyDenyReason || 'Denied by faculty'
      deny_blog(blogId, approvalId, reason, (resp) => {
        if (resp && resp.success) {
          toastSuccess('Blog denied')
          loadBlogs()
          loadPendingApprovals()
        } else {
          toastError(resp?.message || 'Failed to deny blog')
        }
      })
    } catch (e) {
      console.error('handleDenyBlogFromBlogs error', e)
      toastError('Deny failed')
    }
  }

  function safeJsonParseLocal(val) {
    if (!val) return {}
    if (typeof val === 'object') return val
    try { return JSON.parse(val) } catch (e) { return {} }
  }

  function handleViewApproval(approvalData) {
    try {
      if (!perms.value?.canManageApprovals) {
        toastError('You do not have permission to manage approvals')
        return
      }

      if (!approvalData) {
        toastError('Approval not found')
        return
      }

      // Remember the last clicked approval for any summary UI
      current_approval.value = approvalData

      const type = (approvalData.change_type || approvalData.content_type || approvalData.table_name || '').toString().toLowerCase()
      const proposed = safeJsonParseLocal(approvalData.proposed_data)

      if (type === 'event') {
        // Shape data for the admin ApprovalEventViewModal
        facultyApprovalEvent.value = {
          event_name: proposed.event_name || approvalData.event_name || approvalData.title || '',
          event_host: proposed.event_host || approvalData.event_host || approvalData.host || '',
          event_date: proposed.event_date || approvalData.event_date || proposed.starts_at || approvalData.starts_at || null,
          event_players: proposed.event_players || approvalData.event_players || 0,
          requested_at: approvalData.requested_at || approvalData.created_at || null,
          status: proposed.status || approvalData.status || 'Pending',
          event_thumbnail: proposed.thumbnail_url || approvalData.thumbnail_url || approvalData.event_thumbnail || null
        }

        const modalEl = document.getElementById('viewApprovalEventModal')
        if (modalEl && window.bootstrap?.Modal) {
          const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl)
          modal.show()
        }
        return
      }

      if (type === 'blog') {
        facultyApprovalBlog.value = {
          blog_title: proposed.title || proposed.blog_title || approvalData.title || approvalData.blog_title || '',
          blog_author: proposed.author_name || approvalData.author_name || approvalData.AuthorName || approvalData.author || 'Unknown',
          blog_date: proposed.published_at || approvalData.published_at || approvalData.PublishedAt || approvalData.created_at || null,
          blog_content_type: proposed.content_type || approvalData.content_type || approvalData.ContentType || 'article',
          requested_at: approvalData.requested_at || approvalData.created_at || null,
          status: proposed.status || approvalData.status || 'Pending',
          blog_content: proposed.content || proposed.blog_content || approvalData.blog_content || approvalData.Content || approvalData.content || '',
          blog_thumbnail: proposed.thumbnail_url || approvalData.thumbnail_url || approvalData.blog_thumbnail || null
        }

        const modalEl = document.getElementById('viewApprovalBlogModal')
        if (modalEl && window.bootstrap?.Modal) {
          const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl)
          modal.show()
        }
        return
      }

      if (type === 'problem') {
        const rawTestCases = Array.isArray(proposed.test_cases)
          ? proposed.test_cases
          : (approvalData.test_cases || approvalData.TestCases || [])

        const mappedTestCases = Array.isArray(rawTestCases)
          ? rawTestCases.map((tc, idx) => ({
              test_case_id: tc.TestCaseID || tc.test_case_id || null,
              test_case_number: tc.TestCaseNumber || tc.test_case_number || (idx + 1),
              is_sample: !!(tc.IsSample ?? tc.is_sample),
              input_data: tc.InputData || tc.input || tc.input_data || '',
              expected_output: tc.ExpectedOutput || tc.expected || tc.expected_output || '',
              score: tc.Score ?? tc.score ?? 0
            }))
          : []

        facultyApprovalQuestion.value = {
          question_name: proposed.problem_name || approvalData.problem_name || approvalData.title || '',
          question_difficulty: proposed.difficulty || approvalData.difficulty || approvalData.Difficulty || 'Easy',
          question_description: proposed.description || approvalData.description || approvalData.Description || '',
          question_time_limit: proposed.time_limit_seconds || approvalData.time_limit_seconds || approvalData.TimeLimitSeconds || 1,
          question_memory_limit: proposed.memory_limit_mb || approvalData.memory_limit_mb || approvalData.MemoryLimitMB || 64,
          requested_at: approvalData.requested_at || approvalData.created_at || null,
          status: proposed.status || approvalData.status || 'Pending',
          test_cases: mappedTestCases
        }

        const modalEl = document.getElementById('viewApprovalQuestionModal')
        if (modalEl && window.bootstrap?.Modal) {
          const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl)
          modal.show()
        }
        return
      }

      toastError('Unsupported approval type for view')
    } catch (e) {
      console.error('handleViewApproval error', e)
      toastError('Unable to open approval view')
    }
  }

  // Central Approvals tab actions. These reuse the same Level 1
  // logic as the Problems/Events/Blogs pending sections:
  // - faculty_pending_changes rows (identified by change_id or id)
  //   go through approveFacultyChange / rejectFacultyChange.
  // - approvals-backed rows (identified by approval_id) use the
  //   same per-type approve/deny helpers as the per-type tabs.

  function handleApproveChange(payload) {
    try {
      if (!perms.value?.canManageApprovals) {
        toastError('You do not have permission to manage approvals')
        return
      }

      const row = payload || {}
      const token = sessionToken.value || getToken()

      const changeId = row.change_id || row.id || row.approval_id || row.ApprovalID
      const approvalId = row.approval_id || row.ApprovalID
      const contentType = (row.content_type || row.ContentType || row.table_name || row.change_type || payload?.content_type || '').toString().toLowerCase()
      const comment = row.comment || payload?.comment || ''

      // If we have a faculty_pending_changes id, always go through
      // the faculty change pipeline (Level 1 forward-to-admin).
      if (changeId && (!approvalId || row.table_name || row.proposed_data || row.original_data)) {
        facultySocket.approveFacultyChange({
          token_session: token,
          change_id: changeId,
          comment
        }, (resp) => {
          if (resp && resp.success) {
            toastSuccess('Change approved and sent to admin')
            // Refresh approvals queues and content lists
            loadPendingApprovals()
            loadApprovedApprovals()
            loadProblems()
            loadEvents()
            loadBlogs()
          } else {
            toastError(resp?.message || 'Failed to approve change')
          }
        })
        return
      }

      // approvals-backed items: use the same per-type helpers that
      // the Problems/Events/Blogs tabs call.
      if (!approvalId) {
        toastError('Missing approval id for this item')
        return
      }

      if (contentType === 'problem') {
        const questionId = row.problem_id || row.ProblemID || row.content_id || row.ContentID
        if (!questionId) {
          toastError('Missing question id for this approval')
          return
        }
        approve_question(questionId, approvalId, (resp) => {
          if (resp && resp.success) {
            toastSuccess('Question approved')
            loadProblems()
            loadPendingApprovals()
          } else {
            toastError(resp?.message || 'Failed to approve question')
          }
        })
      } else if (contentType === 'event') {
        const eventId = row.event_id || row.EventID || row.content_id || row.ContentID
        if (!eventId) {
          toastError('Missing event id for this approval')
          return
        }
        approve_event(eventId, approvalId, (resp) => {
          if (resp && resp.success) {
            toastSuccess('Event approved')
            loadEvents()
            loadPendingApprovals()
          } else {
            toastError(resp?.message || 'Failed to approve event')
          }
        })
      } else if (contentType === 'blog') {
        const blogId = row.blog_id || row.BlogID || row.content_id || row.ContentID
        if (!blogId) {
          toastError('Missing blog id for this approval')
          return
        }
        approve_blog(blogId, approvalId, (resp) => {
          if (resp && resp.success) {
            toastSuccess('Blog approved')
            loadBlogs()
            loadPendingApprovals()
          } else {
            toastError(resp?.message || 'Failed to approve blog')
          }
        })
      } else {
        toastError('Unsupported content type for approval')
      }
    } catch (e) {
      console.error('handleApproveChange error', e)
      toastError('Approve failed')
    }
  }

  function handleDenyChange(payload) {
    try {
      if (!perms.value?.canManageApprovals) {
        toastError('You do not have permission to manage approvals')
        return
      }

      const row = payload || {}
      const token = sessionToken.value || getToken()

      const changeId = row.change_id || row.id || row.approval_id || row.ApprovalID
      const approvalId = row.approval_id || row.ApprovalID
      const contentType = (row.content_type || row.ContentType || row.table_name || row.change_type || payload?.content_type || '').toString().toLowerCase()
      const comment = row.comment || payload?.comment || 'Denied by faculty'

      // faculty_pending_changes-backed rows -> rejectFacultyChange
      if (changeId && (!approvalId || row.table_name || row.proposed_data || row.original_data)) {
        facultySocket.rejectFacultyChange({
          token_session: token,
          change_id: changeId,
          comment
        }, (resp) => {
          if (resp && resp.success) {
            toastSuccess('Change rejected')
            loadPendingApprovals()
            loadApprovedApprovals()
            loadProblems()
            loadEvents()
            loadBlogs()
          } else {
            toastError(resp?.message || 'Failed to reject change')
          }
        })
        return
      }

      // approvals-backed items -> per-type deny helpers
      if (!approvalId) {
        toastError('Missing approval id for this item')
        return
      }

      if (contentType === 'problem') {
        const questionId = row.problem_id || row.ProblemID || row.content_id || row.ContentID
        if (!questionId) {
          toastError('Missing question id for this approval')
          return
        }
        deny_question(questionId, approvalId, comment, (resp) => {
          if (resp && resp.success) {
            toastSuccess('Question denied')
            loadProblems()
            loadPendingApprovals()
          } else {
            toastError(resp?.message || 'Failed to deny question')
          }
        })
      } else if (contentType === 'event') {
        const eventId = row.event_id || row.EventID || row.content_id || row.ContentID
        if (!eventId) {
          toastError('Missing event id for this approval')
          return
        }
        deny_event(eventId, approvalId, comment, (resp) => {
          if (resp && resp.success) {
            toastSuccess('Event denied')
            loadEvents()
            loadPendingApprovals()
          } else {
            toastError(resp?.message || 'Failed to deny event')
          }
        })
      } else if (contentType === 'blog') {
        const blogId = row.blog_id || row.BlogID || row.content_id || row.ContentID
        if (!blogId) {
          toastError('Missing blog id for this approval')
          return
        }
        deny_blog(blogId, approvalId, comment, (resp) => {
          if (resp && resp.success) {
            toastSuccess('Blog denied')
            loadBlogs()
            loadPendingApprovals()
          } else {
            toastError(resp?.message || 'Failed to deny blog')
          }
        })
      } else {
        toastError('Unsupported content type for denial')
      }
    } catch (e) {
      console.error('handleDenyChange error', e)
      toastError('Deny failed')
    }
  }

  function handleForwardToAdmin(payload) {
    try {
      if (!perms.value?.canManageApprovals) {
        toastError('You do not have permission to manage approvals')
        return
      }

      const row = payload || {}
      const token = sessionToken.value || getToken()

      const changeId = row.change_id || row.id || row.approval_id || row.ApprovalID
      const comment = row.comment || payload?.comment || 'Forwarded to admin from faculty approvals tab'

      if (!changeId) {
        toastError('Missing change id for forward')
        return
      }

      // Forward is implemented as the same underlying operation as
      // approveFacultyChange (status = pending_admin) but keeps the
      // semantic distinction via the review comment.
      facultySocket.approveFacultyChange({
        token_session: token,
        change_id: changeId,
        comment
      }, (resp) => {
        if (resp && resp.success) {
          toastSuccess('Change forwarded to admin')
          loadPendingApprovals()
          loadApprovedApprovals()
          loadProblems()
          loadEvents()
          loadBlogs()
        } else {
          toastError(resp?.message || 'Failed to forward change')
        }
      })
    } catch (e) {
      console.error('handleForwardToAdmin error', e)
      toastError('Forward failed')
    }
  }

// Watch section changes
// ==========================

watch(current, (newVal) => {
  if (newVal === 'dashboard') {
    loadDashboard()
  } else if (newVal === 'users') {
    // Always attempt to load; the backend is the source of truth
    // and will return Forbidden if this faculty truly lacks access.
    loadUsers()
  } else if (newVal === 'problems') {
    if (!perms.value.canManageProblems) { toastError('You do not have permission to manage problems'); return }
    loadProblems()
  } else if (newVal === 'events') {
    if (!perms.value.canManageEvents) { toastError('You do not have permission to manage events'); return }
    loadEvents()
  } else if (newVal === 'blogs') {
    if (!perms.value.canManageBlogs) { toastError('You do not have permission to manage blogs'); return }
    loadBlogs()
  } else if (newVal === 'edit_account') {
      try {
        get_user_account_profile((data) => {
          try { user_profile_pic.value = buildAvatarUrlUtil(data.avatar_url) } catch (e) { user_profile_pic.value = data.avatar_url }
          user_full_name.value = data.full_name
          user_email.value = data.email
          user_password.value = data.password
        })
      } catch (e) {}
  } else if (newVal === 'approvals') {
    if (!perms.value.canManageApprovals) { toastError('You do not have permission to view approvals'); return }
    loadPendingApprovals()
    loadApprovedApprovals()
  }
})

// ==========================
// Socket initialization
// ==========================

function initializeSocket() {
  try {
    if (socket) return
    const base = apiBase || ''
    // Prefer explicit backend host if apiBase set, otherwise connect to same origin
    const connectUrl = base || undefined
    socket = io(connectUrl)
    // Initialize facultySocket helper with the connected socket
    try { facultySocket.initSocket(socket) } catch (e) { console.warn('[Faculty] facultySocket.initSocket failed', e) }
    // socket initialized for faculty dashboard

    // Shared refresh helper for any approval/change lifecycle events
    const refreshOnChange = () => {
      try {
        loadProblems()
        loadEvents()
        loadBlogs()
        loadPendingApprovals()
        loadApprovedApprovals()
      } catch (e) {
        console.warn('[Faculty] refreshOnChange failed', e)
      }
    }

    try {
      // Faculty change lifecycle (pending changes pipeline)
      socket.on('faculty_change_forwarded', refreshOnChange)
      socket.on('faculty_change_rejected', refreshOnChange)
      socket.on('faculty_change_committed', refreshOnChange)
      socket.on('faculty_change_rejected_admin', refreshOnChange)

      // Admin-level event/blog approvals denials from the main
      // AdminDashboard pending queues.
      socket.on('approval_event_denied', refreshOnChange)
      socket.on('approval_blog_denied', refreshOnChange)
    } catch (e) {
      console.warn('[Faculty] failed to attach approval/change listeners', e)
    }
  } catch (e) {
    console.warn('[Faculty] initializeSocket failed', e)
    socket = null
  }
}

// ==========================
// Lifecycle hooks
// ==========================

onMounted(async () => {
  // RBAC: Prefer allowing the page to load anonymously. If a token exists, verify role and enable privileged features.
  try {
    const token = getToken()
    if (!token) {
      console.warn('[Faculty] No token found — loading page anonymously. Privileged actions are disabled until sign-in.')
      // show a lightweight toast informing the user they can sign in for full features
      try { toastInfo('Sign in to enable editing and management features', 5000) } catch (e) {}
      // leave sessionToken empty, do not initialize sockets or call permissioned endpoints
      return
    }

    const decoded = safeDecodeJWT(token)
    const userRole = decoded?.role || decoded?.primary_role || null

    if (!userRole || (userRole !== 'faculty' && userRole !== 'admin')) {
      console.warn('[Faculty] User role is', userRole, ' — not authorized for faculty dashboard; redirecting to home')
      window.location.href = '/home.html'
      return
    }

    // RBAC check passed
    sessionToken.value = token
    // Initialize socket connection for faculty helpers and then probe permissions
    try { initializeSocket() } catch (e) { console.warn('[Faculty] initializeSocket during mount failed', e) }
    await refreshPermissions()
    // Load initial dashboard totals and lists so SPA sections render for E2E
    try { await loadDashboard() } catch (e) {}
    try { await loadUsers() } catch (e) {}
    try { await loadProblems() } catch (e) {}
    try { await loadEvents() } catch (e) {}
    try { await loadBlogs() } catch (e) {}
    try { await loadPendingApprovals() } catch (e) {}
    try { await loadApprovedApprovals() } catch (e) {}
  } catch (e) {
    console.error('[Faculty] RBAC check failed:', e)
    // If verification fails unexpectedly, still allow anonymous load but block privileged features
    sessionToken.value = ''
    return
  }
})

onBeforeUnmount(() => {
  // Do NOT disconnect — socket is the shared singleton used across all pages
  socket = null
})
</script>

<style scoped>
/* Scoped faculty dashboard styles */
</style>
