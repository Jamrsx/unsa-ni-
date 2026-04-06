import { io } from 'socket.io-client';

export function getSocket() {
  // Use window object to ensure shared across all Vue instances
  if (!window.__SHARED_SOCKET__) {
    let token = localStorage.getItem('jwt_token');
    if (!token) {
      token = localStorage.getItem('token'); // Fallback to legacy key
    }
    if (!token) {
      console.warn('[Socket] No token found, skipping connection');
      return null;
    }

    console.log('🔧 [SOCKET DEBUG] 1. Creating new socket instance');
    console.log('🔧 [SOCKET DEBUG] 2. Token exists:', !!token);

    // Dynamically resolve server URL — works for localhost AND LAN
    const SERVER_URL = (() => {
      if (window.SERVER_URL) return window.SERVER_URL;
      const h = window.location.hostname;
      if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3000';
      return 'http://' + h + ':3000';
    })();
    window.__SHARED_SOCKET__ = io(SERVER_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    });

    console.log('🔧 [SOCKET DEBUG] 3. Socket instance created');
    console.log('🔧 [SOCKET DEBUG] 4. Socket connected:', window.__SHARED_SOCKET__.connected);

    // 🔧 DEBUG: Track connection events
    window.__SHARED_SOCKET__.on('connect', () => {
      console.log('🔧 [SOCKET DEBUG] 5. ✅ Socket CONNECTED - ID:', window.__SHARED_SOCKET__.id);
      // clear any stale auth flag on new connect; server will re-emit when ready
      window.__SHARED_SOCKET__.authenticated = false;
      window.__SHARED_SOCKET__.user = null;
    });

    window.__SHARED_SOCKET__.on('authenticated', (data) => {
      console.log('🔧 [SOCKET DEBUG] 6. ✅ Socket AUTHENTICATED:', data);
      // store the sanitized user object on the socket so other modules can
      // inspect authentication state without needing to wait for an event.
      // the server sends { userId, username } but some code expects
      // socket.user.userId, so just copy the object directly.
      try {
        window.__SHARED_SOCKET__.user = data || {};
        // also add a simple boolean flag in case code wants to check it
        window.__SHARED_SOCKET__.authenticated = true;
      } catch (e) {
        console.warn('[Socket] failed to store authenticated user data', e);
      }
    });

    // Handle connection errors - don't immediately redirect, allow reconnection
    window.__SHARED_SOCKET__.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      console.error('🔧 [SOCKET DEBUG] 7. ❌ Connection error:', error);
      // Don't redirect on connection error - allow reconnection attempts
      // Only log the error for debugging
    });

    // Handle reconnection attempts
    // reconnection handlers (errors still logged)

    // Security: Handle force disconnect
    window.__SHARED_SOCKET__.on('force_disconnect', (data) => {
      // keep user-facing alert for forced disconnects
      alert(data.message || 'You have been logged in from another device/browser');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.__SHARED_SOCKET__ = null; // Clear the shared instance
      window.location.href = '/signin.html';
    });

    // Handle matchmaking errors
    window.__SHARED_SOCKET__.on('matchmaking_error', (data) => {
      alert(data.message || 'Matchmaking error occurred');
    });

    // Targeted approval_denied notification: show app toast if available
    window.__SHARED_SOCKET__.on('approval_denied', (data) => {
      if (!data) return;
      // if the server included a notification_id and we've already seen it, skip showing a duplicate toast
      try { window.__seenNotificationIds = window.__seenNotificationIds || new Set(); } catch (e) {}
      if (data.notification_id && window.__seenNotificationIds && window.__seenNotificationIds.has(data.notification_id)) return;
      import('../components/Toast.vue').then((mod) => {
        const fn = mod.toastError || mod.toastInfo || mod.showToast;
        if (fn) fn(data.message || 'Your submission was denied');
      }).catch(() => {});
    });

    // Targeted approval_approved notification: show success toast if available
    window.__SHARED_SOCKET__.on('approval_approved', (data) => {
      if (!data) return;
      try { window.__seenNotificationIds = window.__seenNotificationIds || new Set(); } catch (e) {}
      if (data.notification_id && window.__seenNotificationIds && window.__seenNotificationIds.has(data.notification_id)) return;
      import('../components/Toast.vue').then((mod) => {
        const fn = mod.toastSuccess || mod.toastInfo || mod.showToast;
        if (fn) fn(data.message || 'Your submission was approved');
      }).catch(() => {});
    });

    // ========================================
    // GLOBAL ABANDONMENT NOTIFICATIONS
    // These work across ALL pages (Duel, Onboarding, Result, etc.)
    // ========================================
