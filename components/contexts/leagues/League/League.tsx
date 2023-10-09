import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  useColorScheme,
} from 'react-native';

import { View } from '@/components/Themed';
import { ClubCard } from '@/components/contexts/leagues/club/ClubCard';
import { DialogComponent } from '@/components/structure/Dialog';
import { Loading } from '@/components/structure/Loading';
import { ITab, Tabs } from '@/components/structure/Tabs';
import Colors from '@/constants/Colors';
import { CLUBS_BY_LEAGUE_KEY_STORAGE } from '@/constants/Keys';
import useMarketStatus from '@/hooks/useMarketStatus';
import { ClubByLeague, League as LeagueModel, TeamLeague } from '@/models/Leagues';
import { MarketStatus } from '@/models/Market';
import { PlayerStats } from '@/models/Stats';
import { useGetLeague } from '@/queries/leagues.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { OrderByOptions, mergeSort, onGetLeagueWithPartials } from '@/utils/leagues';
import { ClubsByLeagueUtils } from '@/utils/partials';

interface LeagueProps {
  league: LeagueModel;
  clubsByLeague: ClubsByLeagueUtils;
}

export function League({ league, clubsByLeague }: LeagueProps) {
  const colorTheme = useColorScheme();

  const { marketStatus, isMarketClose, allowRequest } = useMarketStatus();

  const { data: playerStats } = useGetScoredPlayers(isMarketClose);

  const { refetch: onRefetchLeague, isRefetching: isRefetchingLeague } = useGetLeague(
    league.liga.slug,
    allowRequest
  );

  const [isSortingClubs, setIsSortingClubs] = useState(false);
  const [orderBy, setOrderBy] = useState(OrderByOptions.RODADA);
  const [clubs, setClubs] = useState<TeamLeague[] | ClubByLeague[]>();
  const [showModalPublicLeague, setShowModalPublicLeague] = useState(false);

  const { getItem } = useAsyncStorage(CLUBS_BY_LEAGUE_KEY_STORAGE(`${league?.liga.liga_id}`));

  const onGetClubsByLeagueFromStorage = useCallback(async () => {
    const fromStorage = await getItem();
    const data: ClubsByLeagueUtils | null = fromStorage ? JSON.parse(fromStorage) : null;
    return data;
  }, [getItem]);

  const handleOrderByPatrimony = useCallback(() => {
    const newOrderBy =
      league &&
      league.times.sort((a: TeamLeague, b: TeamLeague) => {
        return (b.patrimonio as number) - (a.patrimonio as number);
      });

    return newOrderBy;
  }, [league]);

  const sortClubs = useCallback(
    async (sortBy: string) => {
      const clubsByLeague = await onGetClubsByLeagueFromStorage();

      const compareFn = (a: ClubByLeague, b: ClubByLeague) =>
        ((b.pontos as any)[sortBy] as number) - ((a.pontos as any)[sortBy] as number);

      if (isMarketClose && clubsByLeague && league) {
        const leagueWithPartials = onGetLeagueWithPartials(
          league,
          clubsByLeague,
          playerStats as PlayerStats,
          marketStatus as MarketStatus
        );
        const sortedClubs = mergeSort(leagueWithPartials, compareFn);
        setClubs(sortedClubs);
      } else {
        const sortedClubs = league?.times?.sort((a, b) => compareFn(a, b));
        setClubs(sortedClubs);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clubsByLeague, isMarketClose, league, playerStats, marketStatus]
  );

  const handleOnPressOrderBy = useCallback(
    async (sortProp: string) => {
      setOrderBy(sortProp as OrderByOptions);

      if (sortProp === OrderByOptions.PATRIMONIO) {
        const clubsSortedByPatrimony = handleOrderByPatrimony();
        setClubs(clubsSortedByPatrimony);
        setIsSortingClubs(false);
        return;
      }

      await sortClubs(sortProp);

      setIsSortingClubs(false);
    },
    [handleOrderByPatrimony, sortClubs]
  );

  const tabs: ITab[] = useMemo(
    () => [
      {
        id: 1,
        title: 'Rodada',
        onPress() {
          setIsSortingClubs(true);
          handleOnPressOrderBy(OrderByOptions.RODADA);
        },
      },
      {
        id: 2,
        title: 'Total',
        onPress() {
          setIsSortingClubs(true);
          handleOnPressOrderBy(OrderByOptions.CAMPEONATO);
        },
      },
      {
        id: 3,
        title: 'Turno',
        onPress() {
          setIsSortingClubs(true);
          handleOnPressOrderBy(OrderByOptions.TURNO);
        },
      },
      {
        id: 4,
        title: 'Mês',
        onPress() {
          setIsSortingClubs(true);
          handleOnPressOrderBy(OrderByOptions.MES);
        },
      },
      {
        id: 5,
        title: 'C$',
        onPress() {
          setIsSortingClubs(true);
          handleOnPressOrderBy(OrderByOptions.PATRIMONIO);
        },
      },
    ],
    [handleOnPressOrderBy]
  );

  const keyExtractor = useCallback((item: TeamLeague) => `${item.time_id}`, []);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<TeamLeague>) => {
      return (
        <ClubCard
          score={
            !isMarketClose && orderBy === OrderByOptions.PATRIMONIO
              ? item.patrimonio
              : (item.pontos as any)[orderBy]
          }
          club={item}
          orderBy={orderBy}
          position={index + 1}
          highestScoringTeam={
            orderBy !== 'patrimonio' ? (clubs?.[0].pontos as any)[orderBy] : clubs?.[0].patrimonio
          }
          isLeagueAcceptCaptain={!league.liga.sem_capitao}
          isMarketClose={isMarketClose}
          isMyTeam={league?.time_usuario?.time_id === item.time_id}
        />
      );
    },
    [clubs, isMarketClose, league.liga.sem_capitao, league?.time_usuario?.time_id, orderBy]
  );

  const onRefetch = useCallback(async () => {
    await onRefetchLeague().then((response) => {
      sortClubs(orderBy);
    });
  }, [onRefetchLeague, orderBy, sortClubs]);

  const isLoading = useMemo(() => !clubs, [clubs]);

  useEffect(() => {
    sortClubs(orderBy);
  }, [orderBy, sortClubs]);

  useEffect(() => {
    if (league && !league?.liga.time_dono_id) {
      setShowModalPublicLeague(true);
    }
  }, [league]);

  if (isLoading || !renderItem) {
    return <Loading />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
      }}>
      <View
        style={{
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <View
          style={{
            backgroundColor:
              colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          }}>
          <Tabs tabs={tabs} />
        </View>
      </View>

      {isSortingClubs ? (
        <View className="flex-1 items-center justify-center mx-2 pt-6 mt-2 rounded-lg mb-2">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetchingLeague} />}
          data={clubs}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={() => (
            <View className={`h-2 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`} />
          )}
          renderItem={renderItem}
          initialNumToRender={30}
          maxToRenderPerBatch={15}
          contentContainerStyle={{
            paddingTop: 8,
            paddingVertical: 8,
            paddingHorizontal: 8,
            backgroundColor:
              colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          }}
        />
      )}

      {showModalPublicLeague && (
        <DialogComponent
          isVisible={showModalPublicLeague}
          onPressConfirm={() => setShowModalPublicLeague(false)}
          subtitile="Apenas os 100 primeiros times são exibidos nas ligas públicas por questões de desempenho."
        />
      )}
    </View>
  );
}
