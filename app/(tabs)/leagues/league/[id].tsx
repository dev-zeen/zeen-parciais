import { Feather } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Cup } from '@/components/contexts/leagues/Cup';
import {
  LeagueAdminSheet,
  LeagueAdminSheetRef,
} from '@/components/contexts/leagues/LeagueAdminSheet';
import { LeagueSummaryCard, SummaryStat } from '@/components/contexts/leagues/LeagueSummaryCard';
import { StandingHeader, StandingRow } from '@/components/contexts/leagues/StandingRow';
import {
  LEAGUE_KIND,
  PRIVACY_LABEL,
  formatPoints,
  pluralTeams,
} from '@/components/contexts/leagues/leagueKinds';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { ScreenHeader } from '@/components/structure/ScreenHeader';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { StateView } from '@/components/ui/StateView';
import { AuthContext } from '@/contexts/Auth.context';
import useLeague from '@/hooks/useLeague';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import { useTokens } from '@/hooks/useTokens';
import { ClubByLeague } from '@/models/Leagues';
import { useGetMyClub } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { OrderByOptions, onGetLeagueWithPartials } from '@/utils/leagues';

const VALUE_COLUMN = 84;

const PERIOD_LABEL: Record<OrderByOptions, string> = {
  [OrderByOptions.RODADA]: 'Rodada',
  [OrderByOptions.MES]: 'Mês',
  [OrderByOptions.TURNO]: 'Turno',
  [OrderByOptions.CAMPEONATO]: 'Campeonato',
  [OrderByOptions.CAPITAO]: 'Capitão',
  [OrderByOptions.PATRIMONIO]: 'Patrimônio',
};

/** Ordem dos filtros de período (OrderByOptions é const enum, não dá para iterar) */
const PERIODS = [
  OrderByOptions.RODADA,
  OrderByOptions.MES,
  OrderByOptions.TURNO,
  OrderByOptions.CAMPEONATO,
  OrderByOptions.CAPITAO,
  OrderByOptions.PATRIMONIO,
];

const valueOf = (club: ClubByLeague, period: OrderByOptions) =>
  period === OrderByOptions.PATRIMONIO
    ? (club.patrimonio ?? 0)
    : (club.pontos?.[period as Exclude<OrderByOptions, OrderByOptions.PATRIMONIO>] ?? 0);

const variationOf = (club: ClubByLeague, period: OrderByOptions) =>
  period === OrderByOptions.RODADA || period === OrderByOptions.PATRIMONIO
    ? undefined
    : club.variacao?.[period as 'mes' | 'turno' | 'campeonato' | 'capitao'];

const formatValue = (value: number, period: OrderByOptions) =>
  period === OrderByOptions.PATRIMONIO ? `C$ ${formatPoints(value)}` : formatPoints(value);

const keyExtractor = (item: ClubByLeague) => `${item.time_id}`;

