import { Feather } from '@expo/vector-icons';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View as RNView } from 'react-native';

import { View } from '@/components/Themed';
import { MarketFilters } from '@/components/contexts/market/MarketFilters';
import { MarketPlayerCard } from '@/components/contexts/market/MarketPlayerCard';
import { PlayerLowestCard } from '@/components/contexts/market/PlayerLowestCard.tsx';
import { onGetEmptyPositions } from '@/components/contexts/team/_team.helpers';
import { Card } from '@/components/ui/Card';
import { StatItem } from '@/components/ui/StatItem';
import { StateView } from '@/components/ui/StateView';
import Colors from '@/constants/Colors';
import { usePlayerInsights } from '@/hooks/usePlayerInsights';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTokens } from '@/hooks/useTokens';
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

  const colorTheme = useThemeColor();
  const { colors, minTouch } = useTokens();
  const { getInsight } = usePlayerInsights();

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

      // Obter estado atualizado do Zustand após adicionar jogador
      const updatedLineup = useTeamLineupStore.getState().lineup;

      if (!updatedLineup) return;

      const updatedEmptyPositions = onGetEmptyPositions(updatedLineup);

      // Se há posição filtrada E ainda tem vagas, manter modal aberto
      if (position && updatedEmptyPositions?.has(position.position)) {
        return; // NÃO fecha o modal
      }

      // Fechar modal em qualquer outro caso
      handleCloseMarketModal && handleCloseMarketModal();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playerLowestPrice, position, handleCloseMarketModal]
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
    ({ item: player }: ListRenderItemInfo<FullPlayer>) => {
      // Reservas (playerLowestPrice) seguem a regra do mais barato da posição, sem checar saldo/vaga.
      const hasNoSlot = !playerLowestPrice && !emptyPositions?.has(player.posicao_id);
      const hasNoBalance = !playerLowestPrice && player.preco_num > currentBalancePrice;

      return (
        <MarketPlayerCard
          player={player}
          positions={positions as IPositions}
          market={market as Market}
          matches={matches as Matches}
          insight={getInsight(player)}
          onPressAddPlayerToLineup={() => handleAddPlayerToLineup(player, playerIndex)}
          onPressRemovePlayerFromLineup={() => handleRemovePlayerFromLineup(player)}
          isButtonDisabled={hasNoBalance || hasNoSlot}
          disabledReason={hasNoSlot ? 'Sem vaga' : 'Sem saldo'}
          isSellPlayer={lineup?.starting.some(
            (item) => item.player?.atleta_id === player.atleta_id
          )}
        />
      );
    },
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
      getInsight,
    ]
  );

  const isLoading = !marketPlayers || !myClub || !market || !matches || !lineup || isFiltering;

  if (isLoading)
    return (
      <View style={{ height: 300, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FF8A00" />
      </View>
    );

  return (
    <View
      className="flex-1 px-2"
      style={{
        backgroundColor:
          colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
      }}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <RNView style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
          <StatItem label="Valor do time" value={numberToString(price)} />
          <StatItem
            label="Saldo"
            value={numberToString(currentBalancePrice)}
            tone={currentBalancePrice < 0 ? 'negative' : 'positive'}
          />
        </RNView>

        <Pressable
          onPress={handleCloseMarket}
          accessibilityRole="button"
          accessibilityLabel="Fechar mercado"
          style={({ pressed }) => ({
            width: minTouch,
            height: minTouch,
            borderRadius: minTouch / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceAlt,
            opacity: pressed ? 0.7 : 1,
          })}>
          <Feather name="x" size={20} color={colors.text} />
        </Pressable>
      </Card>

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
        ListEmptyComponent={
          <StateView
            icon="search"
            title="Nenhum jogador encontrado"
            message="Ajuste os filtros para ver mais opções."
          />
        }
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: 8,
              backgroundColor: 'transparent',
            }}
          />
        )}
        contentContainerStyle={{
          paddingVertical: 8,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}
      />
    </View>
  );
};
