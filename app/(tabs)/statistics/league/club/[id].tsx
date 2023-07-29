import { useCallback, useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { Loading } from "@/components/structure/Loading";
import { FullPlayer } from "@/models/Stats";
import { useGetClub, useGetMatchSubstitutions } from "@/queries/club";
import { useGetPositions } from "@/queries/players";
import { useLocalSearchParams, useRouter } from "expo-router";

import cartolaProImage from "@/assets/images/pro.png";
import { Text, View } from "@/components/Themed";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { useGetMarket, useGetMarketStatus } from "@/queries/market";
import { useGetScoredPlayers } from "@/queries/stats";
import { numberToString } from "@/utils/parseTo";
import {
  onCalculatePartialScore,
  onUpdateTeamWithSubstitutedPlayers,
} from "@/utils/partials";
import { Feather } from "@expo/vector-icons";

interface PlayerClub extends FullPlayer {
  isReplaced?: boolean;
  isJoined?: boolean;
}

export default () => {
  const colorTheme = useColorScheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [currentRound, setCurrentRound] = useState(0);
  const [reservePlayers, setReservePlayers] = useState<
    FullPlayer[] | PlayerClub[]
  >();
  const [startingPlayers, setStartingPlayers] = useState<
    FullPlayer[] | PlayerClub[]
  >();

  const { data: market } = useGetMarket();
  const { data: marketStatus } = useGetMarketStatus();

  const marketIsClosed =
    marketStatus?.status_mercado === MARKET_STATUS_NAME.FECHADO;

  const {
    data: playersStats,
    isRefetching: isRefetchingPlayersStats,
    refetch: onRefetchStats,
  } = useGetScoredPlayers();

  const { data: club } = useGetClub(id as string, currentRound);
  const { data: positions } = useGetPositions();
  const { data: substitutions } = useGetMatchSubstitutions({
    id: club?.time.time_id,
    round: currentRound,
    requestWithRound: true,
  });

  const scoreCurrentRound = onCalculatePartialScore(
    startingPlayers as FullPlayer[],
    club?.capitao_id as number,
    playersStats
  )
    ? numberToString(
        onCalculatePartialScore(
          startingPlayers as FullPlayer[],
          club?.capitao_id as number,
          playersStats
        )
      )
    : 0;

  useEffect(() => {
    if (club && substitutions && substitutions?.length > 0) {
      const { playersUpdated, reservesUpdated } =
        onUpdateTeamWithSubstitutedPlayers(club, substitutions);
      setStartingPlayers(playersUpdated);
      setReservePlayers(reservesUpdated);
    } else {
      if (club?.atletas) setStartingPlayers(club.atletas);
      if (club?.reservas) setReservePlayers(club.reservas);
    }
  }, [club, substitutions]);

  useEffect(() => {
    if (marketStatus)
      setCurrentRound(
        marketIsClosed
          ? marketStatus.rodada_atual
          : marketStatus.rodada_atual - 1
      );
  }, [marketStatus]);

  const scorePlayer = useCallback(
    (player: FullPlayer) => {
      const scoreWithCurrentRound =
        currentRound === marketStatus?.rodada_atual &&
        playersStats &&
        playersStats?.atletas[player.atleta_id]
          ? playersStats?.atletas[player.atleta_id]?.pontuacao
          : -1000;

      const scoreRound = player.pontos_num;

      const score =
        marketIsClosed && currentRound === marketStatus?.rodada_atual
          ? scoreWithCurrentRound
          : scoreRound;

      return score;
    },
    [currentRound]
  );

  const renderItem = useCallback(
    (player: PlayerClub, isReserve?: boolean) => {
      return (
        <View
          className={`rounded-lg mx-2 p-2 
          border-b border-gray-200
          ${(player.isReplaced || isReserve) && "opacity-50"}
          ${player.isJoined && "opacity-100"}
          `}
          key={player.atleta_id}
        >
          <TouchableOpacity
            className="justify-between flex-row"
            activeOpacity={0.4}
            onPress={() =>
              router.push(`/statistics/player/${player.atleta_id}`)
            }
          >
            <View className="flex-row gap-x-2 items-center">
              <View className="justify-center items-center px-1 gap-y-1">
                <Image
                  source={{
                    uri: market?.clubes[player.clube_id]?.escudos?.["45x45"],
                  }}
                  className="w-6 h-6"
                  alt={`Imagem do time do escudo do ${
                    market?.clubes[player.clube_id]?.nome
                  }`}
                />

                <Text className="text-sm font-medium">
                  {market?.clubes[player.clube_id]?.abreviacao}
                </Text>
              </View>

              <View className="justify-center items-center">
                <Image
                  source={{
                    uri: player.foto.replace("FORMATO", "220x220"),
                  }}
                  className="w-12 h-12"
                  alt={`Imagem do ${player.nome}`}
                />
              </View>

              <View>
                <Text className="text-sm font-semibold">{player.apelido}</Text>
                <View className="flex-row items-center gap-x-1">
                  <Text className="text-xs font-light capitalize">
                    {positions?.[player.posicao_id].nome}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-x-2 items-center">
              <Text
                className={`font-semibold text-sm  ${
                  scorePlayer(player) > 0
                    ? "text-green-500"
                    : scorePlayer(player) === -1000
                    ? "text-gray-500"
                    : "text-red-500"
                }`}
              >
                {scorePlayer(player) === -1000
                  ? "-"
                  : numberToString(scorePlayer(player))}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    },
    [positions, club, market, startingPlayers, reservePlayers]
  );

  if (!club) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={onRefetchStats}
            refreshing={isRefetchingPlayersStats}
          />
        }
      >
        <View
          className={`p-2 rounded-lg ${
            colorTheme === "dark" ? `bg-dark` : "bg-light"
          }`}
          style={{
            gap: 8,
          }}
        >
          <View className="flex-row justify-between items-center rounded-lg p-3">
            <View className="flex-row items-center">
              <Image
                source={{
                  uri: club?.time.url_escudo_png,
                }}
                className="w-14 h-14"
                alt={`Escudo do ${club?.time.nome}`}
              />

              <View className="gap-1">
                {club.time.assinante && (
                  <Image
                    source={cartolaProImage}
                    className="w-10 h-5"
                    alt={`Selo PRO do cartola para quem é assinante`}
                  />
                )}
                <Text className="font-semibold text-sm">{club?.time.nome}</Text>
                <Text className="font-light text-xs capitalize">
                  {club?.time.nome_cartola}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between items-center rounded-lg p-3">
            <View className="justify-center items-center gap-1">
              <Text className="font-light text-xs">Patrim.</Text>
              <Text className="font-semibold text-sm">
                {numberToString(club.patrimonio)}
              </Text>
            </View>

            <View className="justify-center items-center gap-1">
              <Text className="font-light text-xs">Pontuação</Text>

              <Text
                className={`font-semibold text-sm ${
                  currentRound === marketStatus?.rodada_atual &&
                  "text-green-500"
                }`}
              >
                {currentRound === marketStatus?.rodada_atual
                  ? scoreCurrentRound
                  : numberToString(club.pontos)}
              </Text>
            </View>

            <View className="justify-center items-center gap-1">
              <Text className="font-light text-xs">Total</Text>
              <Text
                className={`font-semibold text-sm ${
                  currentRound === marketStatus?.rodada_atual &&
                  "text-green-500"
                }`}
              >
                {" "}
                {currentRound === marketStatus?.rodada_atual
                  ? onCalculatePartialScore(
                      startingPlayers as FullPlayer[],
                      club.capitao_id,
                      playersStats
                    )
                    ? numberToString(
                        (onCalculatePartialScore(
                          startingPlayers as FullPlayer[],
                          club.capitao_id,
                          playersStats
                        ) as number) + club.pontos_campeonato
                      )
                    : 0
                  : numberToString(club.pontos_campeonato)}
              </Text>
            </View>
          </View>

          <View className="rounded-lg p-2 flex-row items-center justify-center">
            <TouchableOpacity
              disabled={currentRound === 1}
              onPress={() => setCurrentRound((previous) => previous - 1)}
            >
              <Feather
                name="chevron-left"
                size={36}
                color={currentRound === 1 ? "#d1d5db" : "#3b82f6"}
              />
            </TouchableOpacity>

            <Text className="font-semibold">Rodada {currentRound}</Text>

            <TouchableOpacity
              disabled={
                marketIsClosed
                  ? currentRound === marketStatus?.rodada_atual
                  : currentRound === (marketStatus?.rodada_atual as number) - 1
              }
              onPress={() => setCurrentRound((previous) => previous + 1)}
            >
              <Feather
                name="chevron-right"
                size={36}
                color={
                  marketIsClosed
                    ? currentRound === marketStatus?.rodada_atual
                      ? "#d1d5db"
                      : "#3b82f6"
                    : currentRound ===
                      (marketStatus?.rodada_atual as number) - 1
                    ? "#d1d5db"
                    : "#3b82f6"
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          className={`justify-center rounded-lg mx-2 ${
            colorTheme === "dark" ? `bg-dark` : "bg-light"
          }`}
          style={{
            gap: 8,
          }}
        >
          <View className="rounded-lg py-2">
            <Text className="font-semibold text-center text-lg">Titulares</Text>
            {startingPlayers?.map((player) => renderItem(player))}
          </View>

          <View className="rounded-lg py-2 mb-2">
            <Text className="font-semibold text-center text-lg">Reservas</Text>
            {reservePlayers?.map((player) => renderItem(player, true))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
};
