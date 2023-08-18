import { useCallback, useState } from "react";
import { FlatList, ListRenderItemInfo, useColorScheme } from "react-native";

import { Feather } from "@expo/vector-icons";

import { Text, TouchableOpacity, View } from "@/components/Themed";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import Colors from "@/constants/Colors";
import { Market } from "@/models/Market";
import { Match } from "@/models/Matches";
import { useGetMarket } from "@/queries/market.query";
import { useGetMatchs } from "@/queries/matches.query";

import { MatchCardFilter } from "./MatchCardFilter";

type FilterMarketByTeamProps = {
  applyFilter: (teams: number[]) => void;
  handleClose: () => void;
  defaultFilters: () => void;
  selectedTeams: number[];
};

export function FilterMarketByTeam({
  applyFilter,
  handleClose,
  defaultFilters,
  selectedTeams,
}: FilterMarketByTeamProps) {
  const colorTheme = useColorScheme();
  const { data: market } = useGetMarket();
  const { data: matches } = useGetMatchs();

  const [selectedsTeams, setSelectedsTeams] = useState<number[]>(
    selectedTeams || []
  );

  const handlePressTeam = (id: number) => {
    const isExists = selectedsTeams.includes(id);

    if (isExists) {
      const selectedsTeamsUpdated = selectedsTeams.filter(
        (teamId) => teamId !== id
      );
      setSelectedsTeams(selectedsTeamsUpdated);
    } else {
      setSelectedsTeams([...selectedsTeams, id]);
    }
  };

  const handlePressFilter = useCallback(() => {
    applyFilter(selectedsTeams);
    handleClose();
  }, [selectedsTeams]);

  const renderItem = useCallback(
    ({ item: match }: ListRenderItemInfo<Match>) => {
      return (
        <MatchCardFilter
          market={market as Market}
          match={match}
          selecteds={selectedsTeams}
          handlePressTeam={handlePressTeam}
        />
      );
    },
    [market, matches, selectedsTeams]
  );

  const keyExtractor = useCallback(
    (item: Match) => `${item.clube_casa_id}`,
    []
  );

  return (
    <SafeAreaViewContainer>
      <View
        className="mx-2"
        style={{
          gap: 8,
          backgroundColor:
            colorTheme === "dark"
              ? Colors.dark.backgroundFull
              : Colors.light.backgroundFull,
        }}
      >
        <View
          className="rounded-lg"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            className="items-center justify-between flex-row p-2 rounded-lg"
            style={{
              gap: 16,
            }}
          >
            <Text className="font-semibold text-lg">Filtrar Por Time</Text>

            <TouchableOpacity
              onPress={handleClose}
              className="p-2 rounded-full border border-red-400 bg-red-300"
            >
              <Feather name="x" color="#525252" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row px-8 py-3 rounded-lg items-center justify-evenly">
          <Text>Mandates</Text>
          <Text>Visitantes</Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={{
          gap: 8,
          paddingVertical: 8,
          paddingHorizontal: 8,

          backgroundColor:
            colorTheme === "dark"
              ? Colors.dark.backgroundFull
              : Colors.light.backgroundFull,
        }}
        initialNumToRender={10}
        data={matches?.partidas}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />

      <View
        className="flex-row items-center justify-center pt-4"
        style={{
          gap: 16,
          backgroundColor:
            colorTheme === "dark"
              ? Colors.dark.backgroundFull
              : Colors.light.backgroundFull,
        }}
      >
        <TouchableOpacity
          onPress={defaultFilters}
          activeOpacity={0.6}
          className="w-32 mx-2 p-4 rounded-lg items-center justify-center bg-orange-400"
          style={{
            gap: 16,
          }}
        >
          <Text className="font-semibold text-sm text-white">
            Limpar Filtros
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={selectedsTeams.length === 0}
          onPress={handlePressFilter}
          activeOpacity={0.6}
          className={`w-32 mx-2 p-4 rounded-lg items-center justify-center  ${
            selectedsTeams.length === 0 ? "bg-gray-300" : "bg-blue-500"
          }`}
          style={{
            gap: 16,
          }}
        >
          <Text className="font-semibold text-sm text-white">Filtrar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaViewContainer>
  );
}
