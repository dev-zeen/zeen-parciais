import { forwardRef, useImperativeHandle, useState } from 'react';
import { Modal } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

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

    if (!visible) return null;

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        presentationStyle="fullScreen"
        statusBarTranslucent={false}
        onRequestClose={() => {
          setVisible(false);
          if (onClose) onClose();
        }}>
        <SafeAreaProvider>
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor:
                colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
            }}
            edges={['top', 'bottom']}>
            {children}
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';
