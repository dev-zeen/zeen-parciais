import { useCallback, useRef } from 'react';
import { Alert, StyleSheet, View, useWindowDimensions } from 'react-native';

import { AddPlayerButton } from '@/components/contexts/team/AddPlayerButton';
import { PlayerSheet, PlayerSheetRef } from '@/components/contexts/team/PlayerSheet';
import { PLAYER_SLOT_MAX_WIDTH, TeamPlayer } from '@/components/contexts/team/TeamPlayer/TeamPlayer';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { usePlayerInsights } from '@/hooks/usePlayerInsights';
import usePlayerStats from '@/hooks/usePlayerStats';
import { Substitutions } from '@/models/Club';
import { LineupPlayer, LineupPlayers, LineupPosition } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import type { FieldStat } from '@/store/useTeamLineupStore';
import { onGetPlayerLowestPrice } from '@/utils/team';

type ListReservePlayersProps = {
  lineup: LineupPlayers;
  substitutions?: Substitutions[];
  isViewOnly?: boolean;
  round?: number;
  fieldStat?: FieldStat;
  onOpenMarket: (
    position: LineupPosition,
    playerIndex: number,
    playerLowestPrice?: LineupPosition
  ) => void;
  /** Sem este callback a lista abre a própria ficha do jogador. */
  onPressPlayer?: (player: LineupPlayer | FullPlayer) => void;
};

const SCREEN_PADDING = 16;
const CARD_PADDING = 12;

export function ListReservePlayers({
  lineup,
  substitutions,
  isViewOnly = false,
  round,
  fieldStat = 'price',
  onOpenMarket,
  onPressPlayer,
}: ListReservePlayersProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { playerStats } = usePlayerStats();
  const { getInsight } = usePlayerInsights();
  const sheetRef = useRef<PlayerSheetRef>(null);

  const reserves = lineup?.reserves ?? [];
  const reservesCount = reserves.filter((item) => item.player).length;
  const totalReserves = reserves.length;

  const slotWidth = Math.min(
    PLAYER_SLOT_MAX_WIDTH,
    Math.floor((windowWidth - SCREEN_PADDING - CARD_PADDING * 2) / Math.max(totalReserves, 1))
  );

  const handlePurchasePlayerOnMarket = useCallback(
    (position: LineupPosition, playerIndex: number) => {
      const isPositionFilled = lineup?.starting
        .filter((item) => item.position === position.position)
        .every((item) => item.player);

      if (!isPositionFilled) {
        Alert.alert('Atenção', 'Você deve preencher todos os titulares para a posição.', [
          { text: 'OK' },
        ]);
        return;
      }

      const lowestPlayer = onGetPlayerLowestPrice(lineup as LineupPlayers, position);
      onOpenMarket(position, playerIndex, lowestPlayer);
    },
    [lineup, onOpenMarket]
  );

  const handlePressPlayer = useCallback(
    (player: LineupPlayer | FullPlayer) => {
      if (onPressPlayer) onPressPlayer(player);
      else sheetRef.current?.open(player, { isReservePlayer: true });
    },
    [onPressPlayer]
  );

  return (
    <Card padding={CARD_PADDING} style={styles.card}>
      <SectionHeader
        title="Reservas"
        subtitle={isViewOnly ? undefined : 'Entram se o titular da posição não jogar'}
        right={
          <Badge
            label={`${reservesCount}/${totalReserves}`}
            tone={reservesCount === totalReserves ? 'positive' : 'warning'}
          />
        }
      />

      <View style={styles.row}>
        {reserves.map((position, index) => {
          const player = position.player;

          return player ? (
            <TeamPlayer
              key={player.atleta_id}
              width={slotWidth}
              isViewOnly={isViewOnly}
              player={player}
              isReservePlayer
              isPlayed={playerStats?.atletas?.[player.atleta_id]?.entrou_em_campo}
              isEnteredInMatch={substitutions?.some(
                (item) => item.entrou.atleta_id === player.atleta_id
              )}
              isReplaced={substitutions?.some((item) => item.saiu.atleta_id === player.atleta_id)}
              round={round}
              fieldStat={fieldStat}
              insight={isViewOnly ? undefined : getInsight(player)}
              onPress={handlePressPlayer}
            />
          ) : (
            <AddPlayerButton
              key={position.abbr + '-' + index}
              width={slotWidth}
              onPurchasePlayerOnMarket={() => handlePurchasePlayerOnMarket(position, index)}
              positionLineup={position}
              isViewOnly={isViewOnly}
            />
          );
        })}
      </View>

      {onPressPlayer ? null : <PlayerSheet ref={sheetRef} isViewOnly={isViewOnly} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
  },
});
