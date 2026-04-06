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
            <content_dashboard
              :total_user="total_users"
              :total_question_set="total_question_sets"
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

          <template #question_set>
            <content_question_set 
              :admin_question_rows="admin_question_rows"
              :user_question_rows="user_question_rows"
              :pending_question_rows="pending_question_rows"
              :currentProblem="currentProblem"
              :currentTestCases="currentTestCases"
              @view-problem="handleViewProblem"
              @delete-question="handleDeleteQuestion"
              @approve-question="handleApproveQuestion"
              @deny-question="handleDenyQuestion"
              @filter-questions="handleFilterQuestions"
              @create-question="handleCreateQuestion"
              @edit-question="handleEditQuestion"
              @update-question="handleUpdateQuestion"
              @submit-draft="handleSubmitDraftQuestion"
              @move-to-draft="handleMoveToDraftQuestion"
              @move-to-pending="handleMoveToPendingQuestion"
              @draft-saved="handleDraftSaved"
              @test-run-recorded="handleTestRunRecorded"
              @refresh-problems="handleRefreshProblems"
            />
          </template>

          <template #user>
            <content_user :user_rows="user_rows" />
          </template>

          <template #admin>
            <content_admin :admin_rows="admin_rows" />
          </template>

          <template #event>
            <content_event 
              :global_event_rows="global_event_rows"
              :user_event_rows="user_event_rows"
              :pending_event_rows="pending_event_rows"
              :currentEvent="currentEvent"
              :currentParticipants="currentParticipants"
              @view-event="handleViewEvent"
              @edit-event="handleEditEvent"
              @delete-event="handleDeleteEvent"
              @manage-participants="handleManageParticipants"
              @create-event="handleCreateEvent"
              @update-event="handleUpdateEvent"
              @approve-event="(eventId, approvalId) => handleApproveEvent(eventId, approvalId)"
              @deny-event="(eventId, approvalId) => handleDenyEvent(eventId, approvalId)"
              @add-participant="handleAddParticipant"
              @remove-participant="handleRemoveParticipant"
            />
          </template>

          <template #blog>
            <content_blog 
              :global_blog_rows="global_blog_rows"
              :user_blog_rows="user_blog_rows"
              :pending_blog_rows="pending_blog_rows"
              :currentBlog="currentBlog"
              @view-blog="handleViewBlog"
              @edit-blog="handleEditBlog"
              @delete-blog="handleDeleteBlog"
              @create-blog="handleCreateBlog"
              @update-blog="handleUpdateBlog"
              @approve-blog="(data) => handleApproveBlog(data.BlogID, data.ApprovalID)"
              @deny-blog="(data) => handleDenyBlog(data.BlogID, data.ApprovalID)"
            />
          </template>

          <template #approval>
            <content_approval 
              :pending_approval_events="pending_approval_events"
              :pending_approval_blogs="pending_approval_blogs"
              :pending_approval_problems="pending_approval_problems"
              :approved_approval_events="approved_approval_events"
              :approved_approval_blogs="approved_approval_blogs"
              :approved_approval_problems="approved_approval_problems"
              :draft_questions="draft_questions"
              :currentApprovalEvent="currentApprovalEvent"
              :currentApprovalBlog="currentApprovalBlog"
              :currentApprovalQuestion="currentApprovalQuestion"
              @approve-item="handleApproveItem"
              @deny-item="handleDenyItem"
              @view-event="handleViewApprovalEvent"
              @view-blog="handleViewApprovalBlog"
              @view-question="handleViewApprovalQuestion"
            />
          </template>

          <template #faculty_review>
            <content_faculty_approvals
              :rows="pending_faculty_changes"
              @approve-change="(row) => handleAdminCommitFacultyChange(row)"
              @reject-change="(row) => handleAdminRejectFacultyChange(row)"
            />
          </template>

          <template #mail>
            <content_email />
          </template>
        </SplitMainWindow>
      </template>
    </Window>
    <!-- Admin logout confirmation modal -->
    <DeleteConfirmModal ref="deleteConfirmModal" modalId="deleteConfirmModal" @confirm="handleConfirmedDelete" />
    <LogoutModal ref="logoutModalAdmin" modalId="logout-modal-admin" @confirm="confirmLogout" />
  </section>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Window from './components/window.vue'
import SplitMainWindow from './components/split-main-window.vue'
import ButtonText from './components/button-text.vue'
import LogoutModal from './components/LogoutModal.vue'
import { logout } from './js/auth.js'

import content_dashboard from './components/dashboard/admin/content_dashboard.vue'
import content_edit_account from './components/dashboard/admin/content_edit_account.vue'
import content_question_set from './components/dashboard/admin/content_question_set.vue'
import content_user from './components/dashboard/admin/content_user.vue'
import content_admin from './components/dashboard/admin/content_admin.vue'
import content_event from './components/dashboard/admin/content_event.vue'
import content_blog from './components/dashboard/admin/content_blog.vue'
import DeleteConfirmModal from './components/DeleteConfirmModal.vue'
import content_approval from './components/dashboard/admin/content_approval.vue'
import content_email from './components/dashboard/admin/content_email.vue'
import content_faculty_approvals from './components/dashboard/admin/content_faculty_approvals.vue'

