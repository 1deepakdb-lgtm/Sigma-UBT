/**
 * Input Sanitization & Security Utilities
 * Centralizes all user-input cleaning and validation to prevent:
 *   - XSS (Cross-Site Scripting)
 *   - SQL/NoSQL Injection
 *   - Path Traversal attacks
 *   - Oversized payload attacks
 *   - Command injection
 */

// ─── Dangerous Pattern Blocklists ────────────────────────────────────────────

/** SQL injection patterns */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|TRUNCATE|REPLACE|MERGE)\b)/i,
  /(--|;|\/\*|\*\/|xp_|INFORMATION_SCHEMA)/i,
  /(\bOR\b\s+\d+\s*=\s*\d+|\bAND\b\s+\d+\s*=\s*\d+)/i,
  /('|('')|;--)/,
];

/** XSS patterns */
const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=\s*["']?[^"'>]*/gi,
  /<iframe[\s\S]*?>/gi,
  /<object[\s\S]*?>/gi,
  /<embed[\s\S]*?>/gi,
  /data:\s*text\/html/gi,
  /vbscript\s*:/gi,
];

/** Path traversal patterns */
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//,
  /\.\.\\/,
  /%2e%2e%2f/i,
  /%252e%252e%252f/i,
  /\.\.%2f/i,
  /\.\.%5c/i,
];

/** Command injection patterns */
const CMD_INJECTION_PATTERNS = [
  /[;&|`$(){}[\]\\]/,
  /\$\(/,
  /`[^`]*`/,
  /\|\|/,
  /&&/,
];

// ─── Core Sanitization Functions ─────────────────────────────────────────────

/**
 * Strip HTML tags to prevent XSS in stored text.
 * @param {string} input
 * @returns {string}
 */
export function stripHtml(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .trim();
}

/**
 * Escape HTML entities to safely render user content in HTML.
 * @param {string} input
 * @returns {string}
 */
export function escapeHtml(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize a username/identifier: trim, lowercase-optional, alphanumeric + safe chars only.
 * @param {string} input
 * @param {object} opts
 * @returns {string}
 */
export function sanitizeUsername(input, opts = {}) {
  if (typeof input !== 'string') return '';
  let clean = input.trim();
  if (opts.lowercase) clean = clean.toLowerCase();
  // Allow: letters, digits, @, ., _, -, +
  clean = clean.replace(/[^a-zA-Z0-9@._+\-]/g, '');
  return clean.slice(0, 100);
}

/**
 * Sanitize a phone number: only digits, +, -, spaces.
 * @param {string} input
 * @returns {string}
 */
export function sanitizePhone(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[^0-9+\- ]/g, '').trim().slice(0, 20);
}

/**
 * Sanitize a general text field: strip HTML, truncate.
 * @param {string} input
 * @param {number} maxLen
 * @returns {string}
 */
export function sanitizeText(input, maxLen = 500) {
  if (typeof input !== 'string') return '';
  return stripHtml(input).slice(0, maxLen);
}

/**
 * Sanitize a filename to prevent path traversal and injection.
 * @param {string} filename
 * @returns {string}
 */
export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') return 'file';
  const base = filename.replace(/[^a-zA-Z0-9._\-]/g, '_').slice(0, 100);
  // Strip leading dots (hidden files)
  return base.replace(/^\.+/, '_');
}

// ─── Detection / Validation Functions ────────────────────────────────────────

/**
 * Returns true if input contains suspicious SQL injection patterns.
 * @param {string} input
 * @returns {boolean}
 */
export function hasSQLInjection(input) {
  if (typeof input !== 'string') return false;
  return SQL_INJECTION_PATTERNS.some((p) => p.test(input));
}

/**
 * Returns true if input contains XSS payload patterns.
 * @param {string} input
 * @returns {boolean}
 */
export function hasXSS(input) {
  if (typeof input !== 'string') return false;
  return XSS_PATTERNS.some((p) => p.test(input));
}

/**
 * Returns true if input contains path traversal sequences.
 * @param {string} input
 * @returns {boolean}
 */
export function hasPathTraversal(input) {
  if (typeof input !== 'string') return false;
  return PATH_TRAVERSAL_PATTERNS.some((p) => p.test(input));
}

/**
 * Returns true if input contains shell command injection patterns.
 * Only use this check on fields that are passed to shell commands.
 * @param {string} input
 * @returns {boolean}
 */
export function hasCmdInjection(input) {
  if (typeof input !== 'string') return false;
  return CMD_INJECTION_PATTERNS.some((p) => p.test(input));
}

/**
 * Full scan: check if an input is malicious on any vector.
 * @param {string} input
 * @returns {{ safe: boolean, reason: string | null }}
 */
export function isMalicious(input) {
  if (typeof input !== 'string') return { safe: true, reason: null };
  if (hasXSS(input))          return { safe: false, reason: 'XSS attempt detected' };
  if (hasSQLInjection(input)) return { safe: false, reason: 'SQL injection pattern detected' };
  if (hasPathTraversal(input)) return { safe: false, reason: 'Path traversal attempt detected' };
  return { safe: true, reason: null };
}

/**
 * Validate a password strength:
 * - Min 8 characters
 * - At least 1 letter and 1 digit (for admin/institute)
 * @param {string} password
 * @param {boolean} strict - if true, enforce alphanumeric complexity
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePasswordStrength(password, strict = false) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  const trimmed = password.trim();
  if (trimmed.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (strict) {
    if (!/[a-zA-Z]/.test(trimmed)) {
      return { valid: false, message: 'Password must contain at least one letter.' };
    }
    if (!/[0-9]/.test(trimmed)) {
      return { valid: false, message: 'Password must contain at least one number.' };
    }
  }
  return { valid: true, message: 'Password is strong.' };
}

/**
 * Validate that a value is a safe integer ID (prevent IDOR tampering).
 * @param {*} id
 * @returns {boolean}
 */
export function isSafeId(id) {
  if (id === null || id === undefined) return false;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 && n < 2147483647;
}

/**
 * Sanitize and validate a request body object by scanning all string fields.
 * Returns { safe: boolean, reason: string | null }
 */
export function scanRequestBody(body) {
  if (!body || typeof body !== 'object') return { safe: true, reason: null };
  for (const [key, val] of Object.entries(body)) {
    if (typeof val === 'string') {
      // Skip password fields from injection scanning
      if (['password', 'currentPassword', 'newPassword', 'confirmNewPassword'].includes(key)) continue;
      const check = isMalicious(val);
      if (!check.safe) {
        return { safe: false, reason: `Field '${key}': ${check.reason}` };
      }
    }
  }
  return { safe: true, reason: null };
}
