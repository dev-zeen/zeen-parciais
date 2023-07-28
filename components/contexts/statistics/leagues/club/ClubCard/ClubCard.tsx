import { memo, useCallback } from "react";
import { Image, TouchableOpacity } from "react-native";

import { useRouter } from "expo-router";

import { MARKET_STATUS_NAME } from "@/constants/Market";

import { League } from "@/models/Leagues";
import { MarketStatus } from "@/models/Market";

import { ClubByLeague } from "@/app/(tabs)/statistics/league/[id]";
import { Text, View } from "@/components/Themed";
import theme from "@/styles/theme";
import { numberToString } from "@/utils/parseTo";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ClubCardProps {
  club: ClubByLeague;
  league: League;
  orderBy: string;
  position: number;
  firstPlaceScore: number;
  marketStatus: MarketStatus;
  marketIsClosed: boolean;
}

export const ClubCard: React.FC<ClubCardProps> = memo(
  ({
    league,
    club,
    orderBy,
    position,
    firstPlaceScore,
    marketStatus,
    marketIsClosed,
  }) => {
    const router = useRouter();

    const isOrderByPatrimonio = orderBy === "patrimonio";
    const patrimony = numberToString(club.patrimonio);

    const score = isOrderByPatrimonio
      ? patrimony
      : numberToString((club.pontos as any)[orderBy]);

    const diffScore =
      firstPlaceScore && orderBy !== "patrimonio"
        ? (club.pontos as any)[orderBy] - firstPlaceScore
        : 0;

    const renderVariationIcon = useCallback((variation: number) => {
      const iconName = variation > 0 ? "arrow-up" : "arrow-down";
      const iconColor = variation > 0 ? "#4ade80" : "#f87171";
      return (
        <MaterialCommunityIcons
          name={variation === 0 ? "equal" : iconName}
          color={variation === 0 ? theme.Tokens.COLORS.GRAY_300 : iconColor}
          size={14}
        />
      );
    }, []);

    const onPressHandler = useCallback(() => {
      router.push(`/stats/league/club/${club.time_id}`);
    }, []);

    const myTeam = league?.time_usuario.time_id === club.time_id;

    return (
      <View
        key={club?.time_id}
        className={`rounded-lg p-2 justify-center mx-1 ${
          myTeam && "border-2 border-blue-400"
        }`}
      >
        <TouchableOpacity
          activeOpacity={0.4}
          onPress={() => router.push(`/stats/league/club/${club.time_id}`)}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-x-1">
              <View className="items-center justify-center gap-x-0.5 w-8">
                <Text className="text-sm font-semibold">{position}</Text>

                {marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO &&
                  orderBy !== "rodada" && (
                    <View className="flex-row items-center">
                      {renderVariationIcon((club.variacao as any)[orderBy])}
                      <Text className="text-xs">
                        {(club.variacao as any)[orderBy]
                          ? (club.variacao as any)[orderBy]
                          : ""}
                      </Text>
                    </View>
                  )}
              </View>
              <Image
                source={{
                  uri: club.url_escudo_png,
                }}
                className="w-8 h-8"
                alt={`Imagem do time do ${club.nome_cartola}`}
              />

              <View>
                <Text numberOfLines={1} className="text-sm font-semibold">
                  {club.nome}
                </Text>
                <View className="flex-row items-center gap-x-1">
                  <Text className="text-xs font-light capitalize">
                    {club.nome_cartola}
                  </Text>
                  <View className="rounded-full h-1 w-1 bg-gray-400"></View>
                  <Text className="text-xs font-light">C$ {patrimony}</Text>
                </View>
              </View>
            </View>
            <View>
              <View className="items-end ">
                <View className="flex-row gap-x-2">
                  <Text className="text-sm font-semibold">{score}</Text>
                </View>

                <View>
                  {!isOrderByPatrimonio ? (
                    <View className="flex-row">
                      <Text className="text-xs font-light">
                        {marketIsClosed
                          ? `${club.playersHavePlayed}/12`
                          : numberToString(diffScore)}
                      </Text>
                    </View>
                  ) : (
                    <></>
                  )}
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
);
