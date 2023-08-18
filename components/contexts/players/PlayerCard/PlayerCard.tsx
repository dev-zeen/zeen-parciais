import { useContext, useMemo } from "react";
import { Image } from "react-native";

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Text, TouchableOpacity, View } from "@/components/Themed";
import { AuthContext } from "@/contexts/Auth.context";
import { Club } from "@/models/Club";
import { Player, Position } from "@/models/Stats";
import { GRAY_OPACITY } from "@/styles/colors";
import { numberToString } from "@/utils/parseTo";

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
  const router = useRouter();

  const { isAutheticated } = useContext(AuthContext);

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

  // const onPressHandler = useCallback(() => {
  //   router.push(`/(tabs)/players/${player.id}`);
  // }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      // onPress={onPressHandler}
      className="flex-row justify-between items-center rounded-lg px-4 py-2"
    >
      <View className="flex-row items-center gap-1 rounded-lg">
        <Image
          source={{
            uri: player.foto.replace("FORMATO", "220x220"),
          }}
          className="w-12 h-12"
          alt={player.apelido}
        />
        <Image
          source={{
            uri: club?.escudos?.["60x60"],
          }}
          className="w-6 h-6"
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

          {isAutheticated && (
            <View className="flex-row items-center justify-end w-10">
              <Text
                className={`text-xs font-semibold ${
                  appreciation && appreciation < 0
                    ? "text-folly"
                    : "text-green-400"
                }`}
              >
                {appreciation ? numberToString(appreciation) : "0,00"}
              </Text>
              <Feather
                name={
                  !appreciation
                    ? "arrow-left"
                    : appreciation && appreciation < 0
                    ? "arrow-down"
                    : "arrow-up"
                }
                color={
                  !appreciation
                    ? GRAY_OPACITY
                    : appreciation && appreciation < 0
                    ? "#ef4444"
                    : "#4ade80"
                }
              />
            </View>
          )}
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
