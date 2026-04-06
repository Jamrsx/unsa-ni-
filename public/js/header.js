document.addEventListener('DOMContentLoaded', () => {
  const headerHTML = `
    <header class="main-header">
      <div class="logo">CodeDuel</div>
      <nav class="navbar">
        <ul>
          <li><a href="dashboard.html">Home</a></li>
          <li><a href="#">Single</a></li>
          <li><a href="duel.html">Duel</a></li>
          <li><a href="#">Leaderboards</a></li>
        </ul>
      </nav>
      <div class="header-right">
        <span id="userWelcome"></span>
        <button id="logoutBtn">Logout</button>
        <button id="settingsBtn" title="Settings">*cog wheel*</button>
      </div>
    </header>
  `;

  // Add header at top of body
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  // Display username if logged in
  if (window.user) {
    document.getElementById('userWelcome').textContent = `Welcome, ${window.user.username}`;
  }

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'signin.html';
  });
});
