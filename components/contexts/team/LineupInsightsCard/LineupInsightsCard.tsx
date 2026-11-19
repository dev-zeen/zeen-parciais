import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatItem } from '@/components/ui/StatItem';
import { OBJECT_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import { usePlayerInsights } from '@/hooks/usePlayerInsights';
import { useTokens } from '@/hooks/useTokens';
import { LineupPlayer, LineupPlayers } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { buildLineupProjection, suggestCaptain } from '@/utils/insights';
import { numberToString } from '@/utils/parseTo';

type LineupInsightsCardProps = {
  lineup: LineupPlayers;
  captain: number;
  /** Vende o jogador e abre o mercado na posição dele */
  onReplace: (player: LineupPlayer | FullPlayer) => void;
};

/** Resumo da escalação com o mercado aberto: projeção, mando e jogadores em risco. */
export function LineupInsightsCard({ lineup, captain, onReplace }: LineupInsightsCardProps) {
  const { colors, spacing, radius, minTouch } = useTokens();
  const { getInsight, hasGatoMestre } = usePlayerInsights();

  const projection = useMemo(
    () =>
      buildLineupProjection(
        lineup.starting.map((item) => item.player),
        captain,
        getInsight
      ),
    [lineup.starting, captain, getInsight]
  );

  const updateCaptain = useTeamLineupStore((state) => state.updateCaptain);
  const suggestion = useMemo(
    () =>
      suggestCaptain(
        lineup.starting.map((item) => item.player),
        getInsight
      ),
    [lineup.starting, getInsight]
  );
  const isSuggestedCaptain = suggestion?.player.atleta_id === captain;

  if (projection.filled === 0) return null;

  return (
    <Card style={[styles.card, { gap: spacing.sm }]}>
      <SectionHeader
        title="Raio-X da escalação"
        subtitle={
          hasGatoMestre
            ? 'Projeção pela média de cada jogador no mando desta rodada'
            : 'Projeção pela média geral de cada jogador'
        }
      />

      <View style={styles.stats}>
        <StatItem
          label="Projeção"
          value={numberToString(projection.projected)}
          tone="accent"
          hint={captain ? 'capitão ×1,5' : 'sem capitão'}
        />
        <StatItem label="Em casa" value={String(projection.home)} />
        <StatItem label="Fora" value={String(projection.away)} />
        {projection.withMinimum > 0 ? (
          <StatItem
            label="Valorizam"
            value={`${projection.likelyToValorize}/${projection.withMinimum}`}
            hint="projeção ≥ mínimo"
          />
        ) : null}
      </View>

      {suggestion ? (
        <View
          style={[
            styles.alert,
            styles.alertRow,
            { backgroundColor: colors.accentContainer, borderRadius: radius.md },
          ]}>
          <Feather name="award" size={16} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <AppText variant="body" weight="bold" numberOfLines={1}>
              {isSuggestedCaptain ? 'Capitão certo' : 'Capitão sugerido'}:{' '}
              {suggestion.player.apelido}
            </AppText>
            <AppText variant="label" color="textMuted" numberOfLines={1}>
              Maior projeção do time: {numberToString(suggestion.projected)} pts (×1,5 ={' '}
              {numberToString(suggestion.projected * 1.5)})
            </AppText>
          </View>
          {!isSuggestedCaptain ? (
            <Pressable
              onPress={() => updateCaptain(suggestion.player.atleta_id)}
              accessibilityRole="button"
              accessibilityLabel={`Tornar ${suggestion.player.apelido} capitão`}
              style={({ pressed }) => [
                styles.replace,
                {
                  minHeight: minTouch,
                  borderRadius: radius.full,
                  backgroundColor: colors.accentFill,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}>
              <AppText variant="body" weight="bold" color="onAccentFill">
                Escolher
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {projection.withoutMatch > 0 ? (
        <AppText variant="label" color="warning">
          {projection.withoutMatch === 1
            ? '1 titular é de um clube que não joga nesta rodada.'
            : `${projection.withoutMatch} titulares são de clubes que não jogam nesta rodada.`}
        </AppText>
      ) : null}

      {projection.unlikely.length > 0 ? (
        <View
          style={[
            styles.alert,
            { backgroundColor: colors.warningContainer, borderRadius: radius.md, gap: spacing.xs },
          ]}>
          <View style={styles.alertHeader}>
            <Feather name="alert-triangle" size={16} color={colors.warning} />
            <AppText variant="body" weight="bold" style={{ flex: 1 }}>
              {projection.unlikely.length === 1
                ? '1 titular pode não jogar'
                : `${projection.unlikely.length} titulares podem não jogar`}
            </AppText>
          </View>

          {projection.unlikely.map((player) => (
            <View key={player.atleta_id} style={styles.alertRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight="medium" numberOfLines={1}>
                  {player.apelido}
                </AppText>
                <AppText variant="label" color="textMuted" numberOfLines={1}>
                  {OBJECT_STATUS_MARKET_PLAYER[player.status_id]?.name ?? 'Sem status'}
                </AppText>
              </View>
              <Pressable
                onPress={() => onReplace(player)}
                accessibilityRole="button"
                accessibilityLabel={`Trocar ${player.apelido}`}
                accessibilityHint="Vende o jogador e abre o mercado na posição"
                style={({ pressed }) => [
                  styles.replace,
                  {
                    minHeight: minTouch,
                    borderRadius: radius.full,
                    backgroundColor: colors.accentFill,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}>
                <AppText variant="body" weight="bold" color="onAccentFill">
                  Trocar
                </AppText>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
  },
  stats: {
    flexDirection: 'row',
    gap: 4,
  },
  alert: {
    padding: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replace: {
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
