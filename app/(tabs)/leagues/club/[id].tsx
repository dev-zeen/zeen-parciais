import { useCallback, useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

import cartolaProImage from "@/assets/images/pro.png";
import { Text, View } from "@/components/Themed";
import { ClubPlayerCard } from "@/components/contexts/leagues/club/ClubPlayerCard";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { MarketStatus } from "@/models/Market";
import { FullPlayer } from "@/models/Stats";
import { useGetClub, useGetMatchSubstitutions } from "@/queries/club";
import { useGetMarketStatus } from "@/queries/market";
import { useGetScoredPlayers } from "@/queries/stats";
import { numberToString } from "@/utils/parseTo";
import {
  onCalculatePartialScore,
  onUpdateTeamWithSubstitutedPlayers,
} from "@/utils/partials";

export interface PlayerClub extends FullPlayer {
  isReplaced?: boolean;
  isJoined?: boolean;
}

export default () => {
  const colorTheme = useColorScheme();
  const { id } = useLocalSearchParams();

  const [currentRound, setCurrentRound] = useState(0);
  const [reservePlayers, setReservePlayers] = useState<
    FullPlayer[] | PlayerClub[]
  >();
  const [startingPlayers, setStartingPlayers] = useState<
    FullPlayer[] | PlayerClub[]
  >();

  const { data: marketStatus } = useGetMarketStatus();

  const marketIsClosed =
    marketStatus?.status_mercado === MARKET_STATUS_NAME.FECHADO;

  const {
    data: playersStats,
    isRefetching: isRefetchingPlayersStats,
    refetch: onRefetchStats,
  } = useGetScoredPlayers();

  const { data: club } = useGetClub(id as string, currentRound);
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

  const renderItem = useCallback(
    (player: PlayerClub, isReserve?: boolean) => {
      return (
        <ClubPlayerCard
          key={player.atleta_id}
          player={player}
          currentRound={currentRound}
          marketStatus={marketStatus as MarketStatus}
          playersStats={playersStats}
          isReserve={isReserve}
        />
      );
    },
    [currentRound, playersStats, marketStatus]
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
