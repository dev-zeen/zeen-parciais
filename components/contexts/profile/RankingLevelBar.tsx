import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';
import { RankingLevel } from '@/models/Club';

type RankingLevelBarProps = {
  level: RankingLevel;
  /** 0 a 1 até o nível máximo */
  progress: number;
  total: number;
};

/** Progresso do nível do cartoleiro até o último nível (Diamante). */
export function RankingLevelBar({ level, progress, total }: RankingLevelBarProps) {
  const { colors, spacing } = useTokens();

  return (
    <View
      style={{ gap: spacing.xxs }}
      accessible
      accessibilityLabel={`Nível ${level.nome}, ${level.ranking_id} de ${total}`}>
      <View style={styles.labels}>
        <AppText variant="label" weight="medium">
          Nível {level.nome}
        </AppText>
        <AppText variant="label" color="textMuted">
          {level.ranking_id} de {total}
        </AppText>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
        <View
          style={[
            styles.fill,
            { width: `${Math.round(progress * 100)}%`, backgroundColor: `#${level.cor_base}` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
});
