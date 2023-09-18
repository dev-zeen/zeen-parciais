import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCallback, useEffect, useState } from 'react';
import { Image, RefreshControl, useColorScheme } from 'react-native';

import { LeagueProps } from '@/app/(tabs)/leagues/[id]';
import { Text, View } from '@/components/Themed';
import { CupMatchCard } from '@/components/contexts/leagues/Cup/CupMatchCard';
import { Loading } from '@/components/structure/Loading';
import { ITabs, Tabs } from '@/components/structure/Tabs';
import Colors from '@/constants/Colors';
import useLeague, { TeamCup } from '@/hooks/useLeague';
import useMarketStatus from '@/hooks/useMarketStatus';
import { FullClubInfo } from '@/models/Club';
import { useGetMyClub } from '@/queries/club.query';

export function Cup({ league: cup, isRefetching, onRefetch }: LeagueProps) {
  const colorTheme = useColorScheme();

  const teamDefaultBackground = colorTheme === 'dark' ? '#047857' : '#dbeafe';
  const pedingInviteBackground = colorTheme === 'dark' ? '#ca8a04' : '#fef08a';

  const { marketStatus, isMarketClose } = useMarketStatus();

  const { data: myClub, isLoading: isLoadingMyClub } = useGetMyClub();

  const { isCupInProgress, totalTeamCup, currentTeamsCup, teamsAwatingAcceptInvite, teamsByCup } =
    useLeague({
      slug: cup.liga.slug,
    });

  const keyExtractor = useCallback((item: TeamCup) => `${item.time_id}`, []);

  const [roundTabs, setRoundTabs] = useState<ITabs[]>([]);

  const renderMatchItem = useCallback(
    (round: string) => {
      if (cup && cup.chaves_mata_mata && marketStatus && myClub) {
        return (
          <FlashList
            refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
            data={cup.chaves_mata_mata[round]}
            keyExtractor={(item) => `${item.chave_id}`}
            ItemSeparatorComponent={() => (
              <View className={`h-2 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`} />
            )}
            renderItem={({ item }) => {
              return <CupMatchCard match={item} myTeam={myClub as FullClubInfo} />;
            }}
            estimatedItemSize={16}
            contentContainerStyle={{
              paddingTop: 8,
              paddingHorizontal: 8,
            }}
          />
        );
      }
    },
    [cup, marketStatus, myClub, onRefetch, isRefetching, colorTheme]
  );

  const renderTeamItem = useCallback(
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

  useEffect(() => {
    if (isCupInProgress && cup && cup.chaves_mata_mata) {
      const tabs = Object.keys(cup.chaves_mata_mata).map((round) => {
        return {
          id: Number(round),
          title: round,
          content: () => renderMatchItem(round),
        };
      });

      setRoundTabs(tabs);
    }
  }, [cup, isCupInProgress, renderMatchItem]);

  const isLoading = isCupInProgress ? isLoadingMyClub || roundTabs.length < 1 : isLoadingMyClub;

  if (isLoading) return <Loading />;

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor:
          colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
      }}>
      <View
        className="mx-2 mb-2"
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

      {!isCupInProgress ? (
        <FlashList
          refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
          data={
            teamsAwatingAcceptInvite && teamsAwatingAcceptInvite?.length > 0
              ? [...teamsByCup].concat(teamsAwatingAcceptInvite)
              : [...teamsByCup]
          }
          keyExtractor={keyExtractor}
          renderItem={renderTeamItem}
          estimatedItemSize={32}
          numColumns={2}
          contentContainerStyle={{
            paddingVertical: 8,
            backgroundColor:
              colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          }}
        />
      ) : (
        <Tabs tabs={roundTabs} />
      )}
    </View>
  );
}
