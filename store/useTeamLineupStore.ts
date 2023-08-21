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
  capitain: number;
  price: number | undefined;
  updateLineup: (lineup: LineupPlayers) => void;
  updateCapitain: (value: number) => void;
  updatePrice: (value: number) => void;
  removePlayerFromLineup: (player: LineupPlayer | FullPlayer) => void;
  addPlayerToLineup: ({ player, index, isReservePlayer }: AddPlayerToLineupProps) => void;
  reset: () => void;
};

const initialState = {
  lineup: undefined,
  capitain: 0,
  price: 0,
};

const useTeamLineupStore = create<TeamLineupStore>((set) => ({
  ...initialState,
  updateLineup: (lineup: LineupPlayers) => {
    set((_state) => ({
      lineup,
    }));
  },
  updateCapitain: (capitain: number) => {
    set((_state) => ({
      capitain,
    }));
  },
  updatePrice: (price: number) => {
    set((_state) => ({
      price,
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
        capitain: player.atleta_id === state.capitain ? 0 : state.capitain,
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
