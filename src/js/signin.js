// Dynamically resolve server URL — works for localhost and LAN
const SERVER_URL = (() => {
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3000';
  return 'http://' + h + ':3000';
})();

window.SERVER_URL = SERVER_URL;

import { io } from "socket.io-client";
import { resetSocket } from './socket.js';

// Pre-auth socket — connects immediately on page load
const signinSocket = io(SERVER_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

signinSocket.on('connect', () => {
  console.log('[Signin] Pre-auth socket connected:', signinSocket.id);
  // Hide any "connecting..." UI if present
  const btn = document.querySelector('button[type="submit"], .login-btn, input[type="submit"]');
  if (btn) btn.disabled = false;
});

signinSocket.on('connect_error', (err) => {
  console.error('[Signin] Connection error:', err.message);
});

function err(message) {
  alert(message);
}

// Wait for socket to connect, then run callback. Times out after 8s.
function waitForConnection(callback) {
  if (signinSocket.connected) {
    callback();
    return;
  }
  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed += 200;
    if (signinSocket.connected) {
      clearInterval(interval);
      callback();
    } else if (elapsed >= 8000) {
      clearInterval(interval);
      err('Cannot connect to server. Make sure the server is running and try again.');
    }
  }, 200);
}

export function handleSignIn(e) {
  const email = e.target.email.value;
  const password = e.target.password.value;

  // Show loading state on submit button
  const submitBtn = e.target.querySelector('button, input[type="submit"]');
  const originalText = submitBtn?.textContent;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Connecting...';
  }

  waitForConnection(() => {
    if (submitBtn) submitBtn.textContent = 'Logging in...';
    signinSocket.emit('signin', { email, password });
  });

  // Restore button if something goes wrong after 10s
  setTimeout(() => {
    if (submitBtn && submitBtn.disabled) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText || 'Login';
    }
  }, 10000);
}

export function response() {
  signinSocket.once('signin_result', (data) => {
    console.log("LOGIN RESPONSE:", data);
    if (data.success) {
      const token = data.token;
      console.log("TOKEN:", token);
      localStorage.setItem('jwt_token', token);
      // Decrypt/Decode JWT to get user role
      let role = 'user';
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        role = (payload.role || 'user').toLowerCase();
        console.log("REDIRECTING TO:", role);
      } catch (e) {
        console.error("Failed to decode token role, defaulting to user dashboard", e);
      }

      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

      resetSocket();
      signinSocket.disconnect();

      setTimeout(() => {
        if (role === 'admin') window.location.href = '/admin-dashboard.html';
        else if (role === 'faculty') window.location.href = '/faculty-dashboard.html';
        else window.location.href = '/user-dashboard.html';
      }, 50);
    } else {
      // Re-enable submit button on failure
      const submitBtn = document.querySelector('button, input[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      }
      err(data.message || 'Login failed. Please try again.');
    }
  });
}
