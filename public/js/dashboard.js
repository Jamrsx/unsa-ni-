import { getsocket } from './socket.js';
const socket = getsocket();

// Wait until user is authenticated
window.addEventListener("load", () => {
  if (!window.user) return;

  console.log("Dashboard loaded for:", window.user.username);

  // Show user info somewhere (optional)
  const userDisplay = document.createElement("p");
  userDisplay.textContent = `Welcome, ${window.user.username}!`;
  document.body.prepend(userDisplay);

  // Request initial dashboard data
  socket.emit("get_dashboard_data", { userId: window.user.id });

  // Handle incoming dashboard data
  socket.on("dashboard_data", (data) => {
    renderLeaderboard(data.leaderboard);
    renderEvents(data.events);
    renderNews(data.news);
  });
});



function renderLeaderboard(list = []) {
  const leaderboardContainer = document.getElementById("leaderboard-list");
  leaderboardContainer.innerHTML = "";

  if (list.length === 0) {
    leaderboardContainer.innerHTML = "<p>No leaderboard data available.</p>";
    return;
  }

  list.forEach((item, index) => {
    const row = document.createElement("div");
    row.classList.add("leaderboard-item");
    row.innerHTML = `
      <span class="rank">${index + 1}.</span>
      <span class="username">${item.username}</span>
      <span class="score">${item.score}</span>
    `;
    leaderboardContainer.appendChild(row);
  });
}

function renderEvents(events = []) {
  const container = document.getElementById("events-list");
  container.innerHTML = "";

  if (events.length === 0) {
    container.innerHTML = "<p>No events available.</p>";
    return;
  }

  events.forEach((event) => {
    const card = document.createElement("div");
    card.classList.add("event-card");
    card.innerHTML = `
      <div class="event-image"></div>
      <div class="event-details">
        <h3>${event.title}</h3>
        <p class="event-date">${event.date}</p>
        <p class="event-desc">${event.description}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderNews(newsList = []) {
  const container = document.getElementById("news-list");
  container.innerHTML = "";

  if (newsList.length === 0) {
    container.innerHTML = "<p>No news available.</p>";
    return;
  }

  newsList.forEach((news) => {
    const card = document.createElement("div");
    card.classList.add("news-card");
    card.innerHTML = `
      <div class="news-image"></div>
      <div class="news-info">
        <h3>${news.title}</h3>
        <p class="news-date">${news.date}</p>
        <p class="news-desc">${news.description}</p>
      </div>
    `;
    container.appendChild(card);
  });
}
