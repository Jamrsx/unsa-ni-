<!-- needed "modal-button.vue" to interact -->
<!-- usage:
  |modal.vue
    |modal-button.vue

add this to header:
    <link rel="stylesheet" href="css/bootstrap/bootstrap-5.0.2-dist/css/bootstrap.min.css">
    <script src="css/bootstrap/bootstrap-5.0.2-dist/js/bootstrap.bundle.min.js"></script>
-->
<template>
    <!-- Modal -->
    <div 
      class="modal fade" 
      :id="modal_id" 
      tabindex="-1" 
      aria-labelledby="ModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content custom-modal">

          <!-- Header -->
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-semibold" id="ModalLabel">
              {{modal_title}}
            </h5>
            <button 
              v-if="close_btn_header_bool"
              type="button" 
              class="btn-close" 
              data-bs-dismiss="modal" 
              aria-label="Close"
            ></button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot name="content">
                Start
            </slot>
          </div>

          <!-- Footer -->
          <div class="modal-footer border-0 pt-0">
            <slot name="modal_footer">
              <button v-if="close_btn_footer_bool"
                type="button" 
                data-bs-dismiss="modal"
              >
                Close <!-- change this to cancel if you wanted to -->
              </button>
              <button v-if="modal_footer_buttons" v-for="(key, value) in modal_footer_buttons" :key="value" @click="handleClick(key.link)">{{key.title}}</button>
            </slot>
          </div>
          <div class="modal-footer-loading">
            <slot name="content_loading_footer"></slot>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
// Add defensive guard to prevent modals opening when client lacks permission
import { onMounted, onBeforeUnmount } from 'vue'
import { can, initPermissions } from '../js/permissions.js'
import { toastError } from './Toast.vue'

const props = defineProps({
  modal_id: {
    type: String,
    required: true
  },
  modal_title:{
    type: String,
    default: ''
  },
  close_btn_header_bool:{
    type: Boolean,
    default: true
  },
  close_btn_footer_bool:{
    type: Boolean,
    default: false
  },
  modal_footer_buttons:{
    type: Array,
    default: () => [],
    validator: (arr) =>
      arr.every((item) => {
        if (typeof item !== 'object' || item === null) return false

        const keys = Object.keys(item)
        const requiredKeys = ['title', 'link']
        const hasAllRequired = requiredKeys.every(k => keys.includes(k))
        const noExtraKeys = keys.every(k => requiredKeys.includes(k))
        const correctTypes = typeof item.title === 'string' && typeof item.link === 'string'
        return hasAllRequired && noExtraKeys && correctTypes
      })
  },
  // New reusable guard props:
  // `requirePermission`: single permission string (e.g. 'roles.manage')
  requirePermission: {
    type: String,
    default: null
  },
  // `requireAnyPermissions`: array of permission strings; any one suffices
  requireAnyPermissions: {
    type: Array,
    default: () => []
  },
  // Message to show when unauthorized; can be overridden by consumers
  unauthorizedMessage: {
    type: String,
    default: 'You are not authorized to open this modal.'
  }
});

function handleClick(link) {
	if (link) {
		window.open(link, '_blank');
	}
}