import { get_user_account_profile, handle_request_change_user_account_profile, response_change_user_account_profile } from './js/user-dashboard.js'
import { get_dashboard_details, get_all_users, get_all_admins, get_admin_questions, get_user_questions, get_pending_questions, filter_questions, get_problem_details, get_global_events, get_user_events, get_pending_events, get_event_details, create_event, update_event, delete_event, approve_event, deny_event, get_global_blogs, get_user_blogs, get_pending_blogs, get_blog_details, create_blog, update_blog, delete_blog, approve_blog, deny_blog, approve_question, deny_question, get_pending_approvals, get_approved_approvals, get_draft_questions, approve_item, deny_item, create_question, delete_question, update_question, submit_draft, move_to_draft, move_to_pending } from './js/admin-dashboard.js'
import { toastSuccess, toastError } from './components/Toast.vue'

// ==========================
// Sections for SplitMainWindow
// ==========================
const sections = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'edit_account', name: 'Edit Account' },
  { id: 'question_set', name: 'Question Set' },
  { id: 'user', name: 'User' },
  { id: 'admin', name: 'Admin/Faculty' },
  { id: 'event', name: 'Event' },
  { id: 'blog', name: 'Blog' },
  { id: 'approval', name: 'Approvals' },
  { id: 'faculty_review', name: 'Faculty Changes' },
  { id: 'mail', name: 'Mail' }
]

// ==========================
// Reactive variables
// ==========================

// current navigation to load efficiently
const current = ref('dashboard')

// reactive variables for dashboard details (used by dashboard view)
const total_users = ref(0)
const total_question_sets = ref(0)

// reactive variables for user profile (used by edit_account view)
const user_profile_pic = ref('')
const user_full_name = ref('')
const user_email = ref('')
const user_password = ref('')

// reactive variables for user list (used by user view)
const user_rows = ref([])

// reactive variables for admin list (used by admin view)
const admin_rows = ref([])

// reactive variables for question sets (used by question_set view)
const admin_question_rows = ref([])
const user_question_rows = ref([])
const pending_question_rows = ref([])

// reactive variables for problem view modal
const currentProblem = ref({
  ProblemID: 0,
  ProblemName: '',
  Difficulty: 'Easy',
  TimeLimitSeconds: 1,
  MemoryLimitMB: 64,
  Description: ''
})
const currentTestCases = ref([])

// reactive variables for event sets (used by event view)
const global_event_rows = ref([])
const user_event_rows = ref([])
const pending_event_rows = ref([])

// reactive variables for event view modal
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

// reactive variables for blog sets (used by blog view)
const global_blog_rows = ref([])
const user_blog_rows = ref([])
const pending_blog_rows = ref([])

// reactive variables for blog view modal
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

// reactive variables for approval management
const pending_approval_events = ref([])
const pending_approval_blogs = ref([])
const pending_approval_problems = ref([])
const approved_approval_events = ref([])
const approved_approval_blogs = ref([])
const approved_approval_problems = ref([])
const draft_questions = ref([])

// reactive variables for faculty admin approvals
const pending_faculty_changes = ref([])
const lastFacultyFetch = ref(0)

// ref for logout modal component
const logoutModalAdmin = ref(null)

// Current approval items for view modals
const currentApprovalEvent = ref({})
const currentApprovalBlog = ref({})
const currentApprovalQuestion = ref({})

// ==========================
// Helper functions
// ==========================

// helper: normalize avatar_url returned from server into a single leading-path URL
function buildAvatarUrl(av) {
  if (!av) return '';
  // if already starts with slash, assume it's a full path
  if (av.startsWith('/')) return av + '?t=' + Date.now();
  // if server already returned asset/profile/... or similar, just prepend leading slash
  if (av.includes('asset/profile')) return '/' + av.replace(/^\/+/, '') + '?t=' + Date.now();
  // otherwise it's probably a bare filename
  return '/asset/profile/' + av + '?t=' + Date.now();
}

async function loadPendingFacultyApprovals() {
  try {
    const token = localStorage.getItem('jwt_token')
    if (!token) return
    const API_URL = import.meta.env.VITE_API_URL || ''
    const res = await fetch(`${API_URL}/api/admin/pending-faculty-approvals`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    })
    const data = await res.json()
    if (data && data.success) {
      pending_faculty_changes.value = data.pending || []
      lastFacultyFetch.value = Date.now()
    } else {
      console.error('Failed to load admin faculty approvals', data?.message)
    }
  } catch (e) {
    console.error('loadPendingFacultyApprovals error', e)
  }
}

async function handleAdminCommitFacultyChange(row) {
  try {
    const token = localStorage.getItem('jwt_token')
    if (!token) return
    const API_URL = import.meta.env.VITE_API_URL || ''
    const res = await fetch(`${API_URL}/api/admin/commit-change/${row.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ comment: 'Approved by admin' })
    })
    const data = await res.json()
    if (data && data.success) {
      try { toastSuccess('Faculty change committed') } catch (e) {}
      await loadPendingFacultyApprovals()
    } else {
      try { toastError(data?.message || 'Commit failed') } catch (e) {}
    }
  } catch (e) {
    console.error('handleAdminCommitFacultyChange error', e)
    try { toastError('Commit failed') } catch (e2) {}
  }
}

async function handleAdminRejectFacultyChange(row) {
  try {
    const token = localStorage.getItem('jwt_token')
    if (!token) return
    const API_URL = import.meta.env.VITE_API_URL || ''
    const res = await fetch(`${API_URL}/api/admin/reject-change/${row.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ comment: 'Rejected by admin' })
    })
    const data = await res.json()
    if (data && data.success) {
      try { toastSuccess('Faculty change rejected') } catch (e) {}
      await loadPendingFacultyApprovals()
    } else {
      try { toastError(data?.message || 'Reject failed') } catch (e) {}
    }
  } catch (e) {
    console.error('handleAdminRejectFacultyChange error', e)
    try { toastError('Reject failed') } catch (e2) {}
  }
}

