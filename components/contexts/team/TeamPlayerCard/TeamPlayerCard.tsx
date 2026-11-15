import { Feather } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PlayerInsights } from '@/components/contexts/team/PlayerInsights';
import { PlayerStatsView } from '@/components/contexts/team/PlayerStatsView';
import { Loading } from '@/components/structure/Loading';
import { AppText } from '@/components/ui/AppText';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { StatItem } from '@/components/ui/StatItem';
import { Positions } from '@/constants/Formations';
import { ENUM_STATUS_MARKET_PLAYER, OBJECT_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import useMarketStatus from '@/hooks/useMarketStatus';
import { usePlayerInsights } from '@/hooks/usePlayerInsights';
import { useTokens } from '@/hooks/useTokens';
import { LineupPlayer } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import { useGetMarket } from '@/queries/market.query';
import { useGetPlayerHistory, useGetPositions } from '@/queries/players.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { haptics } from '@/utils/haptics';
import { numberToString } from '@/utils/parseTo';

type TeamPlayerCardProps = {
  player: LineupPlayer | FullPlayer;
  isReservePlayer: boolean;
  /** Time de outro cartoleiro ou mercado fechado: sem ações de escalação */
  isViewOnly?: boolean;
  onClose: () => void;
  /** Vende o jogador e abre o mercado na mesma posição */
  onReplace?: (player: LineupPlayer | FullPlayer) => void;
};

const STATUS_TONE: Record<number, BadgeTone> = {
  [ENUM_STATUS_MARKET_PLAYER.PROVAVEL]: 'positive',
  [ENUM_STATUS_MARKET_PLAYER.DUVIDA]: 'warning',
  [ENUM_STATUS_MARKET_PLAYER.SUSPENSO]: 'negative',
  [ENUM_STATUS_MARKET_PLAYER.CONTUNDIDO]: 'negative',
  [ENUM_STATUS_MARKET_PLAYER.NULO]: 'negative',
};

export function TeamPlayerCard({
  player,
  isReservePlayer,
  isViewOnly = false,
  onClose,
  onReplace,
}: TeamPlayerCardProps) {
  const { colors, spacing, radius, minTouch } = useTokens();

  const captain = useTeamLineupStore((state) => state.captain);
  const updateCaptain = useTeamLineupStore((state) => state.updateCaptain);
  const removePlayerFromLineup = useTeamLineupStore((state) => state.removePlayerFromLineup);

  const { data: positions } = useGetPositions();
  const { data: market } = useGetMarket();
  const { data: playerHistory } = useGetPlayerHistory(player.atleta_id);
  const { getInsight } = usePlayerInsights();

  const { marketStatus, isMarketClose } = useMarketStatus();

  const canEdit = !isViewOnly && !isMarketClose;
  const isCaptain = !isViewOnly && captain === player.atleta_id;
  const canBeCaptain = !isReservePlayer && player.posicao_id !== Positions.TECNICO;

  const handleSelectCaptain = useCallback(() => {
    haptics.selection();
    updateCaptain(player.atleta_id);
  }, [player.atleta_id, updateCaptain]);

  const handleSell = useCallback(() => {
    removePlayerFromLineup(player);
    onClose();
  }, [onClose, player, removePlayerFromLineup]);

  if (!positions || !market || !marketStatus) return <Loading />;

  const insight = getInsight(player);
  const club = market.clubes?.[player.clube_id];
  const status = OBJECT_STATUS_MARKET_PLAYER[player.status_id];

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={[styles.header, { paddingHorizontal: spacing.md, gap: spacing.sm }]}>
        <Image
          source={{ uri: player.foto?.replace('FORMATO', '220x220') }}
          style={[styles.photo, { backgroundColor: colors.surfaceAlt }]}
          accessible={false}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="heading" weight="bold" numberOfLines={1} accessibilityRole="header">
            {player.apelido}
          </AppText>
          <AppText variant="label" color="textMuted" numberOfLines={1}>
            {positions[player.posicao_id]?.nome}
            {club ? ` · ${club.nome}` : ''}
          </AppText>
          <View style={styles.badges}>
            {status ? (
              <Badge label={status.name} tone={STATUS_TONE[player.status_id] ?? 'neutral'} />
            ) : null}
            {isCaptain ? <Badge label="Capitão" tone="brand" /> : null}
            {isReservePlayer ? <Badge label="Reserva" /> : null}
          </View>
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar ficha"
          style={({ pressed }) => [
            styles.close,
            {
              width: minTouch,
              height: minTouch,
              borderRadius: minTouch / 2,
              backgroundColor: colors.surfaceAlt,
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <Feather name="x" size={20} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        showsVerticalScrollIndicator
        nestedScrollEnabled>
        {/* Ações */}
        {canEdit ? (
          <View style={[styles.actions, { gap: spacing.xs }]}>
            {canBeCaptain ? (
              <ActionButton
                icon="award"
                label={isCaptain ? 'É o capitão' : 'Capitão'}
                onPress={handleSelectCaptain}
                disabled={isCaptain}
                background={isCaptain ? colors.brandContainer : colors.brand}
                foreground={isCaptain ? colors.text : colors.onBrand}
                minHeight={minTouch}
                radius={radius.md}
              />
            ) : null}
            {onReplace && !isReservePlayer ? (
              <ActionButton
                icon="repeat"
                label="Trocar"
                onPress={() => onReplace(player)}
                background={colors.accentFill}
                foreground={colors.onAccentFill}
                minHeight={minTouch}
                radius={radius.md}
              />
            ) : null}
            <ActionButton
              icon="trash-2"
              label="Vender"
              onPress={handleSell}
              background={colors.negativeContainer}
              foreground={colors.negative}
              minHeight={minTouch}
              radius={radius.md}
            />
          </View>
        ) : null}

        {/* Números */}
        <Card style={styles.stats}>
          <StatItem label="Jogos" value={String(player.jogos_num ?? 0)} />
          <StatItem label="Média" value={numberToString(player.media_num)} />
          <StatItem
            label="Mín. valorizar"
            value={insight.minToValorize != null ? numberToString(insight.minToValorize) : '-'}
          />
          <StatItem label="Preço" value={`C$ ${numberToString(player.preco_num)}`} tone="accent" />
        </Card>

        <PlayerInsights insight={insight} clubName={club?.nome} />

        {playerHistory && playerHistory.length > 0 ? (
          <PlayerStatsView stats={playerHistory} isLoading={false} />
        ) : null}
      </ScrollView>
    </View>
  );
}

type ActionButtonProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  background: string;
  foreground: string;
  minHeight: number;
  radius: number;
};

function ActionButton({
  icon,
  label,
  onPress,
  disabled,
  background,
  foreground,
  minHeight,
  radius,
}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.action,
        { minHeight, borderRadius: radius, backgroundColor: background, opacity: pressed ? 0.75 : 1 },
      ]}>
      <Feather name={icon} size={16} color={foreground} />
      <AppText variant="body" weight="bold" color={foreground} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 8,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  close: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 4,
  },
});
