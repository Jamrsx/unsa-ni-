<script>
import Window from '../../window.vue';
import TableList from '../../table-list.vue';
import SearchBarAndSort from '../../search-bar-and-sort.vue';
import DropdownArray from '../../dropdown-array.vue';
import ButtonImg from '../../button-img.vue';
import ButtonText from '../../button-text.vue';
import ProfilePic from '../../profile-pic.vue';
import ScrollVerticalCarousel from '../../scroll-vertical-carousel.vue';
import PlayerStatLevelMini from '../../player-stat-level-mini.vue';
import ModalButton from '../../modal-button.vue';
import Modals from '../../modal.vue';
import ToggleButton from '../../toggle-button.vue';

export default{
    components:{
        Window,
        ScrollVerticalCarousel,
        TableList,
        SearchBarAndSort,
        DropdownArray,
        ButtonImg,
        ButtonText,
        ProfilePic,
        PlayerStatLevelMini,
        ModalButton,
        Modals,
        ToggleButton
    }
}
</script>
<template>
            <ScrollVerticalCarousel>
                <TableList class="admin-table" :column_slot="['admin','admin_email','admin_role','admin_action']">
                    <template #admin>
                        <div>
                            <p>Admin</p>
                            <SearchBarAndSort
                                placeholder="Search name"
                                :search="filters.name"
                                :sort="sortState.field === 'name' ? sortState.order : 'asc'"
                                @update:search="onSearch('name', $event)"
                                @update:sort="onSort('name', $event)"
                            />
                        </div>
                    </template>
                    <template #admin_email>
                        <div>
                            <p>Email</p>
                            <SearchBarAndSort
                                placeholder="Search email"
                                :search="filters.email"
                                :sort="sortState.field === 'email' ? sortState.order : 'asc'"
                                @update:search="onSearch('email', $event)"
                                @update:sort="onSort('email', $event)"
                            />
                        </div>
                    </template>
                    <template #admin_role>
                        <div>
                            <p>Role</p>
                            <DropdownArray
                                v-model="roleFilter"
                                :options="['All','Faculty','Admin']"
                            />
                        </div>
                    </template>
                    <template #admin_action>
                        <div>
                            <p>Actions</p>
                        </div>
                    </template>

                    <template #content>
                        <tr v-for="(data,index) in displayedRows" :key="index" class="admin-table-row">
                            <td class="admin-table-data-user">
                                <div>
                                    <ButtonImg 
                                        class="admin-table-data-user-profile-pic"
                                        imgSrc=""
                                    >
                                        <template #content>
                                            <ProfilePic
                                                :imgSrc=data.UserImg
                                            />
                                        </template>
                                    </ButtonImg>
                                    <p class="admin-table-data-user-name">{{ data.UserName }}</p>
                                </div>
                            </td>
                            <td>{{ data.UserEmail }}</td>
                            <td>{{ data.UserRole }}</td>
                            <td>
                                <div class="row admin-table-data-action">
                                    <div class="col">
                                        <ModalButton
                                            :modal_btn_id="`edit-admin-modal-${data.UserID}`"
                                            modal_btn_title="Edit"
                                            :auto="false"
                                            @click="onEditClicked($event, data)"
                                        />
                                    </div>
                                    <div class="col">
                                        <ModalButton
                                            :modal_btn_id="`demote-admin-modal-${data.UserID}`"
                                            modal_btn_title="Demote"
                                            :auto="false"
                                            @click="onDemoteClicked($event, data)"
                                        />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </template>
                </TableList>
            </ScrollVerticalCarousel>

            <!-- Edit Admin Modal -->
            <div v-for="(data, index) in displayedRows" :key="`edit-${index}`">
                <Modals
                    :modal_id="`edit-admin-modal-${data.UserID}`"
                    :modal_title="`Edit ${data.UserRole} - ${data.UserName}`"
                    :close_btn_footer_bool="true"
                    :requirePermission="'roles.manage'"
                    :unauthorizedMessage="'You are not authorized to edit admin permissions.'"
                >
                    <template #content>
                        <div class="admin-modal-content">
                            <!-- Admin Profile -->
                            <div class="admin-modal-profile" style="text-align: center; margin-bottom: 20px;">
                                <img :src="data.UserImg" alt="Admin Avatar" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px;">
                                <p style="font-weight: bold; font-size: 18px;">{{ data.UserName }}</p>
                                <p style="font-size: 14px; color: #666;">{{ data.UserEmail }}</p>
                                <p style="font-size: 14px; color: #666;">Role: {{ data.UserRole }}</p>
                            </div>

                            <!-- Permission Toggles -->
                            <div class="row g-3">
                                <div class="col-12">
                                    <div class="p-3 border rounded">
                                        <h6 class="mb-2 text-capitalize">Assign Role</h6>
                                        <DropdownArray
                                            v-model="roleSelections[data.UserID]"
                                            :options="['user','faculty','admin']"
                                            :disabled="!assignAllowed[data.UserID] || !!savingRoles[data.UserID]"
                                        />
                                    </div>
                                </div>
                                <div class="col-12" v-for="group in groupedPermissions[data.UserID] || []" :key="group.name">
                                    <div class="p-3 border rounded">
                                        <h6 class="mb-2 text-capitalize">{{ group.name }}</h6>
                                        <div class="d-flex flex-column gap-2">
                                            <div v-for="perm in group.items" :key="perm.permission_name" class="d-flex justify-content-between align-items-center">
                                                <div style="display:flex;flex-direction:column;">
                                                    <span class="me-2">{{ prettyPermissionName(perm) }}</span>
                                                    <small style="color:#666">{{ perm.permission_name }}</small>
                                                </div>
                                                <ToggleButton
                                                    :name="`${perm.permission_name}-${data.UserID}`"
                                                    :label="permissionLabel(perm)"
                                                    v-model="perm.current_value"
                                                    :apiUrl="''"
                                                    :isInherited="isInheritedPermission(perm)"
                                                    @change="onTogglePerm(perm, data.UserID)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template #modal_footer>
                        <ButtonText
                            title="Cancel"
                            class="me-2"
                            @click="closeModal(`edit-admin-modal-${data.UserID}`)"
                        />
                        <ButtonText
                            :title="savingStates[data.UserID] ? 'Saving...' : 'Save'"
                            :disabled="!!savingStates[data.UserID] || !!savingRoles[data.UserID]"
                            @click="handleSavePermissions(data)"
                        />
                    </template>
                </Modals>
            </div>

            <!-- Remove Admin Modal -->
            <div v-for="(data, index) in displayedRows" :key="`remove-${index}`">
                <Modals
                    :modal_id="`demote-admin-modal-${data.UserID}`"
                    :modal_title="'Confirm Demote'"
                    :close_btn_footer_bool="true"
                    :requirePermission="'roles.assign.faculty'"
                    :unauthorizedMessage="'You are not authorized to demote this user.'"
                >
                    <template #content>
                        <div style="text-align: center; padding: 20px;">
                            <p style="font-size: 16px; margin-bottom: 20px;">
                                Demote <strong>{{ data.UserName }}</strong> to <strong>Faculty</strong>?
                            </p>
                            <p style="font-size: 14px; color: #666;">This will update their role to faculty.</p>
                        </div>
                    </template>

                    <template #modal_footer>
                        <button type="button" class="btn btn-danger" :disabled="!!savingRoles[data.UserID]" @click="handleDemoteAdmin(data)">Confirm Demote</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </template>
                </Modals>
            </div>
