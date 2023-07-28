import { OBJECT_STATUS_MARKET_PLAYER } from "@/constants/StatusPlayer";
import { FullPlayer } from "@/models/Stats";
import { useGetMarket } from "@/queries/market";
import { useGetPositions } from "@/queries/players";
import { numberToString } from "@/utils/parseTo";
import { Image, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type MarketPlayerCardProps = {
  player: FullPlayer;
  onPress: (player: FullPlayer) => void;
};

const renderVariationIcon = (variation: number): JSX.Element | null => {
  if (variation !== 0) {
    const iconName = variation > 0 ? "arrow-up" : "arrow-down";
    const iconColor = variation > 0 ? "#4ade80" : "#f87171";
    return <FontAwesome name={iconName} color={iconColor} size={14} />;
  }
  return null;
};

export function MarketPlayerCard({ player, onPress }: MarketPlayerCardProps) {
  const { data: market } = useGetMarket();
  const { data: positions } = useGetPositions();

  return (
    <View
      className={`bg-white rounded-lg border-b border-gray-200 flex-row items-center justify-between p-1`}
      key={player.atleta_id}
    >
      <View
        className="flex-row items-center"
        style={{
          gap: 6,
        }}
      >
        <Image
          source={{
            uri: player.foto.replace("FORMATO", "220x220"),
          }}
          className="w-20 h-20 rounded-3xl"
          alt={`Imagem do ${player.nome}`}
        />

        <View className="flex-1 justify-between" style={{ gap: 4 }}>
          <View className="flex-row justify-between items-center flex-1">
            <View className="items-start justify-center">
              <Text className="flex-row text-sm font-semibold">
                {player.apelido}
              </Text>
              <View
                className="flex-row items-center justify-start"
                style={{
                  gap: 4,
                }}
              >
                <Text
                  className="font-medium uppercase text-gray-500"
                  style={{
                    fontSize: 11,
                  }}
                >
                  {positions?.[player.posicao_id].abreviacao}
                </Text>

                <View className="rounded-full bg-gray-500 h-1 w-1" />

                <Text
                  className="font-medium uppercase text-gray-500"
                  style={{
                    fontSize: 11,
                  }}
                >
                  {market?.clubes[player.clube_id].abreviacao}
                </Text>

                <View className="rounded-full bg-gray-500 h-1 w-1" />

                <Text
                  className="font-medium text-gray-500  uppercase"
                  style={{
                    fontSize: 11,
                  }}
                >
                  {player.jogos_num} Jogos
                </Text>
              </View>
            </View>
            <View className="flex-row" style={{ gap: 4 }}>
              <Text className="font-medium text-gray-400 text-xs">
                {OBJECT_STATUS_MARKET_PLAYER[player.status_id].name}
              </Text>
              <View
                className="flex-row"
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 10,
                  backgroundColor:
                    OBJECT_STATUS_MARKET_PLAYER[player?.status_id]?.background,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesome
                  name={"arrow-circle-o-right"}
                  color={OBJECT_STATUS_MARKET_PLAYER[player?.status_id]?.color}
                  size={14}
                />
              </View>
            </View>
          </View>

          <View className="flex-row justify-end items-center flex-1">
            <View className="flex-row" style={{ gap: 12, marginRight: 4 }}>
              <View className="flex-row items-center justify-center">
                <Text className="font-normal text-gray-500 text-xs uppercase">
                  C${" "}
                </Text>
                <Text className="font-semibold text-sm">
                  {numberToString(player.preco_num)}
                </Text>
              </View>

              <View
                className="flex-row items-center justify-center"
                style={{
                  maxWidth: 32,
                  minWidth: 32,
                }}
              >
                <Text
                  className={`font-semibold text-xs ${
                    player.variacao_num > 0
                      ? "text-green-500"
                      : player.variacao_num < 0
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {numberToString(player.variacao_num)}
                </Text>

                <View>{renderVariationIcon(player.variacao_num)}</View>
              </View>
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
                  <Text
                    className="font-light text-gray-600 uppercase"
                    style={{
                      fontSize: 10,
                    }}
                  >
                    Média
                  </Text>
                  <Text className="font-semibold text-xs">
                    {numberToString(player.media_num)}
                  </Text>
                </View>

                <View className="items-center justify-center">
                  <Text
                    className="font-light text-gray-600 uppercase"
                    style={{
                      fontSize: 10,
                    }}
                  >
                    Última
                  </Text>
                  <Text className="font-semibold text-xs">
                    {numberToString(player.pontos_num)}
                  </Text>
                </View>

                <View className="items-center justify-center">
                  <Text
                    className="font-light text-gray-600 uppercase"
                    style={{
                      fontSize: 10,
                    }}
                  >
                    Min P/ Val
                  </Text>
                  <Text className="font-semibold text-xs">
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
              <TouchableOpacity
                onPress={() => onPress(player)}
                className="bg-blue-500 rounded-lg py-2 px-4"
                activeOpacity={0.6}
              >
                <Text className="text-white text-xs font-semibold">
                  Comprar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
