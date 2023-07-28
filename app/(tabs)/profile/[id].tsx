import React, { useContext, useEffect, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  useColorScheme,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { MarketStatusCard } from "@/components/contexts/utils/MarketStatusCard";
import { TeamBanner } from "@/components/contexts/utils/TeamBanner";
import { Loading } from "@/components/structure/Loading";
import { AuthContext } from "@/contexts/Auth.context";
import { TeamHistoryRound } from "@/models/Club";
import { useGetHistoricMyClub, useGetMyClub } from "@/queries/club";
import theme from "@/styles/theme";
import { numberToString } from "@/utils/parseTo";

export default () => {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const {
    data: club,
    refetch: onRefetchClub,
    isRefetching: isRefetchingClub,
  } = useGetMyClub(isAutheticated);
  const { data: historyClub, isLoading: isLoadingHistory } =
    useGetHistoricMyClub();

  const [highestScore, setHighestScore] = useState<TeamHistoryRound>();
  const [lowestScore, setLowestScore] = useState<TeamHistoryRound>();

  const totalScore = club && numberToString(club?.pontos_campeonato);
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView className="flex-1">
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
    </SafeAreaView>
  );
};
