import { useCallback, useState } from "react";

import { Feather } from "@expo/vector-icons";

import { Text, TouchableOpacity, View } from "@/components/Themed";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { FlatList, Switch } from "react-native";

type MarketFilterByStatusProps = {
  statusSelecteds: FilterStatus[];
  applyFilter: (filters: FilterStatus[]) => void;
  handleClose: () => void;
};

export type FilterStatus = {
  id: number;
  title: string;
  selected: boolean;
};

export function MarketFilterByStatus({
  statusSelecteds,
  applyFilter,
  handleClose,
}: MarketFilterByStatusProps) {
  const [filters, setFilters] = useState<FilterStatus[]>(statusSelecteds);

  const isFiltersEmpty = filters.filter((item) => item.selected).length === 0;

  const handleStatusFilter = useCallback(() => {
    applyFilter(filters);
    handleClose();
  }, [filters]);

  const handleChangeFilter = useCallback(
    (filter: FilterStatus) => {
      const filterUpdated = filters.map((item) => {
        if (item.id === filter.id) {
          return {
            ...filter,
            selected: !item.selected,
          };
        }
        return item;
      });

      setFilters(filterUpdated);
    },
    [filters]
  );

  return (
    <SafeAreaViewContainer>
      <View
        className="flex-1 rounded-lg pt-20"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          flex: 1,
        }}
      >
        <View
          className="items-center justify-between flex-row p-2 rounded-t-lg"
          style={{
            gap: 16,
          }}
        >
          <Text className="font-semibold text-lg">Filtrar Jogadores</Text>

          <TouchableOpacity
            onPress={handleClose}
            className="p-2 rounded-full border border-red-400 bg-red-300"
          >
            <Feather name="x" color="#525252" size={24} />
          </TouchableOpacity>
        </View>

        <View className="px-2 flex-1">
          <FlatList
            contentContainerStyle={{
              gap: 8,
              padding: 8,
            }}
            data={filters}
            renderItem={({ item }) => {
              return (
                <View className="flex-row justify-between p-4 rounded-lg items-center border-2 border-blue-400 bg-blue-50">
                  <Text className="font-semibold text-base text-gray-500">
                    {item.title}
                  </Text>
                  <Switch
                    trackColor={{ false: "#FFF", true: "#bfdbfe" }}
                    thumbColor={item.selected ? "#3b82f6" : "#f4f3f4"}
                    ios_backgroundColor="#FFF"
                    onValueChange={() => handleChangeFilter(item)}
                    value={item.selected}
                  />
                </View>
              );
            }}
            keyExtractor={(item) => item.title}
          />

          <TouchableOpacity
            disabled={isFiltersEmpty}
            onPress={() => handleStatusFilter()}
            activeOpacity={0.6}
            className={`mx-2 p-4 rounded-lg items-center justify-center  ${
              isFiltersEmpty ? "bg-gray-300" : "bg-blue-500"
            }`}
            style={{
              gap: 16,
            }}
          >
            <Text className="font-semibold text-sm text-white">Filtrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaViewContainer>
  );
}
