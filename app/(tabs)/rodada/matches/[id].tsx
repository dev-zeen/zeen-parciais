import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, RefreshControl, View } from 'react-native';

import { MarketPlayerCard } from '@/components/contexts/market/MarketPlayerCard';
import { MatchCard } from '@/components/contexts/matches/MatchCard';
import { PlayerCard } from '@/components/contexts/players/PlayerCard';
import { onGetEmptyPositions } from '@/components/contexts/team/_team.helpers';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { ScreenHeader } from '@/components/structure/ScreenHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ENUM_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePlayerStats from '@/hooks/usePlayerStats';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import { useTokens } from '@/hooks/useTokens';
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
  const { spacing } = useTokens();
  const tabBarSpacing = useTabBarSpacing();

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
        isSellPlayer={lineup?.starting.some((item) => item.player?.atleta_id === player.atleta_id)}
      />
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

  const homeClub = isMarketClose
    ? playerStats?.clubes[match?.home as number]
    : market?.clubes[match?.clube_casa_id as number];
  const awayClub = isMarketClose
    ? playerStats?.clubes[match?.away as number]
    : market?.clubes[match?.clube_visitante_id as number];

  return (
    <SafeAreaViewContainer edges={['top']}>
      <ScreenHeader
        title={`${homeClub?.abreviacao ?? ''} × ${awayClub?.abreviacao ?? ''}`}
        subtitle={isMarketClose ? 'Jogadores que pontuaram' : 'Prováveis de cada time'}
      />
      <FlatList
        data={teamPlayers}
        renderItem={isMarketClose ? renderItemWithPartials : renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <View style={{ gap: spacing.sm, paddingBottom: spacing.xs }}>
            <MatchCard match={match as Match} homeClub={homeClub} awayClub={awayClub} isDisabled />
            <SegmentedControl
              options={teamTabs.map((tab) => ({ value: String(tab.id), label: tab.name ?? '' }))}
              value={String(tabActive)}
              onChange={(value) => setTabActive(Number(value))}
            />
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
        refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingTop: spacing.xs,
          paddingBottom: tabBarSpacing.contentBottom,
        }}
        maxToRenderPerBatch={12}
        initialNumToRender={12}
      />
    </SafeAreaViewContainer>
  );
};
