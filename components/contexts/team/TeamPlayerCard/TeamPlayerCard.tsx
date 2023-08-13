import { Image, ScrollView, useColorScheme } from "react-native";

import { Feather } from "@expo/vector-icons";

import { Text, TouchableOpacity, View } from "@/components/Themed";
import { LineupPlayer } from "@/models/Formations";
import { useGetMarket } from "@/queries/market.query";
import { useGetPositions } from "@/queries/players.query";
import { numberToString } from "@/utils/parseTo";

type TeamPlayerCardProps = {
  player: LineupPlayer;
  isReservePlayer: boolean;
  onClose: () => void;
};

export function TeamPlayerCard({
  player,
  isReservePlayer,
  onClose,
}: TeamPlayerCardProps) {
  const colorTheme = useColorScheme();

  const { data: positions } = useGetPositions();

  const { data: market } = useGetMarket();

  return (
    <View
      className="flex-1 pt-40 rounded-lg"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <View className="flex-1 rounded-lg">
        <View
          className="items-center flex-row pt-2 mx-2 rounded-lg mb-2"
          style={{
            marginHorizontal: 4,
            gap: 16,
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            className="p-2 rounded-full border border-red-400 bg-red-300"
          >
            <Feather name="x" color="#525252" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView className="gap-y-4">
          <View className="flex-1 flex-row items-center justify-center gap-x-1 mx-2">
            <Image
              source={{
                uri: player.foto.replace("FORMATO", "220x220"),
              }}
              className="w-28 h-28 rounded-full mr-2"
              style={{
                borderWidth: 2,
                borderColor: "#F5F5F5",
              }}
              alt={`Imagem do ${player.nome}`}
            />

            <View
              className="justify-end items-end"
              style={{
                gap: 4,
              }}
            >
              <Text className="font-light text-base">
                {positions?.[player.posicao_id].nome}
              </Text>

              <Text className="font-semibold text-xl">{player.apelido}</Text>
              <View className="flex-row items-center justify-center">
                <Image
                  source={{
                    uri: market?.clubes?.[player.clube_id].escudos["60x60"],
                  }}
                  className="w-7 h-7 rounded-3xl mr-2"
                  alt={`Imagem do ${player.nome}`}
                />
                <Text className="font-semibold text-base">
                  {market?.clubes?.[player.clube_id].nome_fantasia}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row border border-white p-4 mx-2 justify-between items-center rounded bg-neutral-200">
            <View className="items-center justify-center bg-neutral-200 gap-y-1">
              <Text className="text-gray-800 font-semibold">Jogos</Text>
              <Text className="text-gray-800 font-bold">
                {player.jogos_num}
              </Text>
            </View>

            <View className="items-center justify-center bg-neutral-200 gap-y-1">
              <Text className="text-gray-800 font-semibold">Média</Text>
              <Text className="text-gray-800 font-bold">
                {numberToString(player.media_num)}
              </Text>
            </View>

            <View className="items-center justify-center bg-neutral-200 gap-y-1">
              <Text className="text-gray-800 font-semibold">Min p/ Val</Text>
              <Text className="text-gray-800 font-bold">
                {numberToString(player.minimo_para_valorizar)}
              </Text>
            </View>

            <View className="items-center justify-center bg-neutral-200 gap-y-1">
              <Text className="text-gray-800 font-semibold">Preço</Text>
              <Text className="text-gray-800 font-bold">
                {numberToString(player.preco_num)}
              </Text>
            </View>
          </View>

          {!isReservePlayer && (
            <View className="flex-row px-4 mx-2 rounded-lg items-center justify-evenly">
              <TouchableOpacity
                activeOpacity={0.6}
                className={`border-2 border-violet-500 ${
                  colorTheme === "dark" ? "bg-violet-500" : "bg-violet-200"
                } p-3 rounded-lg`}
              >
                <Text>Tornar Capitão</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.6}
                className={`border-2 border-red-500 ${
                  colorTheme === "dark" ? "bg-red-500" : "bg-red-200"
                } p-3 rounded-lg`}
              >
                <Text>Vender Jogador</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
