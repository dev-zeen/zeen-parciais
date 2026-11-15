import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { useCountdown } from '@/hooks/useCountdown';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTokens } from '@/hooks/useTokens';
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
  const tokens = useTokens();
  const { marketStatus, currentRoundInfo } = useMarketStatus();
  const isMarketOpen = marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO;
  const countdown = useCountdown(
    isMarketOpen ? currentRoundInfo?.fechamento.timestamp : undefined
  );

  const alerts: Alert[] = useMemo(() => {
    const alertsList: Alert[] = [];

    // Mercado fecha em menos de 24h
    if (countdown.isLastDay && countdown.label) {
      alertsList.push({
        id: 'market-closing',
        type: 'warning',
        title: 'Mercado fechando em breve',
        message: `Faltam ${countdown.label} para o fechamento`,
        icon: 'clock',
      });
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
  }, [countdown.isLastDay, countdown.label, lineupPlayersUnlikely, dismissedAlerts]);

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((prev) => [...prev, alertId]);
  };

  const getAlertColors = (type: Alert['type']) => {
    const { colors } = tokens;
    switch (type) {
      case 'error':
        return { bg: colors.negativeContainer, accent: colors.negative };
      case 'warning':
        return { bg: colors.warningContainer, accent: colors.warning };
      default:
        return { bg: colors.accentContainer, accent: colors.accent };
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
          <AnimatedCard key={alert.id} delay={400 + index * 50} variant="flat" className="p-0">
            <View
              style={{
                backgroundColor: colors.bg,
                borderRadius: 12,
                padding: 12,
                borderLeftWidth: 4,
                borderLeftColor: colors.accent,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}>
              <Feather name={alert.icon} size={18} color={colors.accent} />
              <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: tokens.colors.text }}>
                  {alert.title}
                </Text>
                <Text style={{ fontSize: 12, marginTop: 2, color: tokens.colors.textMuted }}>
                  {alert.message}
                </Text>
              </View>
              <Pressable
                onPress={() => handleDismiss(alert.id)}
                hitSlop={14}
                accessibilityRole="button"
                accessibilityLabel={`Dispensar alerta: ${alert.title}`}>
                <Feather name="x" size={18} color={tokens.colors.textMuted} />
              </Pressable>
            </View>
          </AnimatedCard>
        );
      })}
    </View>
  );
}
