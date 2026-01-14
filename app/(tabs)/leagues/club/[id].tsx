import { Feather } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, useColorScheme } from 'react-native';

import { onGetFillLineupDefaultPlayers } from '@/app/(tabs)/team/_team.helpers';
import { Text, TouchableOpacity, View } from '@/components/Themed';
import { ListReservePlayers } from '@/components/contexts/team/ListReservePlayers';
import { SoccerField } from '@/components/contexts/team/SoccerField';
import { StatsClubCard } from '@/components/contexts/utils/StatsClubCard';
import { TeamBanner } from '@/components/contexts/utils/TeamBanner';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import Colors from '@/constants/Colors';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import useTeam from '@/hooks/useTeam';
import useValorization from '@/hooks/useValorization';
import { FullClubInfo } from '@/models/Club';
import { FullPlayer } from '@/models/Stats';
import { useGetMatchSubstitutions } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { BACKGROUND_DEFAULT_DARK, BACKGROUND_DEFAULT_LIGHT } from '@/styles/colors';

const TYPE_VIEW = {
  FIELD: 'FIELD',
  LIST: 'LIST',
};

export interface PlayerClub extends FullPlayer {
  isReplaced?: boolean;
  isJoined?: boolean;
  isReserve?: boolean;
}

export default () => {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const isFirstRender = useRef(true);

  const { id } = useLocalSearchParams();

  const { marketStatus, isLoadingMarketStatus, isMarketClose } = useMarketStatus();

  const typeViewDefault = TYPE_VIEW.FIELD;

  const [view, setView] = useState(typeViewDefault);

  // const onChangeViewField = useCallback(() => {
  //   setView(TYPE_VIEW.FIELD);
  // }, []);

  // const onChangeViewList = useCallback(() => {
  //   setView(TYPE_VIEW.LIST);
  // }, []);

  const {
    data: playerStats,
    isLoading: isLoadingPlayerStats,
    isRefetching: isRefetchingPlayerStats,
    refetch: onRefetchStats,
  } = useGetScoredPlayers(isMarketClose);

  // const { valorizations, onRefetchValorizations, isRefetchingValorizations } = useValorization();

  const { onRefetchValorizations, isRefetchingValorizations } = useValorization();

  const marketRound = useMemo(() => marketStatus?.rodada_atual ?? 0, [marketStatus?.rodada_atual]);

  const [currentRound, setCurrentRound] = useState(0);

  const { team } = useTeam({
    teamId: Number(id),
    round: currentRound,
  });

  const {
    data: substitutions,
    isInitialLoading: isInitialLoadingSubstitutions,
    refetch: onRefetchSubstitutions,
    isRefetching: isRefetchingSubstitutions,
  } = useGetMatchSubstitutions({
    id: Number(id),
    round: currentRound,
  });

  // const onGetPlayersTab = (team: FullClubInfo) => {
  //   const { playersUpdated, reservesUpdated } = onUpdateTeamWithSubstitutedPlayers(
  //     team,
  //     substitutions
  //   );

  //   return [
  //     {
  //       title: 'Titulares',
  //       data: playersUpdated,
  //     },
  //     {
  //       title: 'Reservas',
  //       data: reservesUpdated.map((item) => {
  //         return {
  //           ...item,
  //           isReserve: true,
  //         };
  //       }),
  //     },
  //   ];
  // };

  const lineup = useMemo(() => {
    if (team && team.atletas && team.reservas)
      return onGetFillLineupDefaultPlayers({
        lineupStart: team.atletas,
        reserves: team.reservas,
        formationId:
          isMarketClose && currentRound === marketRound ? team.time.esquema_id : team.esquema_id ?? 1,
        playerStats,
        isMarketClose,
      });
  }, [currentRound, isMarketClose, marketRound, playerStats, team]);

  useEffect(() => {
    if (marketStatus && isFirstRender.current) {
      const round = isMarketClose ? marketStatus.rodada_atual : marketStatus.rodada_atual - 1;
      setCurrentRound(round);

      isFirstRender.current = false;
    }
  }, [isMarketClose, marketStatus]);

  const onRefetch = useCallback(async () => {
    await Promise.all([onRefetchStats(), onRefetchValorizations(), onRefetchSubstitutions()]);
  }, [onRefetchStats, onRefetchSubstitutions, onRefetchValorizations]);

  const isRefetching = useMemo(
    () => isRefetchingPlayerStats && isRefetchingValorizations && isRefetchingSubstitutions,
    [isRefetchingPlayerStats, isRefetchingSubstitutions, isRefetchingValorizations]
  );

  // const renderItem = useCallback(
  //   ({ item: player }: ListRenderItemInfo<PlayerClub>) => {
  //     return (
  //       <ClubPlayerCard
  //         player={player}
  //         isCaptain={team?.capitao_id === player.atleta_id}
  //         currentRound={currentRound}
  //         marketStatus={marketStatus as MarketStatus}
  //         playerStats={playerStats}
  //         isReserve={player.isReserve}
  //         appreciation={valorizations?.atletas[player.atleta_id]?.variacao_num}
  //         isReplacePlayer={substitutions?.some(
  //           (item) =>
  //             item.entrou.atleta_id === player.atleta_id || item.saiu.atleta_id === player.atleta_id
  //         )}
  //       />
  //     );
  //   },
  //   [
  //     currentRound,
  //     marketStatus,
  //     playerStats,
  //     substitutions,
  //     team?.capitao_id,
  //     valorizations?.atletas,
  //   ]
  // );

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;

  // const keyExtractor = useCallback((item: PlayerClub) => `${item.atleta_id}`, []);

  const isLoading = isMarketClose
    ? isLoadingPlayerStats || isLoadingMarketStatus
    : isLoadingMarketStatus;

  if (
    isLoading ||
    !team ||
    !marketRound ||
    !currentRound ||
    isInitialLoadingSubstitutions ||
    !lineup
  ) {
    return <LoadingScreen />;
  }

  const changeRoundDisabled = isMarketClose
    ? currentRound === marketStatus?.rodada_atual
    : currentRound === (marketStatus?.rodada_atual as number) - 1;

  return (
    <ScrollView
      refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
      className="px-2 pt-2"
      style={{
        gap: 8,
        backgroundColor: colorTheme === 'dark' ? BACKGROUND_DEFAULT_DARK : BACKGROUND_DEFAULT_LIGHT,
      }}>
      <TeamBanner team={team as FullClubInfo} />

      <StatsClubCard team={team} round={currentRound} />

      <View
        className="flex-row items-center justify-center px-2 pt-2"
        style={{
          gap: 8,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <TouchableOpacity
          className={`p-2 items-center justify-center mx-1 rounded-full ${
            currentRound === 1 ? 'bg-gray-200' : 'bg-blue-100'
          }`}
          disabled={currentRound === 1}
          onPress={() => setCurrentRound((previous) => previous - 1)}>
          <Feather
            name="chevron-left"
            size={24}
            color={currentRound === 1 ? '#d1d5db' : '#3b82f6'}
          />
        </TouchableOpacity>

        <Text className="font-semibold">Rodada {currentRound}</Text>

        <TouchableOpacity
          className={`p-2 items-center justify-center mx-1 rounded-full ${
            changeRoundDisabled ? 'bg-gray-200' : 'bg-blue-100'
          }`}
          disabled={
            isMarketClose
              ? currentRound === marketStatus?.rodada_atual
              : currentRound === (marketStatus?.rodada_atual as number) - 1
          }
          onPress={() => setCurrentRound((previous) => previous + 1)}>
          <Feather
            name="chevron-right"
            size={24}
            color={changeRoundDisabled ? '#9ca3af' : '#3b82f6'}
          />
        </TouchableOpacity>
      </View>
      {/* </View> */}

      {view === TYPE_VIEW.FIELD && (
        <View
          className="items-center justify-center pt-2 pb-2 mb-2"
          style={{
            gap: 8,
            backgroundColor:
              colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          }}>
        <SoccerField
          lineup={lineup}
          substitutions={substitutions}
          captain={team.capitao_id ?? 0}
          round={currentRound}
          isViewOnly
        />
          <ListReservePlayers
            lineup={lineup}
            substitutions={substitutions}
            round={currentRound}
            isViewOnly
          />
        </View>
      )}

      {/* {view === TYPE_VIEW.LIST && (
        <SectionList
          refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
          initialNumToRender={17}
          sections={onGetPlayersTab(team as FullClubInfo)}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          stickyHeaderHiddenOnScroll
          contentContainerStyle={{
            gap: 8,
            paddingHorizontal: 8,
            backgroundColor:
              colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          }}
          renderSectionHeader={({ section: { title } }) => (
            <View
              className="pt-2 rounded"
              style={{
                backgroundColor:
                  colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
              }}>
              <Text className="font-bold text-base text-center items-center">{title}</Text>
            </View>
          )}
        />
      )} */}
    </ScrollView>
  );
};
