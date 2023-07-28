import { memo, useCallback } from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

import { useRouter } from "expo-router";

import { MARKET_STATUS_NAME } from "@/constants/Market";

import { League } from "@/models/Leagues";
import { MarketStatus } from "@/models/Market";

import { Text, View } from "@/components/Themed";
import theme from "@/styles/theme";
import { numberToString } from "@/utils/parseTo";
import { FontAwesome } from "@expo/vector-icons";

interface CardClubProps {
  club: any; // TODO import { ClubByLeague } from '@app/(tabs)/stats/league/[id]';
  league: League;
  orderBy: string;
  position: number;
  firstPlaceScore: number;
  marketStatus: MarketStatus;
  marketIsClosed: boolean;
}

export const CardLeagueClub: React.FC<CardClubProps> = memo(
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
        <FontAwesome
          name="arrow-up" // TODO {variation === 0 ? "equal" : iconName}
          color={variation === 0 ? "gray" : iconColor}
          size={14}
        />
      );
    }, []);

    const onPressHandler = useCallback(() => {
      router.push(`/stats/league/club/${club.time_id}`);
    }, []);

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={onPressHandler}
        style={
          league?.time_usuario.time_id === club.time_id
            ? {
                ...styles.container,
                ...styles.containerMyClub,
              }
            : { ...styles.container, ...styles.containerDefault }
        }
      >
        <View style={styles.clubWrapper}>
          <View style={styles.positionWrapper}>
            <Text style={styles.positionText}>{position}</Text>
            {marketStatus.status_mercado === MARKET_STATUS_NAME.ABERTO &&
              orderBy !== "rodada" && (
                <View style={styles.iconVariantionWrapper}>
                  {renderVariationIcon((club.variacao as any)[orderBy])}
                  <Text style={styles.positionVariationText}>
                    {(club.variacao as any)[orderBy]
                      ? (club.variacao as any)[orderBy]
                      : ""}
                  </Text>
                </View>
              )}
          </View>
          <Image
            source={{ uri: club.url_escudo_png }}
            style={styles.clubImageStyle}
            alt={`Imagem do time do ${club.nome_cartola}`}
          />

          <View style={styles.pointsContainer}>
            <Text style={styles.clubNameText}>{club.nome}</Text>
            <View style={styles.userNameWrapper}>
              <Text style={styles.userNameLText}>{club.nome_cartola}</Text>
              <View
                style={{
                  borderRadius: 9999,
                  width: 4,
                  height: 4,
                  backgroundColor: "gray",
                }}
              />
              <Text style={styles.patrimonyText}>C$ {patrimony}</Text>
            </View>
          </View>
        </View>
        <View style={styles.scoreWrapper}>
          <Text style={styles.scoreText}>{score}</Text>

          {marketIsClosed ? (
            <Text
              style={styles.subtitleScore}
            >{`${club.playersHavePlayed}/12`}</Text>
          ) : (
            diffScore !== 0 && (
              <Text style={styles.subtitleScore}>
                {numberToString(diffScore)}
              </Text>
            )
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: theme.SPACING.xxs,
    borderRadius: theme.SPACING.sm,
    padding: theme.SPACING.sm,
  },
  containerDefault: {
    borderBottomWidth: 1,
    borderColor: theme.COLORS.GRAY_200,
  },
  containerMyClub: {
    borderWidth: 2,
    borderColor: theme.COLORS.PRIMARY,
    backgroundColor: theme.COLORS.BLUE_100,
  },
  clubWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.SPACING.sm,
  },
  positionWrapper: { alignItems: "center", width: theme.SPACING.lg },
  positionText: { fontSize: theme.TEXT.xs, fontWeight: "600" },
  iconVariantionWrapper: { flexDirection: "row", alignItems: "center" },
  positionVariationText: { fontSize: theme.TEXT.xs },
  clubImageStyle: { width: theme.SIZE.sm, height: theme.SIZE.sm },

  pointsContainer: {
    gap: theme.SPACING.xxs,
  },
  clubNameText: { fontSize: theme.TEXT.sm, fontWeight: "600" },
  userNameWrapper: { flexDirection: "row", alignItems: "center", gap: 4 },
  userNameLText: {
    fontSize: theme.TEXT.xs,
    fontWeight: "300",
    textTransform: "capitalize",
  },
  patrimonyText: { fontSize: theme.TEXT.xs, fontWeight: "normal" },

  scoreWrapper: { alignItems: "flex-end", gap: 2 },
  scoreText: { fontSize: theme.TEXT.sm, fontWeight: "600" },
  subtitleScore: {
    fontSize: theme.TEXT.xs,
    fontWeight: "300",
  },
});
