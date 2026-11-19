import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTokens } from '@/hooks/useTokens';
import { TopPlayer } from '@/models/Player';
import { useGetTopPlayers, useGetTopReservePlayers } from '@/queries/players.query';
import { selectionRate } from '@/utils/insights';

type HighlightTab = 'titulares' | 'reservas';

const TABS = [
  { value: 'titulares', label: 'Titulares' },
  { value: 'reservas', label: 'Reservas' },
] as const;

const numberFormat = new Intl.NumberFormat('pt-BR');
const percentFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function PlayerHighlightsCarousel() {
  const { spacing } = useTokens();
  const { allowRequest, marketStatus } = useMarketStatus();
  const { data: topPlayers } = useGetTopPlayers(allowRequest);
  const { data: topReservePlayers } = useGetTopReservePlayers(allowRequest);
  const [selectedTab, setSelectedTab] = useState<HighlightTab>('titulares');

  if (
    (!topPlayers || topPlayers.length === 0) &&
    (!topReservePlayers || topReservePlayers.length === 0)
  ) {
    return null;
  }

  const displayPlayers = selectedTab === 'titulares' ? topPlayers : topReservePlayers;
  const totalTeams = marketStatus?.times_escalados;

  return (
    <AnimatedCard delay={500} variant="flat">
      <View style={{ gap: spacing.sm }}>
        <SectionHeader
          title="Mais escalados"
          subtitle={
            totalTeams
              ? `Entre ${numberFormat.format(totalTeams)} times escalados na rodada`
              : undefined
          }
        />

        <SegmentedControl options={[...TABS]} value={selectedTab} onChange={setSelectedTab} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm }}>
          {displayPlayers?.slice(0, 5).map((player) => (
            <PlayerHighlightCard
              key={player.Atleta.atleta_id}
              player={player}
              totalTeams={totalTeams}
            />
          ))}
        </ScrollView>
      </View>
    </AnimatedCard>
  );
}

function PlayerHighlightCard({ player, totalTeams }: { player: TopPlayer; totalTeams?: number }) {
  const { colors, radius } = useTokens();
  const rate = selectionRate(player.escalacoes, totalTeams);
  const lineups = numberFormat.format(player.escalacoes);

  return (
    <View
      accessible
      accessibilityLabel={`${player.Atleta.apelido}, ${player.posicao}, ${player.clube_nome}, ${
        rate != null ? `escalado por ${percentFormat.format(rate)}% dos times` : `${lineups} escalações`
      }`}
      style={[styles.card, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
      <Image
        source={{ uri: player.Atleta.foto?.replace('FORMATO', '140x140') }}
        style={[styles.photo, { backgroundColor: colors.surface }]}
      />

      <AppText variant="label" weight="bold" align="center" numberOfLines={1}>
        {player.Atleta.apelido_abreviado}
      </AppText>

      <View style={styles.meta}>
        <Badge label={player.posicao_abreviacao.toUpperCase()} tone="accent" />
        <Image source={{ uri: player.escudo_clube }} style={styles.shield} />
      </View>

      <View style={styles.rate}>
        <AppText variant="title" weight="bold" align="center">
          {rate != null ? `${percentFormat.format(rate)}%` : lineups}
        </AppText>
        {rate != null ? (
          <>
            <View style={[styles.track, { backgroundColor: colors.border }]}>
              <View
                style={[styles.fill, { width: `${rate}%`, backgroundColor: colors.brand }]}
              />
            </View>
            <AppText variant="caption" color="textMuted" align="center" numberOfLines={1}>
              {lineups} escalações
            </AppText>
          </>
        ) : (
          <AppText variant="caption" color="textMuted" align="center">
            escalações
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 132,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shield: {
    width: 18,
    height: 18,
  },
  rate: {
    alignSelf: 'stretch',
    gap: 3,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
});
