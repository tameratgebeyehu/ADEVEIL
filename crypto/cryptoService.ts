// ADEVeil Crypto Service — AES-256 via crypto-js
// Two-tier encryption:
//   protectMessage / openMessage  — for user-shared content (high iterations, user passwords)
//   protectInternal / openInternal — for notes/vault items (fast, sessionPin)

import CryptoJS from 'crypto-js';
import { deriveKey, PBKDF2_ITERATIONS, PBKDF2_ITERATIONS_INTERNAL } from './keyDerivation';
import { validateProtectedText, parseProtectedText, PROTECTED_TEXT_PREFIX } from './validation';
import type { CryptoResult } from '@/types/crypto.types';

const IV_BYTE_LENGTH = 16; // 128-bit IV

// ─── Shared internal helper ───────────────────────────────────────────────────

async function encryptWith(
  plaintext: string,
  password: string,
  iterations: number
): Promise<CryptoResult> {
  try {
    const iv = CryptoJS.lib.WordArray.random(IV_BYTE_LENGTH);

    // Yield so any loading indicator renders before the sync block
    await new Promise(resolve => setTimeout(resolve, 0));

    const key = deriveKey(password, iv, iterations);
    const encrypted = CryptoJS.AES.encrypt(plaintext, key, { iv });
    const ivB64  = CryptoJS.enc.Base64.stringify(iv);
    const ctB64  = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    // Embed iteration count so decryption is always backward-compatible
    const result = `${PROTECTED_TEXT_PREFIX}${iterations}::${ivB64}::${ctB64}`;
    return { success: true, data: result };
  } catch (err: any) {
    console.error('encryptWith error:', err);
    return { success: false, error: 'UNKNOWN_ERROR' };
  }
}

async function decryptWith(
  protectedText: string,
  password: string
): Promise<CryptoResult> {
  try {
    if (!validateProtectedText(protectedText)) {
      return { success: false, error: 'INVALID_FORMAT' };
    }

    // Strip prefix then split: might be old 2-part (no iter) or new 3-part format
    const body = protectedText.slice(PROTECTED_TEXT_PREFIX.length);
    const parts = body.split('::');

    let iterations: number;
    let ivB64: string;
    let ctB64: string;

    if (parts.length === 3) {
      // New format: iterations::iv::ciphertext
      iterations = parseInt(parts[0], 10) || PBKDF2_ITERATIONS;
      ivB64 = parts[1];
      ctB64 = parts[2];
    } else if (parts.length === 2) {
      // Legacy format: iv::ciphertext (always used 10 000 iterations)
      iterations = 10_000;
      ivB64 = parts[0];
      ctB64 = parts[1];
    } else {
      return { success: false, error: 'INVALID_FORMAT' };
    }

    const iv = CryptoJS.enc.Base64.parse(ivB64);
    const ciphertextParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(ctB64),
    });

    // Yield before heavy sync block
    await new Promise(resolve => setTimeout(resolve, 0));

    const key = deriveKey(password, iv, iterations);
    const decrypted = CryptoJS.AES.decrypt(ciphertextParams, key, { iv });
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) return { success: false, error: 'WRONG_PASSWORD' };
    return { success: true, data: decryptedText };
  } catch {
    return { success: false, error: 'WRONG_PASSWORD' };
  }
}

// ─── Public API — shared messages (user passwords) ────────────────────────────

/** Protects a plain-text message with a user password using AES-256 + PBKDF2. */
export async function protectMessage(
  plaintext: string,
  password: string
): Promise<CryptoResult> {
  return encryptWith(plaintext, password, PBKDF2_ITERATIONS);
}

/** Decrypts an ADEV1:: protected string with the given user password. */
export async function openMessage(
  protectedText: string,
  password: string
): Promise<CryptoResult> {
  return decryptWith(protectedText, password);
}

// ─── Public API — internal notes/vault items (session key) ───────────────────

/**
 * Fast encrypt for notes/vault items encrypted with the session PIN.
 * Uses fewer PBKDF2 iterations since the key is already securely stored.
 */
export async function protectInternal(
  plaintext: string,
  sessionKey: string
): Promise<CryptoResult> {
  return encryptWith(plaintext, sessionKey, PBKDF2_ITERATIONS_INTERNAL);
}

/**
 * Fast decrypt for notes/vault items. Automatically reads the iteration
 * count embedded in the ciphertext, so legacy items still work.
 */
export async function openInternal(
  protectedText: string,
  sessionKey: string
): Promise<CryptoResult> {
  return decryptWith(protectedText, sessionKey);
}
