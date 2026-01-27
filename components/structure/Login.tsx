import { Feather } from '@expo/vector-icons';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Modal, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

import enterImage from '@/assets/images/auth.png';
import { Text, TouchableOpacity, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { EXPO_PUBLIC_AUTH_URL } from '@/constants/Endpoits';
import { ACCESS_TOKEN_KEY_STORAGE } from '@/constants/Keys';
import { AuthContext } from '@/contexts/Auth.context';
import { useThemeColor } from '@/hooks/useThemeColor';
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

// Feature cards data
const FEATURES = [
  {
    icon: 'activity',
    title: 'Parciais em Tempo Real',
    description:
      'Acompanhe a pontuação dos seus jogadores ao vivo durante as rodadas do Cartola FC',
  },
  {
    icon: 'users',
    title: 'Escale seu time no Cartola FC',
    description:
      'Escolha seus jogadores, troque capitão e veja o desempenho do seu time em tempo real',
  },
  {
    icon: 'award',
    title: 'Gerencie suas ligas no Cartola FC',
    description: 'Participe de ligas clássicas, mata-mata e pontos corridos com amigos',
  },
];

export function Login({ title }: LoginProps) {
  const colorTheme = useThemeColor();
  const isDark = colorTheme === 'dark';
  const insets = useSafeAreaInsets();

  const { handleSuccessAuth } = useContext(AuthContext);
  const { setItem } = useAsyncStorage(ACCESS_TOKEN_KEY_STORAGE);

  const [showModalAuth, setShowModalAuth] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Inicia animações ao montar o componente
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleGetLoginPage() {
    setShowModalAuth(true);
    setWebViewLoading(true);
  }

  function handleCloseModal() {
    // Limpa o timeout ao fechar manualmente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowModalAuth(false);
    setIsAuthenticating(false);
    setWebViewLoading(true);
  }

  // Timeout de segurança: fecha a modal após 10 minutos se não receber resposta
  useEffect(() => {
    if (showModalAuth) {
      timeoutRef.current = setTimeout(
        () => {
          console.log('⏱️ Login timeout - fechando modal');
          setShowModalAuth(false);
        },
        10 * 60 * 1000
      ) as any; // 10 minutos
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showModalAuth]);

  async function handleWebViewMessage(event: WebViewMessageEvent) {
    setIsAuthenticating(true);

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

        // Pequeno delay para feedback visual
        setTimeout(() => {
          // Atualiza o estado de autenticação
          handleSuccessAuth();

          // Fecha a modal
          setShowModalAuth(false);
          setIsAuthenticating(false);
        }, 500);
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

        // Pequeno delay para feedback visual
        setTimeout(() => {
          // Atualiza o estado de autenticação
          handleSuccessAuth();

          // Fecha a modal
          setShowModalAuth(false);
          setIsAuthenticating(false);
        }, 500);
      }
    }
  }

  return (
    <>
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}>
          {/* Hero Section com Animação - Compacto */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="items-center mb-6">
            {/* Logo/Imagem - Menor */}
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
              }}>
              <Image
                source={enterImage}
                style={{
                  width: 120,
                  height: 120,
                  resizeMode: 'contain',
                  marginBottom: 16,
                }}
                alt="Parciais FC"
              />
            </Animated.View>

            {/* Título Principal */}
            <Text
              className="text-2xl font-bold text-center mb-2"
              style={{
                fontFamily: 'Nunito_800ExtraBold',
              }}>
              Bem-vindo ao Parciais FC
            </Text>

            {/* Subtítulo */}
            <Text
              className="text-sm text-center opacity-70 px-4"
              style={{
                fontFamily: 'Nunito_400Regular',
                lineHeight: 20,
              }}>
              Acompanhamento em tempo real do Cartola FC
            </Text>
          </Animated.View>

          {/* Botão de Login Principal - TOPO */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="mb-6">
            <TouchableOpacity
              onPress={handleGetLoginPage}
              activeOpacity={0.8}
              disabled={isAuthenticating}
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: Colors.light.tint,
                shadowColor: Colors.light.tint,
                shadowOffset: {
                  width: 0,
                  height: 8,
                },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}>
              <View
                className="flex-row items-center justify-center py-4 px-6"
                style={{
                  backgroundColor: Colors.light.tint,
                  gap: 12,
                }}>
                {isAuthenticating ? (
                  <ActivityIndicator color={Colors.light.background} size="small" />
                ) : (
                  <Feather name="log-in" size={22} color={Colors.light.background} />
                )}
                <Text
                  className="text-base font-bold"
                  style={{
                    color: Colors.light.background,
                    fontFamily: 'Nunito_700Bold',
                  }}>
                  {isAuthenticating ? 'Autenticando...' : 'Entrar com Cartola FC'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Texto de Segurança */}
            <View
              className="flex-row items-center justify-center mt-3 px-4"
              style={{
                gap: 6,
              }}>
              <Feather
                name="shield"
                size={12}
                color={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
              />
              <Text
                className="text-xs text-center opacity-50"
                style={{
                  fontFamily: 'Nunito_400Regular',
                }}>
                Login seguro via Globo ID • Cartola FC Oficial
              </Text>
            </View>
          </Animated.View>

          {/* Alert Info (se houver) */}
          {title && (
            <Animated.View
              className="mb-4 p-3 rounded-xl"
              style={{
                opacity: fadeAnim,
                backgroundColor: isDark ? 'rgba(66, 153, 225, 0.15)' : 'rgba(66, 153, 225, 0.1)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(66, 153, 225, 0.3)' : 'rgba(66, 153, 225, 0.2)',
              }}>
              <View
                className="flex-row items-start"
                style={{
                  gap: 10,
                  backgroundColor: 'transparent',
                }}>
                <Feather name="info" size={16} color={Colors.light.tint} />
                <Text
                  className="flex-1 text-xs"
                  style={{
                    fontFamily: 'Nunito_500Medium',
                    lineHeight: 18,
                  }}>
                  {title}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Divider */}
          <View
            className="flex-row items-center my-4"
            style={{
              gap: 12,
            }}>
            <View
              className="flex-1 h-px"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }}
            />
            <Text
              className="text-xs opacity-50"
              style={{
                fontFamily: 'Nunito_600SemiBold',
              }}>
              RECURSOS PRINCIPAIS
            </Text>
            <View
              className="flex-1 h-px"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }}
            />
          </View>

          {/* Feature Cards - Compactos */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              gap: 8,
              marginBottom: 16,
            }}>
            {FEATURES.map((feature) => (
              <View
                key={feature.title}
                className="flex-row items-center p-3 rounded-lg"
                style={{
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  gap: 12,
                }}>
                {/* Icon Container - Menor */}
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(66, 153, 225, 0.2)'
                      : 'rgba(66, 153, 225, 0.15)',
                  }}>
                  <Feather name={feature.icon as any} size={18} color={Colors.light.tint} />
                </View>

                {/* Text Content - Compacto */}
                <View className="flex-1 bg-transparent">
                  <Text
                    className="text-sm font-semibold mb-0.5"
                    style={{
                      fontFamily: 'Nunito_700Bold',
                    }}>
                    {feature.title}
                  </Text>
                  <Text
                    className="text-xs opacity-70"
                    style={{
                      fontFamily: 'Nunito_400Regular',
                      lineHeight: 16,
                    }}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      </View>

      {/* Modal de Autenticação */}
      {showModalAuth && (
        <Modal animationType="slide" visible={showModalAuth} presentationStyle="fullScreen">
          <View className="flex-1" style={{ position: 'relative' }}>
            {/* Header da Modal */}
            <View
              className="px-4 py-3 border-b"
              style={{
                paddingTop: Platform.OS === 'ios' ? insets.top + 12 : 12,
                backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
                borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View
                className="flex-row items-center"
                style={{
                  gap: 12,
                }}>
                <Feather
                  name="shield"
                  size={20}
                  color={isDark ? Colors.dark.text : Colors.light.text}
                />
                <View>
                  <Text
                    className="text-base font-bold"
                    style={{
                      fontFamily: 'Nunito_700Bold',
                    }}>
                    Login Seguro
                  </Text>
                  <Text
                    className="text-xs opacity-60"
                    style={{
                      fontFamily: 'Nunito_400Regular',
                    }}>
                    Via Globo.com
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                className="rounded-full p-2"
                onPress={handleCloseModal}
                disabled={isAuthenticating}
                style={{
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                }}>
                <Feather name="x" size={24} color={isDark ? Colors.dark.text : Colors.light.text} />
              </TouchableOpacity>
            </View>

            {/* WebView */}
            <WebView
              style={{
                flex: 1,
                backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
              }}
              source={{
                uri: EXPO_PUBLIC_AUTH_URL,
              }}
              incognito
              injectedJavaScript={INJECT_AUTH_LOGIN}
              onMessage={(e) => handleWebViewMessage(e)}
              onLoadStart={() => {
                console.log('🌐 WebView iniciando carregamento');
                setWebViewLoading(true);
              }}
              onLoadEnd={() => {
                console.log('✅ WebView carregada - aguardando login');
                setWebViewLoading(false);
              }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('❌ WebView error: ', nativeEvent);
                setWebViewLoading(false);
              }}
              javaScriptEnabled
              domStorageEnabled
              sharedCookiesEnabled={false}
              cacheEnabled={false}
            />

            {/* Loading Overlay durante autenticação */}
            {isAuthenticating && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10,
                }}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
                <Text
                  className="text-lg font-semibold mt-4 mb-2"
                  style={{
                    fontFamily: 'Nunito_600SemiBold',
                  }}>
                  Autenticando...
                </Text>
                <Text
                  className="text-sm opacity-60"
                  style={{
                    fontFamily: 'Nunito_400Regular',
                  }}>
                  Aguarde um momento
                </Text>
              </View>
            )}

            {/* Loading inicial da WebView */}
            {webViewLoading && !isAuthenticating && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 5,
                }}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
                <Text
                  className="text-sm opacity-60 mt-4"
                  style={{
                    fontFamily: 'Nunito_400Regular',
                  }}>
                  Carregando página de login...
                </Text>
              </View>
            )}
          </View>
        </Modal>
      )}
    </>
  );
}
