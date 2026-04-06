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
import PlayerStatLevel from '../../player-stat-level.vue';
import PlayerStatDuelPoint from '../../player-stat-duel-point.vue';
import TextField from '../../text-field.vue';
import { update_admin_role, ban_user } from '../../../js/admin-dashboard.js';
import { initPermissions, can, ensureCan } from '../../../js/permissions.js'
import { toastError, toastSuccess } from '../../Toast.vue'

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
        PlayerStatLevel,
        PlayerStatDuelPoint,
        TextField
    }
}
</script>
<template>
            <ScrollVerticalCarousel>
                <TableList class="user-table" :column_slot="['user_player','user_duelpoint','user_email','user_country','user_action']">
                    <template #user_player>
                        <div>
                            <p>Player username</p>
                            <SearchBarAndSort
                                placeholder="Search username"
                                :search="filters.username"
                                :sort="sortState.field === 'username' ? sortState.order : 'asc'"
                                @update:search="onSearch('username', $event)"
                                @update:sort="onSort('username', $event)"
                            />
                        </div>
                    </template>
                    <template #user_duelpoint>
                        <p>Duel points</p>
                    </template>
                    <template #user_email>
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
                    <template #user_country>
                        <div>
                            <p>Country</p>
                            <SearchBarAndSort
                                placeholder="Search country"
                                :search="filters.country"
                                :sort="sortState.field === 'country' ? sortState.order : 'asc'"
                                @update:search="onSearch('country', $event)"
                                @update:sort="onSort('country', $event)"
                            />
                        </div>
                    </template>
                    <template #user_action>
                        <div>
                            <p>Actions</p>
                        </div>
                    </template>

                    <template #content>
                        <tr v-for="(data,index) in displayedRows" :key="index" class="user-table-row">
                            <td class="user-table-data-user">
                                <div>
                                    <ButtonImg 
                                        class="user-table-data-user-profile-pic"
                                        imgSrc=""
                                    >
                                        <template #content>
                                            <ProfilePic
                                                :imgSrc=data.UserImg
                                            />
                                        </template>
                                    </ButtonImg>
                                    <p class="user-table-data-user-name">{{ data.UserName }}</p>
                                    <PlayerStatLevelMini
                                        :level="data.UserLvl"
                                        :size=30
                                    />
                                </div>
                            </td>
                            <td>{{ data.UserDP }}</td>
                            <td>{{ data.UserEmail }}</td>
                            <td>{{ data.UserCountry || 'N/A' }}</td>
                            <td>
                                <div class="row user-table-data-action">
                                    <div class="col">
                                        <ModalButton
                                            :modal_btn_id="`view-user-modal-${data.UserID}`"
                                            modal_btn_title="View"
                                            :auto="false"
                                            @click="openViewUser(data)"
                                        />
                                    </div>
                                    <div class="col">
                                        <ModalButton
                                            :modal_btn_id="`ban-user-modal-${data.UserID}`"
                                            modal_btn_title="Ban"
                                            :auto="false"
                                            @click="openBanModal(data)"
                                        />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </template>
                </TableList>
            </ScrollVerticalCarousel>

            <!-- View User Modal -->
            <div v-for="(data, index) in displayedRows" :key="`view-${index}`">
                <Modals
                    :modal_id="`view-user-modal-${data.UserID}`"
                    :modal_title="`${data.UserName} - Player Stats`"
                    :close_btn_footer_bool="true"
                >
                    <template #content>
                        <div class="user-modal-content">
                            <div class="row g-3">
                                <!-- User Details -->
                                <div class="col-12">
                                    <div class="p-3 border rounded">
                                        <h6 class="mb-2 text-capitalize">User Details</h6>
                                        <div class="user-modal-profile" style="text-align: center; margin-bottom: 20px;">
                                            <img :src="data.UserImg" alt="User Avatar" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px;">
                                            <p style="font-weight: bold; font-size: 18px;">{{ data.UserName }}</p>
                                        </div>
                                        <div style="display: flex; justify-content: space-around; margin-bottom: 20px;">
                                            <div style="flex: 1; display: flex; justify-content: center;">
                                                <PlayerStatLevel
                                                    :level="data.UserLvl"
                                                    :currentExp="0"
                                                    :maxExp="100"
                                                    :size="100"
                                                />
                                            </div>
                                            <div style="flex: 1; display: flex; justify-content: center;">
                                                <PlayerStatDuelPoint
                                                    :rank="1"
                                                    :points="data.UserDP"
                                                    :size="100"
                                                />
                                            </div>
                                        </div>
                                        <TextField
                                            label="Username"
                                            name="username"
                                            :model-value="data.UserName"
                                            disabled
                                        />
                                        <TextField
                                            label="Email"
                                            name="email"
                                            :model-value="data.UserEmail"
                                            disabled
                                        />
                                        <TextField
                                            label="Level"
                                            name="level"
                                            :model-value="String(data.UserLvl)"
                                            disabled
                                        />
                                        <TextField
                                            label="Duel Points"
                                            name="duel-points"
                                            :model-value="String(data.UserDP)"
                                            disabled
                                        />
                                    </div>
                                </div>

                                <!-- Assign Role -->
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
                            </div>
                        </div>
                    </template>

                    <template #modal_footer>
                        <ButtonText
                            title="Save"
                            class="me-2"
                            :disabled="!!savingRoles[data.UserID]"
                            @click="handleSaveUserRole(data)"
                        />
                        <ModalButton
                            :modal_btn_id="`ban-user-modal-${data.UserID}`"
                            modal_btn_title="Ban User"
                            :auto="false"
                            @click="openBanModal(data)"
                        />
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </template>
                </Modals>
            </div>

            <!-- Ban User Modal -->
            <div v-for="(data, index) in displayedRows" :key="`ban-${index}`">
                <Modals
                    :modal_id="`ban-user-modal-${data.UserID}`"
                    :modal_title="'Confirm Ban'"
                    :close_btn_footer_bool="true"
                >
                    <template #content>
                        <div style="text-align: center; padding: 20px;">
                            <p style="font-size: 16px; margin-bottom: 20px;">
                                Are you sure you want to ban <strong>{{ data.UserName }}</strong>?
                            </p>
                        </div>
                    </template>

                    <template #modal_footer>
                        <button type="button" class="btn btn-danger" @click="handleBanUser(data)">Confirm Ban</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </template>
                </Modals>
            </div>
