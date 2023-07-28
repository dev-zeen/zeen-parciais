import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { LeagueCard } from "@/components/contexts/statistics/leagues/LeagueCard";
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
  const colorTheme = useColorScheme();

  const privateLeagues = useMemo(
    () => leagues.filter((league) => league.time_dono_id !== null),
    [leagues]
  );
  const publicLeagues = useMemo(
    () => leagues.filter((league) => league.time_dono_id === null),
    [leagues]
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />
      }
    >
      <View className="rounded-lg">
        <View className="border-b border-gray-300 items-center justify-center m-2 p-2">
          <Text className="text-base font-semibold"> Ligas Privadas </Text>
        </View>

        {privateLeagues.map((item) => {
          return <LeagueCard key={item.liga_id} league={item} />;
        })}
      </View>

      <View className="flex-1 rounded-lg mt-1">
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
      <View className="h-20" />
    </ScrollView>
  );
}
