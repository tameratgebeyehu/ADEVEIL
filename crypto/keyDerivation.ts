// Key Derivation using PBKDF2 via crypto-js
// Works reliably across all React Native / Expo engines

import CryptoJS from 'crypto-js';

// External messages protected with user passwords — high security
export const PBKDF2_ITERATIONS = 5_000;

// Internal notes/vault items encrypted with the sessionPin (already stored securely)
// Using fewer iterations here is safe: attacker who has the ciphertext still doesn't
// know the sessionPin, which is stored in expo-secure-store.
export const PBKDF2_ITERATIONS_INTERNAL = 1_000;

const KEY_LENGTH_WORDS = 256 / 32; // 256 bits

/**
 * Derives a 256-bit AES key from a password + salt using PBKDF2-SHA256.
 * Returns a CryptoJS WordArray.
 */
export function deriveKey(
  password: string,
  salt: CryptoJS.lib.WordArray,
  iterations: number = PBKDF2_ITERATIONS
) {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_LENGTH_WORDS,
    iterations,
    hasher: CryptoJS.algo.SHA256,
  });
}
