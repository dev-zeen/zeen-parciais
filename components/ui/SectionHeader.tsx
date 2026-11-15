import { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function SectionHeader({ title, subtitle, right }: SectionHeaderProps) {
  const { spacing } = useTokens();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.xs,
      }}>
      <View style={{ flex: 1 }}>
        <AppText variant="title" weight="bold" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="label" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}
