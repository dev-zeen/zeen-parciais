import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'accent'
  | 'info'
  | 'positive'
  | 'negative'
  | 'warning';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const { colors, radius, spacing } = useTokens();

  const tones = {
    neutral: { bg: colors.surfaceAlt, text: 'textMuted' },
    brand: { bg: colors.brandContainer, text: 'text' },
    accent: { bg: colors.accentContainer, text: 'accent' },
    info: { bg: colors.infoContainer, text: 'info' },
    positive: { bg: colors.positiveContainer, text: 'positive' },
    negative: { bg: colors.negativeContainer, text: 'negative' },
    warning: { bg: colors.warningContainer, text: 'warning' },
  } as const;

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: tones[tone].bg,
        borderRadius: radius.full,
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
      }}>
      <AppText variant="label" weight="bold" color={tones[tone].text} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}
