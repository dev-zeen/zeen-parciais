import { useQuery } from '@tanstack/react-query';

import {
  GET_POINTS_COMPETITIONS,
  GET_POINTS_COMPETITIONS_FINALIZADAS,
  GET_POINTS_COMPETITION_BY_SLUG,
} from '@/constants/Endpoits';
import type {
  PointsCompetitionDetails,
  PointsCompetitionFinalizedItem,
  PointsCompetitionListItem,
} from '@/models/Competition';
import api from '@/services/api';

type UnknownListResponse =
  | PointsCompetitionListItem[]
  | { competicoes: PointsCompetitionListItem[] }
  | { ligas: PointsCompetitionListItem[] }
  | { data: PointsCompetitionListItem[] }
  | null
  | undefined;

const normalizePointsCompetitions = (data: UnknownListResponse): PointsCompetitionListItem[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any).competicoes)) return (data as any).competicoes;
  if (Array.isArray((data as any).ligas)) return (data as any).ligas;
  if (Array.isArray((data as any).data)) return (data as any).data;
  return [];
};

export const useGetPointsCompetitions = (allowRequest?: boolean) =>
  useQuery<PointsCompetitionListItem[]>({
    queryKey: [GET_POINTS_COMPETITIONS, undefined],
    enabled: !!allowRequest,
    queryFn: async () => {
      const res = await api.get<UnknownListResponse>(GET_POINTS_COMPETITIONS);
      return normalizePointsCompetitions(res.data);
    },
  });

export const useGetPointsCompetitionBySlug = (slug: string, allowRequest?: boolean) =>
  useQuery<PointsCompetitionDetails>({
    queryKey: [GET_POINTS_COMPETITION_BY_SLUG.replace(':slug', slug)],
    queryFn: () =>
      api
        .get<PointsCompetitionDetails>(GET_POINTS_COMPETITION_BY_SLUG.replace(':slug', slug))
        .then((r) => r.data),
    enabled: !!slug && !!allowRequest,
  });

export const useGetFinalizedPointsCompetitions = (allowRequest?: boolean) =>
  useQuery<PointsCompetitionFinalizedItem[]>({
    queryKey: [GET_POINTS_COMPETITIONS_FINALIZADAS],
    enabled: !!allowRequest,
    queryFn: async () => {
      const res = await api.get<PointsCompetitionFinalizedItem[] | null>(
        GET_POINTS_COMPETITIONS_FINALIZADAS
      );
      return Array.isArray(res.data) ? res.data : [];
    },
  });

