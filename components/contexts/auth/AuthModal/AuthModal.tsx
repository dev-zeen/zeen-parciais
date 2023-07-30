import { useContext } from "react";
import { Modal } from "react-native";

import { Feather } from "@expo/vector-icons";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import WebView, { WebViewMessageEvent } from "react-native-webview";

import { TouchableOpacity, View } from "@/components/Themed";
import { INJECT_AUTH_LOGIN } from "@/constants/Generic";
import { ACCESS_TOKEN_KEY_STORAGE } from "@/constants/Keys";
import { URL_AUTH, URL_HOME } from "@/constants/Urls";
import { AuthContext } from "@/contexts/Auth.context";

type ModalAuthProps = {
  isVisible: boolean;
  handleLoginSuccess: () => void;

  handleCloseModal: () => void;
};

export function ModalAuth({
  isVisible,
  handleLoginSuccess,
  handleCloseModal,
}: ModalAuthProps) {
  const { handleSuccessAuth } = useContext(AuthContext);

  const { setItem } = useAsyncStorage(ACCESS_TOKEN_KEY_STORAGE);

  async function handleWebViewMessage(event: WebViewMessageEvent) {
    const token = event.nativeEvent.data;
    await setItem(token);
    handleLoginSuccess();
  }

  return (
    <View>
      <Modal animationType="slide" transparent visible={isVisible}>
        <TouchableOpacity
          onPress={handleCloseModal}
          style={{
            position: "absolute",
            top: 80,
            left: 30,
            zIndex: 9999,
          }}
        >
          <Feather name="x" size={30} color={"black"} />
        </TouchableOpacity>
        <WebView
          source={{
            uri: URL_AUTH,
          }}
          className="rounded-lg mx-4"
          injectedJavaScript={INJECT_AUTH_LOGIN}
          onMessage={handleWebViewMessage}
          onNavigationStateChange={(event: any) => {
            if (event.url.startsWith(URL_HOME)) {
              handleSuccessAuth();
            }
          }}
        />
      </Modal>
    </View>
  );
}