// Normalize questions array to ensure `Topics` is an array
function normalizeQuestions(questions) {
  return (questions || []).map(q => {
    const Topics = (q.Topics && q.Topics.length)
      ? q.Topics
      : (q.TopicsText ? q.TopicsText.split(',').map(t => t.trim()).filter(Boolean) : []);
    return { ...q, Topics };
  });
}

// ==========================
// Mounting logic
// ==========================
onMounted(() => {
  // Cleanup MutationObserver: Navigation is handled by SplitMainWindow v-model
  
  // Initial load of dashboard
  const fetchDashboardData = () => {
    get_dashboard_details((data) => {
      total_users.value = data.total_users
      total_question_sets.value = data.total_question_sets
    })
    
    // Initial load of user profile for edit_account
    get_user_account_profile((data) => {
      user_profile_pic.value = buildAvatarUrl(data.avatar_url)
      user_full_name.value = data.full_name || data.username || ''
      user_email.value = data.email || ''
      user_password.value = data.password || ''
    })
  }

  // Wait for socket to be authenticated before fetching sensitive data
  import('./js/socket.js').then(({ getSocket }) => {
    const s = getSocket()
    if (s) {
      if (s.authenticated) {
        fetchDashboardData()
      } else {
        s.once('authenticated', fetchDashboardData)
      }
    }
  })

  // Initial load of pending faculty changes for admin review
  loadPendingFacultyApprovals()

  // Ensure client permission cache is initialized early to avoid stale-can() checks
  try {
    if (typeof window !== 'undefined' && typeof window.initPermissions === 'function') {
      window.initPermissions()
    }
  } catch (e) { /* ignore */ }

  // Listen to server updates after save
  response_change_user_account_profile((data) => {
    user_profile_pic.value = buildAvatarUrl(data.avatar_url)
    user_full_name.value = data.full_name || data.username || ''
    user_email.value = data.email || ''
    // user_password.value remains as is unless specifically returned (not standard)
    try { toastSuccess('Profile saved') } catch (e) { /* ignore */ }
  })

  // Refresh faculty changes on intervals (optional light polling)
  try {
    const intervalId = setInterval(() => {
      loadPendingFacultyApprovals()
    }, 15000)
    onBeforeUnmount(() => { clearInterval(intervalId) })
  } catch (e) { /* ignore */ }
})

function showLogoutModal() {
  try {
    if (logoutModalAdmin && logoutModalAdmin.value && typeof logoutModalAdmin.value.show === 'function') {
      logoutModalAdmin.value.show()
      return
    }
    const el = document.getElementById('logout-modal-admin')
    if (el && window.bootstrap && typeof window.bootstrap.Modal === 'function') {
      const m = new window.bootstrap.Modal(el)
      m.show()
      return
    }
    const btn = document.querySelector('[data-bs-target="#logout-modal-admin"]')
    if (btn) btn.click()
  } catch (e) { console.error('Show logout modal failed', e) }
}

async function confirmLogout() {
  try { await logout() } catch (e) { console.error('Logout failed', e) }
}

// ==========================
// Watch section changes
// ==========================
watch(current, (newVal) => {
  if (newVal === 'dashboard') {
      get_dashboard_details((data) => {
      total_users.value = data.total_users
      total_question_sets.value = data.total_question_sets
    });

  }
  if (newVal === 'edit_account') {
      get_user_account_profile((data) => {
      user_profile_pic.value = buildAvatarUrl(data.avatar_url)
      user_full_name.value = data.full_name || data.username || ''
      user_email.value = data.email || ''
      user_password.value = data.password || ''
    });
  }
  if (newVal === 'user') {
      get_all_users((data) => {
      user_rows.value = data.users
    });
  }
  if (newVal === 'admin') {
      get_all_admins((data) => {
      admin_rows.value = data.admins
    });
  }
  if (newVal === 'question_set') {
      get_admin_questions((data) => {
      admin_question_rows.value = normalizeQuestions(data.questions)
    });
      get_user_questions((data) => {
      user_question_rows.value = normalizeQuestions(data.questions)
    });
      get_pending_questions((data) => {
      pending_question_rows.value = normalizeQuestions(data.questions)
    });
  }
  if (newVal === 'event') {
      get_global_events((data) => {
      global_event_rows.value = data.events
    });
      get_user_events((data) => {
      user_event_rows.value = data.events
    });
      get_pending_events((data) => {
      pending_event_rows.value = data.events
    });
  }
  if (newVal === 'blog') {
      get_global_blogs((data) => {
      global_blog_rows.value = data.blogs
    });
      get_user_blogs((data) => {
      user_blog_rows.value = data.blogs
    });
      get_pending_blogs((data) => {
      pending_blog_rows.value = data.blogs
    });
  }
  if (newVal === 'approval') {
      get_pending_approvals((data) => {
      pending_approval_events.value = data.events
      pending_approval_blogs.value = data.blogs
      pending_approval_problems.value = data.problems
    });
      get_approved_approvals((data) => {
      approved_approval_events.value = data.events
      approved_approval_blogs.value = data.blogs
      approved_approval_problems.value = data.problems
    });
      get_draft_questions((data) => {
      draft_questions.value = data.questions
    });
  }
});

