import { useQuery } from '@tanstack/react-query';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';

import { GET_ALL_LEAGUES, GET_CLUBS_BY_LEAGUE_ID, GET_LEAGUE_BY_SLUG } from '@/constants/Endpoits';
import { CLUBS_BY_LEAGUE_KEY_STORAGE } from '@/constants/Keys';
import { League, LeagueUserDetails } from '@/models/Leagues';
import api from '@/services/api';
import { ClubsByLeagueUtils } from '@/utils/partials';

export const useGetLeagues = (allowRequest?: boolean) =>
  useQuery<{ ligas: LeagueUserDetails[] }>({
    queryKey: [GET_ALL_LEAGUES],
    queryFn: () =>
      api.get<{ ligas: LeagueUserDetails[] }>(GET_ALL_LEAGUES).then((r) => r.data),
    enabled: !!allowRequest,
  });

export const useGetLeague = (slug: string, allowRequest?: boolean) =>
  useQuery<League>({
    queryKey: [GET_LEAGUE_BY_SLUG.replace(':slug', slug)],
    queryFn: () =>
      api
        .get<League>(GET_LEAGUE_BY_SLUG.replace(':slug', slug))
        .then((r) => r.data),
    enabled: !!slug && !!allowRequest,
  });

export const useGetClubsByLeagueId = (id?: number) => {
  const url = GET_CLUBS_BY_LEAGUE_ID.replace(':id', String(id));

  return useQuery<ClubsByLeagueUtils>({
    queryKey: [url],
    queryFn: () => api.get<ClubsByLeagueUtils>(url).then((r) => r.data),
    enabled: !!id,
    select: (data) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { setItem } = useAsyncStorage(CLUBS_BY_LEAGUE_KEY_STORAGE(`${id}`));

      if (data) {
        setItem(JSON.stringify(data));
      }

      return data;
    },
  });
};
