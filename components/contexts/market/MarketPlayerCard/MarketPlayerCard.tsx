import { Feather } from "@expo/vector-icons";

import { Text, View } from "@/components/Themed";
import { OBJECT_STATUS_MARKET_PLAYER } from "@/constants/StatusPlayer";
import { FullPlayer } from "@/models/Stats";
import { useGetMarket } from "@/queries/market";
import { useGetPositions } from "@/queries/players";
import { numberToString } from "@/utils/parseTo";
import { Image, TouchableOpacity } from "react-native";

type MarketPlayerCardProps = {
  player: FullPlayer;
  onPress: (player: FullPlayer) => void;
};

export function MarketPlayerCard({ player, onPress }: MarketPlayerCardProps) {
  const { data: market } = useGetMarket();
  const { data: positions } = useGetPositions();

  return (
    <View
      className={`rounded-lg flex-row items-center justify-between p-2 mx-2`}
      key={player.atleta_id}
    >
      <Image
        source={{
          uri: player.foto.replace("FORMATO", "220x220"),
        }}
        className="w-20 h-20 rounded-3xl mr-2"
        alt={`Imagem do ${player.nome}`}
      />

      <View className="flex-1 justify-between">
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
            <Text className="font-medium text-xs">
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
                <Text className="font-light uppercase text-xs">Média</Text>
                <Text className="font-semibold text-xs">
                  {numberToString(player.media_num)}
                </Text>
              </View>

              <View className="items-center justify-center">
                <Text className="font-light uppercase text-xs">Última</Text>
                <Text className="font-semibold text-xs">
                  {numberToString(player.pontos_num)}
                </Text>
              </View>

              <View className="items-center justify-center">
                <Text className="font-light uppercase text-xs">Min P/ Val</Text>
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
              <Text className="text-white text-xs font-semibold">Comprar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
