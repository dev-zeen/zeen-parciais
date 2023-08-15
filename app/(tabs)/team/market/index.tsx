import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  useColorScheme,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text, TouchableOpacity, View } from "@/components/Themed";
import { MarketFilter } from "@/components/contexts/market/MarketFilter";
import { MarketPlayerCard } from "@/components/contexts/market/MarketPlayerCard";
import { PlayerLowestCard } from "@/components/contexts/market/PlayerLowestCard.tsx";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { ENUM_STATUS_MARKET_PLAYER } from "@/constants/StatusPlayer";
import {
  LineupPlayer,
  LineupPlayers,
  LineupPosition,
} from "@/models/Formations";
import { Market as MarketModel } from "@/models/Market";
import { FullPlayer } from "@/models/Stats";
import { useGetMyClub } from "@/queries/club.query";
import { useGetMarket } from "@/queries/market.query";
import useTeamLineupStore from "@/store/useTeamLineupStore";
import { numberToString } from "@/utils/parseTo";
import { onGetTeamPrice, onRemovePlayerFromLineup } from "@/utils/team";

type MarketProps = {
  position?: LineupPosition | null;
  playerIndex?: number;
  playerLowestPrice?: LineupPlayer | FullPlayer;
  handleCloseMarketModal?: () => void;
};

