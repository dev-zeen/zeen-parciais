import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ListRenderItemInfo, Modal } from "react-native";

import { Feather } from "@expo/vector-icons";

import { Text, TouchableOpacity, View } from "@/components/Themed";
import { MarketFilter } from "@/components/contexts/market/MarketFilter";
import { MarketPlayerCard } from "@/components/contexts/market/MarketPlayerCard";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { ENUM_STATUS_MARKET_PLAYER } from "@/constants/StatusPlayer";
import { LineupPlayers, LineupPosition } from "@/models/Formations";
import { Market as MarketModel } from "@/models/Market";
import { FullPlayer } from "@/models/Stats";
import { useGetMyClub } from "@/queries/club.query";
import { useGetMarket } from "@/queries/market.query";
import useTeamLineupStore from "@/store/useTeamLineupStore";
import { numberToString } from "@/utils/parseTo";

type MarketProps = {
  handleCloseMarketModal: () => void;
  position?: LineupPosition | null;
  index?: number;
};

export function Market({
  position,
  handleCloseMarketModal,
  index,
}: MarketProps) {
  const allowRequest = true;
  const { data: club } = useGetMyClub(allowRequest);

  const { data: marketData } = useGetMarket();

  const upateLineup = useTeamLineupStore((state) => state.updateLineup);
  const removePlayerFromLineup = useTeamLineupStore(
    (state) => state.removePlayerFromLineup
  );
  const lineup = useTeamLineupStore((state) => state.lineup);
  const price = useTeamLineupStore((state) => state.price);

  console.log("render market?");

  const remainingValue = useMemo(
    () => club && price && (club?.patrimonio as number) - price,
    [club, price]
  );

  const [showFilterMarketModal, setShowFilterMarketModal] = useState(false);
  const [marketPlayers, setMarketPlayers] = useState<FullPlayer[]>();
  const [searchPlayerParam, setSearchPlayerParam] =
    useState<LineupPosition | null>();

  const handleAddPlayerToLineup = useCallback(
    (player: FullPlayer, targetIndex?: number) => {
      const playersUpdated = [...(lineup?.players || [])];

      const addPlayerToIndex = (index: number) => {
        if (!playersUpdated[index].player) {
          playersUpdated[index] = {
            ...playersUpdated[index],
            player,
          };
        }
      };

      if (
        typeof targetIndex !== "undefined" &&
        targetIndex >= 0 &&
        targetIndex < playersUpdated.length
      ) {
        addPlayerToIndex(targetIndex);
      } else {
        const emptyIndex = playersUpdated.findIndex(
          (item) => item.position === player.posicao_id && !item.player
        );
        if (emptyIndex !== -1) {
          addPlayerToIndex(emptyIndex);
        }
      }

      const lineupUpdated = {
        ...lineup,
        players: playersUpdated as LineupPosition[],
      } as LineupPlayers;

      upateLineup(lineupUpdated);

      handleCloseMarketModal();
    },
    []
  );

  const handleRemovePlayerFromLineup = useCallback((player: FullPlayer) => {
    removePlayerFromLineup(player);
  }, []);

  useEffect(() => {
    const filterAndSortPlayers = (
      data: MarketModel,
      position?: LineupPosition
    ) => {
      return data.atletas
        .filter(
          (item) =>
            (!position || item.posicao_id === position.position) &&
            item.status_id === ENUM_STATUS_MARKET_PLAYER.PROVAVEL
        )
        .sort((a, b) => b.preco_num - a.preco_num);
    };

    if (marketData) {
      if (position) {
        setSearchPlayerParam(position);
        const marketPlayersUpdated = filterAndSortPlayers(marketData, position);
        setMarketPlayers(marketPlayersUpdated);
      } else {
        const marketPlayersLikely = filterAndSortPlayers(marketData);
        setMarketPlayers(marketPlayersLikely);
      }
    }
  }, [marketData, searchPlayerParam, price]);

  const keyExtractor = useCallback(
    (item: FullPlayer) => `${item.atleta_id}`,
    []
  );

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<FullPlayer>) => {
      return (
        <MarketPlayerCard
          player={player}
          onPressAddPlayerToLineup={() =>
            handleAddPlayerToLineup(player, index)
          }
          onPressRemovePlayerFromLineup={() =>
            handleRemovePlayerFromLineup(player)
          }
          isPurchaseDisabled={player.preco_num > (remainingValue as number)}
          isSellPlayer={lineup?.players.some(
            (item) => item.player?.atleta_id === player.atleta_id
          )}
        />
      );
    },
    [lineup]
  );

  if (!marketPlayers || !club) return <Loading />;

  return (
    <SafeAreaViewContainer>
      <View
        className="justify-between items-center flex-row p-2 mx-2 rounded-lg mb-2"
        style={{
          marginHorizontal: 4,
        }}
      >
        <TouchableOpacity
          onPress={handleCloseMarketModal}
          className="p-2 rounded-full bg-white"
        >
          <Feather name="x" color="#525252" size={24} />
        </TouchableOpacity>

        <View className="flex-1 flex-row justify-evenly">
          <View className="justify-center items-center gap-1">
            <Text className="font-light text-xs">Valor atual</Text>
            <Text className="font-bold text-xs text-green-500">
              {price && numberToString(price)}
            </Text>
          </View>

          <View className="justify-center items-center gap-1">
            <Text className="font-light text-xs">Restante</Text>
            <Text className="font-bold text-xs text-green-500">
              {price && numberToString(remainingValue)}
            </Text>
          </View>
        </View>

        <TouchableOpacity className="p-2 bg-white rounded-full">
          <Feather name="search" color="#525252" size={24} />
        </TouchableOpacity>
      </View>

      <View
        className="justify-between items-center flex-row p-2 mx-2 rounded-lg mb-2"
        style={{
          marginHorizontal: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setShowFilterMarketModal(true);
          }}
          className="p-2 rounded-full flex-row items-center justify-center"
          style={{
            gap: 8,
          }}
        >
          <Feather name="bar-chart" color="#9ca3af" size={18} />
          <Text className="text-sm font-semibold">Mais Caros</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-2 rounded-full flex-row items-center justify-center"
          style={{
            gap: 8,
          }}
          onPress={() => {
            setShowFilterMarketModal(true);
          }}
        >
          <Feather name="user-check" color="#9ca3af" size={18} />
          <Text className="text-sm font-semibold">Provavél</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-2 rounded-full flex-row items-center justify-center"
          style={{
            gap: 8,
          }}
          onPress={() => {
            setShowFilterMarketModal(true);
          }}
        >
          <Feather name="filter" color="#9ca3af" size={18} />
          <Text className="text-sm font-semibold">Filtrar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={{
          gap: 8,
        }}
        data={marketPlayers}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        maxToRenderPerBatch={6}
        initialNumToRender={6}
        removeClippedSubviews={true}
        windowSize={6}
      />

      {showFilterMarketModal && (
        <Modal
          visible={showFilterMarketModal}
          animationType="slide"
          transparent
        >
          <MarketFilter handleClose={() => setShowFilterMarketModal(false)} />
        </Modal>
      )}
    </SafeAreaViewContainer>
  );
}
