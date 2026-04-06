<template>
  <div class="row d-flex flex-row">
    <section>
      <Window>
        <template #title></template>
        <template #content>
          <div class="header">
            <ButtonText title="+ Create Blog" :class="{disabled: !perms?.canManageBlogs}" @click="onCreate" />
          </div>
          <SplitMainWindow 
            v-model:currentSection="activeSection"
            :sections="blogSections" 
            default-section="blog_all" 
            :show-label="false"
            class="top-split-main-window"
          >
            <template #blog_all>
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Blog ID</th>
                      <th>
                        <div>
                          <p>Title</p>
                          <SearchBarAndSort
                            placeholder="Search title"
                            :search="filters.title"
                            :sort="sortState.field === 'title' ? sortState.order : 'asc'"
                            @update:search="(v)=>{ filters.title = v }"
                            @update:sort="(o)=>{ sortState.field='title'; sortState.order=o }"
                          />
                        </div>
                      </th>
                      <th>Author</th>
                      <th>
                        <div>
                          <p>Status</p>
                          <SearchBarAndSort
                            placeholder="Search status"
                            :search="filters.status"
                            :sort="sortState.field === 'status' ? sortState.order : 'asc'"
                            @update:search="(v)=>{ filters.status = v }"
                            @update:sort="(o)=>{ sortState.field='status'; sortState.order=o }"
                          />
                        </div>
                      </th>
                      <th>Published At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody v-if="filteredAll.length > 0">
                    <tr v-for="blog in filteredAll" :key="blog.blog_id || blog.BlogID">
                      <td>{{ blog.blog_id || blog.BlogID }}</td>
                      <td>{{ blog.Title || blog.title }}</td>
                      <td>{{ blog.AuthorName || blog.author_name || blog.author_id }}</td>
                      <td>
                        <span v-if="blog.pending_action === 'delete'" class="badge bg-danger">Pending Delete</span>
                        <span
                          v-else
                          class="badge"
                          :class="getBlogStatusClass(blog.Status || blog.status)"
                        >
                          {{ (blog.Status || blog.status) === 'draft' ? 'Draft' : ((blog.Status || blog.status) || 'Published') }}
                        </span>
                      </td>
                      <td>{{ formatDate(blog.PublishedAt || blog.published_at || blog.created_at) }}</td>
                      <td class="actions">
                        <button class="btn-small" @click="onView(blog)">View</button>
                        <button class="btn-small" :class="{disabled: !perms?.canManageBlogs}" @click="onEdit(blog)">Edit</button>
                        <button class="btn-small btn-danger" :class="{disabled: !perms?.canManageBlogs}" @click="onDelete(blog)">{{ getDeleteLabel(blog) }}</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="filteredAll.length === 0" class="empty-state">
                  <p>No blogs found. Create one to get started!</p>
                </div>
              </div>
            </template>

            <template #blog_faculty>
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Blog ID</th>
                      <th>
                        <div>
                          <p>Title</p>
                          <SearchBarAndSort
                            placeholder="Search title"
                            :search="filters.title"
                            :sort="sortState.field === 'title' ? sortState.order : 'asc'"
                            @update:search="(v)=>{ filters.title = v }"
                            @update:sort="(o)=>{ sortState.field='title'; sortState.order=o }"
                          />
                        </div>
                      </th>
                      <th>Author</th>
                      <th>
                        <div>
                          <p>Status</p>
                          <SearchBarAndSort
                            placeholder="Search status"
                            :search="filters.status"
                            :sort="sortState.field === 'status' ? sortState.order : 'asc'"
                            @update:search="(v)=>{ filters.status = v }"
                            @update:sort="(o)=>{ sortState.field='status'; sortState.order=o }"
                          />
                        </div>
                      </th>
                      <th>Published At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody v-if="filteredFaculty.length > 0">
                    <tr v-for="blog in filteredFaculty" :key="blog.blog_id || blog.BlogID">
                      <td>{{ blog.blog_id || blog.BlogID }}</td>
                      <td>{{ blog.Title || blog.title }}</td>
                      <td>{{ blog.AuthorName || blog.author_name || blog.author_id }}</td>
                      <td>
                        <span v-if="blog.pending_action === 'delete'" class="badge bg-danger">Pending Delete</span>
                        <span
                          v-else
                          class="badge"
                          :class="getBlogStatusClass(blog.Status || blog.status)"
                        >
                          {{ (blog.Status || blog.status) === 'draft' ? 'Draft' : ((blog.Status || blog.status) || 'Published') }}
                        </span>
                      </td>
                      <td>{{ formatDate(blog.PublishedAt || blog.published_at || blog.created_at) }}</td>
                      <td class="actions">
                        <button class="btn-small" @click="onView(blog)">View</button>
                        <button class="btn-small" :class="{disabled: !perms?.canManageBlogs}" @click="onEdit(blog)">Edit</button>
                        <button class="btn-small btn-danger" :class="{disabled: !perms?.canManageBlogs}" @click="onDelete(blog)">{{ getDeleteLabel(blog) }}</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="filteredFaculty.length === 0" class="empty-state">
                  <p>No faculty blogs found</p>
                </div>
              </div>
            </template>

            <template #blog_pending>
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Blog ID</th>
                      <th>
                        <div>
                          <p>Title</p>
                          <SearchBarAndSort
                            placeholder="Search title"
                            :search="filters.title"
                            :sort="sortState.field === 'title' ? sortState.order : 'asc'"
                            @update:search="(v)=>{ filters.title = v }"
                            @update:sort="(o)=>{ sortState.field='title'; sortState.order=o }"
                          />
                        </div>
                      </th>
                      <th>Author</th>
                      <th>
                        <div>
                          <p>Status</p>
                          <SearchBarAndSort
                            placeholder="Search status"
                            :search="filters.status"
                            :sort="sortState.field === 'status' ? sortState.order : 'asc'"
                            @update:search="(v)=>{ filters.status = v }"
                            @update:sort="(o)=>{ sortState.field='status'; sortState.order=o }"
                          />
                        </div>
                      </th>
                      <th>Published At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody v-if="filteredPending.length > 0">
                    <tr v-for="(blog, idx) in filteredPending" :key="blog.blog_id || blog.BlogID || blog.id || idx">
                      <td>{{ blog.blog_id || blog.BlogID || blog.id || '' }}</td>
                      <td>{{ displayTitle(blog) }}</td>
                      <td>{{ displayAuthor(blog) }}</td>
                      <td>
                        <span v-if="blog.pending_action === 'delete'" class="badge bg-danger">Pending Delete</span>
                        <span v-else class="badge" :class="getBlogStatusClass(blog.Status || blog.status)">{{ (blog.Status || blog.status) || 'pending' }}</span>
                      </td>
                      <td>{{ formatDate(displayCommitted(blog)) }}</td>
                      <td class="actions">
                        <button class="btn-small" @click="onView(blog)">View</button>
                        <!-- Pending tab shows approvals for OTHER faculty only; hide edit/delete -->
                        <div class="img-btn-bg">
                          <ButtonImg
                            alt-text="pending check button"
                            class="pending_table_check_btn"
                            @click="onApprovePending(blog)"
                          />
                        </div>
                        <div class="img-btn-bg">
                          <ButtonImg
                            alt-text="pending deny button"
                            class="pending_table_deny_btn"
                            @click="onDenyPending(blog)"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="filteredPending.length === 0" class="empty-state">
                  <p>No pending blogs found</p>
                </div>
              </div>
            </template>
          </SplitMainWindow>
        </template>
      </Window>
    </section>

    <!-- Blog Form Modal -->
    <BlogFormModal
      modal-id="blog-form-modal"
      :blog="editingBlog"
      :loading="modalLoading"
      @submit="handleBlogSubmit"
      @close="closeModal"
    />

    <!-- Blog View Modal -->
    <Modals
      modal_id="blog-view-modal"
      modal_title="Blog Details"
      :close_btn_header_bool="true"
      :close_btn_footer_bool="true"
    >
      <template #content>
        <div v-if="viewBlog" class="p-2">
          <!-- Thumbnail -->
          <div class="row mb-3">
            <div class="col-12 text-center">
              <img :src="blogThumbnailSrc" alt="Blog Thumbnail" class="img-fluid blog-thumbnail" @error="onBlogThumbError" />
            </div>
          </div>

          <!-- Header row: ID + Status -->
          <div class="row mb-2">
            <div class="col-6">
              <p class="label">Blog ID</p>
              <p class="value">{{ viewBlog.blog_id || viewBlog.BlogID }}</p>
            </div>
            <div class="col-6 text-end">
              <span class="badge" :class="getBlogStatusClass(viewBlog.status || viewBlog.Status)">
                {{ (viewBlog.status || viewBlog.Status) || 'Published' }}
              </span>
            </div>
          </div>

          <!-- Title + ContentType -->
          <div class="row mb-3">
            <div class="col-6">
              <p class="label">Title</p>
              <p class="value fw-bold">{{ viewBlog.title || viewBlog.Title }}</p>
            </div>
            <div class="col-6" v-if="viewBlog.ContentType || viewBlog.content_type">
              <p class="label">Content Type</p>
              <p class="value">{{ viewBlog.ContentType || viewBlog.content_type }}</p>
            </div>
          </div>

          <!-- Author + Dates -->
          <div class="row mb-3">
            <div class="col-6">
              <p class="label">Author</p>
              <p class="value">{{ viewBlog.author_name || viewBlog.AuthorName || viewBlog.author_id }}</p>
            </div>
            <div class="col-3">
              <p class="label">Published At</p>
              <p class="value">{{ formatDate(viewBlog.published_at || viewBlog.PublishedAt || viewBlog.created_at) }}</p>
            </div>
            <div class="col-3">
              <p class="label">Last Updated</p>
              <p class="value">{{ formatDate(viewBlog.updated_at || viewBlog.UpdatedAt) }}</p>
            </div>
          </div>

          <!-- Content -->
          <div class="mb-3">
            <p class="label">Content</p>
            <div class="value bordered-text" v-html="viewBlog.blog_content || viewBlog.Content || viewBlog.content"></div>
          </div>
        </div>
        <div v-else class="text-center text-muted">No blog selected</div>
      </template>
    </Modals>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import * as facultySocket from '/js/faculty-socket-helpers.js'
