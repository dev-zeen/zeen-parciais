import { useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { Modal } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { INJECT_AUTH_LOGOUT_IOS } from '@/constants/Generic';
import { URL_AUTH, URL_HOME } from '@/constants/Urls';
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
    resetStore();
    queryClient.clear();
    handleUnautenticated();
    handleLogoutSuccess();
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
          injectedJavaScript={INJECT_AUTH_LOGOUT_IOS}
          onMessage={handleWebViewMessage}
          onNavigationStateChange={(event: any) => {
            if (event.url === URL_AUTH) {
              handleWebViewMessage();
            }
          }}
        />
      </Modal>
    </SafeAreaViewContainer>
  );
}
