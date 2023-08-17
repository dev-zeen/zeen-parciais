import { useCallback, useMemo, useState } from "react";
import { Modal } from "react-native";

import { Feather } from "@expo/vector-icons";

import { Text, TouchableOpacity, View } from "@/components/Themed";
import { FullPlayer } from "@/models/Stats";
import { useGetMarket } from "@/queries/market.query";

import { FilterMarketByTeam } from "@/components/contexts/market/MarketFilters/FilterMarketByTeam";
import {
  FilterMarketByStatus,
  PlayerStatusFilter,
} from "./FilterMarketByStatus/FilterMarketByStatus";
import { OrderMarket, OrderSelectedProps } from "./OrderMarket/OrderMarket";
import { sortedOptions, statusPlayerOptions } from "./filters.helper";

type MarketFilterProps = {
  applyFilter: (players: FullPlayer[]) => void;
  handleIsLoading: () => void;
};

export function MarketFilters({
  applyFilter,
  handleIsLoading,
}: MarketFilterProps) {
  const { data: market } = useGetMarket();

  const [showOrderMarket, setShowOrderMarket] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderSelectedProps>(
    sortedOptions[0]
  );

  const [showFilterByStatusMarket, setShowFilterByStatusMarket] =
    useState(false);
  const [selectedFilterByStatusMarket, setSelectedFilterByStatusMarket] =
    useState<PlayerStatusFilter[]>(statusPlayerOptions);

  const [showFilterMarketByTeam, setShowFilterMarketByTeam] = useState(false);
  const [teamsSelectedFilter, setTeamsSelectedFilter] = useState<number[]>([]);

  const defaultFilters = useCallback(() => {
    const data = onGetPlayersFiltered(
      sortedOptions[0],
      statusPlayerOptions,
      []
    );
    applyFilter(data);
  }, []);

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
      const sortedData = onSort(filteredPlayers as FullPlayer[]);
      return sortedData;
    },
    [market, selectedOrder, selectedFilterByStatusMarket, teamsSelectedFilter]
  );

  const applyOrderMarket = useCallback(
    (option: OrderSelectedProps) => {
      if (option.id === selectedOrder.id) return;
      handleIsLoading();
      setSelectedOrder(option);
      const data = onGetPlayersFiltered(
        option,
        selectedFilterByStatusMarket,
        teamsSelectedFilter
      );
      applyFilter(data);
      setShowOrderMarket(false);
    },
    [selectedOrder, selectedFilterByStatusMarket, teamsSelectedFilter]
  );

  const applyFilterByStatus = useCallback(
    (filters: PlayerStatusFilter[]) => {
      handleIsLoading();
      setShowOrderMarket(false);
      setSelectedFilterByStatusMarket(filters);

      const data = onGetPlayersFiltered(
        selectedOrder,
        filters,
        teamsSelectedFilter
      );
      applyFilter(data);
    },
    [selectedOrder, selectedFilterByStatusMarket, teamsSelectedFilter]
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
    [selectedOrder, selectedFilterByStatusMarket, teamsSelectedFilter]
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
        ? `${market?.clubes[teamsSelectedFilter[0]].nome} + ${
            teamsSelectedFilter.length - 1
          }`
        : teamsSelectedFilter.length === 1
        ? market?.clubes[teamsSelectedFilter[0]].nome
        : "Times",
    [teamsSelectedFilter]
  );

  return (
    <>
      <View className="flex-row rounded-lg items-center p-2">
        <TouchableOpacity
          onPress={() => setShowOrderMarket(true)}
          className="w-1/3 p-2 rounded-full flex-row items-center justify-center"
          style={{
            gap: 8,
          }}
        >
          <Feather name="bar-chart" color="#9ca3af" size={20} />
          <Text className="text-xs font-semibold">{selectedOrder?.title}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-1/3 p-2 rounded-full flex-row items-center justify-center"
          style={{
            gap: 8,
          }}
          onPress={() => setShowFilterByStatusMarket(true)}
        >
          <Feather name="user-check" color="#9ca3af" size={20} />
          <Text className="text-xs font-semibold" numberOfLines={1}>
            {titleFilterByStatus}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-1/3 p-2 rounded-full flex-row items-center justify-center"
          style={{
            gap: 8,
          }}
          onPress={() => setShowFilterMarketByTeam(true)}
        >
          <Feather name="filter" color="#9ca3af" size={20} />
          <Text className="text-xs font-semibold">{titleFilterByTeams}</Text>
        </TouchableOpacity>
      </View>

      {showOrderMarket && (
        <Modal
          visible={showOrderMarket}
          animationType="fade"
          transparent
          onRequestClose={() => setShowOrderMarket(false)}
        >
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
          onRequestClose={() => setShowFilterByStatusMarket(false)}
        >
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
          onRequestClose={() => setShowFilterMarketByTeam(false)}
        >
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
