import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import type { PasswordAnalysis, PasswordStrength } from '@/types/vault.types';

const PIN_HASH_KEY  = 'adeveil_pin_hash';
const PIN_VALUE_KEY = 'adeveil_pin_value'; // Raw PIN stored for biometric-retrieved decryption

// ─── PIN Management ───────────────────────────────────────────────────────────

/**
 * Hashes a PIN for safe storage using SHA-256.
 * The PIN itself is never stored.
 */
async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `adeveil-pin-v1-${pin}`
  );
}

/** Saves the PIN hash to secure storage. */
export async function savePin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  await SecureStore.setItemAsync(PIN_HASH_KEY, hash);
}

/**
 * Saves the raw PIN value so it can be retrieved on biometric unlock.
 * SecureStore encrypts this using the platform keychain/keystore.
 */
export async function savePinValue(pin: string): Promise<void> {
  await SecureStore.setItemAsync(PIN_VALUE_KEY, pin);
}

/** Retrieves the raw PIN value (used after biometric auth succeeds). */
export async function loadPinValue(): Promise<string | null> {
  return SecureStore.getItemAsync(PIN_VALUE_KEY);
}

/** Returns true if a PIN has been set up. */
export async function isPinSet(): Promise<boolean> {
  const hash = await SecureStore.getItemAsync(PIN_HASH_KEY);
  return hash !== null;
}

/** Verifies an entered PIN against the stored hash. */
export async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = await SecureStore.getItemAsync(PIN_HASH_KEY);
  if (!storedHash) return false;
  const hash = await hashPin(pin);
  return hash === storedHash;
}

/** Removes the stored PIN hash AND raw value (reset). */
export async function clearPin(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(PIN_HASH_KEY),
    SecureStore.deleteItemAsync(PIN_VALUE_KEY),
  ]);
}

// ─── Password Strength ───────────────────────────────────────────────────────

/**
 * Analyzes password strength and returns a score + feedback.
 */
export function analyzePassword(password: string): PasswordAnalysis {
  if (!password) {
    return { strength: 'weak', score: 0, feedback: 'Enter a password' };
  }

  let score = 0;
  const checks = {
    length8: password.length >= 8,
    length12: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  if (checks.length8) score++;
  if (checks.length12) score++;
  if (checks.uppercase && checks.lowercase) score++;
  if (checks.digit) score++;
  if (checks.symbol) score++;

  let strength: PasswordStrength;
  let feedback: string;

  if (score <= 1) {
    strength = 'weak';
    feedback = password.length < 8 ? 'Too short — use at least 8 characters' : 'Very easy to guess';
  } else if (score === 2) {
    strength = 'fair';
    feedback = !checks.digit ? 'Add numbers for a stronger password' : 'Add symbols for extra strength';
  } else if (score === 3 || score === 4) {
    strength = 'strong';
    feedback = 'Good password!';
  } else {
    strength = 'very-strong';
    feedback = 'Excellent password!';
  }

  return { strength, score: Math.min(score, 4), feedback };
}

// ─── Password Generator ───────────────────────────────────────────────────────

const CHARSET = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*-_+=?',
};

/**
 * Generates a cryptographically random password.
 */
export function generatePassword(
  length = 16,
  options = { upper: true, digits: true, symbols: true }
): string {
  let charset = CHARSET.lower;
  if (options.upper) charset += CHARSET.upper;
  if (options.digits) charset += CHARSET.digits;
  if (options.symbols) charset += CHARSET.symbols;

  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => charset[b % charset.length])
    .join('');
}
