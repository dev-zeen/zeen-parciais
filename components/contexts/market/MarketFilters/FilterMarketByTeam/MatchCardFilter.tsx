import { Feather } from '@expo/vector-icons';
import { Image } from 'react-native';

import { Text, TouchableOpacity, View } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Market } from '@/models/Market';
import { Match } from '@/models/Matches';

type MatchCardFilterProps = {
  market: Market;
  match: Match;
  selecteds?: number[];
  handlePressTeam: (id: number) => void;
};

export function MatchCardFilter({
  market,
  match,
  selecteds,
  handlePressTeam,
}: MatchCardFilterProps) {
  const colorTheme = useThemeColor();

  return (
    <View
      className="flex-row px-8 py-3 rounded-lg items-center justify-evenly"
      style={{
        backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
        borderWidth: 1,
        borderColor: colorTheme === 'dark' ? '#1f2937' : '#f3f4f6',
      }}>
      <TouchableOpacity
        className="flex-row items-center justify-center"
        style={{ gap: 8, backgroundColor: 'transparent' }}
        activeOpacity={0.7}
        onPress={() => handlePressTeam(match.clube_casa_id)}>
        <Text
          className="font-semibold w-7 text-center"
          style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
          {`${match.clube_casa_posicao}º`}
        </Text>

        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            borderWidth: selecteds?.includes(match.clube_casa_id) ? 2 : 1,
            borderColor: selecteds?.includes(match.clube_casa_id)
              ? colorTheme === 'dark'
                ? '#0057FF'
                : '#0057FF'
              : colorTheme === 'dark'
                ? '#374151'
                : '#e5e7eb',
            padding: 4,
            backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#f9fafb',
          }}>
          <Image
            style={{
              width: '100%',
              height: '100%',
              opacity: selecteds?.includes(match.clube_casa_id) ? 1 : 0.5,
            }}
            source={{
              uri: market?.clubes[match.clube_casa_id]?.escudos['60x60'],
            }}
            alt={market?.clubes[match.clube_casa_id]?.nome_fantasia}
          />
        </View>
      </TouchableOpacity>

      <Feather name="x" size={16} color={colorTheme === 'dark' ? '#6b7280' : '#9ca3af'} />

      <TouchableOpacity
        className="flex-row items-center justify-center"
        style={{ gap: 8, backgroundColor: 'transparent' }}
        activeOpacity={0.7}
        onPress={() => handlePressTeam(match.clube_visitante_id)}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            borderWidth: selecteds?.includes(match.clube_visitante_id) ? 2 : 1,
            borderColor: selecteds?.includes(match.clube_visitante_id)
              ? colorTheme === 'dark'
                ? '#0057FF'
                : '#0057FF'
              : colorTheme === 'dark'
                ? '#374151'
                : '#e5e7eb',
            padding: 4,
            backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#f9fafb',
          }}>
          <Image
            style={{
              width: '100%',
              height: '100%',
              opacity: selecteds?.includes(match.clube_visitante_id) ? 1 : 0.5,
            }}
            source={{
              uri: market?.clubes[match.clube_visitante_id]?.escudos['60x60'],
            }}
            alt={market?.clubes[match.clube_visitante_id]?.nome}
          />
        </View>

        <Text
          className="font-semibold w-7 text-center"
          style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
          {`${match.clube_visitante_posicao}º`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
