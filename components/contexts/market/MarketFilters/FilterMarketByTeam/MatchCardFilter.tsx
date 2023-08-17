import { Image, useColorScheme } from "react-native";

import { Feather } from "@expo/vector-icons";

import { Text, TouchableOpacity, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Market } from "@/models/Market";
import { Match } from "@/models/Matches";

type MatchCardFilterProps = {
  market: Market;
  match: Match;
  selecteds?: number[];
  handlePressTeam: (id: number) => void;
};

export function MatchCardFilter({
  market,
  match,
  selecteds,
  handlePressTeam,
}: MatchCardFilterProps) {
  const colorTheme = useColorScheme();

  return (
    <View className="flex-row px-8 py-3 rounded-lg items-center justify-evenly">
      <TouchableOpacity
        className="w-16 flex-row items-center justify-center"
        style={{ gap: 8 }}
        activeOpacity={0.6}
        onPress={() => handlePressTeam(match.clube_casa_id)}
      >
        <Text className="font-semibold w-7 text-center">
          {`${match.clube_casa_posicao}º`}
        </Text>

        <Image
          style={{
            opacity: selecteds?.includes(match.clube_casa_id) ? 1 : 0.4,
          }}
          source={{
            uri: market?.clubes[match.clube_casa_id]?.escudos["60x60"],
          }}
          className="w-10 h-10"
          alt={market?.clubes[match.clube_casa_id]?.nome_fantasia}
        />
      </TouchableOpacity>

      <Feather
        name="x"
        size={16}
        color={
          colorTheme === "dark"
            ? Colors.light.background
            : Colors.dark.background
        }
      />

      <TouchableOpacity
        className="w-16 flex-row items-center justify-center"
        style={{ gap: 4 }}
        activeOpacity={0.6}
        onPress={() => handlePressTeam(match.clube_visitante_id)}
      >
        <Image
          style={{
            opacity: selecteds?.includes(match.clube_visitante_id) ? 1 : 0.4,
          }}
          source={{
            uri: market?.clubes[match.clube_visitante_id]?.escudos["60x60"],
          }}
          className="w-10 h-10"
          alt={market?.clubes[match.clube_visitante_id]?.nome}
        />

        <Text className="font-semibold w-7 text-center">
          {`${match.clube_visitante_posicao}º`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
