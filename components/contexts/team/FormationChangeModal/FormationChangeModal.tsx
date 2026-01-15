import { Feather } from '@expo/vector-icons';
import {  Image, Modal, ScrollView } from 'react-native';

import { PlayersToSell } from '@/app/(tabs)/team/_team.helpers';
import { Text, TouchableOpacity, View } from '@/components/Themed';
import { Positions } from '@/constants/Formations';
import { useThemeColor } from '@/hooks/useThemeColor';

type FormationChangeModalProps = {
  visible: boolean;
  playersToSellData: PlayersToSell[];
  selectedPlayersToRemove: Set<number>;
  onTogglePlayer: (atletaId: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

const getPositionName = (positionCode: string): string => {
  const code = parseInt(positionCode, 10);
  switch (code) {
    case Positions.GOLEIRO:
      return 'Goleiro';
    case Positions.LATERAL:
      return 'Lateral';
    case Positions.ZAGUEIRO:
      return 'Zagueiro';
    case Positions.MEIO_CAMPO:
      return 'Meia';
    case Positions.ATACANTE:
      return 'Atacante';
    case Positions.TECNICO:
      return 'Técnico';
    default:
      return positionCode;
  }
};

export function FormationChangeModal({
  visible,
  playersToSellData,
  selectedPlayersToRemove,
  onTogglePlayer,
  onConfirm,
  onCancel,
}: FormationChangeModalProps) {
  const colorTheme = useThemeColor();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
        <View
          className="w-full max-w-md rounded-2xl p-6"
          style={{
            backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#ffffff',
            maxHeight: '80%',
          }}>
          {/* Header */}
          <View style={{ backgroundColor: 'transparent', marginBottom: 16 }}>
            <View
              className="flex-row items-center justify-between mb-2"
              style={{ backgroundColor: 'transparent' }}>
              <View className="flex-row items-center" style={{ gap: 8, backgroundColor: 'transparent' }}>
                <Feather name="alert-circle" size={24} color="#f59e0b" />
                <Text className="text-lg font-bold">Ajustar Escalação</Text>
              </View>
              <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
                <Feather name="x" size={24} color={colorTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
            </View>
            <Text className="text-sm" style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              A nova formação não comporta todos os jogadores. Selecione quem deve ser removido:
            </Text>
          </View>

          {/* Players List */}
          <ScrollView
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
            {playersToSellData.map((positionData) => (
              <View key={positionData.position} style={{ backgroundColor: 'transparent' }}>
                <Text
                  className="text-sm font-semibold mb-2"
                  style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
                  {getPositionName(positionData.position)} - Remover {positionData.quantityToSell} de{' '}
                  {positionData.players.length}
                </Text>
                <View style={{ gap: 8, backgroundColor: 'transparent' }}>
                  {positionData.players.map((position) => {
                    if (!position.player) return null;
                    const isSelected = selectedPlayersToRemove.has(position.player.atleta_id);
                    return (
                      <TouchableOpacity
                        key={position.player.atleta_id}
                        activeOpacity={0.7}
                        onPress={() => onTogglePlayer(position.player!.atleta_id)}
                        className="flex-row items-center p-3 rounded-lg"
                        style={{
                          backgroundColor: isSelected
                            ? colorTheme === 'dark'
                              ? '#ef444420'
                              : '#fee2e2'
                            : colorTheme === 'dark'
                            ? '#374151'
                            : '#f3f4f6',
                          borderWidth: 2,
                          borderColor: isSelected
                            ? '#ef4444'
                            : colorTheme === 'dark'
                            ? '#4b5563'
                            : '#e5e7eb',
                        }}>
                        <Image
                          source={{ uri: position.player.foto?.replace('FORMATO', '80x80') }}
                          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                        />
                        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                          <Text className="font-bold text-sm">{position.player.apelido}</Text>
                          <Text
                            className="text-xs"
                            style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                            C$ {position.player.preco_num?.toFixed(2)}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: isSelected ? '#ef4444' : '#9ca3af',
                            backgroundColor: isSelected ? '#ef4444' : 'transparent',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          {isSelected && <Feather name="check" size={14} color="#ffffff" />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View className="flex-row" style={{ gap: 12, backgroundColor: 'transparent', marginTop: 16 }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancel}
              className="flex-1 py-3 rounded-lg items-center justify-center"
              style={{
                backgroundColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
              }}>
              <Text
                className="font-semibold"
                style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onConfirm}
              className="flex-1 py-3 rounded-lg items-center justify-center"
              style={{ backgroundColor: '#22c55e' }}>
              <Text className="font-semibold" style={{ color: '#ffffff' }}>
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
