import { useCallback, useRef, useState } from 'react';

import {
  PlayersToSell,
  fillLineupOnChangeFormation,
  onClearLineup,
  onGetDefaultLineupTeam,
  onGetPlayersOnChangePositionSell,
} from '@/components/contexts/team/_team.helpers';
import type { BottomSheetRef } from '@/components/structure/BottomSheet';
import { FORMATIONS } from '@/constants/Formations';
import { LineupPlayers } from '@/models/Formations';
import { PlayerStats } from '@/models/Stats';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { onGetTeamPrice } from '@/utils/team';

type Options = {
  playerStats?: PlayerStats;
  isMarketClose: boolean;
  onMessage: (message: string, type: 'success' | 'error') => void;
};

/**
 * Troca de formação. Sem jogadores, troca direto. Se algum titular não couber na nova
 * formação, abre o modal para o usuário escolher quem sai e só aplica ao confirmar.
 */
export function useFormationChange({ playerStats, isMarketClose, onMessage }: Options) {
  const modalRef = useRef<BottomSheetRef>(null);
  const lineup = useTeamLineupStore((state) => state.lineup);
  const updateFormation = useTeamLineupStore((state) => state.updateFormation);
  const updateLineup = useTeamLineupStore((state) => state.updateLineup);
  const updatePrice = useTeamLineupStore((state) => state.updatePrice);

  const [playersToSell, setPlayersToSell] = useState<PlayersToSell[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pendingFormation, setPendingFormation] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPlayersToSell([]);
    setPendingFormation(null);
    setSelected(new Set());
  }, []);

  const applyFormation = useCallback(
    (formation: string, base: LineupPlayers) => {
      updateFormation(formation);
      const updated = fillLineupOnChangeFormation(base, formation, playerStats, isMarketClose);
      updateLineup(updated);
      updatePrice(onGetTeamPrice(updated.starting));
    },
    [isMarketClose, playerStats, updateFormation, updateLineup, updatePrice]
  );

  const change = useCallback(
    (formationIndex: number) => {
      const newFormation = onGetDefaultLineupTeam(formationIndex);
      if (!lineup) return;

      if (!lineup.starting.some((item) => item.player)) {
        updateFormation(newFormation);
        updateLineup(onClearLineup(FORMATIONS[newFormation]));
        return;
      }

      const toSell = onGetPlayersOnChangePositionSell(lineup, newFormation);
      if (toSell.length > 0) {
        setPlayersToSell(toSell);
        setPendingFormation(newFormation);
        setSelected(new Set());
        modalRef.current?.snapToIndex(0);
        return;
      }

      applyFormation(newFormation, lineup);
    },
    [applyFormation, lineup, updateFormation, updateLineup]
  );

  const toggle = useCallback((atletaId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(atletaId)) next.delete(atletaId);
      else next.add(atletaId);
      return next;
    });
  }, []);

  const confirm = useCallback(() => {
    if (!pendingFormation || !lineup) return;

    const totalToRemove = playersToSell.reduce((sum, pos) => sum + pos.quantityToSell, 0);
    if (selected.size !== totalToRemove) {
      onMessage(
        `Você deve selecionar exatamente ${totalToRemove} jogador(es) para remover`,
        'error'
      );
      return;
    }

    const starting = lineup.starting.map((position) =>
      position.player && selected.has(position.player.atleta_id)
        ? { ...position, player: undefined }
        : position
    );
    applyFormation(pendingFormation, { starting, reserves: lineup.reserves });
    // O modal fecha sozinho após a confirmação
    reset();
    onMessage('Formação alterada com sucesso!', 'success');
  }, [applyFormation, lineup, onMessage, pendingFormation, playersToSell, reset, selected]);

  return { modalRef, playersToSell, selected, change, toggle, confirm, reset };
}
