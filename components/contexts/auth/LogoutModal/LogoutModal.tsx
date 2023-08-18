import { useContext } from "react";
import { Modal } from "react-native";

import WebView, { WebViewMessageEvent } from "react-native-webview";

import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { INJECT_AUTH_LOGOUT } from "@/constants/Generic";
import { URL_HOME } from "@/constants/Urls";
import { AuthContext } from "@/contexts/Auth.context";

type LogoutModalProps = {
  isVisible: boolean;
  handleLogoutSuccess: () => void;
};

export function LogoutModal({
  isVisible,
  handleLogoutSuccess,
}: LogoutModalProps) {
  const { handleUnautenticated } = useContext(AuthContext);

  async function handleWebViewMessage(event?: WebViewMessageEvent) {
    handleUnautenticated();
  }

  return (
    <SafeAreaViewContainer>
      <Modal visible={isVisible}>
        <WebView
          incognito
          source={{
            uri: URL_HOME,
          }}
          className="rounded-lg"
          injectedJavaScript={INJECT_AUTH_LOGOUT}
          onMessage={(event) => handleWebViewMessage(event)}
          onNavigationStateChange={(event) => {
            handleLogoutSuccess();
            handleWebViewMessage();
          }}
        />
      </Modal>
    </SafeAreaViewContainer>
  );
}
