import { useCallback, useState } from "react";
import { FlatList } from "react-native";

import { Feather } from "@expo/vector-icons";

import { Text, TouchableOpacity, View } from "@/components/Themed";
import { sortedOptions } from "@/components/contexts/market/MarketFilters/filters.helper";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { FullPlayer } from "@/models/Stats";

type OrderMarketProps = {
  currentOrder: OrderSelectedProps;
  applyFilter: (option: OrderSelectedProps) => void;
  handleClose: () => void;
};

export type OrderSelectedProps = {
  id: number;
  title: string;
  onSort: (data: FullPlayer[]) => FullPlayer[];
};

export function OrderMarket({
  currentOrder,
  applyFilter,
  handleClose,
}: OrderMarketProps) {
  const [selectedOrder, setSelectedOrder] =
    useState<OrderSelectedProps>(currentOrder);

  const handleSelectOrder = useCallback(
    (option: OrderSelectedProps) => {
      applyFilter(option);
      setSelectedOrder(option);
    },
    [selectedOrder]
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
          <Text className="font-semibold text-lg">Ordenar Jogadores</Text>

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
            data={sortedOptions}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  onPress={() => handleSelectOrder(item)}
                  activeOpacity={0.6}
                  className={`p-4 rounded-lg items-center justify-center border-2 border-blue-400 bg-blue-50 ${
                    selectedOrder.id === item.id && " bg-blue-400"
                  }`}
                  style={{
                    gap: 16,
                  }}
                >
                  <Text className="font-semibold text-sm">{item.title}</Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.title}
          />
        </View>
      </View>
    </SafeAreaViewContainer>
  );
}
