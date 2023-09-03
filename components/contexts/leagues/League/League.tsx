import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  useColorScheme,
} from 'react-native';

import { ClubByLeague } from '@/app/(tabs)/leagues/[id]';
import { View } from '@/components/Themed';
import { ClubCard } from '@/components/contexts/leagues/club/ClubCard';
import { Loading } from '@/components/structure/Loading';
import { ITabs, Tabs } from '@/components/structure/Tabs';
import Colors from '@/constants/Colors';
import { CLUBS_BY_LEAGUE_KEY_STORAGE } from '@/constants/Keys';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { League as LeagueEntity, TeamLeague } from '@/models/Leagues';
import { MarketStatus } from '@/models/Market';
import { PlayerStats } from '@/models/Stats';
import { useGetClubsByLeagueId } from '@/queries/leagues.query';
import { OrderByOptions, mergeSort, onGetLeagueWithPartials } from '@/utils/leagues';
import { ClubsByLeagueUtils } from '@/utils/partials';

type LeagueProps = {
  league: LeagueEntity;
  playerStats: PlayerStats;
  marketStatus: MarketStatus;
  isRefetching: boolean;
  onRefetch: () => void;
};

export function League({
  league,
  marketStatus,
  playerStats,
  isRefetching,
  onRefetch,
}: LeagueProps) {
  const colorTheme = useColorScheme();

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const [isSortingClubs, setIsSortingClubs] = useState(false);

  const [clubs, setClubs] = useState<TeamLeague[] | ClubByLeague[]>();

  const [orderBy, setOrderBy] = useState(OrderByOptions.RODADA);

  const { data: clubsByLeague, isInitialLoading: isLoadingClubsByLeague } = useGetClubsByLeagueId(
    league?.liga.liga_id
  );

  const { getItem } = useAsyncStorage(CLUBS_BY_LEAGUE_KEY_STORAGE(`${league?.liga.liga_id}`));

  const onGetClubsByLeagueFromStorage = useCallback(async () => {
    const data = await getItem();
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

  const handleSortClubs = useCallback(
    async (sortBy: string) => {
      const clubsByLeague: ClubsByLeagueUtils | undefined =
        await onGetClubsByLeagueFromStorage().then((data) => (data ? JSON.parse(data) : ''));

      const compareFn = (a: ClubByLeague, b: ClubByLeague) =>
        ((b.pontos as any)[sortBy] as number) - ((a.pontos as any)[sortBy] as number);

      if (isMarketClose && clubsByLeague) {
        const leagueWithPartials = onGetLeagueWithPartials(
          league,
          clubsByLeague,
          playerStats,
          marketStatus
        );
        const sortedClubs = mergeSort(leagueWithPartials, compareFn);
        setClubs(sortedClubs);
      } else {
        const clubByLeagues = league?.times?.sort((a, b) => compareFn(a, b));
        setClubs(clubByLeagues);
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
        await handleSortClubs(sortProp);
      }

      setTimeout(() => {
        setIsSortingClubs(false);
      }, 1);
    },
    [handleOrderByPatrimony, handleSortClubs]
  );

  useEffect(() => {
    if (!clubs) {
      if (league && orderBy === OrderByOptions.PATRIMONIO) {
        handleOrderByPatrimony();
        return;
      }
      handleSortClubs(orderBy);
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
          marketStatus={marketStatus as MarketStatus}
          isMarketClose={isMarketClose}
          isLeagueAcceptCapitain={!league.liga.sem_capitao}
        />
      );
    },
    [clubs, isMarketClose, league, marketStatus, orderBy]
  );

  const isLoading = !clubs || isLoadingClubsByLeague;

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
