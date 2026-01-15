import { useCallback } from 'react';
import { FlatList, Image, ListRenderItemInfo, RefreshControl } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import useLeague, { TeamCup } from '@/hooks/useLeague';
import { useThemeColor } from '@/hooks/useThemeColor';
import { League } from '@/models/Leagues';

type CupTeamsListProps = {
  cup: League;
};

export function CupTeamsList({ cup }: CupTeamsListProps) {
  const colorTheme = useThemeColor();

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
      return (
        <View
          className="flex-1 rounded-lg items-center justify-center p-2 mx-2 mb-1"
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
              style={{
                margin: 2,
              }}
              className="w-12 h-12"
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
          <Text className=" capitalize">{item.nome_cartola}</Text>
        </View>
      );
    },
    [pedingInviteBackground, teamDefaultBackground]
  );

  const keyExtractor = useCallback((item: TeamCup) => `${item.time_id}`, []);

  // Se a copa já está em andamento, essa lista não é usada (a UI mostra as chaves).
  // Evita renderizar células vazias e desperdiçar processamento.
  if (isCupInProgress) {
    return null;
  }

  return (
    <FlatList
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
      initialNumToRender={32}
      numColumns={2}
      contentContainerStyle={{
        backgroundColor:
          colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
      }}
    />
  );
}
