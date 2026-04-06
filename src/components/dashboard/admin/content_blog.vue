<template>
    <div class="row d-flex flex-row">
        <section>
            <Window>
            <template #title></template>
            <template #content>
                <!-- top navigation -->
                <SplitMainWindow :sections="blog_sections" default-section="global_blog" :show-label="false" class="top-split-main-window">
                    <template #nav-menu-bottom>
                        <ButtonText
                            title="Create New Blog"
                            altText="blog create button"
                            class="blog_table_create_btn"
                            @click="handleOpenCreate"
                        />
                    </template>
                    <!-- table here -->
                    <template #global_blog>
                        <Global_blog_table
                            :blog_rows="global_blog_rows"
                            @view-blog="handleViewBlog"
                            @edit-blog="handleEditBlog"
                            @show-delete-confirm="openDeleteConfirm"
                        />
                    </template>
                    <template #user_blog>
                        <User_blog_table
                            :blog_rows="user_blog_rows"
                            @view-blog="handleViewBlog"
                            @edit-blog="handleEditBlog"
                            @show-delete-confirm="openDeleteConfirm"
                        />
                    </template>
                    <template #pending_blog>
                        <Pending_blog_table
                            :blog_rows="pending_blog_rows"
                            @view-blog="handleViewBlog"
                            @approve-blog="handleApproveBlog"
                            @deny-blog="handleDenyBlog"
                        />
                    </template>
                </SplitMainWindow>
            </template>
            </Window>
        </section>

        <!-- Modals -->
        <Blog_view_modal :blog="currentBlog" />
        <Blog_create_modal @create-blog="handleCreateBlog" />
        <Blog_edit_modal :blog="currentBlog" @update-blog="handleUpdateBlog" />
    </div>
</template>

<script setup>
    const blog_sections = [
        { id: 'global_blog', name: 'Global Blog' },
        { id: 'user_blog', name: 'My Blog' },
        { id: 'pending_blog', name: 'Pending Blog' }
    ]

    // pressable [data-href] tr's
    // will user property 'data-href' in admin_question_set folder
    document.addEventListener('DOMContentLoaded', function(){
        const rows = document.querySelectorAll('tr[data-href]');
        rows.forEach(row => {
            row.addEventListener('click',function(){
                window.location.href = this.dataset.href;
            });
        });
    });
</script>

<script>
import Window from '../../window.vue'
import SplitMainWindow from '../../split-main-window.vue'
import ButtonText from '../../button-text.vue'

import Global_blog_table from './admin_blog_set/global_blog_table.vue'
import User_blog_table from './admin_blog_set/user_blog_table.vue'
import Pending_blog_table from './admin_blog_set/pending_blog_table.vue'

import Blog_view_modal from './admin_blog_set/blog_view_modal.vue'
import Blog_create_modal from './admin_blog_set/blog_create_modal.vue'
import Blog_edit_modal from './admin_blog_set/blog_edit_modal.vue'

import { get_blog_details } from '../../../js/admin-dashboard.js'
import { can, initPermissions, ensureCan } from '../../../js/permissions.js'
import { toastError } from '../../Toast.vue'

