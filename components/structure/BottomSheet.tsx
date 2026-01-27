import { forwardRef, useImperativeHandle, useState } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';

import Colors from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

type BottomSheetProps = {
  children: React.ReactNode;
  snapPoints?: string[];
  enablePanDownToClose?: boolean;
  onClose?: () => void;
};

export type BottomSheetRef = {
  snapToIndex: (index: number) => void;
  close: () => void;
};

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  ({ children, onClose }, ref) => {
    const colorTheme = useThemeColor();
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      snapToIndex: (index: number) => {
        if (index >= 0) {
          setVisible(true);
        }
      },
      close: () => {
        setVisible(false);
        if (onClose) onClose();
      },
    }));

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        statusBarTranslucent={false}
        onRequestClose={() => {
          setVisible(false);
          if (onClose) onClose();
        }}>
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setVisible(false);
            if (onClose) onClose();
          }}>
          <Pressable
            style={[
              styles.container,
              {
                backgroundColor:
                  colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
              },
            ]}
            onPress={(e) => e.stopPropagation()}>
            {children}
          </Pressable>
        </Pressable>
      </Modal>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
});