</template>

<script setup>
import { defineProps, reactive, computed, ref, onMounted } from 'vue'
import { get_admin_permissions, update_admin_permissions, update_admin_role } from '../../../js/admin-dashboard.js'
import { initPermissions, can, ensureCan } from '../../../js/permissions.js'
import { toastError } from '../../Toast.vue'

// Define props to receive admin_rows from parent AdminDashboard.vue
const props = defineProps({
    admin_rows: {
        type: Array,
        default: () => []
    }
})

// Local search filters and sort state
const filters = reactive({
    name: '',
    email: ''
})

const sortState = reactive({
    field: 'name',
    order: 'asc'
})

// Role filter dropdown
const roleFilter = ref('All')

// store permissions per admin id
const permissionForms = reactive({})
const groupedPermissions = reactive({})
const roleSelections = reactive({})
const assignAllowed = reactive({})
const savingRoles = reactive({})
const savingStates = reactive({})
onMounted(() => {
    // initialize current user's permissions for UI guards
    initPermissions()
})

function onSearch(field, value) {
    filters[field] = value
}

function onSort(field, order) {
    sortState.field = field
    sortState.order = order
}

const displayedRows = computed(() => {
    const term = (v) => (v || '').toString().toLowerCase()

    let rows = props.admin_rows.filter((row) => {
        const name = term(row.UserName)
        const email = term(row.UserEmail)
        const role = term(row.UserRole)

        const matchName = !filters.name || name.includes(term(filters.name))
        const matchEmail = !filters.email || email.includes(term(filters.email))
        const matchRole = roleFilter.value === 'All' || role === term(roleFilter.value)

        return matchName && matchEmail && matchRole
    })

    const fieldMap = {
        name: 'UserName',
        email: 'UserEmail'
    }

    const sortField = fieldMap[sortState.field]

    rows = rows.slice().sort((a, b) => {
        const av = term(a[sortField])
        const bv = term(b[sortField])
        if (av === bv) return 0
        const cmp = av > bv ? 1 : -1
        return sortState.order === 'asc' ? cmp : -cmp
    })

    return rows
})

