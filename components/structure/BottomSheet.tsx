import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTokens } from '@/hooks/useTokens';

type BottomSheetProps = {
  children: React.ReactNode;
  /** Mantido por compatibilidade; a altura é definida pela plataforma. */
  snapPoints?: string[];
  enablePanDownToClose?: boolean;
  onClose?: () => void;
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
  ({ children, onClose }, ref) => {
    const { colors, radius } = useTokens();
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);

    const handleClose = useCallback(() => {
      setVisible(false);
      if (onClose) onClose();
    }, [onClose]);

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

    if (Platform.OS === 'ios') {
      return (
        <Modal
          animationType="slide"
          presentationStyle="pageSheet"
          visible={visible}
          onRequestClose={handleClose}>
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
        onRequestClose={handleClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
          />
          <View
            style={[
              styles.container,
              {
                backgroundColor: colors.bg,
                borderTopLeftRadius: radius.lg,
                borderTopRightRadius: radius.lg,
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
    overflow: 'hidden',
    elevation: 6,
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
