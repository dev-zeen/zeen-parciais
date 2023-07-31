import { useCallback } from "react";
import { Image, useColorScheme } from "react-native";

import { useRouter } from "expo-router";

import { PlayerClub } from "@/app/(tabs)/leagues/club/[id]";
import { Text, TouchableOpacity, View } from "@/components/Themed";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { MarketStatus } from "@/models/Market";
import { FullPlayer, PlayerStats } from "@/models/Stats";
import { useGetMarket } from "@/queries/market.query";
import { useGetPositions } from "@/queries/players.query";
import { numberToString } from "@/utils/parseTo";

type ClubPlayerCardProps = {
  player: PlayerClub;
  currentRound: number;
  marketStatus: MarketStatus;
  playerStats?: PlayerStats;
  isReserve?: boolean;
};

export function ClubPlayerCard({
  player,
  playerStats,
  currentRound,
  marketStatus,
  isReserve,
}: ClubPlayerCardProps) {
  const router = useRouter();
  const colorTheme = useColorScheme();

  const { data: market } = useGetMarket();
  const { data: positions } = useGetPositions();

  const marketIsClosed =
    marketStatus?.status_mercado === MARKET_STATUS_NAME.FECHADO;

  const scorePlayer = useCallback(
    (player: FullPlayer) => {
      const scoreWithCurrentRound =
        currentRound === marketStatus?.rodada_atual &&
        playerStats &&
        playerStats?.atletas[player.atleta_id]
          ? playerStats?.atletas[player.atleta_id]?.pontuacao
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

  return (
    <View
      className={`rounded-lg mx-2 p-2 
          border-b ${
            colorTheme === "dark" ? "border-gray-200" : "border-gray-200"
          }
          ${(player.isReplaced || isReserve) && "opacity-50"}
          ${player.isJoined && "opacity-100"}
          `}
    >
      <TouchableOpacity
        className="justify-between flex-row"
        activeOpacity={0.6}
        onPress={() => router.push(`/leagues/player/${player.atleta_id}`)}
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
                ? ""
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
}
