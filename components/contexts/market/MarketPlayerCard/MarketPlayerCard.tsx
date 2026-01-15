import { Feather } from '@expo/vector-icons';
import {  Image, StyleSheet } from 'react-native';

import { Text, TouchableOpacity, View } from '@/components/Themed';
import { Loading } from '@/components/structure/Loading';
import Colors from '@/constants/Colors';
import { OBJECT_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import useMarketStatus from '@/hooks/useMarketStatus';
import { Market } from '@/models/Market';
import { Matches } from '@/models/Matches';
import { FullPlayer, IPositions } from '@/models/Stats';
import { numberToString } from '@/utils/parseTo';
import { useThemeColor } from '@/hooks/useThemeColor';

type MarketPlayerCardProps = {
  player: FullPlayer;
  market: Market;
  matches: Matches;
  positions: IPositions;
  onPressAddPlayerToLineup: (player: FullPlayer) => void;
  onPressRemovePlayerFromLineup: (player: FullPlayer) => void;
  isButtonDisabled: boolean;
  isSellPlayer?: boolean;
};

export function MarketPlayerCard({
  market,
  matches,
  positions,
  player,
  onPressAddPlayerToLineup,
  onPressRemovePlayerFromLineup,
  isButtonDisabled,
  isSellPlayer,
}: MarketPlayerCardProps) {
  const colorTheme = useThemeColor();

  const { isMarketClose } = useMarketStatus();

  const match = matches?.partidas.find(
    (match) =>
      match.clube_casa_id === player.clube_id || match.clube_visitante_id === player.clube_id
  );

  if (!match) {
    return <Loading />;
  }

  return (
    <View 
      className="rounded-lg flex-row items-center justify-between p-3"
      style={{
        backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
        borderWidth: 1,
        borderColor: colorTheme === 'dark' ? '#1f2937' : '#f3f4f6',
      }}>
      <View
        className="flex-row items-center"
        style={{
          gap: 10,
          backgroundColor: 'transparent',
        }}>
        <Image
          source={{
            uri: player.foto?.replace('FORMATO', '220x220'),
          }}
          className="w-14 h-14 rounded-full"
          alt={`Imagem do ${player.nome}`}
        />
        <View
          className="flex-row absolute"
          style={{
            top: '60%',
            left: '18%',
            width: 20,
            height: 20,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: OBJECT_STATUS_MARKET_PLAYER[player?.status_id]?.background,
          }}>
          <Feather
            name={
              OBJECT_STATUS_MARKET_PLAYER[player?.status_id]?.icon as keyof typeof Feather.glyphMap
            }
            color={OBJECT_STATUS_MARKET_PLAYER[player?.status_id]?.color}
            size={14}
          />
        </View>

        <View
          className="items-start justify-center"
          style={{
            gap: 6,
            backgroundColor: 'transparent',
          }}>
          <View
            className="flex-row items-center"
            style={{
              gap: 4,
              backgroundColor: 'transparent',
            }}>
            <Text 
              className="flex-row text-base font-bold"
              style={{ color: colorTheme === 'dark' ? '#f3f4f6' : '#111827' }}>
              {player.apelido_abreviado}
            </Text>
            <View 
              className="rounded-full h-1 w-1"
              style={{ backgroundColor: colorTheme === 'dark' ? '#6b7280' : '#d1d5db' }} 
            />
            <Text 
              className="flex-row text-xs font-medium" 
              style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              {player.jogos_num} Jogos
            </Text>
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
              {positions?.[player.posicao_id].abreviacao}
            </Text>

            <View 
              className="rounded-full h-1 w-1"
              style={{ backgroundColor: colorTheme === 'dark' ? '#6b7280' : '#d1d5db' }} 
            />

            <Text 
              className="font-medium uppercase text-xs" 
              style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              {market?.clubes[player.clube_id].abreviacao}
            </Text>

            <View 
              className="rounded-full h-1 w-1"
              style={{ backgroundColor: colorTheme === 'dark' ? '#6b7280' : '#d1d5db' }} 
            />

            <View
              className="flex-row items-center"
              style={{
                gap: 2,
                backgroundColor: 'transparent',
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
                color={colorTheme === 'dark' ? '#6b7280' : '#9ca3af'}
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
              backgroundColor: 'transparent',
            }}>
            <View 
              className="items-center justify-center"
              style={{ backgroundColor: 'transparent' }}>
              <Text 
                className="text-xs" 
                style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Média
              </Text>
              <Text
                className="font-bold text-xs"
                style={{
                  color: player.media_num > 0 ? '#22c55e' : '#ef4444',
                }}>
                {numberToString(player.media_num)}
              </Text>
            </View>

            <View 
              className="items-center justify-center"
              style={{ backgroundColor: 'transparent' }}>
              <Text 
                className="text-xs" 
                style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Última
              </Text>
              <Text
                className="font-bold text-xs"
                style={{
                  color: player.pontos_num > 0 ? '#22c55e' : '#ef4444',
                }}>
                {numberToString(player.pontos_num)}
              </Text>
            </View>

            <View 
              className="items-center justify-center"
              style={{ backgroundColor: 'transparent' }}>
              <Text 
                className="text-xs" 
                style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Min. Val.
              </Text>
              <Text 
                className="font-bold text-xs" 
                style={{ color: colorTheme === 'dark' ? '#60a5fa' : '#3b82f6' }}>
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

const styles = StyleSheet.create({
  playerButton: {
    width: 90,
    height: 70,
    borderRadius: 8,
    paddingVertical: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchasePlayerButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  purchasePlayerButtonActived: {
    backgroundColor: '#2563eb',
  },
  sellPlayerButton: {
    backgroundColor: '#dc2626',
  },
});
