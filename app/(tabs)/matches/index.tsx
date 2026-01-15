import { useCallback } from 'react';
import {  FlatList, ListRenderItemInfo, RefreshControl } from 'react-native';

import { View } from '@/components/Themed';
import { MatchCard } from '@/components/contexts/matches/MatchCard';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import useMarketStatus from '@/hooks/useMarketStatus';
import { Match } from '@/models/Matches';
import { useGetMyClub } from '@/queries/club.query';
import { useGetMatchs } from '@/queries/matches.query';
import { useThemeColor } from '@/hooks/useThemeColor';

export default () => {
  const colorTheme = useThemeColor();

  const { allowRequest } = useMarketStatus();

  const {
    data: matches,
    isLoading: isLoadingMatches,
    refetch: onRefetchMatches,
    isRefetching: isRefetchingMatches,
  } = useGetMatchs();

  const { data: myClub } = useGetMyClub(allowRequest);

  const keyExtractor = useCallback((item: Match) => `${item.clube_casa_id}`, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Match>) => {
      return (
        <MatchCard
          match={item}
          players={myClub?.atletas}
          homeClub={matches?.clubes[item.clube_casa_id]}
          awayClub={matches?.clubes[item.clube_visitante_id]}
          isDisabled={!allowRequest || !item.valida}
        />
      );
    },
    [myClub?.atletas, matches?.clubes, allowRequest]
  );

  if (isLoadingMatches || !matches) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaViewContainer edges={['top']}>
      <View
        className={`mx-2 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}
        style={{
          gap: 8,
          flex: 1,
        }}>
        <MarketStatusCard />
        <FlatList
          contentContainerStyle={{
            gap: 8,
            paddingBottom: 8,
          }}
          refreshControl={
            <RefreshControl onRefresh={onRefetchMatches} refreshing={isRefetchingMatches} />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          data={matches?.partidas}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaViewContainer>
  );
};