function ensurePermissions(userId, roleName = null, force = false, cb = null) {
    if (force || !roleSelections[userId]) {
        roleSelections[userId] = (roleName || findAdminRole(userId) || 'user').toLowerCase()
    }
    if (permissionForms[userId] && !force) {
        if (cb) cb()
        return
    }
    get_admin_permissions(userId, (data) => {
        const normalized = (data.permissions || []).map((p) => ({
            permission_id: p.permission_id,
            permission_name: p.permission_name,
            permission_description: p.permission_description,
            role_is_granted: p.role_is_granted,
            user_is_granted: p.user_is_granted,
            category: p.category || 'basic',
            current_value: p.user_is_granted !== null ? p.user_is_granted : (p.role_is_granted !== null ? p.role_is_granted : false)
        }))
        permissionForms[userId] = normalized
        groupedPermissions[userId] = buildGroups(normalized)
        if (cb) cb()
    })
}

function onEditClicked(ev, data) {
    // Rely on modal-level guard for permission enforcement.
    // Ensure permission data for the target user is loaded, then request the modal to open.
    try {
        initPermissions(() => {
                ensurePermissions(data.UserID, data.UserRole, true, async () => {
                // determine whether actor may assign admin/faculty specifically
                try {
                    const canAssignAdmin = await ensureCan('roles.assign.admin')
                    const canAssignFaculty = await ensureCan('roles.assign.faculty')
                    assignAllowed[data.UserID] = !!(canAssignAdmin || canAssignFaculty)
                } catch (e) {
                    assignAllowed[data.UserID] = false
                }
                const el = document.getElementById(`edit-admin-modal-${data.UserID}`)
                if (!el) return
                const modalInstance = window.bootstrap ? new window.bootstrap.Modal(el) : null
                modalInstance?.show()
            })
        })
    } catch (e) {
        // fallback: still try to load permissions for target user
                ensurePermissions(data.UserID, data.UserRole, true, () => {
            const el = document.getElementById(`edit-admin-modal-${data.UserID}`)
            if (!el) return
            const modalInstance = window.bootstrap ? new window.bootstrap.Modal(el) : null
            modalInstance?.show()
        })
    }
}

function onDemoteClicked(ev, data) {
    // Rely on modal-level guard for permission enforcement.
    try {
        initPermissions(() => {
            ensurePermissions(data.UserID, data.UserRole, false, () => {
                const el = document.getElementById(`demote-admin-modal-${data.UserID}`)
                if (!el) return
                const modalInstance = window.bootstrap ? new window.bootstrap.Modal(el) : null
                modalInstance?.show()
            })
        })
    } catch (e) {
        ensurePermissions(data.UserID, data.UserRole, false, () => {
            const el = document.getElementById(`demote-admin-modal-${data.UserID}`)
            if (!el) return
            const modalInstance = window.bootstrap ? new window.bootstrap.Modal(el) : null
            modalInstance?.show()
        })
    }
}

