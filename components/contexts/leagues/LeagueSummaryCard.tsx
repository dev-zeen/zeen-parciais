import { Feather } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { StatItem } from '@/components/ui/StatItem';
import { useTokens } from '@/hooks/useTokens';
import { Palette } from '@/styles/tokens';

export type SummaryStat = {
  label: string;
  value: string;
  tone?: keyof Palette;
  hint?: string;
  hintTone?: keyof Palette;
};

type LeagueSummaryCardProps = {
  title: string;
  stats: SummaryStat[];
  /** Linha de contexto abaixo dos números (líder, próximo confronto...) */
  children?: ReactNode;
  /** Rola a classificação até o time do usuário */
  onLocate?: () => void;
};

/** "Sua campanha": responde onde estou e quanto falta, sem precisar percorrer a tabela. */
export function LeagueSummaryCard({ title, stats, children, onLocate }: LeagueSummaryCardProps) {
  const { colors, spacing, minTouch } = useTokens();

  return (
    <Card padding={spacing.md} style={{ gap: spacing.sm }}>
      <View style={styles.header}>
        <AppText variant="label" weight="bold" color="textMuted" accessibilityRole="header">
          {title.toUpperCase()}
        </AppText>
        {onLocate ? (
          <Pressable
            onPress={onLocate}
            accessibilityRole="button"
            accessibilityLabel="Mostrar meu time na classificação"
            hitSlop={{ top: (minTouch - 20) / 2, bottom: (minTouch - 20) / 2, left: 8, right: 8 }}
            style={({ pressed }) => [styles.locate, { opacity: pressed ? 0.6 : 1 }]}>
            <Feather name="crosshair" size={14} color={colors.accent} />
            <AppText variant="label" weight="bold" color="accent">
              Ver na tabela
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.stats}>
        {stats.map((stat) => (
          <StatItem key={stat.label} {...stat} />
        ))}
      </View>

      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 4,
  },
});
