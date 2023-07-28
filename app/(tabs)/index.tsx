import { useCallback, useContext, useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  useColorScheme,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Text, TouchableOpacity, View } from "@/components/Themed";
import { ModalAuth } from "@/components/contexts/auth/AuthModal";
import { ModalLogout } from "@/components/contexts/auth/LogoutModal";
import { MarketStatusCard } from "@/components/contexts/utils/MarketStatusCard";
import { TeamBanner } from "@/components/contexts/utils/TeamBanner";
import { TopPlayerCard } from "@/components/contexts/utils/TopPlayerCard";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { ITabs, Tabs } from "@/components/structure/Tabs";
import Colors from "@/constants/Colors";
import { ACCESS_TOKEN_KEY_STORAGE } from "@/constants/Keys";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { AuthContext } from "@/contexts/Auth.context";
import { FullClubInfo } from "@/models/Club";
import { FullPlayer, PlayersStats } from "@/models/Stats";
import { useGetMyClub } from "@/queries/club";
import { useGetMarketStatus } from "@/queries/market";
import {
  useGetBestCaptainPlayers,
  useGetPositions,
  useGetTopPlayers,
} from "@/queries/players";
import { useGetScoredPlayers } from "@/queries/stats";
import theme from "@/styles/theme";
import { numberToString } from "@/utils/parseTo";
import {
  onCalculatePartialScore,
  onGetPlayersHaveAlreadyPlayed,
} from "@/utils/partials";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

