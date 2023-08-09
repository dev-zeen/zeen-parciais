import {
  GET_ALL_LEAGUES,
  GET_CLUBS_BY_LEAGUE_ID,
  GET_LEAGUE_BY_SLUG,
} from "@/constants/Endpoits";
import { CLUBS_BY_LEAGUE_KEY_STORAGE } from "@/constants/Keys";
import { League, LeagueUserDetails } from "@/models/Leagues";
import { ClubsByLeagueUtils } from "@/utils/partials";
import { useFetch } from "@/utils/reactQuery";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

export interface Filter {
  [key: string]: string;
}

export interface Config extends Filter {}

export const useGetLeagues = (allowRequest: boolean) =>
  useFetch<{ ligas: LeagueUserDetails[] }>(GET_ALL_LEAGUES, undefined, {
    enabled: !!allowRequest,
  });

export const useGetLeague = (slug: string, filters?: Filter) =>
  useFetch<League>(
    GET_LEAGUE_BY_SLUG.replace(":slug", slug),
    {
      ...filters,
    },
    {
      enabled: !!slug,
    }
  );

export const useGetClubsByLeagueId = (id?: number) => {
  return useFetch<ClubsByLeagueUtils>(
    GET_CLUBS_BY_LEAGUE_ID.replace(":id", String(id)),
    undefined,
    {
      enabled: !!id,
      select: (data) => {
        const { setItem } = useAsyncStorage(
          CLUBS_BY_LEAGUE_KEY_STORAGE(`${id}`)
        );

        if (data) {
          setItem(JSON.stringify(data));
        }

        return data;
      },
    }
  );
};
