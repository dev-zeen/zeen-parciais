import { Feather } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PlayersToSell } from '@/components/contexts/team/_team.helpers';
import { AppText } from '@/components/ui/AppText';
import { Positions } from '@/constants/Formations';
import { useTokens } from '@/hooks/useTokens';
import { haptics } from '@/utils/haptics';
import { numberToString } from '@/utils/parseTo';

type FormationChangeModalProps = {
  playersToSellData: PlayersToSell[];
  selectedPlayersToRemove: Set<number>;
  onTogglePlayer: (atletaId: number) => void;
  onConfirm: () => void;
  onClose?: () => void;
};

const POSITION_NAME: Record<number, string> = {
  [Positions.GOLEIRO]: 'Goleiro',
  [Positions.LATERAL]: 'Laterais',
  [Positions.ZAGUEIRO]: 'Zagueiros',
  [Positions.MEIO_CAMPO]: 'Meias',
  [Positions.ATACANTE]: 'Atacantes',
  [Positions.TECNICO]: 'Técnico',
};

/**
 * Troca de formação que não comporta todos os jogadores: escolher quem sai.
 * Feito para o sheet compacto: altura do conteúdo, lista só rola quando não cabe e o
 * rodapé com as ações fica sempre visível.
 */
export const FormationChangeModal = ({
  playersToSellData,
  selectedPlayersToRemove,
  onTogglePlayer,
  onConfirm,
  onClose,
}: FormationChangeModalProps) => {
  const { colors, spacing, radius, minTouch } = useTokens();

  const groups = playersToSellData.map((group) => ({
    ...group,
    selected: group.players.filter(
      (slot) => slot.player && selectedPlayersToRemove.has(slot.player.atleta_id)
    ).length,
  }));
  const required = groups.reduce((sum, group) => sum + group.quantityToSell, 0);
  const isReady =
    selectedPlayersToRemove.size === required &&
    groups.every((group) => group.selected === group.quantityToSell);

  return (
    <View style={styles.root}>
      {/* Cabeçalho */}
      <View style={[styles.row, { gap: spacing.sm, paddingHorizontal: spacing.md }]}>
        <View style={{ flex: 1 }}>
          <AppText variant="heading" weight="bold" accessibilityRole="header">
            Ajustar escalação
          </AppText>
          <AppText variant="label" color="textMuted">
            A nova formação tem menos vagas. Escolha quem sai.
          </AppText>
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cancelar troca de formação"
          style={({ pressed }) => [
            styles.center,
            {
              width: minTouch,
              height: minTouch,
              borderRadius: minTouch / 2,
              backgroundColor: colors.surfaceAlt,
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <Feather name="x" size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Lista: encolhe para caber, rola só quando precisa */}
      <ScrollView
        style={styles.list}
        bounces={false}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        {groups.map((group) => {
          const done = group.selected === group.quantityToSell;
          return (
            <View key={group.position} style={{ gap: spacing.xs }}>
              <View style={[styles.row, { justifyContent: 'space-between' }]}>
                <AppText variant="label" weight="bold" color="textMuted" accessibilityRole="header">
                  {(POSITION_NAME[Number(group.position)] ?? group.position).toUpperCase()}
                </AppText>
                <AppText variant="label" weight="bold" color={done ? 'positive' : 'textMuted'}>
                  {done ? '✓ ' : ''}remover {group.selected}/{group.quantityToSell}
                </AppText>
              </View>
              {group.players.map((slot) => {
                const player = slot.player;
                if (!player) return null;
                const isSelected = selectedPlayersToRemove.has(player.atleta_id);
                return (
                  <Pressable
                    key={player.atleta_id}
                    onPress={() => {
                      haptics.selection();
                      onTogglePlayer(player.atleta_id);
                    }}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`Remover ${player.apelido}, C$ ${numberToString(player.preco_num)}`}
                    android_ripple={{ color: colors.border }}
                    style={({ pressed }) => [
                      styles.row,
                      {
                        gap: spacing.sm,
                        minHeight: minTouch + 8,
                        paddingHorizontal: spacing.sm,
                        borderRadius: radius.md,
                        borderWidth: 1.5,
                        borderColor: isSelected ? colors.negative : 'transparent',
                        backgroundColor: isSelected ? colors.negativeContainer : colors.surface,
                        opacity: pressed ? 0.85 : 1,
                        overflow: 'hidden',
                      },
                    ]}>
                    <Image
                      source={{ uri: player.foto?.replace('FORMATO', '80x80') }}
                      style={[styles.photo, { backgroundColor: colors.surfaceAlt }]}
                    />
                    <View style={{ flex: 1 }}>
                      <AppText variant="body" weight="bold" numberOfLines={1}>
                        {player.apelido}
                      </AppText>
                      <AppText variant="label" color="textMuted">
                        C$ {numberToString(player.preco_num)}
                      </AppText>
                    </View>
                    <View
                      style={[
                        styles.center,
                        styles.check,
                        {
                          borderColor: isSelected ? colors.negative : colors.border,
                          backgroundColor: isSelected ? colors.negativeFill : 'transparent',
                        },
                      ]}>
                      {isSelected ? (
                        <Feather name="minus" size={14} color={colors.onNegativeFill} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      {/* Rodapé fixo */}
      <View
        style={[
          styles.row,
          {
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
            paddingTop: spacing.sm,
            paddingBottom: spacing.md,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
          },
        ]}>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          android_ripple={{ color: colors.border }}
          style={({ pressed }) => [
            styles.button,
            {
              minHeight: minTouch,
              borderRadius: radius.full,
              backgroundColor: colors.surfaceAlt,
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <AppText variant="body" weight="bold">
            Cancelar
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => {
            onConfirm();
            onClose?.();
          }}
          disabled={!isReady}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isReady }}
          accessibilityLabel={
            isReady ? 'Confirmar troca de formação' : `Selecione ${required} jogadores para remover`
          }
          android_ripple={{ color: colors.border }}
          style={({ pressed }) => [
            styles.button,
            {
              flex: 1.4,
              minHeight: minTouch,
              borderRadius: radius.full,
              backgroundColor: isReady ? colors.accentFill : colors.disabledFill,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          <AppText variant="body" weight="bold" color={isReady ? 'onAccentFill' : 'onDisabledFill'}>
            {isReady ? 'Confirmar' : `Remover ${selectedPlayersToRemove.size}/${required}`}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};

FormationChangeModal.displayName = 'FormationChangeModal';

const styles = StyleSheet.create({
  // Encolhe dentro do sheet (altura máxima 90%) em vez de forçar uma altura fixa
  root: {
    flexShrink: 1,
  },
  list: {
    flexGrow: 0,
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
