const API_URL = import.meta.env.VITE_API_URL;

export function auth() {
    const token = localStorage.getItem('token');

    // Same-tab reactive check
    function checkToken() {
        // Do not force-redirect when on public landing page
        const isLanding = (typeof window !== 'undefined') && window.location.pathname.includes('landing.html');
        if (isLanding) return; // allow landing page to remain public

        if (!localStorage.getItem('token')) {
            window.location.href = '/signin.html';
        }
    }

    // Call immediately for same-tab
    checkToken();

    // Optional: call periodically (polling) for instant detection
    setInterval(checkToken, 500); // every 500ms

    // Cross-tab detection
    window.addEventListener('storage', (event) => {
        // If token was removed from another tab, redirect unless on landing page
        if (event.key === 'token' && event.newValue === null) {
            const isLanding = (typeof window !== 'undefined') && window.location.pathname.includes('landing.html');
            if (!isLanding) {
                window.location.href = '/signin.html';
            }
        }
    });

    // Verify token with backend
    if (!token) return; // already handled by checkToken

    // jwt conn  - step 3/5
    fetch(`${API_URL}/verify-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => {
            console.log('Verify response status:', res.status);
            return res.json();
        })
        .then(data => {
            console.log('Verify response data:', data);
            if (!data.success) {
                localStorage.removeItem('token');
                window.location.href = '/signin.html';
            } else {
                window.user = data.user;
                // Also store in localStorage for persistence
                localStorage.setItem('user', JSON.stringify(data.user));
                console.log('[Auth] User authenticated:', {
                    id: data.user.id,
                    username: data.user.username,
                    id_type: typeof data.user.id
                });
                console.log("Authenticated as:", data.user.username);
            }
        })
        .catch(err => {
            console.error(err);
            localStorage.removeItem('token');
            window.location.href = '/signin.html';
        });
}

// to logout: use this function
// 
// export function logout() {
//     localStorage.removeItem('token');
//     window.location.href = '/signin.html';
// }
