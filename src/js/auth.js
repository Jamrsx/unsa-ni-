// Dynamically resolve API URL — works for localhost and LAN testers
const API_URL = (() => {
    const h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3000';
    return 'http://' + h + ':3000';
})();

export function auth() {
    const token = localStorage.getItem('jwt_token');
    console.log("Auth check - Token exists:", !!token);

    // No token at all — redirect immediately
    if (!token) {
        console.log("No token found, redirecting to signin");
        window.location.href = '/signin.html';
        return;
    }

    // Cross-tab logout detection
    window.addEventListener('storage', (event) => {
        if (event.key === 'jwt_token' && event.newValue === null) {
            window.location.href = '/signin.html';
        }
    });

    // Verify token with server
    fetch(`${API_URL}/verify-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            console.log("Verify response data:", data);
            if (!data.success) {
                console.log("Token verification failed — removing token");
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('token'); // Cleanup legacy
                window.location.href = '/signin.html';
            } else {
                window.user = data.user;
                console.log("Authenticated as:", data.user.username);
            }
        })
        .catch((err) => {
            // Network error — do NOT delete the token or redirect.
            // The user is likely on LAN and the verify request is slow/failing.
            // They have a valid token; let them stay on the page.
            console.warn("Auth verify request failed (network issue) — staying on page:", err.message);
        });
}

// To logout: send server request, clear local session and redirect
export async function logout() {
    try {
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
        if (token) {
            try {
                await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (e) {
                console.warn('Logout request failed:', e);
            }
        }
    } finally {
        // Thorough cleanup of all possible session keys
        const keysToRemove = ['jwt_token', 'token', 'user', 'permissions', 'role'];
        keysToRemove.forEach(key => {
            try { localStorage.removeItem(key); } catch (e) {}
        });
        
        try { window.user = null; } catch (e) {}
        try {
            if (window.socket && typeof window.socket.disconnect === 'function') {
                window.socket.disconnect();
            }
        } catch (e) {}
        setTimeout(() => {
            window.location.href = '/signin.html';
        }, 150);
    }
}
