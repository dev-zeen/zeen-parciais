import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  PLAYER_AVATAR_SIZE,
  PLAYER_LABEL_HEIGHT,
  PLAYER_SLOT_MAX_WIDTH,
} from '@/components/contexts/team/TeamPlayer/TeamPlayer';
import { AppText } from '@/components/ui/AppText';
import { MIN_TOUCH, useTokens } from '@/hooks/useTokens';
import { LineupPosition } from '@/models/Formations';

type AddPlayerButtonProps = {
  positionLineup: LineupPosition;
  onPurchasePlayerOnMarket: (player: LineupPosition) => void;
  isViewOnly?: boolean;
  width?: number;
};

const POSITION_NAMES: Record<string, string> = {
  GOL: 'goleiro',
  LAT: 'lateral',
  ZAG: 'zagueiro',
  MEI: 'meia',
  ATA: 'atacante',
  TEC: 'técnico',
};

export function AddPlayerButton({
  positionLineup,
  onPurchasePlayerOnMarket,
  isViewOnly = false,
  width = PLAYER_SLOT_MAX_WIDTH,
}: AddPlayerButtonProps) {
  const { field } = useTokens();
  const abbr = positionLineup?.abbr ?? '';
  const positionName = POSITION_NAMES[abbr.toUpperCase()] ?? abbr;

  return (
    <Pressable
      disabled={isViewOnly}
      onPress={() => onPurchasePlayerOnMarket(positionLineup)}
      accessibilityRole="button"
      accessibilityLabel={isViewOnly ? `Vaga de ${positionName} vazia` : `Adicionar ${positionName}`}
      accessibilityHint={isViewOnly ? undefined : 'Abre o mercado nesta posição'}
      style={({ pressed }) => [
        styles.slot,
        { width, minHeight: MIN_TOUCH, opacity: pressed ? 0.7 : 1 },
      ]}>
      {/* Reserva o espaço da etiqueta do jogador para as vagas alinharem com os avatares */}
      <View style={{ height: PLAYER_LABEL_HEIGHT }} />

      <View
        style={[
          styles.circle,
          { backgroundColor: field.slotBg, borderColor: field.chipText },
        ]}>
        {isViewOnly ? null : <Feather name="plus" size={20} color={field.chipText} />}
      </View>

      <View style={[styles.name, { backgroundColor: field.chipBg }]}>
        <AppText
          variant="caption"
          weight="bold"
          color={field.chipText}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}>
          {abbr.toUpperCase()}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  circle: {
    width: PLAYER_AVATAR_SIZE,
    height: PLAYER_AVATAR_SIZE,
    borderRadius: PLAYER_AVATAR_SIZE / 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
});
