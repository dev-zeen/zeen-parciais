import { useCallback, useContext, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  RefreshControl,
} from "react-native";

import emptyLeaguesImage from "@/assets/images/no-leagues.png";
import { Text, View } from "@/components/Themed";
import { LeagueCard } from "@/components/contexts/leagues/LeagueCard";
import { MaintenanceMarket } from "@/components/contexts/utils/MaintenanceMarket";
import { Loading } from "@/components/structure/Loading";
import { Login } from "@/components/structure/Login";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import Colors from "@/constants/Colors";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { AuthContext } from "@/contexts/Auth.context";
import { LeagueUserDetails } from "@/models/Leagues";
import { useGetLeagues } from "@/queries/leagues.query";
import { useGetMarketStatus } from "@/queries/market.query";
import { Feather } from "@expo/vector-icons";

export default function () {
  const { isAutheticated } = useContext(AuthContext);

  const { data: marketStatus } = useGetMarketStatus();

  const allowRequests =
    isAutheticated &&
    marketStatus &&
    marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO;

  const {
    data: dataLeagues,
    isLoading: isLoadingLeagues,
    refetch: onRefetchLeagues,
    isRefetching: isRefetching,
  } = useGetLeagues(!!allowRequests);

  const [leagues, setLeagues] = useState<LeagueUserDetails[]>();

  const isMarketClose =
    marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  useEffect(() => {
    if (isMarketClose) {
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

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (!dataLeagues || !leagues || isLoadingLeagues) {
    return <Loading />;
  }

  if (leagues.length === 0) {
    return (
      <SafeAreaViewContainer>
        <View className="rounded-lg py-2 mx-2 items-center justify-center flex-1">
          <Image
            source={emptyLeaguesImage}
            className="w-96 h-96 rounded-full"
            alt={`Imagem de erro na aplicação`}
          />
          <View
            className="flex-row py-4 px-8 rounded-lg items-center justify-center"
            style={{
              gap: 8,
            }}
          >
            <Feather name="alert-triangle" color="#eab308" size={16} />
            <Text className="text-sm font-semibold text-center">
              Você não está em nenhuma liga privada
            </Text>
          </View>
          <View
            className="flex-row py-4 px-8 rounded-lg justify-center"
            style={{
              gap: 8,
            }}
          >
            <Feather name="info" size={16} color={Colors.light.tint} />
            <Text className="text-xs text-center">
              As ligas públicas serão exibidas após a abertura do mercado
            </Text>
          </View>
        </View>
      </SafeAreaViewContainer>
    );
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
