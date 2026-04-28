import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { TeamCupMatch } from '@/components/contexts/leagues/Cup/TeamCupMatch/TeamCupMatch';
import { Loading } from '@/components/structure/Loading';
import { useThemeColor } from '@/hooks/useThemeColor';
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

export function CupMatchCard({
  match,
  myTeam,
  leagueSlug,
  currentRound,
  isMarketClose,
  partialsByTeamId,
}: CupMatchProps) {
  const colorTheme = useThemeColor();

  const homeTeamId = match.time_mandante_id ?? 0;
  const awayTeamId = match.time_visitante_id ?? 0;

  const isTbd = !match.time_mandante_id || !match.time_visitante_id;

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
      !isTbd &&
      (match.rodada_id < (currentRound ?? 0) ||
        (match.rodada_id === currentRound && !!isMarketClose)),
    [currentRound, isMarketClose, isTbd, match.rodada_id]
  );

  const colorScore = useCallback((team: number, compare: number) => {
    return team > compare ? '#00E094' : '#ef4444';
  }, []);

  const customBorder = useMemo(
    () =>
      myTeam?.time?.time_id === match.time_mandante_id ||
      myTeam?.time?.time_id === match.time_visitante_id
        ? '#0057FF'
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
        disabled={!leagueSlug || isTbd || !showScore}>
        <View
          style={{
            borderColor: customBorder,
            borderWidth: 2,
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 12,
            gap: 12,
          }}>
          {isTbd ? (
            <View
              style={{ alignItems: 'center', paddingVertical: 8, backgroundColor: 'transparent' }}>
              <Text style={{ fontSize: 13, color: colorTheme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                A definir
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}>
              <TeamCupMatch
                match={match}
                teamId={match.time_mandante_id}
                isWinner={match.vencedor_id === match.time_mandante_id}
                hasWinner={!!match.vencedor_id}
              />

              <View style={{ alignItems: 'center', gap: 6, backgroundColor: 'transparent' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: 'transparent',
                  }}>
                  <View
                    style={{ alignItems: 'center', minWidth: 28, backgroundColor: 'transparent' }}>
                    <Text
                      style={{
                        fontWeight: '700',
                        fontSize: 18,
                        color: showScore ? colorScore(scoreHomeTeam, scoreAwayTeam) : '#a8a29e',
                      }}>
                      {showScore ? numberToString(scoreHomeTeam) : '-'}
                    </Text>
                    {showScore && currentRound === match.rodada_id ? (
                      <Text
                        style={{
                          fontSize: 10,
                          color: colorTheme === 'dark' ? '#9CA3AF' : '#6B7280',
                        }}>
                        {homePartial?.playersPlayed ?? 0}/12
                      </Text>
                    ) : null}
                  </View>

                  <Feather
                    name="x"
                    size={10}
                    color={colorTheme === 'dark' ? '#6B7280' : '#9CA3AF'}
                  />

                  <View
                    style={{ alignItems: 'center', minWidth: 28, backgroundColor: 'transparent' }}>
                    <Text
                      style={{
                        fontWeight: '700',
                        fontSize: 18,
                        color: showScore ? colorScore(scoreAwayTeam, scoreHomeTeam) : '#a8a29e',
                      }}>
                      {showScore ? numberToString(scoreAwayTeam) : '-'}
                    </Text>
                    {showScore && currentRound === match.rodada_id ? (
                      <Text
                        style={{
                          fontSize: 10,
                          color: colorTheme === 'dark' ? '#9CA3AF' : '#6B7280',
                        }}>
                        {awayPartial?.playersPlayed ?? 0}/12
                      </Text>
                    ) : null}
                  </View>
                </View>

                {match.vencedor_id ? (
                  <View
                    style={{
                      backgroundColor: '#00E09420',
                      borderRadius: 99,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#00E094' }}>
                      Encerrado
                    </Text>
                  </View>
                ) : null}
              </View>

              <TeamCupMatch
                match={match}
                teamId={match.time_visitante_id}
                isWinner={match.vencedor_id === match.time_visitante_id}
                hasWinner={!!match.vencedor_id}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Link>
  );
}
