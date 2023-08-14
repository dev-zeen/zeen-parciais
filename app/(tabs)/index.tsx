import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  useColorScheme,
} from "react-native";

import { useRouter } from "expo-router";

import { Text, TouchableOpacity, View } from "@/components/Themed";
import { MaintenanceMarket } from "@/components/contexts/utils/MaintenanceMarket";
import { MarketStatusCard } from "@/components/contexts/utils/MarketStatusCard";
import { TeamBanner } from "@/components/contexts/utils/TeamBanner";
import { TopPlayerCard } from "@/components/contexts/utils/TopPlayerCard";
import { Loading } from "@/components/structure/Loading";
import { Login } from "@/components/structure/Login";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { ITabs, Tabs } from "@/components/structure/Tabs";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { AuthContext } from "@/contexts/Auth.context";
import { FullClubInfo } from "@/models/Club";
import { FullPlayer, IPositions, PlayerStats } from "@/models/Stats";
import { useGetMyClub } from "@/queries/club.query";
import { useGetMarketStatus } from "@/queries/market.query";
import {
  useGetBestCaptainPlayers,
  useGetPositions,
  useGetTopPlayers,
} from "@/queries/players.query";
import { useGetScoredPlayers } from "@/queries/stats.query";
import theme from "@/styles/theme";
import { numberToString } from "@/utils/parseTo";
import {
  onCalculatePartialScore,
  onGetPlayersHaveAlreadyPlayed,
} from "@/utils/partials";

