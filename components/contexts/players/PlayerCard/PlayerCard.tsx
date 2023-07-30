import { Image, TouchableOpacity, useColorScheme } from "react-native";

import { Text, View } from "@/components/Themed";
import { Club } from "@/models/Club";
import { Player, Position } from "@/models/Stats";
import { numberToString } from "@/utils/parseTo";
import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";

interface PlayerCardProps {
  player: Player;
  club?: Club;
  position?: Position;
  appreciation?: number;
}

export function PlayerCard({
  player,
  club,
  position,
  appreciation,
}: PlayerCardProps) {
  const colorTheme = useColorScheme();

  const scoutsColors: { [key: string]: string } = useMemo(() => {
    return {
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
      PS: "positive",
    };
  }, []);

  const playerScore = useMemo(() => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
    }).format(player.pontuacao);
  }, [player]);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      className={`flex-row justify-between items-center rounded-lg p-3 border-b ${
        colorTheme === "dark" ? "border-gray-500" : "border-gray-200"
      } `}
    >
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
      <View className="justify-center items-end">
        <View className="flex-row gap-2 items-center justify-center">
          <View className="w-10 justify-end items-end">
            <Text className="font-semibold ">{playerScore}</Text>
          </View>

          <View className="flex-row items-center justify-end w-10">
            <Text
              className={`text-xs font-semibold ${
                appreciation && appreciation < 0
                  ? "text-folly"
                  : "text-green-400"
              }`}
            >
              {appreciation ? numberToString(appreciation) : null}
            </Text>
            <Feather
              name={
                appreciation && appreciation < 0 ? "arrow-down" : "arrow-up"
              }
              color={appreciation && appreciation < 0 ? "#ef4444" : "#4ade80"}
            />
          </View>
        </View>

        <View className="flex-row">
          {Object.entries(player?.scout as Object).map(([key, value]) => (
            <View key={key}>
              <Text
                className={`text-xs font-semibold text-center ${
                  scoutsColors[key] === "negative" && "text-folly"
                }

                ${scoutsColors[key] === "positive" && "text-green-500"}
                
                `}
              >{` ${value}${key}`}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}
