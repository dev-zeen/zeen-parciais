import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Image, TouchableOpacity, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { FullClubInfo } from '@/models/Club';
import { CupMatch as CupMatchModel } from '@/models/Leagues';
import { useGetClub } from '@/queries/club.query';
import { useGetMarketStatus } from '@/queries/market.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { numberToString } from '@/utils/parseTo';
import { onCalculatePartialScore, onGetCurrentCountPlayerIsPlayedByTeam } from '@/utils/partials';

interface CupMatchProps {
  match: CupMatchModel;
  myTeam?: FullClubInfo;
}

const STAGE_TYPE_NAMED = {
  P: '16-avos',
  O: 'Oitavas de Final',
  Q: 'Quartas de Final',
  S: 'Semi-final',
  F: 'Final',
  T: 'Terceiro Lugar',
};

export function CupMatchCard({ match, myTeam }: CupMatchProps) {
  const colorTheme = useColorScheme();

  const { data: playerStats } = useGetScoredPlayers();
  const { data: marketStatus } = useGetMarketStatus();

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

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
      marketStatus?.rodada_atual === match.rodada_id ? homePartial : match?.time_mandante_pontuacao,
    [homePartial, marketStatus?.rodada_atual, match.rodada_id, match?.time_mandante_pontuacao]
  ) as number;

  const awayPartialScore = useMemo(() => {
    if (awayTeam) {
      return onCalculatePartialScore(awayTeam?.atletas, awayTeam?.capitao_id, playerStats);
    }
  }, [awayTeam, playerStats]);

  const scoreAwayTeam = useMemo(
    () => (match.vencedor_id ? match?.time_visitante_pontuacao : awayPartialScore),
    [awayPartialScore, match?.time_visitante_pontuacao, match.vencedor_id]
  ) as number;

  const awayPlayersPlayed = useMemo(() => {
    if (awayTeam && awayTeam.atletas && playerStats) {
      return onGetCurrentCountPlayerIsPlayedByTeam(awayTeam.atletas, playerStats);
    }
  }, [awayTeam, playerStats]);

  const currentRound = marketStatus?.rodada_atual;

  const showScore =
    match.rodada_id < (currentRound ?? 0) || (match.rodada_id === currentRound && isMarketClose);

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

  const teamOpacity = useCallback((score?: number, compareScore?: number) => {
    if (score && compareScore) {
      return score > compareScore ? 1 : 0.3;
    }
    return 1;
  }, []);

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
        disabled={!match.time_mandante_id}>
        <View
          className="rounded-lg justify-center items-center mb-2 pb-4 px-2 pt-2"
          style={{
            borderColor: customBorder,
            borderWidth: 2,
            gap: 8,
          }}>
          <Text className="text-sm font-medium">{STAGE_TYPE_NAMED[match.tipo_fase]}</Text>
          <View
            className="flex-row justify-between"
            style={{
              gap: 4,
            }}>
            <View
              className="justify-center items-center w-1/3 h-14"
              style={{
                gap: 4,
                opacity: teamOpacity(match.time_mandante_pontuacao, match.time_visitante_pontuacao),
              }}>
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
                    color: showScore ? colorScore(scoreHomeTeam, scoreAwayTeam) : '#a8a29e',
                  }}>
                  {showScore ? numberToString(scoreHomeTeam) : '-'}
                </Text>
                {showScore && currentRound === match.rodada_id ? (
                  <Text className="font-semibold text-xs">{homePlayersPlayed ?? 0}/12</Text>
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
                  <Text className="font-semibold text-xs">{awayPlayersPlayed ?? 0}/12</Text>
                ) : (
                  <></>
                )}
              </View>
            </View>

            <View
              className="justify-center items-center w-1/3 h-14"
              style={{
                gap: 4,
                opacity: teamOpacity(match.time_visitante_pontuacao, match.time_mandante_pontuacao),
              }}>
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
    </Link>
  );
}
