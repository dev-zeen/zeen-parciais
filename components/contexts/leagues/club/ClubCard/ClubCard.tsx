import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import { Image, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

import captainIcon from '@/assets/images/letter-c.png';
import { Text, View } from '@/components/Themed';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import useMarketStatus from '@/hooks/useMarketStatus';
import useTeam from '@/hooks/useTeam';
import { ClubByLeague, League } from '@/models/Leagues';
import theme from '@/styles/theme';
import { numberToString } from '@/utils/parseTo';

interface ClubCardProps {
  league: League;
  club: ClubByLeague;
  orderBy: string;
  position: number;
  firstPlaceScore: number;
  isLeagueAcceptCapitain: boolean;
}

export const ClubCard: React.FC<ClubCardProps> = memo(
  ({ league, club, orderBy, position, firstPlaceScore, isLeagueAcceptCapitain }) => {
    const colorTheme = useColorScheme();

    const { marketStatus, isMarketClose } = useMarketStatus();

    const { team } = useTeam({
      teamId: club.time_id,
    });

    const capitainPlayer = team?.atletas.find((item) => item.atleta_id === team.capitao_id);

    const isOrderByPatrimonio = orderBy === 'patrimonio';
    const patrimony = numberToString(club.patrimonio);

    const isMarketOpen = marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO;

    const score = isOrderByPatrimonio ? patrimony : numberToString((club.pontos as any)[orderBy]);

    const diffScore =
      firstPlaceScore && orderBy !== 'patrimonio'
        ? (club.pontos as any)[orderBy] - firstPlaceScore
        : 0;

    const renderVariationIcon = useCallback((variation: number) => {
      const iconName = variation >= 1 ? 'arrow-up' : 'arrow-down';
      const iconColor = variation >= 1 ? '#4ade80' : '#f87171';
      return (
        <MaterialCommunityIcons
          name={variation !== 0 ? iconName : 'equal'}
          color={variation !== 0 ? iconColor : theme.Tokens.COLORS.GRAY_300}
          size={14}
        />
      );
    }, []);

    const onPressHandler = useCallback(() => {
      router.push(`/leagues/club/${club.time_id}`);
    }, [club.time_id]);

    const isMyTeam = league?.time_usuario && league?.time_usuario.time_id === club.time_id;

    const isDarkTheme = isMyTeam && colorTheme === 'dark';
    const isLightTheme = isMyTeam && colorTheme === 'light';

    const containerStyle = isDarkTheme
      ? styles.darkContainer
      : isLightTheme
      ? styles.container
      : null;

    return (
      <View className="rounded-lg py-4 pr-3 justify-center" style={containerStyle}>
        <TouchableOpacity activeOpacity={0.6} onPress={onPressHandler}>
          <View className="flex-row justify-between items-center" style={containerStyle}>
            <View
              className="flex-row items-center"
              style={{
                ...containerStyle,
                gap: 2,
              }}>
              <View className="items-center justify-center w-10" style={containerStyle}>
                <Text className="text-sm font-semibold">{position}</Text>

                {isMarketOpen && orderBy !== 'rodada' ? (
                  <View className="flex-row items-center" style={containerStyle}>
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
                  uri: club.url_escudo_png,
                }}
                className="w-10 h-10"
                alt={`Imagem do time do ${club.nome_cartola}`}
              />

              <View>
                <Text numberOfLines={1} className="text-sm font-semibold" style={containerStyle}>
                  {club.nome}
                </Text>
                <View
                  className="flex-row items-center justify-start"
                  style={{
                    ...containerStyle,
                    gap: 4,
                  }}>
                  <Text className="text-xs capitalize">{club.nome_cartola}</Text>
                  {isLeagueAcceptCapitain ? (
                    <>
                      <View className="relative rounded-full h-1 w-1 bg-gray-400"></View>
                      <View className="flex-row items-center" style={containerStyle}>
                        <Text className="text-xs">{capitainPlayer?.apelido}</Text>

                        <Image
                          source={captainIcon}
                          style={{
                            width: 12,
                            height: 12,
                            marginRight: 1,
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
            </View>

            <View className="items-end" style={containerStyle}>
              <View className="flex-row gap-x-1" style={containerStyle}>
                <Text className="text-xs font-semibold">{score}</Text>
              </View>

              {!isOrderByPatrimonio && (
                <View className="flex-row" style={containerStyle}>
                  <Text className="text-xs">
                    {isMarketClose && club.playersHavePlayed !== undefined
                      ? `${club.playersHavePlayed}/12`
                      : diffScore < 0 && numberToString(diffScore)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#bfdbfe',
  },
  darkContainer: {
    backgroundColor: '#2563eb',
  },
});