export default ({
  position,
  handleCloseMarketModal,
  playerIndex,
  playerLowestPrice,
}: MarketProps) => {
  const colorTheme = useColorScheme();

  const allowRequest = true;
  const { data: club } = useGetMyClub(allowRequest);
  const { data: marketData } = useGetMarket();

  const upateLineup = useTeamLineupStore((state) => state.updateLineup);
  const lineup = useTeamLineupStore((state) => state.lineup);
  const updatePrice = useTeamLineupStore((state) => state.updatePrice);
  const price = useTeamLineupStore((state) => state.price);
  const updateCapitain = useTeamLineupStore((state) => state.updateCapitain);
  const capitain = useTeamLineupStore((state) => state.capitain);
  const addPlayerToLineup = useTeamLineupStore(
    (state) => state.addPlayerToLineup
  );

  const remainingValue = useMemo(() => {
    if (club && price) {
      return club.patrimonio - price;
    }
    return club?.patrimonio as number;
  }, [club, price]);

  const [emptyPositions, setEmptyPositions] = useState<Set<number>>();
  const [showFilterMarketModal, setShowFilterMarketModal] = useState(false);
  const [marketPlayers, setMarketPlayers] = useState<FullPlayer[]>();
  const [searchPlayerParam, setSearchPlayerParam] =
    useState<LineupPosition | null>();

  const handleAddPlayerToLineup = useCallback(
    (player: FullPlayer, targetIndex?: number) => {
      addPlayerToLineup({
        player,
        index: targetIndex,
        isReservePlayer: !!playerLowestPrice,
      });
      if (handleCloseMarketModal) handleCloseMarketModal();
    },
    []
  );

  const handleRemovePlayerFromLineup = useCallback(
    (lineup: LineupPlayers, player: FullPlayer) => {
      const lineupUpdated: LineupPlayers = onRemovePlayerFromLineup(
        lineup,
        player
      );

      if (capitain === player.atleta_id) updateCapitain(0);

      const newPrice = onGetTeamPrice(lineupUpdated.starting);
      updatePrice(newPrice);
      upateLineup(lineupUpdated);
    },
    []
  );

  const handleShowMarketFilters = useCallback(() => {
    setShowFilterMarketModal((previous) => !previous);
  }, []);

  useEffect(() => {
    const filterAndSortPlayers = (
      data: MarketModel,
      position?: LineupPosition
    ) => {
      const marketPlayers = data.atletas
        .filter(
          (item) =>
            (!position || item.posicao_id === position.position) &&
            item.status_id === ENUM_STATUS_MARKET_PLAYER.PROVAVEL
        )
        .sort((a, b) => b.preco_num - a.preco_num);

      if (playerLowestPrice) {
        return marketPlayers.filter(
          (item) => item.preco_num < playerLowestPrice.preco_num
        );
      }
      return marketPlayers;
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

  useEffect(() => {
    if (lineup) {
      const emptyPositionsUpdated = new Set(
        (lineup?.starting || [])
          .filter(({ player }) => !player)
          .map(({ position }) => position)
      );
      setEmptyPositions(emptyPositionsUpdated);
    }
  }, [lineup]);

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
            handleAddPlayerToLineup(player, playerIndex)
          }
          onPressRemovePlayerFromLineup={() =>
            handleRemovePlayerFromLineup(lineup as LineupPlayers, player)
          }
          isButtonDisabled={
            player.preco_num > remainingValue ||
            (!playerLowestPrice && !emptyPositions?.has(player.posicao_id))
          }
          isSellPlayer={lineup?.starting.some(
            (item) => item.player?.atleta_id === player.atleta_id
          )}
        />
      );
    },
    [emptyPositions]
  );

  const handleCloseMarket = useCallback(
    () =>
      handleCloseMarketModal ? handleCloseMarketModal() : router.push("/team/"),
    []
  );

  if (!marketPlayers || !club) return <Loading />;

  return (
    <SafeAreaViewContainer>
      <View
        className={`flex-1 mx-2 ${
          colorTheme === "dark" ? "bg-dark" : "bg-light"
        }`}
      >
        <View className="justify-between items-center flex-row rounded-lg mb-2 p-2">
          <TouchableOpacity
            onPress={handleCloseMarket}
            className="p-2 rounded-full border border-red-400 bg-red-300"
          >
            <Feather name="x" color="#525252" size={24} />
          </TouchableOpacity>

          <View className="justify-center items-center gap-1">
            <Text className="font-light text-xs">Valor atual</Text>
            <Text className="font-bold text-xs text-green-500">
              {numberToString(price)}
            </Text>
          </View>

          <View className="justify-center items-center gap-1">
            <Text className="font-light text-xs">Restante</Text>
            <Text className="font-bold text-xs text-green-500">
              {numberToString(remainingValue)}
            </Text>
          </View>

          <TouchableOpacity className="p-2 bg-white border-2 border-gray-300 rounded-full">
            <Feather name="search" color="#525252" size={30} />
          </TouchableOpacity>
        </View>

        <View className="justify-between items-center flex-row rounded-lg mb-2 p-2">
          <TouchableOpacity
            onPress={handleShowMarketFilters}
            className="p-2 rounded-full flex-row items-center justify-center"
            style={{
              gap: 8,
            }}
          >
            <Feather name="bar-chart" color="#9ca3af" size={20} />
            <Text className="text-xs font-semibold">Mais Caros</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-2 rounded-full flex-row items-center justify-center"
            style={{
              gap: 8,
            }}
            onPress={handleShowMarketFilters}
          >
            <Feather name="user-check" color="#9ca3af" size={20} />
            <Text className="text-xs font-semibold">Provavél</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-2 rounded-full flex-row items-center justify-center"
            style={{
              gap: 8,
            }}
            onPress={handleShowMarketFilters}
          >
            <Feather name="filter" color="#9ca3af" size={20} />
            <Text className="text-xs font-semibold">Filtrar</Text>
          </TouchableOpacity>
        </View>

        {playerLowestPrice && (
          <PlayerLowestCard player={playerLowestPrice as LineupPlayer} />
        )}

        <FlatList
          contentContainerStyle={{
            gap: 8,
            paddingVertical: 8,
          }}
          data={marketPlayers}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          maxToRenderPerBatch={6}
          initialNumToRender={6}
          removeClippedSubviews={true}
          windowSize={6}
        />
      </View>

      {showFilterMarketModal && (
        <Modal
          visible={showFilterMarketModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowFilterMarketModal(false)}
        >
          <MarketFilter handleClose={() => setShowFilterMarketModal(false)} />
        </Modal>
      )}
    </SafeAreaViewContainer>
  );
};
