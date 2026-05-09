// Updated validation — supports both standard and self-destruct formats
// Standard (legacy):  ADEV1::<base64_iv>::<base64_ciphertext>
// Standard (new):     ADEV1::<iterations>::<base64_iv>::<base64_ciphertext>
// Self-destruct:      ADEV1SD<seconds>::<base64_iv>::<base64_ciphertext>

export const PROTECTED_TEXT_PREFIX = 'ADEV1::';
export const SELF_DESTRUCT_PREFIX = 'ADEV1SD';

const BASE64_RE = /^[A-Za-z0-9+/]+=*$/;

/**
 * Returns true if text is a valid ADEVeil protected message (any format).
 */
export function validateProtectedText(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  return isStandardFormat(t) || isSelfDestructFormat(t);
}

/** Standard ADEV1:: format — accepts both legacy 2-part and new 3-part with embedded iterations */
export function isStandardFormat(text: string): boolean {
  if (!text.startsWith(PROTECTED_TEXT_PREFIX)) return false;
  const parts = text.slice(PROTECTED_TEXT_PREFIX.length).split('::');

  if (parts.length === 2) {
    // Legacy: iv::ciphertext
    return parts.every(p => p.length > 0 && BASE64_RE.test(p));
  }
  if (parts.length === 3) {
    // New format: iterations::iv::ciphertext
    const iterNum = parseInt(parts[0], 10);
    return !isNaN(iterNum) && iterNum > 0 && BASE64_RE.test(parts[1]) && BASE64_RE.test(parts[2]);
  }
  return false;
}

/** Self-destruct ADEV1SD<n>:: format check */
export function isSelfDestructFormat(text: string): boolean {
  if (!text.startsWith(SELF_DESTRUCT_PREFIX)) return false;
  const afterPrefix = text.slice(SELF_DESTRUCT_PREFIX.length);
  const sepIdx = afterPrefix.indexOf('::');
  if (sepIdx === -1) return false;
  const seconds = parseInt(afterPrefix.slice(0, sepIdx), 10);
  if (isNaN(seconds) || seconds <= 0) return false;
  const rest = afterPrefix.slice(sepIdx + 2).split('::');
  return rest.length === 2 && rest.every(p => p.length > 0 && BASE64_RE.test(p));
}

export interface ParsedProtectedText {
  iv: string;
  ciphertext: string;
  selfDestructSeconds?: number;
}

/**
 * Parses any valid protected text format into components.
 * NOTE: cryptoService decryptWith() handles the new 3-part iteration format directly.
 */
export function parseProtectedText(text: string): ParsedProtectedText | null {
  const t = text.trim();

  if (isStandardFormat(t)) {
    const body = t.slice(PROTECTED_TEXT_PREFIX.length);
    const parts = body.split('::');
    if (parts.length === 2) {
      // Legacy format
      return { iv: parts[0], ciphertext: parts[1] };
    }
    if (parts.length === 3) {
      // New format — iterations embedded, iv is parts[1], ct is parts[2]
      return { iv: parts[1], ciphertext: parts[2] };
    }
  }

  if (isSelfDestructFormat(t)) {
    const afterPrefix = t.slice(SELF_DESTRUCT_PREFIX.length);
    const sepIdx = afterPrefix.indexOf('::');
    const selfDestructSeconds = parseInt(afterPrefix.slice(0, sepIdx), 10);
    const [iv, ciphertext] = afterPrefix.slice(sepIdx + 2).split('::');
    return { iv, ciphertext, selfDestructSeconds };
  }

  return null;
}

/**
 * Builds a self-destruct protected string from components.
 */
export function buildSelfDestructString(iv: string, ciphertext: string, seconds: number): string {
  return `${SELF_DESTRUCT_PREFIX}${seconds}::${iv}::${ciphertext}`;
}
