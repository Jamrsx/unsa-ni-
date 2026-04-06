/**
 * Security Module
 * Handles code safety checks and blacklist validation
 */

/**
 * Language-specific blacklists.
 * Each list only blocks patterns that are dangerous FOR THAT LANGUAGE,
 * so a PHP tag doesn't incorrectly block a Python submission, etc.
 */
const BLACKLIST_COMMON = [
    // Path traversal
    '..',
    // SQL injection (shouldn't appear in algo solutions)
    'drop table',
    'delete from',
    'insert into',
    'alter table',
    'create table',
];

const BLACKLIST_PYTHON = [
    'import os',
    'import sys',
    'import subprocess',
    '__import__(',
    'exec(',
    'open(',
    'file(',
    'compile(',
    '__builtins__',
    'globals(',
    'locals(',
    'vars(',
    'dir(',
    'execfile(',
    'reload(',
    'system(',
    'popen(',
];

const BLACKLIST_PHP = [
    'system(',
    'shell_exec',
    'passthru',
    'proc_open',
    'popen(',
    'exec(',
    'preg_replace',       // /e modifier RCE
    'create_function',
    'call_user_func',
    'file_get_contents',
    'file_put_contents',
    'include(',
    'include_once(',
    'require_once(',
    // NOTE: '<?php' and '?>' are NOT blocked — server wraps/strips them safely
];

const BLACKLIST_JAVA = [
    'java.lang.runtime',
    'runtime.getruntime',
    'processbuilder',
    'java.io.file',
    'java.nio',
    'system.exit',
    'thread.sleep',       // prevent timeout abuse
];

const BLACKLIST_JS = [
    'child_process',
    'fs.readfile',
    'fs.writefile',
    'require("fs")',
    "require('fs')",
    'require("child_process")',
    "require('child_process')",
    'process.exit',
    'process.kill',
    'process.env',
];

/**
 * Check if code contains dangerous patterns
 * @param {string} code - The code to check
 * @param {string} language - Programming language (python, php, javascript, java)
 * @returns {boolean} True if code is safe, false if dangerous
 */
function isCodeSafe(code, language) {
    if (!code) return true;

    const lowerCode = code.toLowerCase();
    const lang = (language || '').toLowerCase();

    // --- eval check: block raw eval() but allow ast.literal_eval() ---
    if (lang === 'python') {
        const hasEval = lowerCode.includes('eval(');
        const hasAstEval = lowerCode.includes('ast.literal_eval(');
        if (hasEval && !hasAstEval) {
            console.log('[SECURITY] Blocked Python code containing dangerous eval()');
            return false;
        }
    }

    // --- common checks (apply to all languages) ---
    for (const forbidden of BLACKLIST_COMMON) {
        if (lowerCode.includes(forbidden.toLowerCase())) {
            console.log(`[SECURITY] Blocked code (common) containing: "${forbidden}"`);
            return false;
        }
    }

    // --- language-specific checks ---
    let langList = [];
    if (lang === 'python')     langList = BLACKLIST_PYTHON;
    else if (lang === 'php')   langList = BLACKLIST_PHP;
    else if (lang === 'java')  langList = BLACKLIST_JAVA;
    else if (lang === 'javascript') langList = BLACKLIST_JS;

    for (const forbidden of langList) {
        if (lowerCode.includes(forbidden.toLowerCase())) {
            console.log(`[SECURITY] Blocked ${lang} code containing: "${forbidden}"`);
            return false;
        }
    }

    // --- PHP superglobals ---
    if (lang === 'php') {
        if (lowerCode.includes('$_get') || lowerCode.includes('$_post') ||
            lowerCode.includes('$_server') || lowerCode.includes('$_cookie')) {
            console.log('[SECURITY] Blocked PHP superglobals');
            return false;
        }
    }

    return true;
}

/**
 * Sanitize user input to prevent injection attacks
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    let sanitized = input.replace(/\0/g, '');
    sanitized = sanitized.substring(0, 10000);
    return sanitized;
}

/**
 * Validate match ID format
 */
function isValidMatchId(matchId) {
    return Number.isInteger(matchId) && matchId > 0;
}

/**
 * Validate user ID format
 */
function isValidUserId(userId) {
    return Number.isInteger(userId) && userId > 0;
}

module.exports = {
    isCodeSafe,
    sanitizeInput,
    isValidMatchId,
    isValidUserId,
    BLACKLIST_COMMON,
    BLACKLIST_PYTHON,
    BLACKLIST_PHP,
    BLACKLIST_JAVA,
    BLACKLIST_JS,
};