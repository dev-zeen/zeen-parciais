import { Feather } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Linking, Switch } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { appAlert } from '@/components/ui/AppAlert';
import { useTokens } from '@/hooks/useTokens';
import { requestReminderPermission } from '@/lib/marketReminders';
import useSettingsStore from '@/store/useSettingsStore';

/** Liga/desliga os lembretes de fechamento do mercado (pede a permissão ao ligar). */
export function ReminderSettingsCard() {
  const { colors: tk } = useTokens();
  const marketReminders = useSettingsStore((state) => state.marketReminders);
  const setMarketReminders = useSettingsStore((state) => state.setMarketReminders);

  const onToggle = useCallback(
    async (value: boolean) => {
      if (!value) {
        setMarketReminders(false);
        return;
      }
      const granted = await requestReminderPermission();
      setMarketReminders(granted);
      if (!granted) {
        appAlert(
          'Notificações desativadas',
          'Permita as notificações do app nos ajustes do aparelho para receber os lembretes.',
          [
            { text: 'Agora não', style: 'cancel' },
            { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
          ]
        );
      }
    },
    [setMarketReminders]
  );

  return (
    <AnimatedCard delay={750} variant="flat">
      <View className="flex-row items-center" style={{ gap: 12, backgroundColor: 'transparent' }}>
        <Feather name="bell" size={20} color={tk.accent} />
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <Text className="text-base font-bold">Lembrete de fechamento</Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Aviso 24h, 2h e 30min antes do mercado fechar
          </Text>
        </View>
        <Switch
          value={!!marketReminders}
          onValueChange={onToggle}
          trackColor={{ true: tk.accentFill }}
          accessibilityLabel="Lembrete de fechamento do mercado"
        />
      </View>
    </AnimatedCard>
  );
}