// Defensive show guard: if a modal id matches admin edit/demote patterns,
// check permissions on `show.bs.modal` and prevent showing + show toast if unauthorized.
let _guardHandler = null
onMounted(() => {
  try {
    const id = props.modal_id || ''
    const el = document.getElementById(id)
    if (!el) {
      console.debug('[modal] element not found for id', id)
      return
    }

    _guardHandler = function (ev) {
      console.debug('[modal] show.bs.modal event for', id)
      try {
        // Synchronous quick-check using cached permissions
        const performCheckSync = () => {
          try {
            if (props.requirePermission) {
              return !!can(props.requirePermission)
            }
            if (props.requireAnyPermissions && props.requireAnyPermissions.length) {
              return props.requireAnyPermissions.some(p => can(p))
            }
            // Legacy id-based guards
            if (id.startsWith('edit-admin-modal-')) return !!can('roles.manage')
            if (id.startsWith('demote-admin-modal-')) return !!(can('roles.assign.faculty') || can('roles.assign.admin'))
            return true
          } catch (e) {
            return false
          }
        }

        // If quick-check passes, allow modal to open
        if (performCheckSync()) return

        // If quick-check failed but the consumer provided explicit permission props,
        // initialize permissions (async) and re-check. Prevent the current show event
        // and then programmatically show the modal if permissions are granted.
        if (props.requirePermission || (props.requireAnyPermissions && props.requireAnyPermissions.length)) {
          ev.preventDefault && ev.preventDefault()
          try {
            initPermissions(() => {
              try {
                if (performCheckSync()) {
                  // show modal now that permissions are initialized
                  const bsInstance = window.bootstrap?.Modal.getInstance(el) || new window.bootstrap.Modal(el)
                  if (bsInstance) bsInstance.show()
                  return
                }
                try { toastError(props.unauthorizedMessage) } catch (e) {}
              } catch (e) {
                try { toastError(props.unauthorizedMessage) } catch (e) {}
              }
            })
          } catch (e) {
            try { toastError(props.unauthorizedMessage) } catch (e) {}
          }
          console.debug('[modal] deferred permission init and prevented opening for', id)
          return
        }

        // Fallback: show an unauthorized toast and prevent opening
        try { toastError(props.unauthorizedMessage) } catch (e) {}
        ev.preventDefault && ev.preventDefault()
        console.debug('[modal] guard prevented opening for', id)
      } catch (e) {
        console.error('modal guard error', e)
      }
    }

    el.addEventListener('show.bs.modal', _guardHandler)
    // Ensure any stray backdrops are cleaned up when modal is hidden
    const _hiddenHandler = function () {
      try {
        // Only remove modal-open/backdrop if no other modals are currently visible
        try {
          const stillOpen = document.querySelectorAll('.modal.show')
          if (stillOpen && stillOpen.length > 0) return
        } catch (e) {}
        try { document.body.classList.remove('modal-open') } catch (e) {}
        try { document.body.style.overflow = ''; document.body.style.paddingRight = '' } catch (e) {}
        try { Array.from(document.querySelectorAll('.modal-backdrop')).forEach(b => b.remove()) } catch (e) {}
      } catch (e) { console.error('modal hidden cleanup failed', e) }
    }
    el.addEventListener('hidden.bs.modal', _hiddenHandler)

    // Store cleanup handlers so they can be removed on unmount
    el.__modal_cleanup_handlers = el.__modal_cleanup_handlers || {}
    el.__modal_cleanup_handlers._hiddenHandler = _hiddenHandler
  } catch (e) {
    console.error('modal guard setup failed', e)
  }
})

onBeforeUnmount(() => {
  try {
    const id = props.modal_id || ''
    const el = document.getElementById(id)
    if (el && _guardHandler) el.removeEventListener('show.bs.modal', _guardHandler)
    if (el && el.__modal_cleanup_handlers) {
      try {
        if (el.__modal_cleanup_handlers._hiddenHandler) el.removeEventListener('hidden.bs.modal', el.__modal_cleanup_handlers._hiddenHandler)
      } catch (e) {}
      try { delete el.__modal_cleanup_handlers } catch (e) {}
    }
    _guardHandler = null
    // Final safety: only remove orphaned backdrops/modal-open if no other modals are visible
    try {
      const stillOpen = document.querySelectorAll('.modal.show')
      if (!stillOpen || stillOpen.length === 0) {
        try { document.body.classList.remove('modal-open') } catch (e) {}
        try { document.body.style.overflow = ''; document.body.style.paddingRight = '' } catch (e) {}
        try { Array.from(document.querySelectorAll('.modal-backdrop')).forEach(b => b.remove()) } catch (e) {}
      }
    } catch (e) {}
  } catch (e) {}
})
</script>
