import { Feather } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { ListRenderItemInfo, RefreshControl, TextInput, useColorScheme } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import { onGetPlayersPlayed } from '@/app/(tabs)/players/players.helper';
import { Text, View } from '@/components/Themed';
import { PlayerCard } from '@/components/contexts/players/PlayerCard/PlayerCard';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { Loading } from '@/components/structure/Loading';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePlayerStats from '@/hooks/usePlayerStats';
import useValorization from '@/hooks/useValorization';
import { Player, PlayerStats } from '@/models/Stats';
import { useGetMarket } from '@/queries/market.query';
import { GRAY_OPACITY } from '@/styles/colors';
import { normalizeQuery } from '@/utils/format';

interface ScorePlayersProps extends Player {
  appreciation?: number;
}

export default () => {
  const colorTheme = useColorScheme();

  const [searchQuery, setSearchQuery] = useState('');

  const { marketStatus, isMarketClose } = useMarketStatus();

  const { data: market } = useGetMarket();

  const { playerStats, onRefetchStats, isRefetchingPlayerStats, isLoadingPlayerStats } =
    usePlayerStats();

  const { onRefetchValorizations, valorizations } = useValorization();

  const getFilteredData = useCallback((players?: Player[], query?: string) => {
    return players?.filter((item: Player) => {
      const itemData = normalizeQuery(item.apelido);
      const textData = normalizeQuery(query ?? '');
      return itemData.includes(textData);
    });
  }, []);

  const mainDataMarket: ScorePlayersProps[] | undefined = useMemo(() => {
    if (market && !isMarketClose) {
      return market?.atletas
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
            appreciation: valorizations?.atletas?.[item.atleta_id]?.variacao_num,
          };
        })
        .sort((a, b) => (b?.pontuacao as number) - (a?.pontuacao as number));
    }
  }, [isMarketClose, market, playerStats?.atletas, valorizations?.atletas]);

  const filteredDataSource = useMemo(() => {
    const playersToFilter = isMarketClose
      ? onGetPlayersPlayed(playerStats as PlayerStats)
      : mainDataMarket;
    return getFilteredData(playersToFilter, searchQuery);
  }, [getFilteredData, isMarketClose, mainDataMarket, playerStats, searchQuery]);

  const onSearchFilter = useCallback(async (text: string) => {
    setSearchQuery(text);
  }, []);

  const onRefetch = useCallback(async () => {
    await Promise.all([onRefetchValorizations(), onRefetchStats()]);
  }, [onRefetchValorizations, onRefetchStats]);

  const keyExtractor = useCallback((item: Player) => `${item?.foto} + ${item.id}`, []);

  const isRefetching = isRefetchingPlayerStats;

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<ScorePlayersProps>) => (
      <PlayerCard
        player={player}
        club={playerStats?.clubes[String(player.clube_id)]}
        position={playerStats?.posicoes[player.posicao_id]}
        appreciation={player.appreciation}
      />
    ),
    [playerStats]
  );

  const isLoading = !marketStatus || isLoadingPlayerStats;

  if (isLoading) {
    return <Loading title="Carregando Pontuações" />;
  }

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

  return (
    <SafeAreaViewContainer>
      <View
        className="flex-1 justify-center rounded-lg mx-2"
        style={{
          gap: 8,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <TextInput
          onChangeText={onSearchFilter}
          value={searchQuery}
          placeholder="Buscar Jogador"
          placeholderTextColor={GRAY_OPACITY}
          className="rounded-lg p-3 border-2 border-gray-300 bg-white mx-4"
          autoCorrect={false}
        />

        <FlatList
          refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
          data={filteredDataSource}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={() => (
            <View className={`h-1 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`} />
          )}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingVertical: 4,
            backgroundColor:
              colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          }}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
        />
      </View>
    </SafeAreaViewContainer>
  );
};
