import { Feather } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FlatList, ListRenderItemInfo, useColorScheme } from 'react-native';

import { Text, TouchableOpacity, View } from '@/components/Themed';
import { MarketFilters } from '@/components/contexts/market/MarketFilters';
import { MarketPlayerCard } from '@/components/contexts/market/MarketPlayerCard';
import { PlayerLowestCard } from '@/components/contexts/market/PlayerLowestCard.tsx';
import { Loading } from '@/components/structure/Loading';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { AuthContext } from '@/contexts/Auth.context';
import useLineup from '@/hooks/useLineup';
import useMarket from '@/hooks/useMarket';
import useMyClub from '@/hooks/useMyClub';
import { LineupPlayer, LineupPosition } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { filterAndSortPlayersFromMarket } from '@/utils/market';
import { numberToString } from '@/utils/parseTo';

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
  const isFirstRender = useRef(true);

  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { myClub } = useMyClub();

  const { market } = useMarket();

  const addPlayerToLineup = useTeamLineupStore((state) => state.addPlayerToLineup);
  const removePlayerFromLineup = useTeamLineupStore((state) => state.removePlayerFromLineup);

  const [isLoading, setIsLoading] = useState(false);

  const { lineup, price, balancePrice, emptyPositions } = useLineup();
  const [marketPlayers, setMarketPlayers] = useState<FullPlayer[]>();

  const handleAddPlayerToLineup = useCallback(
    (player: FullPlayer, targetIndex?: number) => {
      addPlayerToLineup({
        player,
        index: undefined,
        isReservePlayer: !!playerLowestPrice,
      });
      if (!!playerLowestPrice && handleCloseMarketModal) handleCloseMarketModal();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleRemovePlayerFromLineup = useCallback((player: FullPlayer) => {
    removePlayerFromLineup(player);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIsLoading = useCallback(() => {
    setIsLoading((previous) => !previous);
  }, []);

  const applyFilter = useCallback(
    (data?: FullPlayer[]) => {
      if (data) {
        const playersUpdated = position
          ? data.filter((item) => item.posicao_id === position.position)
          : data;

        setMarketPlayers(playersUpdated);
        handleIsLoading();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [position]
  );

  const handleCloseMarket = useCallback(
    () => (handleCloseMarketModal ? handleCloseMarketModal() : router.push('/team/')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (market && isFirstRender.current) {
      if (position) {
        const marketPlayersUpdated = filterAndSortPlayersFromMarket(
          market,
          position,
          playerLowestPrice
        );
        setMarketPlayers(marketPlayersUpdated);
      } else {
        const marketPlayersLikely = filterAndSortPlayersFromMarket(market);
        setMarketPlayers(marketPlayersLikely);
      }

      isFirstRender.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market]);

  const keyExtractor = useCallback((item: FullPlayer) => `${item.atleta_id}`, []);

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<FullPlayer>) => (
      <MarketPlayerCard
        player={player}
        onPressAddPlayerToLineup={() => handleAddPlayerToLineup(player, playerIndex)}
        onPressRemovePlayerFromLineup={() => handleRemovePlayerFromLineup(player)}
        isButtonDisabled={
          (!playerLowestPrice && player.preco_num > balancePrice) ||
          (!playerLowestPrice && !emptyPositions?.has(player.posicao_id))
        }
        isSellPlayer={lineup?.starting.some((item) => item.player?.atleta_id === player.atleta_id)}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [emptyPositions]
  );

  if (!isAutheticated) return <Redirect href="/(tabs)/team" />;

  if (!marketPlayers || !myClub || isLoading) return <Loading />;

  return (
    <SafeAreaViewContainer>
      <View className={`flex-1 mx-2 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
        <View className="justify-between items-center flex-row rounded-lg mb-2 py-2 px-4">
          <View
            className="flex-row items-center"
            style={{
              gap: 16,
            }}>
            <View className="justify-center items-center gap-1">
              <Text className="font-light text-xs">Valor atual</Text>
              <Text className="font-bold text-xs text-green-500">{numberToString(price)}</Text>
            </View>

            <View className="justify-center items-center gap-1">
              <Text className="font-light text-xs">Restante</Text>
              <Text className="font-bold text-xs text-green-500">
                {numberToString(balancePrice)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCloseMarket}
            className="p-2 rounded-full border border-red-400 bg-red-300">
            <Feather name="x" color="#525252" size={24} />
          </TouchableOpacity>

          {/* <TouchableOpacity className="p-2 bg-white border-2 border-gray-300 rounded-full">
            <Feather name="search" color="#525252" size={30} />
          </TouchableOpacity> */}
        </View>

        <MarketFilters
          applyFilter={applyFilter}
          handleIsLoading={handleIsLoading}
          maximumPrice={playerLowestPrice?.preco_num}
        />

        {playerLowestPrice && <PlayerLowestCard player={playerLowestPrice as LineupPlayer} />}

        <FlatList
          data={marketPlayers}
          contentContainerStyle={{
            paddingVertical: 8,
            gap: 8,
          }}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          maxToRenderPerBatch={7}
          initialNumToRender={7}
          windowSize={7}
        />
      </View>
    </SafeAreaViewContainer>
  );
};
