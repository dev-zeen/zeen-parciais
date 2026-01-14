import { Feather } from '@expo/vector-icons';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';

import { onGetEmptyPositions } from '@/app/(tabs)/team/_team.helpers';
import { Text, TouchableOpacity, View } from '@/components/Themed';
import { MarketFilters } from '@/components/contexts/market/MarketFilters';
import { MarketPlayerCard } from '@/components/contexts/market/MarketPlayerCard';
import { PlayerLowestCard } from '@/components/contexts/market/PlayerLowestCard.tsx';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import Colors from '@/constants/Colors';
import { LineupPlayer, LineupPosition } from '@/models/Formations';
import { Market } from '@/models/Market';
import { Matches } from '@/models/Matches';
import { FullPlayer, IPositions } from '@/models/Stats';
import { useGetMyClub } from '@/queries/club.query';
import { useGetMarket } from '@/queries/market.query';
import { useGetMatchs } from '@/queries/matches.query';
import { useGetPositions } from '@/queries/players.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { filterAndSortPlayersFromMarket } from '@/utils/market';
import { numberToString } from '@/utils/parseTo';
import { onBalancePrice } from '@/utils/team';

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

  const { data: myClub } = useGetMyClub();

  const { data: market } = useGetMarket();

  const { data: matches } = useGetMatchs();

  const { data: positions } = useGetPositions();

  const addPlayerToLineup = useTeamLineupStore((state) => state.addPlayerToLineup);
  const removePlayerFromLineup = useTeamLineupStore((state) => state.removePlayerFromLineup);

  const lineup = useTeamLineupStore((state) => state.lineup);
  const price = useTeamLineupStore((state) => state.price);

  const [isFiltering, setIsFiltering] = useState(false);
  const [marketPlayers, setMarketPlayers] = useState<FullPlayer[]>();

  const emptyPositions = useMemo(() => lineup && onGetEmptyPositions(lineup), [lineup]);

  const currentBalancePrice = useMemo(() => {
    if (myClub && price >= 0) return onBalancePrice(myClub.patrimonio || 0, price);
    return 0;
  }, [myClub, price]);

  const handleAddPlayerToLineup = useCallback(
    (player: FullPlayer, targetIndex?: number) => {
      addPlayerToLineup({
        player,
        index: undefined,
        isReservePlayer: !!playerLowestPrice,
      });
      // if (!!playerLowestPrice && handleCloseMarketModal) handleCloseMarketModal();
      handleCloseMarketModal && handleCloseMarketModal();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playerLowestPrice]
  );

  const handleRemovePlayerFromLineup = useCallback((player: FullPlayer) => {
    removePlayerFromLineup(player);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiltering = useCallback(() => {
    setIsFiltering((previous) => !previous);
  }, []);

  const applyFilter = useCallback(
    (data?: FullPlayer[]) => {
      if (data) {
        const playersUpdated = position
          ? data.filter((item) => item.posicao_id === position.position)
          : data;

        setMarketPlayers(playersUpdated);
        handleFiltering();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [position]
  );

  const handleCloseMarket = useCallback(
    () => (handleCloseMarketModal ? handleCloseMarketModal() : router.back()),
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
  }, [market, playerLowestPrice, position]);

  const keyExtractor = useCallback((item: FullPlayer) => `${item.atleta_id}`, []);

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<FullPlayer>) => (
      <MarketPlayerCard
        player={player}
        positions={positions as IPositions}
        market={market as Market}
        matches={matches as Matches}
        onPressAddPlayerToLineup={() => handleAddPlayerToLineup(player, playerIndex)}
        onPressRemovePlayerFromLineup={() => handleRemovePlayerFromLineup(player)}
        isButtonDisabled={
          (!playerLowestPrice && player.preco_num > currentBalancePrice) ||
          (!playerLowestPrice && !emptyPositions?.has(player.posicao_id))
        }
        isSellPlayer={lineup?.starting.some((item) => item.player?.atleta_id === player.atleta_id)}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currentBalancePrice,
      emptyPositions,
      lineup,
      playerIndex,
      playerLowestPrice,
      positions,
      market,
      matches,
    ]
  );

  const isLoading = !marketPlayers || !myClub || !market || !matches || !lineup || isFiltering;

  if (isLoading) return <LoadingScreen />;

  return (
    <View className={`flex-1 px-2 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
      <View className="justify-between items-center flex-row rounded-lg mb-2 py-2 px-4">
        <View
          className="flex-row items-center"
          style={{
            gap: 16,
          }}>
          <View className="justify-center items-center gap-1">
            <Text className="text-xs">Valor atual</Text>
            <Text className="font-bold text-xs text-green-500">{numberToString(price)}</Text>
          </View>

          <View className="justify-center items-center gap-1">
            <Text className="text-xs">Restante</Text>
            <Text className="font-bold text-xs text-green-500">
              {numberToString(currentBalancePrice)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={handleCloseMarket}
          className="p-2 rounded-full border border-red-400 bg-red-300">
          <Feather name="x" color="#525252" size={24} />
        </TouchableOpacity>
      </View>

      <MarketFilters
        applyFilter={applyFilter}
        handleIsLoading={handleFiltering}
        maximumPrice={playerLowestPrice?.preco_num}
      />

      {playerLowestPrice && <PlayerLowestCard player={playerLowestPrice as LineupPlayer} />}

      <FlashList
        data={marketPlayers}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={() => (
          <View className={`h-2 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`} />
        )}
        contentContainerStyle={{
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}
      />
    </View>
  );
};
