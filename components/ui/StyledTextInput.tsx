import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { useThemeContext } from '@/theme/ThemeContext';

interface StyledTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  rightElement?: React.ReactNode;
  rightAction?: { icon: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void };
}

export function StyledTextInput({
  label,
  error,
  isPassword = false,
  containerStyle,
  rightElement,
  rightAction,
  style,
  ...props
}: StyledTextInputProps) {
  const { isDark } = useThemeContext();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const bg = isDark ? COLORS.surface2 : COLORS.light.surface2;
  const borderColor = error
    ? COLORS.error
    : focused
    ? COLORS.accent
    : isDark
    ? COLORS.border
    : COLORS.light.border;
  const textColor = isDark ? COLORS.text : COLORS.light.text;
  const placeholderColor = isDark ? COLORS.textDim : '#AAAACC';

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: isDark ? COLORS.textMuted : COLORS.light.textMuted }]}>
          {label}
        </Text>
      ) : null}

      <View style={[styles.inputContainer, { backgroundColor: bg, borderColor }]}>
        <TextInput
          autoCapitalize={isPassword ? 'none' : props.autoCapitalize}
          autoCorrect={isPassword ? false : props.autoCorrect}
          textContentType={isPassword ? 'password' : props.textContentType}
          importantForAutofill={isPassword ? 'noExcludeDescendants' : props.importantForAutofill}
          {...props}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={placeholderColor}
          style={[styles.input, { color: textColor }, style]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(v => !v)}
            style={styles.eyeBtn}
            hitSlop={8}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textMuted}
            />
          </Pressable>
        )}

        {rightAction && !isPassword && (
          <Pressable onPress={rightAction.onPress} style={styles.eyeBtn} hitSlop={8}>
            <Ionicons name={rightAction.icon} size={20} color={COLORS.textMuted} />
          </Pressable>
        )}

        {rightElement && !isPassword && !rightAction && (
          <View style={styles.rightElement}>{rightElement}</View>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
    marginLeft: 2,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.lg,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.md,
    paddingVertical: SPACING.lg,
    lineHeight: 22,
  },
  eyeBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  rightElement: {
    marginLeft: SPACING.sm,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: 4,
  },
});
