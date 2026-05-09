import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Checks if the device supports biometric authentication.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
}

/**
 * Gets supported biometric types (fingerprint, face, iris).
 */
export async function getBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
  return LocalAuthentication.supportedAuthenticationTypesAsync();
}

/**
 * Prompts the user for biometric authentication.
 * Returns true on success, false on failure or cancellation.
 */
export async function authenticateWithBiometric(
  promptMessage = 'Unlock ADEVeil'
): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: false, // allow device PIN/password as fallback
    });
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Returns a human-friendly label for the best available biometric.
 */
export async function getBiometricLabel(): Promise<string> {
  const types = await getBiometricTypes();
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face Unlock';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Fingerprint';
  }
  return 'Biometric';
}
