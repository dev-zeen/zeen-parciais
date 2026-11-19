import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { ENUM_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import { useCountdown } from '@/hooks/useCountdown';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTokens } from '@/hooks/useTokens';
import { FullPlayer } from '@/models/Stats';
import { useGetMatchs } from '@/queries/matches.query';
import { findPlayerMatch } from '@/utils/insights';

type Alert = {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  icon: keyof typeof Feather.glyphMap;
};

type AlertsCardProps = {
  /** Titulares do time salvo */
  players?: FullPlayer[];
  hasNoCaptain?: boolean;
};

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

export function AlertsCard({ players, hasNoCaptain }: AlertsCardProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const tokens = useTokens();
  const { marketStatus, currentRoundInfo } = useMarketStatus();
  const isMarketOpen = marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO;
  const countdown = useCountdown(
    isMarketOpen ? currentRoundInfo?.fechamento.timestamp : undefined
  );
  const { data: matches } = useGetMatchs();

  const alerts: Alert[] = useMemo(() => {
    const alertsList: Alert[] = [];
    const lineup = players ?? [];

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

    // Os avisos abaixo só têm ação possível com o mercado aberto.
    if (isMarketOpen && lineup.length > 0) {
      if (hasNoCaptain) {
        alertsList.push({
          id: 'no-captain',
          type: 'error',
          title: 'Time sem capitão',
          message: 'O capitão pontua 1,5×. Escolha um antes do fechamento.',
          icon: 'award',
        });
      }

      const withoutMatch = matches
        ? lineup.filter((player) => !findPlayerMatch(player.clube_id, matches)).length
        : 0;
      if (withoutMatch > 0) {
        alertsList.push({
          id: 'without-match',
          type: 'warning',
          title: plural(withoutMatch, '1 titular sem jogo', `${withoutMatch} titulares sem jogo`),
          message: plural(
            withoutMatch,
            'O clube dele não joga nesta rodada e ele não vai pontuar.',
            'Os clubes deles não jogam nesta rodada e eles não vão pontuar.'
          ),
          icon: 'slash',
        });
      }
    }

    const unlikely = lineup.filter(
      (player) => player.status_id !== ENUM_STATUS_MARKET_PLAYER.PROVAVEL
    ).length;
    if (unlikely > 0) {
      alertsList.push({
        id: 'unlikely-players',
        type: 'error',
        title: plural(unlikely, '1 jogador com problema', `${unlikely} jogadores com problema`),
        message: 'Você tem jogadores dúvidas, contundidos ou suspensos no time',
        icon: 'alert-triangle',
      });
    }

    return alertsList.filter((alert) => !dismissedAlerts.includes(alert.id));
  }, [
    countdown.isLastDay,
    countdown.label,
    dismissedAlerts,
    hasNoCaptain,
    isMarketOpen,
    matches,
    players,
  ]);

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
            <Pressable
              onPress={isMarketOpen ? () => router.push('/team') : undefined}
              disabled={!isMarketOpen}
              accessibilityRole={isMarketOpen ? 'button' : undefined}
              accessibilityHint={isMarketOpen ? 'Abre a escalação' : undefined}
              style={({ pressed }) => ({
                backgroundColor: colors.bg,
                borderRadius: 12,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                opacity: pressed ? 0.85 : 1,
              })}>
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
            </Pressable>
          </AnimatedCard>
        );
      })}
    </View>
  );
}
