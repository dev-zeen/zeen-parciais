import { useCallback, useContext, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams } from "expo-router";

import { Text, View } from "@/components/Themed";
import { ClubPlayerCard } from "@/components/contexts/leagues/club/ClubPlayerCard";
import { TeamBanner } from "@/components/contexts/utils/TeamBanner";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { APPRECIATIONS } from "@/constants/Keys";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { AuthContext } from "@/contexts/Auth.context";
import { MarketStatus } from "@/models/Market";
import { Appreciations } from "@/models/Player";
import { FullPlayer } from "@/models/Stats";
import { useGetClub, useGetMatchSubstitutions } from "@/queries/club.query";
import { useGetMarketStatus } from "@/queries/market.query";
import { useGetAppreciations } from "@/queries/players.query";
import { useGetScoredPlayers } from "@/queries/stats.query";
import { onGetFromStorage } from "@/utils/asyncStorage";
import { numberToString } from "@/utils/parseTo";
import {
  onCalculatePartialScore,
  onUpdateTeamWithSubstitutedPlayers,
} from "@/utils/partials";

const TYPE_VIEW = {
  CAMPO: "CAMPO",
  LISTA: "LISTA",
};

export interface PlayerClub extends FullPlayer {
  isReplaced?: boolean;
  isJoined?: boolean;
}

