import { useMemo } from "react";
import { RefreshControl, ScrollView } from "react-native";

import { Text, View } from "@/components/Themed";
import { LeagueCard } from "@/components/contexts/leagues/LeagueCard";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { useGetLeagues } from "@/queries/leagues";
import { useGetMarketStatus } from "@/queries/market";

export default function () {
  const {
    data: dataLeagues,
    isLoading: isLoadingLeagues,
    refetch: onRefetchLeagues,
    isRefetching: isRefetching,
  } = useGetLeagues();

  const { data } = useGetMarketStatus();

  const leagues = useMemo(() => {
    if (data?.status_mercado === MARKET_STATUS_NAME.FECHADO) {
      const privateLeagues = dataLeagues?.ligas
        .filter((item) => item.time_dono_id)
        .sort((a, b) => b.time_dono_id - a.time_dono_id);

      return privateLeagues;
    }

    return dataLeagues?.ligas.sort((a, b) => b.time_dono_id - a.time_dono_id);
  }, [dataLeagues]);

  if (isLoadingLeagues && !dataLeagues && leagues?.length === 0) {
    <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={onRefetchLeagues}
            refreshing={isRefetching}
          />
        }
        className="mx-2"
      >
        <View className="rounded-lg py-2">
          <View className="border-b border-gray-400 items-center justify-center m-2 pb-4 pt-2">
            <Text className="text-base font-semibold"> Minhas Ligas </Text>
          </View>
          {leagues?.map((item) => (
            <LeagueCard key={item.liga_id} league={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
}
