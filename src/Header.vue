<script setup>
import ButtonImg from './components/button-img.vue';
import ButtonText from './components/button-text.vue';
import ProfilePic from './components/profile-pic.vue';
import ModalButton from './components/modal-button.vue';
import HeaderNotificationDropdownMenu from './components/header-notification-dropdown-menu.vue';
import Modal from './components/modal.vue';
import ScrollVerticalCarousel from './components/scroll-vertical-carousel.vue';
import ScrollCard from './components/scroll-card.vue';
import CardNotification from './components/card-notification.vue';
import HeaderDropdownMenu from './components/header-dropdown-menu.vue';
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { auth } from './js/auth.js';
import { get_header_profile, on_header_profile_change, buildAvatarUrl, get_user_primary_role } from './js/header.js';
import { getSocket } from './js/socket.js';
import { approve_from_notification, deny_from_notification } from './js/admin-dashboard.js';
import { toastSuccess, toastError } from './components/Toast.vue';
const API_URL = import.meta.env.VITE_API_URL || '';

// ── Music — persistent singleton survives page navigation ────────────────────
const MUSIC_TRACKS = [
  { name: 'Fifty Fps Forest', artist: 'Lifeformed',      url: '/asset/music/Fifty Fps Forest.mp3',                                          page: 'general'    },
  { name: 'Water is Sink',    artist: 'Baba is You OST', url: '/asset/music/Best_VGM_2359_-_Baba_is_You_-_Water_is_Sink_The_Lake_48KBPS.mp4', page: 'onboarding' },
  { name: 'Bloom',            artist: 'heytheremylove.', url: '/asset/music/heytheremylove._-_bloom._256KBPS.webm',                          page: 'lobby'      },
]

function getTrackForPage() {
  const path = window.location.pathname.toLowerCase()
  if (path.includes('onboarding') || path.includes('lobbyonboarding')) return 1
  if (path.includes('room.html')) return 2
  return 0
}

const musicEnabled  = ref(localStorage.getItem('music_enabled') === null ? true : localStorage.getItem('music_enabled') === 'true')
const musicPlaying  = ref(false)
const musicVolume   = ref(parseFloat(localStorage.getItem('music_volume') || '0.5'))
const musicTrackIdx = ref(0)
const gearOpen      = ref(false)
const notifOpen     = ref(false)
const audioEl       = ref(null)
let   _posTimer     = null

const LS = {
  enabled:  'music_enabled',
  playing:  'music_playing',
  track:    'music_track',
  pos:      'music_pos',
  volume:   'music_volume',
}

function getAudio() {
  if (!window.__MUSIC_EL__) {
    const a = document.createElement('audio')
    a.loop   = true
    a.volume = parseFloat(localStorage.getItem(LS.volume) || '0.5')
    a.addEventListener('error', (e) => {
      const code = e.target.error?.code
      const msgs = { 2: 'File not found — check /asset/music/ path', 3: 'Decode error', 4: 'Format not supported (.mp3/.mp4/.webm only)' }
      console.error('[Music] ❌', msgs[code] || e.target.error?.message, '|', a.src)
      musicPlaying.value = false
      localStorage.setItem(LS.playing, 'false')
    })
    document.body.appendChild(a)
    window.__MUSIC_EL__ = a
  }
  return window.__MUSIC_EL__
}

function savePos() {
  const a = window.__MUSIC_EL__
  if (a && !isNaN(a.currentTime)) localStorage.setItem(LS.pos, a.currentTime)
}

function startPosTimer() {
  if (_posTimer) return
  _posTimer = setInterval(savePos, 1000)
}

function stopPosTimer() {
  if (_posTimer) { clearInterval(_posTimer); _posTimer = null }
}

function toggleGear() { gearOpen.value = !gearOpen.value; notifOpen.value = false }
function toggleNotif() { notifOpen.value = !notifOpen.value; gearOpen.value = false }

