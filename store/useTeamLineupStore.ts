import { create } from 'zustand';

import { LineupPlayer, LineupPlayers } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import { onAddPlayerToLineup, onGetTeamPrice, onRemovePlayerFromLineup } from '@/utils/team';

export type AddPlayerToLineupProps = {
  player: FullPlayer;
  index?: number;
  isReservePlayer?: boolean;
};

type TeamLineupStore = {
  lineup: LineupPlayers | undefined;
  captain: number;
  price: number;
  formation: string;
  updateLineup: (lineup: LineupPlayers) => void;
  updateCaptain: (value: number) => void;
  updatePrice: (value: number) => void;
  updateFormation: (formation: string) => void;
  removePlayerFromLineup: (player: LineupPlayer | FullPlayer) => void;
  addPlayerToLineup: ({ player, index, isReservePlayer }: AddPlayerToLineupProps) => void;
  reset: () => void;
};

const initialState = {
  lineup: undefined,
  captain: 0,
  price: 0,
  formation: '',
};

const useTeamLineupStore = create<TeamLineupStore>((set) => ({
  ...initialState,
  updateLineup: (lineup: LineupPlayers) => {
    set((_state) => ({
      lineup,
    }));
  },
  updateCaptain: (captain: number) => {
    set((_state) => ({
      captain,
    }));
  },
  updatePrice: (price: number) => {
    set((_state) => ({
      price,
    }));
  },
  updateFormation: (formation: string) => {
    set((_state) => ({
      formation,
    }));
  },
  removePlayerFromLineup: (player: LineupPlayer | FullPlayer) => {
    set((state) => {
      const lineupUpdated: LineupPlayers = onRemovePlayerFromLineup(
        state.lineup as LineupPlayers,
        player
      );
      const priceUpdated = onGetTeamPrice(lineupUpdated.starting);

      return {
        lineup: lineupUpdated,
        captain: player.atleta_id === state.captain ? 0 : state.captain,
        price: priceUpdated,
      };
    });
  },
  addPlayerToLineup: ({ player, index, isReservePlayer }: AddPlayerToLineupProps) => {
    set((state) => {
      const lineup = onAddPlayerToLineup({
        lineup: state.lineup as LineupPlayers,
        player,
        index,
        isReservePlayer,
      });

      const priceUpdated = onGetTeamPrice(lineup.starting);

      return {
        lineup,
        price: priceUpdated,
      };
    });
  },
  reset: () => {
    set(initialState);
  },
}));

export default useTeamLineupStore;
