import { createApp } from 'vue'
import App from './App.vue'
import Header from './Header.vue'
import Landing from './Landing.vue'
import Blog from './Blog.vue'
import Event from './Event.vue'
import Duel from './Duel.vue'
import Solo from './Solo.vue'
import Home from './Home.vue'
import Onboarding from './Onboarding.vue'
import LobbyOnboarding from './LobbyOnboarding.vue'
import Lobby from './Lobby.vue'
import Room from './Room.vue'
import Inspector from './Inspector.vue'
import Result from './Result.vue'
import Leaderboard from './Leaderboard.vue'
import UserDashboard from './UserDashboard.vue'
import AdminDashboard from './AdminDashboard.vue'
import FacultyDashboard from './FacultyDashboard.vue'
import Signup from './Signup.vue'
import Signin from './Signin.vue'
import ChatSample from './ChatSample.vue'
// TestDB removed — was a leftover test component causing rogue socket connections

const mounts = {
	'#app': App,
	'#signup_app': Signup,
	'#signin_app': Signin,

	'#header_app': Header,
	'#landing_app': Landing,
	'#blog_app': Blog,
	'#event_app': Event,
	'#duel_app': Duel,
	'#solo_app': Solo,
	'#home_app': Home,
	'#onboarding_app': Onboarding,
	'#lobby_onboarding_app': LobbyOnboarding,
	'#lobby_app': Lobby,
	'#room_app': Room,
	'#inspector_app': Inspector,
	'#result_app': Result,
	'#leaderboard_app': Leaderboard,
	'#user-dash_app': UserDashboard,
	'#admin-dash_app': AdminDashboard,
	'#faculty-dash_app': FacultyDashboard,

	'#chat-sample_app': ChatSample,
	// '#testdb_app': TestDB  ← removed
};

Object.entries(mounts).forEach(([selector, component]) => {
	const el = document.querySelector(selector);
	if (!el) return;

	try {
		createApp(component).mount(selector);
	} catch (e) {
		console.error(`Failed to mount ${component.name || 'component'} on ${selector}:`, e);
	}
});

// Global toast container on every page
try {
	const el = document.createElement('div');
	el.id = 'toast_app';
	document.body.appendChild(el);
	import('./components/ToastContainer.vue').then((mod) => {
		try { createApp(mod.default).mount('#toast_app'); } catch (e) {}
	}).catch(() => {});
} catch (e) {}
