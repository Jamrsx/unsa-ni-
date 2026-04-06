import { getSocket } from './socket.js';

function err(message) {
    console.error(message);
}

// normalize avatar URL like UserDashboard
export function buildAvatarUrl(av) {
    if (!av) return '';
    if (av.startsWith('/')) return av + '?t=' + Date.now();
    if (av.includes('asset/profile')) return '/' + av.replace(/^\/+/, '') + '?t=' + Date.now();
    return '/asset/profile/' + av + '?t=' + Date.now();
}

// request header profile (reuses server event used elsewhere)
export function get_header_profile(callback) {
    const token_session = localStorage.getItem('jwt_token');
    console.log('get_header_profile sending token:', token_session);
    const s = getSocket();
    if (!s) {
        console.warn('No socket available for get_header_profile');
        return;
    }

    s.emit('request_get_user_account_profile', { token_session });

    s.once('response_get_user_account_profile', (data) => {
        if (!data.success) {
            err(data.message || 'Failed to load header profile');
            return;
        }
        callback && callback(data);
    });
}

// listen for profile changes (e.g., after user updates avatar)
export function on_header_profile_change(callback) {
    const s = getSocket();
    if (!s) {
        console.warn('No socket available for on_header_profile_change');
        return;
    }

    s.off('response_change_user_account_profile');
    s.on('response_change_user_account_profile', (data) => {
        if (!data.success) {
            err(data.message || 'Profile update error');
            return;
        }
        callback && callback(data);
    });
}

// listen for avatar-specific profile changes to update header image immediately
export function on_header_avatar_change(callback) {
    const s = getSocket();
    if (!s) {
        console.warn('No socket available for on_header_avatar_change');
        return;
    }

    s.off('response_change_user_account_profile_avatar');
    s.on('response_change_user_account_profile_avatar', (data) => {
        if (!data.success) {
            err(data.message || 'Avatar update error');
            return;
        }
        callback && callback(data);
    });
}

// request user's primary role from server
export function get_user_primary_role(callback) {
    const token_session = localStorage.getItem('token');
    const s = getSocket();
    if (!s) {
        console.warn('No socket available for get_user_primary_role');
        callback && callback(null);
        return;
    }

    s.emit('request_get_user_primary_role', { token_session });
    s.once('response_get_user_primary_role', (data) => {
        if (!data.success) {
            err(data.message || 'Failed to get user role');
            callback && callback(null);
            return;
        }
        callback && callback(data.role);
    });
}