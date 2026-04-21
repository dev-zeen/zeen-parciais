import { Feather } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { Modal } from 'react-native';

import {
  FilterMarketByStatus,
  PlayerStatusFilter,
} from './FilterMarketByStatus/FilterMarketByStatus';
import { OrderMarket, OrderSelectedProps } from './OrderMarket/OrderMarket';
import { sortedOptions, statusPlayerOptions } from './filters.helper';

import { Text, TouchableOpacity, View } from '@/components/Themed';
import { FilterMarketByTeam } from '@/components/contexts/market/MarketFilters/FilterMarketByTeam';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FullPlayer } from '@/models/Stats';
import { useGetMarket } from '@/queries/market.query';

type MarketFilterProps = {
  applyFilter: (players: FullPlayer[]) => void;
  handleIsLoading: () => void;
  maximumPrice?: number;
};

export function MarketFilters({ applyFilter, handleIsLoading, maximumPrice }: MarketFilterProps) {
  const colorTheme = useThemeColor();
  const { data: market } = useGetMarket();

  const [showOrderMarket, setShowOrderMarket] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderSelectedProps>(sortedOptions[0]);

  const [showFilterByStatusMarket, setShowFilterByStatusMarket] = useState(false);
  const [selectedFilterByStatusMarket, setSelectedFilterByStatusMarket] =
    useState<PlayerStatusFilter[]>(statusPlayerOptions);

  const [showFilterMarketByTeam, setShowFilterMarketByTeam] = useState(false);
  const [teamsSelectedFilter, setTeamsSelectedFilter] = useState<number[]>([]);

  const filterPlayers = useCallback(
    (players: FullPlayer[], filters: PlayerStatusFilter[], teams: number[]) => {
      const activeFilters = filters.filter((filter) => filter.selected);

      return players.filter((player) => {
        if (teams.length > 0) {
          return (
            activeFilters.some((filter) => filter.id === player.status_id) &&
            teams.some((team) => team === player.clube_id)
          );
        }
        return activeFilters.some((filter) => filter.id === player.status_id);
      });
    },
    []
  );

  const onGetPlayersFiltered = useCallback(
    (
      { onSort }: OrderSelectedProps,
      selectedFilters: PlayerStatusFilter[],
      selectedTeams: number[]
    ) => {
      const filteredPlayers = filterPlayers(
        market?.atletas as FullPlayer[],
        selectedFilters,
        selectedTeams
      );
      const sortedData = maximumPrice
        ? onSort(filteredPlayers as FullPlayer[]).filter((item) => item.preco_num < maximumPrice)
        : onSort(filteredPlayers as FullPlayer[]);
      return sortedData;
    },
    [filterPlayers, market?.atletas, maximumPrice]
  );

  const defaultFilters = useCallback(() => {
    handleIsLoading();
    setSelectedOrder(sortedOptions[0]);
    setSelectedFilterByStatusMarket(statusPlayerOptions);
    setTeamsSelectedFilter([]);

    const data = onGetPlayersFiltered(sortedOptions[0], statusPlayerOptions, []);
    applyFilter(data);
    setShowFilterMarketByTeam(false);
  }, [handleIsLoading, applyFilter, onGetPlayersFiltered]);

  const applyOrderMarket = useCallback(
    (option: OrderSelectedProps) => {
      if (option.id === selectedOrder.id) return;
      handleIsLoading();
      setSelectedOrder(option);
      const data = onGetPlayersFiltered(option, selectedFilterByStatusMarket, teamsSelectedFilter);
      applyFilter(data);
      setShowOrderMarket(false);
    },
    [
      selectedOrder,
      handleIsLoading,
      onGetPlayersFiltered,
      selectedFilterByStatusMarket,
      teamsSelectedFilter,
      applyFilter,
    ]
  );

  const applyFilterByStatus = useCallback(
    (filters: PlayerStatusFilter[]) => {
      handleIsLoading();
      setShowOrderMarket(false);
      setSelectedFilterByStatusMarket(filters);

      const data = onGetPlayersFiltered(selectedOrder, filters, teamsSelectedFilter);
      applyFilter(data);
    },
    [handleIsLoading, onGetPlayersFiltered, selectedOrder, teamsSelectedFilter, applyFilter]
  );

  const applyFilterByTeams = useCallback(
    (clubsSelecteds: number[]) => {
      setTeamsSelectedFilter(clubsSelecteds);
      handleIsLoading();
      const data = onGetPlayersFiltered(
        selectedOrder,
        selectedFilterByStatusMarket,
        clubsSelecteds
      );
      applyFilter(data);
    },
    [
      handleIsLoading,
      onGetPlayersFiltered,
      selectedOrder,
      selectedFilterByStatusMarket,
      applyFilter,
    ]
  );

  const filtersSelecteds = useMemo(
    () => selectedFilterByStatusMarket?.filter((filter) => filter.selected),
    [selectedFilterByStatusMarket]
  );

  const titleFilterByStatus = useMemo(
    () =>
      filtersSelecteds.length > 1
        ? `${filtersSelecteds[0].title} + ${filtersSelecteds.length - 1}`
        : filtersSelecteds[0].title,
    [filtersSelecteds]
  );

  const titleFilterByTeams = useMemo(
    () =>
      teamsSelectedFilter.length > 1
        ? `${market?.clubes[teamsSelectedFilter[0]].nome} + ${teamsSelectedFilter.length - 1}`
        : teamsSelectedFilter.length === 1
        ? market?.clubes[teamsSelectedFilter[0]].nome
        : 'Times',
    [market, teamsSelectedFilter]
  );

  return (
    <>
      <View 
        className="flex-row rounded-lg items-center p-2 justify-center"
        style={{
          backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
          borderWidth: 1,
          borderColor: colorTheme === 'dark' ? '#1f2937' : '#f3f4f6',
        }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowOrderMarket(true)}
          className="w-1/3 p-2 rounded-lg flex-row items-center justify-center"
          style={{
            gap: 6,
            backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#f9fafb',
            borderWidth: 1,
            borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
          }}>
          <Feather 
            name="bar-chart" 
            color={colorTheme === 'dark' ? '#5B8EFF' : '#0057FF'} 
            size={18}
          />
          <Text 
            className="text-xs font-semibold"
            style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}
            numberOfLines={1}>
            {selectedOrder?.title}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          className="w-1/3 p-2 rounded-lg flex-row items-center justify-center mx-1"
          style={{
            gap: 6,
            backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#f9fafb',
            borderWidth: 1,
            borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
          }}
          onPress={() => setShowFilterByStatusMarket(true)}>
          <Feather 
            name="user-check" 
            color={colorTheme === 'dark' ? '#5B8EFF' : '#0057FF'} 
            size={18} 
          />
          <Text 
            className="text-xs font-semibold" 
            style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}
            numberOfLines={1}>
            {titleFilterByStatus}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          className="w-1/3 p-2 rounded-lg flex-row items-center justify-center"
          style={{
            gap: 6,
            backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#f9fafb',
            borderWidth: 1,
            borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
          }}
          onPress={() => setShowFilterMarketByTeam(true)}>
          <Feather 
            name="filter" 
            color={colorTheme === 'dark' ? '#5B8EFF' : '#0057FF'} 
            size={18} 
          />
          <Text 
            className="text-xs font-semibold"
            style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}
            numberOfLines={1}>
            {titleFilterByTeams}
          </Text>
        </TouchableOpacity>
      </View>

      {showOrderMarket && (
        <Modal
          visible={showOrderMarket}
          animationType="fade"
          transparent
          onRequestClose={() => setShowOrderMarket(false)}>
          <OrderMarket
            currentOrder={selectedOrder as OrderSelectedProps}
            applyOrderMarket={applyOrderMarket}
            handleClose={() => setShowOrderMarket(false)}
          />
        </Modal>
      )}

      {showFilterByStatusMarket && (
        <Modal
          visible={showFilterByStatusMarket}
          animationType="fade"
          transparent
          onRequestClose={() => setShowFilterByStatusMarket(false)}>
          <FilterMarketByStatus
            statusSelecteds={selectedFilterByStatusMarket}
            applyFilter={applyFilterByStatus}
            handleClose={() => setShowFilterByStatusMarket(false)}
          />
        </Modal>
      )}

      {showFilterMarketByTeam && (
        <Modal
          visible={showFilterMarketByTeam}
          animationType="fade"
          transparent
          onRequestClose={() => setShowFilterMarketByTeam(false)}>
          <FilterMarketByTeam
            applyFilter={applyFilterByTeams}
            handleClose={() => setShowFilterMarketByTeam(false)}
            selectedTeams={teamsSelectedFilter}
            defaultFilters={defaultFilters}
          />
        </Modal>
      )}
    </>
  );
}
