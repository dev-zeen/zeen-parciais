import { StyleSheet, View } from 'react-native';

import { formatPoints } from '@/components/contexts/leagues/leagueKinds';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { useTokens } from '@/hooks/useTokens';
import { FullPlayer } from '@/models/Stats';
import { LineupComparison, ScoredPlayer } from '@/utils/rivals';

type RivalDiffCardProps = {
  round: number;
  comparison: LineupComparison<FullPlayer>;
};

/** Diferenciais da rodada: o que separa o seu time deste adversário. */
export function RivalDiffCard({ round, comparison }: RivalDiffCardProps) {
  const { spacing, colors } = useTokens();
  const { balance, common, onlyMine, onlyTheirs } = comparison;
  const sameCaptain =
    !!comparison.myCaptain && comparison.myCaptain.atleta_id === comparison.theirCaptain?.atleta_id;

  return (
    <Card padding={spacing.md} style={{ gap: spacing.sm }}>
      <AppText variant="label" weight="bold" color="textMuted" accessibilityRole="header">
        DIFERENCIAIS · RODADA {round}
      </AppText>

      <AppText variant="body">
        {balance === 0 ? (
          'Os diferenciais e os capitães se anulam até agora.'
        ) : (
          <>
            Seus diferenciais e capitão dão{' '}
            <AppText variant="body" weight="bold" color={balance > 0 ? 'positive' : 'negative'}>
              {formatPoints(Math.abs(balance))} {balance > 0 ? 'a mais' : 'a menos'}
            </AppText>
            .
          </>
        )}{' '}
        <AppText variant="body" color="textMuted">
          {common.length === 1 ? '1 jogador em comum.' : `${common.length} jogadores em comum.`}
        </AppText>
      </AppText>

      <View style={[styles.columns, { gap: spacing.sm }]}>
        <Column title="Só você" players={onlyMine} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Column title="Só ele" players={onlyTheirs} />
      </View>

      {comparison.myCaptain || comparison.theirCaptain ? (
        <AppText variant="caption" color="textMuted">
          {sameCaptain
            ? `Mesmo capitão: ${comparison.myCaptain!.apelido}.`
            : `Capitães: ${comparison.myCaptain?.apelido ?? 'nenhum'} (+${formatPoints(
                comparison.myCaptainBonus
              )}) × ${comparison.theirCaptain?.apelido ?? 'nenhum'} (+${formatPoints(
                comparison.theirCaptainBonus
              )})`}
        </AppText>
      ) : null}
    </Card>
  );
}

function Column({ title, players }: { title: string; players: ScoredPlayer<FullPlayer>[] }) {
  return (
    <View style={styles.column}>
      <AppText variant="label" weight="bold" color="textMuted">
        {title} ({players.length})
      </AppText>
      {players.length === 0 ? (
        <AppText variant="label" color="textMuted">
          Nenhum
        </AppText>
      ) : (
        players.map(({ player, points }) => (
          <View key={player.atleta_id} style={styles.line}>
            <AppText variant="label" numberOfLines={1} style={{ flex: 1 }}>
              {player.apelido}
            </AppText>
            <AppText
              variant="label"
              weight="bold"
              color={points > 0 ? 'positive' : points < 0 ? 'negative' : 'textMuted'}>
              {formatPoints(points)}
            </AppText>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  columns: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