import { toastError, toastSuccess } from '../../Toast.vue'
import Window from '../../window.vue'
import SplitMainWindow from '../../split-main-window.vue'
import SearchBarAndSort from '../../search-bar-and-sort.vue'
import ButtonText from '../../button-text.vue'
import ButtonImg from '../../button-img.vue'
import BlogFormModal from './modals/blog-form-modal.vue'
import Modals from '../../modal.vue'

const props = defineProps({
  blog_rows: { type: Array, default: () => [] },
  currentBlog: Object,
  perms: { type: Object, default: () => ({}) },
  socket: Object,
  sessionToken: String
})

const loading = ref(false)
const selectedBlog = ref(null)
const modalLoading = ref(false)
const editingBlog = ref(null)
const viewBlog = ref(null)
const blogThumbnailSrc = computed(() => normalizeUrl(viewBlog.value?.thumbnail_url || viewBlog.value?.ThumbnailUrl, '/asset/blog/default-blog.png'))

function getDeleteLabel(blogItem) {
  if (blogItem && blogItem.change_id && (blogItem.is_mine === 1 || blogItem.is_mine === true)) {
    return 'Cancel Change'
  }
  return 'Delete'
}

// Backend disabled: skip socket init
onMounted(() => {
  try {
    if (props.socket) facultySocket.initSocket(props.socket)
    try {
      facultySocket.getFacultyBlogs({ token_session: props.sessionToken }, (resp) => {
        if (resp && resp.success && Array.isArray(resp.blogs)) emit('refresh-blogs', resp.blogs)
      })
    } catch (e) { console.warn('facultySocket.getFacultyBlogs failed', e) }
  } catch (e) {}
})

