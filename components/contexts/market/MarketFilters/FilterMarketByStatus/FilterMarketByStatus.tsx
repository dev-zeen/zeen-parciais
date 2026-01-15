import { Feather } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {  FlatList, Switch } from 'react-native';

import { Text, TouchableOpacity, View } from '@/components/Themed';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { useThemeColor } from '@/hooks/useThemeColor';

type FilterMarketByStatusProps = {
  statusSelecteds: PlayerStatusFilter[];
  applyFilter: (filters: PlayerStatusFilter[]) => void;
  handleClose: () => void;
};

export type PlayerStatusFilter = {
  id: number;
  title: string;
  selected: boolean;
};

export function FilterMarketByStatus({
  statusSelecteds,
  applyFilter,
  handleClose,
}: FilterMarketByStatusProps) {
  const colorTheme = useThemeColor();

  const [filters, setFilters] = useState<PlayerStatusFilter[]>(statusSelecteds);

  const isFiltersEmpty = filters.filter((item) => item.selected).length === 0;

  const handleStatusFilter = useCallback(() => {
    applyFilter(filters);
    handleClose();
  }, [applyFilter, filters, handleClose]);

  const handleChangeFilter = useCallback(
    (filter: PlayerStatusFilter) => {
      const filterUpdated = filters.map((item) =>
        item.id === filter.id ? { ...filter, selected: !item.selected } : item
      );

      setFilters(filterUpdated);
    },
    [filters]
  );

  return (
    <SafeAreaViewContainer edges={['top', 'bottom']}>
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
          Filtrar Jogadores
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

      <View className="flex-1 px-2 pb-4" style={{ backgroundColor: 'transparent' }}>
        <FlatList
          contentContainerStyle={{
            gap: 8,
            padding: 8,
            backgroundColor: 'transparent',
          }}
          style={{ backgroundColor: 'transparent' }}
          data={filters}
          renderItem={({ item }) => {
            return (
              <View
                className="flex-row justify-between p-4 rounded-lg items-center"
                style={{
                  backgroundColor: item.selected
                    ? (colorTheme === 'dark' ? '#1e3a8a' : '#dbeafe')
                    : (colorTheme === 'dark' ? '#1f2937' : '#f9fafb'),
                  borderWidth: 1,
                  borderColor: item.selected
                    ? (colorTheme === 'dark' ? '#3b82f6' : '#93c5fd')
                    : (colorTheme === 'dark' ? '#374151' : '#e5e7eb'),
                }}>
                <Text 
                  className="font-semibold text-base"
                  style={{ color: colorTheme === 'dark' ? '#f3f4f6' : '#111827' }}>
                  {item.title}
                </Text>
                <Switch
                  trackColor={{ 
                    false: colorTheme === 'dark' ? '#374151' : '#d1d5db', 
                    true: colorTheme === 'dark' ? '#60a5fa' : '#93c5fd' 
                  }}
                  thumbColor={item.selected ? '#3b82f6' : '#f3f4f6'}
                  ios_backgroundColor={colorTheme === 'dark' ? '#374151' : '#d1d5db'}
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
          onPress={handleStatusFilter}
          activeOpacity={0.7}
          className="mx-2 p-4 rounded-lg items-center justify-center"
          style={{
            backgroundColor: isFiltersEmpty 
              ? (colorTheme === 'dark' ? '#374151' : '#e5e7eb')
              : (colorTheme === 'dark' ? '#1e40af' : '#3b82f6'),
            borderWidth: 1,
            borderColor: isFiltersEmpty
              ? (colorTheme === 'dark' ? '#4b5563' : '#d1d5db')
              : (colorTheme === 'dark' ? '#3b82f6' : '#2563eb'),
            opacity: isFiltersEmpty ? 0.5 : 1,
          }}>
          <Text className="font-semibold text-sm text-white">Filtrar</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaViewContainer>
  );
}
