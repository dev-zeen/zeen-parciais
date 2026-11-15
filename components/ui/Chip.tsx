import { Pressable } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';

type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Chip({ label, selected = false, disabled = false, onPress, accessibilityLabel }: ChipProps) {
  const { colors, radius, spacing, minTouch } = useTokens();

  const backgroundColor = selected ? colors.accentFill : colors.surfaceAlt;
  const textColor = selected ? 'onAccentFill' : 'text';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected, disabled }}
      android_ripple={{ color: colors.border }}
      style={({ pressed }) => ({
        minHeight: minTouch,
        minWidth: minTouch,
        paddingHorizontal: spacing.md,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
        opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
        overflow: 'hidden',
      })}>
      <AppText variant="body" weight="bold" color={textColor}>
        {label}
      </AppText>
    </Pressable>
  );
}
