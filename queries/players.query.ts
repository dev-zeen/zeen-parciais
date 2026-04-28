import { useQuery } from '@tanstack/react-query';

import {
  GET_APPRECIATIONS,
  GET_GATO_MESTRE_ATLETAS,
  GET_PLAYER_STATS_BY_ID,
  GET_POSITIONS,
  GET_TOP_PLAYERS,
  GET_TOP_RANKED_PLAYERS,
  GET_TOP_RESERVE_PLAYERS,
} from '@/constants/Endpoits';
import { APPRECIATIONS } from '@/constants/Keys';
import { Appreciations, PlayerHistoryStats, TopPlayer } from '@/models/Player';
import { GatoMestreAtletas, IPositions } from '@/models/Stats';
import api from '@/services/api';
import { onSaveStorage } from '@/utils/asyncStorage';

interface BestPlayers {
  capitaes: TopPlayer[];
  reservas: TopPlayer[];
  selecao: TopPlayer[];
}

export const useGetTopPlayers = (allowRequest?: boolean) =>
  useQuery<TopPlayer[]>({
    queryKey: [GET_TOP_RANKED_PLAYERS],
    queryFn: () => api.get<TopPlayer[]>(GET_TOP_RANKED_PLAYERS).then((r) => r.data),
    enabled: !!allowRequest,
    select: (data) => data?.slice(0, 5),
  });

export const useGetTopReservePlayers = (allowRequest?: boolean) =>
  useQuery<TopPlayer[]>({
    queryKey: [GET_TOP_RESERVE_PLAYERS],
    queryFn: () => api.get<TopPlayer[]>(GET_TOP_RESERVE_PLAYERS).then((r) => r.data),
    enabled: !!allowRequest,
    select: (data) => data?.slice(0, 5),
  });

export const useGetBestCaptainPlayers = (hasHighlights?: boolean, allowRequest?: boolean) =>
  useQuery<BestPlayers>({
    queryKey: [GET_TOP_PLAYERS],
    queryFn: () => api.get<BestPlayers>(GET_TOP_PLAYERS).then((r) => r.data),
    enabled: !!hasHighlights && !!allowRequest,
  });

export const useGetPositions = () =>
  useQuery<IPositions>({
    queryKey: [GET_POSITIONS],
    queryFn: () => api.get<IPositions>(GET_POSITIONS).then((r) => r.data),
  });

export const useGetAppreciations = (allowRequest: boolean) =>
  useQuery<Appreciations>({
    queryKey: [GET_APPRECIATIONS],
    queryFn: () => api.get<Appreciations>(GET_APPRECIATIONS).then((r) => r.data),
    enabled: !!allowRequest,
    select: (data) => {
      if (data.atletas && Object.keys(data.atletas).length > 0) onSaveStorage(APPRECIATIONS, data);
      return data;
    },
  });

export const useGetGatoMestreAtletas = () =>
  useQuery<GatoMestreAtletas>({
    queryKey: [GET_GATO_MESTRE_ATLETAS],
    queryFn: () => api.get<GatoMestreAtletas>(GET_GATO_MESTRE_ATLETAS).then((r) => r.data),
    retry: 0,
    staleTime: 1000 * 60 * 5,
  });

export const useGetPlayerHistory = (playerId: number | null) => {
  const url = GET_PLAYER_STATS_BY_ID.replace(':playerId', String(playerId ?? ''));

  return useQuery<PlayerHistoryStats>({
    queryKey: [url],
    queryFn: () => api.get<PlayerHistoryStats>(url).then((r) => r.data),
    enabled: !!playerId,
    staleTime: 1000 * 60 * 5,
  });
};