function toggleMusic() {
  musicEnabled.value = !musicEnabled.value
  localStorage.setItem(LS.enabled, musicEnabled.value)
  if (!musicEnabled.value) {
    const a = getAudio()
    a.pause()
    musicPlaying.value = false
    localStorage.setItem(LS.playing, 'false')
    stopPosTimer()
  }
}

function loadTrack(idx, shouldPlay, resumePos) {
  const a     = getAudio()
  const track = MUSIC_TRACKS[idx]
  musicTrackIdx.value = idx
  localStorage.setItem(LS.track, idx)
  localStorage.setItem(LS.pos, 0)
  a.src    = track.url
  a.volume = musicVolume.value
  a.loop   = true
  a.load()
  if (shouldPlay) {
    const doPlay = () => {
      if (resumePos && resumePos > 0) { try { a.currentTime = resumePos } catch(e) {} }
      a.play()
        .then(() => { musicPlaying.value = true; localStorage.setItem(LS.playing, 'true'); startPosTimer() })
        .catch(err => { console.error('[Music] ❌ play() failed:', err.message); musicPlaying.value = false; localStorage.setItem(LS.playing, 'false') })
    }
    a.addEventListener('canplay', doPlay, { once: true })
  }
}

function toggleMusicPlay() {
  const a = getAudio()
  if (!a.src || a.src === window.location.href) {
    const idx = parseInt(localStorage.getItem(LS.track) || getTrackForPage())
    loadTrack(idx, true, 0)
    return
  }
  if (musicPlaying.value) {
    savePos(); a.pause(); musicPlaying.value = false
    localStorage.setItem(LS.playing, 'false'); stopPosTimer()
  } else {
    a.play()
      .then(() => { musicPlaying.value = true; localStorage.setItem(LS.playing, 'true'); startPosTimer() })
      .catch(err => console.error('[Music] ❌ play() failed:', err.message))
  }
}

function nextMusicTrack() {
  const next = (musicTrackIdx.value + 1) % MUSIC_TRACKS.length
  loadTrack(next, musicPlaying.value, 0)
}

function setMusicVolume() {
  const a = getAudio()
  a.volume = musicVolume.value
  localStorage.setItem(LS.volume, musicVolume.value)
}

function onDocClick(e) {
  if (!e.target.closest('.gear-wrap'))  gearOpen.value  = false
  if (!e.target.closest('.notif-wrap')) notifOpen.value = false
}

// ── Current page detection for nav highlight ─────────────────────────────────
const currentPath = ref(window.location.pathname.toLowerCase())

function isActive(link) {
  const page = link.replace('/', '').replace('.html', '')
  return currentPath.value.includes(page) && page !== ''
}

