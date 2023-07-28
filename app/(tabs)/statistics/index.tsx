import React from "react";

import { View } from "@/components/Themed";
import { LeaguesList } from "@/components/contexts/statistics/leagues/LeaguesList/LeaguesList";
import { PlayersList } from "@/components/contexts/statistics/players/PlayersList/PlayersList";
import { Loading } from "@/components/structure/Loading";
import { ITabs, Tabs } from "@/components/structure/Tabs";
import { LeagueUserDetails } from "@/models/Leagues";
import { useGetLeagues } from "@/queries/leagues";
import { useGetScoredPlayers } from "@/queries/stats";
import { SafeAreaView, useColorScheme } from "react-native";

export default () => {
  const colorTheme = useColorScheme();

  const {
    data: playersStats,
    isRefetching: isRefetchingPlayersStats,
    refetch: onRefetchStats,
  } = useGetScoredPlayers();

  const {
    data: dataLeagues,
    isLoading: isLoadingLeagues,
    refetch: onRefetchLeagues,
    isRefetching: isRefetching,
  } = useGetLeagues();

  const statsTabs: ITabs[] = [
    {
      id: 1,
      title: "Ligas",
      content: () => {
        return (
          <LeaguesList
            leagues={dataLeagues?.ligas as LeagueUserDetails[]}
            onRefetch={onRefetchLeagues}
            isRefetching={isRefetching}
          />
        );
      },
    },
    {
      id: 2,
      title: "Jogadores",
      content: () => {
        return (
          <PlayersList
            isRefetchingStats={isRefetchingPlayersStats}
            onRefetch={onRefetchStats}
            playersStats={playersStats}
          />
        );
      },
    },
  ];

  if (isLoadingLeagues) {
    return <Loading />;
  }

  return (
    <SafeAreaView
      className={`flex-1 px-2 rounded-lg ${
        colorTheme === "dark" ? `bg-dark` : "bg-light"
      }`}
    >
      <View className={`flex-1 rounded-lg`}>
        <Tabs tabs={statsTabs} />
      </View>
    </SafeAreaView>
  );
};
