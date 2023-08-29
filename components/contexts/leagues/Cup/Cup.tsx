import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCallback, useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ListRenderItemInfo,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import * as Progress from 'react-native-progress';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { League, TeamLeague } from '@/models/Leagues';

interface TeamCup extends TeamLeague {
  isPending?: boolean;
}

type CupProps = {
  cup: League;
  isRefetching: boolean;
  onRefetch: () => void;
};

export function Cup({ cup, isRefetching, onRefetch }: CupProps) {
  const colorTheme = useColorScheme();
  const teamDefaultBackground = colorTheme === 'dark' ? '#047857' : '#dbeafe';
  const pedingInviteBackground = colorTheme === 'dark' ? '#ca8a04' : '#fef08a';

  const screenWidth = useMemo(() => Dimensions.get('window').width, []);
  const barWidth = useMemo(() => screenWidth - 100, [screenWidth]);

  const totalTeamCup = useMemo(() => cup.liga.quantidade_times, [cup.liga.quantidade_times]);
  const currentTeamsCup = useMemo(() => cup.liga.total_times_liga, [cup.liga.total_times_liga]);

  const percentageTeamsByTotal = useMemo(
    () => ((currentTeamsCup as number) / (totalTeamCup as number)) * 100,
    [currentTeamsCup, totalTeamCup]
  );

  const progress = useMemo(() => percentageTeamsByTotal / 100, [percentageTeamsByTotal]);

  const teamsAwatingAcceptInvite: TeamCup[] | undefined = useMemo(
    () => cup.convites_enviados?.map((item) => ({ ...item.time, isPending: true })),
    [cup.convites_enviados]
  );

  const teamsByCup: TeamCup[] = useMemo(() => cup.times?.map((item) => item), [cup]).sort(
    (a, b) => a.time_id - b.time_id
  );

  const keyExtractor = useCallback((item: TeamCup) => `${item.time_id}`, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TeamCup>) => {
      return (
        <View
          className="flex-1 rounded-lg items-center justify-center p-3"
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
              className="w-12 h-12"
              alt={`Imagem do time do ${item.nome_cartola}`}
            />
          </View>

          <Text className="font-semibold text-sm">{item.nome}</Text>
          <Text className="font-light capitalize">{item.nome_cartola}</Text>
        </View>
      );
    },
    [pedingInviteBackground, teamDefaultBackground]
  );

  return (
    <>
      <View
        className="mx-2"
        style={{
          gap: 8,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <View
          className="rounded-lg flex-row justify-around items-center p-2"
          style={{
            gap: 8,
            paddingVertical: 8,
          }}>
          <View
            className="justify-center items-center"
            style={{
              gap: 4,
            }}>
            <Text>Início</Text>
            <Text className="font-semibold text-sm">
              {format(new Date(cup.liga.data_inicio as string), "EEEEEE',' dd/MM/y", {
                locale: ptBR,
              })}
            </Text>
            <Text className="font-semibold text-sm">{cup.liga.inicio_rodada}º Radada </Text>
          </View>

          <View
            className="justify-center items-center"
            style={{
              gap: 4,
            }}>
            <Text>Final</Text>
            <Text className="font-semibold text-sm">
              {format(new Date(cup.liga.data_fim as string), "EEEEEE',' dd/MM/y", {
                locale: ptBR,
              })}
            </Text>
            <Text className="font-semibold text-sm">{cup.liga.fim_rodada}º Radada</Text>
          </View>
        </View>

        <View
          className="rounded-lg justify-center items-center p-2"
          style={{
            gap: 8,
            paddingVertical: 8,
          }}>
          <View className="items-center justify-center">
            <Text className="text-base font-semibold">Participantes</Text>
            <View
              className="justify-center items-center flex-row px-4 pb-5 pt-2"
              style={{
                gap: 4,
              }}>
              {totalTeamCup !== currentTeamsCup && (
                <View
                  className="bg-blue-500 items-center justify-center rounded-full p-1 w-6 h-6"
                  style={{
                    zIndex: 9999,
                    position: 'absolute',
                    top: 32,
                    left: barWidth * progress + 2,
                  }}>
                  <Text className="font-semibold text-neutral-200 text-xs">{currentTeamsCup}</Text>
                </View>
              )}

              <Progress.Bar
                progress={progress}
                width={barWidth}
                height={14}
                useNativeDriver
                color={progress === 1 ? '#22c55e' : '#3b82f6'}
              />
              <Text className="text-base font-semibold">{totalTeamCup}</Text>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
        data={
          teamsAwatingAcceptInvite && teamsAwatingAcceptInvite?.length > 0
            ? [...teamsByCup].concat(teamsAwatingAcceptInvite)
            : [...teamsByCup]
        }
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={{
          gap: 8,
        }}
        contentContainerStyle={{
          gap: 8,
          marginHorizontal: 8,
          paddingVertical: 8,
          borderRadius: 4,
        }}
      />
    </>
  );
}
