import { RefreshControl, ScrollView, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/Themed";
import { LeagueCard } from "@/components/contexts/stats/leagues/LeagueCard";
import { LeagueUserDetails } from "@/models/Leagues";
import { useMemo } from "react";

interface ListLeaguesProps {
  leagues: LeagueUserDetails[];
  onRefetch: () => void;
  isRefetching: boolean;
}

export function LeaguesList({
  leagues,
  onRefetch,
  isRefetching,
}: ListLeaguesProps) {
  const privateLeagues = useMemo(
    () => leagues.filter((league) => league.time_dono_id !== null),
    [leagues]
  );
  const publicLeagues = useMemo(
    () => leagues.filter((league) => league.time_dono_id === null),
    [leagues]
  );

  return (
    <View className="mx-2 my-1">
      <ScrollView
        style={{
          gap: 1,
        }}
        showsVerticalScrollIndicator={false}
        indicatorStyle="white"
        refreshControl={
          <RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />
        }
      >
        <View className="bg-white rounded-lg">
          <View className="border-b border-gray-200 items-center justify-center m-2 p-2">
            <Text className="text-base font-semibold"> Ligas Privadas </Text>
          </View>

          {privateLeagues.map((item) => {
            return <LeagueCard key={item.liga_id} league={item} />;
          })}
        </View>

        <View className="bg-white rounded-lg mt-1">
          <View className="border-b border-gray-200 items-center justify-center m-2 p-2">
            <Text className="text-base font-semibold"> Ligas Públicas </Text>
          </View>

          {publicLeagues.map((item) => {
            return (
              <TouchableOpacity activeOpacity={0.4} key={item.liga_id}>
                <LeagueCard league={item} />
              </TouchableOpacity>
            );
          })}
        </View>
        <View className="h-11" />
      </ScrollView>
    </View>
  );
}