function _openViewBlogHandler(e){
  try{
    const payload = e && e.detail ? e.detail : null
    if(!payload) return
    viewBlog.value = payload
    openViewModal()
  }catch(err){ console.warn('openViewBlog handler failed', err) }
}

function _openEditBlogHandler(e){
  try{
    const payload = e && e.detail ? e.detail : null
    if(!payload) return
    editingBlog.value = payload
    openModal()
  }catch(err){ console.warn('openEditBlog handler failed', err) }
}

onMounted(() => {
  try{
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('faculty.openViewBlog', _openViewBlogHandler)
      window.addEventListener('faculty.openEditBlog', _openEditBlogHandler)
    }
  }catch(e){}
})

onBeforeUnmount(() => {
  try{
    if (typeof window !== 'undefined' && window.removeEventListener) {
      window.removeEventListener('faculty.openViewBlog', _openViewBlogHandler)
      window.removeEventListener('faculty.openEditBlog', _openEditBlogHandler)
    }
  }catch(e){}
})

watch(() => props.sessionToken, (nv) => {
  try {
    if (!nv) return
    facultySocket.getFacultyBlogs({ token_session: nv }, (resp) => {
      if (resp && resp.success && Array.isArray(resp.blogs)) emit('refresh-blogs', resp.blogs)
    })
  } catch (e) {}
})

