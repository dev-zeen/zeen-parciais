import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCallback, useMemo } from 'react';
import { FlatList, Image, ListRenderItemInfo, RefreshControl, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { Loading } from '@/components/structure/Loading';
import Colors from '@/constants/Colors';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { League, TeamLeague } from '@/models/Leagues';
import { useGetMarketStatus } from '@/queries/market.query';

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

  const { data: marketStatus, isLoading: isLoadingMarketStatus } = useGetMarketStatus();

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const totalTeamCup = useMemo(() => cup.liga.quantidade_times, [cup.liga.quantidade_times]);
  const currentTeamsCup = useMemo(() => cup.liga.total_times_liga, [cup.liga.total_times_liga]);

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
    },
    [pedingInviteBackground, teamDefaultBackground]
  );

  if (isLoadingMarketStatus) return <Loading />;

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
      }}>
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
            <Text>
              Início |{' '}
              {format(new Date(cup.liga.data_inicio as string), 'dd/MM', {
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
            <Text>
              Final | {''}
              {format(new Date(cup.liga.data_fim as string), 'dd/MM', {
                locale: ptBR,
              })}
            </Text>

            <Text className="font-semibold text-sm">{cup.liga.fim_rodada}º Radada</Text>
          </View>

          <View
            className="justify-center items-center"
            style={{
              gap: 4,
            }}>
            {!isMarketClose ? (
              <>
                <Text>Cartoleiros</Text>
                <Text className="text-base font-semibold">
                  {currentTeamsCup} / {totalTeamCup}
                </Text>
              </>
            ) : (
              <>
                <Text>Cartoleiros</Text>
                <Text className="text-base font-semibold">{totalTeamCup}</Text>
              </>
            )}
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
          backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
        }}
      />
    </View>
  );
}