export default () => {
  const router = useRouter();

  const colorTheme = useColorScheme();

  const { isAutheticated, handleSuccessAuth } = useContext(AuthContext);

  const [hasHighlights, setHighlights] = useState(false);
  const [showModalAuth, setShowModalAuth] = useState(false);
  const [showModalLogout, setShowModalLogout] = useState(false);
  const [playersHaveAlreadyPlayed, setPlayersHaveAlreadyPlayed] = useState(0);

  const {
    data: club,
    refetch: onRefetchClub,
    isRefetching: isRefetchingClub,
  } = useGetMyClub(isAutheticated);

  const { data: playersStats, refetch: onRefetchStats } = useGetScoredPlayers();

  const {
    data: marketStatus,
    isLoading: IsLoadingMarketStatus,
    refetch: onRefetchMarketStatus,
  } = useGetMarketStatus();

  const { data: topPlayers, refetch: onRefetchTopPlayers } = useGetTopPlayers();

  const { data: bestPlayers, refetch: onRefetchBestPlayers } =
    useGetBestCaptainPlayers(hasHighlights);

  const { data: positions, refetch: onRefetchPositions } = useGetPositions();

  const marketIsClosed =
    marketStatus?.status_mercado === MARKET_STATUS_NAME.FECHADO;

  const myPartialPoints = onCalculatePartialScore(
    club?.atletas as FullPlayer[],
    club?.capitao_id as number,
    playersStats
  );
  const teamCapitain =
    club && club.atletas.find((item) => item.atleta_id === club.capitao_id);

  const handleLogin = useCallback(() => {
    setShowModalAuth(true);
  }, []);

  const onRefetch = useCallback(async () => {
    club && (await onRefetchClub());
    await onRefetchMarketStatus();
    await onRefetchTopPlayers();
    await onRefetchBestPlayers();
    await onRefetchPositions();
    await onRefetchStats();
  }, [
    onRefetchClub,
    onRefetchMarketStatus,
    onRefetchTopPlayers,
    onRefetchBestPlayers,
    onRefetchStats,
    onRefetchPositions,
  ]);

  const { handleUnautenticated } = useContext(AuthContext);

  const { removeItem } = useAsyncStorage(ACCESS_TOKEN_KEY_STORAGE);

  const handleLogout = async () => {
    try {
      await removeItem().then(async (_response) => {
        handleUnautenticated();
      });
    } catch (exception) {
      console.log("exception", exception);
    }
  };

  useEffect(() => {
    if (topPlayers && topPlayers?.length > 0) setHighlights(true);
  }, [topPlayers]);

  useEffect(() => {
    if (club && playersStats) {
      const countPlayersPlayed = onGetPlayersHaveAlreadyPlayed(
        club as FullClubInfo,
        playersStats as PlayersStats
      );
      setPlayersHaveAlreadyPlayed(countPlayersPlayed);
    }
  }, [club, playersStats]);

  const isLoading = IsLoadingMarketStatus;

  const playersTabs: ITabs[] = [
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
  ];

  if (isLoading || !positions) {
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
          }}
        >
          <MarketStatusCard />
          {club ? (
            <>
              <TouchableOpacity
                className="rounded-lg flex-1"
                activeOpacity={0.6}
                onPress={() => router.push(`/profile/${club?.time.time_id}`)}
              >
                <TeamBanner team={club} />
              </TouchableOpacity>
              <View className="flex-row justify-between items-center rounded-lg p-3">
                <View className="justify-center items-center gap-1">
                  <Text className="font-light text-xs">Patrim.</Text>
                  <Text className="font-bold text-sm">
                    {numberToString(club?.patrimonio)}
                  </Text>
                  {marketStatus?.status_mercado ===
                    MARKET_STATUS_NAME.ABERTO && (
                    <Text
                      className={`text-sm font-semibold ${
                        club?.variacao_patrimonio || 0 > 0
                          ? "text-green-500"
                          : "text-folly"
                      } `}
                    >
                      {numberToString(club?.variacao_patrimonio)}
                    </Text>
                  )}
                </View>

                <View className="justify-center items-center gap-1">
                  <Text className="font-light text-xs">
                    {marketIsClosed ? "Parcial" : "Ult. Rodada"}
                  </Text>

                  {marketIsClosed ? (
                    <Text className="font-bold text-sm text-green-500">
                      {numberToString(myPartialPoints)}
                    </Text>
                  ) : (
                    <Text className="font-bold text-sm">
                      {numberToString(club?.pontos)}
                    </Text>
                  )}

                  {marketStatus?.status_mercado ===
                    MARKET_STATUS_NAME.ABERTO && (
                    <Text
                      className={`text-sm font-semibold ${
                        club?.variacao_pontos > 0
                          ? "text-green-500"
                          : "text-folly"
                      } `}
                    >
                      {numberToString(club?.variacao_pontos)}
                    </Text>
                  )}
                </View>

                <View className="justify-center items-center gap-1">
                  <Text className="font-light text-xs">
                    {marketIsClosed ? "Total Parcial" : "Pontuação Total"}
                  </Text>
                  {marketIsClosed && myPartialPoints ? (
                    <Text className="font-bold text-sm text-green-500">
                      {numberToString(
                        club?.pontos_campeonato + myPartialPoints
                      )}
                    </Text>
                  ) : (
                    <Text className="font-bold text-sm">
                      {numberToString(club?.pontos_campeonato)}
                    </Text>
                  )}
                </View>

                {marketStatus?.status_mercado ===
                  MARKET_STATUS_NAME.FECHADO && (
                  <View className="justify-center items-center gap-1">
                    <Text className="font-light text-xs">Pontuados</Text>

                    <Text className="font-bold text-sm ">
                      <Text className="text-sm font-semibold">
                        {playersHaveAlreadyPlayed}/12
                      </Text>
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-1 p-3 rounded-lg">
                <Text className="text-base font-semibold mb-1">
                  {" "}
                  Meu Capitão{" "}
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
                          {positions[teamCapitain?.posicao_id as number].nome}
                        </Text>
                      </View>
                    </View>

                    {marketIsClosed &&
                    teamCapitain &&
                    playersStats &&
                    playersStats.atletas[teamCapitain?.atleta_id] ? (
                      <View className="items-center flex-row gap-x-2">
                        <View className="flex-row items-center">
                          <Text className="text-sm font-bold">
                            {numberToString(
                              playersStats.atletas[teamCapitain?.atleta_id]
                                ?.pontuacao
                            )}
                          </Text>
                          <Text className="text-sm font-light">*1.5</Text>
                        </View>

                        <Text
                          className={`text-sm font-bold ${
                            playersStats?.atletas[teamCapitain?.atleta_id]
                              ?.pontuacao *
                              1.5 >
                            0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {numberToString(
                            playersStats?.atletas[teamCapitain?.atleta_id]
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
            <TouchableOpacity
              activeOpacity={0.6}
              className={`flex-1 flex-row items-center rounded-lg border-2 border-blue-500 px-4 py-2 gap-x-1`}
              onPress={() => handleLogin()}
            >
              <Text className={`font-normal text-xs `}>Conectar time</Text>
              <Feather
                name="log-in"
                size={24}
                color={
                  colorTheme === "dark" ? Colors.dark.tint : Colors.light.tint
                }
              />
            </TouchableOpacity>
          )}
          {topPlayers && bestPlayers && (
            <View className="rounded-lg p-2">
              <Text className="text-base font-semibold"> Mais Escalados </Text>
              <Tabs tabs={playersTabs} />
            </View>
          )}
        </View>
      </ScrollView>
      <ModalAuth
        isVisible={showModalAuth}
        handleLoginSuccess={async () => {
          setShowModalAuth(false);
          handleSuccessAuth();
        }}
        handleCloseModal={() => setShowModalAuth(false)}
      />
      <ModalLogout
        isVisible={showModalLogout}
        handleLogoutSuccess={() => setShowModalLogout(false)}
      />
    </SafeAreaViewContainer>
  );
};

// const { isAutheticated, handleUnautenticated, handleSuccessAuth } =
// useContext(AuthContext);

// const { removeItem } = useAsyncStorage(ACCESS_TOKEN_KEY_STORAGE);

// const handleLogout = async () => {
//   try {
//     await removeItem().then(async (_response) => {
//       handleUnautenticated();
//     });
//   } catch (exception) {
//     console.log("exception", exception);
//   }
// };

// <TouchableOpacity
//   activeOpacity={0.6}
//   className={`justify-center flex-row items-center rounded-lg px-4 py-2 mb-2 mx-auto`}
//   onPress={() => {
//     setShowModalLogout(true);
//     handleLogout();
//   }}
// >
//   <Text className={`font-normal text-xs`}>Sair</Text>
//   <Feather
//     name="log-out"
//     size={24}
//     color={colorTheme === "dark" ? Colors.dark.tint : Colors.light.tint}
//   />
// </TouchableOpacity>;
