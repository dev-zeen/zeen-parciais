import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';

import { TeamPlayerCard } from '@/components/contexts/team/TeamPlayerCard';
import { BottomSheet, BottomSheetRef } from '@/components/structure/BottomSheet';
import { LineupPlayer } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import { debugLog } from '@/utils/debugLog';

type SheetPlayer = LineupPlayer | FullPlayer;

export type PlayerSheetRef = {
  open: (player: SheetPlayer, options?: { isReservePlayer?: boolean }) => void;
  close: () => void;
};

type PlayerSheetProps = {
  isViewOnly?: boolean;
  onReplace?: (player: SheetPlayer) => void;
};

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

    // "Trocar" abre o mercado, que é outro modal. No iOS ele só pode ser apresentado
    // depois que a ficha terminou de sair; por isso a troca fica pendente até o
    // `onDismissed`. Se a tela desmontar antes, o evento não chega e nada é executado.
    const pendingReplace = useRef<SheetPlayer | null>(null);
    const onReplaceRef = useRef(onReplace);
    onReplaceRef.current = onReplace;

    const handleReplace = useCallback(
      (player: SheetPlayer) => {
        debugLog('trocar', 'pedido para', player.atleta_id, '— aguardando a ficha fechar');
        pendingReplace.current = player;
        close();
      },
      [close]
    );

    const handleDismissed = useCallback(() => {
      const player = pendingReplace.current;
      pendingReplace.current = null;
      debugLog(
        'trocar',
        'ficha fechou',
        player ? `— abrindo mercado para ${player.atleta_id}` : '(sem troca pendente)'
      );
      if (player) onReplaceRef.current?.(player);
    }, []);

    return (
      <BottomSheet ref={sheetRef} onDismissed={handleDismissed}>
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