</template>

<script setup>
import { defineProps, reactive, computed } from 'vue'

// Define props to receive user_rows from parent AdminDashboard.vue
const props = defineProps({
    user_rows: {
        type: Array,
        default: () => []
    }
})

// Local search filters and sort state
const filters = reactive({
    username: '',
    email: '',
    country: ''
})

const sortState = reactive({
    field: 'username',
    order: 'asc'
})

const roleSelections = reactive({})
const assignAllowed = reactive({})
const savingRoles = reactive({})

function onSearch(field, value) {
    filters[field] = value
}

function onSort(field, order) {
    sortState.field = field
    sortState.order = order
}

const displayedRows = computed(() => {
    const term = (v) => (v || '').toString().toLowerCase()

    let rows = props.user_rows.filter((row) => {
        const username = term(row.UserName)
        const email = term(row.UserEmail)
        const country = term(row.UserCountry)

        const matchUser = !filters.username || username.includes(term(filters.username))
        const matchEmail = !filters.email || email.includes(term(filters.email))
        const matchCountry = !filters.country || country.includes(term(filters.country))

        return matchUser && matchEmail && matchCountry
    })

    const fieldMap = {
        username: 'UserName',
        email: 'UserEmail',
        country: 'UserCountry'
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

function ensureRoleSelection(user) {
    if (roleSelections[user.UserID]) return
    const currentRole = (user.UserRole || 'user').toLowerCase()
    roleSelections[user.UserID] = currentRole
}

// Programmatically open the view-user modal and ensure role selection is prepared
async function openViewUser(user) {
    // permission guard: require role assignment privileges
    try {
        const allowed = await ensureCan('users.view')
        if (!allowed) {
            try { toastError('You are not authorized to view user details.'); } catch (e) {}
            return
        }
    } catch (err) {
        console.error('Permission check failed', err)
        try { toastError('Unable to verify permissions; please refresh the page.'); } catch (e) {}
        return
    }

    // prepare role selection state (always reset to persisted server value)
    try {
        const currentRole = (user.UserRole || 'user').toLowerCase()
        roleSelections[user.UserID] = currentRole
    } catch (e) { console.error('ensureRoleSelection failed', e) }

    // determine whether current actor is allowed to assign roles (specific checks)
    try {
        const canAssignAdmin = await ensureCan('roles.assign.admin')
        const canAssignFaculty = await ensureCan('roles.assign.faculty')
        // allow dropdown only if any of the specific assign permissions are granted
        assignAllowed[user.UserID] = !!(canAssignAdmin || canAssignFaculty)
    } catch (e) {
        console.error('failed checking assign permissions', e)
        assignAllowed[user.UserID] = false
    }

    try {
        if (!user || !user.UserID) return
        console.debug('[openViewUser] opening view modal for user', user && user.UserID)
        const modalEl = document.getElementById(`view-user-modal-${user.UserID}`)
        if (modalEl) {
            if (window.bootstrap?.Modal) {
                const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
                instance.show()
                return
            }
            // Fallback: manually show modal if bootstrap JS is missing
            try {
                console.warn('[modal-fallback] bootstrap.Modal not found — using fallback to show modal', modalEl.id)
                modalEl.classList.add('show')
                modalEl.style.display = 'block'
                document.body.classList.add('modal-open')
                // remove any existing backdrop with same id to avoid duplicates
                const existing = document.getElementById(`backdrop-${modalEl.id}`)
                if (existing && existing.parentNode) existing.parentNode.removeChild(existing)
                // add backdrop
                const backdrop = document.createElement('div')
                backdrop.className = 'modal-backdrop fade show'
                backdrop.id = `backdrop-${modalEl.id}`
                document.body.appendChild(backdrop)
            } catch (e) { console.error('modal fallback show failed', e) }
        }
    } catch (e) {
        console.error(' Failed to open view user modal', e)
    }
}

// Programmatically open the ban confirmation modal
function openBanModal(user) {
    try {
        console.debug('[openBanModal] attempting to open ban modal for user', user && user.UserID)
        const modalEl = document.getElementById(`ban-user-modal-${user.UserID}`)
        if (modalEl) {
            if (window.bootstrap?.Modal) {
                const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl)
                instance.show()
                return
            }
            // Fallback: manually show modal if bootstrap JS is missing
            try {
                console.warn('[modal-fallback] bootstrap.Modal not found — using fallback to show modal', modalEl.id)
                modalEl.classList.add('show')
                modalEl.style.display = 'block'
                document.body.classList.add('modal-open')
                const backdrop = document.createElement('div')
                backdrop.className = 'modal-backdrop fade show'
                backdrop.id = `backdrop-${modalEl.id}`
                document.body.appendChild(backdrop)
            } catch (e) { console.error('modal fallback show failed', e) }
        }
    } catch (e) {
        console.error('Failed to open ban modal', e)
    }
}

async function handleSaveUserRole(user) {
    const selected = (roleSelections[user.UserID] || 'user').toLowerCase()

    // Require specific assign permission for changing to admin/faculty.
    try {
        if (selected === 'admin') {
            if (!(await ensureCan('roles.assign.admin'))) {
                try { toastError('You are not authorized to assign Admin role.'); } catch (e) {}
                return
            }
        } else if (selected === 'faculty') {
            if (!(await ensureCan('roles.assign.faculty'))) {
                try { toastError('You are not authorized to assign Faculty role.'); } catch (e) {}
                return
            }
        } else {
            // demoting to user — require at least one of the assign perms or roles.manage
            const allowed = (await ensureCan('roles.assign.faculty')) || (await ensureCan('roles.assign.admin')) || (await ensureCan('roles.manage'))
            if (!allowed) {
                try { toastError('You are not authorized to change roles.'); } catch (e) {}
                return
            }
        }
    } catch (e) {
        console.error('Permission check failed', e)
        try { toastError('Unable to verify permissions; please refresh the page.'); } catch (ee) {}
        return
    }

    // If checks passed, perform server-side update
    savingRoles[user.UserID] = true
    update_admin_role(user.UserID, selected, () => {
        savingRoles[user.UserID] = false
        user.UserRole = capitalizeRole(selected)
    }, (err) => {
        savingRoles[user.UserID] = false
        try { toastError('Role update failed') } catch (e) {}
    })
}

function capitalizeRole(name) {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1)
}

// Handle ban user action
async function handleBanUser(user) {
    // ban user invoked
    try {
        const allowed = (await ensureCan('admin.ban_users')) || (await ensureCan('roles.manage'))
        if (!allowed) {
            try { toastError('You are not authorized to ban users.'); } catch (e) {}
            return
        }

        // Call authoritative HTTP endpoint to perform ban
        try {
            const token = localStorage.getItem('jwt_token')
            const API_URL = import.meta.env.VITE_API_URL || ''
            const res = await fetch(`${API_URL}/api/admin/ban-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ user_id: user.UserID })
            })
            let resp = null
            let rawText = null
            try {
                resp = await res.json()
            } catch (e) {
                try { rawText = await res.text() } catch (e2) { rawText = null }
            }
            try { console.debug('[ban] server response', { status: res.status, json: resp, text: rawText }) } catch (e) {}
            if (res.ok && resp && resp.success) {
                try { toastSuccess('User banned successfully'); } catch (e) {}
                try {
                    const modalEl = document.getElementById(`ban-user-modal-${user.UserID}`)
                    if (modalEl) {
                        if (window.bootstrap?.Modal) {
                            const inst = window.bootstrap.Modal.getInstance(modalEl)
                            inst && inst.hide()
                        } else {
                            modalEl.classList.remove('show')
                            modalEl.style.display = 'none'
                            try { document.body.classList.remove('modal-open') } catch (e) {}
                            const backdrop = document.getElementById(`backdrop-${modalEl.id}`)
                            if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop)
                        }
                    }
                } catch (e) { console.error('modal hide failed', e) }
                try {
                    const idx = props.user_rows.findIndex(r => r.UserID === user.UserID)
                    if (idx !== -1) props.user_rows.splice(idx, 1)
                } catch (e) {}
            } else {
                const msg = (resp && resp.message) ? resp.message : (rawText || `Failed to ban user (status ${res.status})`)
                try { toastError(msg); } catch (e) {}
            }
        } catch (e) {
            console.error('ban fetch failed', e)
            try { toastError('Ban failed: network error') } catch (ee) {}
        }
    } catch (e) {
        console.error('Failed to verify permissions before ban', e)
        try { toastError('Unable to verify permissions; please refresh the page.') } catch (ee) {}
    }
}
</script>
