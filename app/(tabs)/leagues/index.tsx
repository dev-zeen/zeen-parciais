import { useCallback, useContext, useEffect, useState } from "react";
import { FlatList, ListRenderItemInfo, RefreshControl } from "react-native";

import { Text, View } from "@/components/Themed";
import { LeagueCard } from "@/components/contexts/leagues/LeagueCard";
import { Loading } from "@/components/structure/Loading";
import { Login } from "@/components/structure/Login";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { AuthContext } from "@/contexts/Auth.context";
import { LeagueUserDetails } from "@/models/Leagues";
import { useGetLeagues } from "@/queries/leagues.query";
import { useGetMarketStatus } from "@/queries/market.query";

export default function () {
  const { isAutheticated } = useContext(AuthContext);

  const allowRequest = isAutheticated;

  const {
    data: dataLeagues,
    isLoading: isLoadingLeagues,
    refetch: onRefetchLeagues,
    isRefetching: isRefetching,
  } = useGetLeagues(allowRequest);

  const [leagues, setLeagues] = useState<LeagueUserDetails[]>();

  const { data: marketStatus } = useGetMarketStatus();

  useEffect(() => {
    if (marketStatus?.status_mercado === MARKET_STATUS_NAME.FECHADO) {
      const privateLeagues = dataLeagues?.ligas
        .filter((item) => item.time_dono_id)
        .sort((a, b) => b.time_dono_id - a.time_dono_id);
      setLeagues(privateLeagues);
      return;
    }

    const leaguesSorted = dataLeagues?.ligas.sort(
      (a, b) => b.time_dono_id - a.time_dono_id
    );
    setLeagues(leaguesSorted);
  }, [dataLeagues]);

  const keyExtractor = useCallback(
    (item: LeagueUserDetails) => `${item.liga_id}`,
    []
  );

  const renderItem = useCallback(
    ({ item: league }: ListRenderItemInfo<LeagueUserDetails>) => {
      return <LeagueCard key={league.liga_id} league={league} />;
    },
    [leagues]
  );

  if (!isAutheticated) {
    return (
      <Login title="Para acessar suas ligas, é necessário efetuar o login no Cartola FC." />
    );
  }

  if (!dataLeagues || !leagues || isLoadingLeagues) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <View className="rounded-lg py-2 mx-2">
        <View className="border-b border-gray-200 items-center justify-center m-2 pb-4 pt-2">
          <Text className="text-base font-semibold"> Minhas Ligas </Text>
        </View>

        <FlatList
          refreshControl={
            <RefreshControl
              onRefresh={onRefetchLeagues}
              refreshing={isRefetching}
            />
          }
          data={leagues}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      </View>
    </SafeAreaViewContainer>
  );
}
