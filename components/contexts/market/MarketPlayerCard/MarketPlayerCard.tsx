import { Feather } from '@expo/vector-icons';
import { memo } from 'react';
import { Image, StyleSheet, useColorScheme } from 'react-native';

import { Text, TouchableOpacity, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { OBJECT_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import { FullPlayer } from '@/models/Stats';
import { useGetMarket, useGetMarketStatus } from '@/queries/market.query';
import { useGetMatchs } from '@/queries/matches.query';
import { useGetPositions } from '@/queries/players.query';
import { numberToString } from '@/utils/parseTo';

type MarketPlayerCardProps = {
  player: FullPlayer;
  onPressAddPlayerToLineup: (player: FullPlayer) => void;
  onPressRemovePlayerFromLineup: (player: FullPlayer) => void;
  isButtonDisabled: boolean;
  isSellPlayer?: boolean;
};

export const MarketPlayerCard: React.FC<MarketPlayerCardProps> = memo(
  ({
    player,
    onPressAddPlayerToLineup,
    onPressRemovePlayerFromLineup,
    isButtonDisabled,
    isSellPlayer,
  }) => {
    const colorTheme = useColorScheme();

    const { data: market } = useGetMarket();
    const { data: positions } = useGetPositions();
    const { data: matches } = useGetMatchs();

    const { data: marketStatus } = useGetMarketStatus();

    const match = matches?.partidas.find(
      (match) =>
        match.clube_casa_id === player.clube_id || match.clube_visitante_id === player.clube_id
    );

    const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

    return (
      <View
        className="rounded-lg flex-row items-center justify-between p-1.5"
        key={player.atleta_id}>
        <View
          className="flex-row items-center"
          style={{
            gap: 8,
          }}>
          <Image
            source={{
              uri: player.foto?.replace('FORMATO', '220x220'),
            }}
            className="w-16 h-16 rounded-3xl "
            alt={`Imagem do ${player.nome}`}
          />
          <View
            className="flex-row absolute"
            style={{
              top: '65%',
              left: '20%',
              width: 20,
              height: 20,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: OBJECT_STATUS_MARKET_PLAYER[player?.status_id]?.background,
            }}>
            <Feather
              name={
                OBJECT_STATUS_MARKET_PLAYER[player?.status_id]
                  ?.icon as keyof typeof Feather.glyphMap
              }
              color={OBJECT_STATUS_MARKET_PLAYER[player?.status_id]?.color}
              size={14}
            />
          </View>

          <View
            className="items-start justify-center"
            style={{
              gap: 4,
            }}>
            <Text className="flex-row text-base font-bold">{player.apelido_abreviado}</Text>

            <View
              className="flex-row items-center justify-start"
              style={{
                gap: 4,
              }}>
              <Text className="font-medium uppercase text-xs">
                {positions?.[player.posicao_id].abreviacao}
              </Text>

              <View className="rounded-full bg-gray-300 h-1 w-1" />

              <Text className="font-medium uppercase text-xs">
                {market?.clubes[player.clube_id].abreviacao}
              </Text>

              <View className="rounded-full bg-gray-300 h-1 w-1" />

              <View
                className="flex-row items-center"
                style={{
                  gap: 2,
                }}>
                <Image
                  source={{
                    uri: matches?.clubes[match?.clube_casa_id as number]?.escudos['60x60'],
                  }}
                  className="w-4 h-4"
                  alt={`Escudo do ${matches?.clubes[match?.clube_casa_id as number]?.nome}`}
                />

                <Feather
                  name="x"
                  size={12}
                  color={colorTheme === 'dark' ? Colors.light.background : Colors.dark.background}
                />

                <Image
                  source={{
                    uri: matches?.clubes[match?.clube_visitante_id as number]?.escudos['60x60'],
                  }}
                  className="w-4 h-4"
                  alt={`Escudo do ${matches?.clubes[match?.clube_visitante_id as number]?.nome}`}
                />
              </View>
            </View>

            <View
              className="flex-row items-start justify-start"
              style={{
                gap: 8,
              }}>
              <View className="items-center justify-center">
                <Text className="text-xs">Média</Text>
                <Text
                  className="font-bold text-xs"
                  style={{
                    color: player.media_num > 0 ? '#22c55e' : '#ef4444',
                  }}>
                  {numberToString(player.media_num)}
                </Text>
              </View>

              <View className="items-center justify-center">
                <Text className="text-xs">Última</Text>
                <Text
                  className="font-bold text-xs"
                  style={{
                    color: player.pontos_num > 0 ? '#22c55e' : '#ef4444',
                  }}>
                  {numberToString(player.pontos_num)}
                </Text>
              </View>

              <View className="items-center justify-center">
                <Text className="text-xs">Min. Val.</Text>
                <Text className="font-bold text-xs">
                  {player.minimo_para_valorizar === null
                    ? '-'
                    : numberToString(player.minimo_para_valorizar)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {!isSellPlayer ? (
          <TouchableOpacity
            disabled={isButtonDisabled}
            style={[
              styles.playerButton,
              isButtonDisabled
                ? styles.purchasePlayerButtonDisabled
                : styles.purchasePlayerButtonActived,
            ]}
            onPress={() => onPressAddPlayerToLineup(player)}
            activeOpacity={0.6}>
            {isButtonDisabled || isMarketClose ? (
              <>
                <Text className="text-white text-sm font-semibold">Indisp.</Text>
                <Text className="text-white text-sm font-semibold">
                  C$ {numberToString(player.preco_num)}
                </Text>
              </>
            ) : (
              <>
                <Text className="text-white text-sm font-semibold">Comprar</Text>
                <Text className="text-white text-sm font-semibold">
                  C$ {numberToString(player.preco_num)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={isMarketClose}
            style={[
              styles.playerButton,
              !isMarketClose ? styles.sellPlayerButton : styles.purchasePlayerButtonDisabled,
            ]}
            onPress={() => onPressRemovePlayerFromLineup(player)}
            activeOpacity={0.6}>
            {isMarketClose ? (
              <>
                <Text className="text-white text-sm font-semibold">Indisp.</Text>
                <Text className="text-white text-sm font-semibold">
                  C$ {numberToString(player.preco_num)}
                </Text>
              </>
            ) : (
              <>
                <Text className="text-white text-sm font-semibold">Vender</Text>
                <Text className="text-white text-sm font-semibold">
                  C$ {numberToString(player.preco_num)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  playerButton: {
    width: 100,
    height: 75,
    borderRadius: 8,
    paddingVertical: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchasePlayerButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  purchasePlayerButtonActived: {
    backgroundColor: '#3b82f6',
  },
  sellPlayerButton: {
    backgroundColor: '#ef4444',
  },
});
