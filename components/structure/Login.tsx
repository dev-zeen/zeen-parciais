import { useContext, useState } from "react";
import { Image, Modal, useColorScheme } from "react-native";

import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import WebView, { WebViewMessageEvent } from "react-native-webview";

import enterImage from "@/assets/images/enter.png";
import { Text, TouchableOpacity, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { INJECT_AUTH_LOGIN } from "@/constants/Generic";
import { ACCESS_TOKEN_KEY_STORAGE } from "@/constants/Keys";
import { URL_AUTH, URL_HOME } from "@/constants/Urls";
import { AuthContext } from "@/contexts/Auth.context";
import { Feather } from "@expo/vector-icons";

type LoginProps = {
  title?: string;
};

export function Login({ title }: LoginProps) {
  const colorTheme = useColorScheme();

  const { handleSuccessAuth, handleUnautenticated } = useContext(AuthContext);

  const { setItem } = useAsyncStorage(ACCESS_TOKEN_KEY_STORAGE);

  const [showModalAuth, setShowModalAuth] = useState(false);

  function handleGetLoginPage() {
    setShowModalAuth(true);
  }

  async function handleWebViewMessage(event: WebViewMessageEvent) {
    const token = event.nativeEvent.data;
    await setItem(token);
    if (token) handleSuccessAuth();
  }

  return (
    <>
      <View className="flex-1 items-center justify-center p-4 rounded-lg">
        {title && (
          <View
            className="flex-row mt-8 mx-8 p-4"
            style={{
              gap: 4,
            }}
          >
            <Feather name="info" size={24} color={Colors.light.tint} />
            <Text className="text-sm font-semibold text-center">{title}</Text>
          </View>
        )}

        <Image
          source={enterImage}
          className="w-56 h-56"
          alt={`Imagem de Login`}
        />
        <TouchableOpacity
          onPress={handleGetLoginPage}
          activeOpacity={0.6}
          className="flex-row items-center justify-center px-4 py-3 bg-blue-500 rounded-lg"
          style={{
            gap: 8,
          }}
        >
          <Feather name="log-in" size={24} color={Colors.light.background} />
          <Text className="text-white"> Entrar no Cartola </Text>
        </TouchableOpacity>
      </View>

      {showModalAuth && (
        <View className="items-center justify-center m-32">
          <Modal
            animationType="slide"
            transparent
            visible={showModalAuth}
            style={{
              flex: 1,
            }}
          >
            <TouchableOpacity
              className="rounded-full"
              onPress={() => {
                setShowModalAuth(false);
              }}
              style={{
                position: "absolute",
                top: 80,
                left: 30,
                zIndex: 9999,
                backgroundColor:
                  colorTheme === "dark" ? Colors.light.tint : Colors.dark.tint,
              }}
            >
              <Feather
                name="x"
                size={30}
                color={
                  colorTheme === "dark" ? Colors.dark.tint : Colors.light.tint
                }
              />
            </TouchableOpacity>

            <WebView
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
              source={{
                uri: URL_AUTH,
              }}
              incognito
              className="rounded-lg"
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
      )}
    </>
  );
}
