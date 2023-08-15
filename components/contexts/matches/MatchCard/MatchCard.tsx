import { useCallback } from "react";
import { Image, TouchableOpacity, useColorScheme } from "react-native";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "expo-router";

import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Club } from "@/models/Club";
import { Match } from "@/models/Matches";
import { Feather } from "@expo/vector-icons";

interface MatchCardProps {
  match: Match;
  homeClub?: Club;
  awayClub?: Club;
}

export function MatchCard({ match, homeClub, awayClub }: MatchCardProps) {
  const router = useRouter();
  const colorTheme = useColorScheme();

  const onPressHandler = useCallback(() => {
    router.push(`/matches/${match.partida_id}`);
  }, []);

  return (
    <View className="rounded-lg items-center justify-center">
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={onPressHandler}
        className="justify-center items-center p-2 mx-2 rounded-lg"
      >
        <View className="flex-row gap-x-1 justify-center items-center mb-3 ">
          <Text className=" font-medium text-xs">
            {format(new Date(match.partida_data), "EEEEEE',' dd/MM/y kk:mm", {
              locale: ptBR,
            })}
          </Text>
          <View
            style={{
              backgroundColor:
                colorTheme === "dark"
                  ? Colors.dark.tabIconDefault
                  : Colors.light.tabIconDefault,
            }}
            className={`w-1 h-1  rounded-full`}
          />
          <Text className="font-medium text-xs">{match.local}</Text>
        </View>

        <View
          className={`flex-row justify-center items-center p-2 ${
            match.status_transmissao_tr === "CRIADA" && "mb-4"
          }`}
          style={{
            gap: 4,
          }}
        >
          <View className="flex-row" style={{ gap: 4 }}>
            <View className="flex-row items-center justify-center">
              <Text className="font-semibold">{`${match.clube_casa_posicao}º`}</Text>
            </View>

            <View className="flex-row items-center justify-center">
              <Text className="font-semibold">{homeClub?.abreviacao}</Text>
            </View>

            <Image
              source={{
                uri: homeClub?.escudos["60x60"],
              }}
              className="w-7 h-7"
              alt={`Escudo do ${homeClub?.nome}`}
            />
          </View>

          <View className="flex-row justify-center items-center">
            <Text className="font-semibold">
              {match.placar_oficial_mandante ?? ""}
            </Text>

            <Feather
              name="x"
              size={18}
              color={colorTheme === "dark" ? "white" : Colors.light.text}
            />

            <Text className="font-semibold">
              {match.placar_oficial_visitante ?? ""}
            </Text>
          </View>
          <View className="flex-row" style={{ gap: 4 }}>
            <Image
              source={{
                uri: awayClub?.escudos["60x60"],
              }}
              className="w-7 h-7"
              alt={`Escudo do ${awayClub?.nome}`}
            />

            <View className="flex-row items-center justify-center">
              <Text className="font-semibold">{awayClub?.abreviacao}</Text>
            </View>

            <View className="flex-row items-center justify-center">
              <Text className="font-semibold">{`${match.clube_visitante_posicao}º`}</Text>
            </View>
          </View>
        </View>

        {match.valida ? (
          <>
            {match.status_transmissao_tr === "ENCERRADA" && (
              <View
                className={`justify-center items-center bg-folly p-2 m-1 rounded-lg`}
              >
                <Text className="text-gray-50 text-xs font-semibold">
                  Encerrado
                </Text>
              </View>
            )}
          </>
        ) : (
          <View
            className={`justify-center items-center bg-red-500 p-2 m-1 rounded-lg`}
          >
            <Text className="text-xs text-white font-semibold">
              Esta partida é inválida para a rodada
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
