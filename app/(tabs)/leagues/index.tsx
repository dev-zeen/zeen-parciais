import { useCallback, useContext, useEffect, useState } from 'react';
import { ListRenderItemInfo, RefreshControl, SectionList, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { EmptyLeagueList } from '@/components/contexts/leagues/EmptyLeagueList';
import { LeagueCard } from '@/components/contexts/leagues/LeagueCard';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { Loading } from '@/components/structure/Loading';
import { Login } from '@/components/structure/Login';
import Colors from '@/constants/Colors';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import { LeagueUserDetails } from '@/models/Leagues';
import { MarketStatus } from '@/models/Market';
import { useGetMyClub } from '@/queries/club.query';
import { useGetLeagues } from '@/queries/leagues.query';
import { useGetMarketStatus } from '@/queries/market.query';

type SectionLeagueProps = {
  title: string;
  data: LeagueUserDetails[];
};

export default function () {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { data: marketStatus } = useGetMarketStatus();

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const allowRequest =
    isAutheticated &&
    marketStatus &&
    marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO;

  const {
    data: club,
    refetch: onRefetchClub,
    isRefetching: isRefetchingClub,
  } = useGetMyClub(!!allowRequest);

  const {
    data: dataLeagues,
    isLoading: isLoadingLeagues,
    refetch: onRefetchLeagues,
    isRefetching: isRefetchingLeagues,
  } = useGetLeagues(!!allowRequest);

  const [sectionLeaguesList, setSectionLeaguesList] = useState<SectionLeagueProps[]>([]);

  useEffect(() => {
    if (!dataLeagues) {
      return;
    }

    const { ligas } = dataLeagues;
    const { max_ligas_pro, max_ligas_free, max_ligas_matamata_pro, max_ligas_matamata_free } =
      marketStatus as MarketStatus;

    const privateLeagues = ligas.filter((item) => item.time_dono_id && !item.mata_mata);
    const cartolaLeagues = ligas.filter((item) => !item.time_dono_id);
    const cups = ligas.filter((item) => item.mata_mata);

    const sectionLeagues = [
      {
        title: `Ligas Clássicas - ${privateLeagues.length} / ${
          club?.time.assinante ? max_ligas_pro : max_ligas_free
        }`,
        data: privateLeagues,
      },
      {
        title: `Mata Mata - ${cups.length} / ${
          club?.time.assinante ? max_ligas_matamata_pro : max_ligas_matamata_free
        }`,
        data: cups,
      },
    ];

    if (!isMarketClose) {
      sectionLeagues.push({
        title: 'Ligas do Cartola',
        data: cartolaLeagues,
      });
    }

    const filteredSectionLeagues = sectionLeagues.filter((item) => item.data.length > 0);

    setSectionLeaguesList(filteredSectionLeagues);
  }, [club?.time, club?.time.assinante, dataLeagues, isMarketClose, marketStatus]);

  const keyExtractor = useCallback((item: LeagueUserDetails) => `${item.liga_id}`, []);

  const renderItem = useCallback(({ item: league }: ListRenderItemInfo<LeagueUserDetails>) => {
    return <LeagueCard key={league.liga_id} league={league} />;
  }, []);

  const onRefetch = useCallback(async () => {
    await onRefetchClub();
    await onRefetchLeagues();
  }, [onRefetchClub, onRefetchLeagues]);

  const isRefetching = isRefetchingClub || isRefetchingLeagues;

  if (!isAutheticated) {
    return <Login title="Para acessar suas ligas, é necessário efetuar o login no Cartola FC." />;
  }

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (!dataLeagues || isLoadingLeagues) {
    return <Loading />;
  }

  return (
    <SectionList
      refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
      sections={sectionLeaguesList}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      stickyHeaderHiddenOnScroll
      contentContainerStyle={{
        gap: 8,
        backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
      }}
      renderSectionHeader={({ section: { title } }) => (
        <View
          className="p-2 mx-2 rounded"
          style={{
            backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
          }}>
          <Text className="font-bold text-base text-center items-center">{title}</Text>
        </View>
      )}
      ListEmptyComponent={<EmptyLeagueList />}
    />
  );
}