onMounted(() => {
    document.addEventListener('click', onDocClick)

    const _savedTrack = parseInt(localStorage.getItem(LS.track) ?? getTrackForPage())
    const _savedPos   = parseFloat(localStorage.getItem(LS.pos) || '0')
    const _pageTrack  = getTrackForPage()

    musicTrackIdx.value = _savedTrack
    musicVolume.value   = parseFloat(localStorage.getItem(LS.volume) || '0.5')

    if (musicEnabled.value) {
      const a = getAudio()
      a.volume = musicVolume.value
      const targetTrack = (_pageTrack !== _savedTrack) ? _pageTrack : _savedTrack
      musicTrackIdx.value = targetTrack
      const resumePos = (targetTrack === _savedTrack && _savedPos > 0) ? _savedPos : 0
      loadTrack(targetTrack, true, resumePos)
      musicPlaying.value = true
      localStorage.setItem(LS.enabled, 'true')
    }

    const isLandingPage = (typeof window !== 'undefined') && window.location.pathname.includes('landing.html');
    if (!isLandingPage) {
        auth();
        loadUserFromToken();
    } else {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            (async () => {
                try {
                    const res = await fetch(`${API_URL}/verify-token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data && data.success) { window.user = data.user; loadUserFromToken(); }
                    else { 
                        localStorage.removeItem('jwt_token'); 
                        localStorage.removeItem('token'); 
                        isLoggedIn.value = false; 
                    }
                } catch (e) { 
                    localStorage.removeItem('jwt_token'); 
                    localStorage.removeItem('token'); 
                    isLoggedIn.value = false; 
                }
            })();
        }
    }

    try {
        get_header_profile((data) => {
            username.value = data.username || data.full_name || username.value;
            avatarUrl.value = buildAvatarUrl(data.avatar_url);
            isLoggedIn.value = true;
        });
        on_header_profile_change((data) => {
            avatarUrl.value = buildAvatarUrl(data.avatar_url);
            username.value = data.username || data.full_name || username.value;
            isLoggedIn.value = true;
        });
    } catch (e) { console.error('Header socket/profile load failed', e); }

    try { fetchNotifications(); } catch (e) { console.error('Failed to kick off notifications fetch:', e); }

    try {
        const sock = getSocket();
        if (sock) {
            sock.on('notification', (data) => {
                try {
                    const n = data || {};
                    const parsedData = (typeof n.data === 'string') ? (function(){ try{return JSON.parse(n.data);}catch(e){return n.data;} })() : n.data || null;
                    const item = {
                        title: n.title || n.type || 'Notification',
                        message: n.message || (parsedData && parsedData.message) || (parsedData ? JSON.stringify(parsedData) : ''),
                        time: n.created_at || n.timestamp || new Date().toISOString(),
                        avatar: n.avatar || '', unread: !n.is_read,
                        type: n.type || null, data: parsedData || null,
                        id: n.id || n.notification_id || null
                    };
                    notifications.value.unshift(item);
                    try { window.__seenNotificationIds = window.__seenNotificationIds || new Set(); if(item.id) window.__seenNotificationIds.add(item.id); } catch (e) {}
                } catch (e) { console.error('notification handler error', e); }
            });
            sock.on('approval_approved', () => {});
            sock.on('approval_denied',   () => {});
            sock.on('notifications_deleted', (payload) => {
                try {
                    if (!payload) return;
                    if (payload.all === true) { notifications.value = []; return; }
                    const ids = Array.isArray(payload.ids) ? payload.ids.map(Number).filter(Boolean) : [];
                    if (ids.length === 0) return;
                    notifications.value = notifications.value.filter(n => !ids.includes(Number(n.id)));
                } catch (e) { console.error('notifications_deleted handler error', e); }
            });
        }
    } catch (e) { console.error('Header: failed to attach socket listeners', e); }

    try {
        const modalEl = document.getElementById('notification_modal_btn');
        if (modalEl && typeof bootstrap !== 'undefined') {
            modalEl.addEventListener('shown.bs.modal', async () => {
                try {
                    const token = localStorage.getItem('jwt_token');
                    if (!token) return;
                    await fetch(`${API_URL}/api/notifications/mark-read`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                        body: JSON.stringify({ all: true })
                    });
                    notifications.value = notifications.value.map(n => ({ ...n, unread: false }));
                } catch (err) { console.error('Failed to mark notifications read on modal open', err); }
            });
        }
    } catch (e) { console.error('Header: failed to attach modal open handler', e); }
});

onBeforeUnmount(() => {
    savePos()
    stopPosTimer()
    document.removeEventListener('click', onDocClick)
    try {
        const sock = getSocket();
        if (sock) {
            sock.off && sock.off('notification');
            sock.off && sock.off('approval_approved');
            sock.off && sock.off('approval_denied');
            sock.off && sock.off('notifications_deleted');
        }
    } catch (e) {}
});

const username   = ref(null);
const avatarUrl  = ref(null);
const isLoggedIn = ref(false);
const isAdmin    = ref(false);
const profileLink = ref('/user-dashboard.html');

function loadUserFromToken() {
    const token = localStorage.getItem("jwt_token") || localStorage.getItem("token");
    if (!token) return;
    try {
        const data = JSON.parse(atob(token.split(".")[1]));
        username.value = data.username;
        avatarUrl.value = buildAvatarUrl(data.avatar_url);
        isLoggedIn.value = true;
    } catch (err) { console.error("Token decode failed:", err); }
}

try {
    get_user_primary_role((role) => {
        if (role === 'admin') { profileLink.value = '/admin-dashboard.html'; isAdmin.value = true; }
        else if (role === 'faculty') { profileLink.value = '/faculty-dashboard.html'; isAdmin.value = false; }
        else { profileLink.value = '/user-dashboard.html'; isAdmin.value = false; }
    });
} catch (e) { console.error('Failed to get primary role for header', e); }

function handleNotificationClick(n) {
    try {
        const token = localStorage.getItem('jwt_token');
        if (n && n.id && token) {
            (async () => {
                try {
                    const res = await fetch(`${API_URL}/api/notifications`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                        body: JSON.stringify({ ids: [n.id] })
                    });
                    if (res.ok) notifications.value = notifications.value.filter(x => x.id !== n.id);
                } catch (err) { console.error('delete notification error', err); }
            })();
        }
        try {
            const modalEl = document.getElementById('notification_modal_btn');
            if (modalEl && window.bootstrap && typeof window.bootstrap.Modal === 'function') {
                const inst = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
                try { inst.hide(); } catch (e) {}
            }
        } catch (e) {}
        if (n && (n.type === 'question_approved' || n.type === 'question_denied' || (n.data && n.data.approval_id))) {
            window.location.href = '/user-dashboard.html#my_questions'; return;
        }
        window.location.href = '/user-dashboard.html#my_account';
    } catch (e) { console.error('notification click failed', e); }
}

const notifications = ref([]);
const unreadCount = computed(() => notifications.value.filter(n => n.unread).length);

async function fetchNotifications() {
    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) return;
        const res = await fetch(`${API_URL}/api/notifications`, {
            method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) { 
            localStorage.removeItem('jwt_token'); 
            localStorage.removeItem('token'); 
            isLoggedIn.value = false; 
            return; 
        }
        const data = await res.json();
        if (data && data.success && Array.isArray(data.notifications)) {
            notifications.value = data.notifications.map(n => ({
                title: n.title || n.type || 'Notification',
                message: n.message || n.data || '',
                time: n.created_at || n.timestamp || '',
                avatar: n.avatar || '', unread: !n.is_read,
                id: n.id || n.notification_id || null, type: n.type || null,
                data: (typeof n.data === 'string') ? (function(){ try{return JSON.parse(n.data);}catch(e){return n.data;} })() : n.data || null
            }));
        }
    } catch (err) { console.error('fetchNotifications error', err); }
}

function formatTime(ts) {
    if (!ts) return '';
    try {
        const d = new Date(ts);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60)   return 'just now';
        if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch { return ''; }
}

async function markAllRead() {
    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) return;
        await fetch(`${API_URL}/api/notifications/mark-read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ all: true })
        });
        notifications.value = notifications.value.map(n => ({ ...n, unread: false }));
    } catch (err) { console.error('markAllRead error', err); }
}

async function clearNotifications() {
    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) return;
        const res = await fetch(`${API_URL}/api/notifications`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ all: true })
        });
        if (res.ok) notifications.value = [];
    } catch (err) { console.error('clearNotifications error', err); }
}
</script>