// Debug watchers removed: cleaned up temporary tracing added during investigation

// ==========================
// Form submit wrapper
// ==========================
function handleRequestChangeUserAccountProfile(formData) {
  handle_request_change_user_account_profile(formData);
}

// ==========================
// Handle view problem modal
// ==========================
function handleViewProblem(problemId) {
  
  get_problem_details(problemId, (data) => {
    currentProblem.value = { ...data.problem, Topics: data.topics || [], TestSummary: data.TestSummary || null, LastRun: data.LastRun || null };
    currentTestCases.value = data.testCases;

    // Open the shared view modal once data is ready
    const modalEl = document.getElementById('viewProblemModal');
    if (modalEl && window.bootstrap?.Modal) {
      const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
      instance.show();
    }
  });
}

// ==========================
// Handle filter questions
// ==========================
function handleFilterQuestions(payload) {
  const { tableType, filters } = payload;
  // Quick debug: one concise log
  
  // Only filter the currently active table
  filter_questions(tableType, filters, (data) => {
    if (tableType === 'admin') {
      admin_question_rows.value = normalizeQuestions(data.questions || []);
    } else if (tableType === 'user') {
      user_question_rows.value = normalizeQuestions(data.questions || []);
    } else if (tableType === 'pending') {
      pending_question_rows.value = normalizeQuestions(data.questions || []);
    }
  });
}

// === CREATE-PROBLEM-FLOW: Admin submits a new question/problem
function handleRefreshProblems() {
  get_admin_questions((data) => {
    admin_question_rows.value = normalizeQuestions(data.questions);
  });
  get_user_questions((data) => {
    user_question_rows.value = normalizeQuestions(data.questions);
  });
  get_pending_questions((data) => {
    pending_question_rows.value = normalizeQuestions(data.questions);
  });
}

function handleCreateQuestion(problemPayload) {
  create_question(problemPayload, (response) => {
    if (!response.success) return;

    const status = response.status || 'pending';
    const message = status === 'approved'
      ? 'Question created and auto-approved'
      : 'Question submitted for approval';

    toastSuccess(message);

    if (status === 'approved') {
      get_admin_questions((data) => {
        admin_question_rows.value = normalizeQuestions(data.questions);
      });
    } else {
      get_pending_questions((data) => {
        pending_question_rows.value = normalizeQuestions(data.questions);
      });
    }
  });
}

// ==========================
// Handle test-run-recorded from child modal - refresh question lists
// ==========================
function handleTestRunRecorded(payload) {
  // Optimized: update only the affected row(s) when possible
  try {
    const pid = payload && (payload.ProblemID || payload.problemId || payload.problemID);
    const updateRow = (rowsRef) => {
      const idx = rowsRef.value.findIndex(r => r.QuestionID === pid);
      if (idx === -1) return false;
      // If payload contains TestSummary/LastRun, apply directly
      if (payload && (payload.TestSummary || payload.LastRun)) {
        const updated = Object.assign({}, rowsRef.value[idx]);
        if (payload.TestSummary) updated.TestSummary = payload.TestSummary;
        if (payload.LastRun) updated.LastRun = payload.LastRun;
        // Replace the single item to preserve reactivity
        rowsRef.value.splice(idx, 1, updated);
        return true;
      }
      return false;
    };

    let applied = false;
    if (pid) {
      applied = updateRow(admin_question_rows) || applied;
      applied = updateRow(user_question_rows) || applied;
      applied = updateRow(pending_question_rows) || applied;
    }

    // If we didn't have direct payload data or the row wasn't present in current lists,
    // fetch fresh details for the single problem and merge into lists where it exists.
    if (!applied && pid) {
      get_problem_details(pid, (res) => {
        if (!res || !res.success || !res.problem) return;
        const merged = normalizeQuestions([Object.assign({}, res.problem, { Topics: res.topics || [] })])[0];
        const mergeInto = (rowsRef) => {
          const i = rowsRef.value.findIndex(r => r.QuestionID === pid);
          if (i !== -1) rowsRef.value.splice(i, 1, Object.assign({}, rowsRef.value[i], merged, { TestSummary: res.TestSummary || null, LastRun: res.LastRun || null }));
        };
        mergeInto(admin_question_rows);
        mergeInto(user_question_rows);
        mergeInto(pending_question_rows);
      });
    }
  } catch (e) {
    // ignore
  }
}

// ==========================
// Handle event operations
// ==========================
function handleViewEvent(eventId) {
  
  get_event_details(eventId, (data) => {
    currentEvent.value = data.event;
    currentParticipants.value = data.participants;
    // Open view modal once data is ready
    try {
      const modalEl = document.getElementById('viewEventModal');
      if (modalEl && window.bootstrap?.Modal) {
        const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
        instance.show();
      }
    } catch (e) { /* ignore */ }
  });
}

function handleEditEvent(eventId) {
  
  get_event_details(eventId, (data) => {
    currentEvent.value = data.event;
    // Open edit modal when data loaded
    try {
      const modalEl = document.getElementById('editEventModal');
      if (modalEl && window.bootstrap?.Modal) {
        const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
        instance.show();
      }
    } catch (e) { /* ignore */ }
  });
}

