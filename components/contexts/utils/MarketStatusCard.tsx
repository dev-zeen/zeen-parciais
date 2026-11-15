import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { Loading } from '@/components/structure/Loading';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { useCountdown } from '@/hooks/useCountdown';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTokens } from '@/hooks/useTokens';

const numberFormat = new Intl.NumberFormat('pt-BR');

const MARKET_STATUS_NAMED = {
  1: 'Mercado aberto',
  2: 'Mercado fechado',
  3: 'Mercado em atualização',
  4: 'Mercado em manutenção',
} as const;

export function MarketStatusCard() {
  const { colors, spacing } = useTokens();
  const { marketStatus, isBallRolling, currentRoundInfo } = useMarketStatus();

  const isOpen = marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO;
  const countdown = useCountdown(isOpen ? currentRoundInfo?.fechamento.timestamp : undefined);

  const closingDate = useMemo(() => {
    if (!marketStatus) return undefined;
    const { dia, mes, ano, hora, minuto } = marketStatus.fechamento;
    return format(new Date(ano, mes - 1, dia, hora, minuto), "EEEE 'às' HH:mm", { locale: ptBR });
  }, [marketStatus]);

  if (!marketStatus) {
    return <Loading />;
  }

  const isFinalRound = currentRoundInfo?.numero === currentRoundInfo?.rodadaFinal;
  const roundName = currentRoundInfo?.nome || `Rodada ${marketStatus.rodada_atual}`;

  const statusLabel =
    marketStatus.status_mercado === MARKET_STATUS_NAME.FECHADO && isBallRolling
      ? 'Bola rolando'
      : MARKET_STATUS_NAMED[marketStatus.status_mercado];

  const dotColor = isOpen
    ? colors.positiveFill
    : isBallRolling
      ? colors.negativeFill
      : colors.warningFill;

  const countdownTone = countdown.isLastHour ? 'negative' : countdown.isLastDay ? 'warning' : 'text';

  return (
    <AnimatedCard delay={100} variant="flat">
      <View style={{ gap: spacing.xs }}>
        <View style={styles.row}>
          <View style={styles.status}>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <AppText variant="body" weight="bold">
              {statusLabel}
            </AppText>
          </View>
          <View style={styles.status}>
            {isFinalRound ? <Badge label="Rodada final" tone="brand" /> : null}
            <AppText variant="label" weight="medium" color="textMuted">
              {roundName}
            </AppText>
          </View>
        </View>

        {isOpen && countdown.label ? (
          <View
            accessible
            accessibilityLabel={`Mercado fecha em ${countdown.label}, ${closingDate}`}
            style={styles.row}>
            <View style={styles.status}>
              <Feather name="clock" size={16} color={colors[countdownTone]} />
              <AppText variant="title" weight="bold" color={countdownTone}>
                Fecha em {countdown.label}
              </AppText>
            </View>
            <AppText variant="label" color="textMuted">
              {closingDate}
            </AppText>
          </View>
        ) : null}

        {isBallRolling ? (
          <AppText variant="label" color="textMuted">
            Parciais atualizadas em tempo real
          </AppText>
        ) : null}

        {marketStatus.times_escalados > 0 ? (
          <AppText variant="label" color="textMuted">
            {numberFormat.format(marketStatus.times_escalados)} times escalados nesta rodada
          </AppText>
        ) : null}
      </View>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