<template>
  <header class="hd">
    <!-- left: logo + nav -->
    <div class="hd-left">
      <a href="/home.html" class="hd-logo">
        <span class="hd-logo-icon">⚔</span>
        <span class="hd-logo-text">Code<span class="hd-logo-accent">Duel</span></span>
      </a>

      <nav class="hd-nav">
        <a href="/home.html"          :class="['hd-link', isActive('/home.html')          ? 'hd-link--active' : '']">Home</a>
        <a href="/solo.html"          :class="['hd-link', isActive('/solo.html')          ? 'hd-link--active' : '']">Solo</a>
        <a href="/duel.html"          :class="['hd-link', isActive('/duel.html')          ? 'hd-link--active' : '']">
          <span class="hd-link-pip"></span>Duel
        </a>
        <a href="/leaderboard.html"   :class="['hd-link', isActive('/leaderboard.html')   ? 'hd-link--active' : '']">Ranks</a>
        <a href="/user-dashboard.html":class="['hd-link', isActive('/user-dashboard.html')? 'hd-link--active' : '']">Dashboard</a>
      </nav>
    </div>

    <!-- right: actions -->
    <div class="hd-right">

      <!-- Not logged in -->
      <template v-if="!isLoggedIn">
        <a href="/signin.html" class="hd-btn hd-btn--ghost">Sign in</a>
        <a href="/signup.html" class="hd-btn hd-btn--primary">Sign up</a>
      </template>

      <!-- Logged in -->
      <template v-else>

        <!-- ── Settings gear ──────────────────────────────────────── -->
        <div class="gear-wrap" @click.stop>
          <button class="hd-icon-btn" :class="gearOpen && 'hd-icon-btn--active'" @click="toggleGear" title="Settings">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>

          <transition name="drop">
          <div v-if="gearOpen" class="hd-dropdown" @click.stop>
            <div class="hd-dropdown-head">Settings</div>

            <!-- Music row -->
            <div class="hdd-row">
              <div class="hdd-row-info">
                <div class="hdd-music-icon" :class="musicPlaying && musicEnabled ? 'hdd-music-icon--playing' : ''">
                  <span v-for="b in 4" :key="b" class="hdd-bar" :style="`--b:${b}`"></span>
                </div>
                <div>
                  <div class="hdd-label">Music</div>
                  <div class="hdd-sub" v-if="musicEnabled">{{ MUSIC_TRACKS[musicTrackIdx].name }}</div>
                  <div class="hdd-sub" v-else>Off</div>
                </div>
              </div>
              <button :class="['hdd-toggle', musicEnabled ? 'hdd-toggle--on' : '']" @click="toggleMusic">
                <span class="hdd-knob"></span>
              </button>
            </div>

            <!-- Expanded music controls -->
            <transition name="expand">
            <div v-if="musicEnabled" class="hdd-music-ctrl">
              <div class="hdd-artist">{{ MUSIC_TRACKS[musicTrackIdx].artist }}</div>
              <div class="hdd-ctrl-row">
                <button class="hdd-ctrl-btn" @click="toggleMusicPlay">
                  <svg v-if="!musicPlaying" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>
                <button class="hdd-ctrl-btn" @click="nextMusicTrack">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z"/></svg>
                </button>
                <div class="hdd-vol">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  <input type="range" min="0" max="1" step="0.01" v-model="musicVolume" @input="setMusicVolume" class="hdd-vol-range" />
                </div>
              </div>
            </div>
            </transition>

            <div class="hdd-sep"></div>
            <a class="hdd-item" :href="profileLink">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My Profile
            </a>
            <a class="hdd-item hdd-item--danger" href="/signin.html" @click="localStorage.removeItem('jwt_token'); localStorage.removeItem('token');">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </a>
          </div>
          </transition>
        </div>

        <!-- ── Notifications ───────────────────────────────────────── -->
        <div class="notif-wrap" @click.stop>
          <button class="hd-icon-btn" :class="notifOpen && 'hd-icon-btn--active'" @click="toggleNotif" title="Notifications">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span v-if="unreadCount > 0" class="hd-notif-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
          </button>

          <transition name="drop">
          <div v-if="notifOpen" class="hd-notif-panel" @click.stop>
            <!-- Panel header -->
            <div class="hnp-head">
              <span class="hnp-title">Notifications</span>
              <div class="hnp-actions">
                <button v-if="unreadCount > 0" class="hnp-action-btn" @click="markAllRead" title="Mark all read">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  All read
                </button>
                <button v-if="notifications.length > 0" class="hnp-action-btn hnp-action-btn--danger" @click="clearNotifications" title="Clear all">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                  Clear
                </button>
              </div>
            </div>

            <!-- Notification list -->
            <div class="hnp-list">
              <!-- Empty state -->
              <div v-if="notifications.length === 0" class="hnp-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p>All caught up</p>
              </div>

              <!-- Notification items -->
              <div
                v-for="(n, i) in notifications"
                :key="n.id || i"
                :class="['hnp-item', n.unread ? 'hnp-item--unread' : '']"
                @click="handleNotificationClick(n); notifOpen = false"
              >
                <div class="hnp-item-dot" v-if="n.unread"></div>
                <div class="hnp-item-avatar">
                  <img v-if="n.avatar" :src="n.avatar" :alt="n.title" />
                  <span v-else class="hnp-avatar-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  </span>
                </div>
                <div class="hnp-item-body">
                  <div class="hnp-item-title">{{ n.title }}</div>
                  <div class="hnp-item-msg">{{ n.message }}</div>
                  <div class="hnp-item-time">{{ formatTime(n.time) }}</div>
                </div>
              </div>
            </div>
          </div>
          </transition>
        </div>

        <!-- ── Profile chip ───────────────────────────────────────── -->
        <a :href="profileLink" class="hd-profile-chip">
          <div class="hd-avatar-wrap">
            <img v-if="avatarUrl" :src="avatarUrl" :alt="username" class="hd-avatar-img" />
            <div v-else class="hd-avatar-fallback">{{ username ? username[0].toUpperCase() : '?' }}</div>
            <div class="hd-avatar-status"></div>
          </div>
          <span class="hd-username">{{ username }}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="hd-chevron"><polyline points="6 9 12 15 18 9"/></svg>
        </a>
      </template>
    </div>
  </header>


