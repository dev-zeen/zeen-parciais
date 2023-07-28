import { GET_SCORED_PLAYERS } from "@/constants/Endpoits";
import { Player, PlayersStats } from "@/models/Stats";
import { useFetch } from "@/utils/reactQuery";

export const useGetScoredPlayers = () =>
  useFetch<PlayersStats>(GET_SCORED_PLAYERS, undefined, {
    select: (data) => {
      if (data.atletas) {
        const playerFiltered: { [id: number]: Player } = {};

        Object.keys(data.atletas).forEach((key) => {
          const playerId = parseInt(key, 10);
          const player = data.atletas[key];
          if (player.entrou_em_campo) {
            playerFiltered[playerId] = player;
          }
        });

        return {
          ...data,
          atletas: playerFiltered,
        };
      }

      return data;
    },
  });
