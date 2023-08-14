import { useContext, useEffect, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme } from "react-native";

import { Text, View } from "@/components/Themed";
import { MarketStatusCard } from "@/components/contexts/utils/MarketStatusCard";
import { TeamBanner } from "@/components/contexts/utils/TeamBanner";
import { Loading } from "@/components/structure/Loading";
import { Login } from "@/components/structure/Login";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { AuthContext } from "@/contexts/Auth.context";
import { TeamHistoryRound } from "@/models/Club";
import { FullPlayer } from "@/models/Stats";
import { useGetHistoricMyClub, useGetMyClub } from "@/queries/club.query";
import { useGetMarketStatus } from "@/queries/market.query";
import { useGetScoredPlayers } from "@/queries/stats.query";
import theme from "@/styles/theme";
import { numberToString } from "@/utils/parseTo";
import { onCalculatePartialScore } from "@/utils/partials";

export default () => {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { data: marketStatus } = useGetMarketStatus();

  const isMarketClose =
    marketStatus?.status_mercado === MARKET_STATUS_NAME.FECHADO;

  const { data: playerStats } = useGetScoredPlayers(isMarketClose);

  const allowRequests = marketStatus
    ? isAutheticated &&
      marketStatus.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO
    : false;

  const {
    data: club,
    refetch: onRefetchClub,
    isRefetching: isRefetchingClub,
  } = useGetMyClub(allowRequests);

  const { data: historyClub, isLoading: isLoadingHistory } =
    useGetHistoricMyClub(allowRequests);

  const [highestScore, setHighestScore] = useState<TeamHistoryRound>();
  const [lowestScore, setLowestScore] = useState<TeamHistoryRound>();

  const myPartialPoints = onCalculatePartialScore(
    club?.atletas as FullPlayer[],
    club?.capitao_id as number,
    playerStats
  );

  const totalScore = numberToString(
    (club?.pontos_campeonato as number) + (isMarketClose ? myPartialPoints : 0)
  );

  const totalPatrimony = club && numberToString(club?.patrimonio);

  const isLoading = isLoadingHistory || !club;

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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={onRefetchClub}
            refreshing={isRefetchingClub}
          />
        }
        className={`flex-1 rounded-lg ${
          colorTheme === "dark" ? `bg-dark` : "bg-light"
        }`}
      >
        <View
          className={`flex-1 rounded-lg ${
            colorTheme === "dark" ? `bg-dark` : "bg-light"
          }`}
          style={{
            gap: theme.Tokens.SPACING.xs,
            marginHorizontal: theme.Tokens.SPACING.xs,
            flex: 1,
          }}
        >
          <MarketStatusCard />
          <TeamBanner team={club} />
          <View
            className={`flex-row gap-2 ${
              colorTheme === "dark" ? `bg-dark` : "bg-light"
            }`}
          >
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

          <View
            className={`flex-row gap-2 ${
              colorTheme === "dark" ? `bg-dark` : "bg-light"
            }`}
          >
            <View className="flex-1 rounded-lg p-2 items-center justify-center gap-x-2 gap-y-1">
              <Text className="font-semibold">Maior Pontuação</Text>
              <Text className="font-semibold text-xl text-blue-500">
                {numberToString(highestScore?.pontos as number)}
              </Text>
              <Text className="font-light">
                Rodada {highestScore?.rodada_id}
              </Text>
            </View>

            <View className="flex-1 rounded-lg p-2 items-center justify-center gap-x-2 gap-y-1">
              <Text className="font-semibold">Menor Pontuação</Text>
              <Text className="font-semibold text-xl text-red-500">
                {numberToString(lowestScore?.pontos as number)}
              </Text>
              <Text className="font-light">
                Rodada {lowestScore?.rodada_id}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
};