// Queue for notifications that arrive before DOM is ready
let notificationQueue = [];
let isDOMReady = document.readyState === 'complete';

if (!isDOMReady) {
  window.addEventListener('load', () => {
    isDOMReady = true;
    // Process queued notifications
    notificationQueue.forEach(item => {
      if (item.type === 'penalty') {
        showGlobalAbandonmentPenalty(item.data);
      } else if (item.type === 'opponent') {
        showGlobalOpponentAbandoned(item.data);
      }
    });
    notificationQueue = [];
  });
}

// When YOU abandon a match
window.__SHARED_SOCKET__.on('abandonment_penalty', (data) => {
  if (isDOMReady) {
    showGlobalAbandonmentPenalty(data);
  } else {
    notificationQueue.push({ type: 'penalty', data });
  }
});

// When OPPONENT abandons (you win)
window.__SHARED_SOCKET__.on('opponent_abandoned', (data) => {
  if (isDOMReady) {
    showGlobalOpponentAbandoned(data);
  } else {
    notificationQueue.push({ type: 'opponent', data });
  }
});

    // When an admin denies one of your approvals — show app toast if available
    window.__SHARED_SOCKET__.on('approval_denied', (data) => {
      if (!data) return;
      import('../components/Toast.vue').then((mod) => {
        const fn = mod.toastError || mod.toastInfo || mod.toastSuccess || mod.showToast;
        if (fn) fn(data.message || 'One of your submissions was denied.');
      }).catch(() => {});
    });

    // When an admin approves one of your approvals — show app success toast
    window.__SHARED_SOCKET__.on('approval_approved', (data) => {
      if (!data) return;
      import('../components/Toast.vue').then((mod) => {
        const fn = mod.toastSuccess || mod.toastInfo || mod.showToast;
        if (fn) fn(data.message || 'One of your submissions was approved.');
      }).catch(() => {});
    });

    // Handle connection events
    window.__SHARED_SOCKET__.on('connect', () => {
      // Check for pending notifications on connect
      setTimeout(() => {
        window.__SHARED_SOCKET__.emit('check_pending_notifications');
      }, 500);
    });

    window.__SHARED_SOCKET__.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // Server forcefully disconnected, clear instance
        window.__SHARED_SOCKET__ = null;
      }
      // For other disconnect reasons (client disconnect, transport close),
      // socket.io will automatically try to reconnect
    });

    // shared socket instance created
  } else {
    // reusing existing shared socket instance
    if (window.__SHARED_SOCKET__.connected) {
      setTimeout(() => {
        window.__SHARED_SOCKET__.emit('check_pending_notifications');
      }, 500);
    }
  }

  return window.__SHARED_SOCKET__;
}

// Reset socket (useful for testing or manual disconnect)
export function resetSocket() {
  if (window.__SHARED_SOCKET__) {
    window.__SHARED_SOCKET__.disconnect();
    window.__SHARED_SOCKET__ = null;
  }
}

// ========================================
// GLOBAL NOTIFICATION FUNCTIONS
// ========================================

