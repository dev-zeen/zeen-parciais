import { create } from "zustand";

import { LineupPlayer, LineupPlayers } from "@/models/Formations";
import { FullPlayer } from "@/models/Stats";
import {
  onAddPlayerToLineup,
  onGetTeamPrice,
  onRemovePlayerFromLineup,
} from "@/utils/team";

export type AddPlayerToLineupProps = {
  player: FullPlayer;
  index?: number;
  isReservePlayer?: boolean;
};

type TeamLineupStore = {
  updateLineup: (lineup: LineupPlayers) => void;
  updateCapitain: (value: number) => void;
  updatePrice: (value: number) => void;
  removePlayerFromLineup: (player: LineupPlayer | FullPlayer) => void;
  addPlayerToLineup: ({
    player,
    index,
    isReservePlayer,
  }: AddPlayerToLineupProps) => void;
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
  addPlayerToLineup: ({
    player,
    index,
    isReservePlayer,
  }: AddPlayerToLineupProps) => {
    set((state) => {
      const lineupUpdated = onAddPlayerToLineup({
        lineup: state.lineup as LineupPlayers,
        player,
        index,
        isReservePlayer,
      });

      const priceUpdated = onGetTeamPrice(lineupUpdated.starting);

      return {
        lineup: lineupUpdated,
        price: priceUpdated,
      };
    });
  },
}));

export default useTeamLineupStore;
