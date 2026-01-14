import { useEffect, useRef } from 'react';
import { Animated, Pressable, useColorScheme, ViewStyle } from 'react-native';

import { View } from '@/components/Themed';

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
  const colorTheme = useColorScheme();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, [delay, fadeAnim, scaleAnim]);

  const getVariantStyles = () => {
    const isDark = colorTheme === 'dark';
    
    switch (variant) {
      case 'elevated':
        return isDark
          ? 'bg-gray-800 border border-gray-700'
          : 'bg-white border border-gray-100 shadow-md';
      case 'flat':
        return isDark ? 'bg-gray-900' : 'bg-gray-50';
      default:
        return isDark ? 'bg-gray-800/50' : 'bg-white/50';
    }
  };

  const content = (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          width: '100%',
          backgroundColor: 'white',
        },
        style,
      ]}>
      <View className={`rounded-xl p-4 ${getVariantStyles()} ${className}`}>
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
