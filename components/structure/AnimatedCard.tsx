import { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, ViewStyle } from 'react-native';

import { View } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';

type AnimatedCardProps = {
  children: React.ReactNode;
  delay?: number;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'flat';
  className?: string;
  style?: ViewStyle;
  disabled?: boolean;
};

export function AnimatedCard({
  children,
  delay = 0,
  onPress,
  variant = 'default',
  className = '',
  style,
  disabled = false,
}: AnimatedCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const delayRef = useRef(delay);
  const colorTheme = useThemeColor();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: delayRef.current,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: delayRef.current,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only entrance animation; delay captured via ref
  }, []);

  const variantStyle = useMemo(() => {
    const isDark = colorTheme === 'dark';
    const styles = {
      elevated: isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100 shadow-md',
      flat:     isDark ? 'bg-gray-900' : 'bg-gray-50',
      default:  isDark ? 'bg-gray-800/50' : 'bg-white/50',
    } as const;
    return styles[variant];
  }, [variant, colorTheme]);

  const content = (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          width: '100%',
          backgroundColor: 'transparent',
        },
        style,
      ]}>
      <View className={`rounded-lg p-4 ${variantStyle} ${className}`}>
        {children}
      </View>
    </Animated.View>
  );

  if (onPress && !disabled) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          {
            transform: [{ scale: pressed ? 0.98 : 1 }],
            opacity: pressed ? 0.9 : 1,
          },
        ]}>
        {content}
      </Pressable>
    );
  }

  return content;
}