function handleDeleteEvent(eventId) {
  if (confirm('Are you sure you want to delete this event?')) {
    delete_event(eventId, (response) => {
      if (response.success) {
        toastSuccess('Event deleted successfully');
        
        // Refresh event lists
        get_global_events((data) => {
          global_event_rows.value = data.events;
        });
        get_user_events((data) => {
          user_event_rows.value = data.events;
        });
      }
    });
  }
}

function handleManageParticipants(eventId) {
  
  get_event_details(eventId, (data) => {
    currentEvent.value = data.event;
    currentParticipants.value = data.participants;
    // Open participants modal
    try {
      const modalEl = document.getElementById('manageParticipantsModal');
      if (modalEl && window.bootstrap?.Modal) {
        const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
        instance.show();
      }
    } catch (e) { /* ignore */ }
  });
}

function handleCreateEvent(eventData) {
  
  create_event(eventData, (response) => {
    if (response.success) {
      toastSuccess('Event created and sent for approval');
      
      // Refresh pending events list
      get_pending_events((data) => {
        pending_event_rows.value = data.events;
      });
    }
  });
}

function handleUpdateEvent(eventData) {
  update_event(eventData, (response) => {
    if (response.success) {
      try { toastSuccess('Event updated successfully') } catch(e) { console.error('toastSuccess failed', e) }
      
      // Immediately update local lists for instant UX (replace matching event entries)
      try {
        const updateInList = (listRef) => {
          const idx = listRef.value.findIndex(it => (it.EventID || it.event_id) == (eventData.eventId || eventData.EventID));
          if (idx !== -1) {
            // create new object from server-updated fields where possible
            const existing = listRef.value[idx];
            const updated = { ...existing,
              EventID: eventData.eventId || eventData.EventID || existing.EventID || existing.event_id,
              EventName: eventData.eventName || eventData.EventName || existing.EventName,
              ThumbnailUrl: eventData.thumbnailUrl || existing.ThumbnailUrl,
              RewardPoints: eventData.rewardPoints || existing.RewardPoints,
              RewardLevel: eventData.rewardLevel || existing.RewardLevel,
              Status: eventData.status || existing.Status,
              StartsAt: eventData.startsAt || existing.StartsAt,
              EndsAt: eventData.endsAt || existing.EndsAt
            };
            // replace reactively
            listRef.value.splice(idx, 1, updated);
          }
        }
        updateInList(global_event_rows);
        updateInList(user_event_rows);
      } catch (e) { console.error('Immediate list update failed', e) }

      // Also refresh from server to ensure full sync
      get_global_events((data) => {
        global_event_rows.value = data.events;
      });
      get_user_events((data) => {
        user_event_rows.value = data.events;
      });
    }
  });
}

function handleApproveEvent(eventId, approvalId) {
  
  approve_event(eventId, approvalId, (response) => {
    if (response.success) {
      toastSuccess('Event approved successfully');
      
      // Refresh pending and global event lists
      get_pending_events((data) => {
        pending_event_rows.value = data.events;
      });
      get_global_events((data) => {
        global_event_rows.value = data.events;
      });
    }
  });
}

function handleDenyEvent(eventId, approvalId) {
  
  const reason = prompt('Enter reason for denial (optional):');
  
  deny_event(eventId, approvalId, reason, (response) => {
    if (response.success) {
      toastSuccess('Event denied successfully');
      
      // Refresh pending event list
      get_pending_events((data) => {
        pending_event_rows.value = data.events;
      });
    }
  });
}

// ==========================
// Handle question operations
// ==========================
function handleApproveQuestion(questionData) {
  const questionId = questionData.QuestionID;
  const approvalId = questionData.ApprovalID;
  
  
  approve_question(questionId, approvalId, (response) => {
    if (response.success) {
      toastSuccess('Question approved successfully');
      
      // Refresh pending and global question lists
      get_pending_questions((data) => {
        pending_question_rows.value = normalizeQuestions(data.questions);
      });
      get_admin_questions((data) => {
        admin_question_rows.value = normalizeQuestions(data.questions);
      });
    }
  });
}

function handleDenyQuestion(questionData) {
  const questionId = questionData.QuestionID;
  const approvalId = questionData.ApprovalID;
  
  
  const reason = prompt('Enter reason for denial (optional):');
  
  deny_question(questionId, approvalId, reason, (response) => {
    if (response.success) {
      toastSuccess('Question denied successfully');
      
      // Refresh pending question list
      get_pending_questions((data) => {
        pending_question_rows.value = normalizeQuestions(data.questions);
      });
      // Also refresh admin/user lists to keep tables in sync
      get_admin_questions((data) => {
        admin_question_rows.value = normalizeQuestions(data.questions);
      });
      get_user_questions((data) => {
        user_question_rows.value = normalizeQuestions(data.questions);
      });
    }
  });
}

