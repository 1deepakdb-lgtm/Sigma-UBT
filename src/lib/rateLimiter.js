/**
 * In-memory Rate Limiter for Login Brute-Force Protection
 * 
 * Tracks failed login attempts per IP address.
 * After MAX_ATTEMPTS failures within WINDOW_MS, the IP is locked out for LOCKOUT_MS.
 * 
 * NOTE: This is in-process memory — it resets on server restart.
 * For production multi-instance deploys, use Redis instead.
 */

const MAX_ATTEMPTS = 5;          // Max failed attempts before lockout
const WINDOW_MS = 15 * 60 * 1000; // 15-minute rolling window
const LOCKOUT_MS = 15 * 60 * 1000; // 15-minute lockout

/** @type {Map<string, { attempts: number[], lockedUntil: number | null }>} */
const store = new Map();

/**
 * Get a stable key from the request (IP address).
 * Supports common reverse-proxy headers.
 * @param {Request} req
 * @returns {string}
 */
export function getRateLimitKey(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `login:${ip}`;
}

/**
 * Check whether a key is currently rate-limited.
 * @param {string} key
 * @returns {{ limited: boolean, retriesLeft: number, retryAfterMs: number }}
 */
export function checkRateLimit(key) {
  const now = Date.now();
  const record = store.get(key);

  if (!record) return { limited: false, retriesLeft: MAX_ATTEMPTS, retryAfterMs: 0 };

  // Check if lockout is still active
  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      limited: true,
      retriesLeft: 0,
      retryAfterMs: record.lockedUntil - now,
    };
  }

  // Prune attempts outside the rolling window
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
 * Record a failed login attempt for a key.
 * @param {string} key
 */
export function recordFailedAttempt(key) {
  const now = Date.now();
  const record = store.get(key) || { attempts: [], lockedUntil: null };
  record.attempts.push(now);
  // Remove old attempts outside window to keep memory usage bounded
  record.attempts = record.attempts.filter((t) => now - t < WINDOW_MS);
  if (record.attempts.length >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
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
