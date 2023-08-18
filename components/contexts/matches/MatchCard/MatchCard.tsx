import { useCallback } from "react";
import { Image, TouchableOpacity, useColorScheme } from "react-native";

import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "expo-router";

import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Club } from "@/models/Club";
import { Match } from "@/models/Matches";
import { FullPlayer } from "@/models/Stats";

interface MatchCardProps {
  match: Match;
  players: FullPlayer[];
  homeClub?: Club;
  awayClub?: Club;
  isDisabled?: boolean;
}

export function MatchCard({
  match,
  players,
  homeClub,
  awayClub,
  isDisabled = false,
}: MatchCardProps) {
  const router = useRouter();
  const colorTheme = useColorScheme();

  const amountPlayersMyClubHomeTeam = useCallback(() => {
    return players?.filter((player) => player.clube_id === match.clube_casa_id)
      .length;
  }, [players, match]);

  const amountPlayersMyClubAwayTeam = useCallback(() => {
    return players?.filter(
      (player) => player.clube_id === match.clube_visitante_id
    ).length;
  }, [players, match]);

  const onPressHandler = useCallback(() => {
    router.push(`/matches/${JSON.stringify(match)}`);
  }, []);

  return (
    <TouchableOpacity
      disabled={isDisabled}
      activeOpacity={0.6}
      onPress={onPressHandler}
    >
      <View className="p-2 rounded-lg">
        <Text className="font-medium text-xs text-center">
          {format(new Date(match.partida_data), "EEEEEE',' dd/MM/y kk:mm", {
            locale: ptBR,
          })}
        </Text>

        <View
          className={`flex-row py-1 px-4 justify-between ${
            match.status_transmissao_tr === "CRIADA" && "mb-4"
          }`}
          style={{
            gap: 24,
          }}
        >
          <View className="items-center justify-center" style={{ gap: 4 }}>
            <Image
              source={{
                uri: homeClub?.escudos["60x60"],
              }}
              className="w-12 h-12"
              alt={`Escudo do ${homeClub?.nome}`}
            />

            <Text className="font-semibold">
              {homeClub?.abreviacao} {`${match.clube_casa_posicao}º`}
            </Text>

            {amountPlayersMyClubHomeTeam() > 0 && (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 9999,
                  position: "absolute",
                  width: 20,
                  height: 20,
                  top: 15,
                  left: 55,
                  backgroundColor: "#22c55e",
                }}
              >
                <Text className="font-semibold text-xs">
                  {amountPlayersMyClubHomeTeam()}
                </Text>
              </View>
            )}
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
              } px-4 py-2`}
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
              className="w-12 h-12"
              alt={`Escudo do ${awayClub?.nome}`}
            />

            <Text className="font-semibold">
              {awayClub?.abreviacao} {`${match.clube_visitante_posicao}º`}
            </Text>

            {amountPlayersMyClubAwayTeam() > 0 && (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 9999,
                  position: "absolute",
                  width: 20,
                  height: 20,
                  top: 15,
                  left: -22,
                  backgroundColor: "#22c55e",
                }}
              >
                <Text className="font-semibold text-xs">
                  {amountPlayersMyClubAwayTeam()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {match.valida ? (
          <>
            {match.status_transmissao_tr === "ENCERRADA" && (
              <View className="justify-center items-center bg-folly p-2 m-1 rounded-lg">
                <Text className="text-gray-50 text-xs font-semibold">
                  Encerrado
                </Text>
              </View>
            )}
          </>
        ) : (
          <View className="justify-center items-center bg-red-500 p-2 m-1 rounded-lg">
            <Text className="text-xs text-white font-semibold">
              Esta partida é inválida para a rodada
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
