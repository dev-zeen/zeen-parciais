import { Image, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/Themed";
import { TopPlayer } from "@/models/Player";

type TopPlayerCardProps = {
  player: TopPlayer;
};

export function TopPlayerCard({ player }: TopPlayerCardProps) {
  const totalLineups = new Intl.NumberFormat("pt-BR").format(player.escalacoes);

  return (
    <TouchableOpacity
      activeOpacity={0.4}
      key={player.Atleta.atleta_id}
      className="border-b border-gray-200 "
    >
      <View className="flex-row py-2 gap-x-2">
        <Image
          source={{
            uri: player.Atleta.foto.replace("FORMATO", "220x220"),
          }}
          className="w-12 h-12 rounded-full"
          alt={`Foto do ${player.Atleta.apelido}`}
        />

        <View className=" flex-1 flex-row items-center justify-between">
          <View className="gap-y-1">
            <View>
              <Text className="text-sm font-medium">
                {player.Atleta.apelido}
              </Text>

              <View className="flex-row items-center gap-x-1">
                <Text className="text-xs font-normal uppercase">
                  {player.posicao_abreviacao}
                </Text>

                <View className="relative rounded-full h-1 w-1 bg-gray-400"></View>

                <Text className="text-xs font-medium text-gray-400">
                  {player.clube}
                </Text>
              </View>
            </View>
          </View>

          <View>
            <Text className="font-medium text-base">{totalLineups}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
