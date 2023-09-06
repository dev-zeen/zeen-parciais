import { Feather } from '@expo/vector-icons';
import { useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { TeamBanner } from '@/components/contexts/utils/TeamBanner';
import { Loading } from '@/components/structure/Loading';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { tintColorDark } from '@/constants/Colors';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import useMyClub from '@/hooks/useMyClub';
import usePartialScore from '@/hooks/usePartialScore';
import { TeamHistoryRound } from '@/models/Club';
import { useGetHistoricMyClub } from '@/queries/club.query';
import { useGetMarketStatus } from '@/queries/market.query';
import theme from '@/styles/theme';
import { numberToString } from '@/utils/parseTo';

export default () => {
  const colorTheme = useColorScheme();

  const { isAutheticated, handleLogout } = useContext(AuthContext);

  const { data: marketStatus } = useGetMarketStatus();

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const allowRequest = marketStatus
    ? isAutheticated && marketStatus.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO
    : false;

  const { myClub, isLoadingMyClub, onRefetchMyClub, isRefetchingMyClub } = useMyClub();

  const { data: historyClub, isLoading: isLoadingHistory } = useGetHistoricMyClub(!!allowRequest);

  const { partialScore } = usePartialScore({
    teamId: myClub?.time.time_id as number,
  });

  const [highestScore, setHighestScore] = useState<TeamHistoryRound>();
  const [lowestScore, setLowestScore] = useState<TeamHistoryRound>();

  const totalScore = numberToString(
    (myClub?.pontos_campeonato as number) + (isMarketClose ? partialScore : 0)
  );

  const totalPatrimony = myClub && numberToString(myClub?.patrimonio);

  const isLoading = isLoadingHistory || isLoadingMyClub || !myClub;

  useEffect(() => {
    if (historyClub && historyClub.length > 0) {
      const highestScore =
        historyClub?.length &&
        historyClub
          .filter((item) => item.pontos)
          .reduce((acc, item) => {
            if (item.pontos > acc.pontos) {
              return (acc = item);
            } else {
              return acc;
            }
          });

      const lowestScore =
        historyClub?.length &&
        historyClub
          .filter((item) => item.pontos)
          .reduce((acc, item) => {
            if (item.pontos < acc.pontos) {
              return (acc = item);
            } else {
              return acc;
            }
          });

      setHighestScore(highestScore as TeamHistoryRound);
      setLowestScore(lowestScore as TeamHistoryRound);
    }
  }, [historyClub]);

  if (!isAutheticated) {
    return (
      <Login title="Para acessar as informações do seu perfil é necessário efetuar o login no Cartola FC." />
    );
  }

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl onRefresh={onRefetchMyClub} refreshing={isRefetchingMyClub} />
        }
        className={`flex-1 rounded-lg ${colorTheme === 'dark' ? `bg-dark` : 'bg-light'}`}>
        <View
          className={`flex-1 rounded-lg ${colorTheme === 'dark' ? `bg-dark` : 'bg-light'}`}
          style={{
            gap: theme.Tokens.SPACING.xs,
            marginHorizontal: theme.Tokens.SPACING.xs,
          }}>
          <MarketStatusCard />
          <TeamBanner team={myClub} />
          <View className={`flex-row gap-2 ${colorTheme === 'dark' ? `bg-dark` : 'bg-light'}`}>
            <View className="flex-1 rounded-lg p-2 items-center justify-center gap-x-2 gap-y-1">
              <Text className="font-semibold">Total de Pontos</Text>
              <Text className="font-semibold text-xl">{totalScore}</Text>
              <Text className="font-light">Pts</Text>
            </View>

            <View className="flex-1 rounded-lg p-2 items-center justify-center gap-x-2 gap-y-1">
              <Text className="font-semibold">Patrim.</Text>
              <Text className="font-semibold text-xl">{totalPatrimony}</Text>
              <Text className="font-light">C$</Text>
            </View>
          </View>

          {historyClub && historyClub.length > 0 && (
            <View className={`flex-row gap-2 ${colorTheme === 'dark' ? `bg-dark` : 'bg-light'}`}>
              <View className="flex-1 rounded-lg p-2 items-center justify-center gap-x-2 gap-y-1">
                <Text className="font-semibold">Maior Pontuação</Text>
                <Text className="font-semibold text-xl text-blue-500">
                  {numberToString(highestScore?.pontos as number)}
                </Text>
                <Text className="font-light">Rodada {highestScore?.rodada_id}</Text>
              </View>

              <View className="flex-1 rounded-lg p-2 items-center justify-center gap-x-2 gap-y-1">
                <Text className="font-semibold">Menor Pontuação</Text>
                <Text className="font-semibold text-xl text-red-500">
                  {numberToString(lowestScore?.pontos as number)}
                </Text>
                <Text className="font-light">Rodada {lowestScore?.rodada_id}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.6}
        className="justify-center flex-row items-center rounded-lg p-3 mb-4 mx-8 bg-folly"
        style={{
          gap: 8,
        }}
        onPress={handleLogout}>
        <Text className="text-white">Sair</Text>
        <Feather name="log-out" size={24} color={tintColorDark} />
      </TouchableOpacity>
    </SafeAreaViewContainer>
  );
};
