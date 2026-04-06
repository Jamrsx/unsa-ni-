/**
 * Faculty Dashboard Socket Helpers
 * Frontend wrapper functions for Socket.IO emit/listen patterns
 * Matches AdminDashboard pattern with callback-based async handlers
 */

// Global socket reference (set during app initialization)
let socket = null;

/**
 * Helper to safely listen for socket response without using arguments.callee
 * @param {string} eventName - The socket event to listen for
 * @param {function} callback - Callback to invoke when response arrives
 */
function createSafeSocketListener(eventName, callback) {
    const handler = (response) => {
        callback(response);
        socket.removeListener(eventName, handler);
    };
    return handler;
}

export function initSocket(io) {
    socket = io;
}

// === EDIT ACCOUNT ===
// Align with existing user endpoint used across dashboards
export function updateFacultyProfile({ token_session, full_name, email, new_password, current_password, profile_picture }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    // Map to request_change_user_account_profile for consistency
    socket.emit('request_change_user_account_profile', {
        username: full_name,
        email,
        previousPassword: current_password,
        password: new_password,
        token_session
    });
    socket.on('response_change_user_account_profile', createSafeSocketListener('response_change_user_account_profile', callback));
    // If avatar provided, trigger avatar change flow
    if (profile_picture) {
        socket.emit('request_change_user_account_profile_avatar', {
            token_session,
            imageBase64: profile_picture
        });
        socket.on('response_change_user_account_profile_avatar', createSafeSocketListener('response_change_user_account_profile_avatar', () => {}));
    }
}

// === USERS CRUD ===
export function getFacultyUsers({ token_session }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_get_faculty_users', { token_session });
    socket.on('response_get_faculty_users', createSafeSocketListener('response_get_faculty_users', callback));
}

export function viewFacultyUser({ token_session, user_id }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_view_faculty_user', { token_session, user_id });
    socket.on('response_view_faculty_user', createSafeSocketListener('response_view_faculty_user', callback));
}

// Lightweight wrapper for the shared admin/faculty ban handler.
// Server-side permissions (admin.ban_users / roles.manage) are the source of truth.
export function banUser({ token_session, user_id }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_ban_user', { token_session, user_id }, (ack) => {
        // Prefer explicit ack payload when provided
        if (ack && typeof callback === 'function') {
            callback(ack);
        }
    });
    socket.on('response_ban_user', createSafeSocketListener('response_ban_user', (resp) => {
        if (typeof callback === 'function') callback(resp);
    }));
}

// === PROBLEMS CRUD ===
export function getFacultyProblems({ token_session }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_get_faculty_problems', { token_session });
    socket.on('response_get_faculty_problems', createSafeSocketListener('response_get_faculty_problems', callback));
}

export function createFacultyProblem({ token_session, problem_name, description, difficulty, time_limit_seconds, memory_limit_mb, sample_solution, topics, test_cases }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_create_faculty_problem', { token_session, problem_name, description, difficulty, time_limit_seconds, memory_limit_mb, sample_solution, topics, test_cases });
    socket.on('response_create_faculty_problem', createSafeSocketListener('response_create_faculty_problem', callback));
}

export function updateFacultyProblem({ token_session, problem_id, problem_name, description, difficulty, time_limit_seconds, memory_limit_mb, sample_solution, topics, test_cases }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_update_faculty_problem', { token_session, problem_id, problem_name, description, difficulty, time_limit_seconds, memory_limit_mb, sample_solution, topics, test_cases });
    socket.on('response_update_faculty_problem', createSafeSocketListener('response_update_faculty_problem', callback));
}

export function deleteFacultyProblem({ token_session, problem_id }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_delete_faculty_problem', { token_session, problem_id });
    socket.on('response_delete_faculty_problem', createSafeSocketListener('response_delete_faculty_problem', callback));
}

// === EVENTS CRUD ===
export function getFacultyEvents({ token_session }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_get_faculty_events', { token_session });
    socket.on('response_get_faculty_events', createSafeSocketListener('response_get_faculty_events', callback));
}

export function createFacultyEvent({ token_session, event_name, description, starts_at, ends_at, thumbnail_url, thumbnail_data, thumbnail_file_name, reward_points, reward_level }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_create_faculty_event', { token_session, event_name, description, starts_at, ends_at, thumbnail_url, thumbnail_data, thumbnail_file_name, reward_points, reward_level });
    socket.on('response_create_faculty_event', createSafeSocketListener('response_create_faculty_event', callback));
}

