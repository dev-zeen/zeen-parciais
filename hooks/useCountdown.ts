import { useEffect, useState } from 'react';

import { formatCountdown } from '@/utils/insights';

const ONE_HOUR = 60 * 60 * 1000;

/**
 * Contagem regressiva até um timestamp em segundos (formato da API do Cartola).
 * Atualiza a cada minuto e, na última hora, a cada segundo.
 */
export function useCountdown(timestampSeconds?: number) {
  const target = timestampSeconds ? timestampSeconds * 1000 : undefined;
  const [now, setNow] = useState(() => Date.now());

  const remainingMs = target !== undefined ? target - now : 0;
  const isLastHour = remainingMs > 0 && remainingMs <= ONE_HOUR;

  useEffect(() => {
    if (target === undefined || target <= Date.now()) return;

    // Sincroniza já (o `now` pode estar velho se a tela ficou montada sem prazo)
    // e depois segue no intervalo. Agendado para não atualizar estado dentro do effect.
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, isLastHour ? 1000 : 60 * 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [target, isLastHour]);

  return {
    remainingMs,
    /** null quando não há prazo ou ele já passou */
    label: target !== undefined ? formatCountdown(remainingMs) : null,
    isLastHour,
    isLastDay: remainingMs > 0 && remainingMs <= 24 * ONE_HOUR,
  };
}
