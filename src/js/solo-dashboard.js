import { can, getPermissions, ensureCan } from './permissions.js'

export function normalizeTopic(t) {
    if (!t) return ''
    const s = (t.TopicName || t || '').toString().trim().toLowerCase()
    return s.replace(/[^a-z0-9]+/g, '_')
}

export function topicPermissionAllowed(topics, permBase) {
    try {
        if (can(permBase)) return true
        const perms = getPermissions()
        if (perms.includes(`${permBase}.any`)) return true
        if (perms.some(p => p.startsWith(`${permBase}.`) && !p.endsWith('.own') && p !== `${permBase}.any`)) return true
        const names = (topics || []).map(t => normalizeTopic(t)).filter(Boolean)
        if (!names.length) return false
        return names.some(n => can(`${permBase}.${n}`))
    } catch (e) {
        return false
    }
}

export async function ensureProblemCreateAllowed() {
    try {
        // Prefer fresh server-backed checks to respect explicit user denies
        const [createAllowed, approvalsAllowed] = await Promise.all([
            ensureCan('problem.create'),
            ensureCan('problem.approvals.manage')
        ])
        if (createAllowed || approvalsAllowed) return true

        // Fallback to permission list checks for namespaced create permissions
        const perms = getPermissions()
        if (perms.includes('problem.create.any')) return true
        if (perms.some(p => p.startsWith('problem.create.') && p !== 'problem.create.any' && !p.endsWith('.own'))) return true
        return false
    } catch (e) {
        return false
    }
}