export function updateFacultyEvent({ token_session, event_id, event_name, description, starts_at, ends_at, thumbnail_url, reward_points, reward_level, thumbnail_data, thumbnail_file_name }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_update_faculty_event', { token_session, event_id, event_name, description, starts_at, ends_at, thumbnail_url, reward_points, reward_level, thumbnail_data, thumbnail_file_name });
    socket.on('response_update_faculty_event', createSafeSocketListener('response_update_faculty_event', callback));
}

export function deleteFacultyEvent({ token_session, event_id }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_delete_faculty_event', { token_session, event_id });
    socket.on('response_delete_faculty_event', createSafeSocketListener('response_delete_faculty_event', callback));
}

// === BLOGS CRUD ===
export function getFacultyBlogs({ token_session }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_get_faculty_blogs', { token_session });
    socket.on('response_get_faculty_blogs', createSafeSocketListener('response_get_faculty_blogs', callback));
}

export function createFacultyBlog({ token_session, blog_title, blog_content, title, content, thumbnail_url, content_type, thumbnail_data, thumbnail_file_name }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_create_faculty_blog', { 
        token_session, 
        blog_title: blog_title || title,
        blog_content: blog_content || content,
        thumbnail_url,
        content_type,
        thumbnail_data,
        thumbnail_file_name
    });
    socket.on('response_create_faculty_blog', createSafeSocketListener('response_create_faculty_blog', callback));
}

export function updateFacultyBlog({ token_session, blog_id, blog_title, blog_content, title, content, thumbnail_url, content_type, thumbnail_data, thumbnail_file_name }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_update_faculty_blog', { 
        token_session, 
        blog_id, 
        blog_title: blog_title || title,
        blog_content: blog_content || content,
        thumbnail_url,
        content_type,
        thumbnail_data,
        thumbnail_file_name
    });
    socket.on('response_update_faculty_blog', createSafeSocketListener('response_update_faculty_blog', callback));
}

export function deleteFacultyBlog({ token_session, blog_id }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_delete_faculty_blog', { token_session, blog_id });
    socket.on('response_delete_faculty_blog', createSafeSocketListener('response_delete_faculty_blog', callback));
}

// === APPROVALS (Faculty Level - Pending Changes) ===
export function getFacultyPendingApprovals({ token_session }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_faculty_pending_changes', { token_session });
    socket.on('response_faculty_pending_changes', createSafeSocketListener('response_faculty_pending_changes', callback));
}

export function approveFacultyChange({ token_session, change_id, comment }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_faculty_approve_change', { token_session, change_id, comment });
    socket.on('response_faculty_approve_change', createSafeSocketListener('response_faculty_approve_change', callback));
}

export function rejectFacultyChange({ token_session, change_id, comment }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_faculty_reject_change', { token_session, change_id, comment });
    socket.on('response_faculty_reject_change', createSafeSocketListener('response_faculty_reject_change', callback));
}

// Update the proposed_data payload for a pending faculty change
// (status = 'pending_faculty_review') owned by the current faculty
// member. Used when editing draft/pending events/blogs before they
// are forwarded to admin.
export function updateFacultyChangeProposed({ token_session, change_id, proposed_data }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_update_faculty_change_proposed', { token_session, change_id, proposed_data });
    socket.on('response_update_faculty_change_proposed', createSafeSocketListener('response_update_faculty_change_proposed', callback));
}

// === APPROVALS (Admin Level - Faculty Pending Changes) ===
export function getAdminPendingFacultyApprovals({ token_session }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_admin_pending_faculty_changes', { token_session });
    socket.on('response_admin_pending_faculty_changes', createSafeSocketListener('response_admin_pending_faculty_changes', callback));
}

export function commitAdminFacultyChange({ token_session, change_id, comment }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_admin_commit_change', { token_session, change_id, comment });
    socket.on('response_admin_commit_change', createSafeSocketListener('response_admin_commit_change', callback));
}

export function rejectAdminFacultyChange({ token_session, change_id, comment }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_admin_reject_change', { token_session, change_id, comment });
    socket.on('response_admin_reject_change', createSafeSocketListener('response_admin_reject_change', callback));
}

// === Dashboard Initialization ===
export function getFacultyDashboard({ token_session }, callback) {
    if (!socket) {
        callback({ success: false, message: 'Socket not initialized' });
        return;
    }
    socket.emit('request_faculty_dashboard', { token_session });
    socket.on('response_faculty_dashboard', createSafeSocketListener('response_faculty_dashboard', callback));
}
