import { Feather } from '@expo/vector-icons';
import { Image } from 'react-native';

import { Text, View } from '@/components/Themed';
import { OBJECT_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import { LineupPlayer } from '@/models/Formations';
import { useGetMarket } from '@/queries/market.query';
import { useGetPositions } from '@/queries/players.query';
import { numberToString } from '@/utils/parseTo';
import { useThemeColor } from '@/hooks/useThemeColor';

type PlayerLowestCardProps = {
  player: LineupPlayer;
};

export function PlayerLowestCard({ player }: PlayerLowestCardProps) {
  const colorTheme = useThemeColor();
  const { data: positions } = useGetPositions();
  const { data: market } = useGetMarket();

  return (
    <View 
      className="rounded-lg flex-row items-center justify-between p-3 mb-2"
      style={{
        backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
        borderWidth: 2,
        borderColor: colorTheme === 'dark' ? '#f97316' : '#fb923c',
      }}>
      <View style={{ backgroundColor: 'transparent' }}>
        <Image
          source={{
            uri: player?.foto?.replace('FORMATO', '220x220'),
          }}
          className="w-14 h-14 rounded-full mr-2"
          alt={`Imagem do ${player?.nome}`}
        />
      </View>

      <View className="flex-1 justify-between" style={{ backgroundColor: 'transparent' }}>
        <View className="flex-row justify-between items-center flex-1" style={{ backgroundColor: 'transparent' }}>
          <View className="items-start justify-center" style={{ backgroundColor: 'transparent' }}>
            <View className="flex-row items-center gap-1" style={{ backgroundColor: 'transparent' }}>
              <Text 
                className="flex-row text-sm font-bold"
                style={{ color: colorTheme === 'dark' ? '#f3f4f6' : '#111827' }}>
                {player?.apelido_abreviado}
              </Text>
              <View 
                className="rounded-full h-1 w-1"
                style={{ backgroundColor: colorTheme === 'dark' ? '#6b7280' : '#d1d5db' }} 
              />
              <Text 
                className="font-medium text-xs"
                style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                {OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number].name}
              </Text>
              <View
                className="flex-row"
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 10,
                  backgroundColor:
                    OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]?.background,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Feather
                  name={
                    OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]
                      ?.icon as keyof typeof Feather.glyphMap
                  }
                  color={OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]?.color}
                  size={14}
                />
              </View>
            </View>

            <View
              className="flex-row items-center justify-start"
              style={{
                gap: 4,
                backgroundColor: 'transparent',
              }}>
              <Text 
                className="font-medium uppercase text-xs"
                style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                {positions?.[player?.posicao_id as number].abreviacao}
              </Text>

              <View 
                className="rounded-full h-1 w-1"
                style={{ backgroundColor: colorTheme === 'dark' ? '#6b7280' : '#d1d5db' }} 
              />

              <Text 
                className="font-medium uppercase text-xs"
                style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                {market?.clubes[player?.clube_id as number].abreviacao}
              </Text>
            </View>
          </View>

          <View className="flex-row" style={{ gap: 4, backgroundColor: 'transparent' }}>
            <Text 
              className="flex-row text-sm font-semibold"
              style={{ color: colorTheme === 'dark' ? '#10b981' : '#059669' }}>
              C$ {numberToString(player?.preco_num)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
