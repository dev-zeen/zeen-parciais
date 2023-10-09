import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Image, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

import captainIcon from '@/assets/images/letter-c.png';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import useTeam from '@/hooks/useTeam';
import { ClubByLeague } from '@/models/Leagues';
import theme from '@/styles/theme';
import { OrderByOptions } from '@/utils/leagues';
import { numberToString } from '@/utils/parseTo';

interface ClubCardProps {
  score: number;
  club: ClubByLeague;
  orderBy: string;
  position: number;
  highestScoringTeam: number;
  isLeagueAcceptCaptain: boolean;
  isMarketClose: boolean;
  isMyTeam: boolean;
}

export function ClubCard({
  score,
  club,
  orderBy,
  position,
  highestScoringTeam,
  isLeagueAcceptCaptain,
  isMarketClose,
  isMyTeam,
}: ClubCardProps) {
  const colorTheme = useColorScheme();

  const { team } = useTeam({
    teamId: club.time_id,
  });

  // const { partialValorization } = usePartialScore({
  //   teamId: club.time_id,
  // })

  const isOrderByPatrimonio = orderBy === OrderByOptions.PATRIMONIO;

  const captainPlayer = isLeagueAcceptCaptain
    ? team?.atletas.find((item) => item.atleta_id === team.capitao_id)
    : null;

  const diffScore = !isOrderByPatrimonio
    ? (club.pontos as any)[orderBy] - highestScoringTeam
    : (club?.patrimonio ?? 0) - highestScoringTeam;

  const renderVariationIcon = useCallback((variation: number) => {
    const iconName = variation >= 1 ? 'arrow-up' : 'arrow-down';
    const iconColor = variation >= 1 ? '#4ade80' : '#f87171';
    return (
      <MaterialCommunityIcons
        name={variation !== 0 ? iconName : 'equal'}
        color={variation !== 0 ? iconColor : theme.Tokens.COLORS.GRAY_400}
        size={14}
      />
    );
  }, []);

  const onPressHandler = useCallback(() => {
    router.push(`/leagues/club/${club.time_id}`);
  }, [club.time_id]);

  const containerMyTeamStyle =
    isMyTeam && (colorTheme === 'dark' ? styles.myTeamContainerDark : styles.myTeamContainerLight);

  return (
    <View className="rounded-lg py-2 pr-3 justify-center" style={containerMyTeamStyle}>
      <TouchableOpacity activeOpacity={0.6} onPress={onPressHandler}>
        <View className="flex-row justify-between items-center" style={containerMyTeamStyle}>
          <View
            className="flex-row items-center"
            style={{
              ...containerMyTeamStyle,
              gap: 2,
            }}>
            <View className="items-center justify-center w-10" style={containerMyTeamStyle}>
              <Text className="text-sm font-semibold">{position}</Text>

              {!isMarketClose && orderBy !== 'rodada' ? (
                <View className="flex-row items-center" style={containerMyTeamStyle}>
                  {renderVariationIcon((club.variacao as any)[orderBy])}
                  <Text className="text-xs">
                    {(club.variacao as any)[orderBy] ? (club.variacao as any)[orderBy] : ''}
                  </Text>
                </View>
              ) : (
                <></>
              )}
            </View>
            <Image
              source={{
                uri: team?.time.url_escudo_png,
              }}
              className="w-10 h-10"
              alt={`Imagem do time do ${club.nome_cartola}`}
            />

            <View>
              <Text
                numberOfLines={1}
                className="text-sm font-semibold"
                style={containerMyTeamStyle}>
                {club.nome}
              </Text>
              <View
                className="flex-row items-center justify-start"
                style={{
                  ...containerMyTeamStyle,
                  gap: 4,
                }}>
                <Text className="text-xs capitalize">{club.nome_cartola}</Text>
              </View>
              {isLeagueAcceptCaptain ? (
                <>
                  <View className="flex-row items-center" style={containerMyTeamStyle}>
                    <Text className="text-xs">{captainPlayer?.apelido}</Text>

                    <Image
                      source={captainIcon}
                      style={{
                        width: 14,
                        height: 14,
                        marginLeft: 4,
                      }}
                      alt={'Liga com Capitão'}
                    />
                  </View>
                </>
              ) : (
                <></>
              )}
            </View>
          </View>

          <View className="items-end" style={containerMyTeamStyle}>
            <View className="flex-row gap-x-1" style={containerMyTeamStyle}>
              <Text
                className="text-sm font-semibold"
                style={{
                  color: isMarketClose
                    ? '#22c55e'
                    : Colors[colorTheme === 'dark' ? 'dark' : 'light'].text,
                }}>
                {numberToString(score)}
              </Text>
            </View>

            <View className="items-end" style={containerMyTeamStyle}>
              <Text className="text-xs font-normal">
                {diffScore < 0 && numberToString(diffScore)}
              </Text>

              {isMarketClose && club.playersHavePlayed !== undefined ? (
                <>
                  <Text className="text-xs font-medium">{club.playersHavePlayed}/12</Text>
                </>
              ) : (
                <></>
              )}

              {/* <View className="flex-row items-center justify-center" style={containerMyTeamStyle}>
                  {isMarketClose && partialValorization !== null ? (
                    <Text
                      className="text-xs font-medium"
                      style={{
                        color:
                          (partialValorization ?? 0) > 0
                            ? '#22c55e'
                            : (partialValorization ?? 0) < 0
                            ? '#ef4444'
                            : '#fafafa',
                      }}>
                      C$ {numberToString(partialValorization)}
                    </Text>
                  ) : (
                    <></>
                  )}
                  {isMarketClose && club.playersHavePlayed !== undefined ? (
                    <>
                      <View className="rounded-full bg-gray-300 h-1 w-1 mx-1" />
                      <Text className="text-xs font-medium">{club.playersHavePlayed}/12</Text>
                    </>
                  ) : (
                    <></>
                  )}
                </View> */}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  myTeamContainerLight: {
    backgroundColor: '#bfdbfe',
  },
  myTeamContainerDark: {
    backgroundColor: '#2563eb',
  },
});
