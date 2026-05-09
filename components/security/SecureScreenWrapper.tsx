import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSecureScreen } from '@/hooks/useSecureScreen';

interface Props {
  children: React.ReactNode;
  showToastOnScreenshot?: (cb: () => void) => void;
}

/**
 * SecureScreenWrapper — wraps screen content to block screenshots/recording.
 * Uses the useSecureScreen hook internally so you don't have to call it.
 */
export function SecureScreenWrapper({ children, showToastOnScreenshot }: Props) {
  useSecureScreen({ showToastOnScreenshot });
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
