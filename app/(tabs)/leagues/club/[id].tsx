import { Feather } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

import { Text, View } from '@/components/Themed';
import { ClubPlayerCard } from '@/components/contexts/leagues/club/ClubPlayerCard';
import { TeamBanner } from '@/components/contexts/utils/TeamBanner';
import { Loading } from '@/components/structure/Loading';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePartialScore from '@/hooks/usePartialScore';
import useTeam from '@/hooks/useTeam';
import useValorization from '@/hooks/useValorization';
import { FullClubInfo } from '@/models/Club';
import { MarketStatus } from '@/models/Market';
import { FullPlayer } from '@/models/Stats';
import { useGetMatchSubstitutions } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { BACKGROUND_DEFAULT_DARK, BACKGROUND_DEFAULT_LIGHT } from '@/styles/colors';
import { numberToString } from '@/utils/parseTo';
import { onCalculatePartialScore, onUpdateTeamWithSubstitutedPlayers } from '@/utils/partials';

const TYPE_VIEW = {
  CAMPO: 'CAMPO',
  LISTA: 'LISTA',
};

export interface PlayerClub extends FullPlayer {
  isReplaced?: boolean;
  isJoined?: boolean;
}

export default () => {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const isFirstRender = useRef(true);

  const { id } = useLocalSearchParams();

  const { marketStatus, isMarketClose } = useMarketStatus();

  const typeViewDefault = TYPE_VIEW.LISTA;

  const {
    data: playerStats,
    isRefetching: isRefetchingPlayerStats,
    refetch: onRefetchStats,
  } = useGetScoredPlayers(isMarketClose);

  const { valorizations, onRefetchValorizations, isRefetchingValorizations } = useValorization();

  const [currentRound, setCurrentRound] = useState(0);
  const [clubAppreciation, setClubAppreciation] = useState(0);
  const [reservePlayers, setReservePlayers] = useState<FullPlayer[] | PlayerClub[]>();
  const [startingPlayers, setStartingPlayers] = useState<FullPlayer[] | PlayerClub[]>();

  const { team } = useTeam({
    teamId: Number(id),
    round: currentRound,
  });

  const { data: substitutions } = useGetMatchSubstitutions({
    id: Number(id),
    round: currentRound,
  });

  const { partialScore } = usePartialScore({
    teamId: team?.time?.time_id ?? 0,
  });

  useEffect(() => {
    if (currentRound === marketStatus?.rodada_atual && isMarketClose && team) {
      const currentSum = team.atletas.reduce((acc, current) => {
        if (valorizations?.atletas[current.atleta_id]?.variacao_num) {
          return (acc += valorizations?.atletas[current.atleta_id]?.variacao_num);
        }
        return acc;
      }, 0);

      setClubAppreciation(currentSum as number);
    }
  }, [valorizations, marketStatus, currentRound, team, isMarketClose]);

  useEffect(() => {
    if (marketStatus && isFirstRender.current) {
      const round = isMarketClose ? marketStatus.rodada_atual : marketStatus.rodada_atual - 1;
      setCurrentRound(round);

      isFirstRender.current = false;
    }
  }, [isMarketClose, marketStatus]);

  useEffect(() => {
    if (team && substitutions && substitutions?.length > 0) {
      const { playersUpdated, reservesUpdated } = onUpdateTeamWithSubstitutedPlayers(
        team,
        substitutions
      );
      setStartingPlayers(playersUpdated);
      setReservePlayers(reservesUpdated);
    } else {
      if (team?.atletas) setStartingPlayers(team.atletas);
      if (team?.reservas) setReservePlayers(team.reservas);
    }
  }, [team, substitutions]);

  const onRefetch = useCallback(async () => {
    await Promise.all([onRefetchStats(), onRefetchValorizations()]);
  }, [onRefetchStats, onRefetchValorizations]);

  const isRefetching = isRefetchingPlayerStats || isRefetchingValorizations;

  const renderItem = useCallback(
    (player: PlayerClub, isReserve?: boolean) => {
      return (
        <ClubPlayerCard
          key={player.atleta_id}
          player={player}
          isCapitain={team?.capitao_id === player.atleta_id}
          currentRound={currentRound}
          marketStatus={marketStatus as MarketStatus}
          playerStats={playerStats}
          isReserve={isReserve}
          appreciation={valorizations?.atletas[player.atleta_id]?.variacao_num}
        />
      );
    },
    [currentRound, marketStatus, playerStats, team?.capitao_id, valorizations?.atletas]
  );

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;

  const isLoading = isMarketClose ? !playerStats || !marketStatus : !marketStatus;

  if (isLoading || !team || startingPlayers?.length === 0) {
    return <Loading />;
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}>
      <View
        className="p-2"
        style={{
          gap: 8,
          backgroundColor:
            colorTheme === 'dark' ? BACKGROUND_DEFAULT_DARK : BACKGROUND_DEFAULT_LIGHT,
        }}>
        <TeamBanner team={team as FullClubInfo} />

        <View className="flex-row justify-between items-center rounded-lg p-3">
          <View className="justify-center items-center gap-1">
            <Text className="font-light text-xs">Patrim.</Text>
            <View className="flex-row">
              <Text className="font-semibold text-sm">
                {isMarketClose && currentRound === marketStatus?.rodada_atual
                  ? numberToString((team?.patrimonio as number) + clubAppreciation)
                  : numberToString(team?.patrimonio)}
              </Text>
              {isMarketClose && currentRound === marketStatus?.rodada_atual && (
                <View className="flex-row pl-2 justify-center items-center">
                  <Text className="font-semibold text-sm">{numberToString(clubAppreciation)}</Text>

                  <Feather
                    size={16}
                    name={clubAppreciation && clubAppreciation < 0 ? 'arrow-down' : 'arrow-up'}
                    color={clubAppreciation && clubAppreciation < 0 ? '#ef4444' : '#4ade80'}
                  />
                </View>
              )}
            </View>
          </View>

          <View className="justify-center items-center gap-1">
            <Text className="font-light text-xs">Pontuação</Text>

            <Text
              className={`font-semibold text-sm ${
                currentRound === marketStatus?.rodada_atual && 'text-green-500'
              }`}>
              {currentRound === marketStatus?.rodada_atual
                ? numberToString(partialScore)
                : numberToString(team?.pontos)}
            </Text>
          </View>

          <View className="justify-center items-center gap-1">
            <Text className="font-light text-xs">Total</Text>
            <Text
              className={`font-semibold text-sm ${
                currentRound === marketStatus?.rodada_atual && 'text-green-500'
              }`}>
              {' '}
              {currentRound === marketStatus?.rodada_atual
                ? onCalculatePartialScore(
                    team.atletas as FullPlayer[],
                    team?.capitao_id as number,
                    playerStats
                  )
                  ? numberToString(
                      (onCalculatePartialScore(
                        team.atletas as FullPlayer[],
                        team?.capitao_id as number,
                        playerStats
                      ) as number) + (team?.pontos_campeonato as number)
                    )
                  : 0
                : numberToString(team?.pontos_campeonato)}
            </Text>
          </View>
        </View>

        <View
          className="rounded-lg p-2 flex-row items-center justify-center"
          style={{
            gap: 8,
          }}>
          <TouchableOpacity
            activeOpacity={0.6}
            className={`p-2 items-center justify-center mx-1 rounded-full ${
              currentRound === 1 ? 'bg-gray-100' : 'bg-blue-50'
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
            activeOpacity={0.6}
            className={`p-2 items-center justify-center mx-1 rounded-full ${
              currentRound === marketStatus?.rodada_atual ? 'bg-gray-100' : 'bg-blue-50'
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
              color={
                isMarketClose
                  ? currentRound === marketStatus?.rodada_atual
                    ? '#d1d5db'
                    : '#3b82f6'
                  : currentRound === (marketStatus?.rodada_atual as number) - 1
                  ? '#d1d5db'
                  : '#3b82f6'
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {typeViewDefault === TYPE_VIEW.CAMPO && <View></View>}

      {typeViewDefault === TYPE_VIEW.LISTA && (
        <View
          className={`justify-center px-2 ${colorTheme === 'dark' ? `bg-dark` : 'bg-light'}`}
          style={{
            gap: 8,
          }}>
          <View className="rounded-lg py-2">
            <Text className="font-semibold text-center text-lg">Titulares</Text>
            {startingPlayers?.map((player) => renderItem(player))}
          </View>

          <View className="rounded-lg py-2 mb-2">
            <Text className="font-semibold text-center text-lg">Reservas</Text>
            {reservePlayers?.map((player) => renderItem(player, true))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};
