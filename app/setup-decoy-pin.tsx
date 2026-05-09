import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { useSettingsStore } from '@/store/settingsStore';
import { saveDecoyPin, isDecoyPinSet, clearDecoyPin } from '@/services/exportService';
import { PinPad } from '@/components/PinPad';
import { haptics } from '@/services/hapticService';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

type Step = 'info' | 'enter' | 'confirm' | 'done';

export default function SetupDecoyPinScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { setDecoyPinEnabled } = useSettingsStore();
  const [step, setStep] = useState<Step>('info');
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleFirstComplete = (entered: string) => {
    setFirstPin(entered);
    setPin('');
    setError('');
    setStep('confirm');
  };

  const handleConfirmComplete = async (entered: string) => {
    if (entered !== firstPin) {
      haptics.error();
      setError('PINs do not match — try again');
      setPin('');
      setFirstPin('');
      setStep('enter');
      return;
    }
    await saveDecoyPin(entered);
    setDecoyPinEnabled(true);
    haptics.success();
    setStep('done');
  };

  const handleDisable = () => {
    Alert.alert('Disable Decoy PIN', 'Remove the decoy PIN protection?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disable', style: 'destructive',
        onPress: async () => {
          await clearDecoyPin();
          setDecoyPinEnabled(false);
          haptics.medium();
          router.back();
        },
      },
    ]);
  };

  const onComplete = step === 'enter' ? handleFirstComplete : handleConfirmComplete;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Decoy PIN</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {step === 'info' && (
            <View style={styles.center}>
              <View style={[styles.iconWrap, { backgroundColor: colors.surface2 }]}>
                <Ionicons name="eye-off-outline" size={42} color={colors.accent} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Decoy PIN</Text>
              <Text style={[styles.desc, { color: colors.textMuted }]}>
                Set a second PIN that opens a completely empty, fake vault.
                {'\n\n'}
                If someone forces you to unlock the app, enter the Decoy PIN instead of your real PIN. They will see an empty vault.
                {'\n\n'}
                Your real vault remains hidden.
              </Text>
              <View style={[styles.warningCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="warning-outline" size={18} color={colors.warning} />
                <Text style={[styles.warningText, { color: colors.textMuted }]}>
                  Your Decoy PIN must be different from your real PIN.
                </Text>
              </View>
              <Pressable onPress={() => setStep('enter')} style={[styles.btn, { backgroundColor: colors.accent }]}>
                <Text style={styles.btnText}>Set Up Decoy PIN</Text>
              </Pressable>
              <Pressable onPress={handleDisable} style={{ marginTop: SPACING.md }}>
                <Text style={[styles.disableText, { color: colors.error }]}>Disable Decoy PIN</Text>
              </Pressable>
            </View>
          )}

          {(step === 'enter' || step === 'confirm') && (
            <View style={styles.center}>
              <Text style={[styles.stepLabel, { color: colors.textMuted }]}>
                {step === 'enter' ? 'Step 1 of 2' : 'Step 2 of 2'}
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>
                {step === 'enter' ? 'Choose Decoy PIN' : 'Confirm Decoy PIN'}
              </Text>

              {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
              
              <View style={{ marginBottom: SPACING.xl }} />
              <PinPad pin={pin} onChange={setPin} maxLength={4} error={!!error} />

              <Pressable 
                onPress={() => onComplete(pin)} 
                disabled={pin.length < 4}
                style={[
                  styles.btn, 
                  { 
                    backgroundColor: pin.length === 4 ? colors.accent : colors.surface3,
                    marginTop: SPACING.xl,
                    width: '80%',
                    alignItems: 'center'
                  }
                ]}
              >
                <Text style={[styles.btnText, { color: pin.length === 4 ? '#fff' : colors.textMuted }]}>
                  {step === 'enter' ? 'Next' : 'Confirm Decoy PIN'}
                </Text>
              </Pressable>
            </View>
          )}

          {step === 'done' && (
            <View style={styles.center}>
              <View style={[styles.iconWrap, { backgroundColor: '#34D39920' }]}>
                <Ionicons name="checkmark-circle" size={56} color="#34D399" />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Decoy PIN Active</Text>
              <Text style={[styles.desc, { color: colors.textMuted }]}>
                Your decoy protection is now active. Entering your Decoy PIN will open an empty vault.
              </Text>
              <Pressable onPress={() => router.back()} style={[styles.btn, { backgroundColor: colors.accent }]}>
                <Text style={styles.btnText}>Done</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.lg },
  scroll: { flexGrow: 1, padding: SPACING.xl },
  center: { flex: 1, alignItems: 'center', gap: SPACING.lg, paddingTop: SPACING.xl },
  iconWrap: { width: 88, height: 88, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },
  title: { fontFamily: FONTS.bold, fontSize: FONT_SIZE.xxl, textAlign: 'center' },
  desc: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, lineHeight: 24, textAlign: 'center' },
  warningCard: { flexDirection: 'row', gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg, alignItems: 'flex-start', width: '100%' },
  warningText: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
  dots: { flexDirection: 'row', gap: SPACING.lg },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5 },
  error: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },
  btn: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxxl, borderRadius: RADIUS.full },
  btnText: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md, color: '#fff' },
  disableText: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },
});
