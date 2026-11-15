import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';

export type SaveBlocker = {
  /** Por que não dá para salvar agora */
  message: string;
  tone: 'neutral' | 'warning' | 'negative';
};

type TeamSaveBarProps = {
  /** undefined = pode salvar */
  blocker?: SaveBlocker;
  isSaving?: boolean;
  onSave: () => void;
  /** Altura da barra de abas que flutua sobre a tela (iOS), para a barra ficar acima dela */
  bottomOffset?: number;
};

type GetSaveBlockerParams = {
  emptySlots: number;
  balance: number;
  hasCaptain: boolean;
  hasChanges: boolean;
};

/** Primeiro motivo que impede salvar, na ordem em que o usuário precisa resolver. */
export function getSaveBlocker({
  emptySlots,
  balance,
  hasCaptain,
  hasChanges,
}: GetSaveBlockerParams): SaveBlocker | undefined {
  if (emptySlots > 0) {
    return {
      message: emptySlots === 1 ? 'Falta 1 jogador' : `Faltam ${emptySlots} jogadores`,
      tone: 'warning',
    };
  }
  if (balance < 0) return { message: 'Saldo insuficiente', tone: 'negative' };
  if (!hasCaptain) return { message: 'Escolha o capitão', tone: 'warning' };
  if (!hasChanges) return { message: 'Sem alterações para salvar', tone: 'neutral' };
  return undefined;
}

export function TeamSaveBar({
  blocker,
  isSaving = false,
  onSave,
  bottomOffset = 0,
}: TeamSaveBarProps) {
  const { colors, spacing, radius, minTouch } = useTokens();

  const disabled = !!blocker || isSaving;
  const toneColor = { neutral: 'textMuted', warning: 'warning', negative: 'negative' } as const;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          gap: spacing.sm,
          marginBottom: bottomOffset,
        },
      ]}>
      <View style={{ flex: 1 }} accessibilityLiveRegion="polite">
        {blocker ? (
          <View style={styles.message}>
            <Feather
              name={blocker.tone === 'neutral' ? 'check-circle' : 'alert-circle'}
              size={16}
              color={colors[toneColor[blocker.tone]]}
            />
            <AppText
              variant="body"
              weight="medium"
              color={toneColor[blocker.tone]}
              style={{ flex: 1 }}>
              {blocker.message}
            </AppText>
          </View>
        ) : (
          <AppText variant="body" weight="medium">
            Escalação pronta
          </AppText>
        )}
      </View>

      <Pressable
        onPress={onSave}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Salvar escalação"
        accessibilityHint={blocker?.message}
        accessibilityState={{ disabled, busy: isSaving }}
        android_ripple={{ color: colors.border }}
        style={({ pressed }) => [
          styles.button,
          {
            minHeight: minTouch,
            borderRadius: radius.full,
            backgroundColor: blocker ? colors.disabledFill : colors.positiveFill,
            opacity: pressed ? 0.8 : 1,
          },
        ]}>
        {isSaving ? (
          <ActivityIndicator size="small" color={colors.onPositiveFill} />
        ) : (
          <AppText
            variant="body"
            weight="bold"
            color={blocker ? 'onDisabledFill' : 'onPositiveFill'}>
            Salvar escalação
          </AppText>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  button: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
