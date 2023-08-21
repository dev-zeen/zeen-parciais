import { Feather } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { FlatList, useColorScheme } from 'react-native';

import { Text, TouchableOpacity, View } from '@/components/Themed';
import { sortedOptions } from '@/components/contexts/market/MarketFilters/filters.helper';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { FullPlayer } from '@/models/Stats';

type OrderMarketProps = {
  currentOrder: OrderSelectedProps;
  applyOrderMarket: (option: OrderSelectedProps) => void;
  handleClose: () => void;
};

export type OrderSelectedProps = {
  id: number;
  title: string;
  onSort: (data: FullPlayer[]) => FullPlayer[];
};

export function OrderMarket({ currentOrder, applyOrderMarket, handleClose }: OrderMarketProps) {
  const colorTheme = useColorScheme();

  const [selectedOrder, setSelectedOrder] = useState<OrderSelectedProps>(currentOrder);

  const handleSelectOrder = useCallback(
    (option: OrderSelectedProps) => {
      applyOrderMarket(option);
      setSelectedOrder(option);
    },
    [applyOrderMarket]
  );

  return (
    <SafeAreaViewContainer>
      <View
        className="flex-1 rounded-lg pt-20"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          flex: 1,
        }}>
        <View
          className="items-center justify-between flex-row p-2 rounded-t-lg"
          style={{
            gap: 16,
          }}>
          <Text className="font-semibold text-lg">Ordenar Jogadores</Text>

          <TouchableOpacity
            onPress={handleClose}
            className="p-2 rounded-full border border-red-400 bg-red-300">
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
                  className="p-4 rounded-lg items-center justify-center"
                  style={{
                    backgroundColor:
                      colorTheme === 'dark'
                        ? selectedOrder.id === item.id
                          ? '#1d4ed8'
                          : '#60a5fa'
                        : selectedOrder.id === item.id
                        ? '#60a5fa'
                        : '#eff6ff',
                  }}>
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
