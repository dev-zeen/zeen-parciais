import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform, Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  accessibilityLabel?: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Vidro só existe no iOS com Liquid Glass; fora disso a trilha é sólida. */
const useGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { colors, radius, minTouch } = useTokens();

  const segments = options.map((option) => {
    const selected = option.value === value;

    return (
      <Pressable
        key={option.value}
        onPress={() => onChange(option.value)}
        accessibilityRole="tab"
        accessibilityLabel={option.accessibilityLabel ?? option.label}
        accessibilityState={{ selected }}
        android_ripple={{ color: colors.border }}
        style={({ pressed }) => ({
          flex: 1,
          minHeight: minTouch - 8,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
          backgroundColor: selected ? colors.surface : 'transparent',
          opacity: pressed ? 0.75 : 1,
          overflow: 'hidden',
        })}>
        <AppText
          variant="label"
          weight={selected ? 'bold' : 'medium'}
          color={selected ? 'text' : 'textMuted'}
          numberOfLines={1}>
          {option.label}
        </AppText>
      </Pressable>
    );
  });

  const trackStyle = {
    flexDirection: 'row' as const,
    padding: 4,
    gap: 2,
    borderRadius: radius.full,
  };

  if (useGlass) {
    return (
      <GlassView accessibilityRole="tablist" style={trackStyle}>
        {segments}
      </GlassView>
    );
  }

  return (
    <View accessibilityRole="tablist" style={[trackStyle, { backgroundColor: colors.surfaceAlt }]}>
      {segments}
    </View>
  );
}