const emit = defineEmits(['view-blog', 'create-blog', 'edit-blog', 'update-blog', 'delete-blog', 'approve-blog', 'deny-blog', 'refresh-blogs'])

const activeSection = ref('blog_all')
const blogSections = [
  { id: 'blog_all', name: 'Global Blog' },
  { id: 'blog_faculty', name: 'My Blog' },
  { id: 'blog_pending', name: 'Pending Blog' }
]

const myBlogs = computed(() => {
  return (props.blog_rows || []).filter(b => b.is_mine === 1 || b.is_mine === true)
})

const pendingBlogs = computed(() => {
  const rows = props.blog_rows || []
  const byKey = new Map()

  for (const b of rows) {
    const isMine = b.is_mine === 1 || b.is_mine === true
    let include = false

    // Shared Level 1 pending items from other faculty. When both a
    // committed/approvals row and a faculty_pending_changes-backed row
    // exist for the same blog, we keep a single entry and prefer the
    // change-backed row.
    if (b.status === 'pending' && !isMine) include = true

    if (!include) continue

    const baseId = b.blog_id ?? b.BlogID ?? null
    const key = baseId != null ? `blog:${baseId}` : (b.change_id ? `change:${b.change_id}` : `row:${byKey.size}`)

    if (!byKey.has(key)) {
      byKey.set(key, b)
    } else {
      const existing = byKey.get(key)
      const existingIsChange = !!existing.change_id
      const currentIsChange = !!b.change_id
      if (currentIsChange && !existingIsChange) {
        byKey.set(key, b)
      }
    }
  }

  return Array.from(byKey.values())
})

const searchText = ref('')
const filterStatus = ref('')
const filters = ref({ title: '', status: '' })
const sortState = ref({ field: 'title', order: 'asc' })
// Global = approved only
const filteredAll = computed(() => applySort(applyFilters((props.blog_rows || []).filter(b => b.status === 'approved'))))
// My = everything I created (approved or pending)
const filteredFaculty = computed(() => applySort(applyFilters(myBlogs.value || [])))
// Pending = items created by OTHER faculty that are still pending
const filteredPending = computed(() => applySort(applyFilters(pendingBlogs.value || [])))

