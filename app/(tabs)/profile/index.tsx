import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useContext, useMemo } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { LineChart } from '@/components/charts/LineChart';
import { TeamSummaryCard } from '@/components/contexts/home/TeamSummaryCard';
import { CartoleiroInfoCard } from '@/components/contexts/profile/CartoleiroInfoCard';
import {
  ProfileCard,
  ProfileRow,
  ProfileStatTile,
} from '@/components/contexts/profile/ProfileCard';
import { ReminderSettingsCard } from '@/components/contexts/profile/ReminderSettingsCard';
import { RankingLevelBar } from '@/components/contexts/profile/RankingLevelBar';
import { ScoringGuideLink } from '@/components/contexts/scoring/ScoringGuideLink';
import { LinkRow } from '@/components/ui/LinkRow';
import { ThemeSettingsCard } from '@/components/contexts/profile/ThemeSettingsCard';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { Loading } from '@/components/structure/Loading';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { appAlert } from '@/components/ui/AppAlert';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import useMyClub from '@/hooks/useMyClub';
import usePartialScore from '@/hooks/usePartialScore';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTokens } from '@/hooks/useTokens';
import theme from '@/styles/theme';
import { useGetRankingLevels } from '@/queries/club.query';
import { numberToString } from '@/utils/parseTo';
import { findRankingLevel, rankingProgress } from '@/utils/rankingLevel';
import { buildSeasonStats } from '@/utils/profileStats';

const GREEN = '#22C55E';
const RED = '#EF4444';
const AMBER = '#F59E0B';
const PURPLE = '#8B5CF6';
const GRAY = '#6B7280';

