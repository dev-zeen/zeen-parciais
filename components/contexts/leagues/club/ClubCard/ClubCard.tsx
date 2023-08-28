import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Image, TouchableOpacity, useColorScheme } from 'react-native';

import { ClubByLeague } from '@/app/(tabs)/leagues/[id]';
import { Text, View } from '@/components/Themed';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { League } from '@/models/Leagues';
import { MarketStatus } from '@/models/Market';
import theme from '@/styles/theme';
import { numberToString } from '@/utils/parseTo';

interface ClubCardProps {
  league: League;
  club: ClubByLeague;
  orderBy: string;
  position: number;
  firstPlaceScore: number;
  marketStatus: MarketStatus;
  isMarketClose: boolean;
}

export const ClubCard: React.FC<ClubCardProps> = memo(
  ({ league, club, orderBy, position, firstPlaceScore, marketStatus, isMarketClose }) => {
    const router = useRouter();
    const colorTheme = useColorScheme();

    const isOrderByPatrimonio = orderBy === 'patrimonio';
    const patrimony = numberToString(club.patrimonio);

    const score = isOrderByPatrimonio ? patrimony : numberToString((club.pontos as any)[orderBy]);

    const diffScore =
      firstPlaceScore && orderBy !== 'patrimonio'
        ? (club.pontos as any)[orderBy] - firstPlaceScore
        : 0;

    const renderVariationIcon = useCallback((variation: number) => {
      const iconName = variation > 0 ? 'arrow-up' : 'arrow-down';
      const iconColor = variation > 0 ? '#4ade80' : '#f87171';
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
    }, [club.time_id, router]);

    const myTeam = league?.time_usuario.time_id === club.time_id;

    return (
      <View
        key={club?.time_id}
        className={`rounded-lg py-3 pl-1 pr-3 justify-center ${
          myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
        }`}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={onPressHandler}
          className={`
          ${myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''}
        `}>
          <View
            className={`flex-row justify-between items-center ${
              myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
            }`}>
            <View
              className={`flex-row items-center gap-x-1 ${
                myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
              }`}>
              <View
                className={`items-center justify-center gap-x-0.5 w-12 ${
                  myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
                }`}>
                <Text className="text-sm font-semibold">{position}</Text>

                {marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO &&
                  orderBy !== 'rodada' && (
                    <View
                      className={`flex-row items-center ${
                        myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
                      }`}>
                      {renderVariationIcon((club.variacao as any)[orderBy])}
                      <Text className="text-xs">
                        {(club.variacao as any)[orderBy] ? (club.variacao as any)[orderBy] : ''}
                      </Text>
                    </View>
                  )}
              </View>
              <Image
                source={{
                  uri: club.url_escudo_png,
                }}
                className="w-8 h-8"
                alt={`Imagem do time do ${club.nome_cartola}`}
              />

              <View>
                <Text
                  numberOfLines={1}
                  className={`text-sm font-semibold ${
                    myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
                  }`}>
                  {club.nome}
                </Text>
                <View
                  className={`flex-row items-center gap-x-1 ${
                    myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
                  }`}>
                  <Text className="text-xs capitalize">{club.nome_cartola}</Text>
                  <View className="rounded-full h-1 w-1 bg-gray-300" />
                  <Text className="text-xs">C$ {patrimony}</Text>
                </View>
              </View>
            </View>

            <View
              className={`items-end ${
                myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
              }`}>
              <View
                className={`flex-row gap-x-2 ${
                  myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
                }`}>
                <Text className="text-xs font-semibold">{score}</Text>
              </View>

              {!isOrderByPatrimonio && (
                <View
                  className={`flex-row ${
                    myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
                  }`}>
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