function applyFilters(arr){
  let out = arr
  const titleTerm = (filters.value.title || searchText.value || '').toLowerCase()
  const statusTerm = (filters.value.status || filterStatus.value || '').toLowerCase()
  if (titleTerm) out = out.filter(b => ((b.Title||b.title||'').toLowerCase()).includes(titleTerm))
  if (statusTerm) out = out.filter(b => ((b.Status||b.status||'').toLowerCase()) === statusTerm)
  return out
}
function applySort(arr){
  const term = (v) => (v||'').toString().toLowerCase()
  const getFieldVal = (b, field) => {
    if (field === 'title') return term(b.Title||b.title)
    if (field === 'status') return term(b.Status||b.status)
    return ''
  }
  const sf = sortState.value.field
  const so = sortState.value.order
  return (arr||[]).slice().sort((a,b)=>{
    const av = getFieldVal(a,sf); const bv = getFieldVal(b,sf)
    if (av === bv) return 0; const cmp = av > bv ? 1 : -1; return so === 'asc' ? cmp : -cmp
  })
}

const guard = (allowed, cb) => { if(!allowed){ toastError('You do not have permission to manage blogs'); return } cb() }

function openModal() {
  if (typeof window !== 'undefined' && window.bootstrap) {
    const modalElement = document.getElementById('blog-form-modal')
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement)
      modal.show()
    }
  }
}

function openViewModal() {
  if (typeof window !== 'undefined' && window.bootstrap) {
    const modalElement = document.getElementById('blog-view-modal')
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement)
      modal.show()
    }
  }
}

function closeModal() {
  if (typeof window !== 'undefined' && window.bootstrap) {
    const modalElement = document.getElementById('blog-form-modal')
    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement)
      if (modal) modal.hide()
    }
  }
  editingBlog.value = null
}

const onCreate = () => {
  guard(props.perms?.canManageBlogs, () => {
    editingBlog.value = null
    openModal()
  })
}

const onView = (blogItem) => {
  const targetId = typeof blogItem === 'object' ? (blogItem.blog_id || blogItem.BlogID) : blogItem
  // Backend disabled: view using provided row only
  loading.value = false
  const fallback = typeof blogItem === 'object' ? blogItem : null
  const target = fallback
  if (!target) { toastError('Blog not found'); return }
  viewBlog.value = target
  openViewModal()
  emit('view-blog', target)
}

// parse proposed_data for pending rows
const parseProposed = (row) => {
  if (!row) return {}
  try { return typeof row.proposed_data === 'string' ? JSON.parse(row.proposed_data) : (row.proposed_data || {}) } catch (e) { return {} }
}

const displayTitle = (row) => {
  const pd = parseProposed(row)
  return (
    row.Title ||
    row.title ||
    row.blog_title ||
    pd.Title ||
    pd.title ||
    pd.blog_title ||
    'Untitled Blog'
  )
}

const displayAuthor = (row) => {
  const pd = parseProposed(row)
  return row.AuthorName || row.author_name || pd.author_name || pd.AuthorName || pd.author || pd.Author || row.author_id || ''
}

const displayCommitted = (row) => {
  const pd = parseProposed(row)
  return row.PublishedAt || row.published_at || row.created_at || pd.published_at || pd.created_at
}

const onEdit = (blogItem) => {
  guard(props.perms?.canManageBlogs, () => {
    // Allow editing only for committed blogs with a valid id
    const blog = typeof blogItem === 'object'
      ? blogItem
      : (props.blog_rows || []).find(b => (b.blog_id || b.BlogID) === blogItem)

    if (!blog) { toastError('Blog not found'); return }
    // Allow editing of committed blogs with an id, and also
    // draft/pending blogs that come from faculty_pending_changes
    // (no blog_id yet) when they belong to this faculty.
    if (!blog.blog_id && !blog.BlogID) {
      if (!blog.change_id || !(blog.is_mine === 1 || blog.is_mine === true)) {
        toastError('This pending blog cannot be edited directly. Use approvals.');
        return
      }
    }
    editingBlog.value = blog
    openModal()
  })
}

