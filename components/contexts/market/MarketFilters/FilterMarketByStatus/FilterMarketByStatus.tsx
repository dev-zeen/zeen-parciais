import { Feather } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { FlatList, Switch, useColorScheme } from 'react-native';

import { Text, TouchableOpacity, View } from '@/components/Themed';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';

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
  const colorTheme = useColorScheme();

  const [filters, setFilters] = useState<PlayerStatusFilter[]>(statusSelecteds);

  const isFiltersEmpty = filters.filter((item) => item.selected).length === 0;

  const handleStatusFilter = useCallback(() => {
    applyFilter(filters);
    handleClose();
  }, [filters]);

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
    <SafeAreaViewContainer>
      <View
        className="flex-1 rounded-lg pt-20"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
        <View
          className="items-center justify-between flex-row p-2 rounded-t-lg"
          style={{
            gap: 16,
          }}>
          <Text className="font-semibold text-lg">Filtrar Jogadores</Text>

          <TouchableOpacity
            onPress={handleClose}
            className="p-2 rounded-full border border-red-400 bg-red-300">
            <Feather name="x" color="#525252" size={24} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 px-2 pb-4">
          <FlatList
            contentContainerStyle={{
              gap: 8,
              padding: 8,
            }}
            data={filters}
            renderItem={({ item }) => {
              return (
                <View
                  className="flex-row justify-between p-4 rounded-lg items-center"
                  style={{
                    backgroundColor: colorTheme === 'dark' ? '#3b82f6' : '#eff6ff',
                  }}>
                  <Text className="font-semibold text-base">{item.title}</Text>
                  <Switch
                    trackColor={{ false: '#FFF', true: '#bfdbfe' }}
                    thumbColor={item.selected ? '#3b82f6' : '#f4f3f4'}
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
            onPress={handleStatusFilter}
            activeOpacity={0.6}
            className={`mx-2 p-4 rounded-lg items-center justify-center  ${
              isFiltersEmpty ? 'bg-gray-300' : 'bg-blue-500'
            }`}
            style={{
              gap: 16,
            }}>
            <Text className="font-semibold text-sm text-white">Filtrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaViewContainer>
  );
}
