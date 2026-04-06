<script setup>
import { ref, onMounted } from 'vue'
import Window from './components/window.vue'
import ButtonText from './components/button-text.vue'
import { request_get_event_by_id, on_response_get_event_by_id, request_join_event, on_response_join_event } from './js/event.js'
import { getSocket } from './js/socket.js'

const eventItem = ref(null)
const loading = ref(true)
const error = ref(null)
const related = ref([])
const joinStatus = ref('')

function getQueryId() {
  try {
    const params = new URLSearchParams(window.location.search)
    return params.get('event_id')
  } catch (e) {
    return null
  }
}

onMounted(async () => {
  const id = getQueryId()
  if (!id) {
    loading.value = false
    error.value = 'No event selected. Open from Home.'
    return
  }

  request_get_event_by_id(id)
  on_response_get_event_by_id(async (data) => {
    loading.value = false
    if (data && data.success && data.event) {
      eventItem.value = data.event

      // fetch related events (latest)
      try {
        const s = getSocket()
        if (s) {
          s.emit('request_get_events')
          s.once('response_get_events', (d) => {
            if (d && d.success) {
              related.value = (d.events || []).filter(x => x.event_id !== eventItem.value.event_id).slice(0, 4)
            }
          })
        }
      } catch (e) {
        // ignore
      }
      // listen for join response for this event
      try {
        on_response_join_event((d) => {
          if (!d) return
          if (d.success) {
            joinStatus.value = 'joined'
          } else {
            joinStatus.value = d.message || 'failed'
          }
        })
      } catch (e) {
        // ignore
      }
    } else {
      error.value = data?.message || 'Event not found.'
    }
  })
})

// Image fallback helper for event page
function onImgError(e) {
  try {
    const img = e && e.target
    if (!img) return
    img.src = '/asset/event/default.png'
  } catch (err) {
    // ignore
  }
}

function joinEvent() {
  try {
    if (!eventItem.value || !eventItem.value.event_id) return
    joinStatus.value = 'joining'
    console.log('brubs: local event data', eventItem.value)

    try {
      const s = getSocket()
      if (s) {
        s.once('response_get_event_by_id', (d) => {
          console.log('brubs: server response for event_id', eventItem.value?.event_id, d)
        })
      }
    } catch (e) {
      // ignore
    }

    request_get_event_by_id(eventItem.value.event_id)
    request_join_event(eventItem.value.event_id)
  } catch (e) {
    joinStatus.value = 'error'
  }
}

function goBack() {
  try { window.history.back() } catch (e) {}
}

function goHome() {
  try { window.location.href = '/home.html' } catch (e) {}
}
</script>

<template>
  <section class="event-page">
    <Window>
      <template #title><span>Event</span></template>
      <template #content>
        <div v-if="loading">Loading...</div>
        <div v-else-if="error" class="alert alert-warning">{{ error }}</div>
        <div v-else-if="eventItem">
          <div class="card">
            <img :src="(eventItem.thumbnail_url || '').startsWith('/') ? eventItem.thumbnail_url : ('/' + (eventItem.thumbnail_url || '').replace(/^\/+/, ''))" class="card-img-top" @error="onImgError" />
            <div class="card-body">
              <h2 class="card-title">{{ eventItem.event_name }}</h2>
              <p class="text-muted">Created: {{ eventItem.created_at }}</p>
              <p>Reward: {{ eventItem.reward_points }} pts (Level {{ eventItem.reward_level }})</p>
              <div v-if="eventItem.description" v-html="eventItem.description"></div>

              <div class="mt-2">
                <ButtonText title="Join Event" @click="joinEvent" />
                <span class="ms-2 small text-muted" v-if="joinStatus">{{ joinStatus }}</span>
              </div>

              <div class="mt-3 d-flex align-items-center gap-2">
                <ButtonText title="Back" @click="goBack" />
                <ButtonText title="Home" @click="goHome" />
              </div>

              <hr />
              <div v-if="related.length">
                <h5>Related Events</h5>
                <div class="d-flex gap-2">
                  <div v-for="r in related" :key="r.event_id" style="width:140px">
                    <a :href="`/event.html?event_id=${r.event_id}`">
                      <img :src="(r.thumbnail_url || '').startsWith('/')? r.thumbnail_url : ('/' + (r.thumbnail_url||'').replace(/^\/+/, ''))" style="width:100%;height:80px;object-fit:cover" @error="onImgError" />
                      <div class="small">{{ r.event_name }}</div>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </template>
    </Window>
  </section>
</template>

<style scoped>
.card-img-top{ max-height:360px; object-fit:cover }
</style>
