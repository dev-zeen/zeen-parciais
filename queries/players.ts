import {
  GET_POSITIONS,
  GET_TOP_PLAYERS,
  GET_TOP_RANKED_PLAYERS,
} from "@/constants/Endpoits";
import { TopPlayer } from "@/models/Player";
import { IPositions } from "@/models/Stats";
import { useFetch } from "@/utils/reactQuery";

interface useGetTopPlayersProps {
  [key: string]: string;
}

interface BestPlayers {
  capitaes: TopPlayer[];
  reservas: TopPlayer[];
  selecao: TopPlayer[];
}

export const useGetTopPlayers = (filters?: useGetTopPlayersProps) =>
  useFetch<TopPlayer[]>(
    GET_TOP_RANKED_PLAYERS,
    {
      ...filters,
    },
    {
      select: (data) => data?.slice(0, 5),
    }
  );

export const useGetBestCaptainPlayers = (
  hasHighlights: boolean,
  filters?: useGetTopPlayersProps
) =>
  useFetch<BestPlayers>(
    GET_TOP_PLAYERS,
    {
      ...filters,
    },
    {
      enabled: hasHighlights,
    }
  );

export const useGetPositions = () => useFetch<IPositions>(GET_POSITIONS);