export default function LeagueScreen() {
  const { colors, spacing } = useTokens();
  const tabBarSpacing = useTabBarSpacing();
  const { isAutheticated } = useContext(AuthContext);
  const { id: slug } = useLocalSearchParams<{ id: string }>();
  const { allowRequest, isMarketClose, marketStatus } = useMarketStatus();

  const { data: myClub } = useGetMyClub(allowRequest);
  const { league, clubsByLeague, isLoadingLeague, onRefetchLeague, isRefetchingLeague } = useLeague(
    { slug: slug ?? '' }
  );
  const { data: playerStats } = useGetScoredPlayers(isMarketClose);

  // Bola rolando: a rodada é o que importa; mercado aberto: a classificação geral.
  const [period, setPeriod] = useState<OrderByOptions>(
    isMarketClose ? OrderByOptions.RODADA : OrderByOptions.CAMPEONATO
  );
  const listRef = useRef<FlatList<ClubByLeague>>(null);
  const adminRef = useRef<LeagueAdminSheetRef>(null);

  const isLive = !!(isMarketClose && clubsByLeague && playerStats && marketStatus && league);

  const clubs = useMemo(() => {
    const base: ClubByLeague[] = isLive
      ? onGetLeagueWithPartials(league!, clubsByLeague!, playerStats!, marketStatus!)
      : (league?.times ?? []);
    return [...base].sort(
      (a, b) => valueOf(b, period) - valueOf(a, period) || (b.patrimonio ?? 0) - (a.patrimonio ?? 0)
    );
  }, [clubsByLeague, isLive, league, marketStatus, period, playerStats]);

  const myTeamId = myClub?.time?.time_id ?? 0;
  const myIndex = clubs.findIndex((club) => club.time_id === myTeamId);
  const showVariation = !isMarketClose;

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ClubByLeague>) => {
      const value = valueOf(item, period);
      const variation = showVariation ? variationOf(item, period) : undefined;
      const isMine = item.time_id === myTeamId;
      return (
        <StandingRow
          rank={index + 1}
          name={item.nome}
          owner={item.nome_cartola}
          shieldUrl={item.url_escudo_png}
          isPro={item.assinante}
          isMine={isMine}
          onPress={() =>
            router.push({
              pathname: '/leagues/club/[id]',
              params: { id: item.time_id, posicao: index + 1, liga: league?.liga.nome ?? '' },
            })
          }
          accessibilityLabel={`${index + 1}º, ${item.nome}${isMine ? ', seu time' : ''}, ${formatValue(
            value,
            period
          )}`}
          accessibilityHint="Abre a escalação do time">
          <View style={[styles.value, { width: VALUE_COLUMN }]}>
            <AppText variant="body" weight="bold" numberOfLines={1}>
              {formatPoints(value)}
            </AppText>
            {variation ? (
              <View style={styles.variation}>
                <Feather
                  name={variation > 0 ? 'arrow-up' : 'arrow-down'}
                  size={10}
                  color={variation > 0 ? colors.positive : colors.negative}
                />
                <AppText
                  variant="caption"
                  weight="bold"
                  color={variation > 0 ? 'positive' : 'negative'}>
                  {Math.abs(variation)}
                </AppText>
              </View>
            ) : null}
          </View>
        </StandingRow>
      );
    },
    [colors.negative, colors.positive, league?.liga.nome, myTeamId, period, showVariation]
  );

  const locateMyTeam = useCallback(() => {
    if (myIndex >= 0) listRef.current?.scrollToIndex({ index: myIndex, viewPosition: 0.5 });
  }, [myIndex]);

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;
  if (isLoadingLeague) return <LoadingScreen title="Carregando liga" />;
  if (!league) {
    return (
      <SafeAreaViewContainer edges={['top']}>
        <ScreenHeader title="Liga" />
        <StateView
          icon="wifi-off"
          title="Não deu para carregar a liga"
          message="Confira a conexão e tente de novo."
          actionLabel="Tentar de novo"
          onAction={() => onRefetchLeague()}
        />
      </SafeAreaViewContainer>
    );
  }

  const { liga } = league;
  const isCup = liga.mata_mata;
  const isOwner = !!liga.time_dono_id && myTeamId === liga.time_dono_id;
  const requestsCount = league.pedidos?.length ?? 0;
  const pendingInvites = league.convites_enviados ?? [];
  // Liga encerrada (campeão definido ou passou da última rodada) ou mata-mata já sorteado
  // não recebe mais times.
  const isFinished =
    !!liga.vencedor || (!!liga.fim_rodada && (marketStatus?.rodada_atual ?? 0) > liga.fim_rodada);
  const canInvite = isOwner && !isFinished && !(isCup && liga.sorteada);
  const canManage = canInvite || requestsCount > 0 || (isOwner && pendingInvites.length > 0);
  const kind = LEAGUE_KIND[isCup ? 'cup' : 'classic'];

  const header = (
    <ScreenHeader
      title={liga.nome}
      subtitle={[
        kind.label,
        PRIVACY_LABEL[liga.tipo],
        isCup && liga.quantidade_times
          ? `${liga.total_times_liga}/${liga.quantidade_times} times`
          : pluralTeams(liga.total_times_liga),
      ]
        .filter(Boolean)
        .join(' · ')}
      imageUrl={isCup ? liga.url_trofeu_png : liga.url_flamula_png}
      actions={
        canManage
          ? [
              {
                icon: 'settings',
                accessibilityLabel: 'Gerenciar liga',
                onPress: () => adminRef.current?.open(),
                badge: requestsCount || undefined,
              },
            ]
          : undefined
      }
    />
  );

  const adminSheet = canManage ? (
    <LeagueAdminSheet
      ref={adminRef}
      leagueName={liga.nome}
      inviteHref={
        canInvite
          ? {
              pathname: '/leagues/create/invite',
              params: { type: isCup ? 'matamata' : 'classic', slug: liga.slug },
            }
          : undefined
      }
      requestsHref={{ pathname: '/leagues/league/requests/[id]', params: { id: liga.slug } }}
      requestsCount={requestsCount}
      pendingTeams={pendingInvites.map((invite) => ({
        id: invite.time.time_id,
        name: invite.time.nome,
        owner: invite.time.nome_cartola,
        shieldUrl: invite.time.url_escudo_png,
      }))}
    />
  ) : null;

  if (isCup) {
    return (
      <SafeAreaViewContainer edges={['top']}>
        {header}
        <Cup league={league} />
        {adminSheet}
      </SafeAreaViewContainer>
    );
  }

  // Resumo do usuário: posição, valor no período e distância para o líder (ou vantagem).
  const leader = clubs[0];
  const mine = myIndex >= 0 ? clubs[myIndex] : undefined;
  const summaryStats: SummaryStat[] = [];
  if (mine) {
    const myValue = valueOf(mine, period);
    const isLeader = myIndex === 0;
    const reference = isLeader ? clubs[1] : leader;
    const gap = reference ? Math.abs(myValue - valueOf(reference, period)) : 0;
    summaryStats.push(
      { label: 'Posição', value: `${myIndex + 1}º`, hint: `de ${clubs.length}` },
      { label: PERIOD_LABEL[period], value: formatValue(myValue, period) },
      isLeader
        ? {
            label: 'Vantagem',
            value: reference ? `+${formatPoints(gap)}` : '-',
            tone: 'positive',
            hint: reference ? 'sobre o 2º' : undefined,
          }
        : {
            label: 'Para o líder',
            value: `-${formatPoints(gap)}`,
            tone: 'negative',
            hint:
              myIndex > 1
                ? `${formatPoints(valueOf(clubs[myIndex - 1], period) - myValue)} p/ ${myIndex}º`
                : undefined,
          }
    );
  }

  const highlights = [
    { icon: 'zap' as const, label: 'Mito da rodada', team: league.destaques?.rodada },
    { icon: 'dollar-sign' as const, label: 'Maior patrimônio', team: league.destaques?.patrimonio },
    { icon: 'arrow-down' as const, label: 'Lanterna', team: league.destaques?.lanterninha },
  ].filter((item) => !!item.team?.nome);

  const periods = PERIODS.filter(
    (option) => option !== OrderByOptions.CAPITAO || !liga.sem_capitao
  );

  const listHeader = (
    <View style={{ gap: spacing.sm, paddingBottom: spacing.xxs }}>
      {mine ? (
        <LeagueSummaryCard
          title="Sua campanha"
          stats={summaryStats}
          onLocate={clubs.length > 8 ? locateMyTeam : undefined}>
          {leader && myIndex !== 0 ? (
            <View style={[styles.leader, { gap: spacing.xs, borderTopColor: colors.border }]}>
              <Feather name="award" size={14} color={colors.warning} />
              <Image source={{ uri: leader.url_escudo_png }} style={styles.leaderShield} />
              <AppText variant="label" numberOfLines={1} style={{ flex: 1 }}>
                <AppText variant="label" weight="bold">
                  {leader.nome}
                </AppText>{' '}
                lidera com {formatValue(valueOf(leader, period), period)}
              </AppText>
            </View>
          ) : null}
        </LeagueSummaryCard>
      ) : (
        <Card padding={spacing.md}>
          <AppText variant="body" color="textMuted">
            Seu time não aparece na classificação desta liga
            {liga.time_dono_id ? '.' : ' (ligas do Cartola mostram só os primeiros colocados).'}
          </AppText>
        </Card>
      )}

      {highlights.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.xs }}>
          {highlights.map((item) => (
            <Card key={item.label} style={[styles.highlight, { gap: spacing.xs }]}>
              <Image source={{ uri: item.team!.url_escudo_png }} style={styles.highlightShield} />
              <View style={{ flexShrink: 1 }}>
                <View style={styles.inline}>
                  <Feather name={item.icon} size={11} color={colors.textMuted} />
                  <AppText variant="caption" color="textMuted">
                    {item.label}
                  </AppText>
                </View>
                <AppText variant="label" weight="bold" numberOfLines={1}>
                  {item.team!.nome}
                </AppText>
              </View>
            </Card>
          ))}
        </ScrollView>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xs }}>
        {periods.map((option) => (
          <Chip
            key={option}
            label={PERIOD_LABEL[option]}
            selected={period === option}
            onPress={() => setPeriod(option)}
          />
        ))}
      </ScrollView>

      <StandingHeader
        leading={
          isLive && period !== OrderByOptions.PATRIMONIO ? (
            <Badge label="Parciais ao vivo" tone="negative" />
          ) : undefined
        }
        columns={[
          {
            label: period === OrderByOptions.PATRIMONIO ? 'C$' : 'PONTOS',
            width: VALUE_COLUMN,
            align: 'right',
          },
        ]}
      />
    </View>
  );

  return (
    <SafeAreaViewContainer edges={['top']}>
      {header}
      <FlatList
        ref={listRef}
        data={clubs}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        extraData={period}
        ListHeaderComponent={listHeader}
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        ListEmptyComponent={
          <StateView
            icon="users"
            title="Liga sem times ainda"
            message="A classificação aparece quando os times entrarem."
          />
        }
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingTop: spacing.xs,
          paddingBottom: tabBarSpacing.contentBottom,
        }}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          // Linhas ainda não medidas: chega perto e tenta de novo.
          listRef.current?.scrollToOffset({ offset: index * averageItemLength, animated: true });
          setTimeout(() => listRef.current?.scrollToIndex({ index, viewPosition: 0.5 }), 250);
        }}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              onRefetchLeague();
            }}
            refreshing={isRefetchingLeague}
          />
        }
      />
      {adminSheet}
    </SafeAreaViewContainer>
  );
}

const styles = StyleSheet.create({
  value: {
    alignItems: 'flex-end',
  },
  variation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  leader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  leaderShield: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 200,
  },
  highlightShield: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
