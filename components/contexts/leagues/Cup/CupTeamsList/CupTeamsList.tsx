import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback } from 'react';
import { Image, RefreshControl, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import useLeague, { TeamCup } from '@/hooks/useLeague';
import { League } from '@/models/Leagues';

type CupTeamsListProps = {
  cup: League;
};

export function CupTeamsList({ cup }: CupTeamsListProps) {
  const colorTheme = useColorScheme();

  const teamDefaultBackground = colorTheme === 'dark' ? '#047857' : '#dbeafe';
  const pedingInviteBackground = colorTheme === 'dark' ? '#ca8a04' : '#fef08a';

  const {
    onRefetchLeague,
    isRefetchingLeague,
    isCupInProgress,
    teamsAwatingAcceptInvite,
    teamsByCup,
  } = useLeague({
    slug: cup.liga.slug,
  });

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TeamCup>) => {
      if (!isCupInProgress) {
        return (
          <View
            className="flex-1 rounded-lg items-center justify-center p-2"
            style={{
              backgroundColor: item.isPending ? pedingInviteBackground : teamDefaultBackground,
              gap: 4,
            }}>
            <View
              className="flex-row items-center justify-center"
              style={{
                gap: 4,
                backgroundColor: item.isPending ? pedingInviteBackground : teamDefaultBackground,
              }}>
              <Image
                source={{
                  uri: item.url_escudo_png,
                }}
                className="w-10 h-10"
                alt={`Imagem do time do ${item.nome_cartola}`}
              />
            </View>

            <Text
              className="font-semibold"
              style={{
                fontSize: 14,
                lineHeight: 14,
              }}>
              {item.nome}
            </Text>
            <Text className="font-light capitalize">{item.nome_cartola}</Text>
          </View>
        );
      }
      return <></>;
    },
    [isCupInProgress, pedingInviteBackground, teamDefaultBackground]
  );

  const keyExtractor = useCallback((item: TeamCup) => `${item.time_id}`, []);

  return (
    <FlashList
      refreshControl={
        <RefreshControl onRefresh={onRefetchLeague} refreshing={isRefetchingLeague} />
      }
      data={
        teamsAwatingAcceptInvite && teamsAwatingAcceptInvite?.length > 0
          ? [...teamsByCup].concat(teamsAwatingAcceptInvite)
          : [...teamsByCup]
      }
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      estimatedItemSize={32}
      numColumns={2}
      contentContainerStyle={{
        paddingVertical: 8,
        backgroundColor:
          colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
      }}
    />
  );
}