export default () => {
  const router = useRouter();

  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const [hasHighlights, setHighlights] = useState(false);

  const [playersHaveAlreadyPlayed, setPlayersHaveAlreadyPlayed] = useState(0);

  const {
    data: marketStatus,
    isLoading: IsLoadingMarketStatus,
    refetch: onRefetchMarketStatus,
  } = useGetMarketStatus();

  const isMarketClose =
    marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const allowRequests =
    isAutheticated &&
    marketStatus &&
    marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO;

  const {
    data: club,
    refetch: onRefetchClub,
    isRefetching: isRefetchingClub,
  } = useGetMyClub(allowRequests);

  const { data: playerStats, refetch: onRefetchStats } =
    useGetScoredPlayers(isMarketClose);

  const { data: topPlayers, refetch: onRefetchTopPlayers } = useGetTopPlayers();

  const { data: bestPlayers, refetch: onRefetchBestPlayers } =
    useGetBestCaptainPlayers(hasHighlights);

  const { data: positions, refetch: onRefetchPositions } = useGetPositions();

  const myPartialPoints = onCalculatePartialScore(
    club?.atletas as FullPlayer[],
    club?.capitao_id as number,
    playerStats
  );

  const teamCapitain =
    club && club.atletas.find((item) => item.atleta_id === club.capitao_id);

  const onRefetch = useCallback(async () => {
    club && (await onRefetchClub());
    topPlayers && topPlayers?.length > 0 && (await onRefetchBestPlayers());
    await onRefetchMarketStatus();
    await onRefetchTopPlayers();
    await onRefetchPositions();
    await onRefetchStats();
  }, [
    onRefetchClub,
    onRefetchMarketStatus,
    onRefetchTopPlayers,
    onRefetchBestPlayers,
    onRefetchStats,
    onRefetchPositions,
    topPlayers,
  ]);

  useEffect(() => {
    if (topPlayers && topPlayers?.length > 0) setHighlights(true);
  }, [topPlayers]);

  useEffect(() => {
    if (club && playerStats) {
      const countPlayersPlayed = onGetPlayersHaveAlreadyPlayed(
        club as FullClubInfo,
        playerStats as PlayerStats
      );
      setPlayersHaveAlreadyPlayed(countPlayersPlayed);
    }
  }, [club, playerStats]);

  const playersTabs: ITabs[] = useMemo(
    () => [
      {
        id: 1,
        title: "Titulares",
        content: () => {
          return (
            <View className="mt-1">
              {topPlayers?.map((item) => {
                return (
                  <TopPlayerCard key={item.Atleta.atleta_id} player={item} />
                );
              })}
            </View>
          );
        },
      },

      {
        id: 2,
        title: "Capitão",
        content: () => {
          return (
            <View className="mt-1">
              {bestPlayers?.capitaes?.map((item) => {
                return (
                  <TopPlayerCard key={item.Atleta.atleta_id} player={item} />
                );
              })}
            </View>
          );
        },
      },
      {
        id: 3,
        title: "Reservas",
        content: () => {
          return (
            <View className="mt-1">
              {bestPlayers?.reservas?.map((item) => {
                return (
                  <TopPlayerCard key={item.Atleta.atleta_id} player={item} />
                );
              })}
            </View>
          );
        },
      },
    ],
    [topPlayers, bestPlayers]
  );

  const onPressHandler = useCallback(() => {
    router.push(`/profile/${club?.time.time_id}`);
  }, []);

  const isLoading = isAutheticated
    ? IsLoadingMarketStatus || !positions || IsLoadingMarketStatus || !club
    : IsLoadingMarketStatus;

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
          <RefreshControl onRefresh={onRefetch} refreshing={isRefetchingClub} />
        }
        className={`rounded-lg ${
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
            paddingBottom: 8,
          }}
        >
          <MarketStatusCard />
          {club ? (
            <>
              <TouchableOpacity
                className="flex-1 rounded-lg"
                activeOpacity={0.6}
                onPress={onPressHandler}
              >
                <TeamBanner team={club} />
              </TouchableOpacity>
              {!isMarketClose ? (
                <View className="flex-row justify-around items-center rounded-lg py-2">
                  <View className="justify-center items-center gap-1">
                    <Text className="font-light text-xs">Patrim.</Text>
                    <Text className="font-bold text-sm">
                      {numberToString(club?.patrimonio)}
                    </Text>

                    <Text
                      className={`text-sm font-semibold ${
                        club?.variacao_patrimonio > 0
                          ? "text-green-500"
                          : "text-folly"
                      } `}
                    >
                      {numberToString(club?.variacao_patrimonio)}
                    </Text>
                  </View>

                  <View className="justify-center items-center gap-1">
                    <Text className="font-light text-xs">Ult. Rodada</Text>

                    <Text className="font-bold text-sm">
                      {numberToString(club?.pontos)}
                    </Text>

                    <Text
                      className={`text-sm font-semibold ${
                        club?.variacao_pontos > 0
                          ? "text-green-500"
                          : "text-folly"
                      } `}
                    >
                      {numberToString(club?.variacao_pontos)}
                    </Text>
                  </View>

                  <View className="justify-center items-center gap-1">
                    <Text className="font-light text-xs">
                      {isMarketClose ? "Total Parcial" : "Total"}
                    </Text>
                    <Text className="font-bold text-sm">
                      {numberToString(club?.pontos_campeonato)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View
                  className={`flex-row justify-between items-center gap-2 ${
                    colorTheme === "dark" ? `bg-dark` : "bg-light"
                  }`}
                >
                  <View className="flex-1 rounded-lg px-2 py-4 items-center justify-center">
                    <Text className="font-semibold text-xs">Parcial</Text>
                    <Text className="font-bold text-lg text-green-500">
                      {numberToString(myPartialPoints)}
                    </Text>
                  </View>
                  <View className="flex-1 rounded-lg px-2 py-4 items-center justify-center">
                    <Text className="font-semibold text-xs">Total</Text>

                    <Text className="font-bold text-lg text-green-500">
                      {numberToString(
                        club?.pontos_campeonato + myPartialPoints
                      )}
                    </Text>
                  </View>
                  <View className="flex-1 rounded-lg px-2 py-4 items-center justify-center">
                    <Text className="font-semibold text-xs">Pontuados</Text>

                    <Text className="font-bold text-lg text-green-500">
                      {`${playersHaveAlreadyPlayed || "0"}/12`}
                    </Text>
                  </View>
                </View>
              )}

              <View className="p-2 rounded-lg">
                <Text className="text-base font-semibold mt-0.5 mx-1 mb-2">
                  Meu Capitão
                </Text>
                <View className="flex-row py-2 gap-x-1">
                  <Image
                    source={{
                      uri: teamCapitain?.foto.replace("FORMATO", "220x220"),
                    }}
                    className="w-14 h-14 rounded-full"
                    alt={`Foto do ${teamCapitain?.apelido}`}
                  />

                  <View className=" flex-1 flex-row items-center justify-between">
                    <View>
                      <Text className="text-sm font-semibold">
                        {teamCapitain?.apelido}
                      </Text>

                      <View className="flex-row items-center">
                        <Text className="text-xs font-light uppercase">
                          {
                            (positions as IPositions)[
                              teamCapitain?.posicao_id as number
                            ].nome
                          }
                        </Text>
                      </View>
                    </View>

                    {isMarketClose &&
                    teamCapitain &&
                    playerStats &&
                    playerStats.atletas[teamCapitain?.atleta_id] ? (
                      <View className="items-center flex-row gap-x-2">
                        <View className="flex-row items-center">
                          <Text className="text-sm font-bold">
                            {numberToString(
                              playerStats.atletas[teamCapitain?.atleta_id]
                                ?.pontuacao
                            )}
                          </Text>
                          <Text className="text-xs font-semibold"> * 1.5</Text>
                        </View>

                        <Text
                          className={`text-sm font-bold ${
                            playerStats?.atletas[teamCapitain?.atleta_id]
                              ?.pontuacao *
                              1.5 >
                            0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {numberToString(
                            playerStats?.atletas[teamCapitain?.atleta_id]
                              ?.pontuacao * 1.5
                          )}
                        </Text>
                      </View>
                    ) : (
                      <></>
                    )}
                  </View>
                </View>
              </View>
            </>
          ) : (
            <Login />
          )}
          {topPlayers && bestPlayers && (
            <View className="rounded-lg p-2 flex-1">
              <Text className="text-base font-semibold mt-0.5 mx-1 mb-2">
                Mais Escalados
              </Text>
              <Tabs tabs={playersTabs} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
};