function handleDeleteQuestion(payload) {
  let questionId = payload;
  let tableType = null;
  if (payload && typeof payload === 'object') {
    questionId = payload.questionId;
    tableType = payload.tableType || null;
  }

  if (confirm('Are you sure you want to delete this question?')) {
    delete_question(questionId, (response) => {
      if (response.success) {
        toastSuccess('Question deleted successfully');
        // Remove the deleted item locally for immediate UX
        admin_question_rows.value = admin_question_rows.value.filter(q => q.QuestionID !== questionId);
        user_question_rows.value = user_question_rows.value.filter(q => q.QuestionID !== questionId);
        pending_question_rows.value = pending_question_rows.value.filter(q => q.QuestionID !== questionId);

        // Ensure UI stays on the originating inner tab
        if (tableType === 'user') {
          window.dispatchEvent(new CustomEvent('setQuestionSection', { detail: { section: 'user_question', skipReapply: true } }))
        } else if (tableType === 'admin') {
          window.dispatchEvent(new CustomEvent('setQuestionSection', { detail: { section: 'admin_question', skipReapply: true } }))
        }

        // Schedule a background refresh of the affected list to sync with server
        setTimeout(() => {
          if (!tableType || tableType === 'admin') {
            get_admin_questions((data) => { admin_question_rows.value = normalizeQuestions(data.questions); });
          }
          if (!tableType || tableType === 'user') {
            get_user_questions((data) => { user_question_rows.value = normalizeQuestions(data.questions); });
          }
          if (!tableType || tableType === 'pending') {
            get_pending_questions((data) => { pending_question_rows.value = normalizeQuestions(data.questions); });
          }
        }, 300);
      }
    });
  }
}

function handleEditQuestion(questionData) {
  // Fetch full problem details including test cases and topics
  get_problem_details(questionData.QuestionID, (data) => {
    if (data.success && data.problem) {
      // Create complete question object with all details
      const fullQuestion = {
        ...data.problem,
        TestCases: data.testCases || [],
        Topics: data.topics || []
      }
      // Emit update event to content_question_set to trigger modal open
      current.value = 'question_set'
      // Dispatch custom event to open edit modal
      window.editingQuestionData = fullQuestion
      const event = new CustomEvent('openEditQuestion', { detail: fullQuestion })
      window.dispatchEvent(event)
    }
  });
}

function handleUpdateQuestion(problemPayload) {
  update_question(problemPayload, (response) => {
    if (!response.success) return;

    toastSuccess('Question updated successfully');

    // Close the edit/create modal immediately
    const modalEl = document.getElementById('adminCreateQuestionModal');
    if (modalEl && window.bootstrap?.Modal) {
      const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
      instance.hide();
    }

    // Refresh all question lists
    get_admin_questions((data) => {
      admin_question_rows.value = normalizeQuestions(data.questions);
    });
    get_user_questions((data) => {
      user_question_rows.value = normalizeQuestions(data.questions);
    });
    get_pending_questions((data) => {
      pending_question_rows.value = normalizeQuestions(data.questions);
    });
  });
}

function handleSubmitDraftQuestion(problemPayload) {
  // Update content then submit draft (draft->pending/approved)
  update_question(problemPayload, (response) => {
    if (!response.success) return;
    submit_draft(problemPayload.ProblemID, (res) => {
      if (res.success) {
        toastSuccess(res.message || 'Draft submitted');
        // Refresh all question lists
        get_admin_questions((data) => { admin_question_rows.value = normalizeQuestions(data.questions); });
        get_user_questions((data) => { user_question_rows.value = normalizeQuestions(data.questions); });
        get_pending_questions((data) => { pending_question_rows.value = normalizeQuestions(data.questions); });
      }
    });
  });
}

function handleMoveToDraftQuestion(problemPayload) {
  // Update content then move to draft
  update_question(problemPayload, (response) => {
    if (!response.success) return;
    move_to_draft(problemPayload.ProblemID, (res) => {
      if (res.success) {
        toastSuccess(res.message || 'Moved to draft');
        // Refresh all question lists
        get_admin_questions((data) => { admin_question_rows.value = normalizeQuestions(data.questions); });
        get_user_questions((data) => { user_question_rows.value = normalizeQuestions(data.questions); });
        get_pending_questions((data) => { pending_question_rows.value = normalizeQuestions(data.questions); });
      }
    });
  });
}

function handleMoveToPendingQuestion(problemPayload) {
  // Update content then move to pending
  update_question(problemPayload, (response) => {
    if (!response.success) return;
    move_to_pending(problemPayload.ProblemID, (res) => {
      if (res.success) {
        toastSuccess(res.message || 'Moved to pending');
        // Refresh all question lists
        get_admin_questions((data) => { admin_question_rows.value = normalizeQuestions(data.questions); });
        get_user_questions((data) => { user_question_rows.value = normalizeQuestions(data.questions); });
        get_pending_questions((data) => { pending_question_rows.value = normalizeQuestions(data.questions); });
      }
    });
  });
}

function handleDraftSaved(payload) {
  toastSuccess('Draft saved')
    // Refresh all lists to reflect the new draft
    get_admin_questions((data) => { admin_question_rows.value = normalizeQuestions(data.questions); });
    get_user_questions((data) => { user_question_rows.value = normalizeQuestions(data.questions); });
    get_pending_questions((data) => { pending_question_rows.value = normalizeQuestions(data.questions); });
    get_draft_questions((data) => { draft_questions.value = normalizeQuestions(data.questions); });
}

// ==========================
// Handle blog operations
// ==========================
function handleViewBlog(blogId) {
  get_blog_details(blogId, (data) => {
    currentBlog.value = data.blog;

    // Open the view modal once data is ready
    try {
      const modalEl = document.getElementById('viewBlogModal');
      if (modalEl && window.bootstrap?.Modal) {
        const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
        instance.show();
      }
    } catch (e) { /* ignore */ }
  });
}

