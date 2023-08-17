import { useState } from "react";

import { Feather } from "@expo/vector-icons";

import { TypeFilter } from "@/app/(tabs)/team/market";
import { Text, TouchableOpacity, View } from "@/components/Themed";
import { FullPlayer } from "@/models/Stats";
import { FlatList } from "react-native";

type FilterMarketByTeamProps = {
  type: "filter" | "sort" | "status";
  applyFilter: (players: FullPlayer[]) => void;
  handleClose: () => void;
};

export function FilterMarketByTeam({
  type,
  applyFilter,
  handleClose,
}: FilterMarketByTeamProps) {
  const title =
    type === "filter" ? "Filtrar" : type === "sort" ? "Ordenar" : "Status";

  const [selectedFilter, setSelectedFilter] = useState<TypeFilter>("");

  const handleFilterSelect = () => {
    // Aplicar o filtro selecionado e passar o valor para a função "applyFilter"
    // Fechar o modal
    handleClose();
  };

  const sortedOptions = [
    {
      id: 1,
      title: "Mais Caros",
    },
    {
      id: 2,
      title: "Mais Baratos",
    },
    {
      id: 3,
      title: "Maior Média",
    },
    {
      id: 4,
      title: "Menos Pontos para Valorizar",
    },
  ];

  return (
    <View
      className="flex-1 pt-32 rounded-lg"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        flex: 1,
        gap: 8,
      }}
    >
      <View
        className="items-center justify-between flex-row p-2 mx-2 rounded-lg"
        style={{
          gap: 16,
        }}
      >
        <Text className="font-semibold text-lg">{title}</Text>

        <TouchableOpacity
          onPress={handleClose}
          className="p-2 rounded-full border border-red-400 bg-red-300"
        >
          <Feather name="x" color="#525252" size={24} />
        </TouchableOpacity>
      </View>

      {type === "sort" && (
        <View className="mx-2 px-2 flex-1 rounded-lg">
          <FlatList
            contentContainerStyle={{
              gap: 8,
              padding: 8,
            }}
            data={sortedOptions}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  activeOpacity={0.6}
                  className="bg-blue-500 p-4 rounded-lg items-center justify-center"
                  style={{
                    gap: 16,
                  }}
                >
                  <Text className="text-white font-semibold text-sm">
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.title}
          />
        </View>
      )}

      {type === "status" && (
        <View className="mx-2 px-2 flex-1 rounded-lg">
          <View className="items-center justify-center">
            <Text>Market Status Player</Text>
          </View>
        </View>
      )}

      {type === "filter" && (
        <View className="mx-2 px-2 flex-1 rounded-lg">
          {/* <ScrollView className="mx-2 px-2 flex-1 rounded-lg"> */}
          <View className="items-center justify-center">
            <Text>Market Filter</Text>
          </View>
          {/* </ScrollView> */}
        </View>
      )}
    </View>
  );
}
