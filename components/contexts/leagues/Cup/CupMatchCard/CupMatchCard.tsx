import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { TouchableOpacity, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { TeamCupMatch } from '@/components/contexts/leagues/Cup/TeamCupMatch/TeamCupMatch';
import { Loading } from '@/components/structure/Loading';
import Colors from '@/constants/Colors';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePartialScore from '@/hooks/usePartialScore';
import { FullClubInfo } from '@/models/Club';
import { CupMatch as CupMatchModel } from '@/models/Leagues';
import { numberToString } from '@/utils/parseTo';

interface CupMatchProps {
  match: CupMatchModel;
  myTeam?: FullClubInfo;
}

const STAGE_TYPE_NAMED = {
  P: 'Primeira Fase',
  O: 'Oitavas',
  Q: 'Quartas',
  S: 'Semi-final',
  F: 'Final',
  T: 'Terceiro Lugar',
};

export function CupMatchCard({ match, myTeam }: CupMatchProps) {
  const colorTheme = useColorScheme();

  const { marketStatus, isMarketClose } = useMarketStatus();

  const { partialScore: homePartialScore, playersHaveAlreadyPlayed: homePlayersHaveAlreadyPlayed } =
    usePartialScore({
      teamId: match.time_mandante_id ?? 0,
    });

  const { partialScore: awayPartialScore, playersHaveAlreadyPlayed: awayPlayersHaveAlreadyPlayed } =
    usePartialScore({
      teamId: match.time_visitante_id ?? 0,
    });

  const scoreHomeTeam = useMemo(
    () =>
      marketStatus?.rodada_atual === match.rodada_id
        ? homePartialScore
        : match?.time_mandante_pontuacao,
    [homePartialScore, marketStatus?.rodada_atual, match.rodada_id, match?.time_mandante_pontuacao]
  );

  const scoreAwayTeam = useMemo(
    () =>
      marketStatus?.rodada_atual === match.rodada_id
        ? awayPartialScore
        : match?.time_visitante_pontuacao,
    [awayPartialScore, marketStatus?.rodada_atual, match.rodada_id, match?.time_visitante_pontuacao]
  );

  const currentRound = marketStatus?.rodada_atual;

  const showScore = useMemo(
    () =>
      match.rodada_id < (currentRound ?? 0) || (match.rodada_id === currentRound && isMarketClose),
    [currentRound, isMarketClose, match.rodada_id]
  );

  const colorScore = useCallback((team: number, compare: number) => {
    return team > compare ? '#22c55e' : '#ef4444';
  }, []);

  const customBorder = useMemo(
    () =>
      myTeam?.time?.time_id === match.time_mandante_id ||
      myTeam?.time?.time_id === match.time_visitante_id
        ? '#3b82f6'
        : 'transparent',
    [match.time_mandante_id, match.time_visitante_id, myTeam?.time?.time_id]
  );

  if (!currentRound) {
    return <Loading />;
  }

  return (
    <Link
      href={{
        pathname: '/(tabs)/leagues/cup-match',
        params: {
          match: JSON.stringify(match),
        },
      }}
      asChild>
      <TouchableOpacity
        activeOpacity={0.6}
        key={match.time_mandante_id}
        disabled={!match.time_mandante_id || !showScore}>
        <View
          className="flex-row rounded-lg justify-center items-center py-2"
          style={{
            borderColor: customBorder,
            borderWidth: 2,
            gap: 4,
          }}>
          <TeamCupMatch match={match} teamId={match.time_mandante_id} />

          <View className="justify-center items-center rounded z-40 mb-3" style={{}}>
            <Text className="text-sm">{STAGE_TYPE_NAMED[match.tipo_fase]}</Text>
            <View
              className="flex-row justify-center items-center"
              style={{
                gap: 8,
                width: '40%',
              }}>
              <View className="items-center justify-center">
                <Text
                  className="font-semibold text-sm"
                  style={{
                    color: showScore ? colorScore(scoreHomeTeam, scoreAwayTeam) : '#a8a29e',
                  }}>
                  {showScore ? numberToString(scoreHomeTeam) : '-'}
                </Text>
                {showScore && currentRound === match.rodada_id ? (
                  <Text className="font-semibold text-xs">
                    {homePlayersHaveAlreadyPlayed ?? 0}/12
                  </Text>
                ) : (
                  <></>
                )}
              </View>

              <Feather
                name="x"
                size={10}
                color={colorTheme === 'dark' ? Colors.light.background : Colors.dark.background}
              />

              <View className="items-center justify-center">
                <Text
                  className="font-semibold text-sm"
                  style={{
                    color: showScore ? colorScore(scoreAwayTeam, scoreHomeTeam) : '#a8a29e',
                  }}>
                  {showScore ? numberToString(scoreAwayTeam) : '-'}
                </Text>
                {showScore && currentRound === match.rodada_id ? (
                  <Text className="font-semibold text-xs">
                    {awayPlayersHaveAlreadyPlayed ?? 0}/12
                  </Text>
                ) : (
                  <></>
                )}
              </View>
            </View>
          </View>

          <TeamCupMatch match={match} teamId={match.time_visitante_id} />
        </View>
      </TouchableOpacity>
    </Link>
  );
}
