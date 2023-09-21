import { Feather } from '@expo/vector-icons';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useContext, useState } from 'react';
import { Image, Modal, Platform, useColorScheme } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

import enterImage from '@/assets/images/auth.png';
import { Text, TouchableOpacity, View } from '@/components/Themed';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import { EXPO_PUBLIC_AUTH_URL } from '@/constants/Endpoits';
import { ACCESS_TOKEN_KEY_STORAGE } from '@/constants/Keys';
import { AuthContext } from '@/contexts/Auth.context';

const INJECT_AUTH_LOGIN = `
  function getToken() {
    var token = window.localStorage.getItem('at');
    if (token) {
      window.postMessage(token)
      window.ReactNativeWebView.postMessage(token)
      window.localStorage.clear()
    }
  } 
  getToken() 
`;

type LoginProps = {
  title?: string;
};

export function Login({ title }: LoginProps) {
  const colorTheme = useColorScheme();

  const { handleSuccessAuth } = useContext(AuthContext);

  const { setItem } = useAsyncStorage(ACCESS_TOKEN_KEY_STORAGE);

  const [showModalAuth, setShowModalAuth] = useState(false);

  function handleGetLoginPage() {
    setShowModalAuth(true);
  }

  async function handleWebViewMessage(event: WebViewMessageEvent) {
    const token = event.nativeEvent.data;
    await setItem(token);
    if (token) {
      handleSuccessAuth();
      setShowModalAuth(false);
    }
    // TODO ADICIONAR ALERT PARA QUANDO DER ERRO NO LOGIN
  }

  return (
    <>
      <View className="flex-1 items-center justify-center p-4 rounded-lg">
        {title && (
          <View
            className="flex-row mt-8 mx-8 p-4"
            style={{
              gap: 4,
            }}>
            <Feather name="info" size={24} color={Colors.light.tint} />
            <Text className="text-sm font-semibold text-center">{title}</Text>
          </View>
        )}

        <Image source={enterImage} className="w-56 h-56" alt="Imagem de Login" />
        <TouchableOpacity
          onPress={handleGetLoginPage}
          activeOpacity={0.6}
          className="flex-row items-center justify-center px-4 py-3 bg-blue-500 rounded-lg"
          style={{
            gap: 8,
          }}>
          <Feather name="log-in" size={24} color={Colors.light.background} />
          <Text className="text-white"> Entrar </Text>
        </TouchableOpacity>
      </View>

      {showModalAuth && (
        <SafeAreaViewContainer>
          <View className="items-center justify-center m-32">
            <Modal
              animationType="slide"
              transparent
              visible={showModalAuth}
              style={{
                flex: 1,
              }}>
              <TouchableOpacity
                activeOpacity={0.6}
                className="rounded-full p-1"
                onPress={() => {
                  setShowModalAuth(false);
                }}
                style={{
                  position: 'absolute',
                  top: Platform.OS === 'ios' ? 75 : 30,
                  left: 10,
                  zIndex: 9999,
                  backgroundColor: colorTheme === 'dark' ? Colors.light.tint : Colors.dark.tint,
                }}>
                <Feather name="x" size={48} />
              </TouchableOpacity>

              <WebView
                style={
                  Platform.OS === 'ios'
                    ? {
                        marginTop: 60,
                      }
                    : {}
                }
                source={{
                  uri: EXPO_PUBLIC_AUTH_URL,
                }}
                incognito
                className="rounded-lg"
                injectedJavaScript={INJECT_AUTH_LOGIN}
                onMessage={(e) => handleWebViewMessage(e)}
              />
            </Modal>
          </View>
        </SafeAreaViewContainer>
      )}
    </>
  );
}
