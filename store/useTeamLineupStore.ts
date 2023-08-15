import { create } from "zustand";

import { LineupPlayer, LineupPlayers } from "@/models/Formations";
import { FullPlayer } from "@/models/Stats";
import { removePlayerFromLineup } from "@/utils/team";

type TeamLineupStore = {
  updateLineup: (lineup: LineupPlayers) => void;
  updateCapitain: (value: number) => void;
  updatePrice: (value: number) => void;
  removePlayerFromLineup: (player: LineupPlayer | FullPlayer) => void;
  addPlayerToLineup: (player: LineupPlayer | FullPlayer) => void;
  price: number | undefined;
  lineup: LineupPlayers | undefined;
  capitain: number;
};

const useTeamLineupStore = create<TeamLineupStore>((set) => ({
  lineup: undefined,
  capitain: 0,
  price: 0,

  updateLineup: (lineupUpdated: LineupPlayers) => {
    set((_state) => ({
      lineup: lineupUpdated,
    }));
  },
  updateCapitain: (newCapitain: number) => {
    set((_state) => ({
      capitain: newCapitain,
    }));
  },
  updatePrice: (priceUpdated: number) => {
    set((_state) => ({
      price: priceUpdated,
    }));
  },
  removePlayerFromLineup: (player: LineupPlayer | FullPlayer) => {
    set((state) => {
      const lineupUpdated: LineupPlayers = removePlayerFromLineup(
        state.lineup as LineupPlayers,
        player
      );

      return {
        lineup: lineupUpdated,
        capitain: player.atleta_id === state.capitain ? 0 : state.capitain,
      };
    });
  },
  addPlayerToLineup: (player: LineupPlayer | FullPlayer) => {
    set((state) => {
      return {};
    });
  },
}));

export default useTeamLineupStore;
