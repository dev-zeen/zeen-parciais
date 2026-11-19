import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { MARKET_STATUS_NAME } from '@/constants/Market';
import { ENUM_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import useMarketStatus from '@/hooks/useMarketStatus';
import {
  cancelMarketReminders,
  requestReminderPermission,
  syncMarketReminders,
} from '@/lib/marketReminders';
import { useGetMyClub } from '@/queries/club.query';
import useSettingsStore from '@/store/useSettingsStore';

/**
 * Agenda notificações locais antes do fechamento do mercado (24h, 2h e 30min),
 * avisando se o time salvo está sem capitão ou com jogadores em dúvida.
 * Reagenda quando o prazo ou o time salvo mudam; cancela com o mercado fechado.
 */
export function useMarketCloseReminders() {
  const { marketStatus, allowRequest } = useMarketStatus();
  const { data: myClub } = useGetMyClub(allowRequest);
  const hydrated = useSettingsStore((state) => state.hydrated);
  const enabled = useSettingsStore((state) => state.marketReminders);
  const setEnabled = useSettingsStore((state) => state.setMarketReminders);

  const isOpen = marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO;
  const closeAt = isOpen ? marketStatus.fechamento.timestamp * 1000 : undefined;
  const roundId = marketStatus?.rodada_atual ?? 0;
  const hasClub = !!myClub;
  const hasCaptain = !!myClub?.capitao_id;
  const unlikely =
    myClub?.atletas?.filter((player) => player.status_id !== ENUM_STATUS_MARKET_PLAYER.PROVAVEL)
      .length ?? 0;

  // Primeira vez: pede a permissão do sistema e guarda a resposta.
  useEffect(() => {
    if (!hydrated || enabled !== null || Platform.OS === 'web') return;
    requestReminderPermission().then(setEnabled).catch(() => setEnabled(false));
  }, [enabled, hydrated, setEnabled]);

  useEffect(() => {
    if (!hydrated || Platform.OS === 'web') return;
    const task =
      enabled && closeAt
        ? syncMarketReminders(
            closeAt,
            roundId,
            hasClub ? { hasCaptain, unlikely } : undefined
          )
        : cancelMarketReminders();
    task.catch(() => {});
  }, [closeAt, enabled, hasCaptain, hasClub, hydrated, roundId, unlikely]);

  // Tocar na notificação abre a escalação.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (typeof url === 'string') router.push(url as never);
    });
    return () => subscription.remove();
  }, []);
}
