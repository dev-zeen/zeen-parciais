import { Feather } from '@expo/vector-icons';
import {  TouchableOpacity } from 'react-native';

import { Text } from '@/components/Themed';
import { useTokens } from '@/hooks/useTokens';

interface ButtonProps {
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'warning' | 'error' | 'success' | 'disabled';
  title?: string;
  iconName?: keyof typeof Feather.glyphMap;
  hasIcon?: boolean;
  colorIcon?: string;
  onlyIcon?: boolean;
  disabled?: boolean;
  /** Obrigatório para leitores de tela quando `onlyIcon` */
  accessibilityLabel?: string;
}

export function Button({
  variant = 'primary',
  title,
  onPress,
  iconName,
  hasIcon,
  onlyIcon,
  disabled,
  accessibilityLabel,
}: ButtonProps) {
  const { colors, radius, minTouch } = useTokens();

  const variants = {
    primary: { bg: colors.accentFill, fg: colors.onAccentFill },
    secondary: { bg: colors.brand, fg: colors.onBrand },
    warning: { bg: colors.warningFill, fg: colors.onWarningFill },
    error: { bg: colors.negativeFill, fg: colors.onNegativeFill },
    success: { bg: colors.positiveFill, fg: colors.onPositiveFill },
    disabled: { bg: colors.disabledFill, fg: colors.onDisabledFill },
  };

  const current = disabled ? variants.disabled : variants[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: minTouch,
        minWidth: minTouch,
        paddingHorizontal: onlyIcon ? 8 : 16,
        gap: 6,
        borderRadius: radius.md,
        backgroundColor: current.bg,
      }}
      activeOpacity={0.6}
      disabled={disabled}>
      {hasIcon && <Feather name={iconName} color={current.fg} size={18} />}
      {!onlyIcon && (
        <Text style={{ fontSize: 14, fontWeight: '700', color: current.fg }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
