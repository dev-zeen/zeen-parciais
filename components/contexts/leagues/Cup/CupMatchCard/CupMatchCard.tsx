import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { TouchableOpacity, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { TeamCupMatch } from '@/components/contexts/leagues/Cup/TeamCupMatch/TeamCupMatch';
import { Loading } from '@/components/structure/Loading';
import Colors from '@/constants/Colors';
import { FullClubInfo } from '@/models/Club';
import { CupMatch as CupMatchModel } from '@/models/Leagues';
import { numberToString } from '@/utils/parseTo';

interface CupMatchProps {
  match: CupMatchModel;
  myTeam?: FullClubInfo;
  leagueSlug?: string;
  currentRound?: number;
  isMarketClose?: boolean;
  partialsByTeamId?: Record<number, { partialScore: number; playersPlayed: number }>;
}

const STAGE_TYPE_NAMED = {
  P: 'Primeira Fase',
  O: 'Oitavas',
  Q: 'Quartas',
  S: 'Semi-final',
  F: 'Final',
  T: 'Terceiro Lugar',
};

export function CupMatchCard({
  match,
  myTeam,
  leagueSlug,
  currentRound,
  isMarketClose,
  partialsByTeamId,
}: CupMatchProps) {
  const colorTheme = useColorScheme();

  const homeTeamId = match.time_mandante_id ?? 0;
  const awayTeamId = match.time_visitante_id ?? 0;

  const homePartial = partialsByTeamId?.[homeTeamId];
  const awayPartial = partialsByTeamId?.[awayTeamId];

  const scoreHomeTeam = useMemo(() => {
    if (currentRound === match.rodada_id && homePartial) return homePartial.partialScore;
    return match.time_mandante_pontuacao;
  }, [currentRound, homePartial, match.rodada_id, match.time_mandante_pontuacao]);

  const scoreAwayTeam = useMemo(() => {
    if (currentRound === match.rodada_id && awayPartial) return awayPartial.partialScore;
    return match.time_visitante_pontuacao;
  }, [awayPartial, currentRound, match.rodada_id, match.time_visitante_pontuacao]);

  const showScore = useMemo(
    () =>
      match.rodada_id < (currentRound ?? 0) ||
      (match.rodada_id === currentRound && !!isMarketClose),
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
          slug: leagueSlug ?? '',
          chaveId: String(match.chave_id),
        },
      }}
      asChild>
      <TouchableOpacity
        activeOpacity={0.6}
        key={match.time_mandante_id}
        disabled={!leagueSlug || !match.time_mandante_id || !showScore}>
        <View
          className="flex-row rounded-lg justify-center items-center py-2"
          style={{
            borderColor: customBorder,
            borderWidth: 2,
            gap: 4,
          }}>
          <TeamCupMatch
            match={match}
            teamId={match.time_mandante_id}
            opacity={match.time_mandante_pontuacao > match.time_visitante_pontuacao ? 1 : 0.3}
          />

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
                    {homePartial?.playersPlayed ?? 0}/12
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
                    {awayPartial?.playersPlayed ?? 0}/12
                  </Text>
                ) : (
                  <></>
                )}
              </View>
            </View>
          </View>

          <TeamCupMatch
            match={match}
            teamId={match.time_visitante_id}
            opacity={match.time_visitante_pontuacao > match.time_mandante_pontuacao ? 1 : 0.3}
          />
        </View>
      </TouchableOpacity>
    </Link>
  );
}
