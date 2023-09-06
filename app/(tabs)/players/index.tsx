import { Feather } from '@expo/vector-icons';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, TextInput, useColorScheme } from 'react-native';

import { onGetPlayersPlayed } from '@/app/(tabs)/players/players.helper';
import { Text, View } from '@/components/Themed';
import { PlayerCard } from '@/components/contexts/players/PlayerCard/PlayerCard';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { Loading } from '@/components/structure/Loading';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import useMarket from '@/hooks/useMarket';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePlayerStats from '@/hooks/usePlayerStats';
import useValorization from '@/hooks/useValorization';
import { Player, PlayerStats } from '@/models/Stats';
import { GRAY_OPACITY } from '@/styles/colors';
import { normalizeQuery } from '@/utils/format';

export default () => {
  const colorTheme = useColorScheme();

  const [mainDataMarket, setMainDataMarket] = useState<Player[]>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDataSource, setFilteredDataSource] = useState<Player[] | undefined>();

  const { marketStatus } = useMarketStatus();
  const { market } = useMarket();

  const { playerStats, onRefetchStats, isRefetchingPlayerStats } = usePlayerStats();

  const { onRefetchValorizations, valorizations } = useValorization();

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const onSearchFilter = useCallback(
    async (text: string) => {
      const getFilteredData = (players: Player[], query: string) => {
        return players.filter((item: Player) => {
          const itemData = normalizeQuery(item.apelido);
          const textData = normalizeQuery(query);
          return itemData.includes(textData);
        });
      };

      const playersToFilter = isMarketClose
        ? onGetPlayersPlayed(playerStats as PlayerStats)
        : (mainDataMarket as Player[]);

      const newData = getFilteredData(playersToFilter, text);

      setFilteredDataSource(newData);
      setSearchQuery(text);
    },
    [isMarketClose, mainDataMarket, playerStats]
  );

  useEffect(() => {
    if (isMarketClose && playerStats) {
      const data = onGetPlayersPlayed(playerStats as PlayerStats);
      setFilteredDataSource(data);
    }

    if (market && !isMarketClose) {
      const playerStatsMarket: Player[] = market.atletas
        .filter((item) => item.entrou_em_campo)
        .map((item) => {
          return {
            id: String(item.atleta_id),
            apelido: item.apelido_abreviado,
            foto: item?.foto,
            pontuacao: item.pontos_num,
            posicao_id: item.posicao_id,
            clube_id: item.clube_id,
            entrou_em_campo: item.entrou_em_campo,
            scout: playerStats?.atletas[item.atleta_id].scout,
          };
        })
        .sort((a, b) => (b?.pontuacao as number) - (a?.pontuacao as number));

      setMainDataMarket(playerStatsMarket);
      setFilteredDataSource(playerStatsMarket);
    }
  }, [isMarketClose, market, playerStats]);

  const onRefetch = useCallback(async () => {
    await onRefetchValorizations();
    await onRefetchStats();
  }, [onRefetchValorizations, onRefetchStats]);

  const isRefetching = isRefetchingPlayerStats;

  const keyExtractor = useCallback((item: Player) => `${item?.foto} + ${item.id}`, []);

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<Player>) => (
      <PlayerCard
        player={player}
        club={playerStats?.clubes[String(player.clube_id)]}
        position={playerStats?.posicoes[player.posicao_id]}
        appreciation={valorizations?.atletas?.[player.id]?.variacao_num}
      />
    ),
    [playerStats, valorizations]
  );

  if (!playerStats) {
    return (
      <SafeAreaViewContainer>
        <View className="mx-2 rounded-lg">
          <MarketStatusCard />
        </View>
        <View
          className="flex-row py-4 px-8 rounded-lg items-center justify-center m-2"
          style={{
            gap: 8,
          }}>
          <Feather name="info" size={24} color={Colors.light.tint} />
          <Text className="text-sm font-semibold text-center">
            Os jogadores serão exibidos assim que obtiverem suas pontuações durante os jogos.
          </Text>
        </View>
      </SafeAreaViewContainer>
    );
  }

  const isLoading = !marketStatus || !playerStats || !valorizations;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <View
        className="flex-1 justify-center rounded-lg mx-2"
        style={{
          gap: 8,
          backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
        }}>
        <TextInput
          onChangeText={onSearchFilter}
          value={searchQuery}
          placeholder="Buscar Jogador"
          placeholderTextColor={GRAY_OPACITY}
          className="rounded-lg p-3 border-2 border-gray-300 bg-white mx-4"
          autoCorrect={false}
        />

        <FlashList
          refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
          data={filteredDataSource}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={() => (
            <View className={`h-1 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`} />
          )}
          renderItem={renderItem}
          estimatedItemSize={300}
          contentContainerStyle={{
            paddingVertical: 4,
            backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
          }}
        />
      </View>
    </SafeAreaViewContainer>
  );
};
