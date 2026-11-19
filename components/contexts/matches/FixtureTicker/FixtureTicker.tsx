import { useMemo } from 'react';
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { StateView } from '@/components/ui/StateView';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTokens } from '@/hooks/useTokens';
import { IClub } from '@/models/Club';
import { useGetMatchesByRounds } from '@/queries/matches.query';
import { ClubFixtures, Difficulty, buildFixtureTicker, ranksFromMatches } from '@/utils/fixtures';

/** Rodadas mostradas a partir da atual */
const ROUNDS_AHEAD = 5;
const CLUB_COLUMN = 64;

const keyExtractor = (item: ClubFixtures) => String(item.clubId);

type FixtureTickerProps = {
  contentContainerStyle?: object;
};

/**
 * Calendário das próximas rodadas por clube, colorido pela força do adversário.
 * Ajuda a planejar compras para várias rodadas, não só a próxima.
 */
export function FixtureTicker({ contentContainerStyle }: FixtureTickerProps) {
  const { colors, spacing, radius } = useTokens();
  const { marketStatus } = useMarketStatus();

  const rounds = useMemo(() => {
    const first = marketStatus?.rodada_atual ?? 0;
    const last = marketStatus?.rodada_final ?? 38;
    if (!first) return [];
    return Array.from({ length: ROUNDS_AHEAD }, (_, i) => first + i).filter((r) => r <= last);
  }, [marketStatus?.rodada_atual, marketStatus?.rodada_final]);

  const { data, isLoading, isError, refetch } = useGetMatchesByRounds(rounds);

  const { rows, clubs } = useMemo(() => {
    const ordered = [...data].sort((a, b) => a.rodada - b.rodada);
    const merged: IClub = Object.assign({}, ...ordered.map((round) => round.clubes));
    return { rows: buildFixtureTicker(ordered, ranksFromMatches(ordered[0])), clubs: merged };
  }, [data]);

  const tone: Record<Difficulty, { bg: string; fg: 'positive' | 'text' | 'warning' | 'negative' }> =
    {
      1: { bg: colors.positiveContainer, fg: 'positive' },
      2: { bg: colors.surfaceAlt, fg: 'text' },
      3: { bg: colors.warningContainer, fg: 'warning' },
      4: { bg: colors.negativeContainer, fg: 'negative' },
    };

  const renderItem = ({ item }: ListRenderItemInfo<ClubFixtures>) => {
    const club = clubs[item.clubId];
    return (
      <View style={[styles.row, { gap: 4 }]}>
        <View style={[styles.club, { width: CLUB_COLUMN }]}>
          {club?.escudos?.['30x30'] ? (
            <Image source={{ uri: club.escudos['30x30'] }} style={styles.shield} />
          ) : null}
          <AppText variant="label" weight="bold" numberOfLines={1}>
            {club?.abreviacao}
          </AppText>
        </View>
        {item.fixtures.map((fixture, index) => {
          const opponent = fixture ? clubs[fixture.opponentId] : undefined;
          const style = fixture?.difficulty ? tone[fixture.difficulty] : undefined;
          return (
            <View
              key={index}
              accessible
              accessibilityLabel={
                fixture
                  ? `Rodada ${fixture.round}: ${fixture.isHome ? 'em casa' : 'fora'} contra ${
                      opponent?.nome ?? 'adversário'
                    }`
                  : 'Sem jogo'
              }
              style={[
                styles.cell,
                { borderRadius: radius.sm, backgroundColor: style?.bg ?? colors.surface },
              ]}>
              <AppText variant="caption" weight="bold" color={style?.fg ?? 'textMuted'}>
                {fixture ? (opponent?.abreviacao ?? '?') : '-'}
              </AppText>
              {fixture ? (
                <AppText variant="caption" color="textMuted">
                  {fixture.isHome ? 'casa' : 'fora'}
                </AppText>
              ) : null}
            </View>
          );
        })}
      </View>
    );
  };

  if (!isLoading && (isError || rows.length === 0)) {
    return (
      <StateView
        icon="calendar"
        title="Calendário indisponível"
        message="Não deu para carregar as próximas rodadas."
        actionLabel="Tentar de novo"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
      contentContainerStyle={contentContainerStyle}
      initialNumToRender={20}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => {
            refetch();
          }}
        />
      }
      ListEmptyComponent={
        isLoading ? (
          <AppText variant="body" color="textMuted" align="center">
            Carregando as próximas rodadas...
          </AppText>
        ) : undefined
      }
      ListHeaderComponent={
        <View style={{ gap: spacing.xs, marginBottom: spacing.xs }}>
          <AppText variant="label" color="textMuted">
            Do calendário mais fácil para o mais difícil, pela posição atual do adversário.
          </AppText>
          <View style={[styles.row, { gap: 4 }]}>
            <View style={{ width: CLUB_COLUMN }} />
            {rounds.map((round) => (
              <AppText
                key={round}
                variant="caption"
                weight="bold"
                color="textMuted"
                align="center"
                style={styles.cellHeader}>
                R{round}
              </AppText>
            ))}
          </View>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  club: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shield: {
    width: 18,
    height: 18,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  cellHeader: {
    flex: 1,
  },
});
