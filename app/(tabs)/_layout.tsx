import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { useThemeContext } from '@/theme/ThemeContext';

export default function TabsLayout() {
  const { colors } = useThemeContext();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: 10,
          marginTop: 1,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size - 2} color={color} /> }} />
      <Tabs.Screen name="dashboard" options={{ title: 'Security', tabBarIcon: ({ color, size }) => <Ionicons name="shield-outline" size={size - 2} color={color} /> }} />
      <Tabs.Screen name="vault" options={{ title: 'Vault', tabBarIcon: ({ color, size }) => <Ionicons name="lock-closed-outline" size={size - 2} color={color} /> }} />
      <Tabs.Screen name="workspace" options={{ title: 'Write', tabBarIcon: ({ color, size }) => <Ionicons name="create-outline" size={size - 2} color={color} /> }} />
      <Tabs.Screen name="notes" options={{ title: 'Notes', tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size - 2} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size - 2} color={color} /> }} />
      {/* Hide About from tab bar — accessible via Settings */}
      <Tabs.Screen name="about" options={{ href: null }} />
    </Tabs>
  );
}