function handleEditBlog(blogId) {
  get_blog_details(blogId, (data) => {
    currentBlog.value = data.blog;

    // Open the edit modal once data is ready
    try {
      const modalEl = document.getElementById('editBlogModal');
      if (modalEl && window.bootstrap?.Modal) {
        const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
        instance.show();
      }
    } catch (e) { /* ignore */ }
  });
}

function handleDeleteBlog(blogId) {
  if (confirm('Are you sure you want to delete this blog?')) {
    // Optimistically remove from local lists for immediate UI feedback
    const removeFrom = (arrRef) => {
      const idx = arrRef.value.findIndex(b => b.BlogID === blogId);
      if (idx !== -1) arrRef.value.splice(idx, 1);
    };
    removeFrom(global_blog_rows);
    removeFrom(user_blog_rows);
    removeFrom(pending_blog_rows);

    delete_blog(blogId, (response) => {
      if (response.success) {
        toastSuccess('Blog deleted successfully');
      } else {
        toastError(response.message || 'Failed to delete blog');
        // Re-sync lists from server on failure
        get_global_blogs((data) => { global_blog_rows.value = data.blogs; });
        get_user_blogs((data) => { user_blog_rows.value = data.blogs; });
        get_pending_blogs((data) => { pending_blog_rows.value = data.blogs; });
      }
    });
  }
}

function handleConfirmedDelete() {
  const candidate = window.__deleteCandidate;
  const candidateType = window.__deleteCandidateType || 'blog';
  if (!candidate) return;

  // hide confirmation modal if open
  try {
    const el = document.getElementById('deleteConfirmModal');
    if (el && window.bootstrap?.Modal) {
      const instance = window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el);
      instance.hide();
    }
  } catch (e) { /* ignore */ }

  if (candidateType === 'event') {
    const eventId = candidate;
    // Optimistically remove from local lists for immediate UX
    try {
      const removeFrom = (arrRef) => {
        const idx = arrRef.value.findIndex(b => (b.EventID || b.event_id) == eventId);
        if (idx !== -1) arrRef.value.splice(idx, 1);
      };
      removeFrom(global_event_rows);
      removeFrom(user_event_rows);
      removeFrom(pending_event_rows);
    } catch (e) { /* ignore */ }

    delete_event(eventId, (response) => {
      if (response.success) {
        try { toastSuccess('Event deleted successfully'); } catch (e) { /* ignore */ }

        // Refresh event lists from server to ensure sync
        get_global_events((data) => { global_event_rows.value = data.events; });
        get_user_events((data) => { user_event_rows.value = data.events; });
      } else {
        try { toastError(response.message || 'Failed to delete event'); } catch (e) { console.error('Delete failed', response); }
        // Re-sync lists on failure
        get_global_events((data) => { global_event_rows.value = data.events; });
        get_user_events((data) => { user_event_rows.value = data.events; });
      }

      // clear candidate
      try { window.__deleteCandidate = null; window.__deleteCandidateType = null } catch (e) { /* ignore */ }
    });
    return
  }

  // default: blog
  const blogId = candidate;
  // Optimistically remove from local lists for immediate UX
  const removeFrom = (arrRef) => {
    const idx = arrRef.value.findIndex(b => b.BlogID === blogId);
    if (idx !== -1) arrRef.value.splice(idx, 1);
  };
  removeFrom(global_blog_rows);
  removeFrom(user_blog_rows);
  removeFrom(pending_blog_rows);

  delete_blog(blogId, (response) => {
    if (response.success) {
      try { toastSuccess('Blog deleted successfully'); } catch (e) { /* ignore */ }

      // Refresh lists from server to ensure sync
      get_global_blogs((data) => { global_blog_rows.value = data.blogs; });
      get_user_blogs((data) => { user_blog_rows.value = data.blogs; });
      get_pending_blogs((data) => { pending_blog_rows.value = data.blogs; });
    } else {
      try { toastError(response.message || 'Failed to delete blog'); } catch (e) { console.error('Delete failed', response); }

      // Re-sync lists from server on failure
      get_global_blogs((data) => { global_blog_rows.value = data.blogs; });
      get_user_blogs((data) => { user_blog_rows.value = data.blogs; });
      get_pending_blogs((data) => { pending_blog_rows.value = data.blogs; });
    }

    // clear candidate
    try { window.__deleteCandidate = null; window.__deleteCandidateType = null } catch (e) { /* ignore */ }
  });
}

function handleCreateBlog(blogData) {
  create_blog(blogData, (response) => {
    
    if (response.success) {
      toastSuccess('Blog created successfully');
      
      // Refresh blog lists based on status
      if (blogData.Status === 'pending_review') {
        get_pending_blogs((data) => {
          pending_blog_rows.value = data.blogs;
        });
      } else {
        get_global_blogs((data) => {
          global_blog_rows.value = data.blogs;
        });
        get_user_blogs((data) => {
          user_blog_rows.value = data.blogs;
        });
      }
    } else {
      console.error('Blog creation failed:', response.message);
    }
  });
}

