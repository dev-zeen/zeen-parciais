import { Feather } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { LeagueSummaryCard } from '@/components/contexts/leagues/LeagueSummaryCard';
import { RivalDiffCard } from '@/components/contexts/leagues/RivalDiffCard';
import { RoundBars } from '@/components/contexts/leagues/RoundBars';
import { formatPoints } from '@/components/contexts/leagues/leagueKinds';
import { ListReservePlayers } from '@/components/contexts/team/ListReservePlayers';
import { SoccerField } from '@/components/contexts/team/SoccerField';
import { onGetFillLineupDefaultPlayers } from '@/components/contexts/team/_team.helpers';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { ScreenHeader } from '@/components/structure/ScreenHeader';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePartialScore from '@/hooks/usePartialScore';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import useTeam from '@/hooks/useTeam';
import { useTeamSeason } from '@/hooks/useTeamSeason';
import { useTokens } from '@/hooks/useTokens';
import useValorization from '@/hooks/useValorization';
import { FullPlayer } from '@/models/Stats';
import { useGetHistoricMyClub, useGetMatchSubstitutions, useGetMyClub } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { Palette } from '@/styles/tokens';
import { compareLineups } from '@/utils/rivals';

export interface PlayerClub extends FullPlayer {
  isReplaced?: boolean;
  isJoined?: boolean;
  isReserve?: boolean;
}

const signed = (value: number) => `${value >= 0 ? '+' : '−'}${formatPoints(Math.abs(value))}`;

const toneOf = (value?: number): keyof Palette =>
  value == null || value === 0 ? 'textMuted' : value > 0 ? 'positive' : 'negative';

/**
 * Desempenho de um adversário. Ordem pensada para acompanhar a liga: temporada (acumulado,
 * média e histórico por rodada, que se explicam juntos), o confronto direto com o seu
 * time e, por último, a escalação da rodada escolhida.
 */