export default () => {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { id } = useLocalSearchParams();

  const { data: marketStatus } = useGetMarketStatus();

  const typeViewDefault = TYPE_VIEW.LISTA;

  const isMarketClose =
    marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const {
    data: playerStats,
    isRefetching: isRefetchingPlayerStats,
    refetch: onRefetchStats,
  } = useGetScoredPlayers(isMarketClose);

  const {
    data: appreciations,
    refetch: onRefetchAppreciations,
    isRefetching: isRefetchingAppreciations,
  } = useGetAppreciations(isAutheticated);

  const [currentAppreciations, setCurrentAppreciations] =
    useState<Appreciations>();
  const [currentRound, setCurrentRound] = useState(0);
  const [reservePlayers, setReservePlayers] = useState<
    FullPlayer[] | PlayerClub[]
  >();
  const [startingPlayers, setStartingPlayers] = useState<
    FullPlayer[] | PlayerClub[]
  >();

  const [clubAppreciation, setClubAppreciation] = useState(0);

  const { data: club } = useGetClub(id as string, currentRound);

  const { data: substitutions } = useGetMatchSubstitutions({
    id: club?.time.time_id,
    round: currentRound,
    requestWithRound: true,
  });

  const scoreCurrentRound = onCalculatePartialScore(
    startingPlayers as FullPlayer[],
    club?.capitao_id as number,
    playerStats
  )
    ? numberToString(
        onCalculatePartialScore(
          startingPlayers as FullPlayer[],
          club?.capitao_id as number,
          playerStats
        )
      )
    : 0;

  useEffect(() => {
    if (currentRound === marketStatus?.rodada_atual && isMarketClose) {
      const currentSum = club?.atletas.reduce((acc, current) => {
        if (appreciations?.atletas[current.atleta_id]?.variacao_num) {
          return (acc +=
            appreciations?.atletas[current.atleta_id]?.variacao_num);
        }
        return acc;
      }, 0);

      setClubAppreciation(currentSum as number);
    }
  }, [appreciations, marketStatus, currentRound, club]);

  useEffect(() => {
    onGetFromStorage<Appreciations>(APPRECIATIONS).then((res) => {
      if (res) {
        setCurrentAppreciations(res);
      }
    });

    return () => {
      setCurrentAppreciations(undefined);
    };
  }, [appreciations]);

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
        isMarketClose
          ? marketStatus.rodada_atual
          : marketStatus.rodada_atual - 1
      );
  }, [marketStatus]);

  const onRefetch = useCallback(() => {
    Promise.all([onRefetchStats(), onRefetchAppreciations()]);
  }, []);

  const isRefetching = isRefetchingPlayerStats || isRefetchingAppreciations;

  const renderItem = useCallback(
    (player: PlayerClub, isReserve?: boolean) => {
      return (
        <ClubPlayerCard
          key={player.atleta_id}
          player={player}
          isCapitain={club?.capitao_id === player.atleta_id}
          currentRound={currentRound}
          marketStatus={marketStatus as MarketStatus}
          playerStats={playerStats}
          isReserve={isReserve}
          appreciation={
            currentAppreciations?.atletas[player.atleta_id]?.variacao_num
          }
        />
      );
    },
    [currentRound, playerStats, marketStatus, club, currentAppreciations]
  );

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;

  if (!club || !playerStats || !marketStatus) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />
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
          <TeamBanner team={club} />

          <View className="flex-row justify-between items-center rounded-lg p-3">
            <View className="justify-center items-center gap-1">
              <Text className="font-light text-xs">Patrim.</Text>
              <View className="flex-row">
                <Text className="font-semibold text-sm">
                  {isMarketClose && currentRound === marketStatus?.rodada_atual
                    ? numberToString(club.patrimonio + clubAppreciation)
                    : numberToString(club.patrimonio)}
                </Text>
                {isMarketClose &&
                  currentRound === marketStatus?.rodada_atual && (
                    <View className="flex-row pl-2 justify-center items-center">
                      <Text className="font-semibold text-sm">
                        {numberToString(clubAppreciation)}
                      </Text>

                      <Feather
                        size={16}
                        name={
                          clubAppreciation && clubAppreciation < 0
                            ? "arrow-down"
                            : "arrow-up"
                        }
                        color={
                          clubAppreciation && clubAppreciation < 0
                            ? "#ef4444"
                            : "#4ade80"
                        }
                      />
                    </View>
                  )}
              </View>
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
                      playerStats
                    )
                    ? numberToString(
                        (onCalculatePartialScore(
                          startingPlayers as FullPlayer[],
                          club.capitao_id,
                          playerStats
                        ) as number) + club.pontos_campeonato
                      )
                    : 0
                  : numberToString(club.pontos_campeonato)}
              </Text>
            </View>
          </View>

          <View
            className="rounded-lg p-2 flex-row items-center justify-center"
            style={{
              gap: 8,
            }}
          >
            <TouchableOpacity
              className={`p-2 items-center justify-center mx-1 rounded-full ${
                currentRound === 1 ? "bg-gray-100" : "bg-blue-50"
              }`}
              disabled={currentRound === 1}
              onPress={() => setCurrentRound((previous) => previous - 1)}
            >
              <Feather
                name="chevron-left"
                size={24}
                color={currentRound === 1 ? "#d1d5db" : "#3b82f6"}
              />
            </TouchableOpacity>

            <Text className="font-semibold">Rodada {currentRound}</Text>

            <TouchableOpacity
              className={`p-2 items-center justify-center mx-1 rounded-full ${
                currentRound === marketStatus?.rodada_atual
                  ? "bg-gray-100"
                  : "bg-blue-50"
              }`}
              disabled={
                isMarketClose
                  ? currentRound === marketStatus?.rodada_atual
                  : currentRound === (marketStatus?.rodada_atual as number) - 1
              }
              onPress={() => setCurrentRound((previous) => previous + 1)}
            >
              <Feather
                name="chevron-right"
                size={24}
                color={
                  isMarketClose
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

        {typeViewDefault === TYPE_VIEW.CAMPO && <View></View>}

        {typeViewDefault === TYPE_VIEW.LISTA && (
          <View
            className={`justify-center rounded-lg mx-2 ${
              colorTheme === "dark" ? `bg-dark` : "bg-light"
            }`}
            style={{
              gap: 8,
            }}
          >
            <View className="rounded-lg py-2">
              <Text className="font-semibold text-center text-lg">
                Titulares
              </Text>
              {startingPlayers?.map((player) => renderItem(player))}
            </View>

            <View className="rounded-lg py-2 mb-2">
              <Text className="font-semibold text-center text-lg">
                Reservas
              </Text>
              {reservePlayers?.map((player) => renderItem(player, true))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaViewContainer>
  );
};
