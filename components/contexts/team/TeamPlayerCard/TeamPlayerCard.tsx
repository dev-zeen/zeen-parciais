import { Feather } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Image, ScrollView, useColorScheme } from 'react-native';

import captainImage from '@/assets/images/letter-c.png';
import { Text, TouchableOpacity, View } from '@/components/Themed';
import { Loading } from '@/components/structure/Loading';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { LineupPlayer } from '@/models/Formations';
import { useGetMarket, useGetMarketStatus } from '@/queries/market.query';
import { useGetPositions } from '@/queries/players.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { numberToString } from '@/utils/parseTo';

type TeamPlayerCardProps = {
  player: LineupPlayer;
  isReservePlayer: boolean;
  onClose: () => void;
};

export function TeamPlayerCard({ player, isReservePlayer, onClose }: TeamPlayerCardProps) {
  const colorTheme = useColorScheme();

  const capitain = useTeamLineupStore((state) => state.capitain);
  const updateCapitain = useTeamLineupStore((state) => state.updateCapitain);

  const isCapitain = capitain === player.atleta_id;

  const removePlayerFromLineup = useTeamLineupStore((state) => state.removePlayerFromLineup);

  const { data: positions } = useGetPositions();
  const { data: market } = useGetMarket();
  const { data: marketStatus } = useGetMarketStatus();

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const handleSelectCapitain = useCallback(() => {
    updateCapitain(player.atleta_id);
  }, [player.atleta_id, updateCapitain]);

  const handleRemovePlayerFromLineup = useCallback(() => {
    removePlayerFromLineup(player);
    onClose();
  }, [onClose, player, removePlayerFromLineup]);

  if (!positions || !market || !marketStatus) return <Loading />;

  return (
    <View
      className="flex-1 pt-64 px-4 pb-8 rounded-lg"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}>
      <View className="flex-1 rounded-lg">
        <View
          className="items-center justify-end flex-row pt-2 mx-2 rounded-lg mb-2"
          style={{
            marginHorizontal: 4,
            gap: 16,
          }}>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 rounded-full border border-red-400 bg-red-300">
            <Feather name="x" color="#525252" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView className="gap-y-4">
          <View className="flex-1 flex-row items-center justify-between px-8">
            <Image
              source={{
                uri: player.foto.replace('FORMATO', '220x220'),
              }}
              className="w-32 h-32 rounded-full mr-2"
              style={{
                borderWidth: 2,
                borderColor: '#F5F5F5',
              }}
              alt={`Imagem do ${player.nome}`}
            />

            <View
              className="justify-end items-end"
              style={{
                gap: 4,
              }}>
              <View
                className="flex-row items-center"
                style={{
                  gap: 8,
                }}>
                {isCapitain && (
                  <Image
                    source={captainImage}
                    className="w-8 h-8 overflow-hidden"
                    alt={`Foto do ${player?.apelido}`}
                  />
                )}
                <Text className="font-light text-base">{positions?.[player.posicao_id].nome}</Text>
              </View>

              <Text className="font-semibold text-xl">{player.apelido}</Text>
              <View className="flex-row items-center justify-center">
                <Image
                  source={{
                    uri: market?.clubes?.[player.clube_id].escudos['60x60'],
                  }}
                  className="w-7 h-7 rounded-3xl mr-2"
                  alt={`Imagem do ${player.nome}`}
                />
                <Text className="font-semibold text-base">
                  {market?.clubes?.[player.clube_id].nome_fantasia}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row border border-white p-4 mx-2 justify-between items-center rounded bg-neutral-200">
            <View className="items-center justify-center bg-neutral-200 gap-y-1">
              <Text className="text-gray-800 font-semibold">Jogos</Text>
              <Text className="text-gray-800 font-bold">{player.jogos_num}</Text>
            </View>

            <View className="items-center justify-center bg-neutral-200 gap-y-1">
              <Text className="text-gray-800 font-semibold">Média</Text>
              <Text className="text-gray-800 font-bold">{numberToString(player.media_num)}</Text>
            </View>

            <View className="items-center justify-center bg-neutral-200 gap-y-1">
              <Text className="text-gray-800 font-semibold">Min p/ Val</Text>
              <Text className="text-gray-800 font-bold">
                {numberToString(player.minimo_para_valorizar)}
              </Text>
            </View>

            <View className="items-center justify-center bg-neutral-200 gap-y-1">
              <Text className="text-gray-800 font-semibold">Preço</Text>
              <Text className="text-gray-800 font-bold">C$ {numberToString(player.preco_num)}</Text>
            </View>
          </View>

          {!isMarketClose && (
            <View className="flex-row px-4 mx-2 rounded-lg items-center justify-evenly">
              {!isCapitain && !isReservePlayer && (
                <TouchableOpacity
                  onPress={handleSelectCapitain}
                  disabled={isCapitain}
                  activeOpacity={0.6}
                  className={`${isCapitain ? 'F5F5F5' : 'border-2 border-violet-500'}  ${
                    colorTheme === 'dark' ? 'bg-violet-500' : 'bg-violet-200'
                  } p-3 rounded-lg`}>
                  <Text>Tornar Capitão</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleRemovePlayerFromLineup}
                activeOpacity={0.6}
                className={`border-2 border-red-500 ${
                  colorTheme === 'dark' ? 'bg-red-500' : 'bg-red-200'
                } p-3 rounded-lg`}>
                <Text>Vender Jogador</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
