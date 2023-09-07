import { useCallback } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ListRenderItemInfo,
  RefreshControl,
  useColorScheme,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { EmptyInviteList } from '@/components/contexts/leagues/EmptyInviteList';
import { Button } from '@/components/structure/Button';
import { Loading } from '@/components/structure/Loading';
import Colors from '@/constants/Colors';
import useInvites from '@/hooks/useInvites';
import useLeagues from '@/hooks/useLeagues';
import { Invite } from '@/models/Leagues';
import { onAcceptInvite, onDeclineInvitation } from '@/queries/invites.query';

export default () => {
  const colorTheme = useColorScheme();

  const { invites, isLoadingInvites, onRefetchInvites, isRefetchingInvites } = useInvites();

  const { onRefetchLeagues } = useLeagues();

  const onRefetch = useCallback(async () => {
    await Promise.all([onRefetchLeagues(), onRefetchInvites()]);
  }, [onRefetchInvites, onRefetchLeagues]);

  const handleAcceptInvite = useCallback(async (messageId: number) => {
    await onAcceptInvite(String(messageId)).then((response) => {
      Alert.alert('Tudo certo Cartoleiro!', response.data.mensagem, [
        {
          text: 'Ok',
          style: 'cancel',
        },
      ]);
    });
  }, []);

  const handleDeclineInvitation = useCallback(async (messageId: number) => {
    await onDeclineInvitation(String(messageId)).then((response) => {
      Alert.alert('Tudo certo Cartoleiro!', response.data.mensagem, [
        {
          text: 'Ok',
          style: 'cancel',
        },
      ]);
    });
  }, []);

  const keyExtractor = useCallback((item: Invite) => `${item.liga?.liga_id}`, []);

  const renderItem = useCallback(
    ({ item: invite }: ListRenderItemInfo<Invite>) => {
      return (
        <View className="flex-row p-3 rounded-lg justify-between">
          <View
            className="flex-row items-center"
            style={{
              gap: 4,
            }}>
            <Image
              source={{
                uri: invite.liga?.imagem,
              }}
              className="w-12 h-12 rounded-full"
              alt={`Imagem da Liga ${invite.liga?.nome}`}
            />

            <View className="">
              <Text className="text-sm font-bold">{invite.liga?.nome}</Text>
              <Text className="text-sm font-normal">{invite.time.nome}</Text>

              <Text className="text-xs font-light">
                {invite.liga?.mata_mata ? 'Mata-Mata' : 'Clássica'} | {invite.liga?.tipo}
              </Text>
            </View>
          </View>

          <View
            className="flex-row py-3"
            style={{
              gap: 16,
            }}>
            <Button
              onPress={() => handleDeclineInvitation(invite?.mensagem_id)}
              variant="error"
              onlyIcon
              hasIcon
              iconName="x"
            />
            <Button
              onPress={() => handleAcceptInvite(invite.mensagem_id)}
              variant="success"
              onlyIcon
              hasIcon
              iconName="check"
            />
          </View>
        </View>
      );
    },
    [handleAcceptInvite, handleDeclineInvitation]
  );

  if (isLoadingInvites) return <Loading />;

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
      }}>
      <View
        className="items-center py-2"
        style={{
          backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
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
          backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
          gap: 8,
        }}
      />
    </View>
  );
};
