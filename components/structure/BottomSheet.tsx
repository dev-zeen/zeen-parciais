import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTokens } from '@/hooks/useTokens';

type BottomSheetProps = {
  children: React.ReactNode;
  /** Mantido por compatibilidade; a altura é definida pela plataforma. */
  snapPoints?: string[];
  enablePanDownToClose?: boolean;
  /** Chamado assim que o fechamento é pedido (botão, gesto ou toque fora). */
  onClose?: () => void;
  /**
   * Chamado quando o sheet terminou de sair da tela. No iOS um modal novo só pode
   * ser apresentado depois disso; no Android é chamado junto com `onClose`.
   */
  onDismissed?: () => void;
  /**
   * `compact`: painel com a altura do conteúdo (até 90%) nas duas plataformas, para menus
   * curtos. `large` (padrão): sheet de página inteira no iOS e 90% no Android.
   */
  size?: 'large' | 'compact';
};

export type BottomSheetRef = {
  snapToIndex: (index: number) => void;
  close: () => void;
};

/**
 * iOS: sheet nativo do sistema (pageSheet), com gesto de arrastar para fechar e o
 * material da versão do iOS em uso.
 * Android: painel inferior com alça, fechado pelo botão/gesto de voltar ou toque fora.
 */
export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  ({ children, onClose, onDismissed, size = 'large' }, ref) => {
    const { colors, radius } = useTokens();
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);

    const handleClose = useCallback(() => {
      setVisible(false);
      if (onClose) onClose();
      // Android não tem evento de fim de fechamento.
      if (Platform.OS !== 'ios' && onDismissed) onDismissed();
    }, [onClose, onDismissed]);

    useImperativeHandle(ref, () => ({
      snapToIndex: (index: number) => {
        if (index >= 0) {
          setVisible(true);
        }
      },
      close: handleClose,
    }));

    const handle = (
      <View style={styles.handleArea}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
      </View>
    );

    if (Platform.OS === 'ios' && size === 'large') {
      return (
        <Modal
          animationType="slide"
          presentationStyle="pageSheet"
          visible={visible}
          onRequestClose={handleClose}
          onDismiss={onDismissed}>
          <View style={[styles.page, { backgroundColor: colors.bg }]}>
            {handle}
            {children}
          </View>
        </Modal>
      );
    }

    return (
      <Modal
        animationType="slide"
        transparent
        visible={visible}
        statusBarTranslucent
        onRequestClose={handleClose}
        onDismiss={onDismissed}>
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
          />
          <View
            style={[
              size === 'compact' ? styles.compact : styles.container,
              {
                backgroundColor: colors.bg,
                borderTopLeftRadius: radius.lg,
                borderTopRightRadius: radius.lg,
                // Sem escurecer o fundo: a borda e a sombra separam o painel da tela.
                borderColor: colors.border,
                paddingBottom: insets.bottom,
              },
            ]}>
            {handle}
            {children}
          </View>
        </View>
      </Modal>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: '90%',
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  compact: {
    maxHeight: '90%',
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
});
