import { useQuery } from '@tanstack/react-query';

import { SEARCH_TEAMS } from '@/constants/Endpoits';
import api from '@/services/api';

export type SearchTeamItem = {
  time_id: number;
  nome: string;
  nome_cartola: string;
  slug: string;
  foto_perfil: string;
  url_escudo_png: string;
  url_escudo_svg: string;
  assinante: boolean;
};

type SearchTeamsResponse =
  | SearchTeamItem[]
  | {
      times: SearchTeamItem[];
    };

const normalize = (data: SearchTeamsResponse | null | undefined): SearchTeamItem[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as { times: SearchTeamItem[] }).times)) return (data as { times: SearchTeamItem[] }).times;
  return [];
};

export const useSearchTeams = (q: string, allowRequest?: boolean) => {
  const query = q.trim();

  return useQuery<SearchTeamItem[]>({
    queryKey: [SEARCH_TEAMS, { q: query }],
    enabled: !!allowRequest && query.length >= 2,
    queryFn: async () => {
      const res = await api.get<SearchTeamsResponse>(SEARCH_TEAMS, {
        params: { q: query },
      });
      return normalize(res.data);
    },
  });
};

