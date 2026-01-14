import { useCallback } from 'react';
import { FlatList, ListRenderItemInfo, RefreshControl, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { EmptyInviteList } from '@/components/contexts/leagues/EmptyInviteList';
import { InviteCard } from '@/components/contexts/leagues/InviteCard';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import Colors from '@/constants/Colors';
import useInvites from '@/hooks/useInvites';
import { Invite } from '@/models/Invites';
import { useGetLeagues } from '@/queries/leagues.query';

export default () => {
  const colorTheme = useColorScheme();

  const { invites, isLoadingInvites, onRefetchInvites, isRefetchingInvites } = useInvites();

  const { refetch: onRefetchLeagues } = useGetLeagues();

  const onRefetch = useCallback(async () => {
    await Promise.all([onRefetchLeagues(), onRefetchInvites()]);
  }, [onRefetchInvites, onRefetchLeagues]);

  const keyExtractor = useCallback((item: Invite) => `${item.liga?.liga_id}`, []);

  const renderItem = useCallback(
    ({ item: invite }: ListRenderItemInfo<Invite>) => <InviteCard invite={invite} />,
    []
  );

  if (isLoadingInvites) return <LoadingScreen title="Carregando Convites" />;

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
        <Text className="text-lg font-semibold"> Convites </Text>
      </View>
      <FlatList
        ListEmptyComponent={<EmptyInviteList />}
        refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetchingInvites} />}
        keyExtractor={keyExtractor}
        data={invites?.convites}
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
