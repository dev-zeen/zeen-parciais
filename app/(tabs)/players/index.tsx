import { Feather } from '@expo/vector-icons';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  TextInput,
  useColorScheme,
} from 'react-native';

import { onGetPlayersPlayedMatch } from '@/app/(tabs)/players/players.helper';
import { Text, View } from '@/components/Themed';
import { PlayerCard } from '@/components/contexts/players/PlayerCard/PlayerCard';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { Loading } from '@/components/structure/Loading';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import { APPRECIATIONS, CURRENT_STATS } from '@/constants/Keys';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import { Appreciations } from '@/models/Player';
import { Player, PlayerStats } from '@/models/Stats';
import { useGetMarket, useGetMarketStatus } from '@/queries/market.query';
import { useGetAppreciations } from '@/queries/players.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { GRAY_OPACITY } from '@/styles/colors';
import { onGetFromStorage } from '@/utils/asyncStorage';
import { normalizeQuery } from '@/utils/format';

export default () => {
  const colorTheme = useColorScheme();

  const [mainDataMarket, setMainDataMarket] = useState<Player[]>();
  const [currentStats, setCurrentStats] = useState<PlayerStats>();
  const [currentAppreciations, setCurrentAppreciations] = useState<Appreciations>();

  const { data: marketStatus } = useGetMarketStatus();
  const { data: market } = useGetMarket();

  const { isAutheticated } = useContext(AuthContext);

  const allowRequest =
    isAutheticated &&
    marketStatus &&
    marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO;

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const {
    data: playerStats,
    isRefetching: isRefetchingPlayersStats,
    refetch: onRefetchPlayersStats,
  } = useGetScoredPlayers(isMarketClose);

  const { data: appreciations, refetch: onRefetchAppreciations } = useGetAppreciations(
    !!allowRequest
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDataSource, setFilteredDataSource] = useState<Player[] | undefined>();

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
        ? onGetPlayersPlayedMatch(currentStats as PlayerStats)
        : (mainDataMarket as Player[]);

      const newData = getFilteredData(playersToFilter, text);

      setFilteredDataSource(newData);
      setSearchQuery(text);
    },
    [currentStats, isMarketClose, mainDataMarket]
  );

  const onRefetch = useCallback(async () => {
    !!allowRequest && (await onRefetchAppreciations());
    await onRefetchPlayersStats();
  }, [allowRequest, onRefetchAppreciations, onRefetchPlayersStats]);

  useEffect(() => {
    onGetFromStorage<string>(CURRENT_STATS).then((res: string) => {
      if (res) {
        const statsFormated: PlayerStats = JSON.parse(res);
        setCurrentStats(statsFormated);

        if (isMarketClose) {
          const data = onGetPlayersPlayedMatch(statsFormated);
          setFilteredDataSource(data);
        }
      }
      if (market && !isMarketClose) {
        const statsMarket: Player[] = market.atletas
          .filter((item) => item.entrou_em_campo)
          .map((item) => {
            return {
              id: String(item.atleta_id),
              apelido: item.apelido_abreviado,
              foto: item.foto,
              pontuacao: item.pontos_num,
              posicao_id: item.posicao_id,
              clube_id: item.clube_id,
              entrou_em_campo: item.entrou_em_campo,
              scout: {},
            };
          })
          .sort((a, b) => (b?.pontuacao as number) - (a?.pontuacao as number));

        setMainDataMarket(statsMarket);
        setFilteredDataSource(statsMarket);
      }
    });
  }, [isMarketClose, market, playerStats]);

  useEffect(() => {
    if (
      marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO ||
      marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_ATUALIZACAO
    ) {
      onGetFromStorage<Appreciations>(APPRECIATIONS).then((res) => {
        if (isMarketClose && res) {
          setCurrentAppreciations(res);
        } else {
          const newAppreciations = market?.atletas.reduce(
            (acc, current) => {
              if (current.entrou_em_campo) {
                return {
                  ...acc,
                  atletas: {
                    ...acc.atletas,
                    [current?.atleta_id]: {
                      posicao_id: current?.posicao_id,
                      variacao_num: current?.variacao_num,
                    },
                  },
                };
              } else {
                return {
                  ...acc,
                };
              }
            },
            {
              atletas: {},
            } as Appreciations
          );

          setCurrentAppreciations(newAppreciations);
        }
      });
    }
  }, [marketStatus, appreciations, isMarketClose, market]);

  const isRefetching = isRefetchingPlayersStats;

  const keyExtractor = useCallback((item: Player) => `${item?.foto} + ${item.id}`, []);

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<Player>) => (
      <PlayerCard
        player={player}
        club={(currentStats as PlayerStats)?.clubes[String(player.clube_id)]}
        position={(currentStats as PlayerStats)?.posicoes[player.posicao_id]}
        appreciation={(currentAppreciations as Appreciations)?.atletas?.[player.id]?.variacao_num}
      />
    ),
    [currentAppreciations, currentStats]
  );

  if (!currentStats) {
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

  const isLoading = isMarketClose
    ? marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO
      ? !playerStats
      : false || !marketStatus
    : !currentStats || !market;

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

        <FlatList
          refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
          data={filteredDataSource}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          initialNumToRender={12}
          maxToRenderPerBatch={25}
          contentContainerStyle={{
            paddingVertical: 4,
            backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
            gap: 4,
          }}
        />
      </View>
    </SafeAreaViewContainer>
  );
};
