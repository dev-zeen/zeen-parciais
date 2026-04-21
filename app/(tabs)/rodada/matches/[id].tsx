import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, RefreshControl, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { MarketPlayerCard } from '@/components/contexts/market/MarketPlayerCard';
import { MatchCard } from '@/components/contexts/matches/MatchCard';
import { PlayerCard } from '@/components/contexts/players/PlayerCard';
import { onGetEmptyPositions } from '@/components/contexts/team/_team.helpers';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import { ENUM_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePlayerStats from '@/hooks/usePlayerStats';
import { useThemeColor } from '@/hooks/useThemeColor';
import useValorization from '@/hooks/useValorization';
import { Market } from '@/models/Market';
import { Match, Matches } from '@/models/Matches';
import { FullPlayer, IPositions, IScout, PlayerStats } from '@/models/Stats';
import { useGetMyClub } from '@/queries/club.query';
import { useGetMarket } from '@/queries/market.query';
import { useGetMatchs } from '@/queries/matches.query';
import { useGetPositions } from '@/queries/players.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { onBalancePrice } from '@/utils/team';

interface IMatch extends Match {
  home?: number;
  away?: number;
}

interface FullPlayerPartials extends FullPlayer {
  id: string;
  scout?: IScout;
  apelido: string;
  foto: string;
  pontuacao: number;
  posicao_id: number;
  clube_id: number;
  entrou_em_campo: boolean;
}

export default () => {
  const colorTheme = useThemeColor();

  const { isAutheticated } = useContext(AuthContext);

  const { id } = useLocalSearchParams();

  const { isMarketClose, allowRequest } = useMarketStatus();

  const { data: myClub, isLoading: isLoadingMyClub } = useGetMyClub(allowRequest);

  const { data: market } = useGetMarket();

  const { data: matches } = useGetMatchs();

  const { data: positions } = useGetPositions();

  const price = useTeamLineupStore((state) => state.price);
  const lineup = useTeamLineupStore((state) => state.lineup);

  const { playerStats, onRefetchStats, isRefetchingPlayerStats } = usePlayerStats();
  const { valorizations, onRefetchValorizations, isRefetchingValorizations } = useValorization();

  const [tabActive, setTabActive] = useState(0);

  const emptyPositions: Set<number> | undefined = useMemo(
    () => lineup && onGetEmptyPositions(lineup),
    [lineup]
  );

  const { isRefetching: isRefetchingMatches, refetch: onRefetchMatches } = useGetMatchs();

  const currentBalancePrice = useMemo(() => {
    if (myClub && myClub.patrimonio !== undefined && price >= 0)
      return onBalancePrice(myClub.patrimonio, price);
    return 0;
  }, [myClub, price]);

  const addPlayerToLineup = useTeamLineupStore((state) => state.addPlayerToLineup);
  const removePlayerFromLineup = useTeamLineupStore((state) => state.removePlayerFromLineup);

  const match: IMatch = useMemo(() => id && JSON.parse(id as string), [id]);

  const handleAddPlayerToLineup = useCallback(
    (player: FullPlayer) => addPlayerToLineup({ player }),
    [addPlayerToLineup]
  );

  const handleRemovePlayerFromLineup = useCallback(
    (player: FullPlayer) => removePlayerFromLineup(player),
    [removePlayerFromLineup]
  );

  const isRefetching = useMemo(
    () => isRefetchingMatches || isRefetchingValorizations || isRefetchingPlayerStats,
    [isRefetchingMatches, isRefetchingPlayerStats, isRefetchingValorizations]
  );

  const renderItemWithPartials = useCallback(
    ({ item: player }: ListRenderItemInfo<FullPlayerPartials>) => (
      <PlayerCard
        player={player}
        club={(playerStats as PlayerStats)?.clubes[String(player.clube_id)]}
        position={(playerStats as PlayerStats)?.posicoes[player.posicao_id]}
        isPlayerOnMyLineup={myClub?.atletas?.some((item) => String(item.atleta_id) === player.id)}
      />
    ),
    [myClub, playerStats]
  );

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<FullPlayer>) => (
      <View className="rounded-lg">
        <MarketPlayerCard
          player={player}
          positions={positions as IPositions}
          market={market as Market}
          matches={matches as Matches}
          onPressAddPlayerToLineup={() => handleAddPlayerToLineup(player)}
          onPressRemovePlayerFromLineup={() => handleRemovePlayerFromLineup(player)}
          isButtonDisabled={
            player.preco_num > currentBalancePrice || !emptyPositions?.has(player.posicao_id)
          }
          isSellPlayer={lineup?.starting.some(
            (item) => item.player?.atleta_id === player.atleta_id
          )}
        />
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentBalancePrice, emptyPositions, lineup, market, matches, positions]
  );

  const keyExtractor = useCallback((item: FullPlayer) => `${item.foto} + ${item.apelido}`, []);

  const activeTeamId = tabActive === 0 ? match?.clube_casa_id : match?.clube_visitante_id;

  const teamPlayers = useMemo<FullPlayerPartials[] | undefined>(() => {
    if (!activeTeamId) return undefined;

    if (isMarketClose) {
      return playerStats
        ? (Object.values(playerStats.atletas)
            .filter((item) => item.clube_id === activeTeamId)
            .sort((a, b) => a.posicao_id - b.posicao_id) as FullPlayerPartials[])
        : undefined;
    }

    return market?.atletas
      .filter((item) => item.clube_id === Number(market.clubes[activeTeamId]?.id))
      .filter((item) => item.status_id === ENUM_STATUS_MARKET_PLAYER.PROVAVEL)
      .sort((a, b) => a.posicao_id - b.posicao_id) as FullPlayerPartials[];
  }, [activeTeamId, isMarketClose, market, playerStats]);

  const teamTabs = [
    {
      id: 0,
      name: isMarketClose
        ? playerStats?.clubes[match?.home as number]?.nome
        : market?.clubes[match?.clube_casa_id as number]?.nome,
    },
    {
      id: 1,
      name: isMarketClose
        ? playerStats?.clubes[match?.away as number]?.nome
        : market?.clubes[match?.clube_visitante_id as number]?.nome,
    },
  ];

  const onRefetch = useCallback(() => {
    Promise.all([onRefetchValorizations(), onRefetchStats(), onRefetchMatches()]);
  }, [onRefetchMatches, onRefetchStats, onRefetchValorizations]);

  const isLoading = isMarketClose
    ? !market || !match || !valorizations || !playerStats || isLoadingMyClub
    : !market || !match;

  if (!isAutheticated) return <Redirect href="/(tabs)/rodada" />;

  if (isLoading) {
    return <LoadingScreen title="Carregando Partidas" />;
  }

  const bgColor = colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull;

  return (
    <SafeAreaViewContainer edges={['top']}>
      <View className="flex-1 mx-2" style={{ backgroundColor: bgColor }}>
        <View className="mb-2" style={{ gap: 8, backgroundColor: 'transparent' }}>
          <MatchCard
            match={match as Match}
            homeClub={
              isMarketClose
                ? playerStats?.clubes[match?.home as number]
                : market?.clubes[match?.clube_casa_id as number]
            }
            awayClub={
              isMarketClose
                ? playerStats?.clubes[match?.away as number]
                : market?.clubes[match?.clube_visitante_id as number]
            }
          />
        </View>

        <View
          className="flex-row mx-1 mt-2 mb-1 rounded-xl overflow-hidden"
          style={{ backgroundColor: colorTheme === 'dark' ? '#161B22' : '#F0F0F0' }}>
          {teamTabs.map(({ id: tabId, name }) => {
            const isActive = tabActive === tabId;
            return (
              <TouchableOpacity
                key={tabId}
                onPress={() => setTabActive(tabId)}
                activeOpacity={0.8}
                className="flex-1 py-2 items-center"
                style={{
                  backgroundColor: isActive ? Colors.light.tint : 'transparent',
                  borderRadius: 10,
                  margin: 2,
                }}>
                <Text
                  className="text-sm font-semibold"
                  numberOfLines={1}
                  style={{
                    color: isActive ? '#fff' : colorTheme === 'dark' ? '#9CA3AF' : '#6B7280',
                  }}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <FlatList
          style={{ paddingHorizontal: 8, backgroundColor: 'transparent' }}
          refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
          contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
          data={teamPlayers}
          renderItem={isMarketClose ? renderItemWithPartials : renderItem}
          keyExtractor={keyExtractor}
          maxToRenderPerBatch={12}
          initialNumToRender={12}
        />
      </View>
    </SafeAreaViewContainer>
  );
};
