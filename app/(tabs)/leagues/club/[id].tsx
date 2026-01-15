import { Feather } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, useColorScheme } from 'react-native';

import { onGetFillLineupDefaultPlayers } from '@/app/(tabs)/team/_team.helpers';
import { Text, TouchableOpacity, View } from '@/components/Themed';
import { ListReservePlayers } from '@/components/contexts/team/ListReservePlayers';
import { SoccerField } from '@/components/contexts/team/SoccerField';
import { StatsClubCard } from '@/components/contexts/utils/StatsClubCard';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
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
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';

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
    if (!team) return undefined;

    const formationIdCandidate =
      isMarketClose && currentRound === marketRound
        ? team.time?.esquema_id ?? team.esquema_id
        : team.esquema_id;

    return onGetFillLineupDefaultPlayers({
      lineupStart: team.atletas ?? [],
      reserves: team.reservas ?? [],
      formationId: formationIdCandidate ?? 4,
      playerStats,
      isMarketClose,
    });
  }, [currentRound, isMarketClose, marketRound, playerStats, team]);

  useEffect(() => {
    if (marketStatus && isFirstRender.current) {
      // Mercado aberto costuma mostrar a rodada anterior, mas na 1ª rodada isso vira 0 e
      // deixa a tela em loading infinito. Garante mínimo 1.
      const roundCandidate = isMarketClose ? marketStatus.rodada_atual : marketStatus.rodada_atual - 1;
      const round = Math.max(1, roundCandidate);
      setCurrentRound(round);

      isFirstRender.current = false;
    }
  }, [isMarketClose, marketStatus]);

  const onRefetch = useCallback(async () => {
    await Promise.allSettled([onRefetchStats(), onRefetchValorizations(), onRefetchSubstitutions()]);
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

  if (isLoading || !marketStatus || !team || !currentRound || !lineup) {
    return <LoadingScreen />;
  }

  // Rodada máxima disponível para visualização
  const maxAvailableRound = isMarketClose 
    ? marketStatus.rodada_atual 
    : marketStatus.rodada_atual - 1;
  
  // Botão de próxima rodada só habilitado se currentRound < maxAvailableRound
  const nextRoundDisabled = currentRound >= maxAvailableRound;

  return (
    <SafeAreaViewContainer edges={['top']}>
      <View
        style={{
          flex: 1,
          backgroundColor: colorTheme === 'dark' ? BACKGROUND_DEFAULT_DARK : BACKGROUND_DEFAULT_LIGHT,
        }}>
        {/* Header */}
        <View
          className="px-4 pt-3 pb-3"
          style={{
            gap: 12,
            backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          }}>
          <View
            className="flex-row items-center justify-between"
            style={{ backgroundColor: 'transparent' }}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
                borderWidth: 1,
                borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
              }}>
              <Feather name="chevron-left" size={20} color={colorTheme === 'dark' ? '#e5e7eb' : '#111827'} />
            </TouchableOpacity>

            <View style={{ flex: 1, paddingHorizontal: 12, backgroundColor: 'transparent' }}>
              <Text className="text-xl font-extrabold" numberOfLines={1}>
                {team.time?.nome}
              </Text>
              <Text className="text-xs text-gray-500" numberOfLines={1}>
                {team.time?.nome_cartola}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingBottom: 16,
            gap: 12,
          }}>

        <StatsClubCard team={team} round={currentRound} />

          {/* Seletor de Rodada */}
          <AnimatedCard variant="flat" className="p-0">
            <View
              className="flex-row items-center justify-between px-3 py-2"
              style={{ backgroundColor: 'transparent' }}>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={currentRound === 1}
                onPress={() => setCurrentRound((previous) => previous - 1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: currentRound === 1 ? (colorTheme === 'dark' ? '#1f2937' : '#f3f4f6') : '#3b82f620',
                  borderWidth: 1,
                  borderColor: currentRound === 1 ? (colorTheme === 'dark' ? '#374151' : '#e5e7eb') : '#3b82f6',
                }}>
                <Feather
                  name="chevron-left"
                  size={18}
                  color={currentRound === 1 ? '#9ca3af' : '#3b82f6'}
                />
              </TouchableOpacity>

              <View style={{ alignItems: 'center', backgroundColor: 'transparent' }}>
                <Text className="text-xs text-gray-500 dark:text-gray-400">Rodada</Text>
                <Text className="text-lg font-bold">{currentRound}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                disabled={nextRoundDisabled}
                onPress={() => setCurrentRound((previous) => previous + 1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: nextRoundDisabled ? (colorTheme === 'dark' ? '#1f2937' : '#f3f4f6') : '#3b82f620',
                  borderWidth: 1,
                  borderColor: nextRoundDisabled ? (colorTheme === 'dark' ? '#374151' : '#e5e7eb') : '#3b82f6',
                }}>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={nextRoundDisabled ? '#9ca3af' : '#3b82f6'}
                />
              </TouchableOpacity>
            </View>
          </AnimatedCard>

          {/* Campo e Reservas */}
          {view === TYPE_VIEW.FIELD && (
            <View style={{ gap: 12, backgroundColor: 'transparent' }}>
              <SoccerField
                lineup={lineup}
                substitutions={substitutions}
                captain={team.capitao_id ?? 0}
                round={currentRound}
                isViewOnly
                onOpenMarket={() => {}}
              />
              <ListReservePlayers
                lineup={lineup}
                substitutions={substitutions}
                round={currentRound}
                isViewOnly
                onOpenMarket={() => {}}
              />
            </View>
          )}

        </ScrollView>
      </View>
    </SafeAreaViewContainer>
  );
};