function buildGroups(list) {
    const order = ['faculty','problem','blog','event','approvals','roles','users','admin']
    const groups = order.map(name => ({ name, items: [] }))
    list.forEach(p => {
        const idx = groups.findIndex(g => g.name === p.category)
        if (idx >= 0) groups[idx].items.push(p)
        else groups[groups.length - 1].items.push(p) // fallback to last group (admin)
    })
    return groups.filter(g => g.items.length > 0)
}

function handleSavePermissions(admin) {
    // Refresh permission cache then require roles.manage to save permission overrides
    try {
        initPermissions(() => {
            if (!can('roles.manage')) {
                try { toastError('You are not authorized to save permission changes.'); } catch (e) {}
                return
            }
            // proceed with save
            // compute and persist overrides (original implementation)
            const form = permissionForms[admin.UserID] || []
            const intended = form.reduce((acc, p) => { acc[p.permission_name] = !!p.current_value; return acc }, {})
            const desiredRole = (roleSelections[admin.UserID] || findAdminRole(admin.UserID) || 'user').toLowerCase()
            const currentRole = (admin.UserRole || '').toLowerCase()

            const computeAndSave = () => {
                const latestForm = permissionForms[admin.UserID] || []
                const overrides = latestForm.map((p) => {
                    const roleVal = p.role_is_granted
                    const current = !!p.current_value
                    if (roleVal === null) return current ? { permission_id: p.permission_id, is_granted: true } : null
                    if (current === roleVal) return null
                    return { permission_id: p.permission_id, is_granted: current }
                }).filter(Boolean)
                update_admin_permissions(admin.UserID, overrides, () => {
                    const latestForm = permissionForms[admin.UserID] || []
                    latestForm.forEach(p => {
                        const roleVal = p.role_is_granted
                        const current = !!p.current_value
                        if (roleVal === null) p.user_is_granted = current ? true : null
                        else p.user_is_granted = current === roleVal ? null : current
                    })
                    groupedPermissions[admin.UserID] = buildGroups(latestForm)
                    // Refresh current user's permission cache so can() reflects any changes
                    try { initPermissions(() => closeModal(`edit-admin-modal-${admin.UserID}`)) } catch (e) { closeModal(`edit-admin-modal-${admin.UserID}`) }
                })
            }

            if (desiredRole !== currentRole) {
                // require specific assign permission for changing to admin/faculty
                (async () => {
                    try {
                        if (desiredRole === 'admin') {
                            if (!(await ensureCan('roles.assign.admin'))) { try { toastError('You are not authorized to assign Admin role.'); } catch (e) {} return }
                        } else if (desiredRole === 'faculty') {
                            if (!(await ensureCan('roles.assign.faculty'))) { try { toastError('You are not authorized to assign Faculty role.'); } catch (e) {} return }
                        } else {
                            // demote to user: require at least one assign permission or roles.manage
                            const allowed = (await ensureCan('roles.assign.faculty')) || (await ensureCan('roles.assign.admin')) || (await ensureCan('roles.manage'))
                            if (!allowed) { try { toastError('You are not authorized to change roles.'); } catch (e) {} return }
                        }

                        savingRoles[admin.UserID] = true
                        update_admin_role(admin.UserID, desiredRole, () => {
                            savingRoles[admin.UserID] = false
                            admin.UserRole = capitalizeRole(desiredRole)
                            delete permissionForms[admin.UserID]
                            get_admin_permissions(admin.UserID, (data) => {
                                const normalized = (data.permissions || []).map((p) => ({
                                    permission_id: p.permission_id,
                                    permission_name: p.permission_name,
                                    permission_description: p.permission_description,
                                    role_is_granted: p.role_is_granted,
                                    user_is_granted: p.user_is_granted,
                                    category: p.category || 'basic',
                                    current_value: intended[p.permission_name] !== undefined ? intended[p.permission_name] : (p.user_is_granted !== null ? p.user_is_granted : (p.role_is_granted !== null ? p.role_is_granted : false))
                                }))
                                permissionForms[admin.UserID] = normalized
                                groupedPermissions[admin.UserID] = buildGroups(normalized)
                                computeAndSave()
                            })
                        }, (err) => {
                            savingRoles[admin.UserID] = false
                            try { toastError('Role update failed') } catch (e) {}
                        })
                    } catch (e) {
                        console.error('role assignment permission check failed', e)
                        try { toastError('Unable to verify permissions; role change cancelled.') } catch (ee) {}
                    }
                })()
            } else computeAndSave()
        })
    } catch (e) {
        console.error('handleSavePermissions initPermissions failed', e)
        try { toastError('Unable to verify permissions; please refresh the page.') } catch (ee) {}
        return
    }
}

