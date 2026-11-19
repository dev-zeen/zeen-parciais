import { useCallback, useRef, useState } from 'react';

import type { BottomSheetRef } from '@/components/structure/BottomSheet';
import { LineupPosition } from '@/models/Formations';
import { debugLog } from '@/utils/debugLog';

/** Folha do mercado da aba Time: abre numa posição e limpa o contexto ao fechar. */
export function useMarketSheet() {
  const ref = useRef<BottomSheetRef>(null);
  const [position, setPosition] = useState<LineupPosition>();
  const [index, setIndex] = useState(0);
  // Titular mais barato da posição: limita o preço quando o mercado abre para um reserva
  const [lowestPrice, setLowestPrice] = useState<LineupPosition>();

  const open = useCallback((slot: LineupPosition, slotIndex: number, lowest?: LineupPosition) => {
    debugLog('mercado', 'abrir', {
      posicao: slot.position,
      indice: slotIndex,
      reservaMaisBarato: lowest?.player?.atleta_id ?? null,
    });
    setPosition(slot);
    setIndex(slotIndex);
    // Sempre sobrescreve: sem isso, o "reserva mais barato" de uma abertura anterior
    // continuaria filtrando a lista (e marcando a compra como reserva).
    setLowestPrice(lowest);
    ref.current?.snapToIndex(1);
  }, []);

  // Limpa o contexto em qualquer fechamento: botão, compra ou arrastar para baixo.
  const reset = useCallback(() => {
    debugLog('mercado', 'fechou, estado limpo');
    setPosition(undefined);
    setIndex(0);
    setLowestPrice(undefined);
  }, []);

  const close = useCallback(() => ref.current?.close(), []);

  return { ref, position, index, lowestPrice, open, reset, close };
}
