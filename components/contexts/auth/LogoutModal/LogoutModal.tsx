import { useContext } from "react";
import WebView, { WebViewMessageEvent } from "react-native-webview";

import { INJECT_AUTH_LOGOUT } from "@/constants/Generic";
import { ACCESS_TOKEN_KEY_STORAGE } from "@/constants/Keys";
import { URL_AUTH, URL_HOME } from "@/constants/Urls";
import { AuthContext } from "@/contexts/Auth.context";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { Modal, SafeAreaView } from "react-native";

type ModalLogoutProps = {
  isVisible: boolean;
  handleLogoutSuccess: () => void;
};

export function ModalLogout({
  isVisible,
  handleLogoutSuccess,
}: ModalLogoutProps) {
  const { removeItem } = useAsyncStorage(ACCESS_TOKEN_KEY_STORAGE);

  const { handleUnautenticated } = useContext(AuthContext);

  async function handleWebViewMessage(event: WebViewMessageEvent) {
    await removeItem();
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <Modal visible={isVisible}>
        <WebView
          source={{
            uri: URL_HOME,
          }}
          className="rounded-lg"
          injectedJavaScript={INJECT_AUTH_LOGOUT}
          onMessage={handleWebViewMessage}
          onNavigationStateChange={(event) => {
            if (event.url.startsWith(URL_AUTH)) {
              handleUnautenticated();
              handleLogoutSuccess();
            }
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}
