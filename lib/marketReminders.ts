import * as Notifications from 'expo-notifications';
import { AndroidImportance, SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';

import { LineupIssues, buildMarketReminders } from '@/utils/reminders';

const PREFIX = 'market-close-';
const CHANNEL_ID = 'market';

// Com o app aberto o aviso também aparece (a home já mostra o alerta, mas o
// usuário pode estar em outra aba).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestReminderPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Fechamento do mercado',
      importance: AndroidImportance.HIGH,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export async function cancelMarketReminders() {
  if (Platform.OS === 'web') return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith(PREFIX))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
  );
}

/** Substitui os lembretes agendados pelos da rodada atual. */
export async function syncMarketReminders(
  closeAtMs: number,
  roundId: number,
  issues?: LineupIssues
) {
  if (Platform.OS === 'web') return;
  await cancelMarketReminders();

  const reminders = buildMarketReminders(closeAtMs, Date.now(), roundId, issues);
  await Promise.all(
    reminders.map((reminder) =>
      Notifications.scheduleNotificationAsync({
        identifier: reminder.id,
        content: {
          title: reminder.title,
          body: reminder.body,
          data: { url: '/team' },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: reminder.date,
          channelId: CHANNEL_ID,
        },
      })
    )
  );
}
