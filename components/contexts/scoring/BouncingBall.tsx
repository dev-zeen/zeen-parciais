import { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { field } from '@/styles/tokens';

type BouncingBallProps = {
  size?: number;
};

/** Bola quicando e girando (ilustração do topo da tela de pontuação). */
export function BouncingBall({ size = 56 }: BouncingBallProps) {
  const reduceMotion = useReduceMotion();
  const [bounce] = useState(() => new Animated.Value(0));
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) return;

    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 420,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1680,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    bounceLoop.start();
    spinLoop.start();
    return () => {
      bounceLoop.stop();
      spinLoop.stop();
    };
  }, [bounce, reduceMotion, spin]);

  const translateY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.5] });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  // A sombra encolhe quando a bola sobe
  const shadowScale = bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 0.55] });

  return (
    <View style={{ alignItems: 'center', height: size * 1.7, justifyContent: 'flex-end' }}>
      <Animated.View style={{ transform: [{ translateY }, { rotate }] }} accessible={false}>
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Circle
            cx={32}
            cy={32}
            r={30}
            fill={field.chipBg}
            stroke={field.chipText}
            strokeWidth={2}
          />
          <Polygon points="32,20 43,28 39,41 25,41 21,28" fill={field.chipText} />
          <Path
            d="M32 20 L32 4 M43 28 L58 22 M39 41 L48 55 M25 41 L16 55 M21 28 L6 22"
            stroke={field.chipText}
            strokeWidth={2}
          />
        </Svg>
      </Animated.View>
      <Animated.View
        style={{
          width: size * 0.7,
          height: 6,
          marginTop: 4,
          borderRadius: 3,
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          transform: [{ scaleX: shadowScale }],
        }}
      />
    </View>
  );
}
