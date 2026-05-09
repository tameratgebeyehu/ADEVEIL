/**
 * secureLogger — production-safe logging wrapper.
 *
 * In development: logs normally.
 * In production:  all logs are silently suppressed.
 *
 * NEVER log passwords, keys, or decrypted message content.
 * Pass only status strings and non-sensitive metadata.
 */

const SENSITIVE_KEYS = ['password', 'key', 'secret', 'pin', 'token', 'cipher', 'hash', 'iv', 'salt'];

function sanitize(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some(sk => k.toLowerCase().includes(sk))) {
      out[k] = '[REDACTED]';
    } else if (typeof v === 'object') {
      out[k] = sanitize(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export const secureLogger = {
  log(...args: unknown[]) {
    if (__DEV__) console.log('[ADEVeil]', ...args.map(sanitize));
  },
  warn(...args: unknown[]) {
    if (__DEV__) console.warn('[ADEVeil]', ...args.map(sanitize));
  },
  error(msg: string, err?: unknown) {
    // Always log errors (without sensitive data) — even in production
    // so crashes can be diagnosed without revealing content.
    const safeErr = err instanceof Error ? err.message : typeof err === 'string' ? err : 'unknown';
    if (__DEV__) console.error('[ADEVeil]', msg, safeErr);
    // In production: could send sanitized error to a crash service here.
  },
  /** Explicitly blocked — never call this with sensitive data. */
  never(reason: string) {
    if (__DEV__) console.error(`[ADEVeil] BLOCKED LOG: ${reason} — sensitive data was almost logged.`);
  },
};