</template>

<style scoped>
/* ═══════════════════════════════════════════════════
   HEADER SHELL
═══════════════════════════════════════════════════ */
.hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(16px, 2vw, 32px);
  height: 52px;
  width: 100%;
  box-sizing: border-box;
  background: rgba(8, 8, 16, 0.82);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 0;
  z-index: 1000;
  gap: 20px;
}

/* ── Left side ── */
.hd-left {
  display: flex;
  align-items: center;
  gap: clamp(18px, 2.5vw, 36px);
  flex-shrink: 0;
}

/* Logo */
.hd-logo {
  display: flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
  flex-shrink: 0;
}
.hd-logo-icon {
  font-size: 1.05rem;
  line-height: 1;
  filter: drop-shadow(0 0 6px rgba(100, 181, 246, 0.5));
}
.hd-logo-text {
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Courier New', monospace;
}
.hd-logo-accent {
  color: #64b5f6;
  text-shadow: 0 0 12px rgba(100, 181, 246, 0.45);
}

/* Nav links */
.hd-nav {
  display: flex;
  align-items: center;
  gap: 2px;
}
.hd-link {
  position: relative;
  padding: 5px 11px;
  border-radius: 7px;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.42);
  text-decoration: none;
  letter-spacing: 0.01em;
  transition: color 0.15s, background 0.15s;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}
