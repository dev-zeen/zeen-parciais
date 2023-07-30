import { QueryObserverOptions } from "@tanstack/react-query";

import {
  GET_ALL_LEAGUES,
  GET_CLUBS_BY_LEAGUE_ID,
  GET_LEAGUE_BY_SLUG,
} from "@/constants/Endpoits";
import { League, LeagueUserDetails } from "@/models/Leagues";
import { ClubsByLeagueUtils } from "@/utils/partials";
import { useFetch } from "@/utils/reactQuery";

export interface Filter {
  [key: string]: string;
}

export interface Config extends Filter {}

export const useGetLeagues = () =>
  useFetch<{ ligas: LeagueUserDetails[] }>(GET_ALL_LEAGUES);

export const useGetLeague = (
  slug: string,
  filters?: Filter,
  config?: QueryObserverOptions
) =>
  useFetch<League>(
    GET_LEAGUE_BY_SLUG.replace(":slug", slug),
    {
      ...filters,
    },
    {
      enabled: !!slug,
    }
  );

export const useGetClubsByLeagueId = (id?: number) =>
  useFetch<ClubsByLeagueUtils>(
    GET_CLUBS_BY_LEAGUE_ID.replace(":id", String(id)),
    undefined,
    {
      enabled: !!id,
    }
  );

// export const useDeleteLeague = (slug: string, config: UseMutationOptions) => {
//   const url = QUIT_LEAGUE.replace(':slug', slug);
//   return useMutation({
//     mutationFn: async () => await axios.delete(url),
//     ...config,
//   });
// };