// Show abandonment penalty notification (when YOU abandon)
function showGlobalAbandonmentPenalty(data) {
  // Remove any existing notification
  const existing = document.getElementById('global-abandon-notification');
  if (existing) {
    existing.remove();
  }

  const overlay = document.createElement('div');
  overlay.id = 'global-abandon-notification';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999;
    backdrop-filter: blur(12px) saturate(180%);
    animation: fadeIn 0.3s ease-out;
  `;
  
  const card = document.createElement('div');
  card.style.cssText = `
    background: rgba(241, 39, 17, 0.9);
    background-image: linear-gradient(135deg, rgba(241, 39, 17, 0.95) 0%, rgba(245, 175, 25, 0.95) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 40px;
    border-radius: 24px;
    box-shadow: 0 25px 70px rgba(241, 39, 17, 0.4), 0 10px 25px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    text-align: center;
    animation: shakeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes shakeIn {
      0% { transform: scale(0.5) rotate(-5deg); opacity: 0; }
      50% { transform: scale(1.05) rotate(5deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  const title = document.createElement('h2');
  title.textContent = '⚠️ Match Abandonment Penalty';
  title.style.cssText = 'margin: 0 0 20px 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);';
  
  const message = document.createElement('p');
  message.textContent = data.message || 'You abandoned a match.';
  message.style.cssText = 'margin: 0 0 20px 0; font-size: 18px; line-height: 1.6;';
  
  const details = document.createElement('div');
  details.style.cssText = 'margin: 20px 0; padding: 20px; background: rgba(255,255,255,0.15); border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);';
  
  let detailsHTML = `<p style="margin: 10px 0; font-size: 14px;">Abandon Count: <strong>${data.abandonCount || 0}</strong></p>`;
  detailsHTML += `<p style="margin: 10px 0; font-size: 18px; color: #ffcccc;">Penalty: <strong>${data.penaltyDP || 0} DP</strong></p>`;
  
  if (data.isBanned) {
    detailsHTML += '<p style="margin: 15px 0; padding: 15px; background: rgba(255,0,0,0.3); border-radius: 8px; font-size: 16px; font-weight: bold;">🚫 You are now BANNED from matchmaking!</p>';
    detailsHTML += '<p style="margin: 10px 0; font-size: 14px;">You cannot join any matches until your ban is lifted.</p>';
  }
  
  details.innerHTML = detailsHTML;
  
  const button = document.createElement('button');
  button.textContent = 'I Understand';
  button.style.cssText = `
    padding: 12px 40px;
    margin-top: 20px;
    background: rgba(255, 255, 255, 0.95);
    color: #f12711;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  `;
  button.onmouseover = () => { 
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
  };
  button.onmouseout = () => { 
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
  };
  button.onclick = () => {
    document.body.removeChild(overlay);
  };
  
  card.appendChild(title);
  card.appendChild(message);
  card.appendChild(details);
  card.appendChild(button);
  overlay.appendChild(card);
  
  document.body.appendChild(overlay);
}

// Show opponent abandoned notification (when OPPONENT abandons)
function showGlobalOpponentAbandoned(data) {
  // Remove any existing notification
  const existing = document.getElementById('global-opponent-abandon-notification');
  if (existing) {
    existing.remove();
  }

  const overlay = document.createElement('div');
  overlay.id = 'global-opponent-abandon-notification';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999;
    backdrop-filter: blur(10px) saturate(180%);
    animation: fadeIn 0.3s ease-out;
  `;
  
  const card = document.createElement('div');
  card.style.cssText = `
    background: rgba(102, 126, 234, 0.85);
    background-image: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 40px;
    border-radius: 24px;
    box-shadow: 0 25px 70px rgba(102, 126, 234, 0.4), 0 10px 25px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    text-align: center;
    animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateY(-30px) scale(0.95);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  const title = document.createElement('h2');
  title.textContent = '🏆 Match Ended - Opponent Forfeited!';
  title.style.cssText = 'margin: 0 0 20px 0; font-size: 28px; font-weight: bold;';
  
  const message = document.createElement('p');
  message.textContent = data.message || 'Your opponent left the match.';
  message.style.cssText = 'margin: 0 0 15px 0; font-size: 18px; line-height: 1.6;';
  
  const details = document.createElement('div');
  details.style.cssText = 'margin: 20px 0; padding: 20px; background: rgba(255,255,255,0.2); border-radius: 10px;';
  
  let detailsHTML = '<p style="margin: 10px 0; font-size: 16px;">✨ <strong>You win by forfeit!</strong></p>';
  
  if (data.bonusDP > 0) {
    detailsHTML += `<p style="margin: 10px 0; font-size: 20px; color: #ffd700;">💰 <strong>+${data.bonusDP} Duel Points Bonus!</strong></p>`;
  }
  
  details.innerHTML = detailsHTML;
  
  const button = document.createElement('button');
  button.textContent = 'Awesome!';
  button.style.cssText = `
    padding: 12px 40px;
    margin-top: 20px;
    background: rgba(255, 255, 255, 0.95);
    color: #667eea;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  `;
  button.onmouseover = () => { 
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
  };
  button.onmouseout = () => { 
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
  };
  button.onclick = () => {
    document.body.removeChild(overlay);
    // Redirect to duel page after dismissing notification
    window.location.href = '/duel.html';
  };
  
  card.appendChild(title);
  card.appendChild(message);
  card.appendChild(details);
  card.appendChild(button);
  overlay.appendChild(card);
  
  document.body.appendChild(overlay);

}

// helper to refresh auth token on the socket (if needed)
export function refreshSocketAuth() {
  try {
    if (window.__SHARED_SOCKET__) {
      const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
      window.__SHARED_SOCKET__.auth = { token };
      window.__SHARED_SOCKET__.disconnect().connect();
    }
  } catch (e) {
    console.error('Failed to refresh socket auth', e);
  }
}