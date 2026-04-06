<template>
  <div>
    <!-- Profile Display -->
    <div class="row row-account">
      <div class="col">
        <div class="profile-pic-wrapper" @click="openCropper" role="button" tabindex="0">
          <ProfilePic :img-src="localProfilePic" />
          <div class="profile-pic-overlay" aria-hidden="true">
            <svg class="profile-pic-editicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="col row row-account-detail">
        <div class="col">
          <h1 class="display-2 fw-bolder">{{ localFullName }}</h1>
          <p>{{ localEmail }}</p>
        </div>
        <div class="col">
          <ButtonTxt
            title="Edit"
            alt-text="edit_account_button"
            link="/"
          />
        </div>
      </div>
    </div>

    <hr>

    <!-- Edit Form -->
    <form class="row row-edit-account" @submit.prevent="handleSubmit">
      <div class="col">
        <TextField
          name="user_edit_username"
          label="Username"
          v-model="localFullName"
          :disabled="false"
        />
        <TextField
          name="user_edit_email"
          label="Email"
          v-model="localEmail"
          :disabled="false"
        />
        <PasswordField
          name="user_edit_pass"
          label="New Password"
          v-model="localPassword"
          :disabled="false"
        />
        <PasswordField
          name="user_edit_pass_confirm"
          label="Confirm New Password"
          v-model="localPasswordConfirm"
        />
        <PasswordField
          name="user_edit_pass_previous"
          label="Current Password"
          v-model="localPreviousPassword"
          :disabled="false"
        />
      </div>
      <div class="col">
        <ButtonTxt
          class="edit_account_cancel_button"
          title="Cancel"
          alt-text="edit_account_cancel_button"
          link="/"
        />
        <ButtonSubmitField
          class="edit_account_save_button"
          name="edit_account_save_button"
          alt-text="edit_account_save_button"
          display-value="Save"
          :disabled="false"
        />
      </div>
    </form>
  </div>
  <AvatarCropper v-if="showCropper" :currentAvatarUrl="localProfilePic" @save="onCropSave" @cancel="showCropper = false" />
</template>

<script setup>
import { ref, watch } from 'vue';
import ProfilePic from '../../profile-pic.vue';
import AvatarCropper from '../../avatar-cropper.vue';
import { request_change_user_account_profile_avatar, response_change_user_account_profile_avatar } from '../../../js/user-dashboard.js';
import { broadcastAvatarUpdated, buildAvatarUrl as buildAvatarUrlUtil } from '../../../js/avatar-utils.js';
import ButtonTxt from '../../button-text.vue';
import ButtonSubmitField from '../../button-submit-field.vue';
import TextField from '../../text-field.vue';
import PasswordField from '../../password-field.vue';

const props = defineProps({
  user_profile_pic: String,
  user_full_name: String,
  user_email: String,
  user_password: String,
  formSubmitMethod: Function
});

// Local reactive copies
const localProfilePic = ref('');
const showCropper = ref(false);
const localFullName = ref('');
const localEmail = ref('');
const localPassword = ref('');
const localPasswordConfirm = ref('');
const localPreviousPassword = ref('');

// Preload and set avatar with single timestamp (parent buildAvatarUrl already adds ?t=)
function preloadAndSetAvatar(v) {
  if (!v) {
    console.log('[FacultyEditAccount] preloadAndSetAvatar: Empty value, clearing')
    localProfilePic.value = v || '';
    return;
  }
  
  console.log('[FacultyEditAccount] preloadAndSetAvatar: Loading', v)
  // Use URL as-is - parent buildAvatarUrl() already added timestamp
  const img = new Image();
  img.onload = () => {
    console.log('[FacultyEditAccount] preloadAndSetAvatar: Image loaded successfully, setting localProfilePic')
    localProfilePic.value = v;
  };
  img.onerror = () => {
    console.warn('[FacultyEditAccount] preloadAndSetAvatar: Image load failed, setting anyway:', v)
    // If preload fails, still set the path (best effort)
    localProfilePic.value = v;
  };
  img.src = v;
}

// Initialize from props on mount
preloadAndSetAvatar(props.user_profile_pic);
localFullName.value = props.user_full_name || '';
localEmail.value = props.user_email || '';

// Watch for prop changes from parent
watch(() => props.user_profile_pic, (v) => {
  console.log('[FacultyEditAccount] Prop watcher: user_profile_pic changed to:', v)
  preloadAndSetAvatar(v);
});
watch(() => props.user_full_name, v => localFullName.value = v);
watch(() => props.user_email, v => localEmail.value = v);

// Clear password fields when parent reports an updated password
watch(() => props.user_password, () => {
  localPassword.value = '';
  localPasswordConfirm.value = '';
  localPreviousPassword.value = '';
});

// Submit handler
function handleSubmit() {
  if (props.formSubmitMethod) {
    props.formSubmitMethod({
      username: localFullName.value,
      email: localEmail.value,
      previousPassword: localPreviousPassword.value,
      password: localPassword.value,
      confirmPassword: localPasswordConfirm.value
    });
  }
}

function openCropper() {
  showCropper.value = true;
}

// Handle save from cropper - update local preview immediately then let parent sync
function onCropSave(base64) {
  console.log('[FacultyEditAccount] onCropSave: Sending avatar to server, base64 length:', base64.length)
  // Send to server (user-dashboard helper will attach token)
  request_change_user_account_profile_avatar(base64);

  // Listen for response and update local preview immediately
  response_change_user_account_profile_avatar((data) => {
    console.log('[FacultyEditAccount] Avatar change response received:', data)
    if (data && data.avatar_url) {
      console.log('[FacultyEditAccount] Avatar uploaded successfully, updating preview immediately')
      // Build URL with timestamp for immediate cache-bust
      const newUrl = buildAvatarUrlUtil(data.avatar_url);
      
      // Update local preview immediately for instant feedback
      preloadAndSetAvatar(newUrl);
      // Broadcast avatar change so Header can update instantly too
      broadcastAvatarUpdated(data.avatar_url);
      showCropper.value = false;
      console.log('[FacultyEditAccount] Local preview updated to:', newUrl)
    } else {
      console.warn('[FacultyEditAccount] Avatar response missing avatar_url, closing cropper anyway')
      showCropper.value = false;
    }
  });
}
</script>

<style scoped>
.profile-pic-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.profile-pic-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0);
  transition: background 0.15s ease;
}

.profile-pic-wrapper:hover .profile-pic-overlay {
  background: rgba(0, 0, 0, 0.25);
}

.profile-pic-editicon {
  color: #fff;
  opacity: 0;
  transition: opacity 0.12s ease;
}

.profile-pic-wrapper:hover .profile-pic-editicon {
  opacity: 1;
}
</style>
