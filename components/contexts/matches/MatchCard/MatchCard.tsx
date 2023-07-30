import { Image, TouchableOpacity, useColorScheme } from "react-native";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "expo-router";

import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Club } from "@/models/Club";
import { Match } from "@/models/Matches";

interface MatchCardProps {
  match: Match;
  homeClub?: Club;
  awayClub?: Club;
}

export function MatchCard({ match, homeClub, awayClub }: MatchCardProps) {
  const router = useRouter();
  const colorTheme = useColorScheme();

  return (
    <View className="mx-2 rounded-lg">
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => router.push(`/matches/${match.partida_id}`)}
        className="justify-center items-center p-2 mx-2 rounded-lg"
      >
        <View className="flex-row gap-x-1 justify-center items-center mb-3">
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
          className={`flex-row gap-x-1 justify-center items-center py-1 ${
            match.status_transmissao_tr === "CRIADA" && "mb-4"
          }`}
        >
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

          <View className="flex-row px-2 py-1 justify-center items-center">
            <Text className="font-semibold">
              {match.placar_oficial_mandante ?? ""}{" "}
            </Text>

            <View className="items-center justify-center w-5 pr-0.5">
              <Text className="text-gray-400">X</Text>
            </View>

            <Text className="font-semibold">
              {match.placar_oficial_visitante ?? ""}
            </Text>
          </View>

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

        {match.valida ? (
          <>
            {match.status_transmissao_tr === "ENCERRADA" && (
              <View
                className={`justify-center items-center bg-folly p-2 m-1 rounded-lg`}
              >
                <Text className="text-gray-50">Encerrado</Text>
              </View>
            )}
          </>
        ) : (
          <View
            className={`justify-center items-center bg-blue-300 p-2 m-1 rounded-lg`}
          >
            <Text className="text-xs">
              Esta partida é inválida para a rodada
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
