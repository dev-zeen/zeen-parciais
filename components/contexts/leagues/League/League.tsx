import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  useColorScheme,
} from 'react-native';

import { ClubByLeague, LeagueProps } from '@/app/(tabs)/leagues/[id]';
import { View } from '@/components/Themed';
import { ClubCard } from '@/components/contexts/leagues/club/ClubCard';
import { Loading } from '@/components/structure/Loading';
import { ITabs, Tabs } from '@/components/structure/Tabs';
import Colors from '@/constants/Colors';
import { CLUBS_BY_LEAGUE_KEY_STORAGE } from '@/constants/Keys';
import useLeague from '@/hooks/useLeague';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePlayerStats from '@/hooks/usePlayerStats';
import { TeamLeague } from '@/models/Leagues';
import { MarketStatus } from '@/models/Market';
import { PlayerStats } from '@/models/Stats';
import { OrderByOptions, mergeSort, onGetLeagueWithPartials } from '@/utils/leagues';
import { ClubsByLeagueUtils } from '@/utils/partials';

export function League({ league, isRefetching, onRefetch }: LeagueProps) {
  const colorTheme = useColorScheme();

  const { marketStatus, isMarketClose } = useMarketStatus();

  const { playerStats } = usePlayerStats();

  const [isSortingClubs, setIsSortingClubs] = useState(false);
  const [orderBy, setOrderBy] = useState(OrderByOptions.RODADA);
  const [clubs, setClubs] = useState<TeamLeague[] | ClubByLeague[]>();

  const { getItem } = useAsyncStorage(CLUBS_BY_LEAGUE_KEY_STORAGE(`${league?.liga.liga_id}`));

  const { clubsByLeague } = useLeague({ slug: league.liga.slug });

  const handleOrderByPatrimony = useCallback(() => {
    const newOrderBy =
      league &&
      league.times.sort((a: TeamLeague, b: TeamLeague) => {
        return (b.patrimonio as number) - (a.patrimonio as number);
      });

    return newOrderBy;
  }, [league]);

  const onGetClubsByLeagueFromStorage = useCallback(async () => {
    const data = await getItem();
    return data;
  }, [getItem]);

  const sortClubs = useCallback(
    async (sortBy: string) => {
      const clubsByLeague: ClubsByLeagueUtils | undefined =
        await onGetClubsByLeagueFromStorage().then((data) => (data ? JSON.parse(data) : ''));

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
        const newOrderByPatrimony = handleOrderByPatrimony();
        setClubs(newOrderByPatrimony);
      } else {
        await sortClubs(sortProp);
      }

      setTimeout(() => {
        setIsSortingClubs(false);
      }, 1);
    },
    [handleOrderByPatrimony, sortClubs]
  );

  useEffect(() => {
    if (!clubs) {
      if (league && orderBy === OrderByOptions.PATRIMONIO) {
        handleOrderByPatrimony();
        return;
      }
      sortClubs(orderBy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubs, league, orderBy]);

  const tabs: ITabs[] = useMemo(
    () => [
      {
        id: 1,
        title: 'Rodada',
        onPress() {
          const sortProp = OrderByOptions.RODADA;
          setIsSortingClubs(true);
          handleOnPressOrderBy(sortProp);
        },
      },
      {
        id: 2,
        title: 'Total',
        onPress() {
          const sortProp = OrderByOptions.CAMPEONATO;
          setIsSortingClubs(true);
          handleOnPressOrderBy(sortProp);
        },
      },
      {
        id: 3,
        title: 'Turno',
        onPress() {
          const sortProp = OrderByOptions.TURNO;
          setIsSortingClubs(true);
          handleOnPressOrderBy(sortProp);
        },
      },
      {
        id: 4,
        title: 'Mês',
        onPress() {
          const sortProp = OrderByOptions.MES;
          setIsSortingClubs(true);
          handleOnPressOrderBy(sortProp);
        },
      },
      {
        id: 5,
        title: 'C$',
        onPress() {
          const sortProp = OrderByOptions.PATRIMONIO;
          setIsSortingClubs(true);
          handleOnPressOrderBy(sortProp);
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
          club={item}
          league={league}
          orderBy={orderBy}
          position={index + 1}
          firstPlaceScore={(clubs?.[0].pontos as any)[orderBy]}
          isLeagueAcceptCapitain={!league.liga.sem_capitao}
        />
      );
    },
    [clubs, league, orderBy]
  );

  const isLoading = !clubs;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
      }}>
      <View
        style={{
          backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
        }}>
        <Tabs tabs={tabs} />
      </View>

      {isSortingClubs ? (
        <View className="flex-1 items-center justify-center mx-2 pt-6 mt-2 rounded-lg mb-2">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
          data={clubs}
          renderItem={(data) => renderItem(data)}
          keyExtractor={keyExtractor}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          contentContainerStyle={{
            paddingTop: 8,
            paddingVertical: 8,
            paddingHorizontal: 8,
            backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
            gap: 4,
          }}
        />
      )}
    </View>
  );
}