export default {
    props: {
        global_blog_rows: { type: Array, default: () => [] },
        user_blog_rows: { type: Array, default: () => [] },
        pending_blog_rows: { type: Array, default: () => [] },
        currentBlog: { type: Object, default: () => ({}) }
    },
    emits: ['view-blog','create-blog','delete-blog','approve-blog','deny-blog','edit-blog','update-blog'],
    components: {
        Window,
        SplitMainWindow,
        ButtonText,
        Global_blog_table,
        User_blog_table,
        Pending_blog_table,
        Blog_view_modal,
        Blog_create_modal,
        Blog_edit_modal
    },
    data() {
        return { permsTick: 0 }
    },
    computed: {
        canCreateButton() {
            const _t = this.permsTick
            try { return can('blog.create') || can('blog.create.*') }
            catch (e) { return false }
        }
    },
    mounted() {
        try { initPermissions(() => { this.permsTick = Date.now() }) } catch (e) {}
        this._permListener = () => { this.permsTick = Date.now() }
        if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('my_permissions_updated', this._permListener)
    },
    beforeUnmount() {
        try { if (this._permListener && typeof window !== 'undefined' && window.removeEventListener) window.removeEventListener('my_permissions_updated', this._permListener) } catch (e) {}
    },
    methods: {
        async handleOpenCreate() {
            try {
                const allowed = await ensureCan('blog.create')
                if (!allowed) { toastError('You are not authorized to create blogs.'); return }
                const el = document.getElementById('createBlogModal')
                if (el) {
                    const bs = window.bootstrap?.Modal.getInstance(el) || new window.bootstrap.Modal(el)
                    bs.show()
                }
            } catch (e) { console.error(e); toastError('Unable to verify permissions') }
        },

        // Forward create after modal already validated (double-guard)
        handleCreateBlog(payload) {
            this.$emit('create-blog', payload)
        },

        handleViewBlog(blogId) {
            // viewing is considered read-only; forward to parent to load details
            this.$emit('view-blog', blogId)
        },

        async handleEditBlog(blogId) {
            try {
                // get blog details to determine ownership
                const blogData = await new Promise((resolve, reject) => {
                    get_blog_details(blogId, (d) => { if (!d || !d.blog) return reject(new Error('Failed to load blog')); resolve(d.blog) })
                })

                const authorId = blogData.AuthorID || blogData.AuthorId || blogData.author_id || blogData.AuthorID
                const currentUserId = window.user?.userId || window.user?.id || null

                if (await ensureCan('blog.edit.any')) { this.$emit('edit-blog', blogId); return }
                if (authorId && currentUserId && Number(authorId) === Number(currentUserId)) {
                    if (await ensureCan('blog.edit.own')) { this.$emit('edit-blog', blogId); return }
                }

                toastError('You are not authorized to edit this blog.')
            } catch (e) {
                console.error(e)
                toastError('Unable to verify permissions for editing')
            }
        },

        async handleDeleteBlog(blogId) {
            try {
                // fetch blog details to determine ownership
                const blogData = await new Promise((resolve, reject) => {
                    get_blog_details(blogId, (d) => { if (!d || !d.blog) return reject(new Error('Failed to load blog')); resolve(d.blog) })
                })
                const authorId = blogData.AuthorID || blogData.AuthorId || blogData.author_id || blogData.AuthorID
                const currentUserId = window.user?.userId || window.user?.id || null

                if (await ensureCan('blog.delete.any')) { this.$emit('delete-blog', blogId); return }
                if (authorId && currentUserId && Number(authorId) === Number(currentUserId)) {
                    if (await ensureCan('blog.delete.own')) { this.$emit('delete-blog', blogId); return }
                }

                toastError('You are not authorized to delete this blog.')
            } catch (e) {
                console.error(e)
                toastError('Unable to verify permissions for delete')
            }
        },

        async handleApproveBlog(data) {
            // Blog approvals use approvals permissions, not edit-any/own.
            try {
                if (!data?.BlogID || !data?.ApprovalID) {
                    toastError('Missing blog/approval id for approval')
                    return
                }

                const canBlogApprovals = await ensureCan('blog.approvals.manage')
                const canGlobalApprovals = await ensureCan('approvals.manage')
                const canRoles = await ensureCan('roles.manage')

                if (canBlogApprovals || canGlobalApprovals || canRoles) {
                    this.$emit('approve-blog', data)
                    return
                }

                toastError('You are not authorized to approve this blog.')
            } catch (e) { console.error(e); toastError('Unable to verify permissions for approve') }
        },

        async handleDenyBlog(data) {
            try {
                if (!data?.BlogID || !data?.ApprovalID) {
                    toastError('Missing blog/approval id for denial')
                    return
                }

                const canBlogApprovals = await ensureCan('blog.approvals.manage')
                const canGlobalApprovals = await ensureCan('approvals.manage')
                const canRoles = await ensureCan('roles.manage')

                if (canBlogApprovals || canGlobalApprovals || canRoles) {
                    this.$emit('deny-blog', data)
                    return
                }

                toastError('You are not authorized to deny this blog.')
            } catch (e) { console.error(e); toastError('Unable to verify permissions for deny') }
        },

        // Forward update after modal guards
        handleUpdateBlog(payload) {
            this.$emit('update-blog', payload)
        }
        ,
        async openDeleteConfirm() {
            try {
                const blogId = typeof window !== 'undefined' ? window.__deleteCandidate : null
                if (!blogId) { toastError('No blog selected for delete'); return }

                // fetch blog details to determine ownership
                const blogData = await new Promise((resolve, reject) => {
                    get_blog_details(blogId, (d) => { if (!d || !d.blog) return reject(new Error('Failed to load blog')); resolve(d.blog) })
                })

                const authorId = blogData.AuthorID || blogData.AuthorId || blogData.author_id || blogData.AuthorID
                const currentUserId = window.user?.userId || window.user?.id || null

                if (await ensureCan('blog.delete.any')) {
                    const el = document.getElementById('deleteConfirmModal')
                    if (el) {
                        const bs = window.bootstrap?.Modal.getInstance(el) || new window.bootstrap.Modal(el)
                        bs.show()
                    }
                    return
                }

                if (authorId && currentUserId && Number(authorId) === Number(currentUserId)) {
                    if (await ensureCan('blog.delete.own')) {
                        const el = document.getElementById('deleteConfirmModal')
                        if (el) {
                            const bs = window.bootstrap?.Modal.getInstance(el) || new window.bootstrap.Modal(el)
                            bs.show()
                        }
                        return
                    }
                }

                toastError('You are not authorized to delete this blog.')
                try { window.__deleteCandidate = null } catch (e) {}
            } catch (e) {
                console.error('openDeleteConfirm failed', e)
                toastError('Unable to verify delete permissions')
                try { window.__deleteCandidate = null } catch (e) {}
            }
        }
    }
}
</script>
