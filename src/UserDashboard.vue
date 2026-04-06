<script>
import Window from './components/window.vue';
import SplitContentView from './components/split-content-view.vue';
import SplitNavigationMenu from './components/split-navigation-menu.vue';
import SplitMainWindow from './components/split-main-window.vue';

import ButtonText from './components/button-text.vue';;

import content_my_account from './components/dashboard/user/content_my_account.vue';
import content_edit_account from './components/dashboard/user/content_edit_account.vue';
import content_duel_history from './components/dashboard/user/content_duel_history.vue';
import content_email from './components/dashboard/user/content_email.vue';
import content_my_questions from './components/dashboard/user/content_my_questions.vue';


export default{
    components:{
        Window,
        SplitNavigationMenu,
        SplitContentView,
        SplitMainWindow,

        ButtonText,

        content_my_account,
        content_edit_account,
        content_duel_history,
        content_email,
        content_my_questions
    }
}
</script>

<template>
  <section>
    <Window>
      <template #content>
        <SplitMainWindow v-model:currentSection="current" :sections="sections" default-section="my_account">
          <!-- nav menu -->
          <template #nav-menu-bottom>
            <ButtonText
              title="Log out"
              class="col split-aside-logout"
              alt-text="logout button"
              @click="showLogoutModal"
            />
          </template>

          <!-- My Account View -->
          <template #my_account>
            <!-- The @edit is an custom emit button to set current to edit_account to work SPliMainWindow's traversal to edit account -->
            <content_my_account
              :user_profile_pic="user_profile_pic"
              :user_full_name="user_full_name"
              :user_email="user_email"
              :user_statistic_level="user_statistic_level"
              :user_statistic_level_xp="user_statistic_level_xp"
              :user_statistic_duel_point="user_statistic_duel_point"
              
              @edit="current = 'edit_account'"
            />
          </template>

          <!-- Edit Account View -->
          <template #edit_account>
            <content_edit_account
              :user_profile_pic="user_profile_pic"
              :user_full_name="user_full_name"
              :user_email="user_email"
              :user_password="user_password"
              :form-submit-method="handleRequestChangeUserAccountProfile"
            />
          </template>

          <!-- Match History View -->
          <template #match_history>
            <content_duel_history/>
          </template>

          <!-- Mail View -->
          <template #mail>
            <content_email/>
          </template>

          <!-- My Questions View - show user's created questions by status -->
          <template #my_questions>
            <content_my_questions/>
          </template>

        </SplitMainWindow>
      </template>
    </Window>
    <LogoutModal ref="logoutModalUser" modalId="logout-modal-user" @confirm="confirmLogout" />
  </section>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { 
  get_user_account_profile, 
  get_user_statistics, 
  handle_request_change_user_account_profile, 
  response_change_user_account_profile
} from './js/user-dashboard.js';
import { toastSuccess, toastError } from './components/Toast.vue';
import { registerToastFunctions } from './js/ui-store.js';
import LogoutModal from './components/LogoutModal.vue'
import { logout } from './js/auth.js'

const sections = [
  { id: 'my_account', name: 'My Account' },
  { id: 'edit_account', name: 'Edit Account' },
  { id: 'match_history', name: 'Match History' },
  { id: 'mail', name: 'Mail' },
  { id: 'my_questions', name: 'My Questions' }
]

// === reactive current section ===
const current = ref('my_account');

// === reactive variables from response ===
const user_profile_pic = ref('');
const user_full_name = ref('');
const user_email = ref('');
const user_password = ref('');
const user_statistic_level = ref('');
const user_statistic_level_xp = ref('');
const user_statistic_duel_point = ref('');

const logoutModalUser = ref(null)

// === onMounted ===
onMounted(() => {
  // Register toast functions with ui-store for use in utility modules
  registerToastFunctions(toastError, toastSuccess);

  // check current nav bar to load data depends on sections , 'my_questions'only
  const el = document.getElementById('split-aside-nav');

  const observer = new MutationObserver(() => {
    const classList = el.classList;
    const active = [...classList].find(c =>
      ['my_account', 'edit_account', 'match_history', 'mail'].includes(c)
    );

    if (active) {
      current.value = active;
    }
  });

  observer.observe(el, { attributes: true, attributeFilter: ['class'] });

  // cleanup
  onBeforeUnmount(() => observer.disconnect());

  // If page was opened with a hash (e.g. /user-dashboard.html#my_questions), honor it
  try {
    const initialHash = (window.location.hash || '').replace(/^#/, '');
    if (initialHash && sections.find(s => s.id === initialHash)) {
      current.value = initialHash;
    }
  } catch (e) {
    // ignore in non-browser contexts
  }

  // helper: normalize avatar_url returned from server into a single leading-path URL
  function buildAvatarUrl(av) {
    if (!av) return '';
    // if already starts with slash, assume it's a full path
    if (av.startsWith('/')) return av;
    // if server already returned asset/profile/... or similar, just prepend leading slash
    if (av.includes('asset/profile')) return '/' + av.replace(/^\/+/, '');
    // otherwise it's probably a bare filename
    return '/asset/profile/' + av;
  }

  // load initial user profile
  get_user_account_profile((data) => {
    user_profile_pic.value = buildAvatarUrl(data.avatar_url);
    user_full_name.value = data.full_name;
    user_email.value = data.email;
    user_password.value = data.password;
  });
  get_user_statistics((data)=>{
    user_statistic_level.value = data.statistic_level;
    user_statistic_level_xp.value = data.statistic_level_xp;
    user_statistic_duel_point.value = data.statistic_duel_point;
  });

  // listen to server updates after save
  response_change_user_account_profile((data) => {
    // dynamically update after Save
    user_profile_pic.value = buildAvatarUrl(data.avatar_url);
    user_full_name.value = data.full_name;
    user_email.value = data.email;
    user_password.value = data.password;
    // show success toast
    try { toastSuccess('Profile saved'); } catch (e) { /* ignore */ }
  });
});

function showLogoutModal() {
  try {
    if (logoutModalUser && logoutModalUser.value && typeof logoutModalUser.value.show === 'function') {
      logoutModalUser.value.show()
      return
    }
    const el = document.getElementById('logout-modal-user')
    if (el && window.bootstrap && typeof window.bootstrap.Modal === 'function') {
      const m = new window.bootstrap.Modal(el)
      m.show()
      return
    }
    const btn = document.querySelector('[data-bs-target="#logout-modal-user"]')
    if (btn) btn.click()
  } catch (e) { console.error('Show logout modal failed', e) }
}

async function confirmLogout() {
  try { await logout() } catch (e) { console.error('Logout failed', e) }
}

// === watch section change to reload data ===
watch(current, (newVal) => {
  if (newVal === 'my_account') {
    get_user_statistics((data)=>{
      user_statistic_level.value = data.statistic_level;
      user_statistic_level_xp.value = data.statistic_level_xp;
      user_statistic_duel_point.value = data.statistic_duel_point;
    });
    get_user_account_profile((data) => {
      user_profile_pic.value = buildAvatarUrl(data.avatar_url);
      user_full_name.value = data.full_name;
      user_email.value = data.email;
    });
    
  }
  if (newVal === 'edit_account') {
    get_user_account_profile((data) => {
      user_profile_pic.value = buildAvatarUrl(data.avatar_url);
      user_full_name.value = data.full_name;
      user_email.value = data.email;
      user_password.value = data.password;
    });
  }
});

// === form submit wrapper ===
function handleRequestChangeUserAccountProfile(formData) {
  handle_request_change_user_account_profile(formData);
}
</script>