.hd-link:hover {
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.06);
}
.hd-link--active {
  color: rgba(255, 255, 255, 0.92);
  background: rgba(255, 255, 255, 0.07);
}
.hd-link--active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  border-radius: 1px;
  background: #64b5f6;
  box-shadow: 0 0 6px rgba(100, 181, 246, 0.6);
}
/* Duel pip — live indicator */
.hd-link-pip {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ef5350;
  box-shadow: 0 0 6px rgba(239, 83, 80, 0.7);
  animation: pip-pulse 2s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes pip-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.7); }
}

/* ── Right side ── */
.hd-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Auth buttons */
.hd-btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.14s;
  letter-spacing: 0.01em;
  white-space: nowrap;
}
.hd-btn--ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.55);
}
.hd-btn--ghost:hover {
  border-color: rgba(255, 255, 255, 0.28);
  color: rgba(255, 255, 255, 0.88);
  background: rgba(255, 255, 255, 0.05);
}
.hd-btn--primary {
  background: linear-gradient(135deg, #1e88e5, #1565c0);
  border: 1px solid rgba(30, 136, 229, 0.4);
  color: #fff;
  box-shadow: 0 2px 8px rgba(30, 136, 229, 0.3);
}
.hd-btn--primary:hover {
  filter: brightness(1.12);
  box-shadow: 0 4px 14px rgba(30, 136, 229, 0.45);
  transform: translateY(-1px);
}

/* Icon buttons (gear, bell) */
.hd-icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.14s;
  padding: 0;
}
.hd-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  border-color: rgba(255, 255, 255, 0.15);
}
.hd-icon-btn--active {
  background: rgba(100, 181, 246, 0.1);
  border-color: rgba(100, 181, 246, 0.3);
  color: #64b5f6;
}



