import { Feather } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {  FlatList } from 'react-native';

import { Text, TouchableOpacity, View } from '@/components/Themed';
import { sortedOptions } from '@/components/contexts/market/MarketFilters/filters.helper';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { FullPlayer } from '@/models/Stats';
import { useThemeColor } from '@/hooks/useThemeColor';

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
  const colorTheme = useThemeColor();

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
        className="flex-1 rounded-lg mx-2 mt-2"
        style={{
          backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
          borderWidth: 1,
          borderColor: colorTheme === 'dark' ? '#1f2937' : '#f3f4f6',
        }}>
      <View
        className="items-center justify-between flex-row p-4"
        style={{
          gap: 16,
          backgroundColor: 'transparent',
        }}>
        <Text 
          className="font-semibold text-lg"
          style={{ color: colorTheme === 'dark' ? '#f3f4f6' : '#111827' }}>
          Ordenar Jogadores
        </Text>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={handleClose}
          className="p-2 rounded-full"
          style={{
            backgroundColor: colorTheme === 'dark' ? '#7f1d1d' : '#fee2e2',
            borderWidth: 1,
            borderColor: colorTheme === 'dark' ? '#dc2626' : '#fca5a5',
          }}>
          <Feather name="x" size={20} color={colorTheme === 'dark' ? '#fca5a5' : '#dc2626'} />
        </TouchableOpacity>
      </View>

      <View className="px-2 flex-1" style={{ backgroundColor: 'transparent' }}>
        <FlatList
          contentContainerStyle={{
            gap: 8,
            padding: 8,
            backgroundColor: 'transparent',
          }}
          style={{ backgroundColor: 'transparent' }}
          data={sortedOptions}
          renderItem={({ item }) => {
            const isSelected = selectedOrder.id === item.id;
            return (
              <TouchableOpacity
                onPress={() => handleSelectOrder(item)}
                activeOpacity={0.7}
                className="p-4 rounded-lg items-center justify-center"
                style={{
                  backgroundColor: isSelected
                    ? (colorTheme === 'dark' ? '#1e40af' : '#3b82f6')
                    : (colorTheme === 'dark' ? '#1f2937' : '#f9fafb'),
                  borderWidth: 1,
                  borderColor: isSelected
                    ? (colorTheme === 'dark' ? '#3b82f6' : '#2563eb')
                    : (colorTheme === 'dark' ? '#374151' : '#e5e7eb'),
                }}>
                <Text 
                  className="font-semibold text-sm"
                  style={{ 
                    color: isSelected 
                      ? '#ffffff'
                      : (colorTheme === 'dark' ? '#f3f4f6' : '#111827')
                  }}>
                  {item.title}
                </Text>
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
