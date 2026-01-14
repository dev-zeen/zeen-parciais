import { Feather } from '@expo/vector-icons';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useRef, useState } from 'react';
import { Image, Modal, Platform, useColorScheme } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

import enterImage from '@/assets/images/auth.png';
import { Text, TouchableOpacity, View } from '@/components/Themed';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import { EXPO_PUBLIC_AUTH_URL } from '@/constants/Endpoits';
import { ACCESS_TOKEN_KEY_STORAGE } from '@/constants/Keys';
import { AuthContext } from '@/contexts/Auth.context';
import { fetchGloboidClientSettings } from '@/lib/core/auth';

const INJECT_AUTH_LOGIN = `
  (function() {
    let tokenSent = false;
    const TOKEN_KEY = 'globoid-tokens-cartola-web@apps.globoid';
    
    function checkAndSendToken() {
      // Se já enviou o token, não faz nada
      if (tokenSent) {
        return;
      }
      
      try {
        const tokenData = window.localStorage.getItem(TOKEN_KEY);
        
        if (tokenData && tokenData.trim() !== '') {
          console.log('🔑 Token data encontrado, fazendo parse...');
          
          // Parse do JSON
          const tokenObject = JSON.parse(tokenData);
          
          // Extrai o objeto completo com tokens
          if (tokenObject && tokenObject.access_token && tokenObject.refresh_token) {
            console.log('✅ Tokens extraídos, enviando para React Native');
            tokenSent = true;
            
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              type: 'AUTH_TOKEN', 
              tokens: {
                access_token: tokenObject.access_token,
                refresh_token: tokenObject.refresh_token,
                id_token: tokenObject.id_token
              }
            }));
            
            // Limpa o localStorage
            window.localStorage.clear();
            return;
          } else {
            console.log('⚠️ Token object não contém access_token');
          }
        }
      } catch (error) {
        console.log('❌ Erro ao processar token:', error);
      }
      
      // Continua verificando indefinidamente até encontrar o token
      setTimeout(checkAndSendToken, 500);
    }
    
    // Inicia verificação após pequeno delay
    setTimeout(checkAndSendToken, 1000);
    
    // Também monitora mudanças no localStorage
    window.addEventListener('storage', function(e) {
      if (e.key === TOKEN_KEY && e.newValue && !tokenSent) {
        try {
          console.log('🔔 Token detectado via storage event');
          const tokenObject = JSON.parse(e.newValue);
          
          if (tokenObject && tokenObject.access_token && tokenObject.refresh_token) {
            console.log('✅ Tokens extraídos via storage event');
            tokenSent = true;
            
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              type: 'AUTH_TOKEN', 
              tokens: {
                access_token: tokenObject.access_token,
                refresh_token: tokenObject.refresh_token,
                id_token: tokenObject.id_token
              }
            }));
            
            window.localStorage.clear();
          }
        } catch (error) {
          console.log('❌ Erro ao processar storage event:', error);
        }
      }
    });
  })();
`;

type LoginProps = {
  title?: string;
};

export function Login({ title }: LoginProps) {
  const colorTheme = useColorScheme();

  const { handleSuccessAuth } = useContext(AuthContext);

  const { setItem } = useAsyncStorage(ACCESS_TOKEN_KEY_STORAGE);

  const [showModalAuth, setShowModalAuth] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleGetLoginPage() {
    setShowModalAuth(true);
  }

  function handleCloseModal() {
    // Limpa o timeout ao fechar manualmente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowModalAuth(false);
  }

  // Timeout de segurança: fecha a modal após 10 minutos se não receber resposta
  useEffect(() => {
    if (showModalAuth) {
      timeoutRef.current = setTimeout(() => {
        console.log('⏱️ Login timeout - fechando modal');
        setShowModalAuth(false);
      }, 10 * 60 * 1000); // 10 minutos
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showModalAuth]);

  async function handleWebViewMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'AUTH_TOKEN' && data.tokens) {
        console.log('✅ Tokens recebidos com sucesso');
        
        // Salva o objeto completo de tokens como JSON string
        await setItem(JSON.stringify(data.tokens));
        
        // Busca as configurações do cliente Globoid
        console.log('🔍 Buscando configurações do cliente Globoid...');
        await fetchGloboidClientSettings();
        
        // Limpa o timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Atualiza o estado de autenticação
        handleSuccessAuth();
        
        // Fecha a modal
        setShowModalAuth(false);
      }
    } catch {
      // Fallback para formato antigo (se vier string pura)
      const token = event.nativeEvent.data;
      if (token && typeof token === 'string' && token.trim() !== '' && !token.startsWith('{')) {
        console.log('✅ Token recebido (formato legado)');
        
        // Salva o token
        await setItem(token);
        
        // Limpa o timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Atualiza o estado de autenticação
        handleSuccessAuth();
        
        // Fecha a modal
        setShowModalAuth(false);
      }
    }
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
                onPress={handleCloseModal}
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
                onLoadStart={() => {
                  console.log('🌐 WebView iniciando carregamento');
                }}
                onLoadEnd={() => {
                  console.log('✅ WebView carregada - aguardando login');
                }}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('❌ WebView error: ', nativeEvent);
                }}
                javaScriptEnabled
                domStorageEnabled
                sharedCookiesEnabled={false}
                cacheEnabled={false}
              />
            </Modal>
          </View>
        </SafeAreaViewContainer>
      )}
    </>
  );
}
