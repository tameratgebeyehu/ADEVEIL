import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { copyToClipboard } from '@/services/clipboardService';
import { shareText } from '@/services/shareService';
import { haptics } from '@/services/hapticService';
import { useState, useRef } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

interface QRDisplayProps {
  value: string;
  size?: number;
}

export function QRDisplay({ value, size = 220 }: QRDisplayProps) {
  const { colors } = useThemeContext();
  const [copied, setCopied] = useState(false);
  const [sharingImg, setSharingImg] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  const handleCopy = async () => {
    await copyToClipboard(value);
    haptics.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    haptics.light();
    await shareText(value);
  };

  const handleShareImage = async () => {
    if (!viewShotRef.current?.capture) return;
    setSharingImg(true);
    haptics.light();
    try {
      const uri = await viewShotRef.current.capture();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share ADEVeil QR Code' });
      }
    } catch (err) {
      console.warn('Failed to share image', err);
    } finally {
      setSharingImg(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* QR Code — always on white background for scannability, or fallback if too large */}
      {value.length > 1200 ? (
        <View style={[styles.qrWrapper, styles.tooLarge, { backgroundColor: colors.surface2 }]}>
          <Ionicons name="qr-code-outline" size={48} color={colors.textDim} />
          <Text style={[styles.tooLargeText, { color: colors.text }]}>
            Message is too large for a QR Code.
          </Text>
          <Text style={[styles.tooLargeSub, { color: colors.textMuted }]}>
            Please use the Copy or Share buttons below to send the encrypted text directly.
          </Text>
        </View>
      ) : (
        <View style={{ overflow: 'hidden', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: colors.border }}>
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
            <View style={styles.exportCard}>
              <View style={styles.exportHeader}>
                <Ionicons name="lock-closed" size={24} color="#6B5CE7" />
                <Text style={styles.exportTitle}>ADEVeil Protected Message</Text>
              </View>
              
              <View style={styles.qrInnerWrapper}>
                <QRCode
                  value={value}
                  size={size}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                  ecl="M"
                />
              </View>
              
              <View style={styles.exportFooter}>
                <Text style={styles.exportHint}>Scan with ADEVeil to decrypt</Text>
                <Text style={styles.exportSubhint}>App required to read</Text>
              </View>
            </View>
          </ViewShot>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={handleCopy}
          style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.surface2 }]}
        >
          <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={copied ? colors.success : colors.text} />
          <Text style={[styles.btnText, { color: copied ? colors.success : colors.text }]}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleShare}
          style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.surface2 }]}
        >
          <Ionicons name="text-outline" size={18} color={colors.text} />
          <Text style={[styles.btnText, { color: colors.text }]}>Text</Text>
        </Pressable>

        {value.length <= 1200 && (
          <Pressable
            onPress={handleShareImage}
            disabled={sharingImg}
            style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.surface2, opacity: sharingImg ? 0.5 : 1 }]}
          >
            <Ionicons name="qr-code-outline" size={18} color={colors.text} />
            <Text style={[styles.btnText, { color: colors.text }]}>QR Image</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.lg,
  },
  qrWrapper: {
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
  },
  exportCard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    width: 320,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  exportTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: '#1F2937',
    letterSpacing: -0.3,
  },
  qrInnerWrapper: {
    padding: SPACING.sm,
    backgroundColor: '#FFFFFF',
  },
  exportFooter: {
    marginTop: SPACING.xl,
    alignItems: 'center',
    gap: 4,
  },
  exportHint: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
    color: '#4B5563',
  },
  exportSubhint: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    color: '#9CA3AF',
  },
  tooLarge: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    width: 240,
    height: 240,
  },
  tooLargeText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  tooLargeSub: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  hint: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
  actions: { flexDirection: 'row', gap: SPACING.md, width: '100%' },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
  },
  btnText: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },
});
