import { SplashScreen } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  SPLASH_LOGO_BOX,
  SPLASH_MARK,
  SPLASH_PILLS,
  SPLASH_VIEWBOX,
  SPLASH_WORDMARK,
} from '@/constants/SplashArt';

/** Cores da arte (as mesmas do splash nativo em app.json). */
const SPLASH_BACKGROUND = '#F8F9FA';
const SPLASH_ORANGE = '#FF8A00';
const SPLASH_TEXT = '#1A1C1E';

/**
 * Direção do eixo das cápsulas, do topo arredondado para a cauda (vetor 3-4-5,
 * a mesma inclinação do símbolo do logo). Elas entram deslizando ao longo dele.
 */
const AXIS = { x: -0.6, y: 0.8 };
/** Distância percorrida na entrada, suficiente para começarem fora da tela. */
const TRAVEL = 650;
/** Atraso de cada cápsula, na ordem de SPLASH_PILLS. */
const PILL_DELAYS = [0, 90, 180];

type AnimatedSplashProps = {
  onFinish: () => void;
};

/**
 * Splash animada desenhada a partir de assets/images/splashscreen.svg.
 *
 * O primeiro quadro é igual ao splash nativo (fundo claro + logo no centro, mesmo
 * tamanho), então a troca não aparece: o nativo só some depois do layout desta tela.
 * Em seguida as cápsulas entram em diagonal, o logo pulsa e a tela some revelando o app.
 * Com "Reduzir movimento" ligado, as cápsulas já aparecem no lugar e a tela só esmaece.
 */
export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const { width, height } = useWindowDimensions();
  // Cobre a tela inteira, como `preserveAspectRatio="xMidYMid slice"`.
  const scale = Math.max(width / SPLASH_VIEWBOX.width, height / SPLASH_VIEWBOX.height);

  // Valores animados estáveis entre renders (useState com inicializador, sem ler ref no render).
  const [progress] = useState(() => SPLASH_PILLS.map(() => new Animated.Value(TRAVEL)));
  const [logoScale] = useState(() => new Animated.Value(1));
  const [opacity] = useState(() => new Animated.Value(1));
  const started = useRef(false);

  const start = useCallback(async () => {
    if (started.current) return;
    started.current = true;

    await SplashScreen.hideAsync().catch(() => undefined);
    const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled().catch(() => false);

    const fadeOut = Animated.timing(opacity, {
      toValue: 0,
      duration: 320,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    if (reduceMotion) {
      progress.forEach((value) => value.setValue(0));
      Animated.sequence([Animated.delay(500), fadeOut]).start(() => onFinish());
      return;
    }

    const pillsIn = Animated.parallel(
      progress.map((value, index) =>
        Animated.timing(value, {
          toValue: 0,
          duration: 700,
          delay: PILL_DELAYS[index] ?? 0,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    );

    const logoPulse = Animated.sequence([
      Animated.delay(450),
      Animated.timing(logoScale, {
        toValue: 1.06,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 260,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    const exit = Animated.parallel([
      fadeOut,
      Animated.timing(logoScale, {
        toValue: 1.12,
        duration: 320,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    Animated.sequence([
      Animated.parallel([pillsIn, logoPulse]),
      Animated.delay(350),
      exit,
    ]).start(() => onFinish());
  }, [logoScale, onFinish, opacity, progress]);

  // Garantia: se o layout não disparar, a splash não prende o usuário.
  useEffect(() => {
    const timer = setTimeout(start, 1500);
    return () => clearTimeout(timer);
  }, [start]);

  return (
    <Animated.View
      accessible
      accessibilityLabel="Zeen Parciais"
      onLayout={start}
      style={[StyleSheet.absoluteFill, styles.container, { opacity }]}>
      {/* Cápsulas: arte de 393x852 escalada para cobrir a tela */}
      <View
        style={{
          position: 'absolute',
          width: SPLASH_VIEWBOX.width,
          height: SPLASH_VIEWBOX.height,
          left: (width - SPLASH_VIEWBOX.width) / 2,
          top: (height - SPLASH_VIEWBOX.height) / 2,
          transform: [{ scale }],
        }}>
        {SPLASH_PILLS.map((d, index) => (
          <Animated.View
            key={index}
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [
                  { translateX: Animated.multiply(progress[index], AXIS.x) },
                  { translateY: Animated.multiply(progress[index], AXIS.y) },
                ],
              },
            ]}>
            <Svg
              width={SPLASH_VIEWBOX.width}
              height={SPLASH_VIEWBOX.height}
              viewBox={`0 0 ${SPLASH_VIEWBOX.width} ${SPLASH_VIEWBOX.height}`}>
              <Path d={d} fill={SPLASH_ORANGE} />
            </Svg>
          </Animated.View>
        ))}
      </View>

      {/* Logo fora da escala da arte: mesmo tamanho e posição do splash nativo */}
      <Animated.View style={{ transform: [{ scale: logoScale }] }}>
        <Svg
          width={SPLASH_LOGO_BOX.width}
          height={SPLASH_LOGO_BOX.height}
          viewBox={`${SPLASH_LOGO_BOX.x} ${SPLASH_LOGO_BOX.y} ${SPLASH_LOGO_BOX.width} ${SPLASH_LOGO_BOX.height}`}>
          {SPLASH_MARK.map((d, index) => (
            <Path key={`mark-${index}`} d={d} fill={SPLASH_ORANGE} />
          ))}
          {SPLASH_WORDMARK.map(({ d, evenOdd }, index) => (
            <Path
              key={`word-${index}`}
              d={d}
              fill={SPLASH_TEXT}
              fillRule={evenOdd ? 'evenodd' : 'nonzero'}
              clipRule={evenOdd ? 'evenodd' : 'nonzero'}
            />
          ))}
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 1000,
    elevation: 1000,
  },
});
