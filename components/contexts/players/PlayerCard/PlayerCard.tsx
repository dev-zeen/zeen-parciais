import { Feather } from '@expo/vector-icons';
import { useContext, useMemo } from 'react';
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
  appreciation?: number;
  isPlayerOnMyLineup?: boolean;
}

export function PlayerCard({
  player,
  club,
  position,
  appreciation,
  isPlayerOnMyLineup,
}: PlayerCardProps) {
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

  const playerScore = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
  }).format(player.pontuacao);

  const stylePlayerInMyLineup = isPlayerOnMyLineup
    ? colorTheme === 'dark'
      ? 'bg-blue-600'
      : 'bg-blue-200'
    : '';

  // const onPressHandler = useCallback(() => {
  //   router.push(`/(tabs)/players/${player.id}`);
  // }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      // onPress={onPressHandler}
      className={`flex-row justify-between items-center rounded-lg px-4 py-2 ${stylePlayerInMyLineup}`}>
      <View className={`flex-row items-center gap-1 rounded-lg ${stylePlayerInMyLineup}`}>
        <Image
          source={{
            uri: player.foto.replace('FORMATO', '220x220'),
          }}
          className="w-12 h-12"
          alt={player.apelido}
        />
        <Image
          source={{
            uri: club?.escudos?.['60x60'],
          }}
          className="w-6 h-6"
          alt={`Escudo do ${club?.nome}`}
        />
        <View className={`${stylePlayerInMyLineup}`}>
          <Text className="font-semibold text-sm">{player.apelido}</Text>
          <Text className="font-light text-xs">{position?.nome}</Text>
        </View>
      </View>
      <View className={`justify-center items-end ${stylePlayerInMyLineup}`}>
        <View className={`flex-row items-center justify-center ${stylePlayerInMyLineup}`}>
          {isAutheticated && appreciation ? (
            <View
              className={`flex-row items-center justify-end w-10 mr-0.5 ${stylePlayerInMyLineup}`}>
              <Text
                className={`text-xs font-semibold ${
                  appreciation < 0
                    ? 'text-folly'
                    : colorTheme === 'dark'
                    ? 'text-blue-300'
                    : 'text-blue-500'
                }`}>
                {numberToString(appreciation)}
              </Text>
              {appreciation !== 0 ? (
                <Feather
                  name={appreciation < 0 ? 'arrow-down' : 'arrow-up'}
                  color={
                    appreciation < 0 ? '#ef4444' : colorTheme === 'dark' ? '#93c5fd' : '#3b82f6'
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
      </View>
    </TouchableOpacity>
  );
}