/* Profile chip */
.hd-profile-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px 4px 4px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.14s;
  flex-shrink: 0;
}
.hd-profile-chip:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.14);
}
.hd-avatar-wrap {
  position: relative;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
}
.hd-avatar-img {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 1px solid rgba(255,255,255,0.12);
}
.hd-avatar-fallback {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e88e5, #1565c0);
  border: 1px solid rgba(30,136,229,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
}
.hd-avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #66bb6a;
  border: 1.5px solid rgba(8, 8, 16, 0.9);
  box-shadow: 0 0 5px rgba(102, 187, 106, 0.6);
}
.hd-username {
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.72);
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hd-chevron { color: rgba(255, 255, 255, 0.25); flex-shrink: 0; }

/* ═══════════════════════════════════════════════════
   SETTINGS DROPDOWN
═══════════════════════════════════════════════════ */
.gear-wrap { position: relative; }

.drop-enter-active, .drop-leave-active { transition: opacity 0.16s ease, transform 0.16s ease; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }

.hd-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 238px;
  background: rgba(10, 10, 20, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 14px;
  padding: 8px 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(24px);
  z-index: 9999;
}

.hd-dropdown-head {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.18);
  padding: 4px 14px 10px;
}

/* Music row */
.hdd-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  gap: 10px;
}
.hdd-row-info { display: flex; align-items: center; gap: 10px; }
.hdd-label { font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.78); }
.hdd-sub { font-size: 0.62rem; color: rgba(255,255,255,0.28); margin-top: 1px; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Mini equalizer animation */
.hdd-music-icon {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  width: 16px;
  flex-shrink: 0;
}
.hdd-bar {
  width: 3px;
  height: 3px;
  border-radius: 1px;
  background: rgba(255,255,255,0.2);
  flex-shrink: 0;
}
.hdd-music-icon--playing .hdd-bar {
  background: #64b5f6;
  animation: eq-bar 0.75s ease-in-out infinite alternate;
  animation-delay: calc(var(--b) * 0.14s);
}
@keyframes eq-bar {
  0%   { height: 3px; }
  100% { height: 14px; }
}

/* Toggle */
.hdd-toggle {
  position: relative;
  width: 36px; height: 20px;
  border-radius: 10px; border: none; cursor: pointer; flex-shrink: 0;
  background: rgba(255,255,255,0.08);
  transition: background 0.2s;
}
.hdd-toggle--on { background: #1e88e5; }
.hdd-knob {
  position: absolute; top: 3px; left: 3px;
  width: 14px; height: 14px; border-radius: 50%;
  background: rgba(255,255,255,0.4);
  transition: transform 0.2s, background 0.2s; display: block;
}
.hdd-toggle--on .hdd-knob { transform: translateX(16px); background: #fff; }

/* Expanded music controls */
.expand-enter-active, .expand-leave-active { transition: opacity 0.15s ease, max-height 0.2s ease; max-height: 100px; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }

.hdd-music-ctrl {
  padding: 0 14px 10px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.hdd-artist { font-size: 0.62rem; color: rgba(255,255,255,0.2); padding-top: 8px; }
.hdd-ctrl-row { display: flex; align-items: center; gap: 7px; }
.hdd-ctrl-btn {
  width: 27px; height: 27px; border-radius: 7px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.09);
  color: rgba(255,255,255,0.55);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.12s; flex-shrink: 0;
}
.hdd-ctrl-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
.hdd-vol { display: flex; align-items: center; gap: 5px; flex: 1; color: rgba(255,255,255,0.2); }
.hdd-vol-range {
  flex: 1; height: 3px;
  -webkit-appearance: none; appearance: none;
  background: rgba(255,255,255,0.1); border-radius: 2px; outline: none; cursor: pointer;
}
.hdd-vol-range::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; border-radius: 50%; background: #64b5f6; cursor: pointer; }

/* Separator + links */
.hdd-sep { height: 1px; background: rgba(255,255,255,0.07); margin: 6px 0; }
.hdd-item {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 14px;
  font-size: 0.8rem; font-weight: 600;
  color: rgba(255,255,255,0.52);
  text-decoration: none;
  transition: background 0.12s, color 0.12s;
}
.hdd-item:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.88); }
.hdd-item--danger:hover { background: rgba(239,83,80,0.08); color: #ef9a9a; }
.hdd-item svg { opacity: 0.6; flex-shrink: 0; }

/* ═══════════════════════════════════════════════════
   NOTIFICATION PANEL
═══════════════════════════════════════════════════ */
.notif-wrap { position: relative; }

/* Badge sits inside the icon button */
.hd-icon-btn { position: relative; }
.hd-notif-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: #ef5350;
  color: #fff;
  font-size: 0.52rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  border: 1.5px solid rgba(8, 8, 16, 0.9);
  pointer-events: none;
  line-height: 1;
}

.hd-notif-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  background: rgba(10, 10, 20, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(24px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  max-height: 420px;
}

/* Panel header */
.hnp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}
.hnp-title {
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: rgba(255,255,255,0.82);
}
.hnp-actions { display: flex; align-items: center; gap: 6px; }
.hnp-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.09);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.42);
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
}
.hnp-action-btn:hover {
  background: rgba(255,255,255,0.09);
  color: rgba(255,255,255,0.78);
  border-color: rgba(255,255,255,0.16);
}
.hnp-action-btn--danger:hover {
  background: rgba(239,83,80,0.1);
  color: #ef9a9a;
  border-color: rgba(239,83,80,0.25);
}

