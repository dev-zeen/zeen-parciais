import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, useColorScheme } from 'react-native';

import { View } from '@/components/Themed';
import { ClubCard } from '@/components/contexts/leagues/club/ClubCard';
import { DialogComponent } from '@/components/structure/Dialog';
import { Loading } from '@/components/structure/Loading';
import { ITabs, Tabs } from '@/components/structure/Tabs';
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

  const { marketStatus, isMarketClose } = useMarketStatus();

  const { data: playerStats } = useGetScoredPlayers(isMarketClose);

  const { refetch: onRefetchLeague, isRefetching: isRefetchingLeague } = useGetLeague(
    league.liga.slug
  );

  const [isSortingClubs, setIsSortingClubs] = useState(false);
  const [orderBy, setOrderBy] = useState(OrderByOptions.RODADA);
  const [clubs, setClubs] = useState<TeamLeague[] | ClubByLeague[]>();

  const [showModalPublicLeague, setShowModalPublicLeague] = useState(false);

  const { getItem } = useAsyncStorage(CLUBS_BY_LEAGUE_KEY_STORAGE(`${league?.liga.liga_id}`));

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
      }, 50);
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

  const handleConfirmDialog = useCallback(() => {
    setShowModalPublicLeague(false);
  }, []);

  useEffect(() => {
    if (league && !league?.liga.time_dono_id) {
      setShowModalPublicLeague(true);
    }
  }, [league]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clubs, league, orderBy]
  );

  const onRefetch = useCallback(async () => {
    sortClubs(orderBy);
    onRefetchLeague();
  }, [onRefetchLeague, orderBy, sortClubs]);

  const isLoading = !clubs;

  if (isLoading || !renderItem) {
    return <Loading />;
  }

  return (
    <>
      <View
        className="flex-1"
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

        {isSortingClubs ? (
          <View className="flex-1 items-center justify-center mx-2 pt-6 mt-2 rounded-lg mb-2">
            <ActivityIndicator />
          </View>
        ) : (
          <FlashList
            refreshControl={
              <RefreshControl onRefresh={onRefetch} refreshing={isRefetchingLeague} />
            }
            data={clubs}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={() => (
              <View className={`h-1 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`} />
            )}
            renderItem={renderItem}
            // initialNumToRender={15}
            // maxToRenderPerBatch={15}
            estimatedItemSize={100}
            contentContainerStyle={{
              paddingTop: 8,
              paddingVertical: 8,
              paddingHorizontal: 8,
              backgroundColor:
                colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
            }}
          />
        )}
      </View>

      {showModalPublicLeague && (
        <DialogComponent
          isVisible={showModalPublicLeague}
          onPressConfirm={handleConfirmDialog}
          subtitile="Apenas os 100 primeiros times são exibidos nas ligas públicas por questões de desempenho."
        />
      )}
    </>
  );
}