// Called when a permission toggle changes in the UI
function onTogglePerm(perm, userId) {
    try {
        // refresh current user's permissions before checking
        initPermissions(() => {
            const current = !!perm.current_value
            const prior = !current

            if (!canEditPermission(userId, perm)) {
                try { toastError('You are not authorized to change this permission.'); } catch (e) {}
                perm.current_value = prior
                return
            }

            const roleVal = perm.role_is_granted
            if (roleVal === null || roleVal === undefined) {
                perm.user_is_granted = current ? true : null
            } else {
                perm.user_is_granted = (current === roleVal) ? null : current
            }

            perm.current_value = (perm.user_is_granted === null || perm.user_is_granted === undefined) ? !!perm.role_is_granted : !!perm.user_is_granted

            if (permissionForms[userId]) groupedPermissions[userId] = buildGroups(permissionForms[userId])
        })
    } catch (e) {
        console.error('onTogglePerm error', e)
    }
}

function handleDemoteAdmin(admin) {
    roleSelections[admin.UserID] = 'faculty'
    savingRoles[admin.UserID] = true
    update_admin_role(admin.UserID, 'faculty', () => {
        savingRoles[admin.UserID] = false
        admin.UserRole = 'Faculty'
        delete permissionForms[admin.UserID]
        groupedPermissions[admin.UserID] = []
        ensurePermissions(admin.UserID, admin.UserRole, true)
        closeModal(`demote-admin-modal-${admin.UserID}`)
    }, (err) => {
        savingRoles[admin.UserID] = false
        try { toastError('Demote failed') } catch (e) {}
    })
}

function closeModal(id) {
    const el = document.getElementById(id)
    if (!el) return
    const modalInstance = window.bootstrap?.Modal.getInstance(el) || (window.bootstrap ? new window.bootstrap.Modal(el) : null)
    modalInstance?.hide()
}

function permissionLabel(perm) {
    if (perm.user_is_granted === null || perm.user_is_granted === undefined) {
        return 'Inherit'
    }
    return perm.current_value ? 'Allowed' : 'Denied'
}

function isInheritedPermission(perm) {
    return perm.user_is_granted === null || perm.user_is_granted === undefined
}

// Can the current editor modify this permission for the given target user?
// Rule: if the target's selected role is 'admin', allow editing any permission.
// If the permission is provided by the target role (role_is_granted !== null), allow editing (override).
// Otherwise (permission not part of role and target is not admin), disallow direct modification.
function canEditPermission(userId, perm) {
    // Strict behavior: allow if actor has global roles.manage, or
    // if actor has the specific permission being edited. This applies to ALL permissions.
    try {
        if (can('roles.manage')) return true
        if (perm && perm.permission_name && can(perm.permission_name)) return true
    } catch (e) {
        // fallback deny
    }
    return false
}

function prettyPermissionName(perm) {
    if (!perm) return ''
    if (perm.permission_description && perm.permission_description.trim().length > 0) return perm.permission_description
    // fallback: prettify permission_name (e.g., blog.approvals.manage -> Blog • Approvals • Manage)
    const key = (perm.permission_name || '').toString()
    if (!key) return ''
    return key.split(/[\.\_]/).map(s => s.replace(/\b\w/g, c => c.toUpperCase())).join(' · ')
}

function findAdminRole(userId) {
    const admin = props.admin_rows.find(a => a.UserID === userId)
    return admin ? (admin.UserRole || '').toLowerCase() : null
}

function capitalizeRole(name) {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1)
}
</script>
