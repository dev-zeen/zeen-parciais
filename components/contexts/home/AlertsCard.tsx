import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { ENUM_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import useMarketStatus from '@/hooks/useMarketStatus';
import { FullPlayer } from '@/models/Stats';

type Alert = {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  icon: keyof typeof Feather.glyphMap;
};

type AlertsCardProps = {
  lineupPlayersUnlikely?: FullPlayer[];
  hasNoCaptain?: boolean;
};

export function AlertsCard({ lineupPlayersUnlikely, hasNoCaptain }: AlertsCardProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const colorTheme = useColorScheme();
  const { marketStatus, currentRoundInfo } = useMarketStatus();

  const alerts: Alert[] = useMemo(() => {
    const alertsList: Alert[] = [];

    // Market closing soon alert
    if (marketStatus && currentRoundInfo) {
      const timeUntilClose = currentRoundInfo.fechamento.timestamp * 1000 - Date.now();
      const hoursRemaining = Math.floor(timeUntilClose / (1000 * 60 * 60));

      if (hoursRemaining < 24 && hoursRemaining > 0) {
        alertsList.push({
          id: 'market-closing',
          type: 'warning',
          title: 'Mercado fechando em breve',
          message: `Faltam ${hoursRemaining} horas para o fechamento`,
          icon: 'clock',
        });
      }
    }

    // Unlikely players alert
    if (lineupPlayersUnlikely && lineupPlayersUnlikely.length > 0) {
      alertsList.push({
        id: 'unlikely-players',
        type: 'error',
        title: `${lineupPlayersUnlikely.length} jogador(es) com problema`,
        message: 'Você tem jogadores dúvidas, contundidos ou suspensos no time',
        icon: 'alert-triangle',
      });
    }


    return alertsList.filter((alert) => !dismissedAlerts.includes(alert.id));
  }, [marketStatus, currentRoundInfo, lineupPlayersUnlikely, hasNoCaptain, dismissedAlerts]);

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((prev) => [...prev, alertId]);
  };

  const getAlertColors = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return {
          bg: colorTheme === 'dark' ? '#7F1D1D' : '#FEE2E2',
          border: 'border-red-500',
          text: 'text-red-700 dark:text-red-300',
          icon: '#EF4444',
        };
      case 'warning':
        return {
          bg: colorTheme === 'dark' ? '#78350F' : '#FEF3C7',
          border: 'border-orange-500',
          text: 'text-orange-700 dark:text-orange-300',
          icon: '#F59E0B',
        };
      default:
        return {
          bg: colorTheme === 'dark' ? '#1E3A8A' : '#DBEAFE',
          border: 'border-blue-500',
          text: 'text-blue-700 dark:text-blue-300',
          icon: '#3B82F6',
        };
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 8, backgroundColor: 'transparent' }}>
      {alerts.map((alert, index) => {
        const colors = getAlertColors(alert.type);
        return (
          <AnimatedCard key={alert.id} delay={400 + index * 50} variant="flat">
            <View className={`rounded-xl p-3 border-l-4 ${colors.border}`} style={{ backgroundColor: colors.bg }}>
              <View className="flex-row items-center justify-between" style={{ backgroundColor: 'transparent' }}>
                <View className="flex-row items-center flex-1" style={{ gap: 10, backgroundColor: 'transparent' }}>
                  <View 
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${colors.icon}20` }}>
                    <Feather name={alert.icon} size={16} color={colors.icon} />
                  </View>
                  <View className="flex-1" style={{ backgroundColor: 'transparent' }}>
                    <Text className={`font-bold text-sm ${colors.text}`} numberOfLines={1}>
                      {alert.title}
                    </Text>
                    <Text className="text-xs text-gray-600 dark:text-gray-400 mt-0.5" numberOfLines={2}>
                      {alert.message}
                    </Text>
                  </View>
                </View>
                <Pressable 
                  onPress={() => handleDismiss(alert.id)} 
                  hitSlop={12}
                  className="ml-2">
                  <Feather
                    name="x"
                    size={18}
                    color={colorTheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  />
                </Pressable>
              </View>
            </View>
          </AnimatedCard>
        );
      })}
    </View>
  );
}
