/**
 * UI Store - Manages global UI notifications and state
 * Used by utility/helper files that need to access Toast components
 */

let toastErrorFn = null;
let toastSuccessFn = null;

/**
 * Register toast callbacks from Vue components
 * Call this from UserDashboard.vue on mount
 */
export function registerToastFunctions(errorFn, successFn) {
    toastErrorFn = errorFn;
    toastSuccessFn = successFn;
}

/**
 * UI Store object with methods for error/success notifications
 */
export const uiStore = {
    /**
     * Show error toast notification
     * Falls back to console.error if toast not available
     */
    error(message) {
        if (toastErrorFn && typeof toastErrorFn === 'function') {
            toastErrorFn(message);
        } else {
            console.error('[UI Error]:', message);
        }
    },

    /**
     * Show success toast notification
     * Falls back to console.log if toast not available
     */
    success(message) {
        if (toastSuccessFn && typeof toastSuccessFn === 'function') {
            toastSuccessFn(message);
        } else {
            console.log('[UI Success]:', message);
        }
    }
};
