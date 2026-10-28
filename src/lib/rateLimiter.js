/**
 * In-memory Rate Limiter for Login Brute-Force Protection
 * 
 * Tracks failed login attempts per IP address & user identifier.
 * Includes hardened protection for Super Admin accounts (3 attempts / 30-min lockout).
 */

const MAX_ATTEMPTS = 5;          // Max failed attempts for general users
const WINDOW_MS = 15 * 60 * 1000; // 15-minute rolling window
const LOCKOUT_MS = 15 * 60 * 1000; // 15-minute lockout

// Super Admin Hardened Security
const ADMIN_MAX_ATTEMPTS = 3;     // Max 3 attempts for Admin before strict lock
const ADMIN_WINDOW_MS = 30 * 60 * 1000; // 30-minute rolling window
const ADMIN_LOCKOUT_MS = 30 * 60 * 1000; // 30-minute lockout

/** @type {Map<string, { attempts: number[], lockedUntil: number | null }>} */
const store = new Map();

/**
 * Get a stable key from the request (IP address).
 * @param {Request} req
 * @returns {string}
 */
export function getRateLimitKey(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `login:${ip}`;
}

/**
 * Check whether a standard key is currently rate-limited.
 * @param {string} key
 * @returns {{ limited: boolean, retriesLeft: number, retryAfterMs: number }}
 */
export function checkRateLimit(key) {
  const now = Date.now();
  const record = store.get(key);

  if (!record) return { limited: false, retriesLeft: MAX_ATTEMPTS, retryAfterMs: 0 };

  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      limited: true,
      retriesLeft: 0,
      retryAfterMs: record.lockedUntil - now,
    };
  }

  const recentAttempts = record.attempts.filter((t) => now - t < WINDOW_MS);
  record.attempts = recentAttempts;

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    store.set(key, record);
    return {
      limited: true,
      retriesLeft: 0,
      retryAfterMs: LOCKOUT_MS,
    };
  }

  return {
    limited: false,
    retriesLeft: MAX_ATTEMPTS - recentAttempts.length,
    retryAfterMs: 0,
  };
}

/**
 * Strict Rate Limiter for Super Admin attempts.
 * @param {string} key
 * @returns {{ limited: boolean, retriesLeft: number, retryAfterMs: number }}
 */
export function checkAdminRateLimit(key) {
  const now = Date.now();
  const record = store.get(key);

  if (!record) return { limited: false, retriesLeft: ADMIN_MAX_ATTEMPTS, retryAfterMs: 0 };

  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      limited: true,
      retriesLeft: 0,
      retryAfterMs: record.lockedUntil - now,
    };
  }

  const recentAttempts = record.attempts.filter((t) => now - t < ADMIN_WINDOW_MS);
  record.attempts = recentAttempts;

  if (recentAttempts.length >= ADMIN_MAX_ATTEMPTS) {
    record.lockedUntil = now + ADMIN_LOCKOUT_MS;
    store.set(key, record);
    return {
      limited: true,
      retriesLeft: 0,
      retryAfterMs: ADMIN_LOCKOUT_MS,
    };
  }

  return {
    limited: false,
    retriesLeft: ADMIN_MAX_ATTEMPTS - recentAttempts.length,
    retryAfterMs: 0,
  };
}

/**
 * Record a failed login attempt for a key.
 * @param {string} key
 */
export function recordFailedAttempt(key) {
  const now = Date.now();
  const record = store.get(key) || { attempts: [], lockedUntil: null };
  record.attempts.push(now);
  record.attempts = record.attempts.filter((t) => now - t < WINDOW_MS);
  if (record.attempts.length >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }
  store.set(key, record);
}

/**
 * Record a failed login attempt specifically on Super Admin.
 * @param {string} key
 */
export function recordAdminFailedAttempt(key) {
  const now = Date.now();
  const record = store.get(key) || { attempts: [], lockedUntil: null };
  record.attempts.push(now);
  record.attempts = record.attempts.filter((t) => now - t < ADMIN_WINDOW_MS);
  if (record.attempts.length >= ADMIN_MAX_ATTEMPTS) {
    record.lockedUntil = now + ADMIN_LOCKOUT_MS;
  }
  store.set(key, record);
}

/**
 * Clear the rate limit record for a key (call on successful login).
 * @param {string} key
 */
export function clearRateLimit(key) {
  store.delete(key);
}
