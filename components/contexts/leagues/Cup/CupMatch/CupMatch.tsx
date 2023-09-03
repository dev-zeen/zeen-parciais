import { Feather } from '@expo/vector-icons';
import { useCallback, useMemo } from 'react';
import { Image, TouchableOpacity, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { FullClubInfo } from '@/models/Club';
import { CupMatch as CupMatchModel, TeamLeague } from '@/models/Leagues';
import { MarketStatus } from '@/models/Market';
import { useGetClub } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { numberToString } from '@/utils/parseTo';
import { onCalculatePartialScore, onGetCurrentCountPlayerIsPlayedByTeam } from '@/utils/partials';

interface CupMatchProps {
  teams: TeamLeague[];
  match: CupMatchModel;
  myTeam: FullClubInfo;
  marketStatus: MarketStatus;
}

const STAGE_TYPE_NAMED = {
  P: '16-avos',
  O: 'Oitavas de Final',
  Q: 'Quartas de Final',
  S: 'Semi-final',
  F: 'Final',
  T: 'Terceiro Lugar',
};

export function CupMatch({ match, teams, myTeam, marketStatus }: CupMatchProps) {
  const colorTheme = useColorScheme();

  const { data: playerStats } = useGetScoredPlayers();

  const { data: homeTeam } = useGetClub(match.time_mandante_id);
  const { data: awayTeam } = useGetClub(match.time_visitante_id);

  const homePartial = useMemo(() => {
    if (homeTeam) {
      return onCalculatePartialScore(homeTeam?.atletas, homeTeam?.capitao_id, playerStats);
    }
  }, [homeTeam, playerStats]);

  const homePlayersPlayed = useMemo(() => {
    if (homeTeam && homeTeam.atletas && playerStats) {
      return onGetCurrentCountPlayerIsPlayedByTeam(homeTeam.atletas, playerStats);
    }
  }, [homeTeam, playerStats]);

  const scoreHomeTeam = useMemo(
    () =>
      marketStatus.rodada_atual === match.rodada_id ? homePartial : match?.time_mandante_pontuacao,
    [homePartial, marketStatus.rodada_atual, match.rodada_id, match?.time_mandante_pontuacao]
  ) as number;

  const awayPartial = useMemo(() => {
    if (awayTeam) {
      return onCalculatePartialScore(awayTeam?.atletas, awayTeam?.capitao_id, playerStats);
    }
  }, [awayTeam, playerStats]);

  const awayPlayersPlayed = useMemo(() => {
    if (awayTeam && awayTeam.atletas && playerStats) {
      return onGetCurrentCountPlayerIsPlayedByTeam(awayTeam.atletas, playerStats);
    }
  }, [awayTeam, playerStats]);

  const scoreAwayTeam = useMemo(
    () =>
      marketStatus.rodada_atual === match.rodada_id ? awayPartial : match?.time_visitante_pontuacao,
    [awayPartial, marketStatus.rodada_atual, match.rodada_id, match?.time_visitante_pontuacao]
  ) as number;

  const colorScore = useCallback((team: number, compare: number) => {
    return team > compare ? '#22c55e' : '#ef4444';
  }, []);

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={() => null} key={match.time_mandante_id}>
      <View
        className="rounded-lg justify-center items-center mb-2 pb-4 px-1 pt-2"
        style={{
          borderColor:
            myTeam?.time?.time_id === match.time_mandante_id ||
            myTeam?.time?.time_id === match.time_visitante_id
              ? '#3b82f6'
              : 'transparent',
          borderWidth: 2,
          gap: 8,
        }}>
        <Text className="text-sm font-medium">{STAGE_TYPE_NAMED[match.tipo_fase]}</Text>
        <View
          className="flex-row justify-between"
          style={{
            gap: 4,
          }}>
          <View className="justify-center items-center w-1/3 h-14" style={{ gap: 4 }}>
            {homeTeam ? (
              <>
                <Image
                  source={{
                    uri: homeTeam?.time.url_escudo_png,
                  }}
                  className="w-12 h-12"
                  alt={`Escudo do ${homeTeam?.time.nome}`}
                />

                <Text numberOfLines={1} className="text-xs font-semibold">
                  {homeTeam?.time.nome ?? '-'}
                </Text>
              </>
            ) : (
              <Text numberOfLines={1} className="text-xs">
                A definir
              </Text>
            )}
          </View>

          <View
            className={`flex-row justify-center items-center w-1/3 border rounded ${
              colorTheme === 'dark' ? 'border-gray-400' : 'border-gray-300'
            }`}
            style={{
              gap: 8,
            }}>
            <View className="items-center justify-center">
              <Text
                className="font-semibold text-sm"
                style={{
                  color: homeTeam ? colorScore(scoreHomeTeam, scoreAwayTeam) : '#a8a29e',
                }}>
                {marketStatus.rodada_atual === match.rodada_id
                  ? numberToString(homePartial)
                  : homeTeam
                  ? numberToString(match?.time_mandante_pontuacao)
                  : '-'}
              </Text>

              {marketStatus.rodada_atual === match.rodada_id && (
                <Text className="font-semibold text-xs">{homePlayersPlayed}/12</Text>
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
                  color: awayTeam ? colorScore(scoreAwayTeam, scoreHomeTeam) : '#a8a29e',
                }}>
                {marketStatus.rodada_atual === match.rodada_id
                  ? numberToString(awayPartial)
                  : awayTeam
                  ? numberToString(match?.time_visitante_pontuacao)
                  : '-'}
              </Text>
              {marketStatus.rodada_atual === match.rodada_id && (
                <Text className="font-semibold text-xs">{awayPlayersPlayed}/12</Text>
              )}
            </View>
          </View>

          <View className="justify-center items-center w-1/3 h-14" style={{ gap: 4 }}>
            {awayTeam ? (
              <>
                <Image
                  source={{
                    uri: awayTeam?.time.url_escudo_png,
                  }}
                  className="w-12 h-12"
                  alt={`Escudo do ${awayTeam?.time.nome}`}
                />

                <Text numberOfLines={1} className="text-xs font-semibold">
                  {awayTeam?.time.nome ?? '-'}
                </Text>
              </>
            ) : (
              <Text numberOfLines={1} className="text-xs">
                A definir
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
