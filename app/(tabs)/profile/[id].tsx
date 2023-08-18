import { useContext, useEffect, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme } from "react-native";

import { Feather } from "@expo/vector-icons";

import { Text, TouchableOpacity, View } from "@/components/Themed";
import { ModalLogout } from "@/components/contexts/auth/LogoutModal";
import { MaintenanceMarket } from "@/components/contexts/utils/MaintenanceMarket";
import { MarketStatusCard } from "@/components/contexts/utils/MarketStatusCard";
import { TeamBanner } from "@/components/contexts/utils/TeamBanner";
import { Loading } from "@/components/structure/Loading";
import { Login } from "@/components/structure/Login";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import Colors from "@/constants/Colors";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { AuthContext } from "@/contexts/Auth.context";
import { TeamHistoryRound } from "@/models/Club";
import {
  useGetHistoricMyClub,
  useGetMatchSubstitutions,
  useGetMyClub,
} from "@/queries/club.query";
import { useGetMarketStatus } from "@/queries/market.query";
import { useGetScoredPlayers } from "@/queries/stats.query";
import theme from "@/styles/theme";
import { numberToString } from "@/utils/parseTo";
import {
  onCalculatePartialScore,
  onUpdateTeamWithSubstitutedPlayers,
} from "@/utils/partials";

export default () => {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { data: marketStatus } = useGetMarketStatus();

  const isMarketClose =
    marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

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

  const { data: substitutions } = useGetMatchSubstitutions({
    id: club?.time.time_id,
  });

  const [highestScore, setHighestScore] = useState<TeamHistoryRound>();
  const [lowestScore, setLowestScore] = useState<TeamHistoryRound>();

  const [partialScore, setPartialScore] = useState(0);

  const [showModalLogout, setShowModalLogout] = useState(false);

  const totalScore = numberToString(
    (club?.pontos_campeonato as number) + (isMarketClose ? partialScore : 0)
  );

  const handleLogout = () => {
    setShowModalLogout(false);
  };

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

  useEffect(() => {
    if (club && isMarketClose) {
      const { playersUpdated } = onUpdateTeamWithSubstitutedPlayers(
        club,
        substitutions
      );

      const myPartialPoints = onCalculatePartialScore(
        playersUpdated,
        club.capitao_id as number,
        playerStats
      );

      setPartialScore(myPartialPoints);
    }
  }, [club, substitutions, playerStats]);

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

      <TouchableOpacity
        activeOpacity={0.6}
        className="justify-center flex-row items-center rounded-lg p-4 mb-2 mx-2"
        style={{
          gap: 8,
        }}
        onPress={() => {
          setShowModalLogout(true);
        }}
      >
        <Text>Sair</Text>
        <Feather
          name="log-out"
          size={24}
          color={colorTheme === "dark" ? Colors.dark.tint : Colors.light.tint}
        />
      </TouchableOpacity>

      {showModalLogout && (
        <ModalLogout
          isVisible={showModalLogout}
          handleLogoutSuccess={handleLogout}
        />
      )}
    </SafeAreaViewContainer>
  );
};
