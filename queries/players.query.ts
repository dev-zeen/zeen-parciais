import {
  GET_APPRECIATIONS,
  GET_PLAYER_STATS_BY_ID,
  GET_POSITIONS,
  GET_TOP_PLAYERS,
  GET_TOP_RANKED_PLAYERS,
  GET_TOP_RESERVE_PLAYERS,
} from '@/constants/Endpoits';
import { APPRECIATIONS } from '@/constants/Keys';
import { Appreciations, PlayerHistoryStats, TopPlayer } from '@/models/Player';
import { IPositions } from '@/models/Stats';
import { onSaveStorage } from '@/utils/asyncStorage';
import { useFetch } from '@/utils/reactQuery';

// interface useGetTopPlayersProps {
//   [key: string]: string;
// }

interface BestPlayers {
  capitaes: TopPlayer[];
  reservas: TopPlayer[];
  selecao: TopPlayer[];
}

export const useGetTopPlayers = (allowRequest?: boolean) =>
  useFetch<TopPlayer[]>(GET_TOP_RANKED_PLAYERS, undefined, {
    enabled: !!allowRequest,
    select: (data) => data?.slice(0, 5),
  });

export const useGetTopReservePlayers = (allowRequest?: boolean) =>
  useFetch<TopPlayer[]>(GET_TOP_RESERVE_PLAYERS, undefined, {
    enabled: !!allowRequest,
    select: (data) => data?.slice(0, 5),
  });

export const useGetBestCaptainPlayers = (hasHighlights?: boolean, allowRequest?: boolean) =>
  useFetch<BestPlayers>(GET_TOP_PLAYERS, undefined, {
    enabled: !!hasHighlights && !!allowRequest,
  });

export const useGetPositions = () => useFetch<IPositions>(GET_POSITIONS);

export const useGetAppreciations = (allowRequest: boolean) => {
  return useFetch<Appreciations>(GET_APPRECIATIONS, undefined, {
    enabled: !!allowRequest,
    select: (data) => {
      if (data.atletas && Object.keys(data.atletas).length > 0) onSaveStorage(APPRECIATIONS, data);
      return data;
    },
  });
};

export const useGetPlayerHistory = (playerId: number | null) =>
  useFetch<PlayerHistoryStats>(
    playerId ? GET_PLAYER_STATS_BY_ID.replace(':playerId', playerId.toString()) : null,
    undefined,
    {
      enabled: !!playerId,
      staleTime: 1000 * 60 * 5, // 5 minutos
    }
  );