export default function ClubScreen() {
  const { colors, spacing } = useTokens();
  const tabBarSpacing = useTabBarSpacing();
  const { isAutheticated } = useContext(AuthContext);
  const params = useLocalSearchParams<{ id: string; posicao?: string; liga?: string }>();
  const teamId = Number(params.id);

  const { marketStatus, isLoadingMarketStatus, isMarketClose, allowRequest } = useMarketStatus();
  const {
    data: playerStats,
    isLoading: isLoadingPlayerStats,
    isRefetching: isRefetchingPlayerStats,
    refetch: onRefetchStats,
  } = useGetScoredPlayers(isMarketClose);
  const { onRefetchValorizations } = useValorization();
  const { data: myClub } = useGetMyClub(allowRequest);
  const { data: myHistory } = useGetHistoricMyClub(!!allowRequest);

  const marketRound = marketStatus?.rodada_atual ?? 0;
  // Rodada em andamento (bola rolando) ou, com mercado aberto, a última encerrada.
  const latestRound = Math.max(1, isMarketClose ? marketRound : marketRound - 1);
  const [selectedRound, setSelectedRound] = useState<number | undefined>();
  const round = selectedRound ?? latestRound;
  const isLiveRound = isMarketClose && round === marketRound;

  const { team } = useTeam({ teamId, round: marketStatus ? round : 0 });
  const { data: substitutions, refetch: onRefetchSubstitutions } = useGetMatchSubstitutions({
    id: teamId,
    round,
  });
  const partial = usePartialScore({ teamId });
  const season = useTeamSeason(teamId, marketRound - 1);

  const lineup = useMemo(() => {
    if (!team) return undefined;
    const formationId = isLiveRound ? (team.time?.esquema_id ?? team.esquema_id) : team.esquema_id;
    return onGetFillLineupDefaultPlayers({
      lineupStart: team.atletas ?? [],
      reserves: team.reservas ?? [],
      formationId: formationId ?? 4,
      playerStats,
      isMarketClose,
    });
  }, [isLiveRound, isMarketClose, playerStats, team]);

  // Confronto direto: só rodadas em que os dois times pontuaram.
  const myTeamId = myClub?.time?.time_id;
  const isMine = !!myTeamId && myTeamId === teamId;
  const myPoints = useMemo(
    () => new Map((myHistory ?? []).map((r) => [r.rodada_id, r.pontos])),
    [myHistory]
  );
  const headToHead = useMemo(() => {
    if (isMine || !myPoints.size) return undefined;
    const shared = season.played.filter((r) => myPoints.has(r.round));
    if (!shared.length) return undefined;
    const myTotal = shared.reduce((sum, r) => sum + (myPoints.get(r.round) ?? 0), 0);
    const theirTotal = shared.reduce((sum, r) => sum + r.points, 0);
    return {
      rounds: shared.length,
      myTotal,
      theirTotal,
      myAverage: myTotal / shared.length,
      theirAverage: theirTotal / shared.length,
      myWins: shared.filter((r) => (myPoints.get(r.round) ?? 0) > r.points).length,
      theirWins: shared.filter((r) => (myPoints.get(r.round) ?? 0) < r.points).length,
    };
  }, [isMine, myPoints, season.played]);

  // Diferenciais: a minha escalação na mesma rodada contra a dele.
  const { team: myTeamInRound } = useTeam({
    teamId: isMine ? 0 : (myTeamId ?? 0),
    round: marketStatus ? round : 0,
  });
  const comparison = useMemo(() => {
    if (isMine || !team?.atletas?.length || !myTeamInRound?.atletas?.length) return undefined;
    // Ao vivo a pontuação vem das parciais; em rodada encerrada, do próprio time.
    const pointsOf = (player: FullPlayer) =>
      isLiveRound
        ? (playerStats?.atletas[player.atleta_id]?.pontuacao ?? 0)
        : (player.pontos_num ?? 0);
    return compareLineups(
      myTeamInRound.atletas,
      team.atletas,
      myTeamInRound.capitao_id,
      team.capitao_id,
      pointsOf
    );
  }, [isLiveRound, isMine, myTeamInRound, playerStats, team]);

  const onRefetch = useCallback(() => {
    Promise.allSettled([onRefetchStats(), onRefetchValorizations(), onRefetchSubstitutions()]);
  }, [onRefetchStats, onRefetchSubstitutions, onRefetchValorizations]);

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;

  const isLoading = isLoadingMarketStatus || (isMarketClose && isLoadingPlayerStats);
  if (isLoading || !marketStatus || !team || !lineup) {
    return <LoadingScreen title="Carregando time" />;
  }

  const selected = season.rounds.find((r) => r.round === round);
  const previous = season.rounds.find((r) => r.round === round - 1);
  const roundPoints = selected?.points;
  const vsPrevious =
    roundPoints != null && previous?.points != null ? roundPoints - previous.points : undefined;
  const vsAverage =
    roundPoints != null && season.average != null ? roundPoints - season.average : undefined;
  const isBest = season.best?.round === round && season.played.length > 1;
  const trend =
    season.recentAverage != null && season.average != null
      ? season.recentAverage - season.average
      : undefined;
  const myRoundPoints = myPoints.get(round);

  const position = Number(params.posicao);
  const subtitle = [
    isMine ? 'Seu time' : team.time?.nome_cartola,
    position > 0 ? `${position}º${params.liga ? ` em ${params.liga}` : ''}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <SafeAreaViewContainer edges={['top']}>
      <ScreenHeader
        title={team.time?.nome ?? 'Time'}
        subtitle={subtitle}
        imageUrl={team.time?.url_escudo_png}
      />

      <ScrollView
        refreshControl={
          <RefreshControl onRefresh={onRefetch} refreshing={isRefetchingPlayerStats} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: spacing.sm,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.xs,
          paddingBottom: tabBarSpacing.contentBottom,
        }}>
        {/* Rodada em andamento: a parcial é o que importa agora */}
        {isLiveRound ? (
          <LeagueSummaryCard
            title={`Rodada ${round} · ao vivo`}
            stats={[
              { label: 'Parcial', value: formatPoints(partial.partialScore), tone: 'accent' },
              { label: 'Pontuados', value: `${partial.playersHaveAlreadyPlayed ?? 0}/12` },
              { label: 'Acumulado', value: formatPoints(partial.totalPartialScore) },
            ]}
          />
        ) : null}

        {/* Temporada: acumulado, média e histórico juntos */}
        {marketRound > 1 ? (
          <Card padding={spacing.md} style={{ gap: spacing.md }}>
            <AppText variant="label" weight="bold" color="textMuted" accessibilityRole="header">
              TEMPORADA
            </AppText>
            {season.isLoading && season.played.length === 0 ? (
              <AppText variant="body" color="textMuted">
                Carregando as rodadas...
              </AppText>
            ) : season.played.length === 0 ? (
              <AppText variant="body" color="textMuted">
                Este time ainda não pontuou em nenhuma rodada encerrada.
              </AppText>
            ) : (
              <>
                <View style={styles.row}>
                  <Metric
                    label="Acumulado"
                    value={formatPoints(season.total)}
                    hint={`${season.played.length} rodadas`}
                    large
                  />
                  <Metric
                    label="Média"
                    value={formatPoints(season.average)}
                    hint={
                      trend != null
                        ? `${trend >= 0 ? '▲' : '▼'} últimas 5: ${formatPoints(season.recentAverage)}`
                        : 'por rodada'
                    }
                    hintTone={toneOf(trend)}
                    large
                  />
                </View>

                <RoundBars
                  rounds={season.rounds}
                  selected={round}
                  bestRound={season.best?.round}
                  average={season.average}
                  live={
                    isMarketClose
                      ? { round: marketRound, points: partial.partialScore ?? 0 }
                      : undefined
                  }
                  onSelect={setSelectedRound}
                />

                {/* Rodada escolhida, sempre comparada com a média e com a anterior */}
                <View
                  style={[
                    styles.selected,
                    { gap: spacing.xs, paddingTop: spacing.sm, borderTopColor: colors.border },
                  ]}>
                  <View style={[styles.row, { justifyContent: 'space-between' }]}>
                    <View style={[styles.row, { gap: spacing.xs }]}>
                      <AppText variant="title" weight="bold">
                        Rodada {round}
                      </AppText>
                      {round === latestRound ? (
                        <Badge label={isLiveRound ? 'Ao vivo' : 'Mais recente'} tone="accent" />
                      ) : null}
                      {isBest ? <Badge label="Melhor" tone="positive" /> : null}
                    </View>
                    <AppText variant="title" weight="bold">
                      {isLiveRound
                        ? formatPoints(partial.partialScore)
                        : roundPoints != null
                          ? formatPoints(roundPoints)
                          : 'Não escalou'}
                    </AppText>
                  </View>
                  {!isLiveRound && roundPoints != null ? (
                    <View style={[styles.row, styles.wrap, { columnGap: spacing.sm }]}>
                      {vsAverage != null ? (
                        <AppText variant="label" color={toneOf(vsAverage)}>
                          {signed(vsAverage)} vs média
                        </AppText>
                      ) : null}
                      {vsPrevious != null ? (
                        <AppText variant="label" color={toneOf(vsPrevious)}>
                          {signed(vsPrevious)} vs rodada {round - 1}
                        </AppText>
                      ) : null}
                      <AppText variant="label" color="textMuted">
                        acumulado {formatPoints(selected?.cumulative)}
                      </AppText>
                    </View>
                  ) : null}
                </View>

                <View style={[styles.row, { gap: spacing.md }]}>
                  <AppText variant="caption" color="textMuted">
                    Melhor{' '}
                    <AppText variant="caption" weight="bold" color="positive">
                      {formatPoints(season.best?.points)}
                    </AppText>{' '}
                    (rodada {season.best?.round})
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    Pior{' '}
                    <AppText variant="caption" weight="bold">
                      {formatPoints(season.worst?.points)}
                    </AppText>{' '}
                    (rodada {season.worst?.round})
                  </AppText>
                </View>
              </>
            )}
          </Card>
        ) : null}

        {/* Confronto direto com o seu time */}
        {headToHead ? (
          <Card padding={spacing.md} style={{ gap: spacing.sm }}>
            <AppText variant="label" weight="bold" color="textMuted" accessibilityRole="header">
              VOCÊ × ESTE TIME
            </AppText>
            <AppText variant="body">
              {headToHead.myTotal === headToHead.theirTotal ? (
                `Empatados em ${headToHead.rounds} rodadas.`
              ) : (
                <>
                  Você está{' '}
                  <AppText
                    variant="body"
                    weight="bold"
                    color={headToHead.myTotal > headToHead.theirTotal ? 'positive' : 'negative'}>
                    {formatPoints(Math.abs(headToHead.myTotal - headToHead.theirTotal))}{' '}
                    {headToHead.myTotal > headToHead.theirTotal ? 'à frente' : 'atrás'}
                  </AppText>{' '}
                  nas {headToHead.rounds} rodadas em que os dois jogaram.
                </>
              )}
            </AppText>
            <View style={styles.row}>
              <Metric
                label="Rodadas"
                value={`${headToHead.myWins} × ${headToHead.theirWins}`}
                hint="vencidas: você × ele"
              />
              <Metric
                label="Sua média"
                value={formatPoints(headToHead.myAverage)}
                hint={`${signed(headToHead.myAverage - headToHead.theirAverage)} que ele`}
                hintTone={toneOf(headToHead.myAverage - headToHead.theirAverage)}
              />
              {!isLiveRound && roundPoints != null && myRoundPoints != null ? (
                <Metric
                  label={`Você na rodada ${round}`}
                  value={formatPoints(myRoundPoints)}
                  hint={`${signed(myRoundPoints - roundPoints)} que ele`}
                  hintTone={toneOf(myRoundPoints - roundPoints)}
                />
              ) : null}
            </View>
          </Card>
        ) : null}

        {comparison ? <RivalDiffCard round={round} comparison={comparison} /> : null}

        {/* Escalação da rodada escolhida */}
        <View style={[styles.row, { justifyContent: 'space-between', marginTop: spacing.xs }]}>
          <RoundStep
            icon="chevron-left"
            label="Rodada anterior"
            disabled={round <= 1}
            onPress={() => setSelectedRound(round - 1)}
          />
          <View style={{ alignItems: 'center' }}>
            <AppText variant="caption" weight="bold" color="textMuted">
              ESCALAÇÃO
            </AppText>
            <AppText variant="title" weight="bold">
              Rodada {round}
            </AppText>
          </View>
          <RoundStep
            icon="chevron-right"
            label="Próxima rodada"
            disabled={round >= latestRound}
            onPress={() => setSelectedRound(round + 1)}
          />
        </View>

        {team.atletas?.length ? (
          <View style={{ gap: spacing.sm }}>
            <SoccerField
              lineup={lineup}
              substitutions={substitutions}
              captain={team.capitao_id ?? 0}
              round={round}
              isViewOnly
              onOpenMarket={() => {}}
            />
            <ListReservePlayers
              lineup={lineup}
              substitutions={substitutions}
              round={round}
              isViewOnly
              onOpenMarket={() => {}}
            />
          </View>
        ) : (
          <Card padding={spacing.md} style={[styles.row, { gap: spacing.sm }]}>
            <Feather name="slash" size={18} color={colors.textMuted} />
            <AppText variant="body" color="textMuted" style={{ flex: 1 }}>
              O time não escalou na rodada {round}.
            </AppText>
          </Card>
        )}

        {!isLiveRound && team.patrimonio != null ? (
          <AppText variant="caption" color="textMuted" align="center">
            Patrimônio na rodada {round}: C$ {formatPoints(team.patrimonio)}
          </AppText>
        ) : null}
      </ScrollView>
    </SafeAreaViewContainer>
  );
}

function RoundStep({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: 'chevron-left' | 'chevron-right';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const { colors, radius, minTouch } = useTokens();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.step,
        {
          width: minTouch,
          height: minTouch,
          borderRadius: radius.full,
          backgroundColor: colors.surface,
          opacity: disabled ? 0.35 : pressed ? 0.7 : 1,
        },
      ]}>
      <Feather name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

function Metric({
  label,
  value,
  hint,
  hintTone = 'textMuted',
  large,
}: {
  label: string;
  value: string;
  hint?: string;
  hintTone?: keyof Palette;
  large?: boolean;
}) {
  return (
    <View
      style={{ flex: 1 }}
      accessible
      accessibilityLabel={`${label}: ${value}${hint ? `, ${hint}` : ''}`}>
      <AppText variant="label" color="textMuted" numberOfLines={1}>
        {label}
      </AppText>
      <AppText variant={large ? 'heading' : 'title'} weight="bold">
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrap: {
    flexWrap: 'wrap',
  },
  selected: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  step: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
