import { useSyncExternalStore } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';

export type AppAlertButton = {
  text: string;
  /** Mesmo significado do Alert nativo: cancel (neutro), destructive (vermelho), default (laranja) */
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

type AlertRequest = {
  id: number;
  title: string;
  message?: string;
  buttons: AppAlertButton[];
};

// Fila global: dá para chamar de qualquer lugar (inclusive helpers fora de componentes),
// como o Alert nativo. Um alerta por vez; os seguintes esperam.
let queue: AlertRequest[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getCurrent = () => queue[0];

/**
 * Alerta do app, no lugar do `Alert.alert` do sistema. Mesma assinatura, então a troca é
 * direta: `appAlert('Título', 'Mensagem', [{ text: 'Cancelar', style: 'cancel' }, ...])`.
 * Sem botões, mostra um "Ok".
 */
export function appAlert(title: string, message?: string, buttons?: AppAlertButton[]) {
  queue = [
    ...queue,
    {
      id: nextId++,
      title,
      message,
      buttons: buttons?.length ? buttons : [{ text: 'Ok', style: 'cancel' }],
    },
  ];
  emit();
}

const dismiss = (id: number) => {
  queue = queue.filter((request) => request.id !== id);
  emit();
};

/** Montado uma vez na raiz do app; desenha o alerta atual da fila. */
export function AppAlertHost() {
  const { colors, spacing, radius, minTouch } = useTokens();
  const current = useSyncExternalStore(subscribe, getCurrent, getCurrent);

  if (!current) return null;

  const press = (button?: AppAlertButton) => {
    dismiss(current.id);
    button?.onPress?.();
  };

  // Voltar do Android e toque fora equivalem a "cancelar" (só se existir essa opção).
  const cancelButton = current.buttons.find((button) => button.style === 'cancel');
  const stacked = current.buttons.length > 2;

  const buttonStyle = (style: AppAlertButton['style']) =>
    style === 'destructive'
      ? { bg: colors.negativeFill, fg: 'onNegativeFill' as const }
      : style === 'cancel'
        ? { bg: colors.surfaceAlt, fg: 'text' as const }
        : { bg: colors.accentFill, fg: 'onAccentFill' as const };

  return (
    <Modal
      transparent
      visible
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => (cancelButton ? press(cancelButton) : undefined)}>
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={cancelButton ? () => press(cancelButton) : undefined}
          accessible={false}
        />
        <View
          accessibilityRole="alert"
          accessibilityViewIsModal
          style={[
            styles.card,
            {
              gap: spacing.md,
              padding: spacing.lg,
              borderRadius: radius.lg,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="heading" weight="bold" accessibilityRole="header">
              {current.title}
            </AppText>
            {current.message ? (
              <AppText variant="body" color="textMuted">
                {current.message}
              </AppText>
            ) : null}
          </View>

          <View style={{ flexDirection: stacked ? 'column' : 'row', gap: spacing.xs }}>
            {current.buttons.map((button) => {
              const tone = buttonStyle(button.style);
              return (
                <Pressable
                  key={button.text}
                  onPress={() => press(button)}
                  accessibilityRole="button"
                  android_ripple={{ color: colors.border }}
                  style={({ pressed }) => [
                    styles.button,
                    {
                      flex: stacked ? undefined : 1,
                      minHeight: minTouch,
                      borderRadius: radius.full,
                      backgroundColor: tone.bg,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}>
                  <AppText variant="body" weight="bold" color={tone.fg} numberOfLines={1}>
                    {button.text}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Sem escurecer o fundo (mesmo padrão dos sheets); a sombra destaca o cartão.
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 24,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
});