export default () => {
  const { colors: tk } = useTokens();
  const colorTheme = useThemeColor();
  const tabBarSpacing = useTabBarSpacing();
  const { isAutheticated, handleLogout } = useContext(AuthContext);
  const { marketStatus, isMarketClose } = useMarketStatus();

  const {
    myClub,
    isLoadingMyClub,
    onRefetchMyClub,
    isRefetchingMyClub,
    historyClub,
    isLoadingHistory,
    onRefetchHistoricMyClub,
    isRefetchingHistoricMyClub,
  } = useMyClub();

  const { partialScore } = usePartialScore({ teamId: myClub?.time.time_id as number });

  const season = useMemo(() => buildSeasonStats(historyClub), [historyClub]);
  // Gráfico: últimas 5 rodadas com pontuação positiva
  const chartRounds = useMemo(
    () => (historyClub ?? []).filter((h) => h.pontos !== null && h.pontos > 0),
    [historyClub]
  );

  const rankingVariation = myClub?.ranking
    ? myClub.ranking.anterior.posicao - myClub.ranking.atual.posicao
    : 0;
  const variationColor = rankingVariation > 0 ? GREEN : rankingVariation < 0 ? RED : GRAY;

  // Nível do cartoleiro (Inicial … Diamante)
  const { data: rankingLevels } = useGetRankingLevels();
  const level = findRankingLevel(rankingLevels, myClub?.ranking?.atual.ranking_id);
  const bestLevel = findRankingLevel(rankingLevels, myClub?.ranking?.melhor_ranking_id);

  const totalScore = numberToString(
    (myClub?.pontos_campeonato as number) + (isMarketClose ? partialScore : 0)
  );

  const onRefetch = useCallback(async () => {
    if (onRefetchMyClub && onRefetchHistoricMyClub)
      await Promise.all([onRefetchMyClub(), onRefetchHistoricMyClub()]);
  }, [onRefetchHistoricMyClub, onRefetchMyClub]);

  if (!isAutheticated) {
    return <Login reason="Entre para ver seu histórico, patrimônio e pontuação." />;
  }

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (isLoadingHistory || isLoadingMyClub || !myClub) {
    return <Loading />;
  }

  const hasHistory = !!historyClub && historyClub.length > 0;

  return (
    <SafeAreaViewContainer edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={onRefetch}
            refreshing={isRefetchingMyClub || isRefetchingHistoricMyClub}
          />
        }
        // + altura do botão de sair (56) e sua margem, para ele não cobrir o último card
        contentContainerStyle={{ paddingBottom: tabBarSpacing.contentBottom + 72 }}
        className={`flex-1 rounded-lg ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
        <View
          className={`flex-1 rounded-lg ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}
          style={{
            // Padrão das abas: 16 nas laterais, 8 no topo, 12 entre blocos
            gap: theme.Tokens.SPACING.sm,
            marginHorizontal: theme.Tokens.SPACING.md,
            paddingTop: theme.Tokens.SPACING.xs,
          }}>
          <MarketStatusCard />
          <TeamSummaryCard team={myClub} />

          <ProfileCard
            delay={100}
            icon="bar-chart-2"
            iconColor={tk.accent}
            title="Estatísticas Gerais">
            <ProfileRow>
              <ProfileStatTile
                label="Total"
                icon="award"
                iconColor={tk.accent}
                iconBackground={tk.accentContainer}
                value={totalScore}
                caption="Pts"
              />
              <ProfileStatTile
                label="Patrimônio"
                icon="dollar-sign"
                iconColor={GREEN}
                iconBackground={`${GREEN}20`}
                value={numberToString(myClub.patrimonio)}
                caption="C$"
              />
            </ProfileRow>
            <ProfileRow>
              <ProfileStatTile
                label="Média/Rod"
                icon="trending-up"
                iconColor={AMBER}
                iconBackground={`${AMBER}20`}
                value={numberToString(season.average)}
                caption="Pts"
              />
              <ProfileStatTile
                label="Rodadas"
                icon="calendar"
                iconColor={PURPLE}
                iconBackground={`${PURPLE}20`}
                value={season.roundsPlayed}
                caption="Jogadas"
              />
            </ProfileRow>
          </ProfileCard>

          {myClub.ranking && (
            <ProfileCard delay={200} icon="trending-up" iconColor="#22c55e" title="Rankings">
              <ProfileRow>
                <ProfileStatTile
                  fit
                  label="Posição"
                  icon="hash"
                  iconColor={tk.accent}
                  iconBackground={tk.accentContainer}
                  value={`${myClub.ranking.atual.posicao.toLocaleString('pt-BR')}º`}
                  caption="Atual"
                />
                <ProfileStatTile
                  fit
                  label="Variação"
                  icon={
                    rankingVariation > 0
                      ? 'trending-up'
                      : rankingVariation < 0
                        ? 'trending-down'
                        : 'minus'
                  }
                  iconColor={variationColor}
                  iconBackground={`${variationColor}20`}
                  valueColor={
                    rankingVariation !== 0
                      ? variationColor
                      : colorTheme === 'dark'
                        ? '#d1d5db'
                        : '#374151'
                  }
                  value={`${rankingVariation > 0 ? '+' : ''}${Math.abs(
                    rankingVariation
                  ).toLocaleString('pt-BR')}`}
                  caption={
                    rankingVariation > 0 ? 'Subiu' : rankingVariation < 0 ? 'Caiu' : 'Estável'
                  }
                />
                <ProfileStatTile
                  fit
                  label="Nível"
                  icon="star"
                  iconColor={AMBER}
                  iconBackground={`${AMBER}20`}
                  value={level?.nome ?? '-'}
                  caption={
                    bestLevel && bestLevel.ranking_id > (level?.ranking_id ?? 0)
                      ? `Melhor: ${bestLevel.nome}`
                      : 'Atual'
                  }
                />
              </ProfileRow>
              {level ? (
                <RankingLevelBar
                  level={level}
                  progress={rankingProgress(rankingLevels, level.ranking_id)}
                  total={rankingLevels?.length ?? 0}
                />
              ) : null}
            </ProfileCard>
          )}

          {hasHistory && (
            <ProfileCard delay={300} icon="zap" iconColor="#f59e0b" title="Desempenho por Rodada">
              <ProfileRow>
                <ProfileStatTile
                  label="Maior"
                  icon="trending-up"
                  iconColor={GREEN}
                  iconBackground={`${GREEN}20`}
                  valueColor={GREEN}
                  value={numberToString(season.highest?.pontos as number)}
                  caption={`R${season.highest?.rodada_id}`}
                />
                <ProfileStatTile
                  label="Menor"
                  icon="trending-down"
                  iconColor={RED}
                  iconBackground={`${RED}20`}
                  valueColor={RED}
                  value={numberToString(season.lowest?.pontos as number)}
                  caption={`R${season.lowest?.rodada_id}`}
                />
              </ProfileRow>
              <ProfileRow>
                <ProfileStatTile
                  label="Média"
                  icon="activity"
                  iconColor={tk.accent}
                  iconBackground={tk.accentContainer}
                  value={numberToString(season.average)}
                  caption="Pts"
                />
                <ProfileStatTile
                  label="Consistência"
                  icon="bar-chart"
                  iconColor={PURPLE}
                  iconBackground={`${PURPLE}20`}
                  value={`±${numberToString(season.consistency)}`}
                  caption="Desvio"
                />
              </ProfileRow>
            </ProfileCard>
          )}

          {hasHistory && (
            <AnimatedCard delay={400} variant="flat">
              <View style={{ gap: 16, backgroundColor: 'transparent' }}>
                <View
                  className="flex-row items-center justify-between"
                  style={{ backgroundColor: 'transparent' }}>
                  <View style={{ backgroundColor: 'transparent' }}>
                    <View
                      className="flex-row items-center"
                      style={{ gap: 8, backgroundColor: 'transparent', marginBottom: 4 }}>
                      <Feather name="trending-up" size={20} color={tk.accent} />
                      <Text className="text-base font-bold">Histórico de Pontuação</Text>
                    </View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {chartRounds.length === 1
                        ? '1 rodada disputada'
                        : `${chartRounds.length} rodadas disputadas`}
                    </Text>
                  </View>
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6' }}>
                    <Feather
                      name="bar-chart-2"
                      size={16}
                      color={colorTheme === 'dark' ? '#9CA3AF' : GRAY}
                    />
                  </View>
                </View>

                <View
                  className="rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: colorTheme === 'dark' ? '#111827' : '#F9FAFB',
                    marginHorizontal: -16,
                  }}>
                  <LineChart
                    data={chartRounds.slice(-5).map((h) => h.pontos ?? 0)}
                    labels={chartRounds.slice(-5).map((h) => `R${h.rodada_id}`)}
                    height={220}
                    showGrid={false}
                  />
                </View>
              </View>
            </AnimatedCard>
          )}

          <ProfileCard
            delay={500}
            icon="users"
            iconColor="#22c55e"
            title="Participação em Ligas"
            onPress={() => router.push('/leagues')}
            trailing={
              <Feather
                name="chevron-right"
                size={20}
                color={colorTheme === 'dark' ? '#9ca3af' : '#6b7280'}
              />
            }>
            <ProfileRow>
              <ProfileStatTile
                label="Clássicas"
                icon="flag"
                iconColor={tk.accent}
                iconBackground={tk.accentContainer}
                value={myClub.total_ligas ?? 0}
                caption="Ligas"
              />
              <ProfileStatTile
                label="Mata-mata"
                icon="target"
                iconColor={AMBER}
                iconBackground={`${AMBER}20`}
                value={myClub.total_ligas_matamata ?? 0}
                caption="Ligas"
              />
            </ProfileRow>
          </ProfileCard>

          <CartoleiroInfoCard team={myClub.time} />
          <ScoringGuideLink />
          <LinkRow
            icon="clock"
            title="Histórico de escalações"
            subtitle="Cada vez que você salvou o time na rodada"
            onPress={() => router.push('/historico-escalacoes')}
          />
          <ThemeSettingsCard />
          <ReminderSettingsCard />
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.8}
        className="items-center justify-center"
        style={{
          position: 'absolute',
          right: 16,
          // Acima da tab bar nativa, que no iOS fica sobre o conteúdo
          bottom: tabBarSpacing.overlap + 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#ffffff',
          borderWidth: 1,
          borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() =>
          appAlert(
            'Sair da conta?',
            'Para ver seu time, as parciais e suas ligas de novo, será preciso entrar com a conta Globo.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: handleLogout },
            ]
          )
        }
        accessibilityRole="button"
        accessibilityLabel="Sair da conta">
        <Feather name="log-out" size={24} color={colorTheme === 'dark' ? '#ef4444' : '#dc2626'} />
      </TouchableOpacity>
    </SafeAreaViewContainer>
  );
};
