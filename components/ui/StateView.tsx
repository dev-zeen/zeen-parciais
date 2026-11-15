import { Feather } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';

type StateViewProps = {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Estado vazio ou de erro, com uma ação opcional. */
export function StateView({ icon = 'inbox', title, message, actionLabel, onAction }: StateViewProps) {
  const { colors, spacing, radius, minTouch } = useTokens();

  return (
    <View style={{ alignItems: 'center', padding: spacing.lg, gap: spacing.xs }}>
      <Feather name={icon} size={32} color={colors.textMuted} />
      <AppText variant="title" weight="bold" align="center">
        {title}
      </AppText>
      {message ? (
        <AppText variant="body" color="textMuted" align="center">
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          android_ripple={{ color: colors.border }}
          style={({ pressed }) => ({
            marginTop: spacing.xs,
            minHeight: minTouch,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.accentFill,
            opacity: pressed ? 0.8 : 1,
            overflow: 'hidden',
          })}>
          <AppText variant="body" weight="bold" color="onAccentFill">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
