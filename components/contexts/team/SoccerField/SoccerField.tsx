import { useCallback, useMemo, useRef } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';

import footballField from '@/assets/images/field.png';
import { AddPlayerButton } from '@/components/contexts/team/AddPlayerButton';
import { PlayerSheet, PlayerSheetRef } from '@/components/contexts/team/PlayerSheet';
import { PLAYER_SLOT_MAX_WIDTH, TeamPlayer } from '@/components/contexts/team/TeamPlayer/TeamPlayer';
import { Positions, Zone } from '@/constants/Formations';
import { usePlayerInsights } from '@/hooks/usePlayerInsights';
import usePlayerStats from '@/hooks/usePlayerStats';
import { Substitutions } from '@/models/Club';
import { LineupPlayer, LineupPlayers, LineupPosition } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import type { FieldStat } from '@/store/useTeamLineupStore';

const FIELD_MIN_HEIGHT = 430;
const FIELD_MAX_WIDTH = 560;
const SCREEN_PADDING = 16;
const FIELD_PADDING = 8;

type SoccerFieldProps = {
  lineup: LineupPlayers;
  captain: number;
  substitutions?: Substitutions[];
  isViewOnly?: boolean;
  round: number;
  /** Dado exibido na etiqueta de cada jogador com o mercado aberto */
  fieldStat?: FieldStat;
  onOpenMarket: (position: LineupPosition, playerIndex: number) => void;
  /**
   * Toque em um jogador. Sem este callback o campinho abre a própria ficha,
   * somente leitura quando `isViewOnly`.
   */
  onPressPlayer?: (player: LineupPlayer | FullPlayer) => void;
};

export function SoccerField({
  lineup,
  substitutions,
  captain,
  isViewOnly = false,
  round,
  fieldStat = 'price',
  onOpenMarket,
  onPressPlayer,
}: SoccerFieldProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { playerStats } = usePlayerStats();
  const { getInsight } = usePlayerInsights();
  const sheetRef = useRef<PlayerSheetRef>(null);

  const rows = useMemo(() => {
    const starting = lineup?.starting ?? [];
    return {
      attack: starting.filter((item) => item.position === Positions.ATACANTE),
      midfield: starting.filter((item) => item.position === Positions.MEIO_CAMPO),
      defense: starting
        .filter((item) => item.zone === Zone.DEFESA)
        .sort((a, b) => (a?.sequencePosition as number) - (b?.sequencePosition as number)),
      goalkeeper: starting.filter((item) => item.position === Positions.GOLEIRO),
      coach: starting.filter((item) => item.position === Positions.TECNICO),
    };
  }, [lineup?.starting]);

  const fieldWidth = Math.min(windowWidth - SCREEN_PADDING, FIELD_MAX_WIDTH);

  // A linha mais cheia define a largura de cada jogador, para caber em telas estreitas.
  const slotWidth = useMemo(() => {
    const largestRow = Math.max(
      rows.attack.length,
      rows.midfield.length,
      rows.defense.length,
      // goleiro e técnico dividem a mesma linha, com o goleiro centralizado
      rows.goalkeeper.length + rows.coach.length * 2,
      1
    );
    return Math.min(
      PLAYER_SLOT_MAX_WIDTH,
      Math.floor((fieldWidth - FIELD_PADDING * 2) / largestRow)
    );
  }, [fieldWidth, rows]);

  const handlePressPlayer = useCallback(
    (player: LineupPlayer | FullPlayer) => {
      if (onPressPlayer) onPressPlayer(player);
      else sheetRef.current?.open(player);
    },
    [onPressPlayer]
  );

  const renderItem = useCallback(
    (position: LineupPosition, index: number) => {
      const player = position.player;

      return player ? (
        <TeamPlayer
          key={player.atleta_id}
          width={slotWidth}
          isViewOnly={isViewOnly}
          player={player}
          isCaptain={captain === player.atleta_id}
          isPlayed={playerStats?.atletas?.[player.atleta_id]?.entrou_em_campo}
          isReplaced={substitutions?.some((item) => item.saiu.atleta_id === player.atleta_id)}
          isEnteredInMatch={substitutions?.some(
            (item) => item.entrou.atleta_id === player.atleta_id
          )}
          round={round}
          fieldStat={fieldStat}
          insight={isViewOnly ? undefined : getInsight(player)}
          onPress={handlePressPlayer}
        />
      ) : (
        <AddPlayerButton
          key={position.abbr + index}
          width={slotWidth}
          isViewOnly={isViewOnly}
          onPurchasePlayerOnMarket={(item) => onOpenMarket(item, index)}
          positionLineup={position}
        />
      );
    },
    [
      slotWidth,
      isViewOnly,
      captain,
      playerStats?.atletas,
      substitutions,
      round,
      fieldStat,
      getInsight,
      handlePressPlayer,
      onOpenMarket,
    ]
  );

  return (
    <View style={styles.wrapper}>
      <View accessibilityLabel="Campinho" style={[styles.field, { width: fieldWidth }]}>
        <Image source={footballField} resizeMode="stretch" style={styles.image} />
        <View style={styles.row}>{rows.attack.map(renderItem)}</View>
        <View style={styles.row}>{rows.midfield.map(renderItem)}</View>
        <View style={styles.row}>{rows.defense.map(renderItem)}</View>
        <View style={styles.row}>
          {rows.goalkeeper.map(renderItem)}
          <View style={styles.coach}>{rows.coach.map(renderItem)}</View>
        </View>
      </View>

      {onPressPlayer ? null : <PlayerSheet ref={sheetRef} isViewOnly={isViewOnly} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  field: {
    minHeight: FIELD_MIN_HEIGHT,
    paddingVertical: 12,
    paddingHorizontal: FIELD_PADDING,
    justifyContent: 'space-evenly',
    gap: 8,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
  },
  coach: {
    position: 'absolute',
    left: 4,
    top: 0,
  },
});
