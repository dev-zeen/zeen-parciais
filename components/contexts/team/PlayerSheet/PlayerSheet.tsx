import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { TeamPlayerCard } from '@/components/contexts/team/TeamPlayerCard';
import { BottomSheet, BottomSheetRef } from '@/components/structure/BottomSheet';
import { LineupPlayer } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';

type SheetPlayer = LineupPlayer | FullPlayer;

export type PlayerSheetRef = {
  open: (player: SheetPlayer, options?: { isReservePlayer?: boolean }) => void;
  close: () => void;
};

type PlayerSheetProps = {
  isViewOnly?: boolean;
  onReplace?: (player: SheetPlayer) => void;
};

/** No iOS um modal só pode abrir depois que o anterior terminou de fechar. */
const DISMISS_DELAY = Platform.OS === 'ios' ? 450 : 0;

/** Uma única ficha de jogador por tela, aberta por referência. */
export const PlayerSheet = forwardRef<PlayerSheetRef, PlayerSheetProps>(
  ({ isViewOnly = false, onReplace }, ref) => {
    const sheetRef = useRef<BottomSheetRef>(null);
    const [current, setCurrent] = useState<{ player: SheetPlayer; isReservePlayer: boolean }>();

    const close = useCallback(() => sheetRef.current?.close(), []);

    useImperativeHandle(ref, () => ({
      open: (player, options) => {
        setCurrent({ player, isReservePlayer: !!options?.isReservePlayer });
        sheetRef.current?.snapToIndex(0);
      },
      close,
    }));

    const handleReplace = useCallback(
      (player: SheetPlayer) => {
        close();
        setTimeout(() => onReplace?.(player), DISMISS_DELAY);
      },
      [close, onReplace]
    );

    return (
      <BottomSheet ref={sheetRef}>
        {current ? (
          <TeamPlayerCard
            key={current.player.atleta_id}
            player={current.player}
            isReservePlayer={current.isReservePlayer}
            isViewOnly={isViewOnly}
            onClose={close}
            onReplace={onReplace ? handleReplace : undefined}
          />
        ) : null}
      </BottomSheet>
    );
  }
);

PlayerSheet.displayName = 'PlayerSheet';
