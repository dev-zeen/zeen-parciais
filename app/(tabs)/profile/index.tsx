import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useContext, useMemo } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { LineChart } from '@/components/charts/LineChart';
import { TeamSummaryCard } from '@/components/contexts/home/TeamSummaryCard';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { Loading } from '@/components/structure/Loading';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import { useTheme } from '@/contexts/Theme.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import useMyClub from '@/hooks/useMyClub';
import usePartialScore from '@/hooks/usePartialScore';
import { TeamHistoryRound } from '@/models/Club';
import theme from '@/styles/theme';
import { numberToString } from '@/utils/parseTo';

export default () => {
  const { themeMode, colorScheme: colorTheme, setThemeMode } = useTheme();

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

  const { partialScore } = usePartialScore({
    teamId: myClub?.time.time_id as number,
  });

  const highestScore: TeamHistoryRound | undefined = useMemo(() => {
    const filtered = historyClub?.filter((item) => item.pontos) || [];

    if (filtered.length === 0) {
      return undefined;
    }

    return filtered.reduce((acc, item) => {
      if (item.pontos > acc.pontos) {
        return item;
      }
      return acc;
    });
  }, [historyClub]);

  const lowestScore: TeamHistoryRound | undefined = useMemo(() => {
    const filtered = historyClub?.filter((item) => item.pontos) || [];

    if (filtered.length === 0) {
      return undefined;
    }

    return filtered.reduce((acc, item) => {
      if (item.pontos < acc.pontos) {
        return item;
      }
      return acc;
    });
  }, [historyClub]);

  // Calculate average score
  const averageScore = useMemo(() => {
    if (!historyClub || historyClub.length === 0) return 0;
    const validRounds = historyClub.filter((h) => h.pontos > 0);
    if (validRounds.length === 0) return 0;
    const sum = validRounds.reduce((acc, h) => acc + h.pontos, 0);
    return sum / validRounds.length;
  }, [historyClub]);

  // Calculate consistency (standard deviation)
  const consistency = useMemo(() => {
    if (!historyClub || historyClub.length < 2) return 0;
    const validRounds = historyClub.filter((h) => h.pontos > 0);
    if (validRounds.length < 2) return 0;
    const mean = averageScore;
    const variance =
      validRounds.reduce((acc, h) => acc + Math.pow(h.pontos - mean, 2), 0) / validRounds.length;
    return Math.sqrt(variance);
  }, [historyClub, averageScore]);

  // Calculate ranking variation
  const rankingVariation = useMemo(() => {
    if (!myClub?.ranking) return 0;
    return myClub.ranking.anterior.posicao - myClub.ranking.atual.posicao;
  }, [myClub]);

  // Number of rounds played
  const roundsPlayed = useMemo(() => {
    if (!historyClub) return 0;
    return historyClub.filter((h) => h.pontos > 0).length;
  }, [historyClub]);

  const totalScore = numberToString(
    (myClub?.pontos_campeonato as number) + (isMarketClose ? partialScore : 0)
  );

  const totalPatrimony = myClub && numberToString(myClub?.patrimonio);

  const isLoading = isLoadingHistory || isLoadingMyClub || !myClub;

  const onRefetch = useCallback(async () => {
    if (onRefetchMyClub && onRefetchHistoricMyClub)
      await Promise.all([onRefetchMyClub(), onRefetchHistoricMyClub]);
  }, [onRefetchHistoricMyClub, onRefetchMyClub]);

  const isRefetching = useMemo(
    () => isRefetchingMyClub || isRefetchingHistoricMyClub,
    [isRefetchingHistoricMyClub, isRefetchingMyClub]
  );

  if (!isAutheticated) {
    return (
      <Login title="Para acessar as informações do seu perfil é necessário efetuar o login." />
    );
  }

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
        className={`flex-1 rounded-lg ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
        <View
          className={`flex-1 rounded-lg ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}
          style={{
            gap: theme.Tokens.SPACING.xs,
            marginHorizontal: theme.Tokens.SPACING.xs,
          }}>
          <MarketStatusCard />
          <TeamSummaryCard team={myClub} />

          {/* General Statistics - 2x2 Grid */}
          <AnimatedCard delay={100} variant="flat">
            <View style={{ gap: 16, backgroundColor: 'transparent' }}>
              <View
                className="flex-row items-center"
                style={{ gap: 8, backgroundColor: 'transparent' }}>
                <Feather name="bar-chart-2" size={20} color="#3b82f6" />
                <Text className="text-base font-bold">Estatísticas Gerais</Text>
              </View>
              <View className="flex-row" style={{ gap: 8, backgroundColor: 'transparent' }}>
                {/* Total Points */}
                <View
                  className="flex-1 rounded-xl p-3"
                  style={{ 
                    backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                    minHeight: 88,
                  }}>
                  <View
                    className="flex-row items-center justify-between mb-2"
                    style={{ backgroundColor: 'transparent' }}>
                    <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
                      Total
                    </Text>
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#3B82F620' }}>
                      <Feather name="award" size={14} color="#3B82F6" />
                    </View>
                  </View>
                  <Text className="font-bold text-xl mb-1" numberOfLines={1}>
                    {totalScore}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">Pts</Text>
                </View>

                {/* Patrimony */}
                <View
                  className="flex-1 rounded-xl p-3"
                  style={{ 
                    backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                    minHeight: 88,
                  }}>
                  <View
                    className="flex-row items-center justify-between mb-2"
                    style={{ backgroundColor: 'transparent' }}>
                    <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
                      Patrimônio
                    </Text>
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#22C55E20' }}>
                      <Feather name="dollar-sign" size={14} color="#22C55E" />
                    </View>
                  </View>
                  <Text className="font-bold text-xl mb-1" numberOfLines={1}>
                    {totalPatrimony}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">C$</Text>
                </View>
              </View>

              <View className="flex-row" style={{ gap: 8, backgroundColor: 'transparent' }}>
                {/* Average Score */}
                <View
                  className="flex-1 rounded-xl p-3"
                  style={{ 
                    backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                    minHeight: 88,
                  }}>
                  <View
                    className="flex-row items-center justify-between mb-2"
                    style={{ backgroundColor: 'transparent' }}>
                    <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
                      Média/Rod
                    </Text>
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#F59E0B20' }}>
                      <Feather name="trending-up" size={14} color="#F59E0B" />
                    </View>
                  </View>
                  <Text className="font-bold text-xl mb-1" numberOfLines={1}>
                    {numberToString(averageScore)}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">Pts</Text>
                </View>

                {/* Rounds Played */}
                <View
                  className="flex-1 rounded-xl p-3"
                  style={{ 
                    backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                    minHeight: 88,
                  }}>
                  <View
                    className="flex-row items-center justify-between mb-2"
                    style={{ backgroundColor: 'transparent' }}>
                    <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
                      Rodadas
                    </Text>
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#8B5CF620' }}>
                      <Feather name="calendar" size={14} color="#8B5CF6" />
                    </View>
                  </View>
                  <Text className="font-bold text-xl mb-1" numberOfLines={1}>
                    {roundsPlayed}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">Jogadas</Text>
                </View>
              </View>
            </View>
          </AnimatedCard>

          {/* Rankings Card */}
          {myClub?.ranking && (
            <AnimatedCard delay={200} variant="flat">
              <View style={{ gap: 16, backgroundColor: 'transparent' }}>
                <View
                  className="flex-row items-center"
                  style={{ gap: 8, backgroundColor: 'transparent' }}>
                  <Feather name="trending-up" size={20} color="#22c55e" />
                  <Text className="text-base font-bold">Rankings</Text>
                </View>
                <View className="flex-row" style={{ gap: 8, backgroundColor: 'transparent' }}>
                  {/* Current Position */}
                  <View
                    className="flex-1 rounded-xl p-3"
                    style={{ 
                      backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                      minHeight: 88,
                    }}>
                    <View
                      className="flex-row items-center justify-between mb-2"
                      style={{ backgroundColor: 'transparent' }}>
                      <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        Posição
                      </Text>
                      <View
                        className="w-7 h-7 rounded-full items-center justify-center"
                        style={{ backgroundColor: '#3B82F620' }}>
                        <Feather name="hash" size={14} color="#3B82F6" />
                      </View>
                    </View>
                    <Text 
                      className="font-bold mb-1" 
                      style={{ fontSize: 18 }}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      minimumFontScale={0.7}>
                      {myClub.ranking.atual.posicao.toLocaleString('pt-BR')}º
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Atual</Text>
                  </View>

                  {/* Variation */}
                  <View
                    className="flex-1 rounded-xl p-3"
                    style={{ 
                      backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                      minHeight: 88,
                    }}>
                    <View
                      className="flex-row items-center justify-between mb-2"
                      style={{ backgroundColor: 'transparent' }}>
                      <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        Variação
                      </Text>
                      <View
                        className="w-7 h-7 rounded-full items-center justify-center"
                        style={{
                          backgroundColor:
                            rankingVariation > 0
                              ? '#22C55E20'
                              : rankingVariation < 0
                                ? '#EF444420'
                                : '#6B728020',
                        }}>
                        <Feather
                          name={
                            rankingVariation > 0
                              ? 'trending-up'
                              : rankingVariation < 0
                                ? 'trending-down'
                                : 'minus'
                          }
                          size={14}
                          color={
                            rankingVariation > 0
                              ? '#22C55E'
                              : rankingVariation < 0
                                ? '#EF4444'
                                : '#6B7280'
                          }
                        />
                      </View>
                    </View>
                    <Text
                      className="font-bold mb-1"
                      style={{
                        fontSize: 18,
                        color:
                          rankingVariation > 0
                            ? '#22C55E'
                            : rankingVariation < 0
                              ? '#EF4444'
                              : colorTheme === 'dark'
                                ? '#d1d5db'
                                : '#374151',
                      }}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      minimumFontScale={0.7}>
                      {rankingVariation > 0 ? '+' : ''}
                      {Math.abs(rankingVariation).toLocaleString('pt-BR')}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {rankingVariation > 0 ? 'Subiu' : rankingVariation < 0 ? 'Caiu' : 'Estável'}
                    </Text>
                  </View>

                  {/* Best Position */}
                  <View
                    className="flex-1 rounded-xl p-3"
                    style={{ 
                      backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                      minHeight: 88,
                    }}>
                    <View
                      className="flex-row items-center justify-between mb-2"
                      style={{ backgroundColor: 'transparent' }}>
                      <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        Melhor
                      </Text>
                      <View
                        className="w-7 h-7 rounded-full items-center justify-center"
                        style={{ backgroundColor: '#F59E0B20' }}>
                        <Feather name="star" size={14} color="#F59E0B" />
                      </View>
                    </View>
                    <Text 
                      className="font-bold mb-1" 
                      style={{ fontSize: 18 }}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      minimumFontScale={0.7}>
                      {myClub.ranking.melhor_ranking_id.toLocaleString('pt-BR')}º
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Posição</Text>
                  </View>
                </View>
              </View>
            </AnimatedCard>
          )}

          {/* Performance by Round - 2x2 Grid */}
          {historyClub && historyClub.length > 0 && (
            <AnimatedCard delay={300} variant="flat">
              <View style={{ gap: 16, backgroundColor: 'transparent' }}>
                <View
                  className="flex-row items-center"
                  style={{ gap: 8, backgroundColor: 'transparent' }}>
                  <Feather name="zap" size={20} color="#f59e0b" />
                  <Text className="text-base font-bold">Desempenho por Rodada</Text>
                </View>
                <View className="flex-row" style={{ gap: 8, backgroundColor: 'transparent' }}>
                  {/* Highest Score */}
                  <View
                    className="flex-1 rounded-xl p-3"
                    style={{ 
                      backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                      minHeight: 88,
                    }}>
                    <View
                      className="flex-row items-center justify-between mb-2"
                      style={{ backgroundColor: 'transparent' }}>
                      <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        Maior
                      </Text>
                      <View
                        className="w-7 h-7 rounded-full items-center justify-center"
                        style={{ backgroundColor: '#22C55E20' }}>
                        <Feather name="trending-up" size={14} color="#22C55E" />
                      </View>
                    </View>
                    <Text
                      className="font-bold text-xl mb-1"
                      style={{ color: '#22C55E' }}
                      numberOfLines={1}>
                      {numberToString(highestScore?.pontos as number)}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      R{highestScore?.rodada_id}
                    </Text>
                  </View>

                  {/* Lowest Score */}
                  <View
                    className="flex-1 rounded-xl p-3"
                    style={{ 
                      backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                      minHeight: 88,
                    }}>
                    <View
                      className="flex-row items-center justify-between mb-2"
                      style={{ backgroundColor: 'transparent' }}>
                      <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        Menor
                      </Text>
                      <View
                        className="w-7 h-7 rounded-full items-center justify-center"
                        style={{ backgroundColor: '#EF444420' }}>
                        <Feather name="trending-down" size={14} color="#EF4444" />
                      </View>
                    </View>
                    <Text
                      className="font-bold text-xl mb-1"
                      style={{ color: '#EF4444' }}
                      numberOfLines={1}>
                      {numberToString(lowestScore?.pontos as number)}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      R{lowestScore?.rodada_id}
                    </Text>
                  </View>
                </View>

                <View className="flex-row" style={{ gap: 8, backgroundColor: 'transparent' }}>
                  {/* Average General */}
                  <View
                    className="flex-1 rounded-xl p-3"
                    style={{ 
                      backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                      minHeight: 88,
                    }}>
                    <View
                      className="flex-row items-center justify-between mb-2"
                      style={{ backgroundColor: 'transparent' }}>
                      <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        Média
                      </Text>
                      <View
                        className="w-7 h-7 rounded-full items-center justify-center"
                        style={{ backgroundColor: '#3B82F620' }}>
                        <Feather name="activity" size={14} color="#3B82F6" />
                      </View>
                    </View>
                    <Text className="font-bold text-xl mb-1" numberOfLines={1}>
                      {numberToString(averageScore)}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Pts</Text>
                  </View>

                  {/* Consistency */}
                  <View
                    className="flex-1 rounded-xl p-3"
                    style={{ 
                      backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                      minHeight: 88,
                    }}>
                    <View
                      className="flex-row items-center justify-between mb-2"
                      style={{ backgroundColor: 'transparent' }}>
                      <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        Consistência
                      </Text>
                      <View
                        className="w-7 h-7 rounded-full items-center justify-center"
                        style={{ backgroundColor: '#8B5CF620' }}>
                        <Feather name="bar-chart" size={14} color="#8B5CF6" />
                      </View>
                    </View>
                    <Text className="font-bold text-xl mb-1" numberOfLines={1}>
                      ±{numberToString(consistency)}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Desvio</Text>
                  </View>
                </View>
              </View>
            </AnimatedCard>
          )}

          {/* Evolution Chart */}
          {historyClub && historyClub.length > 0 && (
            <AnimatedCard delay={400} variant="flat">
              <View style={{ gap: 16, backgroundColor: 'transparent' }}>
                <View
                  className="flex-row items-center justify-between"
                  style={{ backgroundColor: 'transparent' }}>
                  <View style={{ backgroundColor: 'transparent' }}>
                    <View
                      className="flex-row items-center"
                      style={{ gap: 8, backgroundColor: 'transparent', marginBottom: 4 }}>
                      <Feather name="trending-up" size={20} color="#3b82f6" />
                      <Text className="text-base font-bold">Histórico de Pontuação</Text>
                    </View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {historyClub.filter((h) => h.pontos !== null && h.pontos > 0).length === 1
                        ? '1 rodada disputada'
                        : `${historyClub.filter((h) => h.pontos !== null && h.pontos > 0).length} rodadas disputadas`}
                    </Text>
                  </View>
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6' }}>
                    <Feather
                      name="bar-chart-2"
                      size={16}
                      color={colorTheme === 'dark' ? '#9CA3AF' : '#6B7280'}
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
                    data={historyClub
                      .filter((h) => h.pontos !== null && h.pontos > 0)
                      .slice(-5)
                      .map((h) => h.pontos ?? 0)}
                    labels={historyClub
                      .filter((h) => h.pontos !== null && h.pontos > 0)
                      .slice(-5)
                      .map((h) => `R${h.rodada_id}`)}
                    height={220}
                    showGrid={false}
                  />
                </View>
              </View>
            </AnimatedCard>
          )}

          {/* League Participation */}
          <AnimatedCard delay={500} variant="flat">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/leagues')}>
              <View style={{ gap: 16, backgroundColor: 'transparent' }}>
                <View
                  className="flex-row items-center justify-between"
                  style={{ backgroundColor: 'transparent' }}>
                  <View
                    className="flex-row items-center"
                    style={{ gap: 8, backgroundColor: 'transparent' }}>
                    <Feather name="users" size={20} color="#22c55e" />
                    <Text className="text-base font-bold">Participação em Ligas</Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={colorTheme === 'dark' ? '#9ca3af' : '#6b7280'}
                  />
                </View>
                <View className="flex-row" style={{ gap: 8, backgroundColor: 'transparent' }}>
                  <View
                    className="flex-1 rounded-xl p-3"
                    style={{ 
                      backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                      minHeight: 88,
                    }}>
                    <View
                      className="flex-row items-center justify-between mb-2"
                      style={{ backgroundColor: 'transparent' }}>
                      <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        Clássicas
                      </Text>
                      <View
                        className="w-7 h-7 rounded-full items-center justify-center"
                        style={{ backgroundColor: '#3B82F620' }}>
                        <Feather name="flag" size={14} color="#3B82F6" />
                      </View>
                    </View>
                    <Text className="font-bold text-xl mb-1" numberOfLines={1}>
                      {myClub?.total_ligas ?? 0}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Ligas</Text>
                  </View>

                  <View
                    className="flex-1 rounded-xl p-3"
                    style={{ 
                      backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                      minHeight: 88,
                    }}>
                    <View
                      className="flex-row items-center justify-between mb-2"
                      style={{ backgroundColor: 'transparent' }}>
                      <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        Mata-mata
                      </Text>
                      <View
                        className="w-7 h-7 rounded-full items-center justify-center"
                        style={{ backgroundColor: '#F59E0B20' }}>
                        <Feather name="target" size={14} color="#F59E0B" />
                      </View>
                    </View>
                    <Text className="font-bold text-xl mb-1" numberOfLines={1}>
                      {myClub?.total_ligas_matamata ?? 0}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Ligas</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </AnimatedCard>

          {/* Cartoleiro Info */}
          <AnimatedCard delay={600} variant="flat">
            <View style={{ gap: 16, backgroundColor: 'transparent' }}>
              <View
                className="flex-row items-center"
                style={{ gap: 8, backgroundColor: 'transparent' }}>
                <Feather name="user" size={20} color="#8b5cf6" />
                <Text className="text-base font-bold">Informações do Cartoleiro</Text>
              </View>
              <View
                className="flex-row flex-wrap"
                style={{ gap: 8, backgroundColor: 'transparent' }}>
                {/* Year Started */}
                <View
                  className="flex-row items-center px-3 py-2 rounded-full"
                  style={{
                    backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                    gap: 6,
                  }}>
                  <Feather name="calendar" size={14} color="#3B82F6" />
                  <Text className="text-sm font-semibold">
                    Desde {myClub?.time.temporada_inicial ?? '—'}
                  </Text>
                </View>

                {/* PRO Status */}
                <View
                  className="flex-row items-center px-3 py-2 rounded-full"
                  style={{
                    backgroundColor: myClub?.time.assinante
                      ? '#fbbf2420'
                      : colorTheme === 'dark'
                        ? '#1F293730'
                        : '#F3F4F6',
                    gap: 6,
                  }}>
                  <Feather
                    name="star"
                    size={14}
                    color={myClub?.time.assinante ? '#fbbf24' : '#6B7280'}
                  />
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color: myClub?.time.assinante
                        ? '#fbbf24'
                        : colorTheme === 'dark'
                          ? '#6b7280'
                          : '#9ca3af',
                    }}>
                    {myClub?.time.assinante ? 'PRO' : 'Free'}
                  </Text>
                </View>

                {/* Facebook Connected */}
                {myClub?.time.facebook_id && (
                  <View
                    className="flex-row items-center px-3 py-2 rounded-full"
                    style={{
                      backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                      gap: 6,
                    }}>
                    <Feather name="facebook" size={14} color="#1877F2" />
                    <Text className="text-sm font-semibold">Conectado</Text>
                  </View>
                )}
              </View>
            </View>
          </AnimatedCard>

          {/* Theme Settings */}
          <AnimatedCard delay={700} variant="flat">
            <View style={{ gap: 16, backgroundColor: 'transparent' }}>
              <View
                className="flex-row items-center"
                style={{ gap: 8, backgroundColor: 'transparent' }}>
                <Feather name="moon" size={20} color="#3b82f6" />
                <Text className="text-base font-bold">Tema do Aplicativo</Text>
              </View>
              <View className="flex-row" style={{ gap: 8, backgroundColor: 'transparent' }}>
                {/* Light Theme */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setThemeMode('light')}
                  className="flex-1 rounded-xl p-3"
                  style={{
                    backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                    borderWidth: 2,
                    borderColor: themeMode === 'light' ? '#3B82F6' : 'transparent',
                  }}>
                  <View
                    className="flex-row items-center justify-between mb-2"
                    style={{ backgroundColor: 'transparent' }}>
                    <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                      Claro
                    </Text>
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#3B82F620' }}>
                      <Feather name="sun" size={12} color="#3B82F6" />
                    </View>
                  </View>
                  {themeMode === 'light' && (
                    <View
                      className="flex-row items-center"
                      style={{ gap: 4, backgroundColor: 'transparent' }}>
                      <Feather name="check" size={12} color="#3B82F6" />
                      <Text className="text-xs font-semibold" style={{ color: '#3B82F6' }}>
                        Ativo
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Dark Theme */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setThemeMode('dark')}
                  className="flex-1 rounded-xl p-3"
                  style={{
                    backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                    borderWidth: 2,
                    borderColor: themeMode === 'dark' ? '#3B82F6' : 'transparent',
                  }}>
                  <View
                    className="flex-row items-center justify-between mb-2"
                    style={{ backgroundColor: 'transparent' }}>
                    <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                      Escuro
                    </Text>
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#3B82F620' }}>
                      <Feather name="moon" size={12} color="#3B82F6" />
                    </View>
                  </View>
                  {themeMode === 'dark' && (
                    <View
                      className="flex-row items-center"
                      style={{ gap: 4, backgroundColor: 'transparent' }}>
                      <Feather name="check" size={12} color="#3B82F6" />
                      <Text className="text-xs font-semibold" style={{ color: '#3B82F6' }}>
                        Ativo
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Auto Theme */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setThemeMode('auto')}
                  className="flex-1 rounded-xl p-3"
                  style={{
                    backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                    borderWidth: 2,
                    borderColor: themeMode === 'auto' ? '#3B82F6' : 'transparent',
                  }}>
                  <View
                    className="flex-row items-center justify-between mb-2"
                    style={{ backgroundColor: 'transparent' }}>
                    <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                      Auto
                    </Text>
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#3B82F620' }}>
                      <Feather name="smartphone" size={12} color="#3B82F6" />
                    </View>
                  </View>
                  {themeMode === 'auto' && (
                    <View
                      className="flex-row items-center"
                      style={{ gap: 4, backgroundColor: 'transparent' }}>
                      <Feather name="check" size={12} color="#3B82F6" />
                      <Text className="text-xs font-semibold" style={{ color: '#3B82F6' }}>
                        Ativo
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {themeMode === 'auto'
                  ? 'Segue o tema do sistema automaticamente'
                  : `Tema ${themeMode === 'light' ? 'claro' : 'escuro'} sempre ativo`}
              </Text>
            </View>
          </AnimatedCard>
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.8}
        className="items-center justify-center"
        style={{
          position: 'absolute',
          right: 16,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#ffffff',
          borderWidth: 1,
          borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={handleLogout}>
        <Feather name="log-out" size={24} color={colorTheme === 'dark' ? '#ef4444' : '#dc2626'} />
      </TouchableOpacity>
    </SafeAreaViewContainer>
  );
};
