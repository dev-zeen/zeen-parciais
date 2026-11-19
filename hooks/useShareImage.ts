import * as Sharing from 'expo-sharing';
import { ComponentRef, useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { appAlert } from '@/components/ui/AppAlert';

/**
 * Captura uma View como PNG e abre o compartilhamento do sistema.
 * A View precisa estar montada (pode ficar fora da tela) com `collapsable={false}`.
 */
export function useShareImage() {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const [isSharing, setIsSharing] = useState(false);

  const share = useCallback(
    async (dialogTitle: string) => {
      if (isSharing) return;
      setIsSharing(true);
      try {
        if (!(await Sharing.isAvailableAsync())) {
          appAlert('Não disponível', 'O compartilhamento não está disponível neste aparelho.');
          return;
        }
        const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle });
      } catch {
        appAlert('Não deu para compartilhar', 'Tente de novo em instantes.');
      } finally {
        setIsSharing(false);
      }
    },
    [isSharing]
  );

  return { ref, share, isSharing };
}
