import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Image, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Club } from '@/models/Club';
import { Match } from '@/models/Matches';
import { FullPlayer } from '@/models/Stats';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { onGetPartialScoreTeamByMatch } from '@/utils/match';
import { numberToString } from '@/utils/parseTo';

interface MatchCardProps {
  match: Match;
  players?: FullPlayer[];
  homeClub?: Club;
  awayClub?: Club;
  isDisabled?: boolean;
}

export function MatchCard({
  match,
  players,
  homeClub,
  awayClub,
  isDisabled = false,
}: MatchCardProps) {
  const router = useRouter();
  const colorTheme = useThemeColor();

  const { data: playerStats } = useGetScoredPlayers();

  const homeTeamPartials = useMemo(() => {
    if (homeClub && homeClub?.id && playerStats) {
      const teamId = Number(homeClub?.id);
      return onGetPartialScoreTeamByMatch(teamId, playerStats);
    }
  }, [homeClub, playerStats]);

  const awayTeamPartials = useMemo(() => {
    if (awayClub && awayClub?.id && playerStats) {
      const teamId = Number(awayClub?.id);
      return onGetPartialScoreTeamByMatch(teamId, playerStats);
    }
  }, [awayClub, playerStats]);

  const showTeamScore = playerStats && match.status_transmissao_tr !== 'CRIADA' && match.valida;

  const amountPlayersMyClubHomeTeam = useCallback(() => {
    if (players) {
      return players?.filter((player) => player.clube_id === match.clube_casa_id).length;
    }
    return 0;
  }, [players, match]);

  const amountPlayersMyClubAwayTeam = useCallback(() => {
    if (players) {
      return players?.filter((player) => player.clube_id === match.clube_visitante_id).length;
    }
    return 0;
  }, [players, match]);

  const onPressHandler = useCallback(() => {
    const payload = {
      ...match,
      transmissao: '',
      home: match.clube_casa_id,
      away: match.clube_visitante_id,
    };
    router.push(`/matches/${JSON.stringify(payload)}`);
  }, [match, router]);

  return (
    <TouchableOpacity disabled={isDisabled} activeOpacity={0.6} onPress={onPressHandler}>
      <View
        className="p-4 rounded-lg"
        style={{
          backgroundColor: colorTheme === 'dark' ? '#111827' : '#f9fafb',
          borderWidth: 1,
          borderColor: !match.valida 
            ? (colorTheme === 'dark' ? '#991b1b' : '#fca5a5')
            : (colorTheme === 'dark' ? '#1f2937' : '#f3f4f6'),
          opacity: !match.valida ? 0.85 : 1,
        }}>
        <Text
          className="font-medium text-xs text-center mb-2"
          style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
          {format(new Date(match.partida_data), "EEEEEE',' dd/MM/y kk:mm", {
            locale: ptBR,
          })}
        </Text>

        <View
          className={`flex-row py-1 px-4 justify-between ${
            match.status_transmissao_tr === 'CRIADA' && 'mb-4'
          }`}
          style={{
            gap: 24,
            backgroundColor: 'transparent',
          }}>
          <View
            className="items-center justify-center"
            style={{ gap: 4, backgroundColor: 'transparent' }}>
            {showTeamScore ? (
              <Text
                className="font-semibold"
                style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
                {numberToString(homeTeamPartials)}
              </Text>
            ) : (
              <></>
            )}

            <Image
              source={{
                uri: homeClub?.escudos['60x60'],
              }}
              className="w-12 h-12"
              alt={`Escudo do ${homeClub?.nome}`}
            />

            <Text
              className="font-semibold"
              style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
              {homeClub?.abreviacao} {`${match.clube_casa_posicao}º`}
            </Text>

            {amountPlayersMyClubHomeTeam() > 0 && (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 9999,
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  top: showTeamScore ? 39 : 15,
                  left: 55,
                  backgroundColor: '#10b981',
                }}>
                <Text className="font-semibold text-xs text-white">
                  {amountPlayersMyClubHomeTeam()}
                </Text>
              </View>
            )}
          </View>

          <View
            className="items-center justify-center"
            style={{
              gap: 4,
              backgroundColor: 'transparent',
            }}>
            <View
              className="flex-row justify-center items-center rounded-lg px-4 py-2"
              style={{
                gap: 8,
                backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#ffffff',
                borderWidth: 1,
                borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
              }}>
              <Text
                className="font-semibold text-base"
                style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
                {match.placar_oficial_mandante ?? '-'}
              </Text>

              <Feather name="x" size={16} color={colorTheme === 'dark' ? '#9ca3af' : '#6b7280'} />

              <Text
                className="font-semibold text-base"
                style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
                {match.placar_oficial_visitante ?? '-'}
              </Text>
            </View>

            <Text
              className="text-xs"
              style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              {match.local}
            </Text>
          </View>

          <View
            className="justify-center items-center"
            style={{ gap: 4, backgroundColor: 'transparent' }}>
            {showTeamScore ? (
              <Text
                className="font-semibold"
                style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
                {numberToString(awayTeamPartials)}
              </Text>
            ) : (
              <></>
            )}

            <Image
              source={{
                uri: awayClub?.escudos['60x60'],
              }}
              className="w-12 h-12"
              alt={`Escudo do ${awayClub?.nome}`}
            />
            <Text
              className="font-semibold"
              style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
              {awayClub?.abreviacao} {`${match.clube_visitante_posicao}º`}
            </Text>

            {amountPlayersMyClubAwayTeam() > 0 && (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 9999,
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  top: showTeamScore ? 39 : 15,
                  left: -25,
                  backgroundColor: '#10b981',
                }}>
                <Text className="font-semibold text-xs text-white">
                  {amountPlayersMyClubAwayTeam()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {match.valida ? (
          <>
            {match.status_transmissao_tr === 'ENCERRADA' && (
              <View 
                className="mt-3 mx-2 rounded-xl p-3"
                style={{
                  backgroundColor: colorTheme === 'dark' ? '#1e293b' : '#f1f5f9',
                  borderWidth: 1,
                  borderColor: colorTheme === 'dark' ? '#334155' : '#e2e8f0',
                }}>
                <View 
                  className="flex-row items-center justify-center"
                  style={{ gap: 8, backgroundColor: 'transparent' }}>
                  <Feather 
                    name="check-circle" 
                    size={16} 
                    color={colorTheme === 'dark' ? '#94a3b8' : '#64748b'} 
                  />
                  <Text 
                    className="text-xs font-semibold"
                    style={{ 
                      color: colorTheme === 'dark' ? '#cbd5e1' : '#475569',
                    }}>
                    Partida Encerrada
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <View 
            className="mt-3 mx-2 rounded-xl p-3"
            style={{
              backgroundColor: colorTheme === 'dark' ? '#7f1d1d' : '#fee2e2',
              borderWidth: 1,
              borderColor: colorTheme === 'dark' ? '#991b1b' : '#fecaca',
            }}>
            <View 
              className="flex-row items-start"
              style={{ gap: 10, backgroundColor: 'transparent' }}>
              <View 
                className="w-7 h-7 rounded-full items-center justify-center mt-0.5"
                style={{
                  backgroundColor: colorTheme === 'dark' ? '#991b1b' : '#fecaca',
                }}>
                <Feather 
                  name="alert-circle" 
                  size={16} 
                  color={colorTheme === 'dark' ? '#fca5a5' : '#dc2626'} 
                />
              </View>
              <View className="flex-1" style={{ backgroundColor: 'transparent' }}>
                <Text 
                  className="text-sm font-semibold mb-1"
                  style={{ 
                    color: colorTheme === 'dark' ? '#fca5a5' : '#dc2626',
                  }}>
                  Partida Inválida
                </Text>
                <Text 
                  className="text-xs leading-4"
                  style={{ 
                    color: colorTheme === 'dark' ? '#fecaca' : '#ef4444',
                  }}>
                  Esta partida não conta pontos para a rodada atual do Cartola FC
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
