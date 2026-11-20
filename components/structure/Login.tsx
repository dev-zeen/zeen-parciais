import { Feather } from '@expo/vector-icons';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { Logo } from '@/components/structure/Logo';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { EXPO_PUBLIC_AUTH_URL } from '@/constants/Endpoits';
import { ACCESS_TOKEN_KEY_STORAGE } from '@/constants/Keys';
import { AuthContext } from '@/contexts/Auth.context';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import { useTokens } from '@/hooks/useTokens';
import { fetchGloboidClientSettings } from '@/lib/core/auth';
import { env } from '@/lib/env';

const CHROME_MOBILE_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';

const GLOBOID_TOKEN_KEY_LOCAL_STORAGE = env.EXPO_PUBLIC_GLOBOID_TOKEN_KEY_LOCAL_STORAGE;

const INJECT_AUTH_LOGIN = `
  (function() {
    let tokenSent = false;
    const TOKEN_KEY = '${GLOBOID_TOKEN_KEY_LOCAL_STORAGE}';

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
  /** O que a aba mostra depois de entrar (ex.: "Entre para escalar seu time.") */
  reason?: string;
};

const FEATURES = [
  {
    icon: 'activity',
    title: 'Parciais em tempo real',
    description: 'Pontuação dos seus jogadores ao vivo durante a rodada.',
  },
  {
    icon: 'users',
    title: 'Escalação completa',
    description:
      'Monte o time, escolha o capitão e veja quanto cada jogador precisa para valorizar.',
  },
  {
    icon: 'award',
    title: 'Suas ligas',
    description: 'Clássicas, mata-mata e pontos corridos com seus amigos.',
  },
] as const;

/**
 * Tela única para quem não entrou: Início, Time, Ligas e Perfil mostram exatamente esta
 * estrutura (só a frase de contexto muda). A Rodada é pública e não usa este componente.
 */
export function Login({ reason }: LoginProps) {
  const { colors, spacing, radius, minTouch, isDark } = useTokens();
  const tabBarSpacing = useTabBarSpacing();
  const insets = useSafeAreaInsets();

  const { handleSuccessAuth } = useContext(AuthContext);
  const { setItem } = useAsyncStorage(ACCESS_TOKEN_KEY_STORAGE);

  const [showModalAuth, setShowModalAuth] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleGetLoginPage = useCallback(() => {
    setShowModalAuth(true);
    setWebViewLoading(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModalAuth(false);
    setIsAuthenticating(false);
    setWebViewLoading(true);
  }, []);

  // Timeout de segurança: fecha a modal após 10 minutos se não receber resposta
  useEffect(() => {
    if (showModalAuth) {
      timeoutRef.current = setTimeout(
        () => {
          console.log('⏱️ Login timeout - fechando modal');
          setShowModalAuth(false);
        },
        10 * 60 * 1000
      );
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showModalAuth]);

  const handleWebViewMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      setIsAuthenticating(true);

      let token: string | null = null;

      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'AUTH_TOKEN' && data.tokens) {
          console.log('✅ Tokens recebidos com sucesso');
          token = JSON.stringify(data.tokens);
        }
      } catch {
        const raw = event.nativeEvent.data;
        if (raw && typeof raw === 'string' && raw.trim() !== '' && !raw.startsWith('{')) {
          console.log('✅ Token recebido (formato legado)');
          token = raw;
        }
      }

      if (!token) return;

      await setItem(token);
      console.log('🔍 Buscando configurações do cliente Globoid...');
      await fetchGloboidClientSettings();

      setTimeout(() => {
        handleSuccessAuth();
        setShowModalAuth(false);
        setIsAuthenticating(false);
      }, 500);
    },
    [setItem, handleSuccessAuth]
  );

  return (
    <SafeAreaViewContainer edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        // Mesmo respiro das outras abas: 16 nas laterais, 8 no topo
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.xs,
          paddingBottom: tabBarSpacing.contentBottom + spacing.sm,
          gap: spacing.lg,
        }}>
        <MarketStatusCard />

        {/* Apresentação */}
        <View style={[styles.hero, { gap: spacing.xs }]}>
          <Logo variant="with-name" width={144} height={61} />
          <AppText
            variant="heading"
            weight="bold"
            align="center"
            accessibilityRole="header"
            style={{ marginTop: spacing.sm }}>
            Seu Cartola em tempo real
          </AppText>
          <AppText variant="body" color="textMuted" align="center">
            {reason ?? 'Entre com a sua conta do Cartola para acompanhar o seu time.'}
          </AppText>
        </View>

        {/* O que a pessoa ganha ao entrar */}
        <Card padding={spacing.md} style={{ gap: spacing.md }}>
          {FEATURES.map((feature) => (
            <View key={feature.title} style={[styles.feature, { gap: spacing.sm }]}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.brandContainer, borderRadius: radius.full },
                ]}>
                <Feather
                  name={feature.icon}
                  size={18}
                  color={isDark ? colors.brand : colors.brandText}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="body" weight="bold">
                  {feature.title}
                </AppText>
                <AppText variant="label" color="textMuted">
                  {feature.description}
                </AppText>
              </View>
            </View>
          ))}
        </Card>

        {/* Ações: empurradas para baixo em telas altas, perto do polegar */}
        <View style={{ flexGrow: 1 }} />
        <View style={{ gap: spacing.sm }}>
          <Pressable
            onPress={handleGetLoginPage}
            disabled={isAuthenticating}
            accessibilityRole="button"
            accessibilityLabel="Entrar com a conta Globo"
            accessibilityState={{ disabled: isAuthenticating, busy: isAuthenticating }}
            android_ripple={{ color: colors.brandContainer }}
            style={({ pressed }) => [
              styles.primary,
              {
                minHeight: minTouch + 8,
                borderRadius: radius.full,
                backgroundColor: colors.brand,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            {isAuthenticating ? (
              <ActivityIndicator color={colors.onBrand} size="small" />
            ) : (
              <Feather name="log-in" size={20} color={colors.onBrand} />
            )}
            <AppText variant="title" weight="bold" color="onBrand">
              {isAuthenticating ? 'Entrando...' : 'Entrar com conta Globo'}
            </AppText>
          </Pressable>

          <AppText variant="label" color="textMuted" align="center">
            Não tem conta? Você cria uma grátis na própria tela de login.
          </AppText>

          <Pressable
            onPress={() => router.navigate('/(tabs)/rodada')}
            accessibilityRole="button"
            accessibilityHint="Abre a aba Rodada, que não precisa de login"
            style={({ pressed }) => [
              styles.secondary,
              { minHeight: minTouch, opacity: pressed ? 0.6 : 1 },
            ]}>
            <AppText variant="body" weight="bold" color="accent">
              Ver a rodada sem entrar
            </AppText>
            <Feather name="chevron-right" size={18} color={colors.accent} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Modal de Autenticação */}
      {showModalAuth && (
        <Modal
          animationType="slide"
          visible={showModalAuth}
          presentationStyle="fullScreen"
          onRequestClose={handleCloseModal}>
          <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <View
              style={[
                styles.modalHeader,
                {
                  paddingTop: (Platform.OS === 'ios' ? insets.top : 0) + spacing.xs,
                  paddingHorizontal: spacing.md,
                  paddingBottom: spacing.xs,
                  borderBottomColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}>
              <View style={[styles.feature, { gap: spacing.sm }]}>
                <Feather name="lock" size={18} color={colors.text} />
                <View>
                  <AppText variant="body" weight="bold" accessibilityRole="header">
                    Login seguro
                  </AppText>
                  <AppText variant="label" color="textMuted">
                    globo.com
                  </AppText>
                </View>
              </View>

              <Pressable
                onPress={handleCloseModal}
                disabled={isAuthenticating}
                accessibilityRole="button"
                accessibilityLabel="Fechar login"
                style={({ pressed }) => [
                  styles.close,
                  {
                    width: minTouch,
                    height: minTouch,
                    borderRadius: minTouch / 2,
                    backgroundColor: colors.surfaceAlt,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}>
                <Feather name="x" size={20} color={colors.text} />
              </Pressable>
            </View>

            {/* A sobreposição cobre só a página, para o botão de fechar continuar acessível */}
            <View style={{ flex: 1 }}>
              <WebView
                style={{ flex: 1, backgroundColor: colors.bg }}
                source={{ uri: EXPO_PUBLIC_AUTH_URL }}
                incognito
                // Só no iOS. No Android a WebView envia Client Hints com a versão real
                // ("Android WebView"); um user agent fixo diferente disso faz a proteção
                // anti-robô da página bloquear o passo da senha.
                userAgent={Platform.OS === 'ios' ? CHROME_MOBILE_USER_AGENT : undefined}
                injectedJavaScript={INJECT_AUTH_LOGIN}
                onMessage={handleWebViewMessage}
                // A cobertura de "Carregando" vale só para a primeira carga. Nas navegações
                // seguintes (e-mail → senha) a própria página mostra o progresso; cobri-la
                // escondia a página se o Android não disparasse o fim do carregamento.
                onLoadEnd={() => setWebViewLoading(false)}
                onError={({ nativeEvent }) => {
                  console.warn('❌ WebView error: ', nativeEvent);
                  setWebViewLoading(false);
                }}
                onHttpError={() => setWebViewLoading(false)}
                // Android: com várias janelas ligadas (padrão), um passo do login aberto com
                // target="_blank"/window.open vai para uma WebView invisível e a tela parece
                // travada. Desligado, ele abre aqui mesmo, como já acontece no iOS.
                setSupportMultipleWindows={false}
                // Permite inspecionar a página pelo chrome://inspect em builds de desenvolvimento
                webviewDebuggingEnabled={__DEV__}
                javaScriptEnabled
                domStorageEnabled
                sharedCookiesEnabled={false}
                cacheEnabled={false}
              />

              {isAuthenticating || webViewLoading ? (
                <View
                  style={[styles.overlay, { backgroundColor: colors.bg, top: 0, gap: spacing.xs }]}>
                  <ActivityIndicator size="large" color={colors.brand} />
                  <AppText variant="title" weight="bold" style={{ marginTop: spacing.xs }}>
                    {isAuthenticating ? 'Entrando...' : 'Carregando login'}
                  </AppText>
                  <AppText variant="body" color="textMuted">
                    {isAuthenticating ? 'Aguarde um momento' : 'Conectando à globo.com'}
                  </AppText>
                </View>
              ) : null}
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaViewContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  close: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
