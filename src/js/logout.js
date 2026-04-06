// Dynamically resolve server URL — works for localhost and LAN testers
const SERVER_URL = (() => {
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3000';
  return 'http://' + h + ':3000';
})();

// Logout function with session management
export function logout() {
    const token = localStorage.getItem('token');
    
    if (token) {
        // Notify server to delete session from active_sessions table
        fetch(SERVER_URL + '/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            // Clear local storage and redirect
            localStorage.removeItem('token');
            window.user = null;
            window.location.href = '/signin.html';
        })
        .catch((err) => {
            console.error('Logout error:', err);
            // Still clear local storage even if server request fails
            localStorage.removeItem('token');
            window.user = null;
            window.location.href = '/signin.html';
        });
    } else {
        // No token, just redirect
        window.location.href = '/signin.html';
    }
}

// Auto-logout on page load if called from logout.html
if (typeof window !== 'undefined') {
    logout();
}