// Dynamically resolve server URL — works for localhost and LAN testers
const SERVER_URL = (() => {
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3000';
  return 'http://' + h + ':3000';
})();

import { io } from "socket.io-client";
// create socket with handshake auth token so server can attach user on connect
import { getSocket } from './socket.js';
const getSock = () => {
    const s = getSocket();
    if (!s) {
        console.warn('[admin-dashboard] getSock: No socket available');
    }
    return s;
};

// error message helper
// deduplicating error helper to avoid repeated generic alerts
let __lastErr = { msg: null, t: 0 };
function err(message) {
    try {
        const now = Date.now();
        if (message === __lastErr.msg && (now - __lastErr.t) < 1000) return; // debounce identical errors
        __lastErr = { msg: message, t: now };
        // Avoid noisy generic server error alerts; log with stack to aid debugging.
        if (message === 'Server error') {
            console.error('Server error (suppressed alert):', message);
            // Log a client-side stack trace to help locate the caller.
            try { console.error(new Error('client-stack').stack); } catch (e) { /* ignore */ }
            return;
        }
        // For non-generic messages, surface them as before.
        console.error('UI error:', message);
        alert(message);
    } catch (e) { console.error('err helper failed', e); }
}

// ================================
// Load website dashboard details
// ================================
export function get_dashboard_details(callback) {
    const token_session = localStorage.getItem('jwt_token');

    // token is used for auth; debug logs removed

    getSock().emit('request_get_dashboard_details', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_dashboard_details');
    s.on("response_get_dashboard_details", (data) => {
        if (!data.success) {
            err(data.message || "Failed to load profile");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Get all users (admin only)
// ================================
export function get_all_users(callback) {
    const token_session = localStorage.getItem('jwt_token');

    // debug logs removed

    getSock().emit('request_get_all_users', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_all_users');
    s.on('response_get_all_users', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load users");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Listen to server updates for all users
// ================================
export function response_get_all_users(callback) {
    const s = getSock();
    if (!s) return;
    s.off('response_get_all_users');
    s.on('response_get_all_users', (data) => {
        if (data.success) {
            callback && callback(data);
        }
    });
}

// ================================
// Ban user (admin only) - PLACEHOLDER
// ================================
// This function performs a ban request via socket and returns the server response
// The server must implement `request_get_ban_user`/`response_get_ban_user` on the socket side.
export function ban_user(userId, callback) {
    const token_session = localStorage.getItem('jwt_token');

    try {
        getSock().emit('request_ban_user', { user_id: userId, token_session });

        const s = getSock();
        if (!s) return;
        s.off('response_ban_user');
        s.on('response_ban_user', (data) => {
            if (!data.success) {
                err(data.message || "Failed to ban user");
                return;
            }
            callback && callback(data);
        });
    } catch (e) {
        console.error('ban_user failed to send request', e);
        err('Failed to send ban request');
    }
}

// ================================
// Get all admins/faculty (admin only)
// ================================
export function get_all_admins(callback) {
    const token_session = localStorage.getItem('jwt_token');

    // debug logs removed

    getSock().emit('request_get_all_admins', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_all_admins');
    s.on('response_get_all_admins', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load admins");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Listen to server updates for all admins
// ================================
export function response_get_all_admins(callback) {
    const s = getSock();
    if (!s) return;
    s.off('response_get_all_admins');
    s.on('response_get_all_admins', (data) => {
        if (data.success) {
            callback && callback(data);
        }
    });
}

// ================================
// Get permissions for a specific admin (admin only)
// ================================
export function get_admin_permissions(target_user_id, callback) {
    const token_session = localStorage.getItem('jwt_token');

    // debug logs removed

    getSock().emit('request_get_admin_permissions', { token_session, target_user_id });

    const s = getSock();
    if (!s) return;
    s.off('response_get_admin_permissions');
    s.on('response_get_admin_permissions', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load admin permissions");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Update permissions for a specific admin (admin only)
// ================================
export function update_admin_permissions(target_user_id, overrides, callback) {
    const token_session = localStorage.getItem('jwt_token');

    // debug logs removed

    getSock().emit('request_update_admin_permissions', { token_session, target_user_id, overrides });

    const s = getSock();
    if (!s) return;
    s.off('response_update_admin_permissions');
    s.on('response_update_admin_permissions', (data) => {
        if (!data.success) {
            err(data.message || "Failed to update admin permissions");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Update role for a specific user (admin only)
// ================================
export function update_admin_role(target_user_id, role_name, callback) {
    const token_session = localStorage.getItem('jwt_token');

    // debug logs removed

    getSock().emit('request_update_admin_role', { token_session, target_user_id, role_name });

    const s = getSock();
    if (!s) return;
    s.off('response_update_admin_role');
    s.on('response_update_admin_role', (data) => {
        if (!data.success) {
            err(data.message || "Failed to update role");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Get admin questions (approved problems created by admins)
// ================================
export function get_admin_questions(callback) {
    const token_session = localStorage.getItem('jwt_token');

    // debug logs removed

    getSock().emit('request_get_admin_questions', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_admin_questions');
    s.on('response_get_admin_questions', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load admin questions");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Get user questions (approved problems created by users)
// ================================
export function get_user_questions(callback) {
    const token_session = localStorage.getItem('jwt_token');

    // debug logs removed

    getSock().emit('request_get_user_questions', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_user_questions');
    s.on('response_get_user_questions', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load user questions");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Delete question (admin only)
// ================================
export function delete_question(question_id, callback) {
    const token_session = localStorage.getItem('jwt_token');

    // debug logs removed

    getSock().emit('request_delete_question', { token_session, question_id });

    const s = getSock();
    if (!s) return;
    s.off('response_delete_question');
    s.on('response_delete_question', (data) => {
        if (!data.success) {
            err(data.message || "Failed to delete question");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Update existing question
// ================================
export function update_question(problemData, callback) {
    const token_session = localStorage.getItem('jwt_token');

    // debug logs removed

    try { console.log('[admin-dashboard] update_question SourceCode length=', (problemData.SourceCode||'').length, 'preview=', (problemData.SourceCode||'').slice(0,120)) } catch (e) {}
    getSock().emit('request_update_question', { token_session, problemData });

    const s = getSock();
    if (!s) return;
    s.off('response_update_question');
    s.on('response_update_question', (data) => {
        if (!data.success) {
            err(data.message || "Failed to update question");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Draft transitions
// ================================
export function submit_draft(problem_id, callback) {
    const token_session = localStorage.getItem('jwt_token');
    getSock().emit('request_submit_draft', { token_session, ProblemID: problem_id });
    const s = getSock();
    if (!s) return;
    s.off('response_submit_draft');
    s.on('response_submit_draft', (data) => {
        if (!data.success) {
            err(data.message || "Failed to submit draft");
            return;
        }
        callback && callback(data);
    });
}

export function move_to_draft(problem_id, callback) {
    const token_session = localStorage.getItem('jwt_token');
    getSock().emit('request_move_to_draft', { token_session, ProblemID: problem_id });
    const s = getSock();
    if (!s) return;
    s.off('response_move_to_draft');
    s.on('response_move_to_draft', (data) => {
        if (!data.success) {
            err(data.message || "Failed to move to draft");
            return;
        }
        callback && callback(data);
    });
}

export function move_to_pending(problem_id, callback) {
    const token_session = localStorage.getItem('jwt_token');
    getSock().emit('request_move_to_pending', { token_session, ProblemID: problem_id });
    const s = getSock();
    if (!s) return;
    s.off('response_move_to_pending');
    s.on('response_move_to_pending', (data) => {
        if (!data.success) {
            err(data.message || "Failed to move to pending");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Get pending questions (pending problems from all privilege levels)
// ================================
export function get_pending_questions(callback) {
    const token_session = localStorage.getItem('jwt_token');

    // debug logs removed

    getSock().emit('request_get_pending_questions', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_pending_questions');
    s.on('response_get_pending_questions', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load pending questions");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Filter questions with search, difficulty, topics, sort (admin only)
// ================================
export function filter_questions(tableType, filters, callback) {
    const token_session = localStorage.getItem('jwt_token');
    // tableType: 'admin', 'user', or 'pending'
    // filters: { search, sortOrder, difficulty, selectedTopics }

    // Minimal debug
    // console.log('[filter_questions] tableType:', tableType, 'filters:', filters)

    getSock().emit('request_filter_questions', {
        token_session,
        tableType,
        search: filters.search,
        sortOrder: filters.sortOrder,
        difficulty: filters.difficulty,
        topicIds: filters.selectedTopics
    });

    const s = getSock();
    if (!s) return;
    s.once('response_filter_questions', (data) => {
        if (!data.success) {
            err(data.message || "Failed to filter questions");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Get problem details with test cases (admin only)
// ================================
export function get_problem_details(problem_id, callback) {
    const token_session = localStorage.getItem('jwt_token');

    // debug logs removed

    getSock().emit('request_get_problem_details', { token_session, problem_id });

    const s = getSock();
    if (!s) return;
    s.once('response_get_problem_details', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load problem details");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// CREATE-PROBLEM-FLOW: create new problem/question (admin & elevated)
// ================================
export function create_question(problemData, callback) {
    const token_session = localStorage.getItem('jwt_token');

    // debug logs removed

    getSock().emit('request_create_problem', { token_session, problemData });

    const s = getSock();
    if (!s) return;
    s.once('response_create_problem', (data) => {
        if (!data.success) {
            err(data.message || "Failed to create question");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Get global events (approved events from all users)
// ================================
export function get_global_events(callback) {
    const token_session = localStorage.getItem('jwt_token');

    getSock().emit('request_get_global_events', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_global_events');
    s.on('response_get_global_events', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load global events");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Get user events (approved events created by current user)
// ================================
export function get_user_events(callback) {
    const token_session = localStorage.getItem('jwt_token');

    getSock().emit('request_get_user_events', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_user_events');
    s.on('response_get_user_events', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load user events");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Get pending events (pending events from all users)
// ================================
export function get_pending_events(callback) {
    const token_session = localStorage.getItem('jwt_token');

    getSock().emit('request_get_pending_events', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_pending_events');
    s.on('response_get_pending_events', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load pending events");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Get event details with participants (admin only)
// ================================
export function get_event_details(event_id, callback) {
    const token_session = localStorage.getItem('jwt_token');

    getSock().emit('request_get_event_details', { token_session, event_id });

    const s = getSock();
    if (!s) return;
    s.off('response_get_event_details');
    s.on('response_get_event_details', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load event details");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Create new event (admin only)
// ================================
export function create_event(eventData, callback) {
    const token_session = localStorage.getItem('jwt_token');

    getSock().emit('request_create_event', { token_session, eventData });

    const s = getSock();
    if (!s) return;
    s.off('response_create_event');
    s.on('response_create_event', (data) => {
        if (!data.success) {
            err(data.message || "Failed to create event");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Update existing event (admin only)
// ================================
// Approve event (admin only)
// ================================
export function approve_event(event_id, approval_id, callback) {
    const token_session = localStorage.getItem('jwt_token');

    getSock().emit('request_approve_event', { token_session, event_id, approval_id });

    const s = getSock();
    if (!s) return;
    s.off('response_approve_event');
    s.on('response_approve_event', (data) => {
        if (!data.success) {
            err(data.message || "Failed to approve event");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Deny event (admin only)
// ================================
export function deny_event(event_id, approval_id, reason, callback) {
    const token_session = localStorage.getItem('jwt_token');

    getSock().emit('request_deny_event', { token_session, event_id, approval_id, reason });

    const s = getSock();
    if (!s) return;
    s.off('response_deny_event');
    s.on('response_deny_event', (data) => {
        if (!data.success) {
            err(data.message || "Failed to deny event");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Approve question (admin only)
// ================================
export function approve_question(question_id, approval_id, callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('approve_question sending token:', token_session, 'question_id:', question_id, 'approval_id:', approval_id);

    getSock().emit('request_approve_question', { token_session, question_id, approval_id });

    const s = getSock();
    if (!s) return;
    s.off('response_approve_question');
    s.on('response_approve_question', (data) => {
        if (!data.success) {
            err(data.message || "Failed to approve question");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Deny question (admin only)
// ================================
export function deny_question(question_id, approval_id, reason, callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('deny_question sending token:', token_session, 'question_id:', question_id, 'approval_id:', approval_id, 'reason:', reason);

    getSock().emit('request_deny_question', { token_session, question_id, approval_id, reason });

    const s = getSock();
    if (!s) return;
    s.off('response_deny_question');
    s.on('response_deny_question', (data) => {
        if (!data.success) {
            err(data.message || "Failed to deny question");
            return;
        }
        callback && callback(data);
    });
}

// ================================
export function update_event(eventData, callback) {
    const token_session = localStorage.getItem('jwt_token');

    getSock().emit('request_update_event', { token_session, eventData });

    const s = getSock();
    if (!s) return;
    s.off('response_update_event');
    s.on('response_update_event', (data) => {
        // response_update_event received
        if (!data.success) {
            err(data.message || "Failed to update event");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Delete event (admin only)
// ================================
export function delete_event(event_id, callback) {
    const token_session = localStorage.getItem('jwt_token');

    getSock().emit('request_delete_event', { token_session, event_id });

    const s = getSock();
    if (!s) return;
    s.off('response_delete_event');
    s.on('response_delete_event', (data) => {
        if (!data.success) {
            err(data.message || "Failed to delete event");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// BLOG FUNCTIONS
// ================================

// Get global blogs (approved blogs from all users)
// ================================
export function get_global_blogs(callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('get_global_blogs sending token:', token_session);

    getSock().emit('request_get_global_blogs', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_global_blogs');
    s.on('response_get_global_blogs', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load global blogs");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Get user blogs (blogs created by current user)
// ================================
export function get_user_blogs(callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('get_user_blogs sending token:', token_session);

    getSock().emit('request_get_user_blogs', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_user_blogs');
    s.on('response_get_user_blogs', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load user blogs");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Get pending blogs (pending blogs awaiting approval)
// ================================
export function get_pending_blogs(callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('get_pending_blogs sending token:', token_session);

    getSock().emit('request_get_pending_blogs', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_pending_blogs');
    s.on('response_get_pending_blogs', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load pending blogs");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Get blog details (single blog by id)
// ================================
export function get_blog_details(blog_id, callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('get_blog_details sending token:', token_session, 'blog_id:', blog_id);

    getSock().emit('request_get_blog_details', { token_session, blog_id });

    const s = getSock();
    if (!s) return;
    s.off('response_get_blog_details');
    s.on('response_get_blog_details', (data) => {
        if (!data.success) {
            err(data.message || "Failed to load blog details");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Create new blog (admin only)
// ================================
export function create_blog(blogData, callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('create_blog sending token:', token_session, 'blogData:', blogData);

    getSock().emit('request_create_blog', { token_session, blogData });

    const s = getSock();
    if (!s) return;
    s.off('response_create_blog');
    s.on('response_create_blog', (data) => {
        console.log('Received response_create_blog:', data);
        if (!data.success) {
            err(data.message || "Failed to create blog");
            return;
        }
        console.log('Blog created successfully, invoking callback');
        callback && callback(data);
    });
}

// ================================
// Update existing blog (admin only)
// ================================
export function update_blog(blogData, callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('update_blog sending token:', token_session, 'blogData:', blogData);

    getSock().emit('request_update_blog', { token_session, blogData });

    const s = getSock();
    if (!s) return;
    s.off('response_update_blog');
    s.on('response_update_blog', (data) => {
        if (!data.success) {
            err(data.message || "Failed to update blog");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Approve blog (admin only)
// ================================
export function approve_blog(blog_id, approval_id, callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('approve_blog sending token:', token_session, 'blog_id:', blog_id, 'approval_id:', approval_id);

    getSock().emit('request_approve_blog', { token_session, blog_id, approval_id });

    const s = getSock();
    if (!s) return;
    s.off('response_approve_blog');
    s.on('response_approve_blog', (data) => {
        if (!data.success) {
            err(data.message || "Failed to approve blog");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Delete blog (admin only)
// ================================
export function delete_blog(blog_id, callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('delete_blog sending token:', token_session, 'blog_id:', blog_id);

    getSock().emit('request_delete_blog', { token_session, blog_id });

    const s = getSock();
    if (!s) return;
    s.off('response_delete_blog');
    s.on('response_delete_blog', (data) => {
        if (!data.success) {
            err(data.message || "Failed to delete blog");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Deny blog (admin only)
// ================================
export function deny_blog(blog_id, approval_id, reason, callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('deny_blog sending token:', token_session, 'blog_id:', blog_id, 'approval_id:', approval_id, 'reason:', reason);

    getSock().emit('request_deny_blog', { token_session, blog_id, approval_id, reason });

    const s = getSock();
    if (!s) return;
    s.off('response_deny_blog');
    s.on('response_deny_blog', (data) => {
        if (!data.success) {
            err(data.message || "Failed to deny blog");
            return;
        }
        callback && callback(data);
    });
}

// ========================================
// Approval Management Functions
// ========================================

export function get_pending_approvals(callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('get_pending_approvals sending token:', token_session);

    getSock().emit('request_get_pending_approvals', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_pending_approvals');
    s.on('response_get_pending_approvals', (data) => {
        if (!data.success) {
            err(data.message || "Failed to get pending approvals");
            return;
        }
        callback && callback(data);
    });
}

export function get_approved_approvals(callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('get_approved_approvals sending token:', token_session);

    getSock().emit('request_get_approved_approvals', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_approved_approvals');
    s.on('response_get_approved_approvals', (data) => {
        if (!data.success) {
            err(data.message || "Failed to get approved approvals");
            return;
        }
        callback && callback(data);
    });
}

/**
 * GET DRAFT QUESTIONS (Admin Only)
 * 
 * Fetches all questions with status='draft' from all users
 * Used by admin dashboard to view incomplete questions before submission
 * 
 * Flow:
 *   1. Get session token from localStorage
 *   2. Emit 'request_get_draft_questions' to backend
 *   3. Backend verifies admin role and fetches draft questions
 *   4. Response contains array of draft questions with author info
 * 
 * Response Data Structure:
 *   {
 *     success: boolean,
 *     questions: [
 *       {
 *         approval_id: number,
 *         question_name: string,
 *         question_difficulty: string,
 *         author_username: string,
 *         created_at: timestamp
 *       }
 *     ]
 *   }
 * 
 * @param {Function} callback - Called with response data on success
 */
export function get_draft_questions(callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('get_draft_questions sending token:', token_session);

    getSock().emit('request_get_draft_questions', { token_session });

    const s = getSock();
    if (!s) return;
    s.off('response_get_draft_questions');
    s.on('response_get_draft_questions', (data) => {
        if (!data.success) {
            err(data.message || "Failed to get draft questions");
            return;
        }
        callback && callback(data);
    });
}

export function approve_item(approval_id, content_type, callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('approve_item sending token:', token_session, 'approval_id:', approval_id, 'content_type:', content_type);

    socket.emit('request_approve_item', { token_session, approval_id, content_type });

    socket.off('response_approve_item');
    socket.on('response_approve_item', (data) => {
        if (!data.success) {
            err(data.message || "Failed to approve item");
            return;
        }
        callback && callback(data);
    });
}

export function deny_item(approval_id, content_type, reason, callback) {
    const token_session = localStorage.getItem('jwt_token');

    console.log('deny_item sending token:', token_session, 'approval_id:', approval_id, 'content_type:', content_type, 'reason:', reason);

    socket.emit('request_deny_item', { token_session, approval_id, content_type, reason });

    socket.off('response_deny_item');
    socket.on('response_deny_item', (data) => {
        if (!data.success) {
            err(data.message || "Failed to deny item");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Helpers: Approve/Deny from notification payload
// These helpers centralize approval flows originating from notifications
export function approve_from_notification(notificationData, callback) {
    try {
        if (!notificationData) return callback && callback({ success: false, message: 'No data' });
        const content_type = notificationData.content_type || notificationData.type || notificationData.data && notificationData.data.content_type || 'problem';
        const approval_id = notificationData.approval_id || (notificationData.data && notificationData.data.approval_id) || null;
        if (!approval_id) return callback && callback({ success: false, message: 'Missing approval id' });
        // delegate to the general approve_item helper
        approve_item(approval_id, content_type, callback);
    } catch (e) {
        console.error('approve_from_notification error', e);
        callback && callback({ success: false, message: e.message });
    }
}

export function deny_from_notification(notificationData, reason, callback) {
    try {
        if (!notificationData) return callback && callback({ success: false, message: 'No data' });
        const content_type = notificationData.content_type || notificationData.type || notificationData.data && notificationData.data.content_type || 'problem';
        const approval_id = notificationData.approval_id || (notificationData.data && notificationData.data.approval_id) || null;
        if (!approval_id) return callback && callback({ success: false, message: 'Missing approval id' });
        deny_item(approval_id, content_type, reason || 'Denied via notifications', callback);
    } catch (e) {
        console.error('deny_from_notification error', e);
        callback && callback({ success: false, message: e.message });
    }
}
