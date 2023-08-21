import { useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { Modal } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { INJECT_AUTH_LOGOUT } from '@/constants/Generic';
import { URL_HOME } from '@/constants/Urls';
import { AuthContext } from '@/contexts/Auth.context';
import useTeamLineupStore from '@/store/useTeamLineupStore';

type LogoutModalProps = {
  isVisible: boolean;
  handleLogoutSuccess: () => void;
};

export function LogoutModal({ isVisible, handleLogoutSuccess }: LogoutModalProps) {
  const queryClient = useQueryClient();

  const resetStore = useTeamLineupStore((state) => state.reset);

  const { handleUnautenticated } = useContext(AuthContext);

  async function handleWebViewMessage(event?: WebViewMessageEvent) {
    try {
      resetStore();
      queryClient.clear();
      handleUnautenticated();
    } catch (err) {
      console.error(err);
    }
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
            queryClient.clear();
          }}
        />
      </Modal>
    </SafeAreaViewContainer>
  );
}
