import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, View, ViewStyle } from 'react-native';

import { useTokens } from '@/hooks/useTokens';

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
  // Valores estáveis criados uma vez (useState evita ler ref durante o render).
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.95));
  // A animação de entrada usa o atraso do primeiro render.
  const [initialDelay] = useState(delay);
  const { colors, radius, isDark } = useTokens();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: initialDelay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: initialDelay,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, [fadeAnim, initialDelay, scaleAnim]);

  const variantStyle = useMemo<ViewStyle>(() => {
    const styles: Record<NonNullable<AnimatedCardProps['variant']>, ViewStyle> = {
      elevated: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        ...(isDark
          ? {}
          : {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 3,
            }),
      },
      flat: { backgroundColor: colors.surface },
      default: { backgroundColor: colors.surface },
    };
    return styles[variant];
  }, [variant, colors, isDark]);

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
      <View
        className={className}
        style={[
          // `p-0` é o único ajuste de padding usado pelos chamadores; o estilo inline
          // teria precedência sobre a classe, então tratamos aqui.
          { borderRadius: radius.md, padding: /\bp-0\b/.test(className) ? 0 : 16 },
          variantStyle,
        ]}>
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
