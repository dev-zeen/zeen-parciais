import { Feather } from '@expo/vector-icons';
import { memo, useContext, useMemo } from 'react';
import { Image, useColorScheme } from 'react-native';

import { Text, TouchableOpacity, View } from '@/components/Themed';
import { AuthContext } from '@/contexts/Auth.context';
import { Club } from '@/models/Club';
import { Player, Position } from '@/models/Stats';
import { numberToString } from '@/utils/parseTo';

interface PlayerCardProps {
  player: Player;
  club?: Club;
  position?: Position;
  valorization?: number;
  isPlayerOnMyLineup?: boolean;
}

export const PlayerCard = memo(
  ({ player, club, position, valorization, isPlayerOnMyLineup }: PlayerCardProps) => {
    const colorTheme = useColorScheme();

    const { isAutheticated } = useContext(AuthContext);

    const scoutsColors: { [key: string]: string } = useMemo(() => {
      return {
        GS: 'negative',
        PP: 'negative',
        GC: 'negative',
        CV: 'negative',
        CA: 'negative',
        FC: 'negative',
        PC: 'negative',
        I: 'negative',
        FS: 'positive',
        FF: 'positive',
        SG: 'positive',
        V: 'positive',
        G: 'positive',
        DS: 'positive',
        FD: 'positive',
        DE: 'positive',
        A: 'positive',
        FT: 'positive',
        DP: 'positive',
        PS: 'positive',
      };
    }, []);

    const playerScore = useMemo(
      () =>
        new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
        }).format(player.pontuacao),
      [player.pontuacao]
    );

    const stylePlayerInMyLineup = useMemo(
      () => (isPlayerOnMyLineup ? (colorTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-200') : ''),
      [colorTheme, isPlayerOnMyLineup]
    );

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        className={`flex-row justify-between items-center rounded-lg py-2 pl-2 pr-4 ${stylePlayerInMyLineup}`}>
        <View className={`flex-row items-center gap-1 rounded-lg ${stylePlayerInMyLineup}`}>
          <Image
            source={{
              uri: player?.foto?.replace('FORMATO', '220x220'),
            }}
            className="w-14 h-14 rounded-full"
            alt={player.apelido}
          />
          <View className={`${stylePlayerInMyLineup}`}>
            <Text className="font-semibold text-sm">{player.apelido}</Text>
            <View
              className={`flex-row items-center ${stylePlayerInMyLineup}`}
              style={{
                gap: 4,
              }}>
              <Text className="text-xs">{position?.nome}</Text>
              <View className="rounded-full bg-gray-300 h-1 w-1" />
              <Text className="text-xs">{club?.nome}</Text>
            </View>
          </View>
        </View>
        <View className={`justify-center items-end ${stylePlayerInMyLineup}`}>
          <View className={`flex-row items-center justify-center ${stylePlayerInMyLineup}`}>
            {isAutheticated && valorization ? (
              <View
                className={`flex-row items-center justify-end w-10 mr-0.5 ${stylePlayerInMyLineup}`}>
                <Text
                  className={`text-xs font-semibold ${
                    valorization < 0
                      ? 'text-folly'
                      : colorTheme === 'dark'
                      ? 'text-blue-300'
                      : 'text-blue-500'
                  }`}>
                  {numberToString(valorization)}
                </Text>
                {valorization !== 0 ? (
                  <Feather
                    name={valorization < 0 ? 'arrow-down' : 'arrow-up'}
                    color={
                      valorization < 0 ? '#ef4444' : colorTheme === 'dark' ? '#93c5fd' : '#3b82f6'
                    }
                  />
                ) : (
                  <></>
                )}
              </View>
            ) : (
              <></>
            )}

            <Text className="font-semibold">{playerScore}</Text>
          </View>

          {player && player.scout && Object.entries(player?.scout as object).length > 0 ? (
            <View className={`flex-row ${stylePlayerInMyLineup}`}>
              {Object.entries(player?.scout as object).map(([key, value]) => (
                <Text
                  key={key + value}
                  className={`text-xs font-semibold text-center ${
                    scoutsColors[key] === 'negative' && 'text-folly'
                  }

          ${scoutsColors[key] === 'positive' && 'text-green-500'}
          
          `}>{` ${value}${key}`}</Text>
              ))}
            </View>
          ) : (
            <></>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);
