import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCallback, useMemo } from 'react';
import { RefreshControl, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { CupMatchCard } from '@/components/contexts/leagues/Cup/CupMatchCard';
import { CupTeamsList } from '@/components/contexts/leagues/Cup/CupTeamsList';
import { Loading } from '@/components/structure/Loading';
import { ITab, Tabs } from '@/components/structure/Tabs';
import Colors from '@/constants/Colors';
import useLeague from '@/hooks/useLeague';
import useMarketStatus from '@/hooks/useMarketStatus';
import { FullClubInfo } from '@/models/Club';
import { CupMatch, League } from '@/models/Leagues';
import { useGetMyClub } from '@/queries/club.query';
import { useGetAppreciations } from '@/queries/players.query';
import { useGetScoredPlayers } from '@/queries/stats.query';

interface CupProps {
  league: League;
}

export function Cup({ league: cup }: CupProps) {
  const colorTheme = useColorScheme();

  const { marketStatus, isMarketClose } = useMarketStatus();

  const { data: myClub, isLoading: isLoadingMyClub } = useGetMyClub();

  const { refetch: onRefetchStats } = useGetScoredPlayers(isMarketClose);

  const { refetch: onRefetchValorizations } = useGetAppreciations(isMarketClose);

  const { isCupInProgress, totalTeamCup, currentTeamsCup, onRefetchLeague, isRefetchingLeague } =
    useLeague({
      slug: cup.liga.slug,
    });

  const renderCupMatchCard = useCallback(
    ({ item }: ListRenderItemInfo<CupMatch>) => {
      return <CupMatchCard match={item} myTeam={myClub as FullClubInfo} />;
    },
    [myClub]
  );

  const onRefetch = useCallback(async () => {
    await Promise.all([onRefetchLeague(), onRefetchStats(), onRefetchValorizations()]);
  }, [onRefetchLeague, onRefetchStats, onRefetchValorizations]);

  const isRefetching = isRefetchingLeague;

  const renderItem = useCallback(
    (round: string) => {
      return (
        <FlashList
          refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
          data={cup.chaves_mata_mata ? cup.chaves_mata_mata[round] : []}
          keyExtractor={(item) => `${item.chave_id}`}
          ItemSeparatorComponent={() => (
            <View className={`h-2 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`} />
          )}
          estimatedItemSize={100}
          renderItem={renderCupMatchCard}
          contentContainerStyle={{
            paddingTop: 8,
            paddingHorizontal: 8,
            paddingBottom: 8,
          }}
        />
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cup, marketStatus, myClub]
  );

  const roundTabs: ITab[] | undefined = useMemo(() => {
    if (isCupInProgress && cup && cup.chaves_mata_mata) {
      return Object.keys(cup.chaves_mata_mata).map((round) => {
        return {
          id: Number(round),
          title: round,
          content: () => renderItem(round),
        };
      });
    }
    return [];
  }, [cup, isCupInProgress, renderItem]);

  const isLoading = isCupInProgress ? isLoadingMyClub || roundTabs?.length < 1 : isLoadingMyClub;

  if (isLoading || !cup || !marketStatus || !renderItem) return <Loading />;

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
              {format(new Date(cup?.liga.data_inicio as string), 'dd/MM', {
                locale: ptBR,
              })}
            </Text>

            <Text className="font-semibold text-sm">{cup?.liga.inicio_rodada}º Radada </Text>
          </View>

          <View
            className="justify-center items-center"
            style={{
              gap: 4,
            }}>
            <Text>
              Final | {''}
              {format(new Date(cup?.liga.data_fim as string), 'dd/MM', {
                locale: ptBR,
              })}
            </Text>

            <Text className="font-semibold text-sm">{cup?.liga.fim_rodada}º Radada</Text>
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

      {!isCupInProgress ? <CupTeamsList cup={cup} /> : <Tabs tabs={roundTabs} />}
    </View>
  );
}
