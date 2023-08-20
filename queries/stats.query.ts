import { GET_SCORED_PLAYERS } from "@/constants/Endpoits";
import { CURRENT_STATS } from "@/constants/Keys";
import { Player, PlayerStats } from "@/models/Stats";
import { onSaveStorage } from "@/utils/asyncStorage";
import { useFetch } from "@/utils/reactQuery";

export const useGetScoredPlayers = (isMarketClose?: boolean) =>
  useFetch<PlayerStats>(GET_SCORED_PLAYERS, undefined, {
    refetchInterval: isMarketClose ? 1000 * 30 : Infinity,
    refetchIntervalInBackground: !!isMarketClose,
    select: (data) => {
      if (data.atletas) {
        const playerFiltered: { [id: number]: Player } = {};

        Object.keys(data.atletas).forEach((key) => {
          const playerId = parseInt(key, 10);
          const player = data.atletas[key];
          if (player.entrou_em_campo) {
            playerFiltered[playerId] = {
              ...player,
              id: key,
            };
          }
        });

        const filteredData = {
          ...data,
          atletas: playerFiltered,
        };

        onSaveStorage(CURRENT_STATS, JSON.stringify(filteredData));

        return filteredData;
      }

      return data;
    },
  });
