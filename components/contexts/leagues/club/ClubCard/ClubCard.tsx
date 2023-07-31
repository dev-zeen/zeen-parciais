import { memo, useCallback } from "react";
import { Image, TouchableOpacity } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { ClubByLeague } from "@/app/(tabs)/leagues/[id]";
import { Text, View } from "@/components/Themed";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { League } from "@/models/Leagues";
import { MarketStatus } from "@/models/Market";
import theme from "@/styles/theme";
import { numberToString } from "@/utils/parseTo";

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
      router.push(`/leagues/club/${club.time_id}`);
    }, []);

    const myTeam = league?.time_usuario.time_id === club.time_id;

    return (
      <View
        key={club?.time_id}
        className={`rounded-lg p-4 justify-center ${myTeam && "bg-blue-400"}`}
      >
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={onPressHandler}
          className={`
          ${myTeam && "bg-blue-400"}
        `}
        >
          <View
            className={`flex-row justify-between items-center ${
              myTeam && "bg-blue-400"
            }`}
          >
            <View
              className={`flex-row items-center gap-x-1 ${
                myTeam && "bg-blue-400"
              }`}
            >
              <View
                className={`items-center justify-center gap-x-0.5 w-8 ${
                  myTeam && "bg-blue-400"
                }`}
              >
                <Text className="text-sm font-semibold">{position}</Text>

                {marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO &&
                  orderBy !== "rodada" && (
                    <View
                      className={`flex-row items-center ${
                        myTeam && "bg-blue-400"
                      }`}
                    >
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
                <Text
                  numberOfLines={1}
                  className={`text-sm font-semibold ${myTeam && "bg-blue-400"}`}
                >
                  {club.nome}
                </Text>
                <View
                  className={`flex-row items-center gap-x-1 ${
                    myTeam && "bg-blue-400"
                  }`}
                >
                  <Text className="text-xs capitalize">
                    {club.nome_cartola}
                  </Text>
                  <View className="rounded-full h-1 w-1 bg-gray-300" />
                  <Text className="text-xs">C$ {patrimony}</Text>
                </View>
              </View>
            </View>

            <View className={`items-end ${myTeam && "bg-blue-400"}`}>
              <View className={`flex-row gap-x-2 ${myTeam && "bg-blue-400"}`}>
                <Text className="text-sm font-semibold">{score}</Text>
              </View>

              {!isOrderByPatrimonio && (
                <View className={`flex-row ${myTeam && "bg-blue-400"}`}>
                  <Text className="text-xs">
                    {marketIsClosed
                      ? club.playersHavePlayed && `${club.playersHavePlayed}/12`
                      : diffScore < 0 && numberToString(diffScore)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
);
