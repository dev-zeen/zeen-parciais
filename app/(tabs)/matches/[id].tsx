import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  useColorScheme,
} from 'react-native';

import { onGetEmptyPositions } from '@/app/(tabs)/team/team.helpers';
import { View } from '@/components/Themed';
import { MarketPlayerCard } from '@/components/contexts/market/MarketPlayerCard';
import { MatchCard } from '@/components/contexts/matches/MatchCard';
import { PlayerCard } from '@/components/contexts/players/PlayerCard';
import { Loading } from '@/components/structure/Loading';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { ITabs, Tabs } from '@/components/structure/Tabs';
import Colors from '@/constants/Colors';
import { ENUM_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePlayerStats from '@/hooks/usePlayerStats';
import useValorization from '@/hooks/useValorization';
import { Market } from '@/models/Market';
import { Match, Matches } from '@/models/Matches';
import { Appreciations } from '@/models/Player';
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
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { id } = useLocalSearchParams();

  const { isMarketClose, allowRequest } = useMarketStatus();

  const { data: myClub, isLoading: isLoadingMyClub } = useGetMyClub(allowRequest);

  const { data: market } = useGetMarket();

  const { data: matches } = useGetMatchs();

  const { data: positions } = useGetPositions();

  const [emptyPositions, setEmptyPositions] = useState<Set<number>>();

  const price = useTeamLineupStore((state) => state.price);
  const lineup = useTeamLineupStore((state) => state.lineup);

  const { playerStats, onRefetchStats, isRefetchingPlayerStats } = usePlayerStats();
  const { valorizations, onRefetchValorizations, isRefetchingValorizations } = useValorization();

  const { isRefetching: isRefetchingMatches, refetch: onRefetchMatches } = useGetMatchs();

  useEffect(() => {
    if (lineup) {
      const positions = onGetEmptyPositions(lineup);

      setEmptyPositions(positions);
    }
  }, [lineup]);

  const currentBalancePrice = useMemo(() => {
    if (myClub && price >= 0) return onBalancePrice(myClub.patrimonio, price);
    return 0;
  }, [myClub, price]);

  const addPlayerToLineup = useTeamLineupStore((state) => state.addPlayerToLineup);
  const removePlayerFromLineup = useTeamLineupStore((state) => state.removePlayerFromLineup);

  const [match, setMatch] = useState<IMatch>();
  const [isRendering, setIsRendering] = useState(false);
  const [teamPlayers, setTeamPlayers] = useState<FullPlayerPartials[] | undefined>();

  const handleAddPlayerToLineup = useCallback(
    (player: FullPlayer) => {
      addPlayerToLineup({
        player,
      });
    },
    [addPlayerToLineup]
  );

  const handleRemovePlayerFromLineup = useCallback(
    (player: FullPlayer) => {
      removePlayerFromLineup(player);
    },
    [removePlayerFromLineup]
  );

  const onRefetch = useCallback(() => {
    Promise.all([onRefetchValorizations(), onRefetchStats(), onRefetchMatches()]);
  }, [onRefetchMatches, onRefetchStats, onRefetchValorizations]);

  const isRefetching = useMemo(
    () => isRefetchingMatches || isRefetchingValorizations || isRefetchingPlayerStats,
    [isRefetchingMatches, isRefetchingPlayerStats, isRefetchingValorizations]
  );

  const renderItemWithPartials = useCallback(
    ({ item: player }: ListRenderItemInfo<FullPlayerPartials>) => {
      return (
        <PlayerCard
          player={player}
          club={(playerStats as PlayerStats)?.clubes[String(player.clube_id)]}
          position={(playerStats as PlayerStats)?.posicoes[player.posicao_id]}
          appreciation={(valorizations as Appreciations)?.atletas?.[player.id]?.variacao_num}
          isPlayerOnMyLineup={myClub?.atletas.some((item) => String(item.atleta_id) === player.id)}
        />
      );
    },
    [valorizations, myClub?.atletas, playerStats]
  );

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<FullPlayer>) => {
      return (
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
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentBalancePrice, emptyPositions, lineup, market, matches, positions]
  );

  const keyExtractor = useCallback((item: FullPlayer) => `${item.foto} + ${item.apelido}`, []);

  useEffect(() => {
    if (id) {
      const match = JSON.parse(id as string);
      setMatch(match);
    }
  }, [id]);

  const onGetTabPlayers = useCallback(
    (teamId: number) => {
      const isProvavel = (item: FullPlayer) =>
        item.status_id === ENUM_STATUS_MARKET_PLAYER.PROVAVEL;

      const getFilteredPlayers = (
        teamId: number,
        filterFunction: (item: FullPlayer) => boolean
      ) => {
        if (market) {
          return market?.atletas
            .filter((item) => item.clube_id === Number(market?.clubes[teamId]?.id))
            .filter(filterFunction)
            .sort((a, b) => a.posicao_id - b.posicao_id);
        }
      };

      const getPlayerStatsForTeam = (teamId: number) => {
        if (playerStats) {
          return Object.values(playerStats?.atletas)
            .filter((item) => item.clube_id === teamId)
            .sort((a, b) => a.posicao_id - b.posicao_id);
        }
      };

      const newTeamPlayers = isMarketClose
        ? getPlayerStatsForTeam(teamId)
        : getFilteredPlayers(teamId, isProvavel);

      setTeamPlayers(newTeamPlayers as FullPlayerPartials[]);

      setTimeout(() => {
        setIsRendering(false);
      }, 1);
    },
    [isMarketClose, market, playerStats]
  );

  const tabs: ITabs[] = [
    {
      id: 1,
      title: isMarketClose
        ? (playerStats?.clubes[match?.home as number]?.nome as string)
        : (market?.clubes[match?.clube_casa_id as number]?.nome as string),
      onPress: () => {
        setIsRendering(true);
        onGetTabPlayers(match?.clube_casa_id as number);
      },
    },
    {
      id: 2,
      title: isMarketClose
        ? (playerStats?.clubes[match?.away as number]?.nome as string)
        : (market?.clubes[match?.clube_visitante_id as number]?.nome as string),
      onPress: () => {
        setIsRendering(true);
        onGetTabPlayers(match?.clube_visitante_id as number);
      },
    },
  ];

  useEffect(() => {
    onGetTabPlayers(match?.clube_casa_id as number);
  }, [match, onGetTabPlayers]);

  const isLoading = isMarketClose
    ? !market || !match || !valorizations || !playerStats || isLoadingMyClub
    : !market || !match;

  if (!isAutheticated) return <Redirect href="/(tabs)/matches" />;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <View
        className="mx-2 rounded-lg mb-2"
        style={{
          gap: 8,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
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
      <Tabs tabs={tabs} />
      <View className={`flex-1 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
        {isRendering ? (
          <View className="flex-1 mx-2 items-center justify-center mt-2 rounded-lg">
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            style={{
              paddingHorizontal: 8,
            }}
            refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
            contentContainerStyle={{
              gap: 4,
              paddingVertical: 8,
            }}
            data={teamPlayers}
            renderItem={isMarketClose ? renderItemWithPartials : renderItem}
            keyExtractor={keyExtractor}
            maxToRenderPerBatch={10}
            initialNumToRender={10}
          />
        )}
      </View>
    </SafeAreaViewContainer>
  );
};
