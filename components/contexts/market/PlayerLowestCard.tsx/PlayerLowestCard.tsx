import { Feather } from '@expo/vector-icons';
import { Image } from 'react-native';

import { Text, View } from '@/components/Themed';
import { OBJECT_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import { LineupPlayer } from '@/models/Formations';
import { useGetMarket } from '@/queries/market.query';
import { useGetPositions } from '@/queries/players.query';
import { numberToString } from '@/utils/parseTo';

type PlayerLowestCardProps = {
  player: LineupPlayer;
};

export function PlayerLowestCard({ player }: PlayerLowestCardProps) {
  const { data: positions } = useGetPositions();
  const { data: market } = useGetMarket();

  return (
    <View className="rounded-lg flex-row items-center justify-between p-2 border-2 border-orange-500 mb-1">
      <View>
        <Image
          source={{
            uri: player?.foto?.replace('FORMATO', '220x220'),
          }}
          className="w-12 h-12 rounded-3xl mr-2"
          alt={`Imagem do ${player?.nome}`}
        />
      </View>

      <View className="flex-1 justify-between">
        <View className="flex-row justify-between items-center flex-1">
          <View className="items-start justify-center">
            <View className="flex-row items-center gap-1">
              <Text className="flex-row text-sm font-bold">{player?.apelido_abreviado}</Text>
              <View className="rounded-full bg-gray-300 h-1 w-1" />
              <Text className="font-medium text-xs">
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
              }}>
              <Text className="font-medium uppercase text-xs">
                {positions?.[player?.posicao_id as number].abreviacao}
              </Text>

              <View className="rounded-full bg-gray-300 h-1 w-1" />

              <Text className="font-medium uppercase text-xs">
                {market?.clubes[player?.clube_id as number].abreviacao}
              </Text>
            </View>
          </View>

          <View className="flex-row" style={{ gap: 4 }}>
            <Text className="flex-row text-sm font-semibold">
              C$ {numberToString(player?.preco_num)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
