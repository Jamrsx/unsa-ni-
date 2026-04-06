<script setup>
import { ref, onMounted } from 'vue'
import Window from './components/window.vue'
import ButtonText from './components/button-text.vue'
import { request_get_blog_by_id, on_response_get_blog_by_id } from './js/blog.js'

const blog = ref(null)
const loading = ref(true)
const error = ref(null)
const related = ref([])

function goBack() {
  try { window.history.back() } catch (e) {}
}

function goHome() {
  try { window.location.href = '/home.html' } catch (e) {}
}

function getQueryId() {
  try {
    const params = new URLSearchParams(window.location.search)
    return params.get('blog_id')
  } catch (e) {
    return null
  }
}

onMounted(async () => {
  const id = getQueryId()
  if (!id) {
    loading.value = false
    error.value = 'No blog selected. Open from Home.'
    return
  }

  request_get_blog_by_id(id)
  on_response_get_blog_by_id(async (data) => {
    loading.value = false
    if (data && data.success && data.blog) {
      blog.value = data.blog

      // fetch some related items (latest blogs)
      try {
        const { socket } = await import('./js/socket.js')
        socket.emit('request_get_blogs')
        socket.once('response_get_blogs', (d) => {
          if (d && d.success) {
            related.value = (d.blogs || []).filter(x => x.blog_id !== blog.value.blog_id).slice(0,4)
          }
        })
      } catch (e) {
        // ignore
      }
    } else {
      error.value = data?.message || 'Blog not found.'
    }
  })
})
</script>

<template>
  <section class="blog-page">
    <Window>
      <template #title><span>Blog</span></template>
      <template #content>
        <div v-if="loading">Loading...</div>
        <div v-else-if="error" class="alert alert-warning">{{ error }}</div>
        <div v-else-if="blog">
          <div class="card">
            <img :src="(blog.thumbnail_url || '').startsWith('/') ? blog.thumbnail_url : ('/' + (blog.thumbnail_url || '').replace(/^\/+/, ''))" class="card-img-top" />
            <div class="card-body">
              <h2 class="card-title">{{ blog.title }}</h2>
              <p class="text-muted">Published: {{ blog.published_at }}</p>
              <div v-html="blog.content"></div>

              <div class="mt-3 d-flex align-items-center gap-2">
                <ButtonText title="Back" @click="goBack" />
                <ButtonText title="Home" @click="goHome" />
              </div>

              <hr />
              <div v-if="related.length">
                <h5>Related Blogs</h5>
                <div class="d-flex gap-2">
                  <div v-for="r in related" :key="r.blog_id" style="width:140px">
                    <a :href="`/blog.html?blog_id=${r.blog_id}`">
                      <img :src="(r.thumbnail_url || '').startsWith('/')? r.thumbnail_url : ('/' + (r.thumbnail_url||'').replace(/^\/+/, ''))" style="width:100%;height:80px;object-fit:cover" />
                      <div class="small">{{ r.title }}</div>
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
