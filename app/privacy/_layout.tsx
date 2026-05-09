import { Stack } from 'expo-router';
import { useThemeContext } from '@/theme/ThemeContext';

export default function PrivacyLayout() {
  const { colors } = useThemeContext();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    />
  );
}
