import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import {  FlatList, ListRenderItemInfo, RefreshControl } from 'react-native';

import { Text, View } from '@/components/Themed';
import { EmptyInviteList } from '@/components/contexts/leagues/EmptyInviteList';
import { RequestCard } from '@/components/contexts/leagues/RequestCard';
import { Loading } from '@/components/structure/Loading';
import Colors from '@/constants/Colors';
import useMarketStatus from '@/hooks/useMarketStatus';
import { Invite } from '@/models/Invites';
import { useGetLeague } from '@/queries/leagues.query';
import { useThemeColor } from '@/hooks/useThemeColor';

export default () => {
  const colorTheme = useThemeColor();

  const { id: slug } = useLocalSearchParams();

  const { allowRequest } = useMarketStatus();

  const {
    data: league,
    isInitialLoading: isInitialLoadingLeague,
    refetch: onRefetchLeague,
    isRefetching: isRefetchingLeague,
  } = useGetLeague(slug as string, allowRequest);

  const onRefetch = useCallback(async () => {
    await Promise.all([onRefetchLeague()]);
  }, [onRefetchLeague]);

  const keyExtractor = useCallback((item: Invite) => `${item.mensagem_id}`, []);

  const renderItem = useCallback(
    ({ item: request }: ListRenderItemInfo<Invite>) => (
      <RequestCard request={request} onRefetchLeague={onRefetchLeague} />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (isInitialLoadingLeague) return <Loading title="Carregando solicitações" />;

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor:
          colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
      }}>
      <View
        className="items-center py-2"
        style={{
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <Text className="text-lg font-semibold"> Solicitações </Text>
      </View>
      <FlatList
        ListEmptyComponent={<EmptyInviteList />}
        refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetchingLeague} />}
        keyExtractor={keyExtractor}
        data={league?.pedidos}
        renderItem={renderItem}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        contentContainerStyle={{
          marginHorizontal: 8,
          paddingTop: 8,
          paddingVertical: 8,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          gap: 8,
        }}
      />
    </View>
  );
};
