import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Palette } from '@/styles/tokens';

type StatItemProps = {
  label: string;
  value: string;
  /** Cor do valor */
  tone?: keyof Palette;
  /** Texto auxiliar abaixo do valor (ex.: variação) */
  hint?: string;
  hintTone?: keyof Palette;
};

export function StatItem({
  label,
  value,
  tone = 'text',
  hint,
  hintTone = 'textMuted',
}: StatItemProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}${hint ? `, ${hint}` : ''}`}
      style={{ flex: 1, alignItems: 'center' }}>
      <AppText variant="label" color="textMuted" numberOfLines={1}>
        {label}
      </AppText>
      <AppText variant="title" weight="bold" color={tone} numberOfLines={1}>
        {value}
      </AppText>
      {hint ? (
        <AppText variant="caption" color={hintTone} numberOfLines={1}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}
