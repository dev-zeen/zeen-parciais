import { create } from "zustand";

import { LineupPlayer, LineupPlayers } from "@/models/Formations";
import { FullPlayer } from "@/models/Stats";
import { removePlayerFromLineup } from "@/utils/team";

type TeamLineupStore = {
  updateLineup: (lineup: LineupPlayers, title?: string) => void;
  updateCapitain: (value: number) => void;
  updatePrice: (value: number) => void;
  removePlayerFromLineup: (player: LineupPlayer | FullPlayer) => void;
  price: number | undefined;
  lineup: LineupPlayers | undefined;
  capitain: number;
};

const useTeamLineupStore = create<TeamLineupStore>((set) => ({
  lineup: undefined,
  capitain: 0,
  price: 0,

  updateLineup: (lineupUpdated: LineupPlayers, title?: string) => {
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
      };
    });
  },
}));

export default useTeamLineupStore;
