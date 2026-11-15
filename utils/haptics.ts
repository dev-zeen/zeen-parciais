import * as Haptics from 'expo-haptics';

/** Falhas de haptic nunca devem quebrar uma ação do usuário. */
const ignore = () => undefined;

export const haptics = {
  selection: () => Haptics.selectionAsync().catch(ignore),
  success: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(ignore),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(ignore),
};
