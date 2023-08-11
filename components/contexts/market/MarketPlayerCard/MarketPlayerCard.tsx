import { Image, StyleSheet, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/Themed";
import { OBJECT_STATUS_MARKET_PLAYER } from "@/constants/StatusPlayer";
import { FullPlayer } from "@/models/Stats";
import { useGetMarket } from "@/queries/market.query";
import { useGetPositions } from "@/queries/players.query";
import { numberToString } from "@/utils/parseTo";
import { Feather } from "@expo/vector-icons";

type MarketPlayerCardProps = {
  player: FullPlayer;
  onPressAddPlayerToLineup: (player: FullPlayer) => void;
  onPressRemovePlayerFromLineup: (player: FullPlayer) => void;
  isButtonDisabled: boolean;
  isSellPlayer?: boolean;
};

export function MarketPlayerCard({
  player,
  onPressAddPlayerToLineup,
  onPressRemovePlayerFromLineup,
  isButtonDisabled,
  isSellPlayer,
}: MarketPlayerCardProps) {
  const { data: market } = useGetMarket();
  const { data: positions } = useGetPositions();

  return (
    <View
      className={`rounded-lg flex-row items-center justify-between p-2 mx-2`}
      key={player.atleta_id}
    >
      <View>
        <Image
          source={{
            uri: player.foto.replace("FORMATO", "220x220"),
          }}
          className="w-20 h-20 rounded-3xl mr-2"
          alt={`Imagem do ${player.nome}`}
        />
        <View
          className="flex-row absolute"
          style={{
            top: "70%",
            left: "70%",
            width: 22,
            height: 22,
            borderRadius: 10,
            backgroundColor:
              OBJECT_STATUS_MARKET_PLAYER[player?.status_id]?.background,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Feather
            name={
              OBJECT_STATUS_MARKET_PLAYER[player?.status_id]
                ?.icon as keyof typeof Feather.glyphMap
            }
            color={OBJECT_STATUS_MARKET_PLAYER[player?.status_id]?.color}
            size={14}
          />
        </View>
      </View>

      <View className="flex-1 justify-between">
        <View className="flex-row justify-between items-center flex-1">
          <View className="items-start justify-center">
            <View className="flex-row items-center gap-0.5">
              <Text className="flex-row text-sm font-bold">
                {player.apelido_abreviado}
              </Text>
              <View className="rounded-full bg-gray-300 h-1 w-1" />
              <Text className="font-medium text-xs">
                {OBJECT_STATUS_MARKET_PLAYER[player.status_id].name}
              </Text>
              <View
                className="flex-row"
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 10,
                  backgroundColor:
                    OBJECT_STATUS_MARKET_PLAYER[player?.status_id]?.background,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Feather
                  name={
                    OBJECT_STATUS_MARKET_PLAYER[player?.status_id]
                      ?.icon as keyof typeof Feather.glyphMap
                  }
                  color={OBJECT_STATUS_MARKET_PLAYER[player?.status_id]?.color}
                  size={14}
                />
              </View>
            </View>

            <View
              className="flex-row items-center justify-start"
              style={{
                gap: 4,
              }}
            >
              <Text className="font-medium uppercase text-xs">
                {positions?.[player.posicao_id].abreviacao}
              </Text>

              <View className="rounded-full bg-gray-300 h-1 w-1" />

              <Text className="font-medium uppercase text-xs">
                {market?.clubes[player.clube_id].abreviacao}
              </Text>

              <View className="rounded-full bg-gray-300 h-1 w-1" />

              <Text className="font-medium uppercase text-xs">
                {player.jogos_num} Jogos
              </Text>
            </View>
          </View>

          <View className="flex-row" style={{ gap: 4 }}>
            <Text className="flex-row text-sm font-semibold">
              C$ {numberToString(player.preco_num)}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center flex-1">
          <View className="items-start justify-start" style={{ gap: 8 }}>
            <View
              className="flex-row justify-between items-center flex-1"
              style={{
                gap: 8,
              }}
            >
              <View className="items-center justify-center">
                <Text className="uppercase text-xs">Média</Text>
                <Text className="font-bold text-xs">
                  {numberToString(player.media_num)}
                </Text>
              </View>

              <View className="items-center justify-center">
                <Text className="uppercase text-xs">Última</Text>
                <Text className="font-bold text-xs">
                  {numberToString(player.pontos_num)}
                </Text>
              </View>

              <View className="items-center justify-center">
                <Text className="uppercase text-xs">Min P/ Val</Text>
                <Text className="font-bold text-xs">
                  {numberToString(player.minimo_para_valorizar)}
                </Text>
              </View>
            </View>
          </View>

          <View
            className="items-end justify-end pl-3"
            style={{
              gap: 8,
            }}
          >
            {!isSellPlayer ? (
              <TouchableOpacity
                disabled={isButtonDisabled}
                style={[
                  styles.playerButton,
                  isButtonDisabled
                    ? styles.purchasePlayerButtonDisabled
                    : styles.purchasePlayerButtonActived,
                ]}
                onPress={() => onPressAddPlayerToLineup(player)}
                activeOpacity={0.6}
              >
                <Text className="text-white text-sm font-semibold">
                  {isButtonDisabled ? "Indisp." : "Comprar"}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.playerButton, styles.sellPlayerButton]}
                onPress={() => onPressRemovePlayerFromLineup(player)}
                activeOpacity={0.6}
              >
                <Text className="text-white text-sm font-semibold">Vender</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerButton: {
    width: 96,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  purchasePlayerButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  purchasePlayerButtonActived: {
    backgroundColor: "#3b82f6",
  },
  sellPlayerButton: {
    backgroundColor: "#ef4444",
  },
});
