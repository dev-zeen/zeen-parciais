import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, ListRenderItemInfo, useColorScheme } from "react-native";

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text, TouchableOpacity, View } from "@/components/Themed";
import { MarketFilters } from "@/components/contexts/market/MarketFilters";
import { MarketPlayerCard } from "@/components/contexts/market/MarketPlayerCard";
import { PlayerLowestCard } from "@/components/contexts/market/PlayerLowestCard.tsx";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { LineupPlayer, LineupPosition } from "@/models/Formations";
import { FullPlayer } from "@/models/Stats";
import { useGetMyClub } from "@/queries/club.query";
import { useGetMarket } from "@/queries/market.query";
import useTeamLineupStore from "@/store/useTeamLineupStore";
import { filterAndSortPlayersFromMarket } from "@/utils/market";
import { numberToString } from "@/utils/parseTo";

type MarketProps = {
  position?: LineupPosition;
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

  const isFirstRender = useRef(true);

  const allowRequest = true;

  const { data: club } = useGetMyClub(allowRequest);
  const { data: marketData } = useGetMarket();

  const lineup = useTeamLineupStore((state) => state.lineup);
  const price = useTeamLineupStore((state) => state.price);
  const addPlayerToLineup = useTeamLineupStore(
    (state) => state.addPlayerToLineup
  );
  const removePlayerFromLineup = useTeamLineupStore(
    (state) => state.removePlayerFromLineup
  );

  const remainingValue = useMemo(() => {
    if (club && price) {
      return club.patrimonio - price;
    }
    return club?.patrimonio as number;
  }, [club, price]);

  const [isLoading, setIsLoading] = useState(false);
  const [emptyPositions, setEmptyPositions] = useState<Set<number>>();
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

  const handleRemovePlayerFromLineup = useCallback((player: FullPlayer) => {
    removePlayerFromLineup(player);
  }, []);

  const handleIsLoading = useCallback(() => {
    setIsLoading((previous) => !previous);
  }, []);

  const applyFilter = useCallback((data: FullPlayer[]) => {
    const playersUpdated = position
      ? data.filter((item) => item.posicao_id === position.position)
      : data;

    setMarketPlayers(playersUpdated);
    handleIsLoading();
  }, []);

  const handleCloseMarket = useCallback(
    () =>
      handleCloseMarketModal ? handleCloseMarketModal() : router.push("/team/"),
    []
  );

  const keyExtractor = useCallback(
    (item: FullPlayer) => `${item.atleta_id}`,
    []
  );

  useEffect(() => {
    if (marketData && isFirstRender.current) {
      if (position) {
        setSearchPlayerParam(position);
        const marketPlayersUpdated = filterAndSortPlayersFromMarket(
          marketData,
          position,
          playerLowestPrice
        );
        setMarketPlayers(marketPlayersUpdated);
      } else {
        const marketPlayersLikely = filterAndSortPlayersFromMarket(marketData);
        setMarketPlayers(marketPlayersLikely);
      }

      isFirstRender.current = false;
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

  const shouldDisableButton = useCallback(
    (player: FullPlayer) => {
      return (
        player.preco_num > remainingValue ||
        (!playerLowestPrice && !emptyPositions?.has(player.posicao_id))
      );
    },
    [emptyPositions]
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
            handleRemovePlayerFromLineup(player)
          }
          isButtonDisabled={shouldDisableButton(player)}
          isSellPlayer={lineup?.starting.some(
            (item) => item.player?.atleta_id === player.atleta_id
          )}
        />
      );
    },
    [emptyPositions]
  );

  if (!marketPlayers || !club || isLoading) return <Loading />;

  return (
    <SafeAreaViewContainer>
      <View
        className={`flex-1 mx-2 ${
          colorTheme === "dark" ? "bg-dark" : "bg-light"
        }`}
      >
        <View className="justify-between items-center flex-row rounded-lg mb-2 p-2">
          <View
            className="flex-row items-center"
            style={{
              gap: 16,
            }}
          >
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
          </View>

          <TouchableOpacity
            onPress={handleCloseMarket}
            className="p-2 rounded-full border border-red-400 bg-red-300"
          >
            <Feather name="x" color="#525252" size={24} />
          </TouchableOpacity>

          {/* <TouchableOpacity className="p-2 bg-white border-2 border-gray-300 rounded-full">
            <Feather name="search" color="#525252" size={30} />
          </TouchableOpacity> */}
        </View>

        <MarketFilters
          applyFilter={applyFilter}
          handleIsLoading={handleIsLoading}
        />

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
    </SafeAreaViewContainer>
  );
};
