import { Feather } from '@expo/vector-icons';
import { useCallback, useContext, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { ScreenHeader } from '@/components/structure/ScreenHeader';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { StateView } from '@/components/ui/StateView';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTokens } from '@/hooks/useTokens';
import { LineupHistoryEntry, LineupHistoryPlayer } from '@/models/Club';
import { useGetLineupHistory } from '@/queries/club.query';
import { diffLineups, formatTransactionDate, isEmptyDiff, LineupDiff } from '@/utils/lineupHistory';

const keyExtractor = (item: LineupHistoryEntry) => String(item.historico_transacao_id);
const names = (players: LineupHistoryPlayer[]) =>
  players.map((player) => player.apelido).join(', ');

export default function LineupHistoryScreen() {
  const { spacing } = useTokens();
  const { isAutheticated } = useContext(AuthContext);
  const { marketStatus, allowRequest } = useMarketStatus();
  const currentRound = marketStatus?.rodada_atual;

  // undefined = rodada atual; muda com o seletor
  const [selectedRound, setSelectedRound] = useState<number>();
  const round = selectedRound ?? currentRound;

  const { data, isLoading, isError, refetch, isRefetching } = useGetLineupHistory(
    round,
    !!allowRequest
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<LineupHistoryEntry>) => (
      <HistoryEntryCard
        entry={item}
        isCurrent={index === 0}
        diff={diffLineups(item, data?.[index + 1])}
      />
    ),
    [data]
  );

  if (!isAutheticated) {
    return <Login reason="Entre para ver o histórico das suas escalações." />;
  }

  if (!round) return <LoadingScreen title="Carregando histórico" />;

  return (
    <SafeAreaViewContainer edges={['top']}>
      <ScreenHeader title="Histórico de escalações" subtitle="Cada vez que você salvou o time" />

      <RoundStepper
        round={round}
        max={currentRound ?? round}
        onChange={(value) => setSelectedRound(value)}
      />

      {isLoading ? (
        <LoadingScreen title="Carregando histórico" />
      ) : isError && !data ? (
        <StateView
          icon="wifi-off"
          title="Não deu para carregar o histórico"
          message="Confira a conexão e tente de novo."
          actionLabel="Tentar de novo"
          onAction={() => {
            refetch();
          }}
        />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.xs, gap: spacing.xs, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch();
              }}
            />
          }
          ListEmptyComponent={
            <StateView
              icon="clock"
              title="Nenhum salvamento nesta rodada"
              message="Quando você salvar o time, cada versão aparece aqui."
            />
          }
        />
      )}
    </SafeAreaViewContainer>
  );
}

function RoundStepper({
  round,
  max,
  onChange,
}: {
  round: number;
  max: number;
  onChange: (round: number) => void;
}) {
  const { colors, spacing, minTouch } = useTokens();

  const button = (icon: 'chevron-left' | 'chevron-right', target: number, label: string) => {
    const disabled = target < 1 || target > max;
    return (
      <Pressable
        onPress={() => onChange(target)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.stepButton,
          {
            width: minTouch,
            height: minTouch,
            borderRadius: minTouch / 2,
            backgroundColor: colors.surface,
            opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
          },
        ]}>
        <Feather name={icon} size={20} color={colors.text} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.stepper, { paddingHorizontal: spacing.md, paddingVertical: spacing.xs }]}>
      {button('chevron-left', round - 1, 'Rodada anterior')}
      <AppText variant="title" weight="bold" accessibilityLiveRegion="polite">
        Rodada {round}
      </AppText>
      {button('chevron-right', round + 1, 'Próxima rodada')}
    </View>
  );
}

function HistoryEntryCard({
  entry,
  isCurrent,
  diff,
}: {
  entry: LineupHistoryEntry;
  isCurrent: boolean;
  diff?: LineupDiff;
}) {
  const { colors, spacing } = useTokens();
  const [expanded, setExpanded] = useState(false);

  return (
    <Card padding={spacing.md} style={{ gap: spacing.xs }}>
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityHint={expanded ? 'Esconde a escalação' : 'Mostra a escalação completa'}
        style={{ gap: spacing.xs }}>
        <View style={styles.header}>
          <Feather name="save" size={16} color={colors.textMuted} />
          <AppText variant="body" weight="bold" style={{ flex: 1 }}>
            Salvo em {formatTransactionDate(entry.data_transacao)}
          </AppText>
          {isCurrent ? <Badge label="Valendo" tone="positive" /> : null}
          <Feather
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textMuted}
          />
        </View>

        <AppText variant="label" color="textMuted">
          Capitão: {entry.capitao?.apelido ?? 'nenhum'}
          {' · '}
          Reserva de luxo: {entry.reserva_luxo?.apelido ?? 'nenhum'}
        </AppText>

        {diff ? (
          <DiffLines diff={diff} />
        ) : (
          <AppText variant="label" color="textMuted">
            Primeiro salvamento da rodada
          </AppText>
        )}
      </Pressable>

      {expanded ? (
        <View style={{ gap: 2, paddingTop: spacing.xs }}>
          <AppText variant="label" weight="bold" color="textMuted">
            TITULARES
          </AppText>
          {entry.escalacao.map((player) => (
            <PlayerLine
              key={player.id}
              player={player}
              isCaptain={player.id === entry.capitao?.id}
            />
          ))}
          {entry.reservas.length > 0 ? (
            <>
              <AppText
                variant="label"
                weight="bold"
                color="textMuted"
                style={{ marginTop: spacing.xs }}>
                RESERVAS
              </AppText>
              {entry.reservas.map((player) => (
                <PlayerLine
                  key={player.id}
                  player={player}
                  isLuxury={player.id === entry.reserva_luxo?.id}
                />
              ))}
            </>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

function DiffLines({ diff }: { diff: LineupDiff }) {
  if (isEmptyDiff(diff)) {
    return (
      <AppText variant="label" color="textMuted">
        Sem mudanças em relação ao salvamento anterior
      </AppText>
    );
  }

  return (
    <View style={{ gap: 2 }}>
      {diff.in.length > 0 ? (
        <AppText variant="label" color="positive">
          Entrou: {names(diff.in)}
        </AppText>
      ) : null}
      {diff.out.length > 0 ? (
        <AppText variant="label" color="negative">
          Saiu: {names(diff.out)}
        </AppText>
      ) : null}
      {diff.captain ? (
        <AppText variant="label" color="accent">
          Capitão: {diff.captain.from ?? 'nenhum'} → {diff.captain.to ?? 'nenhum'}
        </AppText>
      ) : null}
      {diff.luxury ? (
        <AppText variant="label" color="accent">
          Reserva de luxo: {diff.luxury.from ?? 'nenhum'} → {diff.luxury.to ?? 'nenhum'}
        </AppText>
      ) : null}
    </View>
  );
}

function PlayerLine({
  player,
  isCaptain,
  isLuxury,
}: {
  player: LineupHistoryPlayer;
  isCaptain?: boolean;
  isLuxury?: boolean;
}) {
  return (
    <View style={styles.playerLine}>
      <AppText variant="body" style={{ flex: 1 }} numberOfLines={1}>
        {player.apelido}
        {isCaptain ? ' (C)' : ''}
        {isLuxury ? ' (L)' : ''}
      </AppText>
      <AppText variant="label" color="textMuted">
        {player.posicao}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
