import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Image, TouchableOpacity, useColorScheme } from 'react-native';

import { ClubByLeague } from '@/app/(tabs)/leagues/[id]';
import captainIcon from '@/assets/images/letter-c.png';
import { Text, View } from '@/components/Themed';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { League } from '@/models/Leagues';
import { MarketStatus } from '@/models/Market';
import { useGetClub } from '@/queries/club.query';
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
  isLeagueAcceptCapitain: boolean;
}

export const ClubCard: React.FC<ClubCardProps> = memo(
  ({
    league,
    club,
    orderBy,
    position,
    firstPlaceScore,
    marketStatus,
    isMarketClose,
    isLeagueAcceptCapitain,
  }) => {
    const router = useRouter();
    const colorTheme = useColorScheme();

    const { data: team } = useGetClub(String(club.time_id));

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
    }, [club.time_id, router]);

    const myTeam = league?.time_usuario && league?.time_usuario.time_id === club.time_id;

    return (
      <View
        key={club?.time_id}
        className={`rounded-lg py-2 pl-1 pr-3 justify-center ${
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
              className={`flex-row items-center ${
                myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
              }`}
              style={{
                gap: 4,
              }}>
              <View
                className={`items-center justify-center gap-x-0.5 w-12 ${
                  myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
                }`}>
                <Text className="text-sm font-semibold">{position}</Text>

                {isMarketOpen && orderBy !== 'rodada' ? (
                  <View
                    className={`flex-row items-center ${
                      myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
                    }`}>
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
                <Text
                  numberOfLines={1}
                  className={`text-sm font-semibold ${
                    myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
                  }`}>
                  {club.nome}
                </Text>
                <View
                  className={`flex-row items-center justify-start ${
                    myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
                  }`}
                  style={{
                    gap: 4,
                  }}>
                  <Text className="text-xs capitalize">{club.nome_cartola}</Text>
                </View>

                {isLeagueAcceptCapitain ? (
                  <View
                    className={`flex-row items-center ${
                      myTeam ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''
                    }`}>
                    <Text className="text-xs">{capitainPlayer?.apelido}</Text>

                    <Image
                      source={captainIcon}
                      style={{
                        width: 12,
                        height: 12,
                        marginRight: 1,
                        marginLeft: 4,
                      }}
                      alt={`Liga com Capitão`}
                    />
                  </View>
                ) : (
                  <></>
                )}
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
