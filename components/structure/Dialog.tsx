import { View } from "@/components/Themed";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import Dialog from "react-native-dialog";

type DialogComponentProps = {
  title?: string;
  subtitile?: string;
  isVisible: boolean;
  buttonPrimaryLabel?: string;
  buttonCancelLabel?: string;
  onPressConfirm: () => void;
  onPressCancel?: () => void;
};

export function DialogComponent({
  title,
  subtitile,
  isVisible,
  buttonPrimaryLabel = "OK",
  buttonCancelLabel,
  onPressConfirm,
  onPressCancel,
}: DialogComponentProps) {
  const [visible, setVisible] = useState(isVisible);

  const handleConfirm = () => {
    onPressConfirm();
  };

  const handleCancel = () => {
    setVisible(false);
    onPressCancel && onPressCancel();
  };

  return (
    <View style={styles.container}>
      <Dialog.Container visible={visible}>
        {title && <Dialog.Title>{title}</Dialog.Title>}
        {subtitile && (
          <Dialog.Description style={styles.subtitle}>
            {subtitile}
          </Dialog.Description>
        )}
        <Dialog.Button label={buttonPrimaryLabel} onPress={handleConfirm} />
        {buttonCancelLabel && (
          <Dialog.Button label={buttonCancelLabel} onPress={handleCancel} />
        )}
      </Dialog.Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 16,
  },
});
