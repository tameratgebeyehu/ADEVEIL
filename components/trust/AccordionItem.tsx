import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionItemProps {
  question: string;
  answer: string;
  searchQuery?: string;
}

export function AccordionItem({ question, answer, searchQuery = '' }: AccordionItemProps) {
  const { colors } = useThemeContext();
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(v => !v);
  };

  // Highlight matching text
  const highlight = (text: string, query: string) => {
    if (!query.trim()) return <Text style={{ color: colors.text, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 }}>{text}</Text>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <Text style={{ color: colors.text, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 }}>
        {parts.map((p, i) =>
          p.toLowerCase() === query.toLowerCase()
            ? <Text key={i} style={{ backgroundColor: colors.accent + '40', color: colors.accent }}>{p}</Text>
            : p
        )}
      </Text>
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: open ? colors.accent + '60' : colors.border }]}>
      <Pressable
        onPress={handleToggle}
        style={styles.header}
        android_ripple={{ color: colors.surface2 }}
      >
        <Text style={[styles.question, { color: colors.text }]} numberOfLines={open ? undefined : 2}>
          {question}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={open ? colors.accent : colors.textDim}
        />
      </Pressable>
      {open && (
        <View style={[styles.body, { borderTopColor: colors.border }]}>
          {highlight(answer, searchQuery)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  question: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
    lineHeight: 22,
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
});