const onDelete = (blogItem) => {
  guard(props.perms?.canManageBlogs, () => {
    const blog = typeof blogItem === 'object'
      ? blogItem
      : (props.blog_rows || []).find(b => (b.blog_id || b.BlogID) === blogItem)

    if (!blog) { toastError('Blog not found'); return }

    // If this is a pending faculty change owned by this user, treat delete
    // as "cancel my pending change" using the change_id.
    if (blog.change_id && (blog.is_mine === 1 || blog.is_mine === true)) {
      if (!confirm('Are you sure you want to cancel this pending change?')) return
      emit('delete-blog', { change_id: blog.change_id })
      return
    }

    // Do not attempt to delete purely pending blogs that have no committed blog_id
    if (!blog.blog_id && !blog.BlogID) {
      toastError('This pending blog cannot be deleted here. Use approvals.');
      return
    }

    if (!confirm('Are you sure you want to delete this blog?')) return
    // Delegate deletion to parent/FacultyDashboard
    emit('delete-blog', blog.blog_id || blog.BlogID)
  })
}

const onApprovePending = (blog) => {
  guard(props.perms?.canManageBlogs, () => {
    emit('approve-blog', blog)
  })
}

const onDenyPending = (blog) => {
  guard(props.perms?.canManageBlogs, () => {
    emit('deny-blog', blog)
  })
}

function handleBlogSubmit(payload) {
  modalLoading.value = true
  try {
    // When editing a draft/pending blog backed by
    // faculty_pending_changes, the editingBlog will carry a
    // change_id but the payload from the modal will not have a
    // blog_id yet. Attach the change_id so the dashboard can
    // update the pending change instead of creating a fresh row.
    if (!payload.BlogID && !payload.blog_id && !payload.id && editingBlog.value && editingBlog.value.change_id) {
      payload.change_id = editingBlog.value.change_id
    }

    const hasId = payload && (payload.BlogID || payload.blog_id || payload.id)
    const eventName = hasId || payload.change_id ? 'update-blog' : 'create-blog'
    // Forward to parent/FacultyDashboard, which will call the backend
    emit(eventName, payload)
  } finally {
    modalLoading.value = false
    closeModal()
  }
}

function normalizeUrl(path, fallback) {
  if (!path) return fallback
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return path
  return '/' + path.replace(/^\//, '')
}

function getBlogStatusClass(status) {
  const map = { 'Published': 'bg-success', 'published': 'bg-success', 'Draft': 'bg-warning', 'draft': 'bg-warning', 'Archived': 'bg-secondary', 'archived': 'bg-secondary', 'pending_review': 'bg-info', 'pending': 'bg-info' }
  return map[status] || map[(status||'').toString()] || 'bg-secondary'
}
function formatDate(dateStr) { return !dateStr ? '-' : (() => { try { return new Date(dateStr).toLocaleDateString() } catch(e) { return '-' } })() }

function onFiltersUpdated(filters){ /* header controls used; ignore */ }
</script>

<style scoped>
/* Banner for feature disabled state */
.feature-disabled {
  background: #fff3cd;
  color: #664d03;
  border: 1px solid #ffecb5;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}
.content-blogs {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h3 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.tab-nav {
  display: flex;
  gap: 5px;
  margin-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
}

.tab-btn {
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab-btn:hover {
  color: #667eea;
  background: #f9fafb;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  background: #5568d3;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}

.table thead {
  background: #f5f5f5;
}

.table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}

.table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

.table tbody tr:hover {
  background: #f9f9f9;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  background: #667eea;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.btn-small:hover {
  background: #5568d3;
}

.btn-small.btn-danger {
  background: #dc3545;
}

.btn-small.btn-danger:hover {
  background: #c82333;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #999;
}

.empty-state button {
  margin-top: 15px;
}
</style>
