<template>
  <div class="card-notification" :class="{unread: unread}" @click="$emit('click')" role="button" tabindex="0">
    <div class="card-notification-left">
      <div class="avatar-placeholder" v-if="!avatar"><i class="bi bi-person-circle"></i></div>
      <img v-else :src="avatar" alt="avatar" />
    </div>
    <div class="card-notification-body">
      <div class="card-notification-title">{{ title }}</div>
      <div class="card-notification-message">{{ message }}</div>
      <div class="card-notification-meta">{{ time }}</div>
    </div>
    <div class="card-notification-right">
      <span v-if="unread" class="unread-dot"></span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Notification' },
  message: { type: String, default: 'You have a new notification.' },
  time: { type: String, default: 'now' },
  avatar: { type: String, default: '' },
  unread: { type: Boolean, default: true }
});
</script>

<style scoped>
.card-notification{
  display:flex;
  gap:8px;
  padding:8px;
  align-items:flex-start;
  border-radius:6px;
  transition:background .15s;
}
.card-notification{ cursor: pointer }
.card-notification:hover{ background: #f6f6fb; transform: translateY(-1px) }
.card-notification.unread{ background:#fff8f8; }
.card-notification-left img,.card-notification-left .avatar-placeholder{
  width:40px; height:40px; border-radius:6px; object-fit:cover; background:#eee;
}
.card-notification-left .avatar-placeholder{ display:flex; align-items:center; justify-content:center; color:#6c757d; font-size:1.4rem }
.card-notification-body{ flex:1; min-width:0 }
.card-notification-title{ font-weight:600; font-size:0.95rem; color:#222 }
.card-notification-message{ font-size:0.85rem; color:#555; overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
.card-notification-meta{ font-size:0.75rem; color:#999; margin-top:4px }
.card-notification-right{ width:20px; display:flex; align-items:center; justify-content:center }
.unread-dot{ width:10px; height:10px; background:#e53935; border-radius:50% }
</style>
