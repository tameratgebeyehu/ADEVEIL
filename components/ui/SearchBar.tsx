import React from 'react';
import { View, TextInput, Pressable, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

interface SearchBarProps extends TextInputProps {
  value: string;
  onChangeText: (t: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, onClear, placeholder = 'Search…', ...rest }: SearchBarProps) {
  const { colors } = useThemeContext();
  return (
    <View style={[styles.bar, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
      <Ionicons name="search-outline" size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        style={[styles.input, { color: colors.text }]}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
      />
      {value.length > 0 && (
        <Pressable onPress={() => { onChangeText(''); onClear?.(); }} hitSlop={8}>
          <Ionicons name="close-circle" size={16} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    borderRadius: RADIUS.xl, borderWidth: 1,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  input: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, padding: 0 },
});
