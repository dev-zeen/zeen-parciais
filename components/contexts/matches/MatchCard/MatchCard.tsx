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
    router.push(`/matches/${JSON.stringify(match)}`);
  }, []);

  return (
    <View className="rounded-lg items-center justify-center">
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={onPressHandler}
        className="w-full justify-center items-center p-2 rounded-lg "
      >
        <Text className=" font-medium text-xs">
          {format(new Date(match.partida_data), "EEEEEE',' dd/MM/y kk:mm", {
            locale: ptBR,
          })}
        </Text>

        <View
          className={`flex-row py-2 px-4 w-full items-center justify-between ${
            match.status_transmissao_tr === "CRIADA" && "mb-4"
          }`}
          style={{
            gap: 24,
          }}
        >
          <View className="justify-center items-center" style={{ gap: 4 }}>
            <Image
              source={{
                uri: homeClub?.escudos["60x60"],
              }}
              className="w-10 h-10"
              alt={`Escudo do ${homeClub?.nome}`}
            />
            <View
              className="flex-row"
              style={{
                gap: 8,
              }}
            >
              <Text className="font-semibold">{homeClub?.abreviacao}</Text>

              <Text className="font-semibold">{`${match.clube_casa_posicao}º`}</Text>
            </View>
          </View>

          <View
            className="items-center justify-center"
            style={{
              gap: 4,
            }}
          >
            <View
              className={`flex-row justify-center items-center border rounded ${
                colorTheme === "dark" ? "border-gray-400" : "border-gray-300"
              } px-3 py-1`}
              style={{
                gap: 8,
              }}
            >
              <Text className="font-semibold text-base">
                {match.placar_oficial_mandante ?? "-"}
              </Text>

              <Feather
                name="x"
                size={16}
                color={
                  colorTheme === "dark"
                    ? Colors.light.background
                    : Colors.dark.background
                }
              />

              <Text className="font-semibold text-base ">
                {match.placar_oficial_visitante ?? "-"}
              </Text>
            </View>
            <Text className="text-xs">{match.local}</Text>
          </View>

          <View className="justify-center items-center" style={{ gap: 4 }}>
            <Image
              source={{
                uri: awayClub?.escudos["60x60"],
              }}
              className="w-10 h-10"
              alt={`Escudo do ${awayClub?.nome}`}
            />
            <View
              className="flex-row"
              style={{
                gap: 8,
              }}
            >
              <Text className="font-semibold">{awayClub?.abreviacao}</Text>
              <Text className="font-semibold">{`${match.clube_casa_posicao}º`}</Text>
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
