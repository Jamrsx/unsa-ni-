import { getSocket } from './socket.js';
import { uiStore } from './ui-store.js';
import { can, getPermissions, ensureCan } from './permissions.js';

// error message helper
function err(message) {
    uiStore.error(message);
}

// ================================
// Load user profile
// ================================
export function get_user_account_profile(callback) {
    const token_session = localStorage.getItem("jwt_token") || localStorage.getItem("token");
    console.log('get_user_account_profile sending token:', token_session);
    const sock = getSocket();
    if (!sock) { console.error('No socket available for get_user_account_profile'); return; }

    sock.emit('request_get_user_account_profile', { token_session });

    sock.once("response_get_user_account_profile", (data) => {
        if (!data.success) {
            err(data.message || "Failed to load profile");
            return;
        }
        callback && callback(data);
    });
}

// ================================
// Send update request
// ================================
export function handle_request_change_user_account_profile(data) {
    const token_session = localStorage.getItem("jwt_token") || localStorage.getItem("token");

    const {
        username,
        email,
        previousPassword,
        password,
        confirmPassword,
        full_name,
        bio,
        country,
        avatar_url
    } = data;

    const passwordPattern = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if ((password || confirmPassword) && !previousPassword) {
        err('Please enter your current password to change to a new password');
        return;
    }

    if (password && !passwordPattern.test(password)) {
        err('Password is weak: Must be at least 8 characters and contain at least one symbol');
        return;
    }

    if (password !== confirmPassword) {
        err("Password confirmation not matched");
        return;
    }

    console.log('request_change_user_account_profile sending token:', token_session);
    const sock = getSocket();
    if (!sock) { console.error('No socket available for change profile request'); return; }

    sock.emit('request_change_user_account_profile', {
        username,
        email,
        previousPassword,
        password,
        full_name,
        bio,
        country,
        avatar_url,
        token_session
    });
}

// ================================
// Listen for update result
// ================================
export function response_change_user_account_profile(callback) {
    const sock = getSocket();
    if (!sock) { console.error('No socket available for response_change_user_account_profile'); return; }
    sock.off("response_change_user_account_profile");

    sock.on("response_change_user_account_profile", (data) => {
        if (!data.success) {
            err(data.message);
        }
        callback && callback(data);
    });
}

// ================================
// Change avatar (cropper) request
// ================================
export function request_change_user_account_profile_avatar(imageBase64) {
    const token_session = localStorage.getItem("jwt_token") || localStorage.getItem("token");
    console.log('request_change_user_account_profile_avatar sending token:', token_session);
    const sock = getSocket();
    if (!sock) { console.error('No socket available for request_change_user_account_profile_avatar'); return; }

    sock.emit('request_change_user_account_profile_avatar', {
        token_session,
        image: imageBase64
    });
}

export function response_change_user_account_profile_avatar(callback) {
    const sock = getSocket();
    if (!sock) { console.error('No socket available for response_change_user_account_profile_avatar'); return; }
    sock.off('response_change_user_account_profile_avatar');
    sock.on('response_change_user_account_profile_avatar', (data) => {
        if (!data.success) {
            err(data.message || 'Failed to change avatar');
            return;
        }
        callback && callback(data);
    });
}

// ================================
// get user session's statistic detail response
// ================================
export function get_user_statistics(callback) {
    const token_session = localStorage.getItem("jwt_token") || localStorage.getItem("token");

    const sock = getSocket();
    if (!sock) { console.error('No socket available for get_user_statistics'); return; }
    sock.emit('request_get_user_statistics', { token_session });

    sock.once("response_get_user_statistics", (data) => {
        if (!data.success) {
            err(data.message || "Failed to load statistics");
            return;
        }
        callback && callback(data);
    });
}

// ----------------------
// Permission helper utilities
// ----------------------
export function normalizeTopic(t) {
    if (!t) return '';
    const s = (t.TopicName || t || '').toString().trim().toLowerCase();
    return s.replace(/[^a-z0-9]+/g, '_');
}

export function topicPermissionAllowed(topics, permBase) {
    try {
        if (can(permBase)) return true;
        const perms = getPermissions();
        if (perms.includes(`${permBase}.any`)) return true;
        if (perms.some(p => p.startsWith(`${permBase}.`) && !p.endsWith('.own') && p !== `${permBase}.any`)) return true;
        const names = (topics || []).map(t => normalizeTopic(t)).filter(Boolean);
        if (!names.length) return false;
        return names.some(n => can(`${permBase}.${n}`));
    } catch (e) {
        return false;
    }
}

export function get_user_match_history(callback) {
    const token_session = localStorage.getItem("jwt_token") || localStorage.getItem("token");
    const sock = getSocket();
    if (!sock) return;
    sock.emit('request_get_user_match_history', { token_session });
    sock.once("response_get_user_match_history", (data) => {
        if (data.success && callback) callback(data);
    });
}

export async function ensureProblemEditAllowed(topics) {
    try {
        const [anyAllowed, ownAllowed] = await Promise.all([ensureCan('problem.edit.any'), ensureCan('problem.edit.own')])
        if (anyAllowed || ownAllowed) return true
        return topicPermissionAllowed(topics, 'problem.edit')
    } catch (e) {
        return false
    }
}