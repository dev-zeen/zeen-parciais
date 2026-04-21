import { Feather } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';

type ToastProps = {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide?: () => void;
  duration?: number;
};

const TOAST_COLORS: Record<NonNullable<ToastProps['type']>, string> = {
  success: '#00E094',
  error: '#ef4444',
  info: '#0057FF',
};

const TOAST_ICONS: Record<NonNullable<ToastProps['type']>, keyof typeof Feather.glyphMap> = {
  success: 'check-circle',
  error: 'alert-circle',
  info: 'info',
};

export function Toast({ visible, message, type = 'success', onHide, duration = 3000 }: ToastProps) {
  const colorTheme = useThemeColor();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- translateY and opacity are stable Animated.Value refs from useRef
  }, [visible, onHide, duration]);

  if (!visible) return null;

  const toastColor = TOAST_COLORS[type];

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
        style={[
          styles.toast,
          {
            backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#ffffff',
            borderLeftColor: toastColor,
          },
        ]}>
        <View style={[styles.iconContainer, { backgroundColor: toastColor }]}>
          <Feather name={TOAST_ICONS[type]} size={20} color="#ffffff" />
        </View>
        <Text style={styles.message}>{message}</Text>
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
    borderRadius: 12,
    borderLeftWidth: 4,
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
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