/* Scrollable list */
.hnp-list {
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.07) transparent;
}
.hnp-list::-webkit-scrollbar { width: 4px; }
.hnp-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

/* Empty state */
.hnp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 36px 20px;
  color: rgba(255,255,255,0.2);
}
.hnp-empty p { margin: 0; font-size: 0.78rem; font-weight: 600; }

/* Notification item */
.hnp-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  position: relative;
  transition: background 0.12s;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.hnp-item:last-child { border-bottom: none; }
.hnp-item:hover { background: rgba(255,255,255,0.04); }
.hnp-item--unread { background: rgba(100,181,246,0.04); }
.hnp-item--unread:hover { background: rgba(100,181,246,0.08); }

/* Unread dot */
.hnp-item-dot {
  position: absolute;
  top: 14px;
  left: 5px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #64b5f6;
  box-shadow: 0 0 5px rgba(100,181,246,0.6);
  flex-shrink: 0;
}

/* Avatar */
.hnp-item-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.09);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.hnp-item-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hnp-avatar-icon { color: rgba(255,255,255,0.28); display: flex; }

/* Item body */
.hnp-item-body { flex: 1; min-width: 0; }
.hnp-item-title {
  font-size: 0.76rem;
  font-weight: 700;
  color: rgba(255,255,255,0.82);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}
.hnp-item--unread .hnp-item-title { color: rgba(255,255,255,0.95); }
.hnp-item-msg {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.38);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.hnp-item-time {
  font-size: 0.62rem;
  color: rgba(255,255,255,0.2);
  margin-top: 4px;
  font-family: monospace;
}
</style>   