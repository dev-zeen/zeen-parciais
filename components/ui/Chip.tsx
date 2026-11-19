import { Pressable } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';

type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Divide a largura com os vizinhos (uso em alternâncias de abas) */
  fill?: boolean;
  accessibilityRole?: 'button' | 'tab';
};

export function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  accessibilityLabel,
  fill = false,
  accessibilityRole = 'button',
}: ChipProps) {
  const { colors, radius, spacing, minTouch } = useTokens();

  const backgroundColor = selected ? colors.accentFill : colors.surfaceAlt;
  const textColor = selected ? 'onAccentFill' : 'text';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected, disabled }}
      android_ripple={{ color: colors.border }}
      style={({ pressed }) => ({
        flex: fill ? 1 : undefined,
        minHeight: minTouch,
        minWidth: minTouch,
        // Dividindo a largura (abas), menos respiro lateral para o rótulo caber
        paddingHorizontal: fill ? spacing.xs : spacing.md,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
        opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
        overflow: 'hidden',
      })}>
      <AppText
        variant="body"
        weight="bold"
        color={textColor}
        numberOfLines={1}
        adjustsFontSizeToFit={fill}
        minimumFontScale={0.8}>
        {label}
      </AppText>
    </Pressable>
  );
}
