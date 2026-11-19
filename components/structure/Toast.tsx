import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';
import { Palette } from '@/styles/tokens';

type ToastProps = {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide?: () => void;
  duration?: number;
};

/** Um tom só por tipo: fundo claro do container e texto/ícone na cor legível sobre ele. */
const TOAST_TONES: Record<
  NonNullable<ToastProps['type']>,
  { bg: keyof Palette; fg: keyof Palette }
> = {
  success: { bg: 'positiveContainer', fg: 'positive' },
  error: { bg: 'negativeContainer', fg: 'negative' },
  info: { bg: 'infoContainer', fg: 'info' },
};

const TOAST_ICONS: Record<NonNullable<ToastProps['type']>, keyof typeof Feather.glyphMap> = {
  success: 'check-circle',
  error: 'alert-circle',
  info: 'info',
};

export function Toast({ visible, message, type = 'success', onHide, duration = 3000 }: ToastProps) {
  const { colors } = useTokens();
  // Valores animados criados uma vez (useState evita ler ref durante o render)
  const [translateY] = useState(() => new Animated.Value(-100));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      translateY.setValue(-100);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: -100,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onHide?.());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, onHide, duration, opacity, translateY]);

  if (!visible) return null;

  const tone = TOAST_TONES[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}>
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[styles.toast, { backgroundColor: colors[tone.bg] }]}>
        <Feather name={TOAST_ICONS[type]} size={20} color={colors[tone.fg]} />
        <AppText variant="body" weight="bold" color={tone.fg} style={styles.message}>
          {message}
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.select({ ios: 60, android: 20 }),
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  message: {
    flex: 1,
  },
});
