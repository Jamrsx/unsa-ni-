// Common avatar utilities: normalize URLs and broadcast/listen for updates

export function buildAvatarUrl(av) {
  if (!av) return '';
  if (av.startsWith('/')) return av + '?t=' + Date.now();
  if (av.includes('asset/profile')) return '/' + av.replace(/^\/+/, '') + '?t=' + Date.now();
  return '/asset/profile/' + av + '?t=' + Date.now();
}

export function broadcastAvatarUpdated(avatarPath) {
  try {
    window.dispatchEvent(new CustomEvent('avatar_updated', { detail: avatarPath }));
  } catch (e) { /* ignore */ }
}

export function onAvatarUpdated(handler) {
  try { window.addEventListener('avatar_updated', handler); } catch (e) { /* ignore */ }
}

export function offAvatarUpdated(handler) {
  try { window.removeEventListener('avatar_updated', handler); } catch (e) { /* ignore */ }
}
