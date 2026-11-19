import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Altura da barra de abas flutuante do iOS 26+ (Liquid Glass) acima da área segura.
 * Medido no simulador (iPhone 18 Pro, iOS 27): o topo da barra fica a 84pt do fim da
 * tela, dos quais 34pt são a área segura inferior.
 */
const IOS_TAB_BAR_HEIGHT = 50;

/**
 * Dentro de uma aba nativa, a área segura inferior do iOS já inclui a barra de abas
 * (83pt no iPhone 18 Pro). Só no primeiro render ela ainda vem sem a barra (34pt).
 * Valores acima deste limite já contêm a barra; abaixo, somamos a altura dela.
 */
const INSET_INCLUDES_TAB_BAR = 45;

/** Folga entre o último item da lista e o topo da barra de abas. */
const CONTENT_END_SPACING = 10;

/**
 * Espaço que o conteúdo rolável precisa no final para não ficar sob a barra de abas.
 *
 * iOS: a barra flutua sobre o conteúdo (edge-to-edge), então todo scroll precisa
 * reservar a altura dela. As abas desligam o ajuste automático do sistema
 * (`disableAutomaticContentInsets` em app/(tabs)/_layout.tsx), que só atinge o
 * primeiro scroll de cada tela; aqui o espaço é explícito e vale para todos.
 * iPad: a barra fica no topo, então no fim só reservamos a área segura.
 * Android: a NavigationBar ocupa espaço próprio no layout e não sobrepõe o conteúdo.
 */
export function useTabBarSpacing() {
  const { bottom } = useSafeAreaInsets();

  const overlap =
    Platform.OS !== 'ios'
      ? 0
      : Platform.isPad
        ? // iPadOS mostra a barra de abas no topo; embaixo só há o indicador de início.
          bottom
        : bottom >= INSET_INCLUDES_TAB_BAR
          ? bottom
          : bottom + IOS_TAB_BAR_HEIGHT;

  return {
    /** Quanto a barra de abas cobre do fim da tela */
    overlap,
    /**
     * `paddingBottom` para o `contentContainerStyle` de listas e scrolls: espaço neutro
     * da altura do container da barra de abas, mais uma pequena folga acima dela.
     */
    contentBottom: overlap + CONTENT_END_SPACING,
  };
}
