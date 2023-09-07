import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ListRenderItemInfo, RefreshControl, SectionList, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { CupMatchCard } from '@/components/contexts/leagues/Cup/CupMatchCard';
import { ClubPlayerCard } from '@/components/contexts/leagues/club/ClubPlayerCard';
import { Loading } from '@/components/structure/Loading';
import { ITabs, Tabs } from '@/components/structure/Tabs';
import Colors from '@/constants/Colors';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePlayerStats from '@/hooks/usePlayerStats';
import useSubstituition from '@/hooks/useSubstituition';
import useTeam from '@/hooks/useTeam';
import { FullClubInfo } from '@/models/Club';
import { CupMatch } from '@/models/Leagues';
import { MarketStatus } from '@/models/Market';
import { FullPlayer } from '@/models/Stats';
import { onUpdateTeamWithSubstitutedPlayers } from '@/utils/partials';

type SectionPlayersProps = {
  title: string;
  data: FullPlayer[];
};

export default () => {
  const colorTheme = useColorScheme();

  const { match } = useLocalSearchParams();

  const { marketStatus, isLoadingMarketStatus } = useMarketStatus();

  const cupMatch: CupMatch = useMemo(() => JSON.parse(match as string), [match]);

  const { team: homeTeam } = useTeam({
    teamId: cupMatch.time_mandante_id ?? 0,
  });

  const { team: awayTeam } = useTeam({
    teamId: cupMatch.time_mandante_id ?? 0,
  });

  const [currentDataList, setCurrentDataList] = useState<SectionPlayersProps[]>();
  const [teamSelected, setTeamSelected] = useState<FullClubInfo>(homeTeam as FullClubInfo);
  const [isLoading, setIsLoading] = useState(false);

  const { substitutions } = useSubstituition({
    teamId: teamSelected?.time.time_id,
    round: cupMatch.rodada_id,
  });

  const { playerStats, isLoadingPlayerStats, onRefetchStats, isRefetchingPlayerStats } =
    usePlayerStats();

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
              <RefreshControl onRefresh={onRefetchStats} refreshing={isRefetchingPlayerStats} />
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
