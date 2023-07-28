import { Image, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/Themed";
import { Club } from "@/models/Club";
import { Player, Position } from "@/models/Stats";

interface PlayerCardProps {
  player: Player;
  club?: Club;
  position?: Position;
}

export function PlayerCard({ player, club, position }: PlayerCardProps) {
  const scoutsColors: { [key: string]: string } = {
    GS: "negative",
    PP: "negative",
    GC: "negative",
    CV: "negative",
    CA: "negative",
    FC: "negative",
    PC: "negative",
    I: "negative",
    FS: "positive",
    FF: "positive",
    SG: "positive",
    V: "positive",
    G: "positive",
    DS: "positive",
    FD: "positive",
    DE: "positive",
    A: "positive",
    FT: "positive",
    DP: "positive",
  };

  const playerScore = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
  }).format(player.pontuacao);

  return (
    <TouchableOpacity activeOpacity={0.4}>
      <View className="flex-row justify-between items-center bg-white rounded-lg p-2 mb-1 mx-2">
        <View className="flex-row items-center gap-1">
          <Image
            source={{
              uri: club?.escudos?.["60x60"],
            }}
            className="w-7 h-7"
            alt={`Escudo do ${club?.nome}`}
          />
          <View>
            <View className="flex-row">
              <Text className="font-semibold text-sm">{player.apelido}</Text>
            </View>

            <Text className="font-light text-xs">{position?.nome}</Text>
          </View>
        </View>
        <View className="flex-1 justify-center items-end">
          <Text className="font-semibold">{playerScore}</Text>
          <View className="flex-row">
            {Object.entries(player?.scout as Object).map(([key, value]) => (
              <View className="flex-row gap-1" key={key}>
                <Text
                  className={`text-xs font-semibold ${
                    scoutsColors[key] === "negative" && "text-folly"
                  }

                ${scoutsColors[key] === "positive" && "text-green-500"}
                
                `}
                >{` ${value}${key}`}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