function handleUpdateBlog(blogData) {
  // Apply optimistic update to local lists for immediate UI update
  const applyUpdate = (arrRef) => {
    const idx = arrRef.value.findIndex(b => b.BlogID === blogData.BlogID);
    if (idx !== -1) {
      arrRef.value[idx] = {
        ...arrRef.value[idx],
        Title: blogData.Title,
        Content: blogData.Content,
        ThumbnailUrl: blogData.ThumbnailUrl || arrRef.value[idx].ThumbnailUrl,
        Status: blogData.Status,
        ContentType: blogData.ContentType
      };
    }
  };
  applyUpdate(global_blog_rows);
  applyUpdate(user_blog_rows);
  applyUpdate(pending_blog_rows);

  update_blog(blogData, (response) => {
    if (response.success) {
      toastSuccess('Blog updated successfully');
      // close the edit modal if it's open
      try {
        const el = document.getElementById('editBlogModal');
        if (el && window.bootstrap && typeof window.bootstrap.Modal === 'function') {
          const instance = window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el);
          instance.hide();
        } else {
          // fallback: remove modal-open class and backdrops
          document.body.classList.remove('modal-open');
          const backdrops = document.querySelectorAll('.modal-backdrop');
          backdrops.forEach(b => b.remove());
        }
      } catch (e) { console.error('Failed to close edit modal after update', e) }
    } else {
      toastError(response.message || 'Failed to update blog');
      // Re-sync lists from server on failure
      get_global_blogs((data) => { global_blog_rows.value = data.blogs; });
      get_user_blogs((data) => { user_blog_rows.value = data.blogs; });
      get_pending_blogs((data) => { pending_blog_rows.value = data.blogs; });
    }
  });
}

function handleApproveBlog(blogId, approvalId) {
  
  approve_blog(blogId, approvalId, (response) => {
    if (response.success) {
      toastSuccess('Blog approved successfully');
      
      // Refresh pending and global blog lists
      get_pending_blogs((data) => {
        pending_blog_rows.value = data.blogs;
      });
      get_global_blogs((data) => {
        global_blog_rows.value = data.blogs;
      });
    }
  });
}

function handleDenyBlog(blogId, approvalId) {
  
  const reason = prompt('Enter reason for denial (optional):');
  
  deny_blog(blogId, approvalId, reason, (response) => {
    if (response.success) {
      toastSuccess('Blog denied successfully');
      
      // Refresh pending blog list
      get_pending_blogs((data) => {
        pending_blog_rows.value = data.blogs;
      });
    }
  });
}

function handleAddParticipant(data) {
  // TODO: Implement add participant socket handler
  // socket emit add participant
}

function handleRemoveParticipant(data) {
  // TODO: Implement remove participant socket handler
  // socket emit remove participant
}

// ==========================
// Handle approval operations
// ==========================
function handleApproveItem(data) {
  const { approval_id, content_type } = data;
  
  approve_item(approval_id, content_type, (response) => {
    if (response.success) {
      toastSuccess('Item approved successfully');
      
      // Refresh both pending and approved lists
      get_pending_approvals((data) => {
        pending_approval_events.value = data.events;
        pending_approval_blogs.value = data.blogs;
        pending_approval_problems.value = data.problems;
      });
      get_approved_approvals((data) => {
        approved_approval_events.value = data.events;
        approved_approval_blogs.value = data.blogs;
        approved_approval_problems.value = data.problems;
      });
      get_draft_questions((data) => {
      draft_questions.value = normalizeQuestions(data.questions)
    });
    }
  });
}

function handleDenyItem(data) {
  const { approval_id, content_type } = data;
  
  const reason = prompt('Enter reason for denial (optional):');
  
  deny_item(approval_id, content_type, reason, (response) => {
    if (response.success) {
      toastSuccess('Item denied successfully');
      
      // Refresh pending list
      get_pending_approvals((data) => {
        pending_approval_events.value = data.events;
        pending_approval_blogs.value = data.blogs;
        pending_approval_problems.value = data.problems;
      });
      get_draft_questions((data) => {
        draft_questions.value = normalizeQuestions(data.questions);
      });
    }
  });
}

// ==========================
// Handle view approval modals
// ==========================
function openBootstrapModalById(id) {
  try {
    if (typeof window === 'undefined' || !window.bootstrap || !window.bootstrap.Modal) return
    const el = document.getElementById(id)
    if (!el) return
    const instance = window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el)
    instance.show()
  } catch (e) {
    console.error('Failed to open modal', id, e)
  }
}

function handleViewApprovalEvent(eventData) {
  currentApprovalEvent.value = eventData
  openBootstrapModalById('viewApprovalEventModal')
}

function handleViewApprovalBlog(blogData) {
  currentApprovalBlog.value = blogData
  openBootstrapModalById('viewApprovalBlogModal')
}

function handleViewApprovalQuestion(questionData) {
  currentApprovalQuestion.value = questionData

  // Fetch test cases for the problem before (or in parallel with) opening the modal
  if (questionData.problem_id) {
    get_problem_details(questionData.problem_id, (data) => {
      if (data.success && data.testCases) {
        currentApprovalQuestion.value = {
          ...questionData,
          test_cases: data.testCases.map(tc => ({
            test_case_id: tc.TestCaseID,
            test_case_number: tc.TestCaseNumber,
            is_sample: tc.IsSample,
            input_data: tc.InputData,
            expected_output: tc.ExpectedOutput,
            score: tc.Score
          }))
        }
      }
    })
  }

  openBootstrapModalById('viewApprovalQuestionModal')
}
</script>
