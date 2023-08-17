import { useCallback, useMemo, useState } from "react";
import { Modal } from "react-native";

import { Feather } from "@expo/vector-icons";

import { Text, TouchableOpacity, View } from "@/components/Themed";
import { FullPlayer } from "@/models/Stats";
import { useGetMarket } from "@/queries/market.query";

import {
  FilterMarketByStatus,
  PlayerStatusFilter,
} from "./FilterMarketByStatus/FilterMarketByStatus";
import { OrderMarket, OrderSelectedProps } from "./OrderMarket/OrderMarket";
import { sortedOptions, statusPlayerOptions } from "./filters.helper";

type MarketFilterProps = {
  data: FullPlayer[];
  applyFilter: (players: FullPlayer[]) => void;
  handleIsLoading: () => void;
};

export function MarketFilters({
  data,
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

  const [showFiltersMarket, setShowFiltersMarket] = useState(false);
  const [selectedFilterMarket, setSelectedFilterMarket] = useState("Provável");

  const applyOrderMarket = useCallback(
    (option: OrderSelectedProps) => {
      if (option.id === selectedOrder.id) return;
      handleIsLoading();
      // const data = onGetPlayersByStatus(selectedFilterByStatusMarket);
      const marketPlayersUpdated = option.onSort(data as FullPlayer[]);
      applyFilter(marketPlayersUpdated);
      setSelectedOrder(option);
      setShowOrderMarket(false);
    },
    [selectedOrder, selectedFilterByStatusMarket]
  );

  const onGetPlayersByStatus = useCallback(
    (filtersStatus: PlayerStatusFilter[]) => {
      const filtersSelecteds = filtersStatus.filter((item) => item.selected);

      const marketPlayersFilteredByStatus = market?.atletas.filter((player) =>
        filtersSelecteds.some((item) => item.id === player.status_id)
      );

      return marketPlayersFilteredByStatus;
    },
    [market]
  );

  const onGetOrderMarketPlayers = useCallback(
    (marketPlayers: FullPlayer[]) => {
      const marketPlayersOrdened = selectedOrder.onSort(marketPlayers);
      return marketPlayersOrdened;
    },
    [selectedOrder]
  );

  const applyFilterByStatus = useCallback(
    (filters: PlayerStatusFilter[]) => {
      handleIsLoading();
      setShowOrderMarket(false);

      setSelectedFilterByStatusMarket(filters);

      const marketPlayersFiltered = onGetPlayersByStatus(filters);
      const marketPlayersUpdated = onGetOrderMarketPlayers(
        marketPlayersFiltered as FullPlayer[]
      );

      applyFilter(marketPlayersUpdated as FullPlayer[]);
    },
    [selectedOrder]
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
          onPress={() => setShowFiltersMarket(true)}
        >
          <Feather name="filter" color="#9ca3af" size={20} />
          <Text className="text-xs font-semibold">Filtrar</Text>
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

      {/* {showFiltersMarket && (
        <Modal
          visible={!!showFiltersMarket}
          animationType="fade"
          transparent
          onRequestClose={() => setShowFiltersMarket(false)}
        >
          <MarketFilter
            type="filter"
            applyFilter={applyFilter}
            handleClose={() => setShowFiltersMarket(false)}
          />
        </Modal>
      )} */}
    </>
  );
}
