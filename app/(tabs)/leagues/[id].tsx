import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FlatList, Image, ListRenderItemInfo, RefreshControl, useColorScheme } from 'react-native';

import { OrderByOptions, mergeSort, onGetLeagueWithPartials } from './leagues.helper';

import { Text, View } from '@/components/Themed';
import { ClubCard } from '@/components/contexts/leagues/club/ClubCard';
import { DialogComponent } from '@/components/structure/Dialog';
import { Loading } from '@/components/structure/Loading';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { ITabs, Tabs } from '@/components/structure/Tabs';
import Colors from '@/constants/Colors';
import { CLUBS_BY_LEAGUE_KEY_STORAGE } from '@/constants/Keys';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import { League, TeamLeague } from '@/models/Leagues';
import { MarketStatus } from '@/models/Market';
import { PlayerStats } from '@/models/Stats';
import { useGetClubsByLeagueId, useGetLeague } from '@/queries/leagues.query';
import { useGetMarketStatus } from '@/queries/market.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import theme from '@/styles/theme';
import { ClubsByLeagueUtils } from '@/utils/partials';

export interface ClubByLeague extends TeamLeague {
  playersHavePlayed?: number;
}

export default () => {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { id: slug } = useLocalSearchParams();

  const { data: marketStatus } = useGetMarketStatus();

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const { data: playerStats, refetch: onRefetchStats } = useGetScoredPlayers(isMarketClose);

  const [clubs, setClubs] = useState<TeamLeague[] | ClubByLeague[]>();

  const [orderBy, setOrderBy] = useState(OrderByOptions.RODADA);

  const [showModalPublicLeague, setShowModalPublicLeague] = useState(false);

  const {
    data: league,
    refetch: onRefetchLeague,
    isRefetching: isRefetchingLeague,
  } = useGetLeague(slug as string);

  const onRefetch = useCallback(async () => {
    await onRefetchLeague();
    await onRefetchStats();
  }, [onRefetchLeague, onRefetchStats]);

  const isRefetching = isRefetchingLeague;

  const { data: clubsByLeague, isInitialLoading: isLoadingClubsByLeague } = useGetClubsByLeagueId(
    league?.liga.liga_id
  );

  const { getItem } = useAsyncStorage(CLUBS_BY_LEAGUE_KEY_STORAGE(`${league?.liga.liga_id}`));

  const handleConfirmDialog = () => {
    setShowModalPublicLeague(false);
  };

  const onGetClubsByLeagueFromStorage = useCallback(async () => {
    const data = await getItem();
    return data;
  }, [getItem]);

  const handleOrderByPatrimony = useCallback(() => {
    const newOrderBy =
      league &&
      league.times.sort((a: TeamLeague, b: TeamLeague) => {
        return b.patrimonio - a.patrimonio;
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
          league as League,
          clubsByLeague,
          playerStats as PlayerStats,
          marketStatus as MarketStatus
        );
        const sortedClubs = mergeSort(leagueWithPartials, compareFn);
        setClubs(sortedClubs);
      } else {
        const clubByLeagues = league?.times?.sort((a, b) => compareFn(a, b));
        setClubs(clubByLeagues);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onGetClubsByLeagueFromStorage, clubsByLeague, isMarketClose, league, playerStats, marketStatus]
  );

  const handleOnPressOrderBy = useCallback(
    async (sortProp: string) => {
      setOrderBy(sortProp as OrderByOptions);
      if (sortProp === OrderByOptions.PATRIMONIO) {
        const newOrderByPatrimony = handleOrderByPatrimony();
        setClubs(newOrderByPatrimony);
        return;
      }

      await handleSortClubs(sortProp);
    },
    [handleOrderByPatrimony, handleSortClubs]
  );

  useEffect(() => {
    if (league && orderBy === OrderByOptions.PATRIMONIO) {
      handleOrderByPatrimony();
      return;
    }
    handleSortClubs(orderBy);
  }, [handleOrderByPatrimony, handleSortClubs, league, orderBy]);

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
          if (sortProp === orderBy) return;
          handleOnPressOrderBy(sortProp);
        },
      },
      {
        id: 2,
        title: 'Total',
        onPress() {
          const sortProp = OrderByOptions.CAMPEONATO;
          if (sortProp === orderBy) return;
          handleOnPressOrderBy(sortProp);
        },
      },
      {
        id: 3,
        title: 'Turno',
        onPress() {
          const sortProp = OrderByOptions.TURNO;
          if (sortProp === orderBy) return;
          handleOnPressOrderBy(sortProp);
        },
      },
      {
        id: 4,
        title: 'Mês',
        onPress() {
          const sortProp = OrderByOptions.MES;
          if (sortProp === orderBy) return;
          handleOnPressOrderBy(sortProp);
        },
      },
      {
        id: 5,
        title: 'C$',
        onPress() {
          const sortProp = OrderByOptions.PATRIMONIO;
          if (sortProp === orderBy) return;
          handleOnPressOrderBy(sortProp);
        },
      },
    ],
    [handleOnPressOrderBy, orderBy]
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<TeamLeague>) => {
      return (
        <ClubCard
          club={item}
          league={league as League}
          position={index + 1}
          orderBy={orderBy}
          firstPlaceScore={(clubs?.[0].pontos as any)[orderBy]}
          marketStatus={marketStatus as MarketStatus}
          isMarketClose={isMarketClose}
        />
      );
    },
    [clubs, isMarketClose, league, marketStatus, orderBy]
  );

  const keyExtractor = useCallback((item: TeamLeague) => `${item.time_id}`, []);

  const isLoading = isMarketClose
    ? !clubs || isLoadingClubsByLeague || !league || !playerStats
    : !clubs || isLoadingClubsByLeague || !league;

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <View
        className={`${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}
        style={{
          gap: 8,
        }}>
        <View className="flex-row justify-center items-center py-2 rounded-lg mx-2 mt-2">
          <Image
            source={{
              uri: league?.liga.url_flamula_png,
            }}
            style={{
              width: theme.Tokens.SIZE.sm,
              height: theme.Tokens.SIZE.sm,
            }}
            alt={`Imagem da liga ${league?.liga.nome}`}
          />
          <Text
            style={{
              fontWeight: '700',
              fontSize: theme.Tokens.TEXT.md,
              textTransform: 'uppercase',
            }}>
            {league?.liga.nome}
          </Text>
        </View>

        <Tabs tabs={tabs} />
      </View>

      <FlatList
        refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
        data={clubs}
        renderItem={(data) => renderItem(data)}
        keyExtractor={keyExtractor}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        contentContainerStyle={{
          marginTop: 4,
          paddingVertical: 8,
          marginHorizontal: 8,
          backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
          gap: 6,
        }}
      />

      {showModalPublicLeague && (
        <DialogComponent
          isVisible={showModalPublicLeague}
          onPressConfirm={handleConfirmDialog}
          subtitile="Apenas os 100 primeiros times são exibidos nas ligas públicas por questões de desempenho."
        />
      )}
    </SafeAreaViewContainer>
  );
};
