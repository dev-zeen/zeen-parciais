import { Feather } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Image, ScrollView } from 'react-native';

import { Text, TouchableOpacity, View } from '@/components/Themed';
import { PlayerStatsView } from '@/components/contexts/team/PlayerStatsView';
import { Loading } from '@/components/structure/Loading';
import { Positions } from '@/constants/Formations';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LineupPlayer } from '@/models/Formations';
import { useGetMarket } from '@/queries/market.query';
import { useGetPlayerHistory, useGetPositions } from '@/queries/players.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { numberToString } from '@/utils/parseTo';

type TeamPlayerCardProps = {
  player: LineupPlayer;
  isReservePlayer: boolean;
  onClose: () => void;
};

export function TeamPlayerCard({ player, isReservePlayer, onClose }: TeamPlayerCardProps) {
  const colorTheme = useThemeColor();

  const captain = useTeamLineupStore((state) => state.captain);
  const updateCaptain = useTeamLineupStore((state) => state.updateCaptain);

  const isCaptain = captain === player.atleta_id;

  const removePlayerFromLineup = useTeamLineupStore((state) => state.removePlayerFromLineup);

  const { data: positions } = useGetPositions();
  const { data: market } = useGetMarket();
  const { data: playerHistory } = useGetPlayerHistory(player.atleta_id);

  const { marketStatus, isMarketClose } = useMarketStatus();

  const handleSelectCaptain = useCallback(() => {
    updateCaptain(player.atleta_id);
  }, [player.atleta_id, updateCaptain]);

  const handleRemovePlayerFromLineup = useCallback(() => {
    removePlayerFromLineup(player);
    onClose();
  }, [onClose, player, removePlayerFromLineup]);

  if (!positions || !market || !marketStatus) return <Loading />;

  return (
    <View
      className="flex-1 mx-4 rounded-2xl overflow-hidden"
      style={{
        backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#ffffff',
      }}>
      {/* Header */}
      <View
        className="items-center justify-between flex-row px-4 pt-3 pb-3"
        style={{
          gap: 12,
          backgroundColor: 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
        }}>
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <Text className="text-lg font-bold" numberOfLines={1}>
            {player.apelido}
          </Text>
          <Text
            className="text-xs font-medium"
            numberOfLines={1}
            style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
            {positions?.[player.posicao_id].nome}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={onClose}
          className="p-2 rounded-full"
          style={{
            backgroundColor: colorTheme === 'dark' ? '#ef4444' : '#fee2e2',
          }}>
          <Feather name="x" color={colorTheme === 'dark' ? '#ffffff' : '#dc2626'} size={24} />
        </TouchableOpacity>
      </View>

      {/* Single ScrollView with all content */}
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: 'transparent' }}
        showsVerticalScrollIndicator={false}>
        <View className="px-4 py-3" style={{ gap: 12, backgroundColor: 'transparent' }}>
          {/* Player Info Section */}
          <View
            className="flex-row items-center justify-between"
            style={{ backgroundColor: 'transparent' }}>
            <Image
              source={{
                uri: player.foto?.replace('FORMATO', '220x220'),
              }}
              className="w-20 h-20 rounded-full"
              style={{
                borderWidth: 2,
                borderColor: colorTheme === 'dark' ? '#3b82f6' : '#dbeafe',
              }}
              alt={`Imagem do ${player.nome}`}
            />

            <View
              className="justify-end items-end flex-1 ml-3"
              style={{
                gap: 2,
                backgroundColor: 'transparent',
              }}>
              {!isMarketClose && (
                <View
                  className="flex-row items-center"
                  style={{ gap: 8, backgroundColor: 'transparent' }}>
                  {!isCaptain && !isReservePlayer && player.posicao_id !== Positions.TECNICO && (
                    <TouchableOpacity
                      onPress={handleSelectCaptain}
                      disabled={isCaptain}
                      activeOpacity={0.6}
                      className="flex-1 py-3 rounded-lg"
                      style={{
                        backgroundColor: colorTheme === 'dark' ? '#7c3aed' : '#ddd6fe',
                        borderWidth: 1.5,
                        borderColor: colorTheme === 'dark' ? '#8b5cf6' : '#a78bfa',
                      }}>
                      <Text
                        className="text-center font-semibold text-sm"
                        style={{
                          color: colorTheme === 'dark' ? '#ffffff' : '#6d28d9',
                        }}>
                        Tornar Capitão
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={handleRemovePlayerFromLineup}
                    activeOpacity={0.6}
                    className={`${!isCaptain && !isReservePlayer && player.posicao_id !== Positions.TECNICO ? 'flex-1' : 'flex-1'} py-3 rounded-lg`}
                    style={{
                      backgroundColor: colorTheme === 'dark' ? '#dc2626' : '#fee2e2',
                      borderWidth: 1.5,
                      borderColor: colorTheme === 'dark' ? '#ef4444' : '#fca5a5',
                    }}>
                    <Text
                      className="text-center font-semibold text-sm"
                      style={{
                        color: colorTheme === 'dark' ? '#ffffff' : '#991b1b',
                      }}>
                      Vender
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}

          {/* Basic Stats */}
          <View
            className="flex-row justify-between p-3 rounded-lg"
            style={{
              gap: 4,
              backgroundColor: colorTheme === 'dark' ? '#111827' : '#f9fafb',
              borderWidth: 1,
              borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
            }}>
            <View
              className="items-center justify-center flex-1"
              style={{ backgroundColor: 'transparent' }}>
              <Text
                className="text-xs font-medium"
                style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Jogos
              </Text>
              <Text className="text-base font-bold mt-0.5">{player.jogos_num}</Text>
            </View>

            <View
              className="items-center justify-center flex-1"
              style={{ backgroundColor: 'transparent' }}>
              <Text
                className="text-xs font-medium"
                style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Média
              </Text>
              <Text className="text-base font-bold mt-0.5">{numberToString(player.media_num)}</Text>
            </View>

            <View
              className="items-center justify-center flex-1"
              style={{ backgroundColor: 'transparent' }}>
              <Text
                className="text-xs font-medium"
                style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Min
              </Text>
              <Text className="text-base font-bold mt-0.5">
                {numberToString(player.minimo_para_valorizar)}
              </Text>
            </View>

            <View
              className="items-center justify-center flex-1"
              style={{ backgroundColor: 'transparent' }}>
              <Text
                className="text-xs font-medium"
                style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Preço
              </Text>
              <Text className="text-base font-bold mt-0.5" style={{ color: '#3b82f6' }}>
                {numberToString(player.preco_num)}
              </Text>
            </View>
          </View>

          {/* Statistics Section */}
          {playerHistory && playerHistory.length > 0 && (
            <View style={{ backgroundColor: 'transparent' }}>
              <PlayerStatsView stats={playerHistory} isLoading={false} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
