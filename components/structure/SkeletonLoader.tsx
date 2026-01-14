import { useEffect, useRef } from 'react';
import { Animated, useColorScheme } from 'react-native';

import { View } from '@/components/Themed';

type SkeletonLoaderProps = {
  width?: number | string;
  height?: number;
  variant?: 'card' | 'text' | 'circle' | 'rect';
  className?: string;
};

export function SkeletonLoader({
  width = '100%',
  height = 20,
  variant = 'rect',
  className = '',
}: SkeletonLoaderProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const colorTheme = useColorScheme();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'card':
        return 'rounded-xl p-4';
      case 'text':
        return 'rounded';
      case 'circle':
        return 'rounded-full';
      default:
        return 'rounded-lg';
    }
  };

  const backgroundColor = colorTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';

  return (
    <Animated.View
      style={{
        opacity: pulseAnim,
        width: typeof width === 'number' ? width : '100%',
        height,
      }}
      className={typeof width === 'string' && width === '100%' ? 'w-full' : ''}>
      <View
        className={`${backgroundColor} ${getVariantStyles()} ${className}`}
        style={{
          width: typeof width === 'number' ? width : undefined,
          height,
        }}
      />
    </Animated.View>
  );
}

export function SkeletonCard() {
  return (
    <View className="p-4 rounded-xl">
      <SkeletonLoader height={24} width="60%" className="mb-3" />
      <SkeletonLoader height={16} width="100%" className="mb-2" />
      <SkeletonLoader height={16} width="80%" />
    </View>
  );
}

export function SkeletonGrid() {
  return (
    <View className="flex-row flex-wrap gap-3">
      <View className="flex-1">
        <SkeletonCard />
      </View>
      <View className="flex-1">
        <SkeletonCard />
      </View>
      <View className="flex-1 min-w-full">
        <SkeletonCard />
      </View>
    </View>
  );
}
