import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  useColorScheme,
} from 'react-native';

import { fillLineupWithPlayers } from '@/app/(tabs)/team/team.helpers';
import { View } from '@/components/Themed';
import { MarketPlayerCard } from '@/components/contexts/market/MarketPlayerCard';
import { MatchCard } from '@/components/contexts/matches/MatchCard';
import { PlayerCard } from '@/components/contexts/players/PlayerCard';
import { Loading } from '@/components/structure/Loading';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { ITabs, Tabs } from '@/components/structure/Tabs';
import Colors from '@/constants/Colors';
import { LINEUPS_DEFAULT_OBJECT } from '@/constants/Formations';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { ENUM_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import { AuthContext } from '@/contexts/Auth.context';
import { Match } from '@/models/Matches';
import { Appreciations } from '@/models/Player';
import { FullPlayer, IScout, PlayerStats } from '@/models/Stats';
import { useGetMyClub } from '@/queries/club.query';
import { useGetMarket, useGetMarketStatus } from '@/queries/market.query';
import { useGetAppreciations } from '@/queries/players.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';

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

  const allowRequest = isAutheticated;

  const { data: marketStatus } = useGetMarketStatus();
  const { data: market } = useGetMarket();
  const { data: club } = useGetMyClub(!!allowRequest);

  const lineup = useTeamLineupStore((state) => state.lineup);
  const updateLineup = useTeamLineupStore((state) => state.updateLineup);
  const price = useTeamLineupStore((state) => state.price);
  const updateCapitain = useTeamLineupStore((state) => state.updateCapitain);

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const addPlayerToLineup = useTeamLineupStore((state) => state.addPlayerToLineup);
  const removePlayerFromLineup = useTeamLineupStore((state) => state.removePlayerFromLineup);

  const [match, setMatch] = useState<IMatch>();
  const [emptyPositions, setEmptyPositions] = useState<Set<number>>();

  const [isRendering, setIsRendering] = useState(false);

  const {
    data: appreciations,
    refetch: onRefetchAppreciations,
    isRefetching: isRefetchingAppreciations,
  } = useGetAppreciations(!!allowRequest);

  const {
    data: playerStats,
    isRefetching: isRefetchingStats,
    refetch: onRefetchStats,
  } = useGetScoredPlayers();

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

  const remainingValue = useMemo(() => {
    if (club && price) {
      return club.patrimonio - price;
    }
    return club?.patrimonio as number;
  }, [club, price]);

  const onRefetch = useCallback(() => {
    Promise.all([onRefetchAppreciations(), onRefetchStats()]);
  }, [onRefetchAppreciations, onRefetchStats]);

  const renderItemWithPartials = useCallback(
    ({ item: player }: ListRenderItemInfo<FullPlayerPartials>) => {
      return (
        <PlayerCard
          player={player}
          club={(playerStats as PlayerStats)?.clubes[String(player.clube_id)]}
          position={(playerStats as PlayerStats)?.posicoes[player.posicao_id]}
          appreciation={(appreciations as Appreciations)?.atletas?.[player.id]?.variacao_num}
          isPlayerOnMyLineup={lineup?.starting.some(
            (item) => String(item.player?.atleta_id) === player.id
          )}
        />
      );
    },
    [appreciations, lineup, playerStats]
  );

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<FullPlayer>) => {
      return (
        <View className="rounded-lg">
          <MarketPlayerCard
            player={player}
            onPressAddPlayerToLineup={() => handleAddPlayerToLineup(player)}
            onPressRemovePlayerFromLineup={() => handleRemovePlayerFromLineup(player)}
            isButtonDisabled={
              player.preco_num > remainingValue || !emptyPositions?.has(player.posicao_id)
            }
            isSellPlayer={lineup?.starting.some(
              (item) => item.player?.atleta_id === player.atleta_id
            )}
          />
        </View>
      );
    },
    [emptyPositions, handleAddPlayerToLineup, handleRemovePlayerFromLineup, lineup, remainingValue]
  );

  const keyExtractor = useCallback((item: FullPlayer) => `${item.foto} + ${item.apelido}`, []);

  useEffect(() => {
    if (id) {
      const match = JSON.parse(id as string);
      setMatch(match);
    }
  }, [id]);

  useEffect(() => {
    if (!lineup && club && !isMarketClose) {
      const defaultLineup = fillLineupWithPlayers(
        club,
        (LINEUPS_DEFAULT_OBJECT as any)[club?.time.esquema_id as number]
      );

      updateLineup(defaultLineup);
      updateCapitain(club.capitao_id);
    }
  }, [club, isMarketClose, lineup, updateCapitain, updateLineup]);

  const onGetTabPlayers = useCallback(
    (teamId: number) => {
      const isProvavel = (item: any) => item.status_id === ENUM_STATUS_MARKET_PLAYER.PROVAVEL;

      const getFilteredPlayers = (teamId: number, filterFunction: (item: any) => boolean) => {
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
    if (lineup) {
      const emptyPositionsUpdated = new Set(
        (lineup?.starting || []).filter(({ player }) => !player).map(({ position }) => position)
      );
      setEmptyPositions(emptyPositionsUpdated);
    }
  }, [lineup]);

  useEffect(() => {
    onGetTabPlayers(match?.clube_casa_id as number);
  }, [match, onGetTabPlayers]);

  const isLoading = isMarketClose
    ? !market || !match || !appreciations || !playerStats
    : !market || !match;

  if (!isAutheticated) return <Redirect href="/(tabs)/matches" />;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <View
        className="mx-2 rounded-lg"
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
            refreshControl={
              <RefreshControl
                onRefresh={onRefetch}
                refreshing={isRefetchingStats && isRefetchingAppreciations}
              />
            }
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
