import { useQuery } from '@tanstack/react-query';

import {
  GET_POINTS_COMPETITIONS,
  GET_POINTS_COMPETITION_BY_SLUG,
} from '@/constants/Endpoits';
import type {
  PointsCompetitionDetails,
  PointsCompetitionListItem,
} from '@/models/Competition';
import api from '@/services/api';
import { useFetch } from '@/utils/reactQuery';

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
  useFetch<PointsCompetitionDetails>(GET_POINTS_COMPETITION_BY_SLUG.replace(':slug', slug), undefined, {
    enabled: !!slug && !!allowRequest,
  });

