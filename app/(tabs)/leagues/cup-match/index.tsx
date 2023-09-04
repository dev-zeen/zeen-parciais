import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ListRenderItemInfo, RefreshControl, SectionList, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { CupMatchCard } from '@/components/contexts/leagues/Cup/CupMatchCard';
import { ClubPlayerCard } from '@/components/contexts/leagues/club/ClubPlayerCard';
import { Loading } from '@/components/structure/Loading';
import { ITabs, Tabs } from '@/components/structure/Tabs';
import Colors from '@/constants/Colors';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { FullClubInfo } from '@/models/Club';
import { CupMatch } from '@/models/Leagues';
import { MarketStatus } from '@/models/Market';
import { FullPlayer } from '@/models/Stats';
import { useGetClub, useGetMatchSubstitutions } from '@/queries/club.query';
import { useGetMarketStatus } from '@/queries/market.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { onUpdateTeamWithSubstitutedPlayers } from '@/utils/partials';

type SectionPlayersProps = {
  title: string;
  data: FullPlayer[];
};

export default () => {
  const colorTheme = useColorScheme();

  const { match } = useLocalSearchParams();

  const cupMatch: CupMatch = useMemo(() => JSON.parse(match as string), [match]);

  const { data: homeTeam } = useGetClub(cupMatch.time_mandante_id);

  const { data: awayTeam } = useGetClub(cupMatch.time_visitante_id);

  const [teamSelected, setTeamSelected] = useState<FullClubInfo>(homeTeam as FullClubInfo);

  const { data: marketStatus, isLoading: isLoadingMarketStatus } = useGetMarketStatus();

  const [isLoading, setIsLoading] = useState(false);

  const { data: substitutions } = useGetMatchSubstitutions({
    id: teamSelected?.time.time_id,
  });

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const {
    data: playerStats,
    isLoading: isLoadingPlayerStats,
    refetch: onRefechPlayerStats,
    isRefetching: isRefetchingPlayerStats,
  } = useGetScoredPlayers(isMarketClose);

  const [currentDataList, setCurrentDataList] = useState<SectionPlayersProps[]>();

  useEffect(() => {
    if (teamSelected) {
      const onGetPlayersTab = () => {
        const { playersUpdated, reservesUpdated } = onUpdateTeamWithSubstitutedPlayers(
          teamSelected,
          substitutions
        );

        return [
          {
            title: 'Titulares',
            data: playersUpdated as FullPlayer[],
          },
          {
            title: 'Reservas',
            data: reservesUpdated as FullPlayer[],
          },
        ];
      };

      setCurrentDataList(onGetPlayersTab());

      setIsLoading(false);
    }
  }, [substitutions, teamSelected]);

  useEffect(() => {
    if (homeTeam) {
      setTeamSelected(homeTeam);
    }
  }, [homeTeam]);

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<FullPlayer>) => {
      return (
        <ClubPlayerCard
          key={player.atleta_id}
          player={player}
          isCapitain={teamSelected?.capitao_id === player.atleta_id}
          currentRound={marketStatus?.rodada_atual as number}
          marketStatus={marketStatus as MarketStatus}
          playerStats={playerStats}
        />
      );
    },
    [marketStatus, playerStats, teamSelected?.capitao_id]
  );

  const tabs: ITabs[] = [
    {
      id: 1,
      title: homeTeam?.time.nome as string,
      onPress: () => {
        setIsLoading(true);
        setTeamSelected(homeTeam as FullClubInfo);
      },
    },
    {
      id: 2,
      title: awayTeam?.time.nome as string,
      onPress: () => {
        setIsLoading(true);
        setTeamSelected(awayTeam as FullClubInfo);
      },
    },
  ];

  const keyExtractor = useCallback((item: FullPlayer) => `${item.atleta_id}`, []);

  if (isLoadingPlayerStats || isLoadingMarketStatus || !homeTeam || !awayTeam || !teamSelected)
    return <Loading />;

  return (
    <>
      <View
        className="px-2"
        style={{
          backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
        }}>
        <CupMatchCard match={cupMatch} />

        <Tabs tabs={tabs} />
      </View>
      <>
        {isLoading ? (
          <Loading />
        ) : (
          <SectionList
            refreshControl={
              <RefreshControl
                onRefresh={onRefechPlayerStats}
                refreshing={isRefetchingPlayerStats}
              />
            }
            sections={currentDataList ?? []}
            ListEmptyComponent={() => <Text>Sem dados para mostrar</Text>}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            stickyHeaderHiddenOnScroll
            contentContainerStyle={{
              paddingHorizontal: 8,
              gap: 8,
              backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
            }}
            renderSectionHeader={({ section: { title } }) => (
              <View
                className="p-2 mx-2 rounded"
                style={{
                  backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
                }}>
                <Text className="font-bold text-base text-center items-center">{title}</Text>
              </View>
            )}
          />
        )}
      </>
    </>
  );
};
